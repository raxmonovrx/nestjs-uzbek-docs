---
title: "Guardlar"
navTitle: "Guardlar"
description: "Guard - @Injectable() dekoratori bilan belgilangan, CanActivate interfeysini amalga oshiradigan sinf."
order: 8
group: core
groupTitle: "Core"
---
Guard - `@Injectable()` dekoratori bilan belgilangan, `CanActivate` interfeysini amalga oshiradigan sinf.

Guardlar **yagona mas'uliyat**ga ega. Ular run-time paytida mavjud bo'lgan muayyan shartlarga (masalan, permissions, roles, ACLs va hokazo) qarab, berilgan so'rov route handler tomonidan qayta ishlanishi yoki yo'qligini aniqlaydi. Bu ko'pincha **authorization** deb ataladi. Authorization (va odatda birga ishlaydigan uning yaqin tushunchasi **authentication**) an'anaviy Express ilovalarida odatda middleware tomonidan bajarilgan. Middleware autentifikatsiya uchun yaxshi tanlov, chunki tokenni validatsiya qilish va `request` obyektiga xossalarni biriktirish kabi ishlar muayyan route konteksti (va uning metadatasi) bilan kuchli bog'liq emas.

Ammo middleware tabiatan sodda. U `next()` funksiyasini chaqirgandan keyin qaysi handler bajarilishini bilmaydi. Boshqa tomondan, **Guardlar** `ExecutionContext` instansiyasiga kirish huquqiga ega, shuning uchun ular keyin nimaning bajarilishini aniq biladi. Ular exception filterlar, pipe'lar va interceptorlar kabi, request/response siklida aynan to'g'ri nuqtada qayta ishlash mantiqini joylashtirishga va buni deklarativ tarzda qilishga mo'ljallangan. Bu kodingizni DRY va deklarativ tutishga yordam beradi.

> info **Hint** Guardlar barcha middlewarelardan **keyin**, lekin har qanday interceptor yoki pipe'dan **oldin** bajariladi.

#### Authorization guard

Aytilganidek, **authorization** guardlar uchun ajoyib use-case, chunki muayyan route'lar faqat chaqiruvchi (odatda ma'lum autentifikatsiyadan o'tgan foydalanuvchi) yetarli ruxsatlarga ega bo'lgandagina mavjud bo'lishi kerak. Hozir quradigan `AuthGuard` autentifikatsiyadan o'tgan foydalanuvchini (va shu sababli token request headerlariga biriktirilganini) nazarda tutadi. U tokenni ajratib oladi va validatsiya qiladi, so'ng ajratilgan ma'lumotlardan foydalanib so'rov davom etishi mumkinligini aniqlaydi.

```typescript
@@filename(auth.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard {
  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```

> info **Hint** Ilovangizda autentifikatsiya mexanizmini qanday amalga oshirish bo'yicha real misol izlayotgan bo'lsangiz, [bu bob](/docs/security/authentication) ga qarang. Xuddi shuningdek, yanada murakkab authorization misoli uchun [bu sahifa](/docs/security/authorization) ga qarang.

`validateRequest()` funksiyasi ichidagi mantiq ehtiyojga qarab sodda yoki murakkab bo'lishi mumkin. Ushbu misolning asosiy maqsadi - guardlarning request/response sikliga qanday mos kelishini ko'rsatish.

Har bir guard `canActivate()` funksiyasini amalga oshirishi kerak. Bu funksiya joriy so'rovga ruxsat berilgan yoki berilmaganini ko'rsatuvchi boolean qaytaradi. U javobni sinxron yoki asinxron ( `Promise` yoki `Observable` orqali) qaytarishi mumkin. Nest qaytgan qiymatdan keyingi harakatni boshqarishda foydalanadi:

- agar `true` qaytarsa, so'rov qayta ishlanadi.
- agar `false` qaytarsa, Nest so'rovni rad etadi.

#### Execution context

`canActivate()` funksiyasi bitta argument qabul qiladi - `ExecutionContext` instansiyasi. `ExecutionContext` `ArgumentsHost` dan meros oladi. Biz `ArgumentsHost` ni oldin exception filters bobida ko'rganmiz. Yuqoridagi namunada biz faqat avval ishlatgan `ArgumentsHost` yordamchi metodlaridan foydalanib `Request` obyektiga havola oldik. Bu mavzu bo'yicha ko'proq ma'lumot uchun [exception filters](/docs/core/exception-filters#arguments-host) bobining **Arguments host** bo'limiga qarang.

`ArgumentsHost` ni kengaytirish orqali `ExecutionContext` hozirgi bajarilish jarayoni haqida qo'shimcha tafsilotlarni taqdim etadigan bir nechta yangi yordamchi metodlarni ham qo'shadi. Bu tafsilotlar keng ko'lamdagi controllerlar, metodlar va bajarilish kontekstlarida ishlay oladigan yanada umumiy guardlar qurishda foydali bo'lishi mumkin. `ExecutionContext` haqida batafsil [bu yerda](/docs/fundamentals/execution-context).

#### Role-based authentication

Keling, faqat muayyan roldagi foydalanuvchilarga kirishga ruxsat beradigan yanada funksional guard quramiz. Biz oddiy guard shablonidan boshlaymiz va keyingi bo'limlarda uni rivojlantiramiz. Hozircha u barcha so'rovlarning o'tishiga ruxsat beradi:

```typescript
@@filename(roles.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesGuard {
  canActivate(context) {
    return true;
  }
}
```

#### Guardlarni ulash

Pipe va exception filterlar kabi, guardlar **controller-scoped**, method-scoped yoki global-scoped bo'lishi mumkin. Quyida `@UseGuards()` dekoratori orqali controller-scoped guardni sozlaymiz. Bu dekorator bitta argumentni yoki vergul bilan ajratilgan argumentlar ro'yxatini qabul qilishi mumkin. Bu sizga bitta deklaratsiya bilan tegishli guardlar to'plamini qo'llash imkonini beradi.

```typescript
@@filename()
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

> info **Hint** `@UseGuards()` dekoratori `@nestjs/common` paketidan import qilinadi.

Yuqorida biz instansiya emas, `RolesGuard` sinfini uzatdik, instansiyalash mas'uliyatini freymvorkka qoldirib va dependency injection'ni yoqib. Pipe va exception filterlarda bo'lgani kabi, joyida instansiya ham uzatishimiz mumkin:

```typescript
@@filename()
@Controller('cats')
@UseGuards(new RolesGuard())
export class CatsController {}
```

Yuqoridagi konstruktsiya guardni ushbu controller tomonidan e'lon qilingan har bir handlerga biriktiradi. Agar guard faqat bitta metodga tatbiq etilishini istasak, `@UseGuards()` dekoratorini **metod darajasida** qo'llaymiz.

Global guardni sozlash uchun Nest ilova instansiyasining `useGlobalGuards()` metodidan foydalaning:

```typescript
@@filename()
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());
```

> warning **Notice** Gibrid ilovalar holatida `useGlobalGuards()` metodi odatda gatewaylar va mikroservislar uchun guardlarni sozlamaydi (bu xatti-harakatni qanday o'zgartirish haqida ma'lumot uchun [Hybrid application](/docs/faq/hybrid-application) ga qarang). "Standart" (gibrid bo'lmagan) mikroservis ilovalari uchun `useGlobalGuards()` guardlarni global tarzda o'rnatadi.

Global guardlar butun ilova bo'ylab, har bir controller va har bir route handler uchun ishlatiladi. Dependency injection nuqtai nazaridan shuni yodda tuting: har qanday moduldan tashqarida (`useGlobalGuards()` orqali, yuqoridagi misoldagidek) ro'yxatdan o'tkazilgan global guardlar bog'liqliklarni in'eksiya qila olmaydi, chunki bu modul kontekstidan tashqarida bajariladi. Bu muammoni hal qilish uchun quyidagi konstruktsiya yordamida guardni bevosita istalgan moduldan sozlashingiz mumkin:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

> info **Hint** Guard uchun dependency injection'ni shu yondashuv orqali bajarayotganda, bu konstruktsiya qaysi modulda qo'llanmasin, guard aslida global ekanini yodda tuting. Buni qayerda qilish kerak? Guard (`RolesGuard` yuqoridagi misolda) aniqlangan modulni tanlang. Shuningdek, `useClass` maxsus provayder ro'yxatga olishning yagona usuli emas. Batafsil bu yerda.

#### Har bir handler uchun rollarni belgilash

Bizning `RolesGuard` ishlayapti, ammo u hali unchalik aqlli emas. Biz guardning eng muhim xususiyatidan - [execution context](/docs/fundamentals/execution-context) dan hali foydalanmayapmiz. U hali rollar yoki har bir handler uchun qaysi rollar ruxsat etilganini bilmaydi. Masalan, `CatsController` turli route'lar uchun turli ruxsat sxemalariga ega bo'lishi mumkin. Ba'zilari faqat admin foydalanuvchi uchun mavjud bo'lishi mumkin, boshqalari esa hamma uchun ochiq. Rollarni marshrutlarga qanday qilib moslashuvchan va qayta foydalaniladigan tarzda bog'laymiz?

Bu yerda **custom metadata** yordamga keladi (batafsil [bu yerda](/docs/fundamentals/execution-context#reflection-and-metadata)). Nest custom **metadata** ni route handlerlarga `Reflector.createDecorator` statik metodi orqali yaratilgan dekoratorlar yoki o'rnatilgan `@SetMetadata()` dekoratori orqali biriktirish imkonini beradi.

Masalan, handlerga metadata biriktiradigan `@Roles()` dekoratorini `Reflector.createDecorator` metodi yordamida yaratamiz. `Reflector` freymvork tomonidan tayyor holatda taqdim etiladi va `@nestjs/core` paketidan eksport qilinadi.

```ts
@@filename(roles.decorator)
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
```

Bu yerdagi `Roles` dekoratori `string[]` tipidagi bitta argument qabul qiladigan funksiya.

Endi bu dekoratordan foydalanish uchun handlerni shunchaki unga annotatsiya qilamiz:

```typescript
@@filename(cats.controller)
@Post()
@Roles(['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@Roles(['admin'])
@Bind(Body())
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

Bu yerda `Roles` dekoratori metadata'sini `create()` metodiga biriktirdik, ya'ni faqat `admin` roliga ega foydalanuvchilar ushbu route'ga kirishi kerakligini ko'rsatdik.

Muqobil ravishda, `Reflector.createDecorator` metodidan foydalanish o'rniga o'rnatilgan `@SetMetadata()` dekoratoridan foydalanishimiz mumkin. Batafsil [bu yerda](/docs/fundamentals/execution-context#low-level-approach).

#### Hammasini birlashtiramiz

Endi orqaga qaytib, buni `RolesGuard` bilan birlashtiramiz. Hozir u barcha holatlarda `true` qaytaradi va har qanday so'rovning o'tishiga ruxsat beradi. Biz qaytish qiymatini **joriy foydalanuvchiga berilgan rollar** bilan joriy marshrut talab qilayotgan rollarni solishtirishga asoslab, shartli qilishni istaymiz. Marshrutning roli(lar)i (custom metadata) ga kirish uchun yana `Reflector` yordamchi sinfidan foydalanamiz, quyidagicha:

```typescript
@@filename(roles.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
@@switch
import { Injectable, Dependencies } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
@Dependencies(Reflector)
export class RolesGuard {
  constructor(reflector) {
    this.reflector = reflector;
  }

  canActivate(context) {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
```

> info **Hint** node.js dunyosida avtorizatsiyadan o'tgan foydalanuvchini `request` obyektiga biriktirish odatiy amaliyotdir. Shuning uchun, yuqoridagi namunaviy kodda biz `request.user` foydalanuvchi instansiyasini va ruxsat etilgan rollarni o'z ichiga oladi deb faraz qilamiz. Sizning ilovangizda, ehtimol, bu bog'lanishni maxsus **authentication guard** (yoki middleware) ichida qilasiz. Ushbu mavzu bo'yicha ko'proq ma'lumot uchun [bu bob](/docs/security/authentication) ga qarang.

> warning **Warning** `matchRoles()` funksiyasi ichidagi mantiq ehtiyojga qarab sodda yoki murakkab bo'lishi mumkin. Ushbu misolning asosiy maqsadi - guardlarning request/response sikliga qanday mos kelishini ko'rsatish.

`Reflector` ni kontekstga sezgir tarzda ishlatish bo'yicha batafsil ma'lumot uchun **Execution context** bobining <a href="/docs/fundamentals/execution-context#reflection-and-metadata">Reflection and metadata</a> bo'limiga qarang.

Huquqlari yetarli bo'lmagan foydalanuvchi endpoint so'raganda, Nest avtomatik ravishda quyidagi javobni qaytaradi:

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

E'tibor bering, ichkarida guard `false` qaytarganda, freymvork `ForbiddenException` tashlaydi. Agar siz boshqa xato javobini qaytarmoqchi bo'lsangiz, o'zingizga xos istisno tashlashingiz kerak. Masalan:

```typescript
throw new UnauthorizedException();
```

Guard tomonidan tashlangan har qanday istisno [exceptions layer](/docs/core/exception-filters) (global exceptions filter va joriy kontekstga qo'llangan istisno filterlari) tomonidan qayta ishlanadi.

> info **Hint** Authorizationni qanday amalga oshirish bo'yicha real misol izlayotgan bo'lsangiz, [bu bob](/docs/security/authorization) ga qarang.
