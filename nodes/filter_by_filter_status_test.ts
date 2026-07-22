import { FilterByStatusInput } from '../gen/messages_pb';
import { filterByFilterStatus } from './filter_by_filter_status';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(statuses: string[]): FilterByStatusInput {
  const input = new FilterByStatusInput();
  input.setVcfText(SAMPLE_VCF);
  input.setStatusesList(statuses);
  return input;
}

describe('FilterByFilterStatus', () => {
  it('returns the 5 PASS variants out of 6 (line 3 is LowQual)', () => {
    const result = filterByFilterStatus(testContext, mkInput(['PASS']));
    expect(result.hasError()).toBe(false);
    expect(result.getTotalCount()).toBe(5);
    expect(result.getVariantsList().every((v) => v.getFilterList().includes('PASS'))).toBe(true);
    expect(result.getVariantsList().some((v) => v.getPos() === 3000)).toBe(false);
  });

  it('returns exactly the one LowQual variant', () => {
    const result = filterByFilterStatus(testContext, mkInput(['LowQual']));
    expect(result.getTotalCount()).toBe(1);
    expect(result.getVariantsList()[0].getPos()).toBe(3000);
    expect(result.getVariantsList()[0].getFilterList()).toEqual(['LowQual']);
  });

  it('returns zero matches for a status that never occurs', () => {
    const result = filterByFilterStatus(testContext, mkInput(['q30']));
    expect(result.getTotalCount()).toBe(0);
    expect(result.getVariantsList()).toEqual([]);
    expect(result.getTruncated()).toBe(false);
  });

  it('returns a structured MALFORMED_LINE error, not a crash, for a non-numeric POS', () => {
    const vcf = ['##fileformat=VCFv4.2', '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO', '1\tXYZ\t.\tA\tG\t.\tPASS\t.'].join(
      '\n',
    );
    const input = new FilterByStatusInput();
    input.setVcfText(vcf);
    input.setStatusesList(['PASS']);
    const result = filterByFilterStatus(testContext, input);
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('MALFORMED_LINE');
  });
});
