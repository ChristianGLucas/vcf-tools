import { GetVariantInput, VariantResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildParser, findRawLine, variantToProto, toErrorMsg, err } from './_shared';

/**
 * Extracts a single variant by exact CHROM+POS match. found is false
 * (with no error) when the VCF parses fine but has no variant at that
 * position -- a legitimate outcome, not a failure. A malformed VCF
 * (bad header, or the matching line itself fails to parse) returns a
 * structured error instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function getVariant(ax: AxiomContext, input: GetVariantInput): VariantResult {
  const out = new VariantResult();
  const { parser, dataLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  const line = findRawLine(dataLines, input.getChrom(), input.getPos());
  if (line === undefined) {
    out.setFound(false);
    return out;
  }
  try {
    const v = parser.parseLine(line);
    out.setVariant(variantToProto(v, parser));
    out.setFound(true);
  } catch (e: any) {
    out.setError(toErrorMsg(err('MALFORMED_LINE', e?.message ?? String(e))));
    out.setFound(false);
  }
  return out;
}
