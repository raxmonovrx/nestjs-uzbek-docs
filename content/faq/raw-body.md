---
title: "Raw body"
navTitle: "Raw body"
description: "Raw request body'ga kirishning eng ko'p uchraydigan use-case'laridan biri webhook signature verification qilishdir. Odatda webhook signature'ni tekshirish uchun HMAC hash hisoblash"
order: 7
group: faq
groupTitle: "FAQ"
---
Raw request body'ga kirishning eng ko'p uchraydigan use-case'laridan biri webhook signature verification qilishdir. Odatda webhook signature'ni tekshirish uchun HMAC hash hisoblashda serializatsiya qilinmagan request body kerak bo'ladi.

> warning **Warning** Bu imkoniyat faqat built-in global body parser middleware yoqilgan bo'lsa ishlaydi, ya'ni ilovani yaratishda `bodyParser: false` uzatmasligingiz kerak.

#### Express bilan ishlatish

Avval Nest Express ilovasini yaratishda quyidagi opsiyani yoqing:

```typescript
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true,
});
await app.listen(process.env.PORT ?? 3000);
```

Controller ichida raw request body'ga murojaat qilish uchun `RawBodyRequest` deb nomlangan qulay interface taqdim etilgan. U request ustida `rawBody` maydonini expose qiladi:

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}
```

#### Boshqa parser'ni ro'yxatdan o'tkazish

Standart holatda faqat `json` va `urlencoded` parser'lari ro'yxatdan o'tadi. Agar ishlash jarayonida boshqa parser'ni ham qo'shmoqchi bo'lsangiz, buni aniq ko'rsatishingiz kerak.

Masalan, `text` parser'ni ro'yxatdan o'tkazish uchun quyidagi koddan foydalaning:

```typescript
app.useBodyParser('text');
```

> warning **Warning** `NestFactory.create` chaqiruvida to'g'ri application type uzatayotganingizga ishonch hosil qiling. Express ilovalari uchun to'g'ri type - `NestExpressApplication`. Aks holda `.useBodyParser` metodi topilmaydi.

#### Body parser hajm limiti

Agar ilovangiz Express'ning standart `100kb` limitidan kattaroq body'ni parse qilishi kerak bo'lsa, quyidagidan foydalaning:

```typescript
app.useBodyParser('json', { limit: '10mb' });
```

`.useBodyParser` metodi application options orqali uzatilgan `rawBody` opsiyasini hisobga oladi.

#### Fastify bilan ishlatish

Avval Nest Fastify ilovasini yaratishda quyidagi opsiyani yoqing:

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
  {
    rawBody: true,
  },
);
await app.listen(process.env.PORT ?? 3000);
```

Controller ichida raw request body'ga murojaat qilish uchun `RawBodyRequest` interface'i bu yerda ham `rawBody` maydonini expose qiladi:

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<FastifyRequest>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}
```

#### Boshqa parser'ni ro'yxatdan o'tkazish

Standart holatda faqat `application/json` va `application/x-www-form-urlencoded` parser'lari ro'yxatdan o'tadi. Agar boshqa parser'ni ishlash vaqtida qo'shmoqchi bo'lsangiz, buni explicit tarzda bajaring.

Masalan, `text/plain` parser'ni ro'yxatdan o'tkazish uchun quyidagi koddan foydalaning:

```typescript
app.useBodyParser('text/plain');
```

> warning **Warning** `NestFactory.create` ga to'g'ri application type uzatilayotganiga ishonch hosil qiling. Fastify ilovalari uchun to'g'ri type - `NestFastifyApplication`. Aks holda `.useBodyParser` metodi topilmaydi.

#### Body parser hajm limiti

Agar ilovangiz Fastify'ning standart 1MiB limitidan kattaroq body'ni parse qilishi kerak bo'lsa, quyidagidan foydalaning:

```typescript
const bodyLimit = 10_485_760; // 10MiB
app.useBodyParser('application/json', { bodyLimit });
```

`.useBodyParser` metodi application options orqali uzatilgan `rawBody` opsiyasini hisobga oladi.
