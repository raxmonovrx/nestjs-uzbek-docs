---
title: "Helmet"
navTitle: "Helmet"
description: "Helmet HTTP headerlarni mos ravishda o'rnatish orqali ilovangizni ba'zi mashhur veb zaifliklardan himoya qilishga yordam beradi. Umuman olganda, Helmet xavfsizlikka oid HTTP header"
order: 6
group: security
groupTitle: "Security"
---
Helmet HTTP headerlarni mos ravishda o'rnatish orqali ilovangizni ba'zi mashhur veb zaifliklardan himoya qilishga yordam beradi. Umuman olganda, Helmet xavfsizlikka oid HTTP headerlarni o'rnatadigan kichik middleware funksiyalar to'plamidir (batafsil bu yerda).

> info **Hint** `helmet`ni global qo'llash yoki ro'yxatdan o'tkazish boshqa `app.use()` chaqiruvlari yoki `app.use()` ni chaqirishi mumkin bo'lgan setup funksiyalaridan oldin bo'lishi kerakligini unutmang. Bu platformaning (ya'ni Express yoki Fastify) ishlash usuli bilan bog'liq; bunda middleware/route lar aniqlanish tartibi muhim. Agar siz `helmet` yoki `cors` kabi middlewarelarni route aniqlangandan keyin ishlatsangiz, u middleware o'sha routega qo'llanmaydi, faqat undan keyin aniqlangan routelarga qo'llanadi.

#### Express bilan foydalanish (default)

Avval kerakli paketni o'rnating.

```bash
$ npm i --save helmet
```

O'rnatish tugagach, uni global middleware sifatida qo'llang.

```typescript
import helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());
```

> warning **Warning** `helmet`, `@apollo/server` (4.x) va [Apollo Sandbox](/docs/graphql/quick-start#apollo-sandbox) birga ishlatilganda, Apollo Sandboxda CSP bilan muammo bo'lishi mumkin. Bu muammoni hal qilish uchun CSPni quyida ko'rsatilgandek sozlang:
>
> ```typescript
> app.use(helmet({
>   crossOriginEmbedderPolicy: false,
>   contentSecurityPolicy: {
>     directives: {
>       imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
>       scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
>       manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
>       frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
>     },
>   },
> }));

#### Fastify bilan foydalanish

Agar `FastifyAdapter` dan foydalanayotgan bo'lsangiz, @fastify/helmet paketini o'rnating:

```bash
$ npm i --save @fastify/helmet
```

fastify-helmet middleware sifatida emas, balki Fastify plagini sifatida ishlatilishi kerak, ya'ni `app.register()` orqali:

```typescript
import helmet from '@fastify/helmet'
// somewhere in your initialization file
await app.register(helmet)
```

> warning **Warning** `apollo-server-fastify` va `@fastify/helmet` birga ishlatilganda, GraphQL playgroundda CSP bilan muammo bo'lishi mumkin, bu to'qnashuvni hal qilish uchun CSPni quyida ko'rsatilgandek sozlang:
>
> ```typescript
> await app.register(fastifyHelmet, {
>    contentSecurityPolicy: {
>      directives: {
>        defaultSrc: [`'self'`, 'unpkg.com'],
>        styleSrc: [
>          `'self'`,
>          `'unsafe-inline'`,
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>        ],
>        fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
>        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
>        scriptSrc: [
>          `'self'`,
>          `https: 'unsafe-inline'`,
>          `cdn.jsdelivr.net`,
>          `'unsafe-eval'`,
>        ],
>      },
>    },
>  });
>
> // If you are not going to use CSP at all, you can use this:
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
> ```
