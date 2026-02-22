import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/student/"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/student/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/student/"],
      },
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/student/"],
      },
    ],
    sitemap: "https://aameaesthetics.com/sitemap.xml",
  };
}
