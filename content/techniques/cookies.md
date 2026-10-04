---
title: "Cookie'lar"
navTitle: "Cookie'lar"
description: "HTTP cookie - bu foydalanuvchi brauzerida saqlanadigan kichik ma'lumot bo'lagi. Cookie'lar saytlar holatga bog'liq ma'lumotlarni eslab qolishi uchun ishonchli mexanizm sifatida yar"
order: 4
group: techniques
groupTitle: "Techniques"
---
**HTTP cookie** - bu foydalanuvchi brauzerida saqlanadigan kichik ma'lumot bo'lagi. Cookie'lar saytlar holatga bog'liq ma'lumotlarni eslab qolishi uchun ishonchli mexanizm sifatida yaratilgan. Foydalanuvchi saytga yana kirganda, cookie so'rov bilan avtomatik yuboriladi.

#### Express bilan foydalanish (default)

Avval kerakli paketni (va TypeScript foydalanuvchilari uchun uning tiplari) o'rnating:

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser
```

O'rnatish tugagach, `cookie-parser` middleware'ini global middleware sifatida qo'llang (masalan, `main.ts` faylida).

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());
```

`cookieParser` middleware'iga bir nechta opsiyalarni uzatishingiz mumkin:

- `secret` cookie'larni imzolash uchun ishlatiladigan satr yoki massiv. Bu ixtiyoriy; ko'rsatilmasa, imzolangan cookie'larni parse qilmaydi. Agar satr berilsa, u secret sifatida ishlatiladi. Agar massiv berilsa, har bir secret bilan navbatma-navbat cookie'ni unsign qilishga urinadi.
- `options` `cookie.parse` ga ikkinchi opsiya sifatida uzatiladigan obyekt. Batafsil ma'lumot uchun cookie ga qarang.

Middleware so'rovdagi `Cookie` headerini parse qiladi va cookie ma'lumotlarini `req.cookies` xossasi sifatida, secret berilgan bo'lsa `req.signedCookies` xossasi sifatida ochib beradi. Bu xossalar cookie nomidan cookie qiymatiga bo'lgan name-value juftliklaridir.

Secret berilganda, modul imzolangan cookie qiymatlarini unsign va validatsiya qiladi hamda bu name-value juftliklarni `req.cookies` dan `req.signedCookies` ga ko'chiradi. Imzolangan cookie - bu qiymati `s:` prefiksi bilan boshlanadigan cookie. Imzo validatsiyasidan o'tmagan imzolangan cookie'larda qiymat buzilgan qiymat o'rniga `false` bo'ladi.

Shundan so'ng cookie'larni route handlerlar ichida quyidagicha o'qishingiz mumkin:

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}
```

> info **Hint** `@Req()` dekoratori `@nestjs/common` paketidan, `Request` esa `express` paketidan import qilinadi.

Chiqayotgan javobga cookie biriktirish uchun `Response#cookie()` metodidan foydalaning:

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}
```

> warning **Warning** Agar javobni qayta ishlash mantiqini freymvorkka qoldirmoqchi bo'lsangiz, yuqorida ko'rsatilgandek `passthrough` opsiyasini `true` qilib qo'yishni unutmang. Batafsil [bu yerda](/docs/core/controllers#library-specific-yondashuv).

> info **Hint** `@Res()` dekoratori `@nestjs/common` paketidan, `Response` esa `express` paketidan import qilinadi.

#### Fastify bilan foydalanish

Avval kerakli paketni o'rnating:

```shell
$ npm i @fastify/cookie
```

O'rnatish tugagach, `@fastify/cookie` plaginini ro'yxatdan o'tkazing:

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});
```

Shundan so'ng cookie'larni route handlerlar ichida quyidagicha o'qishingiz mumkin:

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}
```

> info **Hint** `@Req()` dekoratori `@nestjs/common` paketidan, `FastifyRequest` esa `fastify` paketidan import qilinadi.

Chiqayotgan javobga cookie biriktirish uchun `FastifyReply#setCookie()` metodidan foydalaning:

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}
```

`FastifyReply#setCookie()` metodi haqida ko'proq ma'lumot uchun ushbu sahifaga qarang.

> warning **Warning** Agar javobni qayta ishlash mantiqini freymvorkka qoldirmoqchi bo'lsangiz, yuqorida ko'rsatilgandek `passthrough` opsiyasini `true` qilib qo'yishni unutmang. Batafsil [bu yerda](/docs/core/controllers#library-specific-yondashuv).

> info **Hint** `@Res()` dekoratori `@nestjs/common` paketidan, `FastifyReply` esa `fastify` paketidan import qilinadi.

#### Maxsus dekorator yaratish (cross-platform)

Kiruvchi cookie'larga qulay, deklarativ tarzda kirish uchun [custom decorator](/docs/core/custom-decorators) yaratishimiz mumkin.

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});
```

`@Cookies()` dekoratori `req.cookies` obyektidan barcha cookie'larni yoki nomi berilgan cookie'ni ajratib oladi va dekoratsiya qilingan parametrni shu qiymat bilan to'ldiradi.

Shundan so'ng dekoratorni route handler imzosida quyidagicha ishlatamiz:

```typescript
@Get()
findAll(@Cookies('name') name: string) {}
```
