---
title: Content Engine
navTitle: Content Engine
description: The internal API that reads markdown files and turns them into docs-ready page objects.
order: 1
group: api
groupTitle: API Reference
tags:
  - registry
  - parser
---

## What it does

The content engine is responsible for:

- reading markdown files from disk
- parsing frontmatter
- generating page metadata
- extracting headings
- sorting pages and groups

## Why it matters

The UI should not know how files are stored. It should only consume normalized page objects.

That makes it easier to:

- replace local files with a CMS later
- add versioning
- add search indexing
- build static navigation from a single source of truth
