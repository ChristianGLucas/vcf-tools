import { ListVariantsInput, VariantList, Variant } from '../gen/messages_pb';
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
 * Parses a VCF's variant data lines into structured records (CHROM, POS,
 * ID, REF, ALT, QUAL, FILTER, and a typed INFO map). This is the
 * canonical variant parse -- every filter node returns the same
 * VariantList shape, scoped to a predicate. max_variants caps how many
 * records are materialized into the response (default 2000, hard cap
 * 20000, to stay well under the platform's transport limit on a VCF that
 * may hold millions of variants); total_count/truncated report the true
 * count regardless of the cap. A malformed VCF (bad header or a data
 * line that fails to parse) returns a structured error instead of a
 * crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function listVariants(ax: AxiomContext, input: ListVariantsInput): VariantList {
  const out = new VariantList();
  const { parser, dataLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  const limit = clampLimit(input.getMaxVariants(), DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
  try {
    const variants: Variant[] = [];
    let lineNo = 0;
    for (const line of dataLines) {
      lineNo++;
      const v = parseLineSafe(parser, line, lineNo);
      if (variants.length < limit) variants.push(variantToProto(v, parser));
    }
    out.setVariantsList(variants);
    out.setTotalCount(dataLines.length);
    out.setTruncated(dataLines.length > variants.length);
  } catch (e: any) {
    out.setError(
      toErrorMsg(e instanceof LineParseError ? { code: e.code, message: e.message } : err('PARSE_ERROR', String(e?.message ?? e))),
    );
  }
  return out;
}
