import type { Metadata, Viewport } from "next";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource-variable/public-sans";
import "./globals.css";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { JsonLd } from "@/components/ui";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.identity}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en",
    title: `${site.name} | ${site.identity}`,
    description: site.description,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0d1b2e",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  alternateName: site.identity,
  url: site.url,
  slogan: site.tagline,
  description: site.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={organizationJsonLd} />
      </body>
    </html>
  );
}
