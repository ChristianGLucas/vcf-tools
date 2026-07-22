import { GetVariantInput } from '../gen/messages_pb';
import { getSampleFields } from './get_sample_fields';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(chrom: string, pos: number): GetVariantInput {
  const input = new GetVariantInput();
  input.setVcfText(SAMPLE_VCF);
  input.setChrom(chrom);
  input.setPos(pos);
  return input;
}

describe('GetSampleFields', () => {
  it('parses every FORMAT key (GT/DP/GQ), typed, for every sample at 1:1000', () => {
    const result = getSampleFields(testContext, mkInput('1', 1000));
    expect(result.hasError()).toBe(false);
    expect(result.getFound()).toBe(true);
    const samples = result.getSamplesList();
    expect(samples.map((s) => s.getSample())).toEqual(['NA001', 'NA002', 'NA003']);

    const na001 = samples[0].getFieldsMap();
    expect(na001.get('GT')!.getType()).toBe('String');
    expect(na001.get('GT')!.getStringValuesList()).toEqual(['0/0']);
    expect(na001.get('DP')!.getType()).toBe('Integer');
    expect(na001.get('DP')!.getIntValuesList()).toEqual([10]);
    expect(na001.get('GQ')!.getType()).toBe('Float');
    expect(na001.get('GQ')!.getFloatValuesList()).toEqual([99]);

    const na003 = samples[2].getFieldsMap();
    expect(na003.get('GT')!.getStringValuesList()).toEqual(['1/1']);
    expect(na003.get('DP')!.getIntValuesList()).toEqual([8]);
  });

  it('omits missing ("." ) FORMAT values from a sample field map at 1:2000 (NA003)', () => {
    const result = getSampleFields(testContext, mkInput('1', 2000));
    const na003 = result.getSamplesList()[2].getFieldsMap();
    expect(na003.get('GT')!.getStringValuesList()).toEqual(['./.']);
    // DP and GQ were literally "." for NA003 on this line -- present but empty.
    expect(na003.get('DP')!.getPresent()).toBe(false);
    expect(na003.get('DP')!.getIntValuesList()).toEqual([]);
  });
});
