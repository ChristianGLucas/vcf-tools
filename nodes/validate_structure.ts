import { VcfInput, ValidationResult, ValidationIssue } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';

/**
 * Validates a VCF's basic structural correctness WITHOUT relying on a
 * throwing parser: checks for the presence of a header, a well-formed
 * #CHROM column-header line (exact required column names, in order),
 * consistent column counts on every data line, and simple per-column
 * sanity (non-empty CHROM/REF, a positive-integer POS). Every issue is
 * reported with its 1-based line number (0 for a file-level issue, e.g.
 * no header at all) and a severity ("error" = structurally invalid,
 * "warning" = suspicious but not necessarily invalid); valid is true iff
 * no "error"-severity issue was found.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function validateStructure(ax: AxiomContext, input: VcfInput): ValidationResult {
  const out = new ValidationResult();
  const issues: ValidationIssue[] = [];
  const addIssue = (lineNumber: number, severity: string, code: string, message: string) => {
    const vi = new ValidationIssue();
    vi.setLineNumber(lineNumber);
    vi.setSeverity(severity);
    vi.setCode(code);
    vi.setMessage(message);
    issues.push(vi);
  };
  const finish = () => {
    const hasError = issues.some((i) => i.getSeverity() === 'error');
    out.setValid(!hasError);
    out.setIssuesList(issues);
    return out;
  };

  const text = input.getVcfText();
  if (!text || text.length === 0) {
    addIssue(0, 'error', 'EMPTY_INPUT', 'vcf_text is empty');
    return finish();
  }

  const lines = text.split(/\r\n|\r|\n/);
  let headerEndIdx = -1;
  let sawAnyHash = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0) continue;
    if (line.startsWith('#')) {
      sawAnyHash = true;
      if (!line.startsWith('##')) {
        headerEndIdx = i;
      } else if (headerEndIdx !== -1) {
        addIssue(i + 1, 'warning', 'META_AFTER_HEADER', 'meta (##) line appears after the #CHROM column header line');
      }
      continue;
    }
    break;
  }

  if (!sawAnyHash) {
    addIssue(0, 'error', 'NO_HEADER', 'no header lines (lines starting with #) found');
    return finish();
  }
  if (headerEndIdx === -1) {
    addIssue(0, 'error', 'NO_COLUMN_HEADER', 'no #CHROM column-header line found');
    return finish();
  }

  const headerFields = lines[headerEndIdx].split('\t');
  const expected = ['#CHROM', 'POS', 'ID', 'REF', 'ALT', 'QUAL', 'FILTER', 'INFO'];
  if (headerFields.length < 8) {
    addIssue(headerEndIdx + 1, 'error', 'MISSING_COLUMNS', `column header has ${headerFields.length} columns, need at least 8`);
  } else {
    for (let k = 0; k < 8; k++) {
      if (headerFields[k] !== expected[k]) {
        addIssue(headerEndIdx + 1, 'error', 'BAD_COLUMN_NAME', `column ${k + 1} is "${headerFields[k]}", expected "${expected[k]}"`);
      }
    }
  }
  const expectedColumnCount = headerFields.length;

  for (let i = headerEndIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0) continue;
    const fields = line.split('\t');
    if (fields.length !== expectedColumnCount) {
      addIssue(i + 1, 'error', 'COLUMN_COUNT_MISMATCH', `line has ${fields.length} columns, expected ${expectedColumnCount}`);
    }
    if (!fields[0]) {
      addIssue(i + 1, 'warning', 'EMPTY_CHROM', 'CHROM column is empty');
    }
    const posStr = fields[1];
    const posNum = posStr === undefined ? NaN : Number(posStr);
    if (posStr === undefined || posStr === '' || !Number.isFinite(posNum) || posNum <= 0) {
      addIssue(i + 1, 'error', 'INVALID_POS', `POS "${posStr ?? ''}" is not a positive integer`);
    }
    if (!fields[3]) {
      addIssue(i + 1, 'warning', 'EMPTY_REF', 'REF column is empty');
    }
    if (fields.length >= 8 && !fields[7]) {
      addIssue(i + 1, 'warning', 'EMPTY_INFO', 'INFO column is empty (should be "." if unused)');
    }
  }

  return finish();
}
