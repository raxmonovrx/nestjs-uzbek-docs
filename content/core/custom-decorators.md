---
title: "Maxsus route dekoratorlari"
navTitle: "Maxsus route dekoratorlari"
description: "Nest dekoratorlar deb ataladigan til xususiyati atrofida qurilgan. Dekoratorlar ko'plab keng qo'llaniladigan dasturlash tillarida yaxshi tanish tushuncha, ammo JavaScript olamida u"
order: 4
group: core
groupTitle: "Core"
---
Nest **dekoratorlar** deb ataladigan til xususiyati atrofida qurilgan. Dekoratorlar ko'plab keng qo'llaniladigan dasturlash tillarida yaxshi tanish tushuncha, ammo JavaScript olamida ular hali nisbatan yangi. Dekoratorlar qanday ishlashini yaxshiroq tushunish uchun ushbu maqolani o'qishni tavsiya qilamiz. Quyida sodda ta'rif keltirilgan:

<blockquote class="external">
  ES2016 dekoratori funksiya qaytaradigan va target, name hamda property descriptorni argument sifatida qabul qiladigan ifodadir.
  Uni dekoratorni <code>@</code> belgisi bilan oldindan qo'yib va dekoratsiya qilmoqchi bo'lgan narsaning eng yuqori qismiga joylashtirib qo'llaysiz.
  Dekoratorlar sinf, metod yoki xossa uchun aniqlanishi mumkin.
</blockquote>

#### Param dekoratorlar

Nest HTTP route handlerlar bilan birga foydalanishingiz mumkin bo'lgan foydali **param dekoratorlar** to'plamini taqdim etadi. Quyida taqdim etilgan dekoratorlar va ular ifodalovchi oddiy Express (yoki Fastify) obyektlari ro'yxati keltirilgan.

<table>
  <tbody>
    <tr>
      <td><code>@Request(), @Req()</code></td>
      <td><code>req</code></td>
    </tr>
    <tr>
      <td><code>@Response(), @Res()</code></td>
      <td><code>res</code></td>
    </tr>
    <tr>
      <td><code>@Next()</code></td>
      <td><code>next</code></td>
    </tr>
    <tr>
      <td><code>@Session()</code></td>
      <td><code>req.session</code></td>
    </tr>
    <tr>
      <td><code>@Param(param?: string)</code></td>
      <td><code>req.params</code> / <code>req.params[param]</code></td>
    </tr>
    <tr>
      <td><code>@Body(param?: string)</code></td>
      <td><code>req.body</code> / <code>req.body[param]</code></td>
    </tr>
    <tr>
      <td><code>@Query(param?: string)</code></td>
      <td><code>req.query</code> / <code>req.query[param]</code></td>
    </tr>
    <tr>
      <td><code>@Headers(param?: string)</code></td>
      <td><code>req.headers</code> / <code>req.headers[param]</code></td>
    </tr>
    <tr>
      <td><code>@Ip()</code></td>
      <td><code>req.ip</code></td>
    </tr>
    <tr>
      <td><code>@HostParam()</code></td>
      <td><code>req.hosts</code></td>
    </tr>
  </tbody>
</table>

Bundan tashqari, siz o'zingizning **maxsus dekoratorlaringiz**ni ham yaratishingiz mumkin. Bu nima uchun foydali?

node.js dunyosida **request** obyektiga xossalarni biriktirish odatiy amaliyotdir. So'ng har bir route handlerda ularni quyidagi kabi kod bilan qo'lda ajratasiz:

```typescript
const user = req.user;
```

Kodingizni yanada o'qilishi oson va shaffof qilish uchun `@User()` dekoratorini yaratib, uni barcha controllerlaringiz bo'ylab qayta ishlatishingiz mumkin.

```typescript
@@filename(user.decorator)
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

Keyin uni talablaringizga mos joylarda shunchaki ishlatasiz.

```typescript
@@filename()
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}
@@switch
@Get()
@Bind(User())
async findOne(user) {
  console.log(user);
}
```

#### Ma'lumot uzatish

Agar dekoratoringiz xatti-harakati qandaydir shartlarga bog'liq bo'lsa, `data` parametridan foydalanib dekoratorning factory funksiyasiga argument uzatishingiz mumkin. Buning bir foydalanish holati - request obyektidan kalit bo'yicha xossalarni ajratib oladigan maxsus dekorator. Masalan, authentication layer so'rovlarni tekshiradi va request obyektiga user entity ni biriktiradi, deb tasavvur qilaylik. Autentifikatsiyadan o'tgan so'rov uchun user entity quyidagicha ko'rinishi mumkin:

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}
```

Keling, kalit sifatida xossa nomini qabul qilib, mavjud bo'lsa tegishli qiymatni (mavjud bo'lmasa yoki `user` obyekti yaratilmagan bo'lsa, undefined) qaytaradigan dekoratorni aniqlaylik.

```typescript
@@filename(user.decorator)
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
@@switch
import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return data ? user && user[data] : user;
});
```

So'ng controllerda `@User()` dekoratori orqali muayyan xossaga qanday kirishingiz mumkin:

```typescript
@@filename()
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}
@@switch
@Get()
@Bind(User('firstName'))
async findOne(firstName) {
  console.log(`Hello ${firstName}`);
}
```

Siz shu dekoratordan turli kalitlar bilan foydalanib, turli xossalarga kirishingiz mumkin. Agar `user` obyekti chuqur yoki murakkab bo'lsa, bu request handler implementatsiyalarini yanada oson va o'qilishi qulay qiladi.

> info **Hint** TypeScript foydalanuvchilari uchun eslatma: `createParamDecorator<T>()` generic hisoblanadi. Bu sizga tip xavfsizligini aniq belgilash imkonini beradi, masalan `createParamDecorator<string>((data, ctx) => ...)`. Muqobil ravishda, factory funksiyasida parametr tipini ko'rsatishingiz mumkin, masalan `createParamDecorator((data: string, ctx) => ...)`. Agar ikkalasini ham qoldirsangiz, `data` uchun tip `any` bo'ladi.

#### Pipe'lar bilan ishlash

Nest maxsus param dekoratorlarini o'rnatilganlari (`@Body()`, `@Param()` va `@Query()`) bilan bir xil tarzda ko'rib chiqadi. Bu pipe'lar maxsus anotatsiya qilingan parametrlarga ham qo'llanadi (bizning misollarda `user` argumenti). Bundan tashqari, pipe'ni to'g'ridan-to'g'ri maxsus dekoratorga qo'llashingiz mumkin:

```typescript
@@filename()
@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {
  console.log(user);
}
@@switch
@Get()
@Bind(User(new ValidationPipe({ validateCustomDecorators: true })))
async findOne(user) {
  console.log(user);
}
```

> info **Hint** `validateCustomDecorators` opsiyasi `true` ga o'rnatilishi kerak. `ValidationPipe` odatda maxsus dekoratorlar bilan belgilangan argumentlarni validatsiya qilmaydi.

#### Dekoratorlar kompozitsiyasi

Nest bir nechta dekoratorlarni kompozitsiya qilish uchun yordamchi metod taqdim etadi. Masalan, autentifikatsiyaga oid barcha dekoratorlarni bitta dekoratorga birlashtirmoqchi bo'lsangiz. Buni quyidagi konstruktsiya bilan qilish mumkin:

```typescript
@@filename(auth.decorator)
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
@@switch
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
```

Keyin ushbu maxsus `@Auth()` dekoratorini quyidagicha ishlatishingiz mumkin:

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}
```

Bu bitta deklaratsiya bilan to'rtta dekoratorning barchasi qo'llanishi bilan yakunlanadi.

> warning **Warning** `@nestjs/swagger` paketidagi `@ApiHideProperty()` dekoratori kompozitsiya qilinmaydi va `applyDecorators` funksiyasi bilan to'g'ri ishlamaydi.
