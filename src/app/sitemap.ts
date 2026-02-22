import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SAMPLE_COURSES } from "@/lib/sample-data";
import { slugify } from "@/lib/seo";

const SITE_URL = "https://aameaesthetics.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  const courses = data && data.length > 0 ? data : SAMPLE_COURSES;

  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${SITE_URL}/courses/${slugify(course.title)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/schedule`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/specials`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...coursePages,
  ];
}
