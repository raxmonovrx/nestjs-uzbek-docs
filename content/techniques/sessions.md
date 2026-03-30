---
title: "Sessiya"
navTitle: "Sessiya"
description: "HTTP sessiyalar foydalanuvchi haqidagi ma'lumotni bir nechta so'rovlar davomida saqlash imkonini beradi, bu ayniqsa MVC ilovalarida foydalidir."
order: 15
group: techniques
groupTitle: "Techniques"
---
**HTTP sessiyalar** foydalanuvchi haqidagi ma'lumotni bir nechta so'rovlar davomida saqlash imkonini beradi, bu ayniqsa [MVC](/docs/techniques/mvc) ilovalarida foydalidir.

#### Express bilan foydalanish (default)

Avval kerakli paketni o'rnating (TypeScript foydalanuvchilari uchun tiplari bilan):

```shell
$ npm i express-session
$ npm i -D @types/express-session
```

O'rnatish tugagach, `express-session` middleware ini global middleware sifatida qo'llang (masalan, `main.ts` faylida).

```typescript
import * as session from 'express-session';
// somewhere in your initialization file
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }),
);
```

> warning **Notice** Default server-tomon sessiya saqlash mexanizmi ataylab production muhiti uchun mo'ljallanmagan. U ko'p hollarda xotira oqishini keltirib chiqaradi, bitta jarayondan ortiq masshtablanmaydi va debugging hamda ishlab chiqish uchun mo'ljallangan. Batafsil rasmiy repozitoriyda o'qing.

`secret` sessiya ID cookie sini imzolash uchun ishlatiladi. Bu bitta secret uchun string yoki bir nechta secretlardan iborat massiv bo'lishi mumkin. Agar secretlar massivi berilsa, sessiya ID cookie sini imzolash uchun faqat birinchi element ishlatiladi, ammo so'rovlardagi imzoni tekshirishda barcha elementlar hisobga olinadi. Secretning o'zi odam tomonidan oson taxmin qilinmaydigan bo'lishi kerak va eng yaxshisi tasodifiy belgilar to'plami bo'ladi.

`resave` opsiyasini yoqish sessiyani, hatto so'rov davomida umuman o'zgartirilmagan bo'lsa ham, sessiya omboriga qayta saqlashni majbur qiladi. Default qiymati `true`, ammo defaultdan foydalanish eskirgan, chunki default qiymat kelajakda o'zgaradi.

Xuddi shuningdek, `saveUninitialized` opsiyasini yoqish "uninitialized" bo'lgan sessiyani omborga saqlashni majbur qiladi. Sessiya yangi, lekin o'zgartirilmagan bo'lsa, u uninitialized hisoblanadi. `false` ni tanlash login sessiyalarini implementatsiya qilishda, server saqlashdan foydalanishni kamaytirishda, yoki cookie o'rnatishdan oldin ruxsat talab qiladigan qonunlarga rioya qilishda foydali. `false` ni tanlash, shuningdek, klient sessiyasiz holda bir vaqtning o'zida bir nechta parallel so'rov yuboradigan holatlardagi race conditionlarni kamaytiradi (manba).

`session` middleware ga yana bir qancha opsiyalarni uzatishingiz mumkin, ular haqida batafsil API hujjatlarida o'qing.

> info **Hint** E'tibor bering, `secure: true` tavsiya etiladigan opsiya. Ammo u https yoqilgan saytni talab qiladi, ya'ni secure cookie uchun HTTPS zarur. Agar `secure` yoqilgan bo'lsa va siz saytga HTTP orqali kirayotgan bo'lsangiz, cookie o'rnatilmaydi. Agar node.js serveringiz proksi ortida bo'lsa va `secure: true` dan foydalanayotgan bo'lsangiz, express da `"trust proxy"` ni o'rnatishingiz kerak.

Shu bilan, endi route handlerlar ichida sessiya qiymatlarini o'rnatish va o'qish mumkin, quyidagicha:

```typescript
@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}
```

> info **Hint** `@Req()` dekoratori `@nestjs/common` dan, `Request` esa `express` paketidan import qilinadi.

Muqobil ravishda, `@Session()` dekoratoridan foydalanib so'rovdan sessiya obyektini ajratib olishingiz mumkin:

```typescript
@Get()
findAll(@Session() session: Record<string, any>) {
  session.visits = session.visits ? session.visits + 1 : 1;
}
```

> info **Hint** `@Session()` dekoratori `@nestjs/common` paketidan import qilinadi.

#### Fastify bilan foydalanish

Avval kerakli paketni o'rnating:

```shell
$ npm i @fastify/secure-session
```

O'rnatish tugagach, `fastify-secure-session` plaginini ro'yxatdan o'tkazing:

```typescript
import secureSession from '@fastify/secure-session';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
await app.register(secureSession, {
  secret: 'averylogphrasebiggerthanthirtytwochars',
  salt: 'mq9hDxBVDbspDR6n',
});
```

> info **Hint** Kalitni oldindan generatsiya qilishingiz (ko'rsatmalarni ko'ring) yoki kalitlarni aylantirishdan foydalanishingiz ham mumkin.

Mavjud opsiyalar haqida batafsil rasmiy repozitoriyda o'qing.

Shu bilan, endi route handlerlar ichida sessiya qiymatlarini o'rnatish va o'qish mumkin, quyidagicha:

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  const visits = request.session.get('visits');
  request.session.set('visits', visits ? visits + 1 : 1);
}
```

Muqobil ravishda, `@Session()` dekoratoridan foydalanib so'rovdan sessiya obyektini ajratib olishingiz mumkin:

```typescript
@Get()
findAll(@Session() session: secureSession.Session) {
  const visits = session.get('visits');
  session.set('visits', visits ? visits + 1 : 1);
}
```

> info **Hint** `@Session()` dekoratori `@nestjs/common` dan, `secureSession.Session` esa `@fastify/secure-session` paketidan import qilinadi (import bayonoti: `import * as secureSession from '@fastify/secure-session'`).
