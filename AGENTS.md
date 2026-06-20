# four-opencode-notification — AGENTS.md

Pointer to central standards: `~/ai-shared-rules/AGENTS.md` and meta-repo `four-bytes/opencode-plugins` AGENTS.md.

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
`~/ai-shared-rules/AGENTS.md`

## This Plugin
- Plugin name: four-opencode-notification
- Description: Multi-provider webhook notification plugin (Discord, Slack, MS Teams, generic) — custom notify_send tool + event hooks + team patterns. Source: Perplexity P50.
- Status: Sprint P14 (implemented)

## Workflow
Issues → Branch → PR → Merge (feature workflow)

- **Console logging:** Plugins MUST use `_client?.app?.log()` for all logging in plugin mode — `console.log` / `console.warn` / `console.error` is ONLY permitted for the initial startup `"init"` message. Console output in plugin mode breaks the terminal UI.
