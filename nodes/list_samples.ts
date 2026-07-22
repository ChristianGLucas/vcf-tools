import { VcfInput, SampleList } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildParser, toErrorMsg } from './_shared';

/**
 * Lists the sample (genotype-column) names declared on a VCF's #CHROM
 * column-header line, in file order. Empty for a site-only VCF with no
 * sample columns. A malformed VCF returns a structured error instead of
 * a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function listSamples(ax: AxiomContext, input: VcfInput): SampleList {
  const out = new SampleList();
  const { parser, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  out.setSampleNamesList(parser.samples);
  return out;
}
