import { ChromPositionsInput } from '../gen/messages_pb';
import { listPositionsForChromosome } from './list_positions_for_chromosome';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(chrom: string, maxPositions = 0): ChromPositionsInput {
  const input = new ChromPositionsInput();
  input.setVcfText(SAMPLE_VCF);
  input.setChrom(chrom);
  input.setMaxPositions(maxPositions);
  return input;
}

describe('ListPositionsForChromosome', () => {
  it('lists all chr1 positions in file order', () => {
    const result = listPositionsForChromosome(testContext, mkInput('1'));
    expect(result.hasError()).toBe(false);
    expect(result.getChrom()).toBe('1');
    expect(result.getPositionsList()).toEqual([1000, 2000, 3000]);
    expect(result.getTotalCount()).toBe(3);
    expect(result.getTruncated()).toBe(false);
  });

  it('lists all chr2 positions', () => {
    const result = listPositionsForChromosome(testContext, mkInput('2'));
    expect(result.getPositionsList()).toEqual([500, 600, 700]);
  });

  it('returns an empty list for a chromosome not present in the VCF', () => {
    const result = listPositionsForChromosome(testContext, mkInput('X'));
    expect(result.getPositionsList()).toEqual([]);
    expect(result.getTotalCount()).toBe(0);
  });

  it('caps returned positions at max_positions but reports the true total_count', () => {
    const result = listPositionsForChromosome(testContext, mkInput('1', 2));
    expect(result.getPositionsList()).toEqual([1000, 2000]);
    expect(result.getTotalCount()).toBe(3);
    expect(result.getTruncated()).toBe(true);
  });
});
