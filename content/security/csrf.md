---
title: "CSRF himoyasi"
navTitle: "CSRF himoyasi"
description: "Cross-site request forgery (CSRF yoki XSRF) - bu ishonchli foydalanuvchidan veb ilovaga ruxsatsiz buyruqlar yuboriladigan hujum turi. Buni oldini olish uchun csrf-csrf paketidan fo"
order: 4
group: security
groupTitle: "Security"
---
Cross-site request forgery (CSRF yoki XSRF) - bu ishonchli foydalanuvchidan veb ilovaga **ruxsatsiz** buyruqlar yuboriladigan hujum turi. Buni oldini olish uchun csrf-csrf paketidan foydalanishingiz mumkin.

#### Express bilan foydalanish (default)

Avval kerakli paketni o'rnating:

```bash
$ npm i csrf-csrf
```

> warning **Warning** csrf-csrf hujjatlarida qayd etilganidek, bu middleware avval sessiya middleware yoki `cookie-parser` ishga tushirilgan bo'lishini talab qiladi. Batafsil ma'lumot uchun hujjatlarga qarang.

O'rnatish tugagach, `csrf-csrf` middleware ni global middleware sifatida ro'yxatdan o'tkazing.

```typescript
import { doubleCsrf } from 'csrf-csrf';
// ...
// somewhere in your initialization file
const {
  invalidCsrfTokenError, // This is provided purely for convenience if you plan on creating your own middleware.
  generateToken, // Use this in your routes to generate and provide a CSRF hash, along with a token cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(doubleCsrfOptions);
app.use(doubleCsrfProtection);
```

#### Fastify bilan foydalanish

Avval kerakli paketni o'rnating:

```bash
$ npm i --save @fastify/csrf-protection
```

O'rnatish tugagach, `@fastify/csrf-protection` plaginini quyidagicha ro'yxatdan o'tkazing:

```typescript
import fastifyCsrf from '@fastify/csrf-protection';
// ...
// somewhere in your initialization file after registering some storage plugin
await app.register(fastifyCsrf);
```

> warning **Warning** `@fastify/csrf-protection` hujjatlarida bu yerda tushuntirilganidek, bu plagin avval storage plaginini ishga tushirishni talab qiladi. Iltimos, qo'shimcha ko'rsatmalar uchun o'sha hujjatlarga qarang.
