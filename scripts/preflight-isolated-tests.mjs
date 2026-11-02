import { readIsolatedConfig, requireProviderHosts } from "./isolated-test-guards.mjs";

try {
  const providers = process.argv.includes("--providers");
  readIsolatedConfig({ providers });
  if (providers) requireProviderHosts();
  process.stdout.write(`Isolated test preflight passed (${providers ? "database + provider" : "database only"} configuration). Secret values are not displayed.\n`);
} catch (error) {
  process.stderr.write(`Isolated test preflight blocked: ${error instanceof Error ? error.message : "invalid configuration"}\n`);
  process.exitCode = 1;
}
