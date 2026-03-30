---
title: "Kirish"
navTitle: "Kirish"
description: "Nest (NestJS) — samarali va masshtablanadigan Node.js server-side ilovalarini yaratish uchun framework. U progressiv JavaScript’dan foydalanadi, to‘liq TypeScript asosida qurilgan "
order: 10
group: core
groupTitle: "Core"
---
Nest (NestJS) — samarali va masshtablanadigan Node.js server-side ilovalarini yaratish uchun framework. U progressiv JavaScript’dan foydalanadi, to‘liq TypeScript asosida qurilgan va uni to‘liq qo‘llab-quvvatlaydi (shu bilan birga, dasturchilarga sof JavaScript’da ham kod yozish imkonini beradi) hamda OOP (Object Oriented Programming), FP (Functional Programming) va FRP (Functional Reactive Programming) yondashuvlarining elementlarini birlashtiradi.

Ichki qatlamda (under the hood) Nest Express (standart) kabi ishonchli HTTP Server frameworklaridan foydalanadi va xohishga ko‘ra Fastify bilan ham sozlanishi mumkin!

Nest ushbu mashhur Node.js frameworklari (Express/Fastify) ustidan abstraksiya qatlamini taqdim etadi, ammo shu bilan birga ularning API’larini ham dasturchiga bevosita ochib beradi. Bu esa dasturchilarga asosiy platforma uchun mavjud bo‘lgan ko‘plab (myriad) third-party modullardan erkin foydalanish imkonini beradi.

#### Falsafa

So‘nggi yillarda Node.js tufayli JavaScript front-end va back-end ilovalar uchun web’ning “lingua franca”siga aylandi. Shu sababli Angular, React va Vue kabi ajoyib loyihalar paydo bo‘ldi — ular dasturchi samaradorligini oshiradi va tezkor, testlanadigan hamda kengaytiriladigan frontend ilovalar yaratishga yordam beradi. Biroq Node (va server-side JavaScript) uchun juda ko‘p zo‘r kutubxonalar, yordamchi vositalar va tool’lar mavjud bo‘lsa-da, ularning hech biri **arxitektura** muammosini to‘liq va samarali hal qilib bermaydi.

Nest “out-of-the-box” (tayyor) ilova arxitekturasini beradi — bu arxitektura dasturchilar va jamoalarga yuqori darajada testlanadigan, masshtablanadigan, bo‘sh bog‘langan (loosely coupled) va oson qo‘llab-quvvatlanadigan (maintainable) ilovalar yaratish imkonini beradi. Ushbu arxitektura kuchli tarzda Angular’dan ilhomlangan.

#### O‘rnatish

Boshlash uchun siz loyihani [Nest CLI](/docs/cli/overview) orqali scaffold qilishingiz yoki [starter project’ni clone](#alternatives) qilishingiz mumkin (ikkalasi ham bir xil natija beradi).

Nest CLI orqali scaffold qilish uchun quyidagi buyruqlarni ishga tushiring. Bu yangi loyiha papkasini yaratadi va uni Nest’ning boshlang‘ich asosiy fayllari hamda qo‘llab-quvvatlovchi modullar bilan to‘ldiradi — loyiha uchun odatiy (conventional) bazaviy struktura hosil bo‘ladi. Birinchi marta foydalanayotganlar uchun **Nest CLI** orqali yangi loyiha yaratish tavsiya etiladi. Biz ham shu yondashuvni [First Steps](/docs/core/first-steps) bo‘limida davom ettiramiz.

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

> info **Hint** Qattiqroq (stricter) feature set’ga ega yangi TypeScript loyiha yaratish uchun `nest new` buyrug‘iga `--strict` flag’ini qo‘shing.

#### Muqobil variantlar

Muqobil tarzda, TypeScript starter project’ni **Git** orqali o‘rnatish:

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start
```

> info **Hint** Agar repository’ni git tarixisiz clone qilishni xohlasangiz, degit dan foydalanishingiz mumkin.

Brauzeringizni oching va `http://localhost:3000/` manziliga o‘ting.

Starter project’ning JavaScript varianti uchun yuqoridagi buyruqlar ketma-ketligida `javascript-starter.git` dan foydalaning.

Shuningdek, core va supporting package’larni o‘rnatib, loyihani noldan ham boshlashingiz mumkin. Yodda tuting: project boilerplate fayllarini o‘zingiz sozlashingiz kerak bo‘ladi. Minimum darajada quyidagi dependency’lar kerak bo‘ladi: `@nestjs/core`, `@nestjs/common`, `rxjs`, va `reflect-metadata`. To‘liq loyiha yaratish bo‘yicha qisqa maqolani ko‘ring: 5 steps to create a bare minimum NestJS app from scratch!.
