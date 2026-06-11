import { describe, expect, test } from "bun:test";
import { format as formatDiscord } from "../src/formatters/discord.js";
import { format as formatSlack } from "../src/formatters/slack.js";
import { format as formatMsteams } from "../src/formatters/msteams.js";
import { format as formatGeneric } from "../src/formatters/generic.js";
import { formatForProvider } from "../src/formatters/index.js";
import type { NotifyPayload } from "../src/types.js";

const basePayload: NotifyPayload = {
  title: "Test notification",
  body: "This is a test message with **markdown**.",
  level: "info",
  summary: false,
  metadata: { project: "test-project", sessionId: "abc123" },
};

describe("Discord formatter", () => {
  test("produces valid JSON with expected fields", () => {
    const result = formatDiscord(basePayload) as Record<string, unknown>;
    expect(typeof result.content).toBe("string");
    expect(result.content).toContain("Test notification");
    expect(Array.isArray(result.embeds)).toBe(true);
    expect((result.embeds as Array<Record<string, unknown>>).length).toBe(1);

    const embed = (result.embeds as Array<Record<string, unknown>>)[0];
    expect(embed.title).toBe("Test notification");
    expect(embed.description).toContain("markdown");
    expect(typeof embed.color).toBe("number");
  });

  test("error level is red", () => {
    const result = formatDiscord({ ...basePayload, level: "error" }) as Record<string, unknown>;
    const embed = (result.embeds as Array<Record<string, unknown>>)[0];
    expect(embed.color).toBe(0xff0000);
  });

  test("summary marks as final", () => {
    const result = formatDiscord({ ...basePayload, summary: true }) as Record<string, unknown>;
    const embed = (result.embeds as Array<Record<string, unknown>>)[0];
    expect(embed.footer).toBeDefined();
  });
});

describe("Slack formatter", () => {
  test("produces valid JSON with expected fields", () => {
    const result = formatSlack(basePayload) as Record<string, unknown>;
    expect(typeof result.text).toBe("string");
    expect(result.text).toContain("Test notification");
    expect(Array.isArray(result.attachments)).toBe(true);
    expect((result.attachments as Array<Record<string, unknown>>).length).toBe(1);

    const att = (result.attachments as Array<Record<string, unknown>>)[0];
    expect(att.color).toBeDefined();
    expect(att.title).toBe("Test notification");
  });

  test("error level is danger", () => {
    const result = formatSlack({ ...basePayload, level: "error" }) as Record<string, unknown>;
    const att = (result.attachments as Array<Record<string, unknown>>)[0];
    expect(att.color).toBe("danger");
  });

  test("warn level is warning", () => {
    const result = formatSlack({ ...basePayload, level: "warn" }) as Record<string, unknown>;
    const att = (result.attachments as Array<Record<string, unknown>>)[0];
    expect(att.color).toBe("warning");
  });
});

describe("MS Teams formatter", () => {
  test("produces valid JSON with expected fields", () => {
    const result = formatMsteams(basePayload) as Record<string, unknown>;
    expect(result.title).toBe("Test notification");
    expect(result.body).toContain("markdown");
    expect(result.level).toBe("info");
    expect(result.timestamp).toBeDefined();
    expect(Array.isArray(result.facts)).toBe(true);
  });

  test("includes metadata as facts", () => {
    const result = formatMsteams(basePayload) as Record<string, unknown>;
    const facts = result.facts as Array<{ name: string; value: string }>;
    expect(facts.length).toBe(2);
    expect(facts[0].name).toBe("project");
  });
});

describe("Generic formatter", () => {
  test("produces valid JSON with expected fields", () => {
    const result = formatGeneric(basePayload) as Record<string, unknown>;
    expect(result.title).toBe("Test notification");
    expect(result.body).toContain("markdown");
    expect(result.level).toBe("info");
    expect(result.timestamp).toBeDefined();
    expect(result.project).toBe("test-project");
    expect(result.sessionId).toBe("abc123");
  });
});

describe("formatForProvider dispatcher", () => {
  test("dispatches to correct formatter", () => {
    const discord = formatForProvider("discord", basePayload) as Record<string, unknown>;
    expect(discord.content).toBeDefined();
    expect(discord.embeds).toBeDefined();

    const slack = formatForProvider("slack", basePayload) as Record<string, unknown>;
    expect(slack.text).toBeDefined();
    expect(slack.attachments).toBeDefined();

    const msteams = formatForProvider("msteams", basePayload) as Record<string, unknown>;
    expect(msteams.facts).toBeDefined();

    const generic = formatForProvider("generic", basePayload) as Record<string, unknown>;
    expect(generic.title).toBeDefined();
  });
});
