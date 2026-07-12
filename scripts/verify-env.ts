import { diagnoseEnvironment, formatEnvIssues } from "../src/lib/env/config";

const result = diagnoseEnvironment();

console.log("[env] uiOnlyMode:", result.uiOnlyMode);
console.log("[env] databaseHost:", result.databaseHost ?? "(not set)");
console.log("[env] supabaseHost:", result.supabaseHost ?? "(not set)");
console.log("[env] ok:", result.ok);

if (result.issues.length) {
  console.log(formatEnvIssues(result.issues));
}

process.exit(result.ok ? 0 : 1);
