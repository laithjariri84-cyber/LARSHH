import { readFileSync } from "fs";
import { resolve } from "path";

function inspectEnvFile(path: string) {
  const raw = readFileSync(path, "utf8");
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) {
      console.log(`[${path}] malformed line (no =)`);
      continue;
    }

    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    const unquoted = value.replace(/^["']|["']$/g, "");

    if (key.includes("URL") || key.includes("KEY")) {
      const hasNewline = unquoted.includes("\n") || unquoted.includes("\r");
      const isPlaceholder =
        unquoted.includes("placeholder") ||
        unquoted.includes("your-project") ||
        unquoted.includes("[password]") ||
        unquoted.includes("[YOUR-PASSWORD]");

      let host = "(invalid)";
      try {
        if (unquoted.startsWith("postgresql://")) {
          host = new URL(unquoted).host;
        } else if (unquoted.startsWith("http")) {
          host = new URL(unquoted).host;
        }
      } catch {
        host = "(parse error)";
      }

      console.log(
        `[${path}] ${key}: host=${host} len=${unquoted.length} newline=${hasNewline} placeholder=${isPlaceholder}`
      );
    } else if (key === "NEXT_PUBLIC_UI_ONLY") {
      console.log(`[${path}] ${key}=${unquoted}`);
    }
  }
}

for (const file of [".env", ".env.local"]) {
  try {
    inspectEnvFile(resolve(process.cwd(), file));
  } catch {
    console.log(`[${file}] not found`);
  }
}
