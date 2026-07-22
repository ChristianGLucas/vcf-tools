import { VcfInput } from '../gen/messages_pb';
import { listSamples } from './list_samples';
import { testContext, SAMPLE_VCF, SITE_ONLY_VCF } from './test_helpers';

function mkInput(text: string): VcfInput {
  const input = new VcfInput();
  input.setVcfText(text);
  return input;
}

describe('ListSamples', () => {
  it('lists sample names in file order for SAMPLE_VCF', () => {
    const result = listSamples(testContext, mkInput(SAMPLE_VCF));
    expect(result.hasError()).toBe(false);
    expect(result.getSampleNamesList()).toEqual(['NA001', 'NA002', 'NA003']);
  });

  it('returns an empty list for a site-only VCF', () => {
    const result = listSamples(testContext, mkInput(SITE_ONLY_VCF));
    expect(result.hasError()).toBe(false);
    expect(result.getSampleNamesList()).toEqual([]);
  });
});
