# Atlas Docs

Minimal Next.js documentation workspace built on top of shadcn sidebar components.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Add new docs

1. Create a markdown file inside `content/<group>/`.
2. Add frontmatter such as `title`, `description`, `order`, and `group`.
3. The page will automatically appear in the sidebar and become routable.

## Main structure

```txt
content/      markdown docs source
src/app/      Next app router
src/components/
src/lib/      docs registry and parsing helpers
```
