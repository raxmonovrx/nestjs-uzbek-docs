'use client'

import { Braces, Check, Copy, Database, FileCode2, FileJson2, TerminalSquare } from 'lucide-react'
import * as React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type CodeBlockProps = {
  code: string
  language?: string
}

type CodeVariant = {
  code: string
  filename?: string
  language: string
  label: string
}

const languageAliases: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
}

const atlasCodeTheme = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background: 'transparent',
    color: '#e5e7eb',
    textShadow: 'none',
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    background: 'transparent',
    color: '#e5e7eb',
    textShadow: 'none',
  },
  comment: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  prolog: {
    color: '#6b7280',
  },
  doctype: {
    color: '#6b7280',
  },
  cdata: {
    color: '#6b7280',
  },
  punctuation: {
    color: '#a1a1aa',
  },
  property: {
    color: '#fda4af',
  },
  tag: {
    color: '#fda4af',
  },
  boolean: {
    color: '#fda4af',
  },
  number: {
    color: '#f5c2e7',
  },
  constant: {
    color: '#f5c2e7',
  },
  symbol: {
    color: '#f5c2e7',
  },
  deleted: {
    color: '#fda4af',
  },
  selector: {
    color: '#86efac',
  },
  'attr-name': {
    color: '#f9a8d4',
  },
  string: {
    color: '#86efac',
  },
  char: {
    color: '#86efac',
  },
  builtin: {
    color: '#93c5fd',
  },
  inserted: {
    color: '#86efac',
  },
  operator: {
    color: '#c4b5fd',
  },
  entity: {
    color: '#c4b5fd',
    cursor: 'help',
  },
  url: {
    color: '#93c5fd',
  },
  atrule: {
    color: '#f9a8d4',
  },
  keyword: {
    color: '#f9a8d4',
  },
  'class-name': {
    color: '#93c5fd',
  },
  function: {
    color: '#7dd3fc',
  },
  regex: {
    color: '#fdba74',
  },
  important: {
    color: '#f9a8d4',
    fontWeight: '600',
  },
  variable: {
    color: '#f8fafc',
  },
}

function normalizeLanguage(language?: string) {
  if (!language) {
    return 'text'
  }

  const normalized = language.toLowerCase()
  return languageAliases[normalized] ?? normalized
}

function getLanguageLabel(language: string) {
  if (language === 'text') {
    return 'Plain text'
  }

  if (language === 'typescript') {
    return 'TypeScript'
  }

  if (language === 'javascript') {
    return 'JavaScript'
  }

  if (language === 'bash') {
    return 'Terminal'
  }

  if (language === 'json') {
    return 'JSON'
  }

  if (language === 'yaml') {
    return 'YAML'
  }

  return language.charAt(0).toUpperCase() + language.slice(1)
}

function LanguageIcon({ language, className }: { language: string; className?: string }) {
  if (language === 'typescript' || language === 'javascript') {
    return <FileCode2 className={className} />
  }

  if (language === 'bash') {
    return <TerminalSquare className={className} />
  }

  if (language === 'json') {
    return <FileJson2 className={className} />
  }

  if (language === 'sql') {
    return <Database className={className} />
  }

  return <Braces className={className} />
}

function getAlternateLanguage(language: string) {
  if (language === 'typescript' || language === 'tsx') {
    return 'javascript'
  }

  return language
}

function parseCodeVariants(code: string, language: string): CodeVariant[] {
  const lines = code.replace(/\r\n/g, '\n').split('\n')
  const variants: Array<{ lines: string[]; filename?: string }> = [{ lines: [] }]

  for (const line of lines) {
    const filenameMatch = line.match(/^@@filename(?:\((.*)\))?$/)
    if (filenameMatch) {
      const filename = filenameMatch[1]?.trim()
      variants[variants.length - 1].filename = filename || undefined
      continue
    }

    if (line.trim() === '@@switch') {
      variants.push({ lines: [] })
      continue
    }

    variants[variants.length - 1].lines.push(line)
  }

  const cleaned = variants
    .map((variant, index) => {
      const variantLanguage = index === 0 ? language : getAlternateLanguage(language)
      return {
        code: variant.lines.join('\n').replace(/^\n+|\n+$/g, ''),
        filename: variant.filename,
        language: variantLanguage,
        label: getLanguageLabel(variantLanguage),
      }
    })
    .filter((variant) => variant.code.length > 0)

  return cleaned.length > 0
    ? cleaned
    : [
        {
          code,
          language,
          label: getLanguageLabel(language),
        },
      ]
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const normalizedLanguage = normalizeLanguage(language)
  const variants = React.useMemo(
    () => parseCodeVariants(code, normalizedLanguage),
    [code, normalizedLanguage]
  )
  const [activeIndex, setActiveIndex] = React.useState(0)
  const activeVariant = variants[Math.min(activeIndex, variants.length - 1)] ?? variants[0]
  const languageLabel = activeVariant.label

  React.useEffect(() => {
    setActiveIndex(0)
  }, [code, normalizedLanguage])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeVariant.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="my-6 overflow-hidden rounded-3xl border border-white/10 bg-[#181818] ">
      <div className="sticky top-0 z-10 bg-[#181818]/96 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 md:px-5">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center text-sm font-medium text-slate-100">
              <LanguageIcon
                language={activeVariant.language}
                className="mr-2.5 size-4 shrink-0 text-slate-500"
              />
              <span className="truncate text-sm text-slate-300">{languageLabel}</span>
            </div>
            {activeVariant.filename ? (
              <div className="mt-0.5 truncate pl-[1.625rem] text-xs text-slate-500">
                {activeVariant.filename}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {variants.length > 1 ? (
              <div className="hidden rounded-full border border-white/8 bg-white/[0.03] p-0.5 sm:flex">
                {variants.map((variant, index) => (
                  <button
                    key={`${variant.label}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={
                      index === activeIndex
                        ? 'rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-100'
                        : 'rounded-full px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-300'
                    }
                  >
                    {variant.label}
                  </button>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy code"
              className="inline-flex size-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/8 hover:text-slate-100"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>
        <div className="mx-4 h-px bg-white/6 md:mx-5" />
      </div>

      <SyntaxHighlighter
        language={activeVariant.language}
        style={atlasCodeTheme}
        showLineNumbers
        wrapLongLines={false}
        customStyle={{
          margin: 0,
          padding: '0.6rem 1rem 1rem 0.75rem',
          background: 'transparent',
          fontSize: '13px',
          lineHeight: '1.7',
          overflowX: 'auto',
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          },
        }}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '0.9rem',
          marginRight: '0.9rem',
          color: '#64748b',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          userSelect: 'none',
        }}
      >
        {activeVariant.code}
      </SyntaxHighlighter>
    </div>
  )
}
