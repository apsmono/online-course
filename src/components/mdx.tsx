import type { ComponentPropsWithoutRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { Callout } from "./callout";
import { Quiz, type QuizProps } from "./quiz";
import type { Locale } from "@/lib/i18n";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
  defaultLang: "plaintext",
};

function Anchor({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) return <Link href={href} {...props} />;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
}

function MdxImage({ src, alt = "", ...props }: ComponentPropsWithoutRef<"img">) {
  if (typeof src !== "string") return null;
  // Remote or unsized images fall back to a plain <img>; the CSS keeps them responsive.
  // eslint-disable-next-line @next/next/no-img-element -- remote images have no known dimensions
  if (!src.startsWith("/")) return <img src={src} alt={alt} loading="lazy" {...props} />;
  return <Image src={src} alt={alt} width={1200} height={675} sizes="(max-width: 768px) 100vw, 768px" />;
}

export function mdxComponents(locale: Locale) {
  return {
    a: Anchor,
    img: MdxImage,
    Callout,
    Quiz: (props: Omit<QuizProps, "locale">) => <Quiz locale={locale} {...props} />,
  };
}

export function MdxContent({ source, locale }: { source: string; locale: Locale }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents(locale)}
      options={{
        parseFrontmatter: false,
        // Lessons are authored in this repo, not submitted by users, so JSX
        // expression props (e.g. the Quiz `choices` array) are allowed. Without
        // this, next-mdx-remote strips every expression attribute.
        blockJS: false,
        blockDangerousJS: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, prettyCodeOptions],
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: { className: ["heading-anchor"], ariaHidden: true, tabIndex: -1 },
                content: { type: "text", value: "#" },
              },
            ],
          ],
        },
      }}
    />
  );
}
