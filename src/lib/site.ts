export const siteConfig = {
  name: "Course",
  domain: "course.apsmono.com",
  /** Override per environment; Vercel exposes VERCEL_PROJECT_PRODUCTION_URL on deploys. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://course.apsmono.com"),
} as const;

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteConfig.url).toString();
}
