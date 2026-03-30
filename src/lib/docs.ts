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

type NavigationItem = {
  href: string
  label?: string
}

type NavigationGroup = {
  id: string
  title: string
  items: NavigationItem[]
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
const groupOrder = [
  "core",
  "fundamentals",
  "techniques",
  "security",
  "openapi",
  "graphql",
  "microservices",
  "websockets",
  "recipes",
  "cli",
  "faq",
  "devtools",
  "discover",
]

const localizedGroupTitles: Record<string, string> = {
  core: "Asosiy bo'lim",
  fundamentals: "Asosiy tushunchalar",
  techniques: "Usullar",
  security: "Xavfsizlik",
  openapi: "OpenAPI",
  graphql: "GraphQL",
  microservices: "Mikroxizmatlar",
  websockets: "WebSockets",
  recipes: "Retseptlar",
  cli: "CLI",
  faq: "FAQ",
  devtools: "Devtools",
  discover: "Discover",
}

const navigationConfig: NavigationGroup[] = [
  {
    id: "intro",
    title: "",
    items: [{ href: "/docs/core/introduction", label: "Kirish" }],
  },
  {
    id: "overview",
    title: "Umumiy ko'rinish",
    items: [
      { href: "/docs/core/first-steps", label: "Birinchi qadamlar" },
      { href: "/docs/core/controllers", label: "Kontrollerlar" },
      { href: "/docs/core/components", label: "Provayderlar" },
      { href: "/docs/core/modules", label: "Modullar" },
      { href: "/docs/core/middlewares", label: "Middleware" },
      { href: "/docs/core/exception-filters", label: "Exception filterlar" },
      { href: "/docs/core/pipes", label: "Pipe'lar" },
      { href: "/docs/core/guards", label: "Guard'lar" },
      { href: "/docs/core/interceptors", label: "Interceptor'lar" },
      { href: "/docs/core/custom-decorators", label: "Custom decoratorlar" },
    ],
  },
  {
    id: "fundamentals",
    title: "Asosiy tushunchalar",
    items: [
      { href: "/docs/fundamentals/dependency-injection", label: "Custom provayderlar" },
      { href: "/docs/fundamentals/async-components", label: "Asinxron provayderlar" },
      { href: "/docs/fundamentals/dynamic-modules", label: "Dinamik modullar" },
      { href: "/docs/fundamentals/provider-scopes", label: "Injection scope'lar" },
      { href: "/docs/fundamentals/circular-dependency", label: "Aylanma bog'liqlik" },
      { href: "/docs/fundamentals/module-reference", label: "Modul reference'i" },
      { href: "/docs/fundamentals/lazy-loading-modules", label: "Modullarni lazy-loading qilish" },
      { href: "/docs/fundamentals/execution-context", label: "Bajarilish konteksti" },
      { href: "/docs/fundamentals/lifecycle-events", label: "Lifecycle eventlar" },
      { href: "/docs/fundamentals/discovery-service", label: "Discovery xizmati" },
      { href: "/docs/fundamentals/platform-agnosticism", label: "Platformadan mustaqillik" },
      { href: "/docs/fundamentals/unit-testing", label: "Testlash" },
    ],
  },
  {
    id: "techniques",
    title: "Usullar",
    items: [
      { href: "/docs/techniques/configuration", label: "Konfiguratsiya" },
      { href: "/docs/techniques/sql", label: "Ma'lumotlar bazasi" },
      { href: "/docs/techniques/mongo", label: "Mongo" },
      { href: "/docs/techniques/validation", label: "Validatsiya" },
      { href: "/docs/techniques/caching", label: "Keshlash" },
      { href: "/docs/techniques/serialization", label: "Serializatsiya" },
      { href: "/docs/techniques/versioning", label: "Versiyalash" },
      { href: "/docs/techniques/task-scheduling", label: "Vazifalarni rejalashtirish" },
      { href: "/docs/techniques/queues", label: "Queue'lar" },
      { href: "/docs/techniques/logger", label: "Loglash" },
      { href: "/docs/techniques/cookies", label: "Cookie'lar" },
      { href: "/docs/techniques/events", label: "Eventlar" },
      { href: "/docs/techniques/compression", label: "Siqish" },
      { href: "/docs/techniques/file-upload", label: "Fayl yuklash" },
      { href: "/docs/techniques/streaming-files", label: "Fayllarni stream qilish" },
      { href: "/docs/techniques/http-module", label: "HTTP moduli" },
      { href: "/docs/techniques/sessions", label: "Sessiya" },
      { href: "/docs/techniques/mvc", label: "Model-View-Controller" },
      { href: "/docs/techniques/performance", label: "Unumdorlik (Fastify)" },
      { href: "/docs/techniques/server-sent-events", label: "Server-Sent Events" },
    ],
  },
  {
    id: "security",
    title: "Xavfsizlik",
    items: [
      { href: "/docs/security/authentication", label: "Autentifikatsiya" },
      { href: "/docs/security/authorization", label: "Avtorizatsiya" },
      { href: "/docs/security/encryption-hashing", label: "Shifrlash va hash qilish" },
      { href: "/docs/security/helmet", label: "Helmet" },
      { href: "/docs/security/cors", label: "CORS" },
      { href: "/docs/security/csrf", label: "CSRF himoyasi" },
      { href: "/docs/security/rate-limiting", label: "Rate limiting" },
    ],
  },
  {
    id: "graphql",
    title: "GraphQL",
    items: [
      { href: "/docs/graphql/quick-start", label: "Tezkor start" },
      { href: "/docs/graphql/resolvers-map", label: "Resolverlar" },
      { href: "/docs/graphql/mutations", label: "Mutatsiyalar" },
      { href: "/docs/graphql/subscriptions", label: "Subscriptionlar" },
      { href: "/docs/graphql/scalars", label: "Skalyarlar" },
      { href: "/docs/graphql/directives", label: "Direktivlar" },
      { href: "/docs/graphql/interfaces", label: "Interfeyslar" },
      { href: "/docs/graphql/unions-and-enums", label: "Unionlar va Enumlar" },
      { href: "/docs/graphql/field-middleware", label: "Field middleware" },
      { href: "/docs/graphql/mapped-types", label: "Mapped type'lar" },
      { href: "/docs/graphql/plugins", label: "Pluginlar" },
      { href: "/docs/graphql/complexity", label: "Murakkablik" },
      { href: "/docs/graphql/extensions", label: "Extensionlar" },
      { href: "/docs/graphql/cli-plugin", label: "CLI plagin" },
      { href: "/docs/graphql/schema-generator", label: "SDL generatsiya qilish" },
      { href: "/docs/graphql/sharing-models", label: "Modellarni ulashish" },
      { href: "/docs/graphql/guards-interceptors", label: "Boshqa imkoniyatlar" },
      { href: "/docs/graphql/federation", label: "Federatsiya" },
    ],
  },
  {
    id: "websockets",
    title: "WebSockets",
    items: [
      { href: "/docs/websockets/gateways", label: "Gatewaylar" },
      { href: "/docs/websockets/exception-filters", label: "Exception filterlar" },
      { href: "/docs/websockets/pipes", label: "Pipe'lar" },
      { href: "/docs/websockets/guards", label: "Guard'lar" },
      { href: "/docs/websockets/interceptors", label: "Interceptor'lar" },
      { href: "/docs/websockets/adapter", label: "Adapterlar" },
    ],
  },
  {
    id: "microservices",
    title: "Mikroxizmatlar",
    items: [
      { href: "/docs/microservices/basics", label: "Umumiy ko'rinish" },
      { href: "/docs/microservices/redis", label: "Redis" },
      { href: "/docs/microservices/mqtt", label: "MQTT" },
      { href: "/docs/microservices/nats", label: "NATS" },
      { href: "/docs/microservices/rabbitmq", label: "RabbitMQ" },
      { href: "/docs/microservices/kafka", label: "Kafka" },
      { href: "/docs/microservices/grpc", label: "gRPC" },
      { href: "/docs/microservices/custom-transport", label: "Custom transporterlar" },
      { href: "/docs/microservices/exception-filters", label: "Exception filterlar" },
      { href: "/docs/microservices/pipes", label: "Pipe'lar" },
      { href: "/docs/microservices/guards", label: "Guard'lar" },
      { href: "/docs/microservices/interceptors", label: "Interceptor'lar" },
    ],
  },
  {
    id: "deployment",
    title: "",
    items: [{ href: "/docs/core/deployment", label: "Deploy qilish" }],
  },
  {
    id: "standalone",
    title: "",
    items: [{ href: "/docs/core/application-context", label: "Standalone ilovalar" }],
  },
  {
    id: "cli",
    title: "CLI",
    items: [
      { href: "/docs/cli/overview", label: "Umumiy ko'rinish" },
      { href: "/docs/cli/workspaces", label: "Workspace'lar" },
      { href: "/docs/cli/libraries", label: "Kutubxonalar" },
      { href: "/docs/cli/usages", label: "Foydalanish" },
      { href: "/docs/cli/scripts", label: "Skriptlar" },
    ],
  },
  {
    id: "openapi",
    title: "OpenAPI",
    items: [
      { href: "/docs/openapi/introduction", label: "Kirish" },
      { href: "/docs/openapi/types-and-parameters", label: "Turlar va parametrlar" },
      { href: "/docs/openapi/operations", label: "Operatsiyalar" },
      { href: "/docs/openapi/security", label: "Xavfsizlik" },
      { href: "/docs/openapi/mapped-types", label: "Mapped type'lar" },
      { href: "/docs/openapi/decorators", label: "Decoratorlar" },
      { href: "/docs/openapi/cli-plugin", label: "CLI plagin" },
      { href: "/docs/openapi/other-features", label: "Boshqa imkoniyatlar" },
    ],
  },
  {
    id: "recipes",
    title: "Retseptlar",
    items: [
      { href: "/docs/recipes/repl", label: "REPL" },
      { href: "/docs/recipes/crud-generator", label: "CRUD generator" },
      { href: "/docs/recipes/swc", label: "SWC (fast compiler)" },
      { href: "/docs/recipes/passport", label: "Passport (auth)" },
      { href: "/docs/recipes/hot-reload", label: "Hot reload" },
      { href: "/docs/recipes/mikroorm", label: "MikroORM" },
      { href: "/docs/recipes/sql-typeorm", label: "TypeORM" },
      { href: "/docs/recipes/mongodb", label: "Mongoose" },
      { href: "/docs/recipes/sql-sequelize", label: "Sequelize" },
      { href: "/docs/recipes/router-module", label: "Router moduli" },
      { href: "/docs/openapi/introduction", label: "Swagger" },
      { href: "/docs/recipes/terminus", label: "Health checklar" },
      { href: "/docs/recipes/cqrs", label: "CQRS" },
      { href: "/docs/recipes/documentation", label: "Compodoc" },
      { href: "/docs/recipes/prisma", label: "Prisma" },
      { href: "/docs/recipes/sentry", label: "Sentry" },
      { href: "/docs/recipes/serve-static", label: "Statik fayllarni uzatish" },
      { href: "/docs/recipes/nest-commander", label: "Commander" },
      { href: "/docs/recipes/async-local-storage", label: "Async Local Storage" },
      { href: "/docs/recipes/necord", label: "Necord" },
      { href: "/docs/recipes/suites", label: "Suites (Automock)" },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    items: [
      { href: "/docs/faq/serverless", label: "Serverless" },
      { href: "/docs/faq/http-adapter", label: "HTTP adapter" },
      { href: "/docs/faq/keep-alive-connections", label: "Keep-Alive ulanishlari" },
      { href: "/docs/faq/global-prefix", label: "Global prefiks" },
      { href: "/docs/faq/raw-body", label: "Raw body" },
      { href: "/docs/faq/hybrid-application", label: "Gibrid ilova" },
      { href: "/docs/faq/multiple-servers", label: "HTTPS & multiple servers" },
      { href: "/docs/faq/request-lifecycle", label: "So'rov hayotiy sikli" },
      { href: "/docs/faq/errors", label: "Keng tarqalgan xatolar" },
    ],
  },
  {
    id: "devtools",
    title: "Devtools",
    items: [
      { href: "/docs/devtools/overview", label: "Umumiy ko'rinish" },
      { href: "/docs/devtools/ci-cd", label: "CI/CD integratsiyasi" },
    ],
  },
  {
    id: "migration",
    title: "",
    items: [{ href: "/docs/core/migration", label: "Migratsiya qo'llanmasi" }],
  },
  {
    id: "discover",
    title: "Discover",
    items: [{ href: "/docs/discover/who-uses", label: "Nest'dan kimlar foydalanadi?" }],
  },
]

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
    groupTitle: localizedGroupTitles[group] ?? data.groupTitle ?? titleFromSegment(group),
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

    const leftGroupIndex = groupOrder.indexOf(left.group)
    const rightGroupIndex = groupOrder.indexOf(right.group)

    if (leftGroupIndex !== -1 || rightGroupIndex !== -1) {
      if (leftGroupIndex === -1) {
        return 1
      }

      if (rightGroupIndex === -1) {
        return -1
      }

      return leftGroupIndex - rightGroupIndex
    }

    return left.group.localeCompare(right.group)
  })
}

let docsCache: DocPage[] | null = null
let docsGroupsCache: DocGroup[] | null = null

function buildNavigationFromDocs(pages: DocPage[]) {
  const docsByHref = new Map(pages.map((page) => [page.href, page]))
  const usedHrefs = new Set<string>()
  const groups: DocGroup[] = []
  const orderedDocs: DocPage[] = []

  for (const section of navigationConfig) {
    const sectionPages = section.items
      .map((item) => {
        const page = docsByHref.get(item.href)
        if (!page) {
          return null
        }

        usedHrefs.add(page.href)
        return item.label ? { ...page, navTitle: item.label } : page
      })
      .filter((page): page is DocPage => Boolean(page))

    if (sectionPages.length === 0) {
      continue
    }

    groups.push({
      id: section.id,
      title: section.title,
      pages: sectionPages,
    })

    orderedDocs.push(...sectionPages)
  }

  const leftovers = pages.filter((page) => !usedHrefs.has(page.href))
  if (leftovers.length > 0) {
    const leftoverGroups = leftovers.reduce<DocGroup[]>((acc, page) => {
      const existing = acc.find((group) => group.id === page.group)
      if (existing) {
        existing.pages.push(page)
        return acc
      }

      acc.push({
        id: page.group,
        title: page.groupTitle,
        pages: [page],
      })
      return acc
    }, [])

    groups.push(...leftoverGroups)
    orderedDocs.push(...leftovers)
  }

  return { groups, orderedDocs }
}

export function getAllDocs() {
  if (!docsCache) {
    const sourceDocs = sortDocs(getMarkdownFiles(contentRoot).map(createDocPage))
    const navigation = buildNavigationFromDocs(sourceDocs)
    docsCache = navigation.orderedDocs
    docsGroupsCache = navigation.groups
  }

  return docsCache
}

export function getDocGroups(): DocGroup[] {
  getAllDocs()
  return docsGroupsCache ?? []
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
