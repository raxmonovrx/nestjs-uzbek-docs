---
title: "Model-View-Controller"
navTitle: "Model-View-Controller"
description: "Nest default holatda ichki qismda Express kutubxonasidan foydalanadi. Shuning uchun Expressda MVC (Model-View-Controller) patternini qo'llashning barcha usullari Nestga ham tegishl"
order: 10
group: techniques
groupTitle: "Techniques"
---
Nest default holatda ichki qismda Express kutubxonasidan foydalanadi. Shuning uchun Expressda MVC (Model-View-Controller) patternini qo'llashning barcha usullari Nestga ham tegishli.

Avval CLI vositasi yordamida oddiy Nest ilovasini scaffold qilamiz:

```bash
$ npm i -g @nestjs/cli
$ nest new project
```

MVC ilova yaratish uchun HTML ko'rinishlarni render qilishda template engine ham kerak bo'ladi:

```bash
$ npm install --save hbs
```

Biz `hbs` (Handlebars) engine dan foydalandik, ammo talablaringizga mos keladiganini tanlashingiz mumkin. O'rnatish jarayoni tugagach, quyidagi kod yordamida express instansiyasini sozlashimiz kerak:

```typescript
@@filename(main)
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
@@switch
import { NestFactory } from '@nestjs/core';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Biz Express ga `public` direktoriyasi statik assetlarni saqlash uchun ishlatilishini, `views` esa shablonlarni o'z ichiga olishini va HTML chiqishini render qilish uchun `hbs` template engine ishlatilishini aytdik.

#### Template render qilish

Endi `views` direktoriyasini va uning ichida `index.hbs` shablonini yarating. Shablonda controllerdan uzatilgan `message` ni chiqaramiz:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>App</title>
  </head>
  <body>
    {{ "{{ message }\}" }}
  </body>
</html>
```

Keyin `app.controller` faylini ochib, `root()` metodini quyidagi kod bilan almashtiring:

```typescript
@@filename(app.controller)
import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }
}
```

Bu kodda `@Render()` dekoratorida ishlatiladigan shablonni ko'rsatamiz, va route handler metodining qaytargan qiymati render qilish uchun shablonga uzatiladi. Qaytish qiymati `message` xossasiga ega obyekt ekaniga e'tibor bering, bu shablonda yaratgan `message` placeholderiga mos keladi.

Ilova ishga tushib turgan paytda brauzeringizni ochib `http://localhost:3000` manziliga o'ting. Siz `Hello world!` xabarini ko'rasiz.

#### Dinamik template render qilish

Agar ilova mantiqi qaysi shablon render qilinishini dinamik tarzda hal qilishi kerak bo'lsa, `@Render()` dekoratori o'rniga `@Res()` dekoratoridan foydalanishimiz va view nomini route handlerda berishimiz kerak:

> info **Hint** Nest `@Res()` dekoratorini aniqlaganda, u kutubxonaga xos `response` obyektini inject qiladi. Biz bu obyektdan shablonni dinamik render qilish uchun foydalanishimiz mumkin. `response` obyektining API si haqida batafsil bu yerda o'qing.

```typescript
@@filename(app.controller)
import { Get, Controller, Res, Render } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  root(@Res() res: Response) {
    return res.render(
      this.appService.getViewName(),
      { message: 'Hello world!' },
    );
  }
}
```

#### Misol

Ishlaydigan misol bu yerda mavjud.

#### Fastify

Ushbu [bobda](/docs/techniques/performance) aytilganidek, Nest bilan birga mos HTTP provayderidan foydalanishimiz mumkin. Shunday kutubxonalardan biri - Fastify. Fastify bilan MVC ilova yaratish uchun quyidagi paketlarni o'rnatishimiz kerak:

```bash
$ npm i --save @fastify/static @fastify/view handlebars
```

Keyingi qadamlar Expressda ishlatilgan jarayonga deyarli o'xshash, platformaga xos kichik farqlar bilan. O'rnatish jarayoni tugagach, `main.ts` faylini oching va uning tarkibini yangilang:

```typescript
@@filename(main)
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
@@switch
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Fastify API da bir nechta farqlar bor, ammo bu metod chaqiriqlarining yakuniy natijasi bir xil. Muayyan farqlardan biri - Fastifydan foydalanganda `@Render()` dekoratoriga uzatiladigan shablon nomida fayl kengaytmasi ham bo'lishi kerak.

Buni quyidagicha sozlashingiz mumkin:

```typescript
@@filename(app.controller)
import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index.hbs')
  root() {
    return { message: 'Hello world!' };
  }
}
```

Muqobil ravishda, `@Res()` dekoratoridan foydalanib response ni bevosita inject qilishingiz va render qilmoqchi bo'lgan view ni ko'rsatishingiz mumkin:

```typescript
import { Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Get()
root(@Res() res: FastifyReply) {
  return res.view('index.hbs', { title: 'Hello world!' });
}
```

Ilova ishga tushib turgan paytda brauzeringizni ochib `http://localhost:3000` manziliga o'ting. Siz `Hello world!` xabarini ko'rasiz.

#### Misol

Ishlaydigan misol bu yerda mavjud.
