import { FilterByInfoInput, VariantList, Variant } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  buildParser,
  clampLimit,
  parseLineSafe,
  variantToProto,
  toErrorMsg,
  err,
  firstNumericInfoValue,
  compareOp,
  COMPARE_OPS,
  LineParseError,
  DEFAULT_LIST_LIMIT,
  MAX_LIST_LIMIT,
} from './_shared';

/**
 * Filters a VCF's variants by a numeric threshold on one INFO field
 * (e.g. AF>=0.01, DP>=10), or on QUAL itself when info_key is the
 * literal string "QUAL". op must be one of ">=", "<=", ">", "<", "==",
 * "!=" (a structural INVALID_OPERATOR error otherwise). A multi-valued
 * INFO field compares against its first numeric value; a variant
 * missing the key (or with QUAL unset) does not match. total_count is
 * the number of MATCHING variants; max_variants bounds how many are
 * materialized into the response the same way as ListVariants. A
 * malformed VCF returns a structured error instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function filterByInfoThreshold(ax: AxiomContext, input: FilterByInfoInput): VariantList {
  const out = new VariantList();
  const op = input.getOp();
  if (!(COMPARE_OPS as readonly string[]).includes(op)) {
    out.setError(toErrorMsg(err('INVALID_OPERATOR', `op must be one of ${COMPARE_OPS.join(', ')}`)));
    return out;
  }
  const { parser, dataLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  const infoKey = input.getInfoKey();
  const isQual = infoKey.toUpperCase() === 'QUAL';
  const threshold = input.getThreshold();
  const limit = clampLimit(input.getMaxVariants(), DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
  try {
    const variants: Variant[] = [];
    let total = 0;
    let lineNo = 0;
    for (const line of dataLines) {
      lineNo++;
      const v = parseLineSafe(parser, line, lineNo);
      const value = isQual ? v.QUAL : firstNumericInfoValue(v.INFO ?? {}, infoKey);
      if (value === undefined) continue;
      if (!compareOp(value, op, threshold)) continue;
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
