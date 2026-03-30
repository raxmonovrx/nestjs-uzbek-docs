import { ImageResponse } from "next/og"
import { OgImageTemplate } from "@/components/og-image-template"
import { siteConfig } from "@/lib/site"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") || siteConfig.name
  const description = searchParams.get("description") || siteConfig.description
  const eyebrow = searchParams.get("eyebrow") || "Documentation"
  const tags = searchParams
    .get("tags")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean) ?? []

  return new ImageResponse(
    <OgImageTemplate
      title={title}
      description={description}
      eyebrow={eyebrow}
      tags={tags}
    />,
    {
      width: 1200,
      height: 630,
    }
  )
}
