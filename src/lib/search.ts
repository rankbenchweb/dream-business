import { footerNav, primaryNav } from "./site";
import { tools, statusLabel } from "./tools";
import { divisions, divisionOrder } from "./divisions";

export type SearchEntry = {
  title: string;
  href: string;
  context: string;
  keywords: string;
};

function build(): SearchEntry[] {
  const seen = new Set<string>();
  const out: SearchEntry[] = [];
  const add = (e: SearchEntry) => {
    const key = `${e.title}|${e.href}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(e);
  };

  for (const key of divisionOrder) {
    const d = divisions[key];
    add({ title: d.name, href: d.href, context: "Platform division", keywords: `${d.purpose} ${d.intro}` });
    for (const c of d.capabilities) {
      add({
        title: c.name,
        href: c.href ?? d.href,
        context: `${d.name} (${statusLabel[c.status].toLowerCase()})`,
        keywords: c.detail,
      });
    }
  }
  for (const t of tools) {
    add({
      title: t.name,
      href: t.href ?? `/tools?q=${encodeURIComponent(t.name)}#catalogue`,
      context: `Tool (${statusLabel[t.status].toLowerCase()})`,
      keywords: `${t.summary} ${t.category}`,
    });
  }
  for (const g of primaryNav) {
    for (const l of g.links) add({ title: l.label === "Overview" ? g.label : l.label, href: l.href, context: g.label, keywords: l.description ?? "" });
  }
  for (const g of footerNav) {
    for (const l of g.links) add({ title: l.label, href: l.href, context: g.heading, keywords: "" });
  }
  return out;
}

export const searchIndex = build();

export function searchSite(query: string, limit = 8): SearchEntry[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return searchIndex
    .map((e) => {
      const title = e.title.toLowerCase();
      const body = `${e.context} ${e.keywords}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (title.startsWith(t)) score += 6;
        else if (title.includes(t)) score += 4;
        else if (body.includes(t)) score += 1;
        else return { e, score: 0 };
      }
      return { e, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.e);
}
