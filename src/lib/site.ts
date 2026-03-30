export const siteConfig = {
  name: "Atlas Docs",
  description: "Minimal markdown-driven documentation workspace built with Next.js and shadcn.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
}

export function buildOgImageUrl(input?: {
  title?: string
  description?: string
  eyebrow?: string
  tags?: string[]
}) {
  const params = new URLSearchParams()

  if (input?.title) {
    params.set("title", input.title)
  }

  if (input?.description) {
    params.set("description", input.description)
  }

  if (input?.eyebrow) {
    params.set("eyebrow", input.eyebrow)
  }

  if (input?.tags?.length) {
    params.set("tags", input.tags.join(","))
  }

  return params.size > 0 ? `/api/og?${params.toString()}` : "/opengraph-image"
}
