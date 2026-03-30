import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/site"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#212121",
          color: "#f5f5f5",
          padding: "56px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            borderRadius: 32,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            height: "100%",
            width: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#d4d4d4",
              fontSize: 28,
              fontWeight: 500,
            }}
          >
            <div
              style={{
                display: "flex",
                height: 52,
                width: 52,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#181818",
                color: "#fb7185",
                fontWeight: 700,
              }}
            >
              A
            </div>
            <div>{siteConfig.name}</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 880,
            }}
          >
            <div
              style={{
                fontSize: 82,
                lineHeight: 1.02,
                fontWeight: 700,
                letterSpacing: "-0.05em",
              }}
            >
              Minimal docs workspace
            </div>
            <div
              style={{
                fontSize: 34,
                lineHeight: 1.35,
                color: "#b3b3b3",
                maxWidth: 840,
              }}
            >
              Markdown-driven navigation, clean reading layout, and polished code blocks for
              technical documentation.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#a3a3a3",
              fontSize: 26,
            }}
          >
            <div>Next.js</div>
            <div style={{ color: "#525252" }}>•</div>
            <div>Markdown</div>
            <div style={{ color: "#525252" }}>•</div>
            <div>Dark UI</div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
