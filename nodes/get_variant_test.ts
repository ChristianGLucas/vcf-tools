import { GetVariantInput } from '../gen/messages_pb';
import { getVariant } from './get_variant';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(chrom: string, pos: number): GetVariantInput {
  const input = new GetVariantInput();
  input.setVcfText(SAMPLE_VCF);
  input.setChrom(chrom);
  input.setPos(pos);
  return input;
}

describe('GetVariant', () => {
  it('finds the insertion variant at 1:2000 by exact CHROM+POS', () => {
    const result = getVariant(testContext, mkInput('1', 2000));
    expect(result.hasError()).toBe(false);
    expect(result.getFound()).toBe(true);
    const v = result.getVariant()!;
    expect(v.getRef()).toBe('A');
    expect(v.getAltList()).toEqual(['ATG']);
    expect(v.getFilterList()).toEqual(['PASS']);
  });

  it('reports found=false (no error) for a position with no variant', () => {
    const result = getVariant(testContext, mkInput('1', 999999));
    expect(result.hasError()).toBe(false);
    expect(result.getFound()).toBe(false);
    expect(result.hasVariant()).toBe(false);
  });

  it('reports found=false for the right POS on the wrong chromosome', () => {
    const result = getVariant(testContext, mkInput('2', 1000));
    expect(result.getFound()).toBe(false);
  });

  it('returns a structured error for a malformed header', () => {
    const input = new GetVariantInput();
    input.setVcfText('not a vcf at all');
    input.setChrom('1');
    input.setPos(1);
    const result = getVariant(testContext, input);
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('MALFORMED_HEADER');
  });
});
