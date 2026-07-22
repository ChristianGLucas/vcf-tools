import { VcfInput } from '../gen/messages_pb';
import { countVariants } from './count_variants';
import { testContext, SAMPLE_VCF } from './test_helpers';

describe('CountVariants', () => {
  it('summarizes SAMPLE_VCF: total, by_type, and by_chromosome', () => {
    const input = new VcfInput();
    input.setVcfText(SAMPLE_VCF);
    const result = countVariants(testContext, input);
    expect(result.hasError()).toBe(false);
    expect(result.getTotal()).toBe(6);

    // Matches the same per-variant ground truth as ClassifyVariantTypes:
    // SNP x2 (1000, 600), INSERTION x1 (2000), DELETION x1 (3000), MNP x1
    // (500), MIXED x1 (700).
    const byType = result.getByTypeMap();
    expect(byType.get('SNP')).toBe(2);
    expect(byType.get('INSERTION')).toBe(1);
    expect(byType.get('DELETION')).toBe(1);
    expect(byType.get('MNP')).toBe(1);
    expect(byType.get('MIXED')).toBe(1);

    const byChrom = result.getByChromosomeMap();
    expect(byChrom.get('1')).toBe(3);
    expect(byChrom.get('2')).toBe(3);
  });
});
