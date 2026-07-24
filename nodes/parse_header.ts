import { VcfInput, HeaderInfo } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildParser, parseHeaderDeclared, toErrorMsg } from './_shared';

/**
 * Parses a VCF's meta-header into structured metadata: the ##fileformat
 * version, every ##INFO/##FORMAT field definition (ID, Number, Type,
 * Description), every ##FILTER definition, every ##contig declaration
 * (ID, length, assembly), and the sample-column names from the #CHROM
 * column-header line. Reports only what this file's header explicitly
 * declares -- not the VCF-spec reserved INFO/FORMAT defaults a variant
 * line may still rely on implicitly. A header that doesn't parse (no
 * #CHROM line, wrong column names, etc.) returns a structured error
 * instead of a crash.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseHeader(ax: AxiomContext, input: VcfInput): HeaderInfo {
  const out = new HeaderInfo();
  const { parser, headerLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  const { fileformat, infoFields, formatFields, filters, contigs } = parseHeaderDeclared(headerLines);
  out.setFileformat(fileformat);
  out.setInfoFieldsList(infoFields);
  out.setFormatFieldsList(formatFields);
  out.setFiltersList(filters);
  out.setContigsList(contigs);
  out.setSampleNamesList(parser.samples);
  return out;
}
