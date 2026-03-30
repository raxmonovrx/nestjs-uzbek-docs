---
title: "Middleware"
navTitle: "Middleware"
description: "Middleware - route handlerdan oldin chaqiriladigan funksiya. Middleware funksiyalari ilovaning request-response siklidagi request va response obyektlariga hamda next() middleware f"
order: 11
group: core
groupTitle: "Core"
---
Middleware - route handlerdan **oldin** chaqiriladigan funksiya. Middleware funksiyalari ilovaning request-response siklidagi request va response obyektlariga hamda `next()` middleware funksiyasiga kirish huquqiga ega. **Next** middleware funksiyasi odatda `next` deb nomlangan o'zgaruvchi bilan belgilanadi.

Nest middlewarelari odatda express middlewarelariga teng. Rasmiy express hujjatlaridagi quyidagi ta'rif middleware imkoniyatlarini bayon qiladi:

<blockquote class="external">
  Middleware funksiyalari quyidagi vazifalarni bajarishi mumkin:
  <ul>
    <li>istalgan kodni bajarish.</li>
    <li>request va response obyektlariga o'zgartirish kiritish.</li>
    <li>request-response siklini yakunlash.</li>
    <li>stekdagi keyingi middleware funksiyasini chaqirish.</li>
    <li>agar joriy middleware funksiyasi request-response siklini yakunlamasa, boshqaruvni keyingi middleware funksiyasiga o'tkazish uchun <code>next()</code> ni chaqirishi shart. Aks holda, so'rov javobsiz qoladi.</li>
  </ul>
</blockquote>

Maxsus Nest middleware ni funksiya ko'rinishida yoki `@Injectable()` dekoratori bilan sinf ko'rinishida amalga oshirasiz. Sinf `NestMiddleware` interfeysini amalga oshirishi kerak, funksiya esa maxsus talablarga ega emas. Keling, sinf usuli orqali oddiy middleware funksiyasini amalga oshirishdan boshlaylik.

> warning **Warning** `Express` va `fastify` middleware ni turlicha qayta ishlaydi va turli metod imzolarini taqdim etadi, batafsil [bu yerda](/docs/techniques/performance#middleware) o'qing.

```typescript
@@filename(logger.middleware)
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware {
  use(req, res, next) {
    console.log('Request...');
    next();
  }
}
```

#### Bog'liqliklarni in'eksiya qilish

Nest middleware Dependency Injectionni to'liq qo'llab-quvvatlaydi. Provayderlar va kontrollerlar singari, ular xuddi shu modul doirasida mavjud bo'lgan bog'liqliklarni **in'eksiya qila** oladi. Odatdagidek, bu `constructor` orqali amalga oshiriladi.

#### Middleware ni qo'llash

`@Module()` dekoratorida middleware uchun joy yo'q. Buning o'rniga ularni modul sinfining `configure()` metodi orqali sozlaymiz. Middlewarega ega bo'lgan modullar `NestModule` interfeysini amalga oshirishi kerak. `LoggerMiddleware` ni `AppModule` darajasida sozlaylik.

```typescript
@@filename(app.module)
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
@@switch
import { Module } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

Yuqoridagi misolda biz `CatsController` ichida avval aniqlangan `/cats` route handlerlari uchun `LoggerMiddleware` ni sozladik. Middleware ni muayyan so'rov metodiga cheklash uchun, middleware ni sozlashda `forRoutes()` metodiga route `path` va so'rov `method` ini o'z ichiga olgan obyektni uzatish mumkin. Quyidagi misolda kerakli so'rov metodi turini ko'rsatish uchun `RequestMethod` enumini import qilayotganimizga e'tibor bering.

```typescript
@@filename(app.module)
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
@@switch
import { Module, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

> info **Hint** `configure()` metodini `async/await` yordamida asinxron qilish mumkin (masalan, `configure()` metod tanasi ichida asinxron operatsiya yakunlanishini `await` qilishingiz mumkin).

> warning **Warning** `express` adapteridan foydalanganda, NestJS ilovasi odatda `body-parser` paketidan `json` va `urlencoded` ni ro'yxatdan o'tkazadi. Bu shuni anglatadiki, `MiddlewareConsumer` orqali ushbu middleware ni sozlamoqchi bo'lsangiz, `NestFactory.create()` bilan ilova yaratishda `bodyParser` bayrog'ini `false` qilib, global middleware ni o'chirishingiz kerak bo'ladi.

#### Marshrut wildcardlari

Shablon asosidagi marshrutlar NestJS middlewarelarida ham qo'llab-quvvatlanadi. Masalan, nomlangan wildcard (`*splat`) marshrutdagi har qanday belgilar kombinatsiyasiga mos keluvchi wildcard sifatida ishlatilishi mumkin. Quyidagi misolda middleware `abcd/` bilan boshlanuvchi har qanday marshrut uchun, undan keyin qancha belgi kelishidan qat'i nazar, bajariladi.

```typescript
forRoutes({
  path: 'abcd/*splat',
  method: RequestMethod.ALL,
});
```

> info **Hint** `splat` shunchaki wildcard parametrining nomi bo'lib, maxsus ma'noga ega emas. Uni xohlagan nom bilan atashingiz mumkin, masalan, `*wildcard`.

`'abcd/*'` route pathi `abcd/1`, `abcd/123`, `abcd/abc` va hokazolarga mos keladi. Tire (`-`) va nuqta (`.`) satrga asoslangan pathlar tomonidan literal tarzda talqin qilinadi. Biroq, qo'shimcha belgilar bo'lmagan `abcd/` marshruti mos kelmaydi. Buning uchun wildcard ni qavslar ichiga olib, uni ixtiyoriy qilish kerak:

```typescript
forRoutes({
  path: 'abcd/{*splat}',
  method: RequestMethod.ALL,
});
```

#### Middleware consumer

`MiddlewareConsumer` yordamchi sinfdir. U middlewarelarni boshqarish uchun bir nechta o'rnatilgan metodlarni taqdim etadi. Ularning barchasini fluent uslubda oddiygina **zanjirlash** mumkin. `forRoutes()` metodi bitta satr, bir nechta satrlar, `RouteInfo` obyekti, kontroller sinfi va hatto bir nechta kontroller sinflarini qabul qilishi mumkin. Ko'p hollarda siz vergul bilan ajratilgan **kontrollerlar** ro'yxatini uzatasiz. Quyida bitta kontroller bilan misol keltirilgan:

```typescript
@@filename(app.module)
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
@@switch
import { Module } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

> info **Hint** `apply()` metodi bitta middleware ni yoki bir nechta middleware ni ko'rsatish uchun bir nechta argumentni qabul qilishi mumkin. bir nechta middleware.

#### Marshrutlarni istisno qilish

Ba'zan ayrim marshrutlarga middleware qo'llanmasligini **istisno** qilishni xohlaymiz. Buni `exclude()` metodidan foydalanib oson amalga oshirish mumkin. `exclude()` metodi istisno qilinadigan marshrutlarni aniqlash uchun bitta satr, bir nechta satr yoki `RouteInfo` obyektini qabul qiladi.

Quyida qanday ishlatish misoli:

```typescript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/{*splat}',
  )
  .forRoutes(CatsController);
```

> info **Hint** `exclude()` metodi wildcard parametrlarini path-to-regexp paketi yordamida qo'llab-quvvatlaydi.

Yuqoridagi misolda `LoggerMiddleware` `CatsController` ichida aniqlangan barcha marshrutlarga ulanadi, `exclude()` metodiga uzatilgan uchtasidan **tashqari**.

Bu yondashuv middlewarelarni muayyan marshrutlar yoki marshrut shablonlariga qarab qo'llash yoki chiqarib tashlashda moslashuvchanlik beradi.

#### Funksional middleware

Biz ishlatib kelayotgan `LoggerMiddleware` sinfi juda sodda. Uning a'zolari yo'q, qo'shimcha metodlari yo'q, bog'liqliklari ham yo'q. Nega uni sinf o'rniga oddiy funksiya sifatida aniqlamasligimiz kerak? Aslida, buni qila olamiz. Bunday turdagi middleware **funksional middleware** deb ataladi. Farqini ko'rsatish uchun logger middleware ni sinf asosidan funksional middleware ga o'zgartiraylik:

```typescript
@@filename(logger.middleware)
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
};
@@switch
export function logger(req, res, next) {
  console.log(`Request...`);
  next();
};
```

Va uni `AppModule` ichida ishlatamiz:

```typescript
@@filename(app.module)
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

> info **Hint** Middlewarega hech qanday bog'liqlik kerak bo'lmaganida, soddaroq **funksional middleware** variantidan foydalanishni ko'rib chiqing.

#### Bir nechta middleware

Yuqorida aytilganidek, ketma-ket bajariladigan bir nechta middleware ni ulash uchun `apply()` metodi ichida vergul bilan ajratilgan ro'yxatni berish kifoya:

```typescript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

#### Global middleware

Agar middleware ni ro'yxatdan o'tgan barcha marshrutlarga bir vaqtning o'zida ulamoqchi bo'lsak, `INestApplication` instansiyasi taqdim etadigan `use()` metodidan foydalanishimiz mumkin:

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(process.env.PORT ?? 3000);
```

> info **Hint** Global middleware ichida DI konteyneriga kirish mumkin emas. `app.use()` ishlatilganda uning o'rniga funksional middlewaredan foydalanishingiz mumkin. Muqobil ravishda, sinf middleware dan foydalanib, `AppModule` (yoki boshqa modul) ichida `.forRoutes('*')` bilan iste'mol qilishingiz mumkin.
