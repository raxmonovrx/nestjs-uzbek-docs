---
title: Getting Started
navTitle: Getting Started
description: Quick setup and the core ideas behind this markdown-driven docs workspace.
order: 1
group: guides
groupTitle: Guides
tags:
  - setup
  - docs
---

## Why this starter exists

This project is built for teams that want a clean documentation workspace with a maintainable structure.

- Markdown files are the source of truth.
- Navigation is generated from file metadata.
- The layout stays minimal and documentation-focused.
- New pages can be added without touching route code.

## How to add a new page

1. Create a new `.md` file inside `content/<group>/`.
2. Add frontmatter like `title`, `description`, `order`, and `group`.
3. Start the development server and the page will appear in the sidebar.

## Example

```md
---
title: Deploy Flow
description: Release and verify the docs app.
order: 30
group: guides
groupTitle: Guides
---

## Deploy

Your content goes here.
```

## What is generated automatically

- route path
- sidebar section
- previous and next links
- table of contents
- reading time
