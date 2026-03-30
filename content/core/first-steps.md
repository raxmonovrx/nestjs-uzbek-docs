---
title: "Birinchi qadamlar"
navTitle: "Birinchi qadamlar"
description: "Ushbu maqolalar to‘plamida siz Nest’ning asosiy fundamentlarini o‘rganasiz. Nest ilovalarining muhim “building block”lari (asosiy tarkibiy qismlari) bilan tanishish uchun kirish da"
order: 7
group: core
groupTitle: "Core"
---
Ushbu maqolalar to‘plamida siz Nest’ning **asosiy fundamentlari**ni o‘rganasiz. Nest ilovalarining muhim “building block”lari (asosiy tarkibiy qismlari) bilan tanishish uchun kirish darajasida keng ko‘lamli funksiyalarni qamrab oladigan oddiy CRUD ilovasini quramiz.

#### Til

Biz TypeScript’ni juda yaxshi ko‘ramiz, ammo eng avvalo — Node.js’ni yaxshi ko‘ramiz. Shuning uchun Nest ham TypeScript, ham sof JavaScript bilan mos ishlaydi. Nest tilning eng so‘nggi imkoniyatlaridan foydalanadi, shu sababli uni “vanilla” JavaScript bilan ishlatish uchun bizga Babel kompilyatori kerak bo‘ladi.

Misollarda asosan TypeScript’dan foydalanamiz, ammo siz istalgan payt **code snippet**larni vanilla JavaScript sintaksisiga **almashtirishingiz** mumkin (har bir snippet’ning yuqori o‘ng burchagidagi til tugmasini bosib toggling qiling).

#### Oldindan talablar

Operatsion tizimingizga Node.js (version >= 20) o‘rnatilganiga ishonch hosil qiling.

#### Sozlash

Yangi loyiha yaratish [Nest CLI](/docs/cli/overview) bilan juda oson. Agar sizda npm o‘rnatilgan bo‘lsa, OS terminalingizda quyidagi buyruqlar orqali yangi Nest loyihasini yaratishingiz mumkin:

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

> info **Hint** TypeScript’ning yanada qattiqroq (stricter) feature set’i bilan yangi loyiha yaratish uchun `nest new` buyrug‘iga `--strict` flag’ini qo‘shing.

`project-name` papkasi yaratiladi, node modules va yana bir nechta boilerplate fayllar o‘rnatiladi, so‘ng `src/` papkasi yaratiladi va bir nechta asosiy (core) fayllar bilan to‘ldiriladi.

<div class="file-tree">
  <div class="item">src</div>
  <div class="children">
    <div class="item">app.controller.spec.ts</div>
    <div class="item">app.controller.ts</div>
    <div class="item">app.module.ts</div>
    <div class="item">app.service.ts</div>
    <div class="item">main.ts</div>
  </div>
</div>

Quyida shu asosiy fayllar haqida qisqa overview:

|                          |                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `app.controller.ts`      | Bitta route’ga ega oddiy controller.                                                                 |
| `app.controller.spec.ts` | Controller uchun unit testlar.                                                                       |
| `app.module.ts`          | Ilovaning root (asosiy) moduli.                                                                      |
| `app.service.ts`         | Bitta metodga ega oddiy service.                                                                     |
| `main.ts`                | Ilovaning entry fayli — u `NestFactory` core funksiyasi orqali Nest ilovasi instansiyasini yaratadi. |

`main.ts` ichida async funksiya bor va u ilovamizni **bootstrap** qiladi:

```typescript
@@filename(main)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
@@switch
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Nest ilovasi instansiyasini yaratish uchun biz core `NestFactory` class’idan foydalanamiz. `NestFactory` ilova instansiyasini yaratishga imkon beradigan bir nechta static metodlarni taqdim etadi. `create()` metodi `INestApplication` interface’ini qanoatlantiradigan application object’ni qaytaradi. Bu object kelgusi bo‘limlarda tushuntiriladigan metodlar to‘plamini beradi. Yuqoridagi `main.ts` misolida biz shunchaki HTTP listener’ni ishga tushiramiz — natijada ilova kiruvchi HTTP so‘rovlarni kutib oladi.

E’tibor bering: Nest CLI orqali scaffold qilingan loyiha boshlang‘ich struktura yaratadi va bu struktura dasturchilarni har bir modulni o‘ziga ajratilgan alohida papkada saqlash konvensiyasiga rioya qilishga undaydi.

> info **Hint** Default holatda, agar ilovani yaratish jarayonida xatolik yuz bersa, ilova `1` kod bilan to‘xtaydi. Agar uning o‘rniga xatoni throw qilishini xohlasangiz, `abortOnError` opsiyasini o‘chirib qo‘ying (masalan, `NestFactory.create(AppModule, {{ '{' }} abortOnError: false {{ '}' }})`).

#### Platforma

Nest platformadan mustaqil (platform-agnostic) framework bo‘lishni maqsad qiladi. Platforma mustaqilligi qayta ishlatish mumkin bo‘lgan mantiqiy qismlarni yaratishga yordam beradi — dasturchilar bu qismlardan turli xil ilova turlarida foydalanishlari mumkin. Texnik jihatdan, adapter yaratilgan bo‘lsa, Nest istalgan Node HTTP framework bilan ishlay oladi. “Out-of-the-box” qo‘llab-quvvatlanadigan 2 ta HTTP platforma bor: express va fastify. Siz ehtiyojingizga eng mosini tanlashingiz mumkin.

|                    |                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `platform-express` | Express — node uchun mashhur minimalist web framework. U ko‘p bora sinovdan o‘tgan (battle tested), production-ready kutubxona bo‘lib, community tomonidan yaratilgan juda ko‘p resurslarga ega. Default holatda `@nestjs/platform-express` paketi ishlatiladi. Ko‘pchilik foydalanuvchilar uchun Express yetarli bo‘ladi va uni yoqish uchun alohida hech narsa qilish shart emas. |
| `platform-fastify` | Fastify — yuqori performance va past overhead’ga ega framework bo‘lib, maksimal samaradorlik va tezlikni berishga kuchli yo‘naltirilgan. Uni qanday ishlatishni [bu yerda](/docs/techniques/performance) o‘qing.                                                                                                                                                                        |

Qaysi platforma ishlatilishidan qat’i nazar, u o‘zining application interface’ini expose qiladi. Bular mos ravishda `NestExpressApplication` va `NestFastifyApplication` deb ko‘riladi.

Quyidagi misolda ko‘ringanidek, `NestFactory.create()` metodiga type bersangiz, `app` object’ida aynan o‘sha platformaga xos bo‘lgan metodlar ham paydo bo‘ladi. Biroq, siz underlying platform API’iga murojaat qilmoqchi bo‘lmasangiz, type ko‘rsatishingiz **shart emas**.

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

#### Ilovani ishga tushirish

O‘rnatish jarayoni tugagach, kiruvchi HTTP so‘rovlarni kutib oladigan serverni ishga tushirish uchun OS terminalingizda quyidagi buyruqni bajaring:

```bash
$ npm run start
```

> info **Hint** Development jarayonini tezlashtirish (build’lar x20 marta tezroq) uchun `start` script’iga `-b swc` flag’ini qo‘shib, [SWC builder](/docs/recipes/swc) dan foydalanishingiz mumkin: `npm run start -- -b swc`.

Bu buyruq ilovani `src/main.ts` faylida belgilangan portda HTTP server bilan ishga tushiradi. Ilova ishga tushgach, brauzerni ochib `http://localhost:3000/` manziliga o‘ting. Siz `Hello World!` xabarini ko‘rishingiz kerak.

Fayllaringizdagi o‘zgarishlarni kuzatib borish uchun ilovani quyidagi buyruq bilan ishga tushirishingiz mumkin:

```bash
$ npm run start:dev
```

Bu buyruq fayllaringizni kuzatadi va serverni avtomatik qayta kompilyatsiya qilib, qayta yuklaydi.

#### Linting va formatting

[CLI](/docs/cli/overview) katta miqyosda ishonchli development workflow’ni scaffold qilishga “best effort” qiladi. Shu sababli, generatsiya qilingan Nest loyihasida code **linter** va **formatter** oldindan o‘rnatilgan bo‘ladi (mos ravishda eslint va prettier).

> info **Hint** Formatter va linter roli o‘rtasidagi farq haqida aniq bilmayapsizmi? Farqini bu yerda o‘rganing.

Maksimal barqarorlik va kengaytiriluvchanlik uchun biz bazaviy `eslint` va `prettier` cli paketlaridan foydalanamiz. Bu setup dizayni bo‘yicha official extension’lar orqali IDE bilan chiroyli integratsiyani ta’minlaydi.

IDE kerak bo‘lmagan headless muhitlar (Continuous Integration, Git hooks va boshqalar) uchun Nest loyihasida tayyor `npm` script’lar mavjud.

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format
```
