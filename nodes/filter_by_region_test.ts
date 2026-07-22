import { FilterByRegionInput } from '../gen/messages_pb';
import { filterByRegion } from './filter_by_region';
import { testContext, SAMPLE_VCF } from './test_helpers';

describe('FilterByRegion', () => {
  it('returns only the one chr1 variant within [1500, 2500]', () => {
    const input = new FilterByRegionInput();
    input.setVcfText(SAMPLE_VCF);
    input.setChrom('1');
    input.setHasStart(true);
    input.setStart(1500);
    input.setHasEnd(true);
    input.setEnd(2500);
    const result = filterByRegion(testContext, input);
    expect(result.hasError()).toBe(false);
    expect(result.getTotalCount()).toBe(1);
    expect(result.getVariantsList()[0].getPos()).toBe(2000);
  });

  it('returns all 3 chr2 variants when no start/end bound is set', () => {
    const input = new FilterByRegionInput();
    input.setVcfText(SAMPLE_VCF);
    input.setChrom('2');
    const result = filterByRegion(testContext, input);
    expect(result.getTotalCount()).toBe(3);
    expect(result.getVariantsList().map((v) => v.getPos())).toEqual([500, 600, 700]);
  });

  it('respects a one-sided (start-only) bound', () => {
    const input = new FilterByRegionInput();
    input.setVcfText(SAMPLE_VCF);
    input.setChrom('1');
    input.setHasStart(true);
    input.setStart(2000);
    const result = filterByRegion(testContext, input);
    expect(result.getVariantsList().map((v) => v.getPos())).toEqual([2000, 3000]);
  });

  it('returns a structured MISSING_CHROM error when chrom is empty', () => {
    const input = new FilterByRegionInput();
    input.setVcfText(SAMPLE_VCF);
    const result = filterByRegion(testContext, input);
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('MISSING_CHROM');
  });
});
