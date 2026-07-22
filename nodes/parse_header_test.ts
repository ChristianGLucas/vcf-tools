import { VcfInput } from '../gen/messages_pb';
import { parseHeader } from './parse_header';
import { testContext, SAMPLE_VCF, SITE_ONLY_VCF } from './test_helpers';

function mkInput(text: string): VcfInput {
  const input = new VcfInput();
  input.setVcfText(text);
  return input;
}

describe('ParseHeader', () => {
  it('parses fileformat, INFO/FORMAT/FILTER/contig defs, and sample names from SAMPLE_VCF', () => {
    const result = parseHeader(testContext, mkInput(SAMPLE_VCF));
    expect(result.hasError()).toBe(false);
    expect(result.getFileformat()).toBe('VCFv4.2');

    const infoIds = result.getInfoFieldsList().map((f) => f.getId());
    expect(infoIds).toEqual(['DP', 'AF', 'DB', 'ANN']);
    const dp = result.getInfoFieldsList().find((f) => f.getId() === 'DP')!;
    expect(dp.getNumber()).toBe('1');
    expect(dp.getType()).toBe('Integer');
    expect(dp.getDescription()).toBe('Total Depth');
    const af = result.getInfoFieldsList().find((f) => f.getId() === 'AF')!;
    expect(af.getNumber()).toBe('A');
    expect(af.getType()).toBe('Float');
    const ann = result.getInfoFieldsList().find((f) => f.getId() === 'ANN')!;
    // Description contains a comma inside quotes -- must not be split on it.
    expect(ann.getDescription()).toBe('Annotation, e.g. a note with a comma');

    const formatIds = result.getFormatFieldsList().map((f) => f.getId());
    expect(formatIds).toEqual(['GT', 'DP', 'GQ']);

    const filterIds = result.getFiltersList().map((f) => f.getId());
    expect(filterIds).toEqual(['PASS', 'LowQual']);

    const contigs = result.getContigsList();
    expect(contigs).toHaveLength(2);
    expect(contigs[0].getId()).toBe('1');
    expect(contigs[0].getLength()).toBe(249250621);
    expect(contigs[0].getHasLength()).toBe(true);
    expect(contigs[0].getAssembly()).toBe('GRCh37');
    expect(contigs[1].getId()).toBe('2');
    expect(contigs[1].getLength()).toBe(243199373);
    expect(contigs[1].getAssembly()).toBe('');

    expect(result.getSampleNamesList()).toEqual(['NA001', 'NA002', 'NA003']);
  });

  it('reports an empty sample list for a site-only VCF', () => {
    const result = parseHeader(testContext, mkInput(SITE_ONLY_VCF));
    expect(result.hasError()).toBe(false);
    expect(result.getSampleNamesList()).toEqual([]);
    expect(result.getInfoFieldsList().map((f) => f.getId())).toEqual(['DP']);
  });

  it('returns a structured EMPTY_INPUT error for empty vcf_text', () => {
    const result = parseHeader(testContext, mkInput(''));
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('EMPTY_INPUT');
  });

  it('returns a structured MALFORMED_HEADER error when there is no #CHROM line', () => {
    const result = parseHeader(testContext, mkInput('##fileformat=VCFv4.2\nnot a header line\n'));
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('MALFORMED_HEADER');
  });

  it('returns a structured TOO_LARGE error for oversized vcf_text', () => {
    const huge = '##fileformat=VCFv4.2\n#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n' + 'x'.repeat(4 * 1024 * 1024);
    const result = parseHeader(testContext, mkInput(huge));
    expect(result.hasError()).toBe(true);
    expect(result.getError()!.getCode()).toBe('TOO_LARGE');
  });
});
