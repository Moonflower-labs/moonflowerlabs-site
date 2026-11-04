import type { MetaDescriptor } from "react-router";

const SITE_URL = "https://moonflowerlabs.vercel.app";

type BuildMetaOptions = {
  path: string;
  title: string;
  description: string;
};

export function buildMeta({ path, title, description }: BuildMetaOptions): MetaDescriptor[] {
  const url = new URL(path, SITE_URL).href;
  const image = new URL("/og-image.png", SITE_URL).href;

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: "Moonflower Labs" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Moonflower Labs: software built for your business." },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}
