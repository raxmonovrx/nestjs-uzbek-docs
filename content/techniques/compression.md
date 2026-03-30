---
title: "Siqish"
navTitle: "Siqish"
description: "Siqish javob bodysining hajmini sezilarli kamaytirishi mumkin, shu orqali web ilovaning tezligini oshiradi."
order: 2
group: techniques
groupTitle: "Techniques"
---
Siqish javob bodysining hajmini sezilarli kamaytirishi mumkin, shu orqali web ilovaning tezligini oshiradi.

Productiondagi **high-traffic** saytlarda siqishni ilova serveridan tashqariga chiqarish qat'iy tavsiya etiladi - odatda reverse proxyda (masalan, Nginx). Bunday holatda siqish middleware'idan foydalanmaslik kerak.

#### Express bilan foydalanish (default)

Gzip siqishni yoqish uchun compression middleware paketidan foydalaning.

Avval kerakli paketlarni o'rnating:

```bash
$ npm i --save compression
$ npm i --save-dev @types/compression
```

O'rnatish tugagach, siqish middleware'ini global middleware sifatida qo'llang.

```typescript
import * as compression from 'compression';
// somewhere in your initialization file
app.use(compression());
```

#### Fastify bilan foydalanish

Agar `FastifyAdapter` dan foydalansangiz, fastify-compress kerak bo'ladi:

```bash
$ npm i --save @fastify/compress
```

O'rnatish tugagach, `@fastify/compress` middleware'ini global middleware sifatida qo'llang.

> warning **Warning** Ilovani yaratishda `NestFastifyApplication` tipidan foydalanayotganingizga ishonch hosil qiling. Aks holda, siqish middleware'ini qo'llash uchun `register` dan foydalana olmaysiz.

```typescript
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import compression from '@fastify/compress';

// inside bootstrap()
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(compression);
```

Standart holatda `@fastify/compress` brauzerlar encoding qo'llab-quvvatlashini bildirganda Brotli siqishni (Node >= 11.7.0 da) ishlatadi. Brotli siqish koeffitsienti bo'yicha juda samarali bo'lishi mumkin, biroq u anchagina sekin ham bo'lishi mumkin. Standard holatda Brotli maksimal siqish sifati 11 ga o'rnatiladi, lekin `BROTLI_PARAM_QUALITY` ni 0 (min) dan 11 (max) gacha sozlab, siqish vaqtini siqish sifati hisobiga kamaytirish mumkin. Bu joy/vaqt unumdorligini optimallashtirish uchun nozik sozlashni talab qiladi. Sifat 4 bo'lgan misol:

```typescript
import { constants } from 'node:zlib';
// somewhere in your initialization file
await app.register(compression, { brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } } });
```

Soddalashtirish uchun `fastify-compress` ga javoblarni siqishda faqat deflate va gzip'dan foydalanishni ko'rsatishingiz mumkin; javoblar biroz kattaroq bo'ladi, ammo ancha tez yetkaziladi.

Encodinglarni ko'rsatish uchun `app.register` ga ikkinchi argument bering:

```typescript
await app.register(compression, { encodings: ['gzip', 'deflate'] });
```

Yuqoridagi misol `fastify-compress` ga faqat gzip va deflate encodinglaridan foydalanishni va mijoz ikkalasini ham qo'llab-quvvatlasa, gzipni afzal ko'rishni bildiradi.
