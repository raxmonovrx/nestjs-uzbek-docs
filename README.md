# NestJS Uzbek Docs

**[NestJS](https://nestjs.com) hujjatlari o'zbek tilida → [nest.raxmonovrx.uz](https://nest.raxmonovrx.uz)**

[![Saytni ochish](https://img.shields.io/badge/sayt-nest.raxmonovrx.uz-e0234e?logo=nestjs)](https://nest.raxmonovrx.uz)
[![Sahifalar](https://img.shields.io/badge/sahifalar-134-blue)](./content)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[![NestJS Uzbek Docs](https://nest.raxmonovrx.uz/opengraph-image)](https://nest.raxmonovrx.uz)

Next.js va shadcn asosida qurilgan markdown-driven NestJS hujjatlari sayti.

Bu loyiha rasmiy NestJS sayti emas. U `docs.nestjs.com` kontentining mustaqil o'zbekcha tarjimasi va adaptatsiyasi hisoblanadi.

Loyiha foydali bo'lsa, ⭐ bosib qo'ying — boshqa o'zbek dasturchilar ham topishiga yordam beradi.

## Nimalar tarjima qilingan

| Bo'lim | Sahifalar | Bo'lim | Sahifalar |
|---|---|---|---|
| Core (Overview) | 14 | Microservices | 12 |
| Fundamentals | 12 | WebSockets | 6 |
| Techniques | 20 | OpenAPI | 8 |
| Security | 7 | CLI | 5 |
| GraphQL | 18 | Recipes | 20 |
| FAQ | 9 | Devtools, Discover | 3 |

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

## Hissa qo'shish

Tarjimada xato, noaniq atama yoki eskirgan sahifa ko'rdingizmi? Yordamingiz kerak:

- Kichik tuzatish uchun tegishli faylni `content/` ichidan topib, to'g'ridan-to'g'ri **Pull Request** oching.
- Kattaroq taklif yoki savol uchun **Issue** oching.
- Atamalar: kod, API nomlari va dekoratorlar (`@Controller()`, `Provider`, `Guard`) o'zgarishsiz qoladi; tushuntirish matni o'zbek (lotin) tilida yoziladi.
