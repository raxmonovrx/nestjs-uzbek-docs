import { OgImageTemplate } from '@/components/og-image-template'
import { siteConfig } from '@/lib/site'
import { ImageResponse } from 'next/og'

export const alt = siteConfig.name

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <OgImageTemplate
      title="Minimal docs workspace"
      description="Markdown-driven navigation, clean reading layout, and polished code blocks for technical documentation."
      eyebrow={siteConfig.name}
      tags={['NestJS', 'Markdown', 'Farruxbek Raxmonov']}
    />,
    size
  )
}
