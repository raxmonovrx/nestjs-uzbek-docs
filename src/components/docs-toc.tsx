"use client"

import * as React from "react"
import { DocHeading } from "@/lib/docs"
import { cn } from "@/lib/utils"

type DocsTocProps = {
  headings: DocHeading[]
}

export function DocsToc({ headings }: DocsTocProps) {
  const [activeId, setActiveId] = React.useState(headings[0]?.id ?? "")

  React.useEffect(() => {
    if (headings.length === 0) {
      return
    }

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (elements.length === 0) {
      return
    }

    const updateActiveHeading = () => {
      const offset = 136
      let current = elements[0]

      for (const element of elements) {
        if (element.getBoundingClientRect().top - offset <= 0) {
          current = element
        } else {
          break
        }
      }

      setActiveId(current.id)
    }

    updateActiveHeading()
    window.addEventListener("scroll", updateActiveHeading, { passive: true })
    window.addEventListener("resize", updateActiveHeading)

    return () => {
      window.removeEventListener("scroll", updateActiveHeading)
      window.removeEventListener("resize", updateActiveHeading)
    }
  }, [headings])

  return (
    <div className="sticky top-24 space-y-3">
      <p className="text-sm font-medium text-foreground">On this page</p>
      <nav className="space-y-1 border-l border-white/8 pl-3">
        {headings.map((heading) => {
          const isActive = activeId === heading.id

          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={cn(
                "block border-l -ml-[13px] py-1 pl-3 text-sm transition",
                heading.depth === 3 ? "pl-6" : "",
                isActive
                  ? "border-rose-400 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-white/10 hover:text-foreground"
              )}
            >
              {heading.text}
            </a>
          )
        })}
      </nav>
    </div>
  )
}
