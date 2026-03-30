---
title: "Serverless"
navTitle: "Serverless"
description: "Serverless computing - bu cloud computing'ning shunday execution modeli bo'lib, unda cloud provider mijoz nomidan serverlarni boshqaradi va machine resource'larni talab bo'yicha aj"
order: 9
group: faq
groupTitle: "FAQ"
---
Serverless computing - bu cloud computing'ning shunday execution modeli bo'lib, unda cloud provider mijoz nomidan serverlarni boshqaradi va machine resource'larni talab bo'yicha ajratadi. Ilova ishlamayotgan paytda unga compute resource ajratilmaydi. Narxlash esa ilova amalda iste'mol qilgan resource miqdoriga qarab belgilanadi (manba).

**Serverless architecture** bilan siz e'tiborni ilova kodingizdagi alohida funksiyalarga qaratasiz. AWS Lambda, Google Cloud Functions va Microsoft Azure Functions kabi servislar fizik uskuna, virtual mashina operatsion tizimi va web server dasturiy ta'minoti boshqaruvini o'z zimmasiga oladi.

> info **Hint** Ushbu bob serverless funksiyalarning afzallik va kamchiliklarini yoki biror cloud provider'ning ichki tafsilotlarini chuqur yoritmaydi.

#### Cold start

Cold start - bu kodingiz anchadan beri ilk bor bajarilayotgan holat. Siz ishlatayotgan cloud provider'ga qarab, bu jarayon kodni yuklab olish, runtime'ni bootstrap qilish va oxirida kodni ishga tushirishgacha bo'lgan bir nechta operatsiyani o'z ichiga olishi mumkin.
Bu jarayon tilga, ilovangizdagi paketlar soniga va boshqa omillarga qarab **sezilarli kechikish** qo'shadi.

Cold start muhim masala va uning ayrim qismlari nazoratimizdan tashqarida bo'lsa ham, uni imkon qadar qisqartirish uchun o'z tomonimizdan qiladigan ishlar ko'p.

Nest'ni murakkab, enterprise darajadagi ilovalar uchun mo'ljallangan to'liq freymvork deb tasavvur qilish mumkin, ammo u **ancha sodda ilovalar** (yoki skriptlar) uchun ham mos keladi. Masalan, Standalone applications imkoniyati yordamida Nest'ning DI tizimidan oddiy worker, CRON job, CLI yoki serverless funksiyalarda ham foydalanishingiz mumkin.

#### Benchmarks

Serverless funksiyalar kontekstida Nest yoki boshqa mashhur kutubxonalar (`express` kabi) dan foydalanish narxini yaxshiroq tushunish uchun Node runtime quyidagi skriptlarni ishga tushirishga qancha vaqt sarflashini solishtiramiz:

```typescript
// #1 Express
import * as express from 'express';

async function bootstrap() {
  const app = express();
  app.get('/', (req, res) => res.send('Hello world!'));
  await new Promise<void>((resolve) => app.listen(3000, resolve));
}
bootstrap();

// #2 Nest (with @nestjs/platform-express)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// #3 Nest as a Standalone application (no HTTP server)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  console.log(app.get(AppService).getHello());
}
bootstrap();

// #4 Raw Node.js script
async function bootstrap() {
  console.log('Hello world!');
}
bootstrap();
```

Bu skriptlarning barchasi uchun `tsc` (TypeScript) kompilyatoridan foydalandik, shu sabab kod bundle qilinmagan (`webpack` ishlatilmagan).

|                                      |                   |
| ------------------------------------ | ----------------- |
| Express                              | 0.0079s (7.9ms)   |
| Nest with `@nestjs/platform-express` | 0.1974s (197.4ms) |
| Nest (standalone application)        | 0.1117s (111.7ms) |
| Raw Node.js script                   | 0.0071s (7.1ms)   |

> info **Note** Qurilma: MacBook Pro Mid 2014, 2.5 GHz Quad-Core Intel Core i7, 16 GB 1600 MHz DDR3, SSD.

Endi shu benchmark'larni yana bir bor takrorlaymiz, ammo bu safar `webpack` yordamida (agar sizda [Nest CLI](/docs/cli/overview) o'rnatilgan bo'lsa, `nest build --webpack` ni ishga tushirishingiz mumkin) ilovani bitta bajariladigan JavaScript fayliga bundle qilamiz.
Biroq Nest CLI beradigan standart `webpack` konfiguratsiyasi o'rniga, barcha dependency'larni (`node_modules`) ham birga bundle qilinishini ta'minlaymiz:

```javascript
module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    externals: [],
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
  };
};
```

> info **Hint** Nest CLI shu konfiguratsiyadan foydalansin desangiz, loyiha root katalogida yangi `webpack.config.js` faylini yarating.

Ushbu konfiguratsiya bilan quyidagi natijalarga erishdik:

|                                      |                  |
| ------------------------------------ | ---------------- |
| Express                              | 0.0068s (6.8ms)  |
| Nest with `@nestjs/platform-express` | 0.0815s (81.5ms) |
| Nest (standalone application)        | 0.0319s (31.9ms) |
| Raw Node.js script                   | 0.0066s (6.6ms)  |

> info **Note** Qurilma: MacBook Pro Mid 2014, 2.5 GHz Quad-Core Intel Core i7, 16 GB 1600 MHz DDR3, SSD.

> info **Hint** Qo'shimcha code minification va optimization usullarini (`webpack` plugin'lari va hokazo) qo'llab, uni yanada optimallashtirish mumkin.

Ko'rib turganingizdek, kodni qanday kompilyatsiya qilishingiz (va uni bundle qilishingiz yoki yo'qligi) juda muhim bo'lib, umumiy startup vaqtiga sezilarli ta'sir qiladi. `webpack` bilan standalone Nest ilovasi (bitta modul, controller va service'ga ega starter loyiha) ning bootstrap vaqtini o'rtacha ~32ms gacha, oddiy HTTP asosidagi express-based NestJS ilovasini esa ~81.5ms gacha tushirish mumkin.

Murakkabroq Nest ilovalarida, masalan 10 ta resource'dan (`$ nest g resource` schematic orqali yaratilgan 10 modul, 10 controller, 10 service, 20 DTO class, 50 HTTP endpoint va `AppModule`) iborat tizimda, MacBook Pro Mid 2014, 2.5 GHz Quad-Core Intel Core i7, 16 GB 1600 MHz DDR3, SSD qurilmasida umumiy startup taxminan 0.1298s (129.8ms) bo'ladi. Monolit ilovani serverless funksiya sifatida ishga tushirish odatda unchalik ma'noli emas, shuning uchun bu benchmark'ni ilova kattalashgani sari bootstrap vaqti qanday oshishi mumkinligining misoli deb qabul qiling.

#### Runtime optimizations

Hozirgacha compile-time optimizatsiyalarni ko'rib chiqdik. Bular ilovangizda provider'larni qanday ta'riflashingiz va Nest modullarini qanday yuklashingizdan alohida masala, lekin ilova kattalashgani sari bu omillar ham juda muhim bo'lib qoladi.

Masalan, ma'lumotlar bazasi ulanishi asynchronous provider sifatida ta'riflangan deb tasavvur qiling. Async provider'lar bir yoki bir nechta asinxron vazifa tugamaguncha ilova startini kechiktirish uchun mo'ljallangan.
Bu degani, agar serverless funksiyangiz o'rtacha 2 soniyada bazaga ulangan bo'lsa (bootstrap vaqtida), endpoint javob qaytarishdan oldin kamida yana ikki soniya kutadi, chunki cold start holatida ilova hali ishlamayotgan bo'ladi va ulanish tugashini kutishga majbur.

Ko'rib turganingizdek, bootstrap vaqti muhim bo'lgan **serverless muhit**da provider'larni tuzish usuli biroz boshqacha bo'ladi.
Yana bir yaxshi misol - Redis'dan caching uchun faqat ayrim holatlarda foydalanishingiz. Bunday vaziyatda Redis ulanishini async provider sifatida ta'riflamaslik ma'qul bo'lishi mumkin, chunki aynan shu funksiya chaqiruvida kerak bo'lmasa ham bootstrap vaqtini sekinlashtiradi.

Ba'zi hollarda [ushbu bobda](/docs/fundamentals/lazy-loading-modules) ko'rsatilganidek, `LazyModuleLoader` class'i yordamida butun modullarni lazy load qilish ham mumkin. Caching bunga yaxshi misol bo'ladi.
Masalan, ilovangizda ichkarida Redis'ga ulanadigan va Redis storage bilan ishlash uchun `CacheService` ni export qiladigan `CacheModule` bor deylik. Agar u barcha funksiya chaqiruvlari uchun kerak bo'lmasa,
uni talab bo'yicha, lazy tarzda yuklashingiz mumkin. Shu orqali caching kerak bo'lmagan invokatsiyalar uchun cold start paytida tezroq startup vaqtiga ega bo'lasiz.

```typescript
if (request.method === RequestMethod[RequestMethod.GET]) {
  const { CacheModule } = await import('./cache.module');
  const moduleRef = await this.lazyModuleLoader.load(() => CacheModule);

  const { CacheService } = await import('./cache.service');
  const cacheService = moduleRef.get(CacheService);

  return cacheService.get(ENDPOINT_KEY);
}
```

Yana bir yaxshi misol - webhook yoki worker. Ular ayrim shartlarga (masalan, input argument'lariga) qarab turli amallar bajarishi mumkin.
Bunday holatda route handler ichida shart yozib, aynan shu function invocation uchun kerakli modulni lazy load qilishingiz va boshqa modullarni ham talab bo'yicha yuklashingiz mumkin.

```typescript
if (workerType === WorkerType.A) {
  const { WorkerAModule } = await import('./worker-a.module');
  const moduleRef = await this.lazyModuleLoader.load(() => WorkerAModule);
  // ...
} else if (workerType === WorkerType.B) {
  const { WorkerBModule } = await import('./worker-b.module');
  const moduleRef = await this.lazyModuleLoader.load(() => WorkerBModule);
  // ...
}
```

#### Example integration

Ilovangizning entry fayli (odatda `main.ts`) qanday ko'rinishda bo'lishi **bir nechta omilga bog'liq**, shu sabab **har bir holatga mos tushadigan bitta universal template yo'q**.
Masalan, serverless funksiyani ishga tushirish uchun kerak bo'ladigan initialization fayli cloud provider'ga qarab farq qiladi (AWS, Azure, GCP va hokazo).
Shuningdek, siz bir nechta route/endpoint'li odatiy HTTP ilovani ishga tushirmoqchimisiz yoki faqat bitta route taqdim etmoqchimisiz (yoki kodning ma'lum bir qismini ishlatmoqchimisiz) - bunga qarab ham ilova kodi turlicha bo'ladi. Masalan, endpoint-per-function yondashuvida HTTP serverni ko'tarish, middleware sozlash va hokazo o'rniga `NestFactory.createApplicationContext` dan foydalanishingiz mumkin.

Faqat ko'rsatish maqsadida, Nest'ni (`@nestjs/platform-express` bilan, ya'ni to'liq ishlaydigan HTTP router'ni ko'targan holda)
Serverless freymvorki bilan integratsiya qilamiz (bu misolda AWS Lambda maqsad qilingan). Oldin aytganimizdek, kodingiz tanlangan cloud provider va boshqa omillarga qarab farq qiladi.

Avval kerakli paketlarni o'rnatamiz:

```bash
$ npm i @codegenie/serverless-express aws-lambda
$ npm i -D @types/aws-lambda serverless-offline
```

> info **Hint** Development siklini tezlashtirish uchun AWS lambda va API Gateway'ni emulyatsiya qiladigan `serverless-offline` plugin'ini o'rnatamiz.

O'rnatish tugagach, Serverless freymvorkini sozlash uchun `serverless.yml` faylini yarating:

```yaml
service: serverless-example

plugins:
  - serverless-offline

provider:
  name: aws
  runtime: nodejs14.x

functions:
  main:
    handler: dist/main.handler
    events:
      - http:
          method: ANY
          path: /
      - http:
          method: ANY
          path: '{proxy+}'
```

> info **Hint** Serverless freymvorki haqida ko'proq bilish uchun rasmiy hujjatlar ni ko'ring.

Shundan so'ng `main.ts` fayliga o'tib, bootstrap kodini kerakli boilerplate bilan yangilaymiz:

```typescript
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
```

> info **Hint** Bir nechta serverless funksiya yaratish va ular o'rtasida umumiy modullarni ulashish uchun CLI Monorepo mode dan foydalanishni tavsiya qilamiz.

> warning **Warning** Agar `@nestjs/swagger` paketidan foydalansangiz, uni serverless function kontekstida to'g'ri ishlatish uchun qo'shimcha bir necha qadam kerak bo'ladi. Batafsil ma'lumot uchun ushbu thread ni ko'ring.

Keyin `tsconfig.json` faylini oching va `@codegenie/serverless-express` paketi to'g'ri yuklanishi uchun `esModuleInterop` opsiyasi yoqilganiga ishonch hosil qiling.

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true
  }
}
```

Endi ilovani (`nest build` yoki `tsc` bilan) build qilib, `serverless` CLI yordamida lambda funksiyani lokal ishga tushirishimiz mumkin:

```bash
$ npm run build
$ npx serverless offline
```

Ilova ishga tushgach, brauzerni ochib `http://localhost:3000/dev/[ANY_ROUTE]` manziliga o'ting (`[ANY_ROUTE]` - ilovangizda ro'yxatdan o'tgan istalgan endpoint).

Yuqoridagi bo'limlarda `webpack` va bundle qilish umumiy bootstrap vaqtiga sezilarli ta'sir ko'rsatishini ko'rdik.
Biroq bu misolda ishlashi uchun `webpack.config.js` fayliga bir nechta qo'shimcha konfiguratsiya qo'shishingiz kerak. Umuman olganda,
`handler` funksiyasi to'g'ri olinishi uchun `output.libraryTarget` qiymatini `commonjs2` ga o'zgartirishimiz kerak.

```javascript
return {
  ...options,
  externals: [],
  output: {
    ...options.output,
    libraryTarget: 'commonjs2',
  },
  // ... the rest of the configuration
};
```

Shundan so'ng `$ nest build --webpack` bilan funksiyangiz kodini kompilyatsiya qilishingiz (keyin esa `$ npx serverless offline` bilan test qilishingiz) mumkin bo'ladi.

Shuningdek, `terser-webpack-plugin` paketini o'rnatish va production build'ni minify qilayotganda class nomlari saqlanib qolishi uchun uning konfiguratsiyasini override qilish tavsiya etiladi (garchi bu **majburiy bo'lmasa ham**, build jarayonini sekinlashtiradi). Aks holda ilovangizda `class-validator` ishlatilganda noto'g'ri xatti-harakat kuzatilishi mumkin.

```javascript
const TerserPlugin = require('terser-webpack-plugin');

return {
  ...options,
  externals: [],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
        },
      }),
    ],
  },
  output: {
    ...options.output,
    libraryTarget: 'commonjs2',
  },
  // ... the rest of the configuration
};
```

#### Standalone application imkoniyatidan foydalanish

Muqobil ravishda, agar funksiyangizni juda yengil saqlamoqchi bo'lsangiz va sizga HTTP bilan bog'liq imkoniyatlar (routing, guard, interceptor, pipe va hokazo) kerak bo'lmasa,
butun HTTP serverni (`express` bilan birga) ishga tushirish o'rniga, yuqorida aytilganidek, `NestFactory.createApplicationContext` dan foydalanishingiz mumkin:

```typescript
@@filename(main)
import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { AppService } from './app.service';

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const appService = appContext.get(AppService);

  return {
    body: appService.getHello(),
    statusCode: HttpStatus.OK,
  };
};
```

> info **Hint** `NestFactory.createApplicationContext` controller metodlarini enhancer'lar (guard, interceptor va hokazo) bilan o'ramasligini yodda tuting. Buning uchun `NestFactory.create` metodidan foydalanish kerak.

Shuningdek, `event` obyektini, masalan, uni qayta ishlab tegishli qiymat qaytaradigan `EventsService` provider'iga uzatishingiz ham mumkin (bu input qiymati va business logic'ingizga bog'liq).

```typescript
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const eventsService = appContext.get(EventsService);
  return eventsService.process(event);
};
```
