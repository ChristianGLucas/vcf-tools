import { FilterByInfoInput } from '../gen/messages_pb';
import { filterByInfoThreshold } from './filter_by_info_threshold';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(infoKey: string, op: string, threshold: number): FilterByInfoInput {
  const input = new FilterByInfoInput();
  input.setVcfText(SAMPLE_VCF);
  input.setInfoKey(infoKey);
  input.setOp(op);
  input.setThreshold(threshold);
  return input;
}

describe('FilterByInfoThreshold', () => {
  it('filters by DP>=25 -- matches DP 30, 40, 25 (lines at pos 1000, 500, 600)', () => {
    const result = filterByInfoThreshold(testContext, mkInput('DP', '>=', 25));
    expect(result.hasError()).toBe(false);
    expect(result.getTotalCount()).toBe(3);
    expect(result.getVariantsList().map((v) => v.getPos()).sort((a, b) => a - b)).toEqual([500, 600, 1000]);
  });

  it('filters by the literal "QUAL" key against the QUAL column, not an INFO entry', () => {
    const result = filterByInfoThreshold(testContext, mkInput('QUAL', '>', 50));
    expect(result.getTotalCount()).toBe(1);
    expect(result.getVariantsList()[0].getPos()).toBe(500); // QUAL=60
  });

  it('excludes a variant where the INFO key is absent', () => {
    const result = filterByInfoThreshold(testContext, mkInput('DB', '==', 1));
    // DB is a Flag (present/absent, never numeric) on every variant here.
    expect(result.getTotalCount()).toBe(0);
  });

  it('returns a structured INVALID_OPERATOR error for an unsupported op', () => {
    const result = filterByInfoThreshold(testContext, mkInput('DP', '~=', 1));
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('INVALID_OPERATOR');
  });

  it('returns a structured MALFORMED_LINE error, not a crash, for a non-numeric POS', () => {
    const vcf = ['##fileformat=VCFv4.2', '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO', '1\tXYZ\t.\tA\tG\t.\t.\tDP=10'].join(
      '\n',
    );
    const input = new FilterByInfoInput();
    input.setVcfText(vcf);
    input.setInfoKey('DP');
    input.setOp('>=');
    input.setThreshold(1);
    const result = filterByInfoThreshold(testContext, input);
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('MALFORMED_LINE');
  });
});
