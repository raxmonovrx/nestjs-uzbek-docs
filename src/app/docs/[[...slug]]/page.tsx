import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DocsPageShell } from "@/components/docs-page-shell"
import { getAllDocs, getDocBySlug, getDocGroups, getFirstDoc } from "@/lib/docs"
import { siteConfig } from "@/lib/site"

type DocsPageProps = {
  params: Promise<{
    slug?: string[]
  }>
}

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({
    slug: doc.slug,
  }))
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = await params
  const targetSlug = slug ?? getFirstDoc()?.slug

  if (!targetSlug) {
    return {}
  }

  const page = getDocBySlug(targetSlug)
  if (!page) {
    return {}
  }

  const title = page.title
  const description = page.description || siteConfig.description

  return {
    title,
    description,
    keywords: page.tags,
    openGraph: {
      title,
      description,
      type: "article",
      url: page.href,
      siteName: siteConfig.name,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params
  const targetSlug = slug ?? getFirstDoc()?.slug

  if (!targetSlug) {
    notFound()
  }

  const page = getDocBySlug(targetSlug)
  if (!page) {
    notFound()
  }

  return <DocsPageShell page={page} groups={getDocGroups()} />
}
