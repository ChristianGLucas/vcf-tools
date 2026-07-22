import { FilterByStatusInput, VariantList, Variant } from '../gen/messages_pb';
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
 * Filters a VCF's variants to those whose FILTER column intersects a
 * caller-chosen set of statuses (e.g. ["PASS"] for only variants that
 * passed all filters). Matching is exact against the semicolon-split
 * FILTER values. total_count is the number of MATCHING variants (not
 * the file's total); max_variants bounds how many are materialized into
 * the response the same way as ListVariants. A malformed VCF returns a
 * structured error instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function filterByFilterStatus(ax: AxiomContext, input: FilterByStatusInput): VariantList {
  const out = new VariantList();
  const { parser, dataLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  const statuses = new Set(input.getStatusesList());
  const limit = clampLimit(input.getMaxVariants(), DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
  try {
    const variants: Variant[] = [];
    let total = 0;
    let lineNo = 0;
    for (const line of dataLines) {
      lineNo++;
      const v = parseLineSafe(parser, line, lineNo);
      const filt = v.FILTER;
      const filtArr = filt === undefined ? [] : Array.isArray(filt) ? filt : [filt];
      const matches = filtArr.some((f) => statuses.has(f));
      if (matches) {
        total++;
        if (variants.length < limit) variants.push(variantToProto(v, parser));
      }
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
