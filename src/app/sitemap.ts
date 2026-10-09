import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { liveTools } from "@/lib/tools";

const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/business-builder", priority: 0.9 },
  { path: "/intelligence", priority: 0.9 },
  { path: "/tools", priority: 0.9 },
  { path: "/marketplace", priority: 0.9 },
  { path: "/promote", priority: 0.9 },
  { path: "/growth", priority: 0.9 },
  { path: "/learn", priority: 0.7 },
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.5 },
  { path: "/advertising-standards", priority: 0.5 },
  { path: "/verification-standards", priority: 0.5 },
  { path: "/editorial-policy", priority: 0.4 },
  { path: "/affiliate-disclosure", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pages, ...liveTools.map((t) => ({ path: t.href!, priority: 0.8 }))].map((p) => ({
    url: `${site.url}${p.path === "/" ? "" : p.path}`,
    changeFrequency: "weekly",
    priority: p.priority,
  }));
}
