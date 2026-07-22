import VCFParser, { Variant as GmodVariant } from '@gmod/vcf';
import {
  Error as ProtoError,
  Variant,
  TypedValues,
  FieldDef,
  FilterDef,
  ContigDef,
} from '../gen/messages_pb';

// Shared helpers for vcf-tools nodes: input bounding, header parsing
// (independent of @gmod/vcf's internal reserved-default merging, so
// ParseHeader reports only what THIS file's header actually declares),
// typed INFO/FORMAT value conversion, genotype decoding, REF/ALT-length
// variant-type classification, and small scan utilities reused across
// nodes. All parsing/typing/genotype-decoding logic is owned by @gmod/vcf
// (GMOD project, MIT, pure JS, zero runtime deps) -- this module is glue.

// Hard cap on the raw vcf_text every node accepts. Bounds cost (line
// splitting, allocation, per-line parsing) up front, before any parsing
// happens, and keeps us well under the platform's ~4 MiB transport limit
// on both the request and any node that echoes variant data back.
export const MAX_VCF_BYTES = 3 * 1024 * 1024; // 3 MiB

// Sanity cap on the number of non-blank data (variant) lines a node will
// process. A 3 MiB file cannot realistically contain more than a few
// hundred thousand data lines, but a pathological file built from many
// very short lines could approach that -- this stops unbounded CPU work
// on such a file with a structured error instead of a very long request.
export const MAX_LINES = 300_000;

// Response-size bounds for nodes that materialize a page of full variant
// records (which carry the heaviest per-item payload, an INFO map) --
// VCFs routinely carry millions of variants, so every listing node caps
// what it returns and reports total_count/truncated instead.
export const DEFAULT_LIST_LIMIT = 2000;
export const MAX_LIST_LIMIT = 20_000;

// Positions are cheap (a single int64 each), so the cap is much higher.
export const DEFAULT_POSITIONS_LIMIT = 5000;
export const MAX_POSITIONS_LIMIT = 200_000;

export const MAX_ISSUES = 500;

export interface StructuredError {
  code: string;
  message: string;
}

export function err(code: string, message: string): StructuredError {
  return { code, message };
}

export function toErrorMsg(e: StructuredError): ProtoError {
  const m = new ProtoError();
  m.setCode(e.code);
  m.setMessage(e.message);
  return m;
}

/** Thrown (and always caught by the node that triggered it) when a single
 * VCF data line fails to parse. Carries a structured code/message so the
 * catching node can convert it into the output's Error field. */
export class LineParseError extends globalThis.Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Splits raw VCF text into its header lines (every leading line starting
 * with "#", ending with and including the #CHROM column-header line) and
 * its data lines (every following non-blank line). Enforces MAX_VCF_BYTES
 * and MAX_LINES before returning. */
export function splitVcf(vcfText: string): {
  headerLines: string[];
  dataLines: string[];
  error?: StructuredError;
} {
  if (!vcfText || vcfText.length === 0) {
    return { headerLines: [], dataLines: [], error: err('EMPTY_INPUT', 'vcf_text is empty') };
  }
  if (Buffer.byteLength(vcfText, 'utf8') > MAX_VCF_BYTES) {
    return {
      headerLines: [],
      dataLines: [],
      error: err('TOO_LARGE', `vcf_text exceeds ${MAX_VCF_BYTES} bytes`),
    };
  }
  const lines = vcfText.split(/\r\n|\r|\n/);
  const headerLines: string[] = [];
  let i = 0;
  while (i < lines.length && lines[i].startsWith('#')) {
    headerLines.push(lines[i]);
    i++;
  }
  const dataLines: string[] = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0) continue;
    dataLines.push(line);
    if (dataLines.length > MAX_LINES) {
      return {
        headerLines,
        dataLines: [],
        error: err('TOO_MANY_LINES', `more than ${MAX_LINES} data lines`),
      };
    }
  }
  return { headerLines, dataLines };
}

/** Splits + constructs a @gmod/vcf VCFParser from the header. This is the
 * entry point almost every node starts with, so a malformed header (or an
 * oversized/empty input) produces the same structured error everywhere. */
export function buildParser(vcfText: string): {
  parser?: VCFParser;
  headerLines: string[];
  dataLines: string[];
  error?: StructuredError;
} {
  const { headerLines, dataLines, error } = splitVcf(vcfText);
  if (error) {
    return { headerLines, dataLines: [], error };
  }
  try {
    const parser = new VCFParser({ header: headerLines.join('\n') });
    return { parser, headerLines, dataLines };
  } catch (e: any) {
    return {
      headerLines,
      dataLines: [],
      error: err('MALFORMED_HEADER', e?.message ?? String(e)),
    };
  }
}

export function clampLimit(requested: number, def: number, max: number): number {
  if (!requested || requested <= 0) return def;
  return Math.min(requested, max);
}

/** Parses one VCF meta-header value's structured "<K1=v1,K2="v2, with a
 * comma",...>" syntax into a key->value map, respecting double-quoted
 * values that may themselves contain commas or escaped quotes. Used for
 * ##INFO/##FORMAT/##FILTER/##contig lines. */
export function parseStructuredHeaderValue(raw: string): Map<string, string> {
  const result = new Map<string, string>();
  let body = raw.trim();
  if (body.startsWith('<') && body.endsWith('>')) {
    body = body.slice(1, -1);
  }
  const n = body.length;
  let i = 0;
  while (i < n) {
    while (i < n && (body[i] === ',' || body[i] === ' ')) i++;
    if (i >= n) break;
    const eq = body.indexOf('=', i);
    if (eq === -1) break;
    const key = body.slice(i, eq).trim();
    let j = eq + 1;
    let value: string;
    if (body[j] === '"') {
      j++;
      let buf = '';
      while (j < n && body[j] !== '"') {
        if (body[j] === '\\' && j + 1 < n) {
          buf += body[j + 1];
          j += 2;
          continue;
        }
        buf += body[j];
        j++;
      }
      value = buf;
      j++; // skip closing quote
    } else {
      const start = j;
      while (j < n && body[j] !== ',') j++;
      value = body.slice(start, j).trim();
    }
    result.set(key, value);
    i = j;
  }
  return result;
}

/** Parses only what THIS file's header lines explicitly declare -- unlike
 * VCFParser.getMetadata(), which merges in ~50 VCF-spec reserved INFO/
 * FORMAT defaults regardless of whether the file declared them, so it is
 * not a faithful report of "what's in this header". */
export function parseHeaderDeclared(headerLines: string[]): {
  fileformat: string;
  infoFields: FieldDef[];
  formatFields: FieldDef[];
  filters: FilterDef[];
  contigs: ContigDef[];
} {
  let fileformat = '';
  const infoFields: FieldDef[] = [];
  const formatFields: FieldDef[] = [];
  const filters: FilterDef[] = [];
  const contigs: ContigDef[] = [];

  for (const line of headerLines) {
    if (!line.startsWith('##')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(2, eq);
    const rest = line.slice(eq + 1);
    if (key === 'fileformat') {
      fileformat = rest.trim();
      continue;
    }
    if (!rest.trim().startsWith('<')) continue;
    const kv = parseStructuredHeaderValue(rest);
    if (key === 'INFO' || key === 'FORMAT') {
      const fd = new FieldDef();
      fd.setId(kv.get('ID') ?? '');
      fd.setNumber(kv.get('Number') ?? '');
      fd.setType(kv.get('Type') ?? '');
      fd.setDescription(kv.get('Description') ?? '');
      (key === 'INFO' ? infoFields : formatFields).push(fd);
    } else if (key === 'FILTER') {
      const filt = new FilterDef();
      filt.setId(kv.get('ID') ?? '');
      filt.setDescription(kv.get('Description') ?? '');
      filters.push(filt);
    } else if (key === 'contig') {
      const c = new ContigDef();
      c.setId(kv.get('ID') ?? '');
      const lenStr = kv.get('length') ?? kv.get('Length');
      if (lenStr !== undefined) {
        const num = Number(lenStr);
        if (Number.isFinite(num)) {
          c.setLength(num);
          c.setHasLength(true);
        }
      }
      c.setAssembly(kv.get('assembly') ?? kv.get('Assembly') ?? '');
      contigs.push(c);
    }
  }
  return { fileformat, infoFields, formatFields, filters, contigs };
}

/** The header's declared Type for one INFO or FORMAT key ("Integer",
 * "Float", "Flag", "Character", "String"), via VCFParser's merged
 * reserved+declared metadata -- correct here, since bucket-typing a
 * VALUE should honor spec-reserved keys (e.g. DP, AF) even when a file
 * doesn't bother re-declaring them. Falls back to "String". */
export function fieldType(parser: VCFParser, section: 'INFO' | 'FORMAT', key: string): string {
  const meta: any = parser.getMetadata(section, key);
  const t = meta && typeof meta === 'object' ? meta.Type : undefined;
  return typeof t === 'string' ? t : 'String';
}

/** Converts one @gmod/vcf raw INFO/FORMAT value (true for a bare Flag,
 * undefined for absent, or an array of string|number|undefined per the
 * library's own comma-split + Integer/Float coercion) into a typed
 * TypedValues message. A "." (missing) entry in a multi-valued field is
 * omitted from its bucket. */
export function typedValuesFromRaw(
  raw: true | (string | number | undefined)[] | undefined,
  type: string,
): TypedValues {
  const tv = new TypedValues();
  tv.setType(type);
  if (raw === true) {
    tv.setPresent(true);
    return tv;
  }
  if (raw === undefined) {
    tv.setPresent(false);
    return tv;
  }
  tv.setPresent(true);
  const ints: number[] = [];
  const floats: number[] = [];
  const strings: string[] = [];
  for (const v of raw) {
    if (v === undefined) continue;
    if (type === 'Integer') {
      const num = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(num)) ints.push(Math.trunc(num));
    } else if (type === 'Float') {
      const num = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(num)) floats.push(num);
    } else {
      strings.push(String(v));
    }
  }
  tv.setIntValuesList(ints);
  tv.setFloatValuesList(floats);
  tv.setStringValuesList(strings);
  return tv;
}

function setInfoMap(
  target: { set(key: string, value: TypedValues): unknown },
  info: Record<string, true | (string | number | undefined)[] | undefined>,
  parser: VCFParser,
) {
  for (const key of Object.keys(info)) {
    target.set(key, typedValuesFromRaw(info[key], fieldType(parser, 'INFO', key)));
  }
}

/** Converts one @gmod/vcf parsed Variant into our proto Variant message
 * (core fields + typed INFO map). Does not touch genotypes/samples --
 * see decodeGenotype / sample-field helpers below for that.
 *
 * Defensively guards POS/QUAL against NaN: @gmod/vcf does not throw on a
 * non-numeric POS/QUAL column, it silently coerces to NaN (`+"XYZ"` ===
 * NaN) -- and an int64 proto field's setter (unlike a double field's)
 * throws its own opaque "Assertion failed" at serialization time if
 * handed NaN, well after this function returns "successfully". Callers
 * that scan every data line (parseLineSafe, below) already reject a
 * non-finite POS up front as MALFORMED_LINE, so this is belt-and-
 * suspenders for any future caller of variantToProto that doesn't route
 * through parseLineSafe. */
export function variantToProto(v: GmodVariant, parser: VCFParser): Variant {
  const out = new Variant();
  out.setChrom(v.CHROM ?? '');
  out.setPos(Number.isFinite(v.POS) ? v.POS : 0);
  if (v.ID) out.setIdList(v.ID);
  out.setRef(v.REF ?? '');
  if (v.ALT) out.setAltList(v.ALT);
  if (v.QUAL !== undefined && Number.isFinite(v.QUAL)) {
    out.setQual(v.QUAL);
    out.setHasQual(true);
  }
  if (v.FILTER !== undefined) {
    out.setFilterList(Array.isArray(v.FILTER) ? v.FILTER : [v.FILTER]);
  }
  setInfoMap(out.getInfoMap(), v.INFO ?? {}, parser);
  out.setFormat(v.FORMAT ?? '');
  return out;
}

/** Parses one data line, tagging any thrown error as a LineParseError with
 * a data-line number (position within the data-line list, not necessarily
 * the original file's line number, since blank/header lines are excluded
 * from that list) so the caller can report exactly where parsing broke.
 *
 * Also rejects a non-finite POS (@gmod/vcf coerces a non-numeric POS
 * column to NaN rather than throwing -- see variantToProto's comment) as
 * MALFORMED_LINE, honoring this package's "malformed line -> structured
 * error, not a crash" contract instead of letting NaN reach a proto
 * int64 setter downstream, where it would otherwise throw an opaque,
 * uncaught "Assertion failed" at serialization time. */
export function parseLineSafe(parser: VCFParser, line: string, dataLineNo: number): GmodVariant {
  let v: GmodVariant;
  try {
    v = parser.parseLine(line);
  } catch (e: any) {
    throw new LineParseError('MALFORMED_LINE', `data line ${dataLineNo}: ${e?.message ?? String(e)}`);
  }
  if (!Number.isFinite(v.POS)) {
    throw new LineParseError('MALFORMED_LINE', `data line ${dataLineNo}: POS is not numeric`);
  }
  return v;
}

/** Fast pre-parse scan for a single CHROM+POS match: compares the first
 * two tab-delimited fields directly, without invoking the library parser
 * on every line -- only the matching line (if any) gets fully parsed. */
export function findRawLine(dataLines: string[], chrom: string, pos: number): string | undefined {
  const posStr = String(pos);
  for (const line of dataLines) {
    const tab1 = line.indexOf('\t');
    if (tab1 === -1) continue;
    if (line.slice(0, tab1) !== chrom) continue;
    const tab2 = line.indexOf('\t', tab1 + 1);
    const posField = tab2 === -1 ? line.slice(tab1 + 1) : line.slice(tab1 + 1, tab2);
    if (posField === posStr) return line;
  }
  return undefined;
}

/** Decodes one raw GT string ("0/1", "1|0", "./.", a haploid "1", etc.)
 * into phasing + per-allele indices (-1 for a missing "." allele) +
 * zygosity. A single-allele (haploid) call is reported as homozygous,
 * since there is only one allele to compare against itself. */
export function decodeGenotype(gtRaw: string | undefined): {
  hasGt: boolean;
  phased: boolean;
  alleleIndices: number[];
  zygosity: string;
} {
  if (gtRaw === undefined || gtRaw === '') {
    return { hasGt: false, phased: false, alleleIndices: [], zygosity: 'no_call' };
  }
  const phased = gtRaw.includes('|');
  const tokens = gtRaw.split(/[/|]/);
  const alleleIndices: number[] = [];
  let missingCount = 0;
  for (const t of tokens) {
    if (t === '.' || t === '') {
      alleleIndices.push(-1);
      missingCount++;
    } else {
      const n = Number.parseInt(t, 10);
      if (Number.isFinite(n)) {
        alleleIndices.push(n);
      } else {
        alleleIndices.push(-1);
        missingCount++;
      }
    }
  }
  let zygosity: string;
  if (alleleIndices.length === 0) {
    zygosity = 'no_call';
  } else if (missingCount === alleleIndices.length) {
    zygosity = 'missing';
  } else if (missingCount > 0) {
    zygosity = 'partial_missing';
  } else {
    const allSame = alleleIndices.every((a) => a === alleleIndices[0]);
    if (allSame) {
      zygosity = alleleIndices[0] === 0 ? 'homozygous_ref' : 'homozygous_alt';
    } else {
      zygosity = 'heterozygous';
    }
  }
  return { hasGt: true, phased, alleleIndices, zygosity };
}

/** Classifies one REF/ALT allele pair by length + shared-prefix string
 * comparison (no alignment): equal length 1 -> SNP; equal length > 1 ->
 * MNP; ALT longer than REF and ALT starts with REF -> INSERTION; REF
 * longer than ALT and REF starts with ALT -> DELETION; anything else
 * (including symbolic <DEL>/<INS>/breakend ALTs) -> COMPLEX. */
export function classifyAllele(ref: string, alt: string): string {
  if (!alt || alt === '.') return 'NO_VARIANT';
  if (alt.startsWith('<') || alt.includes('[') || alt.includes(']')) return 'COMPLEX';
  const rl = ref.length;
  const al = alt.length;
  if (rl === 1 && al === 1) return 'SNP';
  if (rl === al) return 'MNP';
  if (al > rl && alt.startsWith(ref)) return 'INSERTION';
  if (rl > al && ref.startsWith(alt)) return 'DELETION';
  return 'COMPLEX';
}

export function classifyVariant(
  ref: string,
  alt: string[] | undefined,
): { alleleTypes: string[]; variantType: string } {
  if (!alt || alt.length === 0) return { alleleTypes: [], variantType: 'NO_VARIANT' };
  const alleleTypes = alt.map((a) => classifyAllele(ref, a));
  const first = alleleTypes[0];
  const allSame = alleleTypes.every((t) => t === first);
  return { alleleTypes, variantType: allSame ? first : 'MIXED' };
}

/** The first numeric value of an INFO entry (skipping "." / missing
 * entries), or undefined if the key is absent, a bare Flag, or has no
 * numeric-coercible value. Used by FilterByInfoThreshold. */
export function firstNumericInfoValue(
  info: Record<string, true | (string | number | undefined)[] | undefined>,
  key: string,
): number | undefined {
  const raw = info[key];
  if (raw === undefined || raw === true) return undefined;
  for (const v of raw) {
    if (v === undefined) continue;
    const num = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

export const COMPARE_OPS = ['>=', '<=', '>', '<', '==', '!='] as const;

export function compareOp(value: number, op: string, threshold: number): boolean {
  switch (op) {
    case '>=':
      return value >= threshold;
    case '<=':
      return value <= threshold;
    case '>':
      return value > threshold;
    case '<':
      return value < threshold;
    case '==':
      return value === threshold;
    case '!=':
      return value !== threshold;
    default:
      return false;
  }
}
