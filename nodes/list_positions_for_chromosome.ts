import { ChromPositionsInput, ChromPositions } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { buildParser, clampLimit, toErrorMsg, DEFAULT_POSITIONS_LIMIT, MAX_POSITIONS_LIMIT } from './_shared';

/**
 * Extracts every variant's POS on one chromosome, as a flat list of
 * integers -- a lightweight alternative to FilterByRegion when all you
 * need is the positions, not full records. max_positions bounds how
 * many are returned (default 5000, hard cap 200000, since positions are
 * cheap and a chromosome can carry far more variants than a full-record
 * listing node would ever return); total_count/truncated report the
 * true match count regardless of the cap. A malformed VCF (bad header)
 * returns a structured error instead of a crash; an individual
 * unparseable data line is skipped rather than failing the whole call,
 * since this node only reads the CHROM/POS columns directly.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function listPositionsForChromosome(ax: AxiomContext, input: ChromPositionsInput): ChromPositions {
  const out = new ChromPositions();
  out.setChrom(input.getChrom());
  const { parser, dataLines, error } = buildParser(input.getVcfText());
  if (error || !parser) {
    out.setError(toErrorMsg(error!));
    return out;
  }
  const chrom = input.getChrom();
  const limit = clampLimit(input.getMaxPositions(), DEFAULT_POSITIONS_LIMIT, MAX_POSITIONS_LIMIT);
  const positions: number[] = [];
  let total = 0;
  for (const line of dataLines) {
    const tab1 = line.indexOf('\t');
    if (tab1 === -1) continue;
    if (line.slice(0, tab1) !== chrom) continue;
    const tab2 = line.indexOf('\t', tab1 + 1);
    const posField = tab2 === -1 ? line.slice(tab1 + 1) : line.slice(tab1 + 1, tab2);
    const posNum = Number(posField);
    if (!Number.isFinite(posNum)) continue;
    total++;
    if (positions.length < limit) positions.push(posNum);
  }
  out.setPositionsList(positions);
  out.setTotalCount(total);
  out.setTruncated(total > positions.length);
  return out;
}
