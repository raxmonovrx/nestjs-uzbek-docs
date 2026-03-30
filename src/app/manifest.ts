import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Atlas",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#212121",
    theme_color: "#212121",
    icons: [
      {
        src: "/favicon-a-monogram.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon-docs-page.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
