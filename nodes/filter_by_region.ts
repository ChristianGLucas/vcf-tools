import { FilterByRegionInput, VariantList, Variant } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  buildParser,
  clampLimit,
  parseLineSafe,
  variantToProto,
  toErrorMsg,
  err,
  LineParseError,
  DEFAULT_LIST_LIMIT,
  MAX_LIST_LIMIT,
} from './_shared';

/**
 * Filters a VCF's variants to one chromosome, optionally bounded to a
 * POS range: [start, end] inclusive when has_start/has_end are set,
 * unbounded on whichever side is unset. chrom is required (a structural
 * MISSING_CHROM error if empty). total_count is the number of MATCHING
 * variants; max_variants bounds how many are materialized into the
 * response the same way as ListVariants. A malformed VCF returns a
 * structured error instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function filterByRegion(ax: AxiomContext, input: FilterByRegionInput): VariantList {
  const out = new VariantList();
  if (!input.getChrom()) {
    out.setError(toErrorMsg(err('MISSING_CHROM', 'chrom is required')));
    return out;
  }
  const { parser, dataLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  const chrom = input.getChrom();
  const hasStart = input.getHasStart();
  const hasEnd = input.getHasEnd();
  const start = input.getStart();
  const end = input.getEnd();
  const limit = clampLimit(input.getMaxVariants(), DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
  try {
    const variants: Variant[] = [];
    let total = 0;
    let lineNo = 0;
    for (const line of dataLines) {
      lineNo++;
      const v = parseLineSafe(parser, line, lineNo);
      if (v.CHROM !== chrom) continue;
      const pos = v.POS ?? 0;
      if (hasStart && pos < start) continue;
      if (hasEnd && pos > end) continue;
      total++;
      if (variants.length < limit) variants.push(variantToProto(v, parser));
    }
    out.setVariantsList(variants);
    out.setTotalCount(total);
    out.setTruncated(total > variants.length);
  } catch (e: any) {
    out.setError(
      toErrorMsg(e instanceof LineParseError ? { code: e.code, message: e.message } : err('PARSE_ERROR', String(e?.message ?? e))),
    );
  }
  return out;
}
