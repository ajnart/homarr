import fs from "fs/promises";
import { join } from "path";
import json5 from "json5";
import { describe, test } from "vitest";

describe("Renovate configuration tests", () => {
  test("automerge should be disabled for onlyBuiltDependencies", async () => {
    const packageJson = await import("../package.json");
    const renovateConfig = await fs.readFile(join(__dirname, "../.github/renovate.json5"), "utf-8").then(json5.parse);
    const onlyBuiltDependencies = packageJson.pnpm.onlyBuiltDependencies;
    const automergeDisabledDeps = renovateConfig.packageRules
      .filter((rule: any) => rule.automerge === false)
      .flatMap((rule: any) => rule.matchPackageNames || []);

    const missingDeps = onlyBuiltDependencies.filter((dep: string) => !automergeDisabledDeps.includes(dep));

    if (missingDeps.length > 0) {
      throw new Error(
        `The following onlyBuiltDependencies are missing automerge disable rules in renovate.json5: ${missingDeps.join(", ")}`,
      );
    }
  });
});
