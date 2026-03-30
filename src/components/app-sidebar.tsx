'use client'

import { SearchForm } from '@/components/search-form'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { DocGroup } from '@/lib/docs'
import { BookOpenText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

export function AppSidebar({
  groups,
  currentHref,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  groups: DocGroup[]
  currentHref: string
}) {
  const pathname = usePathname()
  const [query, setQuery] = React.useState('')

  const filteredGroups = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return groups
    }

    return groups
      .map((group) => ({
        ...group,
        pages: group.pages.filter((page) => {
          return (
            page.title.toLowerCase().includes(normalizedQuery) ||
            page.description.toLowerCase().includes(normalizedQuery) ||
            page.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
          )
        }),
      }))
      .filter((group) => group.pages.length > 0)
  }, [groups, query])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={currentHref} />}
              className="pointer-events-none"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpenText className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Atlas Docs</span>
                <span className="text-xs text-muted-foreground">Minimal docs workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm value={query} onValueChange={setQuery} />
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className=" gap-0.5">
                {group.pages.map((page) => (
                  <SidebarMenuItem key={page.href}>
                    <SidebarMenuButton
                      isActive={pathname === page.href}
                      render={<Link href={page.href} />}
                    >
                      {page.navTitle}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Markdown based. Extend by adding files in <code>content/</code>.
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
