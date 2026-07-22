import { VcfInput } from '../gen/messages_pb';
import { validateStructure } from './validate_structure';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(text: string): VcfInput {
  const input = new VcfInput();
  input.setVcfText(text);
  return input;
}

describe('ValidateStructure', () => {
  it('reports valid=true with zero issues for a well-formed VCF', () => {
    const result = validateStructure(testContext, mkInput(SAMPLE_VCF));
    expect(result.getValid()).toBe(true);
    expect(result.getIssuesList()).toEqual([]);
  });

  it('reports EMPTY_INPUT at line 0 for an empty string', () => {
    const result = validateStructure(testContext, mkInput(''));
    expect(result.getValid()).toBe(false);
    expect(result.getIssuesList()).toHaveLength(1);
    expect(result.getIssuesList()[0].getCode()).toBe('EMPTY_INPUT');
    expect(result.getIssuesList()[0].getSeverity()).toBe('error');
    expect(result.getIssuesList()[0].getLineNumber()).toBe(0);
  });

  it('reports NO_COLUMN_HEADER when there is no #CHROM line', () => {
    const result = validateStructure(testContext, mkInput('##fileformat=VCFv4.2\n'));
    expect(result.getValid()).toBe(false);
    expect(result.getIssuesList().some((i) => i.getCode() === 'NO_COLUMN_HEADER')).toBe(true);
  });

  it('reports COLUMN_COUNT_MISMATCH with the correct 1-based line number', () => {
    const vcf = [
      '##fileformat=VCFv4.2',
      '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO', // line 2
      '1\t100\t.\tA\tG\t50\tPASS\t.', // line 3, well-formed
      '1\t200\t.\tA\tG\t50\tPASS', // line 4, missing INFO column
    ].join('\n');
    const result = validateStructure(testContext, mkInput(vcf));
    expect(result.getValid()).toBe(false);
    const mismatch = result.getIssuesList().find((i) => i.getCode() === 'COLUMN_COUNT_MISMATCH');
    expect(mismatch).toBeDefined();
    expect(mismatch!.getLineNumber()).toBe(4);
    expect(mismatch!.getSeverity()).toBe('error');
  });

  it('reports INVALID_POS for a non-numeric POS and flags EMPTY_CHROM/EMPTY_REF as warnings', () => {
    const vcf = [
      '##fileformat=VCFv4.2',
      '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO',
      '\tabc\t.\t\tG\t50\tPASS\t.',
    ].join('\n');
    const result = validateStructure(testContext, mkInput(vcf));
    expect(result.getValid()).toBe(false);
    const codes = result.getIssuesList().map((i) => i.getCode());
    expect(codes).toContain('INVALID_POS');
    expect(codes).toContain('EMPTY_CHROM');
    expect(codes).toContain('EMPTY_REF');
    const posIssue = result.getIssuesList().find((i) => i.getCode() === 'INVALID_POS')!;
    expect(posIssue.getSeverity()).toBe('error');
    const chromIssue = result.getIssuesList().find((i) => i.getCode() === 'EMPTY_CHROM')!;
    expect(chromIssue.getSeverity()).toBe('warning');
  });
});
