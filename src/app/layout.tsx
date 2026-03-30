import type { Metadata } from "next"
import { Geist_Mono, Poppins } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { buildOgImageUrl, siteConfig } from "@/lib/site"
import "./globals.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  manifest: "/manifest.webmanifest",
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon-a-monogram.svg",
    shortcut: "/favicon-a-monogram.svg",
    apple: "/favicon-a-monogram.svg",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: buildOgImageUrl({
          title: "Minimal docs workspace",
          description: "Markdown-driven navigation, clean reading layout, and polished code blocks for technical documentation.",
          eyebrow: siteConfig.name,
          tags: ["Next.js", "Markdown", "Dark UI"],
        }),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      buildOgImageUrl({
        title: "Minimal docs workspace",
        description: "Markdown-driven navigation, clean reading layout, and polished code blocks for technical documentation.",
        eyebrow: siteConfig.name,
        tags: ["Next.js", "Markdown", "Dark UI"],
      }),
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
