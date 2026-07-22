import { ListVariantsInput } from '../gen/messages_pb';
import { classifyVariantTypes } from './classify_variant_types';
import { testContext, SAMPLE_VCF } from './test_helpers';

function mkInput(): ListVariantsInput {
  const input = new ListVariantsInput();
  input.setVcfText(SAMPLE_VCF);
  return input;
}

describe('ClassifyVariantTypes', () => {
  it('classifies all 6 SAMPLE_VCF variants against their known, hand-derived ground truth', () => {
    const result = classifyVariantTypes(testContext, mkInput());
    expect(result.hasError()).toBe(false);
    expect(result.getTotalCount()).toBe(6);
    const types = result.getTypesList();

    // Ground truth derived directly from VCF-spec definitions applied to
    // the raw REF/ALT strings in SAMPLE_VCF (test_helpers.ts), independent
    // of classifyAllele's own prefix-matching implementation:
    //   1:1000 A->G        equal length 1            -> SNP
    //   1:2000 A->ATG      ATG starts with A, longer  -> INSERTION
    //   1:3000 ATG->A      ATG starts with A, shorter -> DELETION
    //   2:500  AT->GC      equal length 2             -> MNP
    //   2:600  A->G,T      both equal length 1        -> SNP (uniform)
    //   2:700  A->T,ATG    T is SNP, ATG is INSERTION  -> MIXED
    const expected = [
      { pos: 1000, alleleTypes: ['SNP'], variantType: 'SNP' },
      { pos: 2000, alleleTypes: ['INSERTION'], variantType: 'INSERTION' },
      { pos: 3000, alleleTypes: ['DELETION'], variantType: 'DELETION' },
      { pos: 500, alleleTypes: ['MNP'], variantType: 'MNP' },
      { pos: 600, alleleTypes: ['SNP', 'SNP'], variantType: 'SNP' },
      { pos: 700, alleleTypes: ['SNP', 'INSERTION'], variantType: 'MIXED' },
    ];
    expect(types.map((t) => t.getPos())).toEqual(expected.map((e) => e.pos));
    types.forEach((t, i) => {
      expect(t.getAlleleTypesList()).toEqual(expected[i].alleleTypes);
      expect(t.getVariantType()).toBe(expected[i].variantType);
    });
  });

  it('classifies a monomorphic-reference record (ALT=".") as NO_VARIANT', () => {
    const vcf = ['##fileformat=VCFv4.2', '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO', '1\t1\t.\tA\t.\t.\t.\t.'].join(
      '\n',
    );
    const input = new ListVariantsInput();
    input.setVcfText(vcf);
    const result = classifyVariantTypes(testContext, input);
    expect(result.getTypesList()[0].getVariantType()).toBe('NO_VARIANT');
    expect(result.getTypesList()[0].getAlleleTypesList()).toEqual([]);
  });

  it('returns a structured MALFORMED_LINE error, not a crash, for a non-numeric POS', () => {
    const vcf = ['##fileformat=VCFv4.2', '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO', '1\tXYZ\t.\tA\tG\t.\t.\t.'].join(
      '\n',
    );
    const input = new ListVariantsInput();
    input.setVcfText(vcf);
    const result = classifyVariantTypes(testContext, input);
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('MALFORMED_LINE');
  });
});
