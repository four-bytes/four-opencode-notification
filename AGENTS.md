# four-opencode-notification — AGENTS.md

Pointer to central standards: `~/.personal-config/ai-shared/AGENTS.md` and meta-repo `four-bytes/opencode-plugins` AGENTS.md.

## Convention
- Source file: `src/four-opencode-notification.ts` (NOT `src/index.ts`)
- npm name: `@four-bytes/four-opencode-notification`
- License: Apache-2.0
- ESM, Bun-targeted, strict TypeScript

## Build Discipline (MANDATORY)
- EVERY code change ends with: version bump in `package.json` + `bun run build`
- No merge without current `dist/`
- `dist/` is gitignored, freshly built on `npm publish`

## Standards
`~/.personal-config/ai-shared/AGENTS.md`

## This Plugin
- Plugin name: four-opencode-notification
- Description: Multi-provider webhook notification plugin (Discord, Slack, MS Teams, generic) — custom notify_send tool + event hooks + team patterns. Source: Perplexity P50.
- Status: Sprint P14 (bootstrap)

## Workflow
Issues → Branch → PR → Merge (feature workflow)
