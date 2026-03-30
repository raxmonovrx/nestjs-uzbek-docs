type OgImageTemplateProps = {
  title: string
  description: string
  eyebrow?: string
  tags?: string[]
}

export function OgImageTemplate({
  title,
  description,
  eyebrow = 'Documentation',
  tags = [],
}: OgImageTemplateProps) {
  const visibleTags = tags.slice(0, 3)

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        background: '#212121',
        color: '#f5f5f5',
        padding: '48px',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 24,
          borderRadius: 32,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: '#d4d4d4',
              fontSize: 28,
              fontWeight: 500,
            }}
          >
            <div
              style={{
                display: 'flex',
                height: 52,
                width: 52,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.12)',
                background: '#181818',
                color: '#fb7185',
                fontWeight: 700,
              }}
            >
              N
            </div>
            <div>NestJS Uzbek Docs</div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid rgba(251,113,133,0.22)',
              background: 'rgba(251,113,133,0.08)',
              color: '#fda4af',
              padding: '10px 18px',
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: title.length > 42 ? 66 : 76,
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: '-0.05em',
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: '#b3b3b3',
              maxWidth: 920,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              color: '#a3a3a3',
              fontSize: 24,
            }}
          >
            <div>Next.js</div>
            <div style={{ color: '#525252' }}>•</div>
            <div>Markdown</div>
            <div style={{ color: '#525252' }}>•</div>
            <div>Dark UI</div>
          </div>

          {visibleTags.length > 0 ? (
            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              {visibleTags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 999,
                    background: '#181818',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '10px 16px',
                    color: '#d4d4d4',
                    fontSize: 20,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
