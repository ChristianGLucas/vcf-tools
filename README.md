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

Built for the [Axiom](https://axiomide.com) marketplace, published under the
`christiangeorgelucas` handle.

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/vcf-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/vcf-tools/ParseHeader --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/vcf-tools/0.1.0/ParseHeader \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/vcf-tools/ParseHeader`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

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
