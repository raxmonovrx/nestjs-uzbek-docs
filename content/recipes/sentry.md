---
title: "Sentry"
navTitle: "Sentry"
description: "Sentry - bu dasturchilarga muammolarni real vaqt rejimida aniqlash va tuzatishga yordam beradigan error tracking va performance monitoring platformasi. Ushbu recipe Sentry'ning Nes"
order: 14
group: recipes
groupTitle: "Recipes"
---
Sentry - bu dasturchilarga muammolarni real vaqt rejimida aniqlash va tuzatishga yordam beradigan error tracking va performance monitoring platformasi. Ushbu recipe Sentry'ning NestJS SDK sini NestJS ilovangiz bilan qanday integratsiya qilishni ko'rsatadi.

#### O'rnatish

Avval kerakli dependency'larni o'rnating:

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node
```

> info **Hint** `@sentry/profiling-node` ixtiyoriy, ammo performance profiling uchun tavsiya etiladi.

#### Asosiy sozlash

Sentry bilan ishlashni boshlash uchun `instrument.ts` nomli fayl yarating. U ilovangizdagi boshqa modullardan oldin import qilinishi kerak:

```typescript
@@filename(instrument)
const Sentry = require("@sentry/nestjs");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
```

`main.ts` faylini `instrument.ts` boshqa import'lardan oldin yuklanadigan qilib yangilang:

```typescript
@@filename(main)
// Import this first!
import "./instrument";

// Now import other modules
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

Shundan so'ng `SentryModule` ni asosiy modulingizga root module sifatida qo'shing:

```typescript
@@filename(app.module)
import { Module } from "@nestjs/common";
import { SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    SentryModule.forRoot(),
    // ...other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### Exception handling

Agar siz global catch-all exception filter ishlatayotgan bo'lsangiz (`app.useGlobalFilters()` orqali ro'yxatdan o'tgan filter yoki app module providers ichida argumentlarsiz `@Catch()` bilan belgilangan filter), filter'ning `catch()` metodiga `@SentryExceptionCaptured()` dekoratorini qo'shing. Bu dekorator global error filter'ingiz ushlagan barcha kutilmagan xatolarni Sentry'ga yuboradi:

```typescript
import { Catch, ExceptionFilter } from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class YourCatchAllExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception, host): void {
    // your implementation here
  }
}
```

Standart holatda faqat error filter tomonidan ushlanmagan unhandled exception'lar Sentry'ga yuboriladi. `HttpExceptions` (jumladan [undan meros oluvchilar](/docs/core/exception-filters#built-in-http-exceptions)) ham standart bo'yicha yuborilmaydi, chunki ular ko'pincha control flow mexanizmi sifatida ishlaydi.

Agar sizda global catch-all exception filter bo'lmasa, `SentryGlobalFilter` ni asosiy modulingizning providers qismiga qo'shing. Bu filter boshqa error filter'lar ushlamagan barcha unhandled xatolarni Sentry'ga yuboradi.

> warning **Warning** `SentryGlobalFilter` boshqa exception filter'lardan oldin ro'yxatdan o'tkazilishi kerak.

```typescript
@@filename(app.module)
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter } from "@sentry/nestjs/setup";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    // ..other providers
  ],
})
export class AppModule {}
```

#### O'qilishi qulay stack trace'lar

Loyihangiz qanday sozlanganiga qarab, Sentry'dagi stack trace'lar haqiqiy kodingizga mos kelmasligi mumkin.

Buni tuzatish uchun source map'larni Sentry'ga yuklang. Eng oson yo'l - Sentry Wizard'dan foydalanish:

```bash
npx @sentry/wizard@latest -i sourcemaps
```

#### Integratsiyani tekshirish

Sentry integratsiyasi ishlayotganini tekshirish uchun xato tashlaydigan test endpoint qo'shishingiz mumkin:

```typescript
@Get("debug-sentry")
getError() {
  throw new Error("My first Sentry error!");
}
```

Ilovangizda `/debug-sentry` ga o'ting va xato Sentry dashboard'da paydo bo'lishi kerak.

### Xulosa

Sentry'ning NestJS SDK'i bo'yicha to'liq hujjatlar, jumladan ilg'or konfiguratsiya opsiyalari va imkoniyatlar uchun rasmiy Sentry hujjatlari ni ko'ring.

Dasturiy xatolarni topish Sentry'ning ishi bo'lsa ham, ularni baribir biz yozamiz. Agar SDK'ni o'rnatish vaqtida muammoga duch kelsangiz, GitHub Issue oching yoki Discord orqali murojaat qiling.
