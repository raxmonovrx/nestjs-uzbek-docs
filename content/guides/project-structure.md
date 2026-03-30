---
title: Project Structure
navTitle: Project Structure
description: The file organization used to keep the docs site scalable and easy to extend.
order: 2
group: guides
groupTitle: Guides
tags:
  - structure
  - architecture
---

## Main folders

```txt
content/                 markdown source files
src/app/                 Next.js app router files
src/components/          UI and docs-specific components
src/lib/                 content registry and parsing helpers
```

## Why this is maintainable

The docs engine and the UI are separated.

- `content/` stores writing
- `src/lib/docs.ts` builds the registry
- `src/components/` renders navigation and article content

This keeps the system extensible even when the amount of documentation grows.

## Recommended rule

Do not hardcode navigation in multiple places. The sidebar, breadcrumbs, and previous or next navigation should all come from the same docs registry.
