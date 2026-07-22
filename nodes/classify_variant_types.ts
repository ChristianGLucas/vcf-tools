import { ListVariantsInput, VariantTypeList, VariantTypeEntry } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  buildParser,
  clampLimit,
  parseLineSafe,
  classifyVariant,
  toErrorMsg,
  err,
  LineParseError,
  DEFAULT_LIST_LIMIT,
  MAX_LIST_LIMIT,
} from './_shared';

/**
 * Classifies every variant's type from REF-vs-ALT length and shared-
 * prefix string comparison (no alignment) -- SNP (equal length 1), MNP
 * (equal length > 1), INSERTION/DELETION (a clean length difference
 * where the shorter allele is a prefix of the longer), COMPLEX
 * (anything else, including symbolic <DEL>/breakend ALTs), or
 * NO_VARIANT (ALT was "."). A multi-allelic site gets one type per ALT
 * allele plus a variant_type summary ("MIXED" if the alleles disagree).
 * max_variants bounds the response the same way as ListVariants
 * (default 2000, hard cap 20000); total_count/truncated report the true
 * count. A malformed VCF returns a structured error instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function classifyVariantTypes(ax: AxiomContext, input: ListVariantsInput): VariantTypeList {
  const out = new VariantTypeList();
  const { parser, dataLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  const limit = clampLimit(input.getMaxVariants(), DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
  try {
    const types: VariantTypeEntry[] = [];
    let lineNo = 0;
    for (const line of dataLines) {
      lineNo++;
      const v = parseLineSafe(parser, line, lineNo);
      if (types.length < limit) {
        const { alleleTypes, variantType } = classifyVariant(v.REF ?? '', v.ALT);
        const entry = new VariantTypeEntry();
        entry.setChrom(v.CHROM ?? '');
        entry.setPos(v.POS ?? 0);
        entry.setRef(v.REF ?? '');
        if (v.ALT) entry.setAltList(v.ALT);
        entry.setAlleleTypesList(alleleTypes);
        entry.setVariantType(variantType);
        types.push(entry);
      }
    }
    out.setTypesList(types);
    out.setTotalCount(dataLines.length);
    out.setTruncated(dataLines.length > types.length);
  } catch (e: any) {
    out.setError(
      toErrorMsg(e instanceof LineParseError ? { code: e.code, message: e.message } : err('PARSE_ERROR', String(e?.message ?? e))),
    );
  }
  return out;
}
