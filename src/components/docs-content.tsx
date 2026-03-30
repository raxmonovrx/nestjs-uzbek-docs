import * as React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock } from "@/components/code-block"
import { slugifyHeading } from "@/lib/slugify"
import { cn } from "@/lib/utils"

type DocsContentProps = {
  content: string
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

const markdownComponents: Components = {
  h1({ className, ...props }) {
    const headingText = getNodeText(props.children)
    return (
      <h1
        id={slugifyHeading(headingText)}
        className={cn("mt-10 scroll-mt-24 text-3xl font-semibold tracking-tight text-white", className)}
        {...props}
      />
    )
  },
  h2({ className, ...props }) {
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
  h3({ className, ...props }) {
    const headingText = getNodeText(props.children)
    return (
      <h3
        id={slugifyHeading(headingText)}
        className={cn("mt-10 scroll-mt-24 text-xl font-semibold tracking-tight text-white", className)}
        {...props}
      />
    )
  },
  h4({ className, ...props }) {
    const headingText = getNodeText(props.children)
    return (
      <h4
        id={slugifyHeading(headingText)}
        className={cn("mt-8 scroll-mt-24 text-lg font-semibold text-white", className)}
        {...props}
      />
    )
  },
  p({ className, ...props }) {
    return <p className={cn("my-5 text-[15px] leading-7 text-slate-300", className)} {...props} />
  },
  ul({ className, ...props }) {
    return (
      <ul
        className={cn("my-5 list-disc space-y-2 pl-6 text-[15px] leading-7 text-slate-300 marker:text-slate-500", className)}
        {...props}
      />
    )
  },
  ol({ className, ...props }) {
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
  li({ className, ...props }) {
    return <li className={cn("pl-1", className)} {...props} />
  },
  a({ className, ...props }) {
    return (
      <a
        className={cn("font-medium text-rose-400 underline decoration-rose-400/30 underline-offset-4 transition hover:text-rose-300", className)}
        {...props}
      />
    )
  },
  strong({ className, ...props }) {
    return <strong className={cn("font-semibold text-white", className)} {...props} />
  },
  blockquote({ className, ...props }) {
    return (
      <blockquote
        className={cn(
          "my-6 border-l-2 border-rose-500/70 bg-white/4 py-1 pl-4 italic text-slate-300",
          className
        )}
        {...props}
      />
    )
  },
  table({ className, ...props }) {
    return (
      <div className="my-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className={cn("min-w-full border-collapse text-left text-sm text-slate-300", className)} {...props} />
      </div>
    )
  },
  thead({ className, ...props }) {
    return <thead className={cn("bg-white/5", className)} {...props} />
  },
  th({ className, ...props }) {
    return (
      <th
        className={cn("border-b border-white/10 px-4 py-3 font-medium text-white", className)}
        {...props}
      />
    )
  },
  td({ className, ...props }) {
    return <td className={cn("border-t border-white/10 px-4 py-3 align-top", className)} {...props} />
  },
  hr({ className, ...props }) {
    return <hr className={cn("my-10 border-white/10", className)} {...props} />
  },
  code({ className, children, ...props }) {
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
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
