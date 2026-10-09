import type { Metadata } from "next";
import { site } from "./site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  /** Draft or utility pages that should stay out of search results. */
  noindex?: boolean;
};

export function pageMetadata({ title, description, path, noindex }: PageMeta): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en",
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}
