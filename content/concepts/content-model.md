---
title: Content Model
navTitle: Content Model
description: The minimal frontmatter contract that powers sorting, grouping, and routing.
order: 1
group: concepts
groupTitle: Concepts
tags:
  - frontmatter
  - metadata
---

## Frontmatter fields

| Field | Type | Purpose |
| --- | --- | --- |
| `title` | string | Main page title |
| `navTitle` | string | Short label in the sidebar |
| `description` | string | Summary text |
| `order` | number | Sort order |
| `group` | string | Group id |
| `groupTitle` | string | Human-readable section title |
| `tags` | string[] | Optional page tags |

## Routing rule

A file like:

```txt
content/concepts/content-model.md
```

becomes:

```txt
/docs/concepts/content-model
```

## Authoring guideline

Keep metadata compact and stable. The smaller the content contract is, the easier it is to maintain over time.
