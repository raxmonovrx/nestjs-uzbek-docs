import * as React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "@/components/code-block"
import { slugifyHeading } from "@/lib/slugify"
import { cn } from "@/lib/utils"

type DocsContentProps = {
  content: string
}

type MarkdownElementNode = {
  type?: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: MarkdownElementNode[]
}

function getNodeText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child)
      }

      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return getNodeText(child.props.children)
      }

      return ""
    })
    .join("")
}

type AdmonitionTone = "info" | "hint" | "note" | "warning" | "caution" | "error"

type AdmonitionMeta = {
  tone: AdmonitionTone
  title: string
  bodyNodes: MarkdownElementNode[]
}

const admonitionTheme: Record<
  AdmonitionTone,
  {
    shell: string
    stripe: string
    title: string
    body: string
  }
> = {
  info: {
    shell: "border-sky-400/12 bg-sky-500/[0.08]",
    stripe: "bg-sky-400",
    title: "text-sky-300",
    body:
      "[&_a]:text-sky-300 [&_a]:decoration-sky-300/30 [&_a:hover]:text-sky-200 [&_code]:border-sky-300/15 [&_code]:bg-sky-400/10 [&_code]:text-sky-100",
  },
  hint: {
    shell: "border-cyan-400/12 bg-cyan-500/[0.08]",
    stripe: "bg-cyan-400",
    title: "text-cyan-300",
    body:
      "[&_a]:text-cyan-300 [&_a]:decoration-cyan-300/30 [&_a:hover]:text-cyan-200 [&_code]:border-cyan-300/15 [&_code]:bg-cyan-400/10 [&_code]:text-cyan-100",
  },
  note: {
    shell: "border-indigo-400/12 bg-indigo-500/[0.08]",
    stripe: "bg-indigo-400",
    title: "text-indigo-300",
    body:
      "[&_a]:text-indigo-300 [&_a]:decoration-indigo-300/30 [&_a:hover]:text-indigo-200 [&_code]:border-indigo-300/15 [&_code]:bg-indigo-400/10 [&_code]:text-indigo-100",
  },
  warning: {
    shell: "border-amber-400/12 bg-amber-500/[0.1]",
    stripe: "bg-amber-400",
    title: "text-amber-300",
    body:
      "[&_a]:text-amber-300 [&_a]:decoration-amber-300/30 [&_a:hover]:text-amber-200 [&_code]:border-amber-300/15 [&_code]:bg-amber-400/10 [&_code]:text-amber-100",
  },
  caution: {
    shell: "border-orange-400/12 bg-orange-500/[0.1]",
    stripe: "bg-orange-400",
    title: "text-orange-300",
    body:
      "[&_a]:text-orange-300 [&_a]:decoration-orange-300/30 [&_a:hover]:text-orange-200 [&_code]:border-orange-300/15 [&_code]:bg-orange-400/10 [&_code]:text-orange-100",
  },
  error: {
    shell: "border-rose-400/12 bg-rose-500/[0.1]",
    stripe: "bg-rose-400",
    title: "text-rose-300",
    body:
      "[&_a]:text-rose-300 [&_a]:decoration-rose-300/30 [&_a:hover]:text-rose-200 [&_code]:border-rose-300/15 [&_code]:bg-rose-400/10 [&_code]:text-rose-100",
  },
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function normalizeAdmonitionTone(value?: string | null): AdmonitionTone | null {
  if (!value) {
    return null
  }

  const normalized = value.trim().toLowerCase()
  if (
    normalized === "info" ||
    normalized === "hint" ||
    normalized === "note" ||
    normalized === "warning" ||
    normalized === "caution" ||
    normalized === "error"
  ) {
    return normalized
  }

  return null
}

function stripLeadingSeparator(value: string) {
  return value.replace(/^\s*[:\-–]\s*/, "").replace(/^\s+/, "")
}

function nodeToText(node?: MarkdownElementNode): string {
  if (!node) {
    return ""
  }

  if (node.type === "text") {
    return node.value ?? ""
  }

  return (node.children ?? []).map(nodeToText).join("")
}

function extractAdmonition(node?: MarkdownElementNode): AdmonitionMeta | null {
  const blockChildren = (node?.children ?? []).filter((child) => {
    return !(child.type === "text" && (child.value ?? "").trim().length === 0)
  })
  const firstNode = blockChildren[0]

  if (!firstNode) {
    return null
  }

  const paragraphNode =
    firstNode.type === "element" && firstNode.tagName === "p" ? firstNode : null
  const sourceNodes = (paragraphNode?.children ?? blockChildren).filter((child) => {
    return !(child.type === "text" && (child.value ?? "").trim().length === 0)
  })

  if (sourceNodes.length === 0) {
    return null
  }

  let marker = ""
  const firstTextNode = sourceNodes[0]
  if (firstTextNode?.type === "text") {
    const match = (firstTextNode.value ?? "").match(/^\s*(info|warning|note|hint|caution|error)\b\s*/i)
    if (match) {
      marker = match[1]
    }
  }

  if (!marker) {
    return null
  }

  const strongNode = sourceNodes.find((child) => {
    return child.type === "element" && (child.tagName === "strong" || child.tagName === "em")
  })
  const title = nodeToText(strongNode).trim() || marker
  const tone = normalizeAdmonitionTone(marker)
  if (!tone) {
    return null
  }

  const cleanedBlockChildren = [...blockChildren]
  if (paragraphNode) {
    const nextChildren = [...sourceNodes]

    if (nextChildren[0]?.type === "text") {
      nextChildren[0] = {
        ...nextChildren[0],
        value: (nextChildren[0].value ?? "").replace(
          /^\s*(info|warning|note|hint|caution|error)\b\s*/i,
          ""
        ),
      }
      if ((nextChildren[0].value ?? "").trim().length === 0) {
        nextChildren.shift()
      }
    }

    while (nextChildren[0]?.type === "text" && (nextChildren[0].value ?? "").trim().length === 0) {
      nextChildren.shift()
    }

    if (
      nextChildren[0]?.type === "element" &&
      (nextChildren[0].tagName === "strong" || nextChildren[0].tagName === "em")
    ) {
      nextChildren.shift()
    }

    while (nextChildren[0]?.type === "text" && (nextChildren[0].value ?? "").trim().length === 0) {
      nextChildren.shift()
    }

    if (nextChildren[0]?.type === "text") {
      const cleaned = stripLeadingSeparator(nextChildren[0].value ?? "")
      if (cleaned.length === 0) {
        nextChildren.shift()
      } else {
        nextChildren[0] = {
          ...nextChildren[0],
          value: cleaned,
        }
      }
    }

    while (nextChildren[0]?.type === "text" && (nextChildren[0].value ?? "").trim().length === 0) {
      nextChildren.shift()
    }

    cleanedBlockChildren[0] = {
      ...paragraphNode,
      children: nextChildren,
    }
  }

  return {
    tone,
    title: titleCase(title),
    bodyNodes: cleanedBlockChildren,
  }
}

function renderAstNodes(nodes: MarkdownElementNode[], keyPrefix = "admonition"): React.ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`

    if (node.type === "text") {
      return node.value ?? ""
    }

    if (node.type !== "element") {
      return null
    }

    const children = renderAstNodes(node.children ?? [], key)

    switch (node.tagName) {
      case "p":
        return <p key={key}>{children}</p>
      case "a":
        return (
          <a key={key} href={typeof node.properties?.href === "string" ? node.properties.href : undefined}>
            {children}
          </a>
        )
      case "code":
        return <code key={key}>{children}</code>
      case "strong":
        return <strong key={key}>{children}</strong>
      case "em":
        return <em key={key}>{children}</em>
      case "ul":
        return <ul key={key}>{children}</ul>
      case "ol":
        return <ol key={key}>{children}</ol>
      case "li":
        return <li key={key}>{children}</li>
      case "br":
        return <br key={key} />
      default:
        return <React.Fragment key={key}>{children}</React.Fragment>
    }
  })
}

function AdmonitionBlock({
  admonition,
}: {
  admonition: AdmonitionMeta
}) {
  const theme = admonitionTheme[admonition.tone]
  const content = renderAstNodes(admonition.bodyNodes)

  return (
    <div className={cn("relative my-6 overflow-hidden rounded-xl border px-6 py-5 sm:px-8 sm:py-6", theme.shell)}>
      <div className={cn("absolute inset-y-0 left-0 w-1", theme.stripe)} />
      <div className={cn("mb-3 text-sm font-semibold uppercase tracking-[0.16em]", theme.title)}>
        {admonition.title}
      </div>
      <div
        className={cn(
          "text-[15px] leading-8 text-slate-200 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:text-white",
          theme.body
        )}
      >
        {content}
      </div>
    </div>
  )
}

const markdownComponents: Components = {
  h1({ className, node: _node, ...props }) {
    const headingText = getNodeText(props.children)
    return (
      <h1
        id={slugifyHeading(headingText)}
        className={cn("mt-10 scroll-mt-24 text-3xl font-semibold tracking-tight text-white", className)}
        {...props}
      />
    )
  },
  h2({ className, node: _node, ...props }) {
    const headingText = getNodeText(props.children)
    return (
      <h2
        id={slugifyHeading(headingText)}
        className={cn(
          "mt-12 scroll-mt-24 border-b border-white/10 pb-3 text-2xl font-semibold tracking-tight text-white",
          className
        )}
        {...props}
      />
    )
  },
  h3({ className, node: _node, ...props }) {
    const headingText = getNodeText(props.children)
    return (
      <h3
        id={slugifyHeading(headingText)}
        className={cn("mt-10 scroll-mt-24 text-xl font-semibold tracking-tight text-white", className)}
        {...props}
      />
    )
  },
  h4({ className, node: _node, ...props }) {
    const headingText = getNodeText(props.children)
    return (
      <h4
        id={slugifyHeading(headingText)}
        className={cn("mt-8 scroll-mt-24 text-lg font-semibold text-white", className)}
        {...props}
      />
    )
  },
  p({ className, node: _node, ...props }) {
    return <p className={cn("my-5 text-[15px] leading-7 text-slate-300", className)} {...props} />
  },
  ul({ className, node: _node, ...props }) {
    return (
      <ul
        className={cn("my-5 list-disc space-y-2 pl-6 text-[15px] leading-7 text-slate-300 marker:text-slate-500", className)}
        {...props}
      />
    )
  },
  ol({ className, node: _node, ...props }) {
    return (
      <ol
        className={cn(
          "my-5 list-decimal space-y-2 pl-6 text-[15px] leading-7 text-slate-300 marker:text-slate-500",
          className
        )}
        {...props}
      />
    )
  },
  li({ className, node: _node, ...props }) {
    return <li className={cn("pl-1", className)} {...props} />
  },
  a({ className, node: _node, ...props }) {
    return (
      <a
        className={cn("font-medium text-rose-400 underline decoration-rose-400/30 underline-offset-4 transition hover:text-rose-300", className)}
        {...props}
      />
    )
  },
  strong({ className, node: _node, ...props }) {
    return <strong className={cn("font-semibold text-white", className)} {...props} />
  },
  blockquote({ className, node, ...props }) {
    const admonition = extractAdmonition(node as MarkdownElementNode)

    if (admonition) {
      return <AdmonitionBlock admonition={admonition} />
    }

    return (
      <blockquote
        className={cn(
          "my-6 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-slate-300 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-3",
          className
        )}
        {...props}
      />
    )
  },
  table({ className, node: _node, ...props }) {
    return (
      <div className="my-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className={cn("min-w-full border-collapse text-left text-sm text-slate-300", className)} {...props} />
      </div>
    )
  },
  thead({ className, node: _node, ...props }) {
    return <thead className={cn("bg-white/5", className)} {...props} />
  },
  th({ className, node: _node, ...props }) {
    return (
      <th
        className={cn("border-b border-white/10 px-4 py-3 font-medium text-white", className)}
        {...props}
      />
    )
  },
  td({ className, node: _node, ...props }) {
    return <td className={cn("border-t border-white/10 px-4 py-3 align-top", className)} {...props} />
  },
  hr({ className, node: _node, ...props }) {
    return <hr className={cn("my-10 border-white/10", className)} {...props} />
  },
  img() {
    return null
  },
  iframe() {
    return null
  },
  code({ className, children, node: _node, ...props }) {
    const isBlock = Boolean(className?.includes("language-"))

    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }

    return (
      <code
        className={cn(
          "rounded-md border border-white/10 bg-white/7 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-100",
          className
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
  pre({ children }) {
    const child = React.Children.toArray(children)[0]

    if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
      const className = child.props.className ?? ""
      const language = className.replace("language-", "") || undefined
      const code = React.Children.toArray(child.props.children).join("").replace(/\n$/, "")

      return <CodeBlock code={code} language={language} />
    }

    return <pre>{children}</pre>
  },
}

export function DocsContent({ content }: DocsContentProps) {
  return (
    <div className="min-w-0">
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
