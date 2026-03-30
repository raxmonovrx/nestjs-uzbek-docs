import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DocsContent } from "@/components/docs-content"
import { DocsToc } from "@/components/docs-toc"
import { DocGroup, DocPage, getAdjacentDocs, getBreadcrumbs } from "@/lib/docs"

type DocsPageShellProps = {
  page: DocPage
  groups: DocGroup[]
}

export function DocsPageShell({ page, groups }: DocsPageShellProps) {
  const adjacent = getAdjacentDocs(page.href)
  const breadcrumbs = getBreadcrumbs(page)

  return (
    <SidebarProvider>
      <AppSidebar groups={groups} currentHref={page.href} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <div key={item.title} className="flex items-center gap-2">
                  {index > 0 ? <BreadcrumbSeparator className="hidden md:block" /> : null}
                  <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    ) : (
                      <span className="text-muted-foreground">{item.title}</span>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 gap-10 px-4 py-8 lg:px-8">
          <div className="min-w-0 flex-1">
            <article className="min-w-0">
              <div className="mb-8 border-b pb-8">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-md bg-rose-500/12 px-2.5 py-1 font-medium text-rose-300 ring-1 ring-inset ring-rose-500/20">
                    {page.groupTitle}
                  </span>
                  <span>{page.readingMinutes} min read</span>
                  {page.tags.length > 0 ? <span>{page.tags.join(" • ")}</span> : null}
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {page.title}
                </h1>
                {page.description ? (
                  <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                    {page.description}
                  </p>
                ) : null}
              </div>

              <DocsContent content={page.body} />

              <div className="mt-12 grid gap-4 border-t pt-6 md:grid-cols-2">
                {adjacent.previous ? (
                  <Link
                    href={adjacent.previous.href}
                    className="rounded-xl border p-4 transition hover:bg-white/4"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Previous
                    </p>
                    <p className="mt-2 font-medium text-foreground">
                      {adjacent.previous.title}
                    </p>
                  </Link>
                ) : (
                  <div />
                )}
                {adjacent.next ? (
                  <Link
                    href={adjacent.next.href}
                    className="rounded-xl border p-4 text-left transition hover:bg-white/4 md:text-right"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Next
                    </p>
                    <p className="mt-2 font-medium text-foreground">
                      {adjacent.next.title}
                    </p>
                  </Link>
                ) : null}
              </div>
            </article>
          </div>

          <aside className="hidden w-56 shrink-0 xl:block">
            {page.headings.length > 0 ? <DocsToc headings={page.headings} /> : null}
          </aside>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
