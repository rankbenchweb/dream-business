import type { Metadata } from "next";
import { site } from "./site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  /** Draft or utility pages that should stay out of search results. */
  noindex?: boolean;
};

/** Site-wide share image (src/app/opengraph-image.tsx). Pages that set their own
 *  openGraph object replace the inherited one, so it is listed explicitly. */
const shareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "The Dream Business, the business builder: where businesses build their future.",
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
      images: [shareImage],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: [shareImage.url] },
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
