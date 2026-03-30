import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"
import { OgImageTemplate } from "@/components/og-image-template"
import { getDocBySlug } from "@/lib/docs"

type DocsImageProps = {
  params: Promise<{
    group: string
    slug: string
  }>
}

export const alt = "Atlas Docs article preview"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default async function TwitterImage({ params }: DocsImageProps) {
  const { group, slug } = await params
  const page = getDocBySlug([group, slug])

  if (!page) {
    notFound()
  }

  return new ImageResponse(
    <OgImageTemplate
      title={page.title}
      description={page.description || "Technical documentation page"}
      eyebrow={page.groupTitle}
      tags={page.tags}
    />,
    size
  )
}
