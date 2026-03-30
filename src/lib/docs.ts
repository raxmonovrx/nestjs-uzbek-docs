import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { slugifyHeading } from "@/lib/slugify"

export type DocHeading = {
  id: string
  depth: number
  text: string
}

export type DocPage = {
  id: string
  title: string
  navTitle: string
  description: string
  order: number
  group: string
  groupTitle: string
  tags: string[]
  slug: string[]
  href: string
  body: string
  headings: DocHeading[]
  readingMinutes: number
}

export type DocGroup = {
  id: string
  title: string
  pages: DocPage[]
}

type Frontmatter = {
  title?: string
  navTitle?: string
  description?: string
  order?: number
  group?: string
  groupTitle?: string
  tags?: string[]
}

const contentRoot = path.join(process.cwd(), "content")

function titleFromSegment(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return getMarkdownFiles(fullPath)
    }

    return entry.name.endsWith(".md") ? [fullPath] : []
  })
}

function parseHeadings(markdown: string): DocHeading[] {
  return markdown
    .split("\n")
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      depth: match[1].length,
      text: match[2].replace(/`/g, "").trim(),
      id: slugifyHeading(match[2]),
    }))
}

function readingMinutes(markdown: string) {
  const wordCount = markdown.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(wordCount / 190))
}

function createDocPage(filePath: string): DocPage {
  const raw = fs.readFileSync(filePath, "utf8")
  const parsed = matter(raw)
  const data = parsed.data as Frontmatter
  const relativePath = path.relative(contentRoot, filePath).replace(/\\/g, "/")
  const slug = relativePath.replace(/\.md$/, "").split("/")
  const group = data.group ?? slug[0] ?? "general"
  const title = data.title ?? titleFromSegment(slug.at(-1) ?? "untitled")

  return {
    id: slug.join("/"),
    title,
    navTitle: data.navTitle ?? title,
    description: data.description ?? "",
    order: data.order ?? 999,
    group,
    groupTitle: data.groupTitle ?? titleFromSegment(group),
    tags: data.tags ?? [],
    slug,
    href: `/docs/${slug.join("/")}`,
    body: parsed.content,
    headings: parseHeadings(parsed.content),
    readingMinutes: readingMinutes(parsed.content),
  }
}

function sortDocs(pages: DocPage[]) {
  return pages.sort((left, right) => {
    if (left.group === right.group) {
      return left.order - right.order || left.title.localeCompare(right.title)
    }

    return left.group.localeCompare(right.group)
  })
}

let docsCache: DocPage[] | null = null

export function getAllDocs() {
  if (!docsCache) {
    docsCache = sortDocs(getMarkdownFiles(contentRoot).map(createDocPage))
  }

  return docsCache
}

export function getDocGroups(): DocGroup[] {
  return getAllDocs().reduce<DocGroup[]>((groups, page) => {
    const existing = groups.find((group) => group.id === page.group)
    if (existing) {
      existing.pages.push(page)
      return groups
    }

    groups.push({
      id: page.group,
      title: page.groupTitle,
      pages: [page],
    })

    return groups
  }, [])
}

export function getDocBySlug(slug: string[]) {
  const target = slug.join("/")
  return getAllDocs().find((doc) => doc.slug.join("/") === target) ?? null
}

export function getFirstDoc() {
  return getAllDocs()[0] ?? null
}

export function getAdjacentDocs(href: string) {
  const docs = getAllDocs()
  const index = docs.findIndex((doc) => doc.href === href)

  return {
    previous: index > 0 ? docs[index - 1] : null,
    next: index >= 0 && index < docs.length - 1 ? docs[index + 1] : null,
  }
}

export function getBreadcrumbs(doc: DocPage) {
  return [
    {
      title: doc.groupTitle,
      href: undefined,
    },
    {
      title: doc.title,
      href: doc.href,
    },
  ]
}
