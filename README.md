# vcf-tools

Deterministic parsing and structural inspection of VCF (Variant Call Format)
files — the standard bioinformatics format for genetic variants (SNPs,
indels) with header metadata, per-variant fields, INFO/FORMAT annotations,
and per-sample genotypes.

Every node is a pure text transform: the VCF is always supplied as a string
by the caller — no reference-genome lookups, no network, no wall-clock, no
randomness. Wraps [`@gmod/vcf`](https://github.com/GMOD/vcf-js) (the GMOD
project's pure-JS VCF parser, MIT license, zero runtime dependencies) — the
header/variant-line/genotype parsing and typed-value decoding all belong to
the library; these nodes are thin, bounded wrappers around it.

Built for the [Axiom](https://axiom.dev) marketplace, published under the
`christiangeorgelucas` handle.

## Nodes

- **ParseHeader** — fileformat version, INFO/FORMAT/FILTER definitions, contigs, sample names.
- **ListVariants** — parse all variant data lines into structured records.
- **GetVariant** — look up a single variant by CHROM+POS.
- **GetVariantInfo** — a variant's INFO field, typed per the header's declarations.
- **GetGenotypes** — decode every sample's GT call (zygosity, phasing) for one variant.
- **GetSampleFields** — every FORMAT key (not just GT) per sample for one variant.
- **ListSamples** — the sample names declared on the VCF's column-header line.
- **ClassifyVariantTypes** — SNP/INSERTION/DELETION/MNP/COMPLEX classification from REF/ALT.
- **FilterByFilterStatus** — filter variants by FILTER column (e.g. only PASS).
- **FilterByRegion** — filter variants by CHROM + POS range.
- **FilterByInfoThreshold** — filter variants by a numeric INFO/QUAL threshold.
- **CountVariants** — summary counts: total, by type, by chromosome.
- **ListPositionsForChromosome** — every variant position on one chromosome.
- **ValidateStructure** — structural correctness check with line-numbered issues.

## Bounds

`vcf_text` is capped at 3 MiB and 300,000 data lines. Listing nodes cap how
many records they materialize into a single response (reporting the true
total separately) to stay under the platform's transport limit on a VCF that
may hold millions of variants. A malformed or oversized VCF returns a
structured error instead of a crash.

## License

MIT — see [LICENSE](./LICENSE).
