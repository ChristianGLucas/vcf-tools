import { GetVariantInput } from '../gen/messages_pb';
import { getGenotypes } from './get_genotypes';
import { testContext, SAMPLE_VCF, SITE_ONLY_VCF } from './test_helpers';

function mkInput(text: string, chrom: string, pos: number): GetVariantInput {
  const input = new GetVariantInput();
  input.setVcfText(text);
  input.setChrom(chrom);
  input.setPos(pos);
  return input;
}

describe('GetGenotypes', () => {
  it('decodes unphased het, phased het, and missing GT at 1:2000', () => {
    const result = getGenotypes(testContext, mkInput(SAMPLE_VCF, '1', 2000));
    expect(result.hasError()).toBe(false);
    expect(result.getFound()).toBe(true);
    const gts = result.getGenotypesList();
    expect(gts.map((g) => g.getSample())).toEqual(['NA001', 'NA002', 'NA003']);

    const na001 = gts[0];
    expect(na001.getGtRaw()).toBe('0/1');
    expect(na001.getHasGt()).toBe(true);
    expect(na001.getPhased()).toBe(false);
    expect(na001.getAlleleIndicesList()).toEqual([0, 1]);
    expect(na001.getZygosity()).toBe('heterozygous');

    const na002 = gts[1];
    expect(na002.getGtRaw()).toBe('0|1');
    expect(na002.getPhased()).toBe(true);
    expect(na002.getZygosity()).toBe('heterozygous');

    const na003 = gts[2];
    expect(na003.getGtRaw()).toBe('./.');
    expect(na003.getHasGt()).toBe(true);
    expect(na003.getAlleleIndicesList()).toEqual([-1, -1]);
    expect(na003.getZygosity()).toBe('missing');
  });

  it('decodes phased homozygous-ref and homozygous-alt at 2:500', () => {
    const result = getGenotypes(testContext, mkInput(SAMPLE_VCF, '2', 500));
    const gts = result.getGenotypesList();
    expect(gts[0].getGtRaw()).toBe('1|1');
    expect(gts[0].getZygosity()).toBe('homozygous_alt');
    expect(gts[1].getGtRaw()).toBe('0|0');
    expect(gts[1].getZygosity()).toBe('homozygous_ref');
    // NA003 is unphased 1/0 -- heterozygous regardless of allele order.
    expect(gts[2].getGtRaw()).toBe('1/0');
    expect(gts[2].getPhased()).toBe(false);
    expect(gts[2].getZygosity()).toBe('heterozygous');
  });

  it('returns an empty genotypes list (not an error) for a site-only VCF with no samples', () => {
    const result = getGenotypes(testContext, mkInput(SITE_ONLY_VCF, '3', 100));
    expect(result.hasError()).toBe(false);
    expect(result.getFound()).toBe(true);
    expect(result.getGenotypesList()).toEqual([]);
  });

  it('reports found=false (no error) for a position with no variant', () => {
    const result = getGenotypes(testContext, mkInput(SAMPLE_VCF, '1', 42));
    expect(result.hasError()).toBe(false);
    expect(result.getFound()).toBe(false);
  });
});
