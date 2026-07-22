import { GetVariantInput } from '../gen/messages_pb';
import { getVariantInfo } from './get_variant_info';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(chrom: string, pos: number): GetVariantInput {
  const input = new GetVariantInput();
  input.setVcfText(SAMPLE_VCF);
  input.setChrom(chrom);
  input.setPos(pos);
  return input;
}

describe('GetVariantInfo', () => {
  it('returns the typed INFO map for 2:600, with multi-valued AF matching "AF=0.3,0.2" verbatim', () => {
    const result = getVariantInfo(testContext, mkInput('2', 600));
    expect(result.hasError()).toBe(false);
    expect(result.getFound()).toBe(true);
    const info = result.getInfoMap();
    expect(info.get('DP')!.getType()).toBe('Integer');
    expect(info.get('DP')!.getIntValuesList()).toEqual([25]);
    expect(info.get('AF')!.getType()).toBe('Float');
    expect(info.get('AF')!.getFloatValuesList()).toEqual([0.3, 0.2]);
    // DB is not present on this variant's INFO string at all.
    expect(info.get('DB')).toBeUndefined();
  });

  it('reports found=false (no error) for a position with no variant', () => {
    const result = getVariantInfo(testContext, mkInput('2', 1));
    expect(result.hasError()).toBe(false);
    expect(result.getFound()).toBe(false);
  });
});
