import fs from "node:fs"
import path from "node:path"

const projectRoot = process.cwd()
const sourceRoot = path.join(projectRoot, "..", "docs.nestjs.com-uzbek", "content")
const destRoot = path.join(projectRoot, "content")

const skippedFiles = new Set(["enterprise.md", "support.md"])

const groupTitles = {
  core: "Core",
  cli: "CLI",
  faq: "FAQ",
  graphql: "GraphQL",
  openapi: "OpenAPI",
  websockets: "WebSockets",
  microservices: "Microservices",
  fundamentals: "Fundamentals",
  techniques: "Techniques",
  recipes: "Recipes",
  security: "Security",
  devtools: "Devtools",
  discover: "Discover",
}

function titleFromSegment(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function yamlQuote(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

function getMarkdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return getMarkdownFiles(fullPath)
    }

    return entry.name.endsWith(".md") ? [fullPath] : []
  })
}

function getDocInfo(relativePath) {
  const withoutExt = relativePath.replace(/\.md$/, "")
  const parts = withoutExt.split("/")

  if (parts.length === 1) {
    return {
      group: "core",
      slug: parts[0],
      href: `/docs/core/${parts[0]}`,
    }
  }

  return {
    group: parts[0],
    slug: parts[1],
    href: `/docs/${parts[0]}/${parts[1]}`,
  }
}

function cleanTitle(value) {
  return value
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function stripInlineFormatting(value) {
  return value
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/_/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function extractTitle(markdown, fallback) {
  const lines = markdown.split("\n")
  let inFence = false

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence
      continue
    }

    if (inFence) {
      continue
    }

    const match = line.match(/^#{1,6}\s+(.+)$/)
    if (match) {
      return cleanTitle(match[1]) || fallback
    }
  }

  return fallback
}

function removeFirstHeading(markdown) {
  const lines = markdown.split("\n")
  let inFence = false
  let removed = false
  const nextLines = []

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence
      nextLines.push(line)
      continue
    }

    if (!removed && !inFence && /^#{1,6}\s+/.test(line)) {
      removed = true
      continue
    }

    nextLines.push(line)
  }

  return nextLines.join("\n").replace(/^\s+/, "")
}

function normalizeInternalDocHref(rawHref, currentRelativePath, routeMap) {
  if (!rawHref || rawHref === "#" || rawHref === "todo") {
    return null
  }

  if (rawHref.startsWith("mailto:")) {
    return null
  }

  let pathname = rawHref
  let hash = ""

  const hashIndex = rawHref.indexOf("#")
  if (hashIndex >= 0) {
    pathname = rawHref.slice(0, hashIndex)
    hash = rawHref.slice(hashIndex)
  }

  if (pathname.startsWith("https://docs.nestjs.com")) {
    pathname = new URL(pathname).pathname
  } else if (/^https?:\/\//i.test(pathname)) {
    return null
  }

  if (pathname === "") {
    return hash || null
  }

  const directPath = pathname.replace(/^\/+/, "").replace(/\.md$/, "")
  const directTarget = routeMap.get(directPath)
  if (directTarget) {
    return `${directTarget}${hash}`
  }

  let normalizedPath

  if (pathname.startsWith("/")) {
    normalizedPath = pathname.replace(/^\/+/, "")
  } else {
    const currentWithoutExt = currentRelativePath.replace(/\.md$/, "")
    normalizedPath = path.posix.normalize(
      path.posix.join(path.posix.dirname(currentWithoutExt), pathname)
    )
  }

  normalizedPath = normalizedPath.replace(/^\/+/, "").replace(/\.md$/, "")

  const target = routeMap.get(normalizedPath)
  if (!target) {
    return null
  }

  return `${target}${hash}`
}

function transformMarkdownLinks(line, currentRelativePath, routeMap) {
  return line.replace(/(!?)\[([^\]]+)\]\(([^)\s]+)(?:\s+['"][^'"]*['"])?\)/g, (_, bang, label, href) => {
    const normalizedHref = normalizeInternalDocHref(href, currentRelativePath, routeMap)

    if (bang) {
      return ""
    }

    if (normalizedHref) {
      return `[${label}](${normalizedHref})`
    }

    return label
  })
}

function transformHtmlAnchors(line, currentRelativePath, routeMap) {
  return line.replace(/<a\s+[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/g, (_, href, inner) => {
    const normalizedHref = normalizeInternalDocHref(href, currentRelativePath, routeMap)

    if (normalizedHref) {
      return `<a href="${normalizedHref}">${inner}</a>`
    }

    return inner
  })
}

function cleanupContent(markdown, currentRelativePath, routeMap) {
  let next = markdown.replace(/\r\n/g, "\n")

  if (currentRelativePath === "deployment.md") {
    next = next.replace(/\n#### Mau bilan oson deploy[\s\S]*$/m, "")
  }

  next = next
    .replace(/<figure[\s\S]*?<\/figure>/g, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/g, "")
    .replace(/<img[^>]*\/?>/g, "")
    .replace(/<app-banner[^>]*><\/app-banner[^>]*>/g, "")
    .replace(/<app-banner[^>]*\/?>/g, "")

  const lines = next.split("\n")
  const cleanedLines = []
  let inFence = false

  for (let line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence
      cleanedLines.push(line)
      continue
    }

    if (!inFence) {
      if (
        line.includes("mau.nestjs.com") ||
        line.includes("@nestjs/mau") ||
        line.includes("mau deploy") ||
        /\bMau\b/.test(line)
      ) {
        continue
      }

      line = transformHtmlAnchors(line, currentRelativePath, routeMap)
      line = transformMarkdownLinks(line, currentRelativePath, routeMap)
    }

    cleanedLines.push(line)
  }

  return cleanedLines
    .join("\n")
    .replace(/\n>\s*\n>\s*```bash\n>\s*```\n>\s*\n>.*(?:\n|$)/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function extractDescription(markdown) {
  const lines = markdown.split("\n")
  let inFence = false
  let currentParagraph = []

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence
      continue
    }

    if (inFence) {
      continue
    }

    const trimmed = line.trim()
    if (!trimmed) {
      if (currentParagraph.length > 0) {
        break
      }
      continue
    }

    if (
      trimmed.startsWith(">") ||
      trimmed.startsWith("|") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      /^\d+\.\s/.test(trimmed) ||
      trimmed.startsWith("<") ||
      trimmed.startsWith("```") ||
      trimmed.startsWith("@@")
    ) {
      if (currentParagraph.length > 0) {
        break
      }
      continue
    }

    currentParagraph.push(trimmed)
  }

  const description = stripInlineFormatting(currentParagraph.join(" "))
  return description.slice(0, 180)
}

const relativeFiles = getMarkdownFiles(sourceRoot)
  .map((filePath) => path.relative(sourceRoot, filePath).replace(/\\/g, "/"))
  .filter((relativePath) => !skippedFiles.has(relativePath))
  .sort()

const routeMap = new Map(
  relativeFiles.map((relativePath) => {
    const info = getDocInfo(relativePath)
    return [relativePath.replace(/\.md$/, ""), info.href]
  })
)

const groupOrders = new Map()

fs.rmSync(destRoot, { recursive: true, force: true })
fs.mkdirSync(destRoot, { recursive: true })

for (const relativePath of relativeFiles) {
  const sourceFilePath = path.join(sourceRoot, relativePath)
  const info = getDocInfo(relativePath)
  const groupTitle = groupTitles[info.group] ?? titleFromSegment(info.group)
  const order = (groupOrders.get(info.group) ?? 0) + 1
  groupOrders.set(info.group, order)

  const raw = fs.readFileSync(sourceFilePath, "utf8")
  const fallbackTitle = titleFromSegment(info.slug)
  const extractedTitle = extractTitle(raw, fallbackTitle)
  const cleanedContent = cleanupContent(raw, relativePath, routeMap)
  const withoutFirstHeading = removeFirstHeading(cleanedContent)
  const description = extractDescription(withoutFirstHeading)

  const frontmatter = [
    "---",
    `title: ${yamlQuote(extractedTitle)}`,
    `navTitle: ${yamlQuote(extractedTitle)}`,
    description ? `description: ${yamlQuote(description)}` : null,
    `order: ${order}`,
    `group: ${info.group}`,
    `groupTitle: ${yamlQuote(groupTitle)}`,
    "---",
    "",
  ].join("\n")

  const destinationDir = path.join(destRoot, info.group)
  fs.mkdirSync(destinationDir, { recursive: true })
  fs.writeFileSync(
    path.join(destinationDir, `${info.slug}.md`),
    `${frontmatter}${withoutFirstHeading}\n`
  )
}

console.log(`Imported ${relativeFiles.length} Nest docs into ${destRoot}`)
