# NestJS Uzbek Docs

Next.js va shadcn asosida qurilgan markdown-driven NestJS hujjatlari sayti.

Bu loyiha rasmiy NestJS sayti emas. U `docs.nestjs.com` kontentining mustaqil o'zbekcha tarjimasi va adaptatsiyasi hisoblanadi.

## Attribution

- Original documentation source: `https://docs.nestjs.com`
- Upstream source repository: `https://github.com/nestjs/docs.nestjs.com`
- NestJS main project: `https://github.com/nestjs/nest`
- This adaptation and Uzbek translation: Farruxbek Raxmonov

## License and notice

- See [LICENSE](./LICENSE) for the MIT license used by this project.
- See [NOTICE](./NOTICE) for attribution and trademark/disclaimer notes.

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
