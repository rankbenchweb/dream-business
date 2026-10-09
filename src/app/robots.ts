import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Keep the whole site out of search engines until a production domain is set.
  const isProduction = !!process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: isProduction ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/staff", "/auth", "/sign-in"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
