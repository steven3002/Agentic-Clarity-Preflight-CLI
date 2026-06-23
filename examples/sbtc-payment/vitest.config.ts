import { defineConfig } from "vitest/config";
import {
  vitestSetupFilePath,
  getClarinetVitestsArgv,
} from "@stacks/clarinet-sdk/vitest";

/*
  Vitest is configured here to run against the Clarinet simnet.

  The `vitest-environment-clarinet` environment initialises the clarinet-sdk and exposes the
  `simnet` object globally in the test files. `vitestSetupFilePath` registers the simnet
  lifecycle hooks and the Clarity-value matchers (for example `expect(...).toBeOk(...)`).
  `getClarinetVitestsArgv()` forwards options passed after `vitest run --` (such as
  `--manifest ./Clarinet.toml` or `--coverage --costs`).
*/

export default defineConfig({
  test: {
    environment: "clarinet",
    pool: "forks",
    isolate: false,
    maxWorkers: 1,
    setupFiles: [vitestSetupFilePath],
    environmentOptions: {
      clarinet: {
        ...getClarinetVitestsArgv(),
      },
    },
  },
});
