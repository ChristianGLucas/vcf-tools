import { VcfInput, VariantCounts } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildParser, parseLineSafe, classifyVariant, toErrorMsg, err, LineParseError } from './_shared';

/**
 * Summarizes a VCF's variants: total count, counts by REF/ALT-length-
 * derived type (SNP/INSERTION/DELETION/MNP/COMPLEX/MIXED/NO_VARIANT --
 * see ClassifyVariantTypes), and counts by chromosome. Unlike
 * ListVariants/ClassifyVariantTypes, this scans every data line
 * regardless of any response-size limit, since the output is just two
 * small maps -- bounded by MAX_LINES (300000 data lines), not by a
 * materialized-record cap. A malformed VCF returns a structured error
 * instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function countVariants(ax: AxiomContext, input: VcfInput): VariantCounts {
  const out = new VariantCounts();
  const { parser, dataLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  try {
    const byType = out.getByTypeMap();
    const byChrom = out.getByChromosomeMap();
    let total = 0;
    let lineNo = 0;
    for (const line of dataLines) {
      lineNo++;
      const v = parseLineSafe(parser, line, lineNo);
      total++;
      const chrom = v.CHROM ?? '';
      byChrom.set(chrom, (byChrom.get(chrom) ?? 0) + 1);
      const { variantType } = classifyVariant(v.REF ?? '', v.ALT);
      byType.set(variantType, (byType.get(variantType) ?? 0) + 1);
    }
    out.setTotal(total);
  } catch (e: any) {
    out.setError(
      toErrorMsg(e instanceof LineParseError ? { code: e.code, message: e.message } : err('PARSE_ERROR', String(e?.message ?? e))),
    );
  }
  return out;
}
