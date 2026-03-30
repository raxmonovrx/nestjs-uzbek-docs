---
title: "Versiyalash"
navTitle: "Versiyalash"
description: "Versiyalash bir ilovada controllerlar yoki alohida route'larning turli versiyalarini ishga tushirish imkonini beradi. Ilovalar tez-tez o'zgaradi va oldingi versiyani qo'llab-quvvat"
order: 20
group: techniques
groupTitle: "Techniques"
---
> info **Hint** Ushbu bob faqat HTTP asosidagi ilovalar uchun dolzarb.

Versiyalash bir ilovada controllerlar yoki alohida route'larning **turli versiyalari**ni ishga tushirish imkonini beradi. Ilovalar tez-tez o'zgaradi va oldingi versiyani qo'llab-quvvatlash zarur bo'lgan paytda breaking changes kiritish odatiy hol.

Qo'llab-quvvatlanadigan versiyalashning 4 turi mavjud:

<table>
  <tr>
    <td><a href="/docs/techniques/versioning#uri-versioning-type"><code>URI Versioning</code></a></td>
    <td>Versiya so'rov URI ichida uzatiladi (default)</td>
  </tr>
  <tr>
    <td><a href="/docs/techniques/versioning#header-versioning-type"><code>Header Versioning</code></a></td>
    <td>Versiyani ko'rsatish uchun maxsus request header ishlatiladi</td>
  </tr>
  <tr>
    <td><a href="/docs/techniques/versioning#media-type-versioning-type"><code>Media Type Versioning</code></a></td>
    <td>So'rovning <code>Accept</code> header'i versiyani ko'rsatadi</td>
  </tr>
  <tr>
    <td><a href="/docs/techniques/versioning#custom-versioning-type"><code>Custom Versioning</code></a></td>
    <td>So'rovning istalgan jihati versiya(lar)ni ko'rsatish uchun ishlatilishi mumkin. Versiyani ajratib olish uchun maxsus funksiya taqdim etiladi.</td>
  </tr>
</table>

#### URI Versioning Type

URI Versioning so'rov URI ichida uzatilgan versiyani ishlatadi, masalan `https://example.com/v1/route` va `https://example.com/v2/route`.

> warning **Notice** URI Versioningda versiya <a href="/docs/faq/global-prefix">global path prefix</a>dan keyin (agar mavjud bo'lsa) va har qanday controller yoki route pathdan oldin avtomatik qo'shiladi.

Ilovangiz uchun URI Versioningni yoqish uchun quyidagilarni bajaring:

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);
```

> warning **Notice** URI dagi versiya default holatda avtomatik `v` prefiksi bilan keladi, ammo `prefix` kalitini istalgan prefiksga sozlash yoki uni o'chirish uchun `false` ga o'rnatish mumkin.

> info **Hint** `VersioningType` enumini `type` xossasi uchun ishlatish mumkin va u `@nestjs/common` paketidan import qilinadi.

#### Header Versioning Type

Header Versioning foydalanuvchi ko'rsatgan maxsus request header orqali versiyani belgilaydi; header qiymati so'rov uchun ishlatiladigan versiya bo'ladi.

Header Versioning uchun HTTP so'rovlar misollari:

Ilovangiz uchun **Header Versioning**ni yoqish uchun quyidagilarni bajaring:

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);
```

`header` xossasi so'rov versiyasini o'z ichiga oladigan header nomi bo'lishi kerak.

> info **Hint** `VersioningType` enumini `type` xossasi uchun ishlatish mumkin va u `@nestjs/common` paketidan import qilinadi.

#### Media Type Versioning Type

Media Type Versioning so'rovning `Accept` header'idan foydalanib versiyani ko'rsatadi.

`Accept` header ichida versiya media type'dan nuqtali-vergul bilan ajratiladi, `;`. So'ng u so'rov uchun ishlatiladigan versiyani ifodalovchi key-value juftligini o'z ichiga oladi, masalan `Accept: application/json;v=2`. Key versiyani aniqlashda ko'proq prefiks sifatida ko'riladi; versiyani aniqlash key va ajratgichni o'z ichiga oladigan qilib sozlanadi.

Ilovangiz uchun **Media Type Versioning**ni yoqish uchun quyidagilarni bajaring:

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);
```

`key` xossasi versiyani o'z ichiga olgan key-value juftligining key va ajratgichidan iborat bo'lishi kerak. `Accept: application/json;v=2` misolida `key` qiymati `v=` bo'ladi.

> info **Hint** `VersioningType` enumini `type` xossasi uchun ishlatish mumkin va u `@nestjs/common` paketidan import qilinadi.

#### Custom Versioning Type

Custom Versioning so'rovning istalgan jihatidan versiyani (yoki versiyalarni) ko'rsatish uchun foydalanadi. Kiruvchi so'rov `extractor` funksiyasi yordamida tahlil qilinadi va u satr yoki satrlar massivini qaytaradi.

Agar so'rovchi bir nechta versiyani taqdim etsa, extractor funksiya eng katta/yuqori versiyadan eng kichik/past versiyagacha tartiblangan satrlar massivini qaytarishi mumkin. Versiyalar yuqoridan pastgacha tartibda route'lar bilan moslashtiriladi.

Agar extractor bo'sh satr yoki bo'sh massiv qaytarsa, hech qanday route mos kelmaydi va 404 qaytariladi.

Masalan, agar kiruvchi so'rov `1`, `2`, `3` versiyalarini qo'llab-quvvatlashini ko'rsatsa, extractor **MUST** `[3, 2, 1]` ni qaytarishi kerak. Bu eng yuqori mumkin bo'lgan route versiyasi avval tanlanishini ta'minlaydi.

Agar `[3, 2, 1]` versiyalari ajratib olingan bo'lsa, lekin route'lar faqat `2` va `1` versiyalariga mavjud bo'lsa, `2` versiyasiga mos keluvchi route tanlanadi (`3` versiyasi avtomatik tarzda e'tibordan chetda qoladi).

> warning **Notice** Extractor qaytargan massiv asosida eng yuqori mos versiyani tanlash > dizayn cheklovlari sababli Express adapteri bilan **ishonchli ishlamaydi**. Expressda bitta versiya (satr yoki 1 elementli massiv) yaxshi ishlaydi. Fastify esa eng yuqori mos versiyani tanlash va bitta versiyani tanlashni to'g'ri qo'llab-quvvatlaydi.

Ilovangiz uchun **Custom Versioning**ni yoqish uchun `extractor` funksiyasini yarating va uni quyidagicha ilovaga uzating:

```typescript
@@filename(main)
// Example extractor that pulls out a list of versions from a custom header and turns it into a sorted array.
// This example uses Fastify, but Express requests can be processed in a similar way.
const extractor = (request: FastifyRequest): string | string[] =>
  [request.headers['custom-versioning-field'] ?? '']
     .flatMap(v => v.split(','))
     .filter(v => !!v)
     .sort()
     .reverse()

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
await app.listen(process.env.PORT ?? 3000);
```

#### Foydalanish

Versiyalash controllerlarni, individual route'larni versiyalash imkonini beradi, shuningdek ayrim resurslar versiyalashdan voz kechishi uchun yo'l taqdim etadi. Versiyalashdan foydalanish, ilovangiz qaysi Versioning Type'dan foydalanyapti deganidan qat'i nazar, bir xil.

> warning **Notice** Agar ilovada versiyalash yoqilgan bo'lsa, ammo controller yoki route versiyani ko'rsatmagan bo'lsa, ushbu controller/route'ga kelgan har qanday so'rov `404` javob statusini oladi. Xuddi shuningdek, so'rovda mavjud versiya uchun mos controller yoki route bo'lmasa, `404` qaytariladi.

#### Controller versiyalari

Controllerga versiya qo'llanishi mumkin, bu controller ichidagi barcha route'lar uchun versiyani belgilaydi.

Controllerga versiya qo'shish uchun quyidagilarni bajaring:

```typescript
@@filename(cats.controller)
@Controller({
  version: '1',
})
export class CatsControllerV1 {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1';
  }
}
@@switch
@Controller({
  version: '1',
})
export class CatsControllerV1 {
  @Get('cats')
  findAll() {
    return 'This action returns all cats for version 1';
  }
}
```

#### Route versiyalari

Versiya alohida route'ga qo'llanishi mumkin. Bu versiya route'ga ta'sir qiladigan boshqa versiyalarni, masalan Controller Version'ni override qiladi.

Alohida route'ga versiya qo'shish uchun quyidagilarni bajaring:

```typescript
@@filename(cats.controller)
import { Controller, Get, Version } from '@nestjs/common';

@Controller()
export class CatsController {
  @Version('1')
  @Get('cats')
  findAllV1(): string {
    return 'This action returns all cats for version 1';
  }

  @Version('2')
  @Get('cats')
  findAllV2(): string {
    return 'This action returns all cats for version 2';
  }
}
@@switch
import { Controller, Get, Version } from '@nestjs/common';

@Controller()
export class CatsController {
  @Version('1')
  @Get('cats')
  findAllV1() {
    return 'This action returns all cats for version 1';
  }

  @Version('2')
  @Get('cats')
  findAllV2() {
    return 'This action returns all cats for version 2';
  }
}
```

#### Bir nechta versiyalar

Controller yoki route'ga bir nechta versiya qo'llanilishi mumkin. Bir nechta versiyadan foydalanish uchun versiyani Array sifatida belgilang.

Bir nechta versiya qo'shish uchun quyidagilarni bajaring:

```typescript
@@filename(cats.controller)
@Controller({
  version: ['1', '2'],
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1 or 2';
  }
}
@@switch
@Controller({
  version: ['1', '2'],
})
export class CatsController {
  @Get('cats')
  findAll() {
    return 'This action returns all cats for version 1 or 2';
  }
}
```

#### Versiya "Neutral"

Ba'zi controllerlar yoki route'lar versiyadan qat'i nazar bir xil funksionallikka ega bo'lishi mumkin. Buni qo'llab-quvvatlash uchun versiyani `VERSION_NEUTRAL` symboliga o'rnatish mumkin.

Kiruvchi so'rov `VERSION_NEUTRAL` controller yoki route'ga so'rovda versiya bor-yo'qligidan qat'i nazar moslanadi.

> warning **Notice** URI Versioning uchun `VERSION_NEUTRAL` resursida URI'da versiya ko'rinmaydi.

Versiya neutral controller yoki route qo'shish uchun quyidagilarni bajaring:

```typescript
@@filename(cats.controller)
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  version: VERSION_NEUTRAL,
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats regardless of version';
  }
}
@@switch
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  version: VERSION_NEUTRAL,
})
export class CatsController {
  @Get('cats')
  findAll() {
    return 'This action returns all cats regardless of version';
  }
}
```

#### Global default versiya

Agar har bir controller yoki individual route uchun versiya berishni istamasangiz, yoki versiya ko'rsatilmagan controller/route'lar uchun default versiya belgilamoqchi bo'lsangiz, `defaultVersion` ni quyidagicha o'rnatishingiz mumkin:

```typescript
@@filename(main)
app.enableVersioning({
  // ...
  defaultVersion: '1'
  // or
  defaultVersion: ['1', '2']
  // or
  defaultVersion: VERSION_NEUTRAL
});
```

#### Middleware versiyalash

Middlewares ham versiyalash metadatasidan foydalanib middleware'ni muayyan route versiyasiga moslab sozlashi mumkin. Buning uchun `MiddlewareConsumer.forRoutes()` metodiga parametr sifatida versiya raqamini bering:

```typescript
@@filename(app.module)
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET, version: '2' });
  }
}
```

Yuqoridagi kod bilan `LoggerMiddleware` faqat `/cats` endpointining '2' versiyasiga qo'llanadi.

> info **Notice** Middleware'lar ushbu bo'limda ta'riflangan istalgan versiyalash turi bilan ishlaydi: `URI`, `Header`, `Media Type` yoki `Custom`.
