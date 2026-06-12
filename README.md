# @four-bytes/four-opencode-notification

> Multi-provider webhook notifications for opencode — Discord, Slack, MS Teams, and generic webhooks with TUI toast.

[![npm](https://img.shields.io/npm/v/@four-bytes/four-opencode-notification)](https://www.npmjs.com/package/@four-bytes/four-opencode-notification)
[![license](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)
[![bun](https://img.shields.io/badge/runtime-bun-orange)](https://bun.sh)

## Why?

Automatically notify your team when opencode sessions complete, encounter errors, or request permissions. Supports 4 webhook providers with configurable routing. Manual `notify_send` tool lets agents send custom notifications. TUI toast shows when webhooks fire.

## Quickstart

```bash
opencode plugin @four-bytes/four-opencode-notification -g
```

Restart opencode.

## Configuration

Create `.opencode/notify.json` in your project:

```json
{
  "targets": [
    {
      "id": "teams-dev",
      "provider": "msteams",
      "url": "https://prod-XX.logic.azure.com/workflows/...",
      "format": "flat",
      "enabled": true
    }
  ],
  "defaults": { "format": "flat" },
  "routes": {
    "session.idle": ["teams-dev"],
    "session.error": ["teams-dev"]
  },
  "tools": {
    "notify_send": { "defaultTargets": ["teams-dev"] }
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `targets[].id` | string | — | Target identifier |
| `targets[].provider` | string | — | `discord`, `slack`, `msteams`, `generic` |
| `targets[].url` | string | — | Webhook URL |
| `targets[].format` | string | `"flat"` | MS Teams: `"flat"` or `"adaptive"` |
| `targets[].enabled` | boolean | `true` | Enable/disable target |
| `routes` | object | — | Event → target ID mapping |
| `defaults.format` | string | `"flat"` | Default MS Teams card format |

## Tools

| Tool | Description |
|------|-------------|
| `notify_send` | Send notification to configured targets |

### `notify_send`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | string | — | Notification title |
| `body` | string | — | Notification body (markdown) |
| `targets` | string[] | config default | Target IDs to send to |
| `level` | string | `"info"` | `info`, `warn`, `error` |
| `summary` | boolean | `false` | Mark as final summary |

## Event Hooks

| Hook | Trigger | Behavior |
|------|---------|----------|
| `session.idle` | Session completes | Sends summary notification |
| `session.error` | Session error | Sends error notification |
| `permission.asked` | Permission request | Sends warning notification |

Remove event from `routes` to disable automatic webhooks — manual `notify_send` still works.

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
bun install
bun run build
bun test
```

**Requirements:** Bun >= 1.0, opencode with plugin support.

## License

Apache-2.0 — see [LICENSE](LICENSE)

---

> If this plugin saves you tokens or time, consider leaving a ⭐ on [GitHub](https://github.com/four-bytes/four-opencode-notification).
