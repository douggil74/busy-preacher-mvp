// lib/credits.ts
import "server-only";
import pkg from "../package.json";

export type Credit = {
  name: string;
  url?: string;
  version?: string;
  kind: "library" | "service";
  desc?: string;
};

const NAME_MAP: Record<string, string> = {
  next: "Next.js",
  react: "React",
  "react-dom": "React DOM",
  tailwindcss: "Tailwind CSS",
  jspdf: "jsPDF",
  openai: "OpenAI SDK",
  zod: "Zod",
};

const URL_MAP: Record<string, string> = {
  next: "https://nextjs.org/",
  react: "https://react.dev/",
  "react-dom": "https://react.dev/",
  tailwindcss: "https://tailwindcss.com/",
  jspdf: "https://github.com/parallax/jsPDF",
  openai: "https://platform.openai.com/",
  zod: "https://zod.dev/",
};

function depsToCredits(): Credit[] {
  const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

  // keep only mapped/known libs to avoid listing every dev tool
  return Object.entries(all)
    .filter(([k]) => k in NAME_MAP)
    .map(([key, version]) => ({
      name: NAME_MAP[key],
      url: URL_MAP[key],
      version: String(version),
      kind: "library" as const,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function envServices(): Credit[] {
  const out: Credit[] = [];

  // Optional JSON array to add/override services (e.g., BP_CREDITS='[{"name":"..."}]')
  const raw = process.env.BP_CREDITS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((c: Partial<Credit>) =>
          out.push({
            name: c.name ?? "Service",
            url: c.url,
            desc: c.desc,
            kind: "service",
          })
        );
      }
    } catch {
      // ignore bad JSON
    }
  }

  // Auto-credit well-known services if keys/urls are present
  if (process.env.OPENAI_API_KEY && !out.some((c) => c.name.toLowerCase().includes("openai"))) {
    out.push({
      name: "OpenAI API",
      url: "https://platform.openai.com/",
      desc: "Model inference for outline generation",
      kind: "service",
    });
  }

  if (process.env.ESV_API_KEY && !out.some((c) => c.name.toLowerCase().includes("esv"))) {
    out.push({
      name: "ESV API (Crossway)",
      url: "https://api.esv.org/",
      desc: "Scripture text (English Standard Version)",
      kind: "service",
    });
  }

  if (
    (process.env.BIBLE_GATEWAY_USERNAME || process.env.BIBLE_GATEWAY_BASE_URL) &&
    !out.some((c) => c.name.toLowerCase().includes("bible gateway"))
  ) {
    out.push({
      name: "Bible Gateway",
      url: process.env.BIBLE_GATEWAY_BASE_URL || "https://www.biblegateway.com/",
      desc: "Verse lookups / reference (when enabled)",
      kind: "service",
    });
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCredits() {
  const libs = depsToCredits();
  const services = envServices();
  return { libs, services };
}
