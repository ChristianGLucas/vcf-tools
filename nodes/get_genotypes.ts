import { GetVariantInput, GenotypesResult, SampleGenotype } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildParser, findRawLine, decodeGenotype, toErrorMsg, err } from './_shared';

/**
 * Extracts and decodes every sample's genotype (GT) call for one
 * variant: the raw GT string, whether it's phased ("|") or unphased
 * ("/"), the per-allele indices (0 = REF, 1+ = ALT[index-1], -1 =
 * missing "."), and a zygosity label (homozygous_ref / heterozygous /
 * homozygous_alt / missing / partial_missing / no_call). One entry per
 * header-declared sample, even if this variant carries no FORMAT/GT
 * data for it (no_call). found is false (no error) when the VCF parses
 * fine but has no variant at that CHROM+POS. A malformed VCF returns a
 * structured error instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function getGenotypes(ax: AxiomContext, input: GetVariantInput): GenotypesResult {
  const out = new GenotypesResult();
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
    const genotypes: SampleGenotype[] = [];
    for (const sampleName of parser.samples) {
      const sampleData = samples[sampleName];
      const gtValues = sampleData?.['GT'];
      const gtRaw =
        Array.isArray(gtValues) && gtValues[0] !== undefined ? String(gtValues[0]) : undefined;
      const decoded = decodeGenotype(gtRaw);
      const sg = new SampleGenotype();
      sg.setSample(sampleName);
      sg.setGtRaw(gtRaw ?? '');
      sg.setHasGt(decoded.hasGt);
      sg.setPhased(decoded.phased);
      sg.setAlleleIndicesList(decoded.alleleIndices);
      sg.setZygosity(decoded.zygosity);
      genotypes.push(sg);
    }
    out.setGenotypesList(genotypes);
    out.setFound(true);
  } catch (e: any) {
    out.setError(toErrorMsg(err('MALFORMED_LINE', e?.message ?? String(e))));
    out.setFound(false);
  }
  return out;
}
