---
title: "In'eksiya qamrovlari"
navTitle: "In'eksiya qamrovlari"
description: "Turli dasturlash tilidan kelganlar uchun, Nestda deyarli hamma narsa kiruvchi so'rovlar bo'ylab birgalikda ishlatilishini bilish kutilmagan bo'lishi mumkin. Bizda ma'lumotlar bazas"
order: 11
group: fundamentals
groupTitle: "Fundamentals"
---
Turli dasturlash tilidan kelganlar uchun, Nestda deyarli hamma narsa kiruvchi so'rovlar bo'ylab birgalikda ishlatilishini bilish kutilmagan bo'lishi mumkin. Bizda ma'lumotlar bazasi uchun connection pool, global holatga ega singleton servislar va hokazo bor. Shuni yodda tutingki, Node.js har bir so'rov alohida oqimda qayta ishlanadigan request/response Multi-Threaded Stateless Modelga amal qilmaydi. Shu sababli, singleton instansiyalaridan foydalanish ilovalarimiz uchun to'liq **xavfsiz**.

Biroq, ayrim chekka holatlarda so'rovga asoslangan yashash muddati kerak bo'lishi mumkin, masalan, GraphQL ilovalarida har bir so'rov uchun keshlash, so'rovlarni kuzatish va multi-tenant. In'eksiya qamrovlari provayderning kerakli yashash muddati xatti-harakatini olish mexanizmini taqdim etadi.

#### Provayder qamrovi

Provayder quyidagi qamrovlardan biriga ega bo'lishi mumkin:

<table>
  <tr>
    <td><code>DEFAULT</code></td>
    <td>Provayderning bitta instansiyasi butun ilova bo'ylab ulashiladi. Instansiyaning yashash muddati bevosita ilova lifecycle'iga bog'langan. Ilova bootstrapping qilingach, barcha singleton provayderlar instansiyalanadi. Singleton qamrov standart holatda qo'llaniladi.</td>
  </tr>
  <tr>
    <td><code>REQUEST</code></td>
    <td>Provayderning yangi instansiyasi faqat har bir kiruvchi <strong>so'rov</strong> uchun yaratiladi. So'rov qayta ishlanishi tugagach, instansiya garbage-collected bo'ladi.</td>
  </tr>
  <tr>
    <td><code>TRANSIENT</code></td>
    <td>Transient provayderlar consumerlar o'rtasida bo'lishilmaydi. Transient provayderni in'eksiya qilgan har bir consumer yangi, alohida instansiyani oladi.</td>
  </tr>
</table>

> info **Hint** Ko'pchilik use-case'lar uchun singleton qamrovdan foydalanish **tavsiya etiladi**. Provayderlarni consumerlar va so'rovlar bo'ylab ulashish instansiyani keshlash imkonini beradi va uning inicializatsiyasi ilova ishga tushishida faqat bir marta sodir bo'ladi.

#### Foydalanish

In'eksiya qamrovini `@Injectable()` dekoratori opsiyalar obyektidagi `scope` xossasi orqali belgilang:

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

Xuddi shuningdek, custom providers uchun provayderni ro'yxatdan o'tkazishda to'liq yozuvdagi `scope` xossasini belgilang:

```typescript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}
```

> info **Hint** `Scope` enumini `@nestjs/common` paketidan import qiling

Singleton qamrov standart holatda qo'llaniladi va e'lon qilish shart emas. Agar provayderni singleton qamrovli qilib aniq ko'rsatmoqchi bo'lsangiz, `scope` xossasi uchun `Scope.DEFAULT` qiymatidan foydalaning.

> warning **Notice** Websocket Gateway'lar request-scoped provayderlardan foydalanmasligi kerak, chunki ular singleton sifatida ishlashi shart. Har bir gateway real socketni kapsullaydi va bir necha marta instansiyalanishi mumkin emas. Bu cheklov boshqa ba'zi provayderlarga ham tegishli, masalan [_Passport strategies_](/docs/security/authentication#request-scoped-strategies) yoki _Cron controllers_.

#### Controller qamrovi

Controllerlar ham qamrovga ega bo'lishi mumkin, u shu controllerda e'lon qilingan barcha request metod handlerlariga tatbiq etiladi. Provayder qamrovidagi kabi, controller qamrovi uning yashash muddatini belgilaydi. Request-scoped controller uchun har bir kiruvchi so'rovda yangi instansiya yaratiladi va so'rov qayta ishlanishi tugagach garbage-collected bo'ladi.

Controller qamrovini `ControllerOptions` obyektining `scope` xossasi bilan e'lon qiling:

```typescript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}
```

#### Qamrov ierarxiyasi

`REQUEST` qamrovi in'eksiya zanjiri bo'ylab yuqoriga ko'tariladi. Request-scoped provayderga bog'liq controllerning o'zi ham request-scoped bo'ladi.

Quyidagi bog'liqlik grafini tasavvur qiling: `CatsController <- CatsService <- CatsRepository`. Agar `CatsService` request-scoped bo'lsa (boshqalari default singleton bo'lsa), `CatsController` ham request-scoped bo'ladi, chunki u in'eksiya qilingan servisga bog'liq. Bog'liqlikka ega bo'lmagan `CatsRepository` singleton qamrovda qoladi.

Transient qamrovli bog'liqliklar bunday andozaga amal qilmaydi. Agar singleton qamrovli `DogsService` transient `LoggerService` provayderini in'eksiya qilsa, u uning yangi instansiyasini oladi. Biroq `DogsService` singleton qamrovda qoladi, shuning uchun uni qayerda in'eksiya qilsangiz ham `DogsService` ning yangi instansiyasi yechilmaydi. Agar kerakli xulq shu bo'lsa, `DogsService` ham aniq `TRANSIENT` sifatida belgilanishi kerak.

#### Request provayderi

HTTP serveriga asoslangan ilovada (masalan, `@nestjs/platform-express` yoki `@nestjs/platform-fastify` ishlatilganda), request-scoped provayderlardan foydalanishda original request obyektiga havola olishni xohlashingiz mumkin. Buni `REQUEST` obyektini in'eksiya qilish orqali qilasiz.

`REQUEST` provayderi tabiatan request-scoped, ya'ni uni ishlatishda `REQUEST` qamrovini aniq ko'rsatishingiz shart emas. Bundan tashqari, buni qilmoqchi bo'lsangiz ham, u e'tiborga olinmaydi. Request-scoped provayderga tayanadigan har qanday provayder avtomatik ravishda request scope'ni qabul qiladi va bu xatti-harakatni o'zgartirib bo'lmaydi.

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
```

Underlying platform/protokol farqlari sababli, Microservice yoki GraphQL ilovalari uchun kiruvchi requestga kirish biroz boshqacha. [GraphQL](/docs/graphql/quick-start) ilovalarida `REQUEST` o'rniga `CONTEXT` ni in'eksiya qilasiz:

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT } from '@nestjs/graphql';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private context) {}
}
```

So'ng `context` qiymatini (`GraphQLModule` da) `request` xossasini o'z ichiga oladigan qilib sozlaysiz.

#### Inquirer provayderi

Agar provayder qaysi sinfda qurilganini bilmoqchi bo'lsangiz (masalan, logging yoki metrics provayderlarida), `INQUIRER` tokenini in'eksiya qilishingiz mumkin.

```typescript
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class HelloService {
  constructor(@Inject(INQUIRER) private parentClass: object) {}

  sayHello(message: string) {
    console.log(`${this.parentClass?.constructor?.name}: ${message}`);
  }
}
```

Va undan quyidagicha foydalaning:

```typescript
import { Injectable } from '@nestjs/common';
import { HelloService } from './hello.service';

@Injectable()
export class AppService {
  constructor(private helloService: HelloService) {}

  getRoot(): string {
    this.helloService.sayHello('My name is getRoot');

    return 'Hello world!';
  }
}
```

Yuqoridagi misolda `AppService#getRoot` chaqirilganda, konsolga `"AppService: My name is getRoot"` logi chiqadi.

#### Performance

Request-scoped provayderlardan foydalanish ilova ishlashiga ta'sir qiladi. Nest imkon qadar ko'p metadatalarni keshlashga harakat qilsa-da, baribir har bir so'rovda sinf instansiyasini yaratishi kerak bo'ladi. Shu sababli, o'rtacha javob vaqti va umumiy benchmarking natijalari sekinlashadi. Provayder request-scoped bo'lishi shart bo'lmagan hollarda, standart singleton qamrovdan foydalanish qat'iy tavsiya etiladi.

> info **Hint** Bu juda qo'rqinchli tuyulsa-da, request-scoped provayderlardan to'g'ri foydalangan holda yaratilgan ilova kechikish bo'yicha ~5% dan ortiq sekinlashmasligi kerak.

#### Durable provayderlar

Oldingi bo'limda aytilganidek, request-scoped provayderlar latency'ni oshirishi mumkin, chunki kamida 1 ta request-scoped provayderga ega bo'lish (controller instansiyasiga in'eksiya qilingan, yoki undan chuqurroq - uning provayderlaridan biriga in'eksiya qilingan) controllerning o'zi ham request-scoped bo'lishiga olib keladi. Bu har bir so'rov uchun controller qayta yaratilishini (instansiyalanishini) va keyin garbage collected bo'lishini anglatadi. Bu shuni ham anglatadiki, masalan 30k parallel so'rov bo'lsa, controller (va uning request-scoped provayderlari) ning 30k efemer instansiyasi bo'ladi.

Ko'plab provayderlar tayanadigan umumiy provayder (masalan, ma'lumotlar bazasi ulanishi yoki logger servisi) bo'lsa, u avtomatik ravishda bu provayderlarning barchasini ham request-scoped qiladi. Bu **multi-tenant ilovalar**da muammo bo'lishi mumkin, ayniqsa so'rov obyektidan header/token olib, shu qiymatlarga ko'ra mos ma'lumotlar bazasi ulanishi/sxemasini (aynan o'sha tenant uchun) olishga mo'ljallangan markaziy request-scoped "data source" provayderi bo'lsa.

Masalan, ilovangiz navbatma-navbat 10 ta turli mijoz tomonidan ishlatiladi deylik. Har bir mijozning **o'ziga xos data source**i bor va siz A mijoz hech qachon B mijoz bazasiga kira olmasligiga ishonch hosil qilmoqchisiz. Bunga erishishning bir yo'li - request obyektiga qarab "joriy mijoz"ni aniqlaydigan va uning mos bazasini oladigan request-scoped "data source" provayderini e'lon qilish. Bu yondashuv bilan ilovani bir necha daqiqada multi-tenant ilovaga aylantirishingiz mumkin. Ammo bu yondashuvning katta kamchiligi shundaki, ehtimol ilovangiz komponentlarining katta qismi "data source" provayderiga tayanadi va ular bevosita "request-scoped" bo'lib qoladi. Natijada, ilova performance'iga ta'sirni albatta ko'rasiz.

Biroq, yaxshiroq yechim bo'lsa-chi? Bizda faqat 10 ta mijoz borligi sabab, har bir so'rovda daraxtni qayta yaratish o'rniga har bir mijoz uchun 10 ta alohida DI sub-tree bo'lsa bo'lmaydimi? Agar provayderlaringiz har bir ketma-ket so'rov uchun haqiqatan ham noyob bo'lgan xossalarga (masalan, request UUID) tayanmasa, balki ularni agregatsiya (klassifikatsiya) qilish imkonini beradigan ayrim atributlar bo'lsa, har bir so'rovda _DI sub-tree'ni qayta yaratish_ uchun sabab yo'q.

Va aynan shu paytda **durable provayderlar** yordamga keladi.

Provayderlarni durable qilib belgilashdan oldin, Nestga "umumiy request atributlari" nimaligini aytadigan **strategiya**ni ro'yxatdan o'tkazishimiz kerak; bu strategiya so'rovlarni guruhlaydi - ularni mos DI sub-tree'lariga bog'laydi.

```typescript
import {
  HostComponentInfo,
  ContextId,
  ContextIdFactory,
  ContextIdStrategy,
} from '@nestjs/core';
import { Request } from 'express';

const tenants = new Map<string, ContextId>();

export class AggregateByTenantContextIdStrategy implements ContextIdStrategy {
  attach(contextId: ContextId, request: Request) {
    const tenantId = request.headers['x-tenant-id'] as string;
    let tenantSubTreeId: ContextId;

    if (tenants.has(tenantId)) {
      tenantSubTreeId = tenants.get(tenantId);
    } else {
      tenantSubTreeId = ContextIdFactory.create();
      tenants.set(tenantId, tenantSubTreeId);
    }

    // If tree is not durable, return the original "contextId" object
    return (info: HostComponentInfo) =>
      info.isTreeDurable ? tenantSubTreeId : contextId;
  }
}
```

> info **Hint** Request qamrovida bo'lgani kabi, durability ham in'eksiya zanjiri bo'ylab yuqoriga ko'tariladi. Ya'ni A provayderi `durable` deb belgilangan B ga bog'liq bo'lsa, A ham bevosita durable bo'ladi (A provayderida `durable` aniq `false` qilib qo'yilmagan bo'lsa).

> warning **Warning** E'tibor bering, ushbu strategiya tenantlar soni juda ko'p bo'lgan ilovalar uchun ideal emas.

`attach` metodidan qaytgan qiymat Nestga berilgan host uchun qaysi context identifier ishlatilishini bildiradi. Bu holatda, host komponent (masalan, request-scoped controller) durable deb belgilansa, original auto-generated `contextId` obyektining o'rniga `tenantSubTreeId` ishlatilishini ko'rsatdik (provayderlarni durable qilib belgilashni quyida ko'rasiz). Shuningdek, yuqoridagi misolda **payload** ro'yxatdan o'tkazilmaydi (payload = sub-tree'ning "root" - parenti bo'lgan `REQUEST`/`CONTEXT` provayderi).

Agar durable tree uchun payload ro'yxatdan o'tkazmoqchi bo'lsangiz, quyidagi konstruktsiyadan foydalaning:

```typescript
// The return of `AggregateByTenantContextIdStrategy#attach` method:
return {
  resolve: (info: HostComponentInfo) =>
    info.isTreeDurable ? tenantSubTreeId : contextId,
  payload: { tenantId },
};
```

Endi `@Inject(REQUEST)`/`@Inject(CONTEXT)` orqali `REQUEST` provayderini (yoki GraphQL ilovalari uchun `CONTEXT`ni) in'eksiya qilganingizda, `payload` obyekti in'eksiya qilinadi (bu holatda yagona `tenantId` xossasidan iborat).

Mayli, strategiya tayyor bo'ldi, endi uni kodingizning biror joyida (baribir u global qo'llanadi) ro'yxatdan o'tkazishingiz mumkin, masalan `main.ts` faylida:

```typescript
ContextIdFactory.apply(new AggregateByTenantContextIdStrategy());
```

> info **Hint** `ContextIdFactory` sinfi `@nestjs/core` paketidan import qilinadi.

Ro'yxatdan o'tkazish ilovaga biror so'rov kelishidan oldin sodir bo'lsa, hammasi kutilgandek ishlaydi.

Oxirida, oddiy provayderni durable provayderga aylantirish uchun `durable` bayrog'ini `true` qilib belgilang va uning qamrovini `Scope.REQUEST` ga o'zgartiring (agar REQUEST qamrovi in'eksiya zanjirida allaqachon bo'lsa, shart emas):

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST, durable: true })
export class CatsService {}
```

Xuddi shuningdek, custom providers uchun provayder ro'yxatdan o'tkazishda to'liq yozuvdagi `durable` xossasini belgilang:

```typescript
{
  provide: 'foobar',
  useFactory: () => { ... },
  scope: Scope.REQUEST,
  durable: true,
}
```
