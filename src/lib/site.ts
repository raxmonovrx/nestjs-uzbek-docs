function normalizeUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "")

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  return `https://${trimmed}`
}

function resolveSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (explicitUrl) {
    return normalizeUrl(explicitUrl)
  }

  const vercelProductionUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL

  if (vercelProductionUrl) {
    return normalizeUrl(vercelProductionUrl)
  }

  return "http://localhost:3000"
}

export const siteConfig = {
  name: "Atlas Docs",
  description: "Minimal markdown-driven documentation workspace built with Next.js and shadcn.",
  url: resolveSiteUrl(),
}
