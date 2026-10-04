---
title: "Keshlash"
navTitle: "Keshlash"
description: "Keshlash ilovangiz unumdorligini oshirish uchun kuchli va sodda texnika. U vaqtinchalik saqlash qatlamini taqdim etib, tez-tez ishlatiladigan ma'lumotlarga tezroq kirishni ta'minla"
order: 1
group: techniques
groupTitle: "Techniques"
---
Keshlash ilovangiz unumdorligini oshirish uchun kuchli va sodda **texnika**. U vaqtinchalik saqlash qatlamini taqdim etib, tez-tez ishlatiladigan ma'lumotlarga tezroq kirishni ta'minlaydi va bir xil ma'lumotni qayta-qayta olish yoki hisoblash zaruratini kamaytiradi. Natijada javob vaqti tezlashadi va umumiy samaradorlik oshadi.

#### O'rnatish

Nestda keshlashni boshlash uchun `@nestjs/cache-manager` paketi bilan birga `cache-manager` paketini o'rnatishingiz kerak.

```bash
$ npm install @nestjs/cache-manager cache-manager
```

Standart holatda hamma narsa xotirada saqlanadi; `cache-manager` ichkarida Keyv dan foydalangani uchun, mos paketni o'rnatib, Redis kabi yanada rivojlangan saqlash yechimiga oson o'tishingiz mumkin. Buni keyinroq batafsil ko'rib chiqamiz.

#### Xotira ichidagi kesh

Ilovangizda keshlashni yoqish uchun `CacheModule` ni import qiling va `register()` metodi orqali sozlang:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class AppModule {}
```

Bu sozlama xotira ichidagi keshlashni default sozlamalar bilan ishga tushiradi va darhol ma'lumotlarni keshlashni boshlash imkonini beradi.

#### Cache store bilan ishlash

Cache manager instansiyasi bilan ishlash uchun `CACHE_MANAGER` tokeni yordamida uni sinfingizga in'eksiya qiling:

```typescript
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
```

> info **Hint** `Cache` sinfi va `CACHE_MANAGER` tokeni ikkalasi ham `@nestjs/cache-manager` paketidan import qilinadi.

`Cache` instansiyasidagi `get` metodi (`cache-manager` paketidan) keshdan elementlarni olish uchun ishlatiladi. Agar element keshda mavjud bo'lmasa, `null` qaytariladi.

```typescript
const value = await this.cacheManager.get('key');
```

Keshga element qo'shish uchun `set` metodidan foydalaning:

```typescript
await this.cacheManager.set('key', 'value');
```

> warning **Note** Xotira ichidagi kesh faqat structured clone algorithm qo'llab-quvvatlaydigan tiplardagi qiymatlarni saqlay oladi.

Muayyan kalit uchun TTL (millisekundlardagi amal qilish muddati) ni qo'lda ko'rsatishingiz mumkin, quyidagicha:

```typescript
await this.cacheManager.set('key', 'value', 1000);
```

Bu yerda `1000` TTL millisekundlarda - bu holatda kesh elementi bir soniyadan keyin yaroqsiz bo'ladi.

Keshning eskirishini o'chirish uchun `ttl` konfiguratsiya xossasini `0` ga o'rnating:

```typescript
await this.cacheManager.set('key', 'value', 0);
```

Keshdan elementni o'chirish uchun `del` metodidan foydalaning:

```typescript
await this.cacheManager.del('key');
```

Butun keshni tozalash uchun `clear` metodidan foydalaning:

```typescript
await this.cacheManager.clear();
```

#### Javoblarni avtomatik keshlash

> warning **Warning** [GraphQL](/docs/graphql/quick-start) ilovalarida interceptorlar har bir field resolver uchun alohida bajariladi. Shuning uchun `CacheModule` (javoblarni keshlash uchun interceptorlardan foydalanadi) to'g'ri ishlamaydi.

Javoblarni avtomatik keshlashni yoqish uchun, ma'lumot keshlanadigan joyda `CacheInterceptor` ni bog'lang.

```typescript
@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] {
    return [];
  }
}
```

> warning**Warning** Faqat `GET` endpointlar keshlanadi. Shuningdek, native response obyektini in'eksiya qiladigan HTTP server route'lari (`@Res()`) Cache Interceptor'dan foydalana olmaydi. Batafsil ma'lumot uchun
> <a href="/docs/core/interceptors#response-mapping">response mapping</a> ga qarang.

Kerakli boilerplate miqdorini kamaytirish uchun `CacheInterceptor` ni barcha endpointlarga global tarzda bog'lashingiz mumkin:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
```

#### Time-to-live (TTL)

`ttl` ning default qiymati `0`, ya'ni kesh hech qachon eskirmaydi. Maxsus TTL ni ko'rsatish uchun `register()` metodida `ttl` opsiyasini bering, quyidagicha:

```typescript
CacheModule.register({
  ttl: 5000, // milliseconds
});
```

#### Modulni global ishlatish

`CacheModule` ni boshqa modullarda ishlatmoqchi bo'lsangiz, uni import qilishingiz kerak (istalgan Nest modulida bo'lgani kabi). Muqobil ravishda, opsiyalar obyektidagi `isGlobal` xossasini `true` qilib, uni [global modul](/docs/core/modules#global-modullar) sifatida e'lon qilishingiz mumkin, quyida ko'rsatilgandek. Bunda `CacheModule` bir marta root modulda (masalan, `AppModule`) yuklangach, boshqa modullarda uni import qilishingiz shart bo'lmaydi.

```typescript
CacheModule.register({
  isGlobal: true,
});
```

#### Global kesh override'lari

Global kesh yoqilganda, kesh yozuvlari route path asosida avtomatik generatsiya qilingan `CacheKey` ostida saqlanadi. Siz `@CacheKey()` va `@CacheTTL()` yordamida kesh sozlamalarini har bir metod bo'yicha override qilishingiz mumkin, bu har bir controller metodi uchun alohida keshlash strategiyalarini taqdim etadi. Bu ko'proq [turli kesh store'larini](/docs/techniques/caching#muqobil-cache-storelardan-foydalanish) ishlatayotganda dolzarb bo'ladi.

Butun controller uchun TTL belgilash uchun `@CacheTTL()` dekoratorini controller darajasida qo'llashingiz mumkin. Agar controller darajasida ham, metod darajasida ham cache TTL sozlamalari berilgan bo'lsa, metod darajasidagi sozlama ustuvor bo'ladi.

```typescript
@Controller()
@CacheTTL(50)
export class AppController {
  @CacheKey('custom_key')
  @CacheTTL(20)
  findAll(): string[] {
    return [];
  }
}
```

> info **Hint** `@CacheKey()` va `@CacheTTL()` dekoratorlari `@nestjs/cache-manager` paketidan import qilinadi.

`@CacheKey()` dekoratori mos `@CacheTTL()` dekoratorisiz ham, aksincha ham ishlatilishi mumkin. Kimdir faqat `@CacheKey()` yoki faqat `@CacheTTL()` ni override qilishni tanlashi mumkin. Dekorator bilan override qilinmagan sozlamalar global ro'yxatdan o'tkazilgandagi default qiymatlardan foydalanadi (qarang [Customize caching](/docs/techniques/caching#modulni-global-ishlatish)).

#### WebSockets va Microservices

`CacheInterceptor` ni WebSocket subscriberlariga ham, Microservice patternlariga ham (qaysi transport metodi ishlatilishidan qat'i nazar) qo'llashingiz mumkin.

```typescript
@@filename()
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
@@switch
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client, data) {
  return [];
}
```

Biroq, keyinchalik keshlangan ma'lumotlarni saqlash va olish uchun ishlatiladigan kalitni ko'rsatish maqsadida qo'shimcha `@CacheKey()` dekoratori talab qilinadi. Shuningdek, **hamma narsani keshlamasligingiz** kerakligini unutmang. Ma'lumotni shunchaki so'rashdan ko'ra biznes operatsiyalarni bajaradigan amallar hech qachon keshlanmasligi kerak.

Bundan tashqari, `@CacheTTL()` dekoratori yordamida keshning amal qilish muddati (TTL)ni ko'rsatishingiz mumkin, u global default TTL qiymatini override qiladi.

```typescript
@@filename()
@CacheTTL(10)
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
@@switch
@CacheTTL(10)
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client, data) {
  return [];
}
```

> info **Hint** `@CacheTTL()` dekoratori mos `@CacheKey()` dekoratorisiz ham ishlatilishi mumkin.

#### Trackingni moslash

Standart holatda Nest endpointlaringiz bilan kesh yozuvlarini bog'lash uchun request URL (HTTP ilovada) yoki kesh kalitidan (websocket va microservice ilovalarida, `@CacheKey()` dekoratori orqali beriladi) foydalanadi. Shunga qaramay, ba'zan trackingni boshqa omillar asosida sozlashni xohlashingiz mumkin, masalan, HTTP headerlar (masalan, `Authorization` orqali `profile` endpointlarini to'g'ri identifikatsiya qilish).

Buni amalga oshirish uchun `CacheInterceptor` dan meros olib, `trackBy()` metodini override qiling.

```typescript
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'key';
  }
}
```

#### Muqobil Cache store'lardan foydalanish

Boshqa kesh store'ga o'tish juda sodda. Avval mos paketni o'rnating. Masalan, Redisdan foydalanish uchun `@keyv/redis` paketini o'rnating:

```bash
$ npm install @keyv/redis
```

Shundan so'ng, quyidagicha bir nechta store bilan `CacheModule` ni ro'yxatdan o'tkazishingiz mumkin:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

Bu misolda biz ikki store'ni ro'yxatdan o'tkazdik: `CacheableMemory` va `KeyvRedis`. `CacheableMemory` store'i oddiy xotira ichidagi store, `KeyvRedis` esa Redis store. `stores` massivi ishlatiladigan store'larni ko'rsatish uchun ishlatiladi. Massivdagi birinchi store default store bo'ladi, qolganlari esa fallback store'lar.

Mavjud store'lar haqida ko'proq ma'lumot uchun Keyv hujjatlarini ko'ring.

#### Asinxron konfiguratsiya

Ba'zan modul opsiyalarini kompilyatsiya vaqtida statik uzatish o'rniga asinxron tarzda uzatish kerak bo'ladi. Bunday holatda bir nechta usullarni taqdim etadigan `registerAsync()` metodidan foydalaning.

Yondashuvlardan biri - factory funksiyasidan foydalanish:

```typescript
CacheModule.registerAsync({
  useFactory: () => ({
    ttl: 5,
  }),
});
```

Bizning factory boshqa asinxron modul factory'lari kabi ishlaydi (u `async` bo'lishi mumkin va `inject` orqali bog'liqliklarni in'eksiya qila oladi).

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.get('CACHE_TTL'),
  }),
  inject: [ConfigService],
});
```

Muqobil ravishda, `useClass` metodidan foydalanishingiz mumkin:

```typescript
CacheModule.registerAsync({
  useClass: CacheConfigService,
});
```

Yuqoridagi konstruktsiya `CacheConfigService` ni `CacheModule` ichida instansiyalaydi va undan opsiyalar obyektini olish uchun foydalanadi. `CacheConfigService` konfiguratsiya opsiyalarini taqdim etishi uchun `CacheOptionsFactory` interfeysini amalga oshirishi shart:

```typescript
@Injectable()
class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      ttl: 5,
    };
  }
}
```

Agar boshqa moduldan import qilingan mavjud konfiguratsiya provayderidan foydalanmoqchi bo'lsangiz, `useExisting` sintaksisini ishlating:

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

Bu `useClass` bilan bir xil ishlaydi, faqat bitta muhim farq bilan - `CacheModule` o'z `ConfigService` instansiyasini yaratish o'rniga, import qilingan modullarda mavjud bo'lgan allaqachon yaratilgan `ConfigService` ni qayta ishlatadi.

> info **Hint** `CacheModule#register`, `CacheModule#registerAsync` va `CacheOptionsFactory` ixtiyoriy generic (tip argumenti)ga ega bo'lib, store'ga xos konfiguratsiya opsiyalarini toraytirishga yordam beradi va type safety ta'minlaydi.

`registerAsync()` metodiga `extraProviders` deb ataladigan provayderlarni ham uzatishingiz mumkin. Bu provayderlar modul provayderlariga qo'shib yuboriladi.

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useClass: ConfigService,
  extraProviders: [MyAdditionalProvider],
});
```

Bu factory funksiyasiga yoki sinf konstruktori uchun qo'shimcha bog'liqliklar taqdim etmoqchi bo'lganingizda foydali.

#### Misol

Ishlaydigan misol bu yerda mavjud.
