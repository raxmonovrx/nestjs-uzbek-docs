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
import { cn } from '@/lib/utils'
import { BookOpenText, ChevronRight } from 'lucide-react'
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
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({})

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

  React.useEffect(() => {
    const matchingGroup = groups.find((group) => group.pages.some((page) => page.href === pathname))

    if (!matchingGroup?.title) {
      return
    }

    setOpenGroups((current) => ({
      ...current,
      [matchingGroup.id]: true,
    }))
  }, [groups, pathname])

  const isSearching = query.trim().length > 0

  const isGroupOpen = React.useCallback(
    (group: DocGroup) => {
      if (!group.title || isSearching) {
        return true
      }

      if (Object.prototype.hasOwnProperty.call(openGroups, group.id)) {
        return openGroups[group.id]
      }

      return group.pages.some((page) => page.href === pathname)
    },
    [isSearching, openGroups, pathname]
  )

  const toggleGroup = React.useCallback((groupId: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }))
  }, [])

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
                <span className="font-medium">NestJS Uzbek Docs</span>
                <span className="text-xs text-muted-foreground">
                  Mustaqil o&apos;zbekcha tarjima
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm value={query} onValueChange={setQuery} />
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.id} className="px-2 py-1">
            {group.title ? (
              <SidebarGroupLabel className="h-8 px-0 text-sm font-medium text-sidebar-foreground/85">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex h-8 w-full items-center justify-between gap-2 rounded-md px-2 text-left"
                  aria-expanded={isGroupOpen(group)}
                >
                  <span>{group.title}</span>
                  <ChevronRight
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                      isGroupOpen(group) ? 'rotate-90' : 'rotate-0'
                    )}
                  />
                </button>
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent className={cn('pt-0', !isGroupOpen(group) && 'hidden')}>
              <SidebarMenu
                className={cn(
                  'gap-0.5',
                  group.title && 'ml-3 border-l border-sidebar-border/70 pl-2'
                )}
              >
                {group.pages.map((page) => (
                  <SidebarMenuItem key={page.href}>
                    <SidebarMenuButton
                      isActive={pathname === page.href}
                      render={<Link href={page.href} />}
                      className="h-8"
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
        <div className="space-y-2 px-2 py-2 text-xs text-muted-foreground">
          <p className="leading-5">
            Bu rasmiy NestJS sayti emas. Asl manba{' '}
            <a
              href="https://docs.nestjs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              docs.nestjs.com
            </a>
            .
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
