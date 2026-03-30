import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DocsPageShell } from "@/components/docs-page-shell"
import { getAllDocs, getDocBySlug, getDocGroups } from "@/lib/docs"
import { siteConfig } from "@/lib/site"

type DocsPageProps = {
  params: Promise<{
    group: string
    slug: string
  }>
}

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({
    group: doc.slug[0],
    slug: doc.slug[1],
  }))
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { group, slug } = await params
  const page = getDocBySlug([group, slug])

  if (!page) {
    return {}
  }

  const title = page.title
  const description = page.description || siteConfig.description

  return {
    title,
    description,
    keywords: page.tags,
    alternates: {
      canonical: page.href,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: page.href,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { group, slug } = await params
  const page = getDocBySlug([group, slug])

  if (!page) {
    notFound()
  }

  return <DocsPageShell page={page} groups={getDocGroups()} />
}
