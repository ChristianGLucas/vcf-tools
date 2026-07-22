// Shared test scaffolding for every *_test.ts in this package — one
// AxiomContext test double and one realistic multi-sample VCF fixture,
// reused rather than duplicated 14 times.
import { AxiomContext, AxiomLogger, AxiomSecrets, AxiomReflection, AxiomMutation } from '../gen/axiomContext';

const testReflection: AxiomReflection = {
  flow: {
    nodes: [],
    edges: [],
    loopEdges: [],
    position: { currentInstance: 0, depth: 0, loopIterations: {}, subflowStackGraphIds: [] },
    graphId: '',
  },
};

const testMutation: AxiomMutation = {
  flow: {
    addNode: (_packageName: string, _packageVersion: string) => 0,
    addEdge: (_srcInstance: number, _dstInstance: number) => {},
  },
};

export const testContext: AxiomContext = {
  log: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  } satisfies AxiomLogger,
  secrets: {
    get: (_name: string): [string, boolean] => ['', false],
  } satisfies AxiomSecrets,
  executionId: 'test-execution-id',
  flowId: 'test-flow-id',
  tenantId: 'test-tenant-id',
  reflection: testReflection,
  mutation: testMutation,
};

// A realistic small multi-sample VCF (VCFv4.2), hand-constructed so every
// field can be independently verified against the raw text -- 6 variants
// across 2 chromosomes covering a SNP, an insertion, a deletion, an MNP, a
// multi-allelic same-type (SNP+SNP) site, and a multi-allelic mixed-type
// (SNP+insertion) site; 3 samples with varied genotypes (hom-ref, het,
// hom-alt, phased, unphased, missing); one non-PASS-filtered variant; and
// Flag/Integer/Float/String-typed INFO fields.
export const SAMPLE_VCF = [
  '##fileformat=VCFv4.2',
  '##INFO=<ID=DP,Number=1,Type=Integer,Description="Total Depth">',
  '##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">',
  '##INFO=<ID=DB,Number=0,Type=Flag,Description="dbSNP membership">',
  '##INFO=<ID=ANN,Number=1,Type=String,Description="Annotation, e.g. a note with a comma">',
  '##FILTER=<ID=PASS,Description="All filters passed">',
  '##FILTER=<ID=LowQual,Description="Low quality">',
  '##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">',
  '##FORMAT=<ID=DP,Number=1,Type=Integer,Description="Read Depth">',
  '##FORMAT=<ID=GQ,Number=1,Type=Float,Description="Genotype Quality">',
  '##contig=<ID=1,length=249250621,assembly=GRCh37>',
  '##contig=<ID=2,length=243199373>',
  '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tNA001\tNA002\tNA003',
  '1\t1000\trs1\tA\tG\t50\tPASS\tDP=30;AF=0.5;DB\tGT:DP:GQ\t0/0:10:99\t0/1:12:80\t1/1:8:60',
  '1\t2000\t.\tA\tATG\t40\tPASS\tDP=20;AF=0.25\tGT:DP:GQ\t0/1:9:70\t0|1:11:75\t./.:.:.',
  '1\t3000\t.\tATG\tA\t35\tLowQual\tDP=15;AF=0.1\tGT:DP:GQ\t0/0:7:40\t1/1:6:35\t0/1:8:45',
  '2\t500\trs2;rs3\tAT\tGC\t60\tPASS\tDP=40;AF=0.75\tGT:DP:GQ\t1|1:14:99\t0|0:13:95\t1/0:10:88',
  '2\t600\t.\tA\tG,T\t45\tPASS\tDP=25;AF=0.3,0.2\tGT:DP:GQ\t0/1:10:65\t0/2:9:55\t2/2:11:70',
  '2\t700\t.\tA\tT,ATG\t30\tPASS\tDP=12;AF=0.4,0.1\tGT:DP:GQ\t0/1:6:40\t0/2:5:35\t1/2:7:38',
].join('\n');

// A VCF with no sample/genotype columns at all (site-only) -- exercises
// the "no FORMAT column" path.
export const SITE_ONLY_VCF = [
  '##fileformat=VCFv4.2',
  '##INFO=<ID=DP,Number=1,Type=Integer,Description="Total Depth">',
  '#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO',
  '3\t100\t.\tC\tT\t99\tPASS\tDP=50',
].join('\n');
