import type { MetadataRoute } from "next";
import { getAllLessons, getTags, getTracks, tagSlug } from "@/lib/content";
import { locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push(
      { url: absoluteUrl(`/${locale}`), changeFrequency: "weekly", priority: 1 },
      { url: absoluteUrl(`/${locale}/learn`), changeFrequency: "weekly", priority: 0.9 },
      { url: absoluteUrl(`/${locale}/topics`), changeFrequency: "monthly", priority: 0.5 },
    );

    for (const track of getTracks(locale)) {
      entries.push({
        url: absoluteUrl(`/${locale}/learn/${track.slug}`),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const lesson of getAllLessons(locale)) {
      entries.push({
        url: absoluteUrl(lesson.href),
        lastModified: lesson.updated ? new Date(lesson.updated) : undefined,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const { tag } of getTags(locale)) {
      entries.push({
        url: absoluteUrl(`/${locale}/topics/${tagSlug(tag)}`),
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  }

  return entries;
}
