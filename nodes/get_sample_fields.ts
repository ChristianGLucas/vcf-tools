import { GetVariantInput, SampleFieldsResult, SampleFields } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildParser, findRawLine, typedValuesFromRaw, fieldType, toErrorMsg, err } from './_shared';

/**
 * Parses one variant's FORMAT column + every sample's column into a
 * structured per-sample field map -- every FORMAT key (GT, AD, DP, GQ,
 * PL, ...), not just GT (see GetGenotypes for a GT-only, zygosity-
 * decoded view). Each field is typed per the header's FORMAT Type
 * declaration. One entry per header-declared sample; a sample with no
 * data for this variant gets an empty field map. found is false (no
 * error) when the VCF parses fine but has no variant at that CHROM+POS.
 * A malformed VCF returns a structured error instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function getSampleFields(ax: AxiomContext, input: GetVariantInput): SampleFieldsResult {
  const out = new SampleFieldsResult();
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
    const samples = v.SAMPLES();
    const result: SampleFields[] = [];
    for (const sampleName of parser.samples) {
      const sampleData = samples[sampleName] ?? {};
      const sf = new SampleFields();
      sf.setSample(sampleName);
      const map = sf.getFieldsMap();
      for (const key of Object.keys(sampleData)) {
        map.set(key, typedValuesFromRaw(sampleData[key], fieldType(parser, 'FORMAT', key)));
      }
      result.push(sf);
    }
    out.setSamplesList(result);
    out.setFound(true);
  } catch (e: any) {
    out.setError(toErrorMsg(err('MALFORMED_LINE', e?.message ?? String(e))));
    out.setFound(false);
  }
  return out;
}
