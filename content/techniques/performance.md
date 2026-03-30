---
title: "Unumdorlik (Fastify)"
navTitle: "Unumdorlik (Fastify)"
description: "Nest default holatda Express freymvorkidan foydalanadi. Avval aytilganidek, Nest shuningdek, masalan, Fastify kabi boshqa kutubxonalar bilan ham moslikni taqdim etadi. Nest bu frey"
order: 11
group: techniques
groupTitle: "Techniques"
---
Nest default holatda Express freymvorkidan foydalanadi. Avval aytilganidek, Nest shuningdek, masalan, Fastify kabi boshqa kutubxonalar bilan ham moslikni taqdim etadi. Nest bu freymvorkdan mustaqillikni freymvork adapterini implementatsiya qilish orqali ta'minlaydi; uning asosiy vazifasi middleware va handlerlarni tegishli kutubxona-spetsifik implementatsiyalarga proksi qilishdir.

> info **Hint** Eslatma: freymvork adapterini implementatsiya qilish uchun maqsadli kutubxona Express dagi kabi so'rov/javob pipeline qayta ishlashni taqdim etishi kerak.

Fastify Nest uchun yaxshi muqobil freymvork, chunki u Express dagi kabi dizayn muammolarini o'xshash tarzda hal qiladi. Biroq fastify Express ga qaraganda ancha **tezroq**, deyarli ikki baravar yaxshi benchmark natijalariga erishadi. Adolatli savol: nega Nest default HTTP provayder sifatida Expressdan foydalanadi? Sababi, Express keng qo'llanadi, yaxshi tanilgan va Nest foydalanuvchilari uchun tayyor bo'lgan juda katta mos middlewarelar to'plamiga ega.

Ammo Nest freymvorkdan mustaqillikni ta'minlagani uchun, ular orasida osongina migratsiya qilishingiz mumkin. Agar siz juda yuqori tezlikdagi unumdorlikni qadrlasangiz, Fastify yaxshiroq tanlov bo'lishi mumkin. Fastifydan foydalanish uchun ushbu bobda ko'rsatilgandek ichki `FastifyAdapter` ni tanlang.

#### O'rnatish

Avval kerakli paketni o'rnatamiz:

```bash
$ npm i --save @nestjs/platform-fastify
```

#### Adapter

Fastify platformasi o'rnatilgach, `FastifyAdapter` dan foydalanishimiz mumkin.

```typescript
@@filename(main)
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Default holatda Fastify faqat `localhost 127.0.0.1` interfeysida tinglaydi (batafsil o'qing). Agar boshqa hostlarda ulanishlarni qabul qilmoqchi bo'lsangiz, `listen()` chaqiruvida `'0.0.0.0'` ni ko'rsating:

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000, '0.0.0.0');
}
```

#### Platformaga xos paketlar

`FastifyAdapter` dan foydalanganda, Nest Fastify ni **HTTP provayder** sifatida ishlatishini yodda tuting. Bu shuni anglatadiki, Expressga tayangan har bir retsept ishlamasligi mumkin. Shuning o'rniga Fastify ga mos paketlardan foydalaning.

#### Redirect javob

Fastify redirect javoblarni Expressdan bir oz boshqacha boshqaradi. Fastify bilan to'g'ri redirect qilish uchun status kodi va URL ni birga qaytaring, quyidagicha:

```typescript
@Get()
index(@Res() res) {
  res.status(302).redirect('/login');
}
```

#### Fastify opsiyalari

`FastifyAdapter` konstruktori orqali Fastify konstruktoriga opsiyalarni uzatishingiz mumkin. Masalan:

```typescript
new FastifyAdapter({ logger: true });
```

#### Middleware

Middleware funksiyalari Fastify o'ramalari o'rniga xom `req` va `res` obyektlarini oladi. `middie` paketi (u ichki ishlatiladi) shunday ishlaydi va `fastify` ham shunday - batafsil ma'lumot uchun ushbu sahifani ko'ring,

```typescript
@@filename(logger.middleware)
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
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

#### Route Config

Fastify ning route config imkoniyatidan `@RouteConfig()` dekoratori bilan foydalanishingiz mumkin.

```typescript
@RouteConfig({ output: 'hello world' })
@Get()
index(@Req() req) {
  return req.routeConfig.output;
}
```

#### Route Constraints

v10.3.0 dan boshlab, `@nestjs/platform-fastify` Fastify ning route constraints funksiyasini `@RouteConstraints` dekoratori bilan qo'llab-quvvatlaydi.

```typescript
@RouteConstraints({ version: '1.2.x' })
newFeature() {
  return 'This works only for version >= 1.2.x';
}
```

> info **Hint** `@RouteConfig()` va `@RouteConstraints` `@nestjs/platform-fastify` paketidan import qilinadi.

#### Misol

Ishlaydigan misol bu yerda mavjud.
