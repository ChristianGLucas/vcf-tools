import { GetVariantInput, VariantInfoResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildParser, findRawLine, typedValuesFromRaw, fieldType, toErrorMsg, err } from './_shared';

/**
 * Extracts one variant's INFO field, already parsed into a typed
 * key->value map using the header's INFO Type declarations (e.g. AF as
 * Float, DP as Integer) -- a scoped view of GetVariant for callers who
 * only need the INFO annotations. found is false (no error) when the VCF
 * parses fine but has no variant at that CHROM+POS. A malformed VCF
 * returns a structured error instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function getVariantInfo(ax: AxiomContext, input: GetVariantInput): VariantInfoResult {
  const out = new VariantInfoResult();
  out.setChrom(input.getChrom());
  out.setPos(input.getPos());
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
    const map = out.getInfoMap();
    for (const key of Object.keys(v.INFO ?? {})) {
      map.set(key, typedValuesFromRaw(v.INFO[key], fieldType(parser, 'INFO', key)));
    }
    out.setFound(true);
  } catch (e: any) {
    out.setError(toErrorMsg(err('MALFORMED_LINE', e?.message ?? String(e))));
    out.setFound(false);
  }
  return out;
}
