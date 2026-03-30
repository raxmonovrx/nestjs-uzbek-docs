import { ImageResponse } from "next/og"
import { OgImageTemplate } from "@/components/og-image-template"
import { siteConfig } from "@/lib/site"

export const alt = siteConfig.name

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function TwitterImage() {
  return new ImageResponse(
    <OgImageTemplate
      title="Minimal docs workspace"
      description="Markdown-driven navigation, clean reading layout, and polished code blocks for technical documentation."
      eyebrow={siteConfig.name}
      tags={["Next.js", "Markdown", "Dark UI"]}
    />,
    size
  )
}
