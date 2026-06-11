import { describe, expect, test, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadNotifyConfig } from "../src/config.js";

describe("Config loader", () => {
  const testDir = join(tmpdir(), "notify-config-test-" + Date.now());
  const opencodeDir = join(testDir, ".opencode");
  const configPath = join(opencodeDir, "notify.json");

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test("returns empty targets when file not found", () => {
    const config = loadNotifyConfig("/nonexistent/path");
    expect(config.targets).toEqual([]);
  });

  test("returns empty targets when file is invalid JSON", () => {
    mkdirSync(opencodeDir, { recursive: true });
    writeFileSync(configPath, "not json at all", "utf-8");

    const config = loadNotifyConfig(testDir);
    expect(config.targets).toEqual([]);
  });

  test("loads valid config", () => {
    mkdirSync(opencodeDir, { recursive: true });
    const cfg = {
      defaults: { provider: "generic", throttleSeconds: 60 },
      targets: [
        { id: "dev_discord", provider: "discord", env: "CC_NOTIFY_DISCORD" },
        { id: "ops_teams", provider: "msteams", env: "CC_NOTIFY_TEAMS" },
      ],
      routes: { "session.idle": ["dev_discord"] },
      tools: { notify_send: { defaultTargets: ["dev_discord"] } },
    };
    writeFileSync(configPath, JSON.stringify(cfg), "utf-8");

    const config = loadNotifyConfig(testDir);

    expect(config.targets).toHaveLength(2);
    expect(config.targets[0].id).toBe("dev_discord");
    expect(config.defaults?.throttleSeconds).toBe(60);
    expect(config.routes?.["session.idle"]).toEqual(["dev_discord"]);
    expect(config.tools?.notify_send?.defaultTargets).toEqual(["dev_discord"]);
  });

  test("returns empty targets when targets is missing", () => {
    mkdirSync(opencodeDir, { recursive: true });
    writeFileSync(configPath, JSON.stringify({ defaults: {} }), "utf-8");

    const config = loadNotifyConfig(testDir);
    expect(config.targets).toEqual([]);
  });

  test("returns empty targets when targets is not an array", () => {
    mkdirSync(opencodeDir, { recursive: true });
    writeFileSync(configPath, JSON.stringify({ targets: "not-an-array" }), "utf-8");

    const config = loadNotifyConfig(testDir);
    expect(config.targets).toEqual([]);
  });
});
