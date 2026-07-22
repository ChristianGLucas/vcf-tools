import { ListVariantsInput } from '../gen/messages_pb';
import { listVariants } from './list_variants';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(text: string, maxVariants = 0): ListVariantsInput {
  const input = new ListVariantsInput();
  input.setVcfText(text);
  input.setMaxVariants(maxVariants);
  return input;
}

describe('ListVariants', () => {
  it('parses all 6 variants of SAMPLE_VCF with correctly typed core + INFO fields', () => {
    const result = listVariants(testContext, mkInput(SAMPLE_VCF));
    expect(result.hasError()).toBe(false);
    expect(result.getTotalCount()).toBe(6);
    expect(result.getTruncated()).toBe(false);
    const variants = result.getVariantsList();
    expect(variants).toHaveLength(6);

    const v1 = variants[0];
    expect(v1.getChrom()).toBe('1');
    expect(v1.getPos()).toBe(1000);
    expect(v1.getIdList()).toEqual(['rs1']);
    expect(v1.getRef()).toBe('A');
    expect(v1.getAltList()).toEqual(['G']);
    expect(v1.getHasQual()).toBe(true);
    expect(v1.getQual()).toBeCloseTo(50);
    expect(v1.getFilterList()).toEqual(['PASS']);
    expect(v1.getFormat()).toBe('GT:DP:GQ');

    // Independent oracle: re-derive DP/AF/DB directly from the raw INFO
    // string "DP=30;AF=0.5;DB" by plain string splitting, not by calling
    // any code under test, and cross-check against the node's output.
    const rawInfo = 'DP=30;AF=0.5;DB';
    const pairs = Object.fromEntries(
      rawInfo.split(';').map((p) => {
        const [k, v] = p.split('=');
        return [k, v];
      }),
    );
    const infoMap = v1.getInfoMap();
    expect(infoMap.get('DP')!.getType()).toBe('Integer');
    expect(infoMap.get('DP')!.getIntValuesList()).toEqual([Number(pairs['DP'])]);
    expect(infoMap.get('AF')!.getType()).toBe('Float');
    expect(infoMap.get('AF')!.getFloatValuesList()).toEqual([Number(pairs['AF'])]);
    expect(infoMap.get('DB')!.getType()).toBe('Flag');
    expect(infoMap.get('DB')!.getPresent()).toBe(true);
    expect(pairs['DB']).toBeUndefined(); // bare flag, no "=value" in raw text

    // Multi-valued AF on the last (mixed-type) variant.
    const v6 = variants[5];
    expect(v6.getChrom()).toBe('2');
    expect(v6.getPos()).toBe(700);
    expect(v6.getAltList()).toEqual(['T', 'ATG']);
    expect(v6.getInfoMap().get('AF')!.getFloatValuesList()).toEqual([0.4, 0.1]);
  });

  it('caps materialized records at max_variants but reports the true total_count', () => {
    const result = listVariants(testContext, mkInput(SAMPLE_VCF, 2));
    expect(result.hasError()).toBe(false);
    expect(result.getVariantsList()).toHaveLength(2);
    expect(result.getTotalCount()).toBe(6);
    expect(result.getTruncated()).toBe(true);
  });

  it('returns EMPTY_INPUT for empty vcf_text', () => {
    const result = listVariants(testContext, mkInput(''));
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('EMPTY_INPUT');
  });

  it('returns a structured MALFORMED_LINE error, not a crash, for a data line missing INFO', () => {
    const broken = [
      '##fileformat=VCFv4.2',
      '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO',
      '1\t100\t.\tA\tG\t50\tPASS', // missing INFO column entirely
    ].join('\n');
    const result = listVariants(testContext, mkInput(broken));
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('MALFORMED_LINE');
  });

  it('returns a structured MALFORMED_LINE error, not a crash, for a non-numeric POS', () => {
    // Regression test: @gmod/vcf does not throw on a non-numeric POS -- it
    // silently coerces it to NaN, which used to reach the proto int64
    // setter and crash with an opaque "Assertion failed" at serialization
    // time (caught by an independent adversarial review, not the original
    // test suite). parseLineSafe now rejects it up front.
    const broken = [
      '##fileformat=VCFv4.2',
      '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO',
      '1\tXYZ\trs1\tA\tG\t50\tPASS\tDP=10',
    ].join('\n');
    const result = listVariants(testContext, mkInput(broken));
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('MALFORMED_LINE');
  });
});
