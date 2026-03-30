---
title: "Migratsiya bo'yicha qo'llanma"
navTitle: "Migratsiya bo'yicha qo'llanma"
description: "Ushbu maqola NestJS 10-versiyadan 11-versiyaga migratsiya qilish uchun keng qamrovli qo'llanmani taqdim etadi. v11 da kiritilgan yangi funksiyalarni ko'rish uchun this articlega qa"
order: 12
group: core
groupTitle: "Core"
---
Ushbu maqola NestJS 10-versiyadan 11-versiyaga migratsiya qilish uchun keng qamrovli qo'llanmani taqdim etadi. v11 da kiritilgan yangi funksiyalarni ko'rish uchun this articlega qarang. Yangilanish bir nechta kichik breaking change'larni o'z ichiga oladi, ammo ular ko'pchilik foydalanuvchilarga ta'sir qilmaydi. O'zgarishlarning to'liq ro'yxatini heredan ko'rishingiz mumkin.

#### Paketlarni yangilash

Paketlarni qo'lda yangilashingiz mumkin bo'lsa-da, jarayonni soddalashtirish uchun npm-check-updates (ncu)dan foydalanishni tavsiya qilamiz.

#### Express v5

Ko'p yillik rivojlanishdan so'ng Express v5 2024 yilda rasmiy ravishda chiqarildi va 2025 yilda stable versiyaga aylandi. NestJS 11 bilan Express v5 endi frameworkga default tarzda integratsiya qilingan. Bu yangilanish ko'pchilik foydalanuvchilar uchun muammosiz bo'lsa-da, Express v5 bir nechta breaking change'larni olib keladi. Batafsil qo'llanma uchun Express v5 migratsiya qo'llanmasiga qarang.

Express v5dagi eng sezilarli yangilanishlardan biri - path route matching algoritmining yangilanishi. Quyidagi o'zgarishlar path stringlari va kiruvchi so'rovlar moslanishi bo'yicha kiritilgan:

- Wildcard `*` nomga ega bo'lishi kerak, parametrlar xatti-harakatiga mos: `/*` o'rniga `/*splat` yoki `/{{ '{' }}*splat&#125;` ishlating. `splat` shunchaki wildcard parametrining nomi, maxsus ma'noga ega emas. Istalgan nomni ishlatishingiz mumkin, masalan, `*wildcard`
- Ixtiyoriy `?` belgisi endi qo'llab-quvvatlanmaydi, o'rniga qavslar ishlating: `/:file{{ '{' }}.:ext&#125;`.
- Regexp belgilari qo'llab-quvvatlanmaydi.
- Ba'zi belgilar upgrade paytida chalkashlikdan qochish uchun rezerv qilingan `(()[]?+!)`, ularni `\` bilan escape qiling.
- Parametr nomlari endi haqiqiy JavaScript identifikatorlarini yoki `:"this"` kabi qo'shtirnoq ichidagi nomlarni qo'llab-quvvatlaydi.

Shunga qaramay, Express v4da ishlagan route'lar Express v5da ishlamasligi mumkin. Masalan:

```typescript
@Get('users/*')
findAll() {
  // In NestJS 11, this will be automatically converted to a valid Express v5 route.
  // While it may still work, it's no longer advisable to use this wildcard syntax in Express v5.
  return 'This route should not work in Express v5';
}
```

Bu muammoni hal qilish uchun route'ni named wildcard bilan yangilang:

```typescript
@Get('users/*splat')
findAll() {
  return 'This route will work in Express v5';
}
```

> warning **Warning** `*splat` - bu root pathsiz istalgan pathni moslaydigan named wildcard. Agar root pathni ham moslash kerak bo'lsa (`/users`), `/users/{{ '{' }}*splat&#125;`dan foydalaning va wildcardni qavs ichiga o'rang (optional group). `splat` shunchaki wildcard parametrining nomi, maxsus ma'noga ega emas. Istalgan nomni ishlatishingiz mumkin, masalan, `*wildcard`.

Xuddi shuningdek, agar barcha route'larda ishlaydigan middleware bo'lsa, pathni named wildcard bilan yangilashingiz kerak bo'lishi mumkin:

```typescript
// In NestJS 11, this will be automatically converted to a valid Express v5 route.
// While it may still work, it's no longer advisable to use this wildcard syntax in Express v5.
forRoutes('*'); // <-- This should not work in Express v5
```

Buning o'rniga pathni named wildcard bilan yangilang:

```typescript
forRoutes('{*splat}'); // <-- This will work in Express v5
```

`{{ '{' }}*splat&#125;` - bu root pathni ham o'z ichiga olgan istalgan pathni moslaydigan named wildcard. Tashqi qavslar pathni optional qiladi.

#### Query parametrlarini parse qilish

> info **Note** Bu o'zgarish faqat Express v5 uchun.

Express v5da query parametrlar endi default bo'yicha `qs` kutubxonasi bilan parse qilinmaydi. O'rniga nested obyektlar yoki massivlarni qo'llab-quvvatlamaydigan `simple` parser ishlatiladi.

Natijada quyidagi query stringlar endi kutilganidek parse qilinmaydi:

```plaintext
?filter[where][name]=John&filter[where][age]=30
?item[]=1&item[]=2
```

Oldingi xatti-harakatga qaytish uchun Express'ni `extended` parserdan (Express v4dagi default) foydalanishga sozlashingiz mumkin, buning uchun `query parser` optionini `extended`ga o'rnating:

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // <-- Make sure to use <NestExpressApplication>
  app.set('query parser', 'extended'); // <-- Add this line
  await app.listen(3000);
}
bootstrap();
```

#### Fastify v5

`@nestjs/platform-fastify` v11 endi Fastify v5 ni to'liq qo'llab-quvvatlaydi. Bu yangilanish ko'pchilik foydalanuvchilar uchun muammosiz bo'lishi kerak; ammo Fastify v5 bir nechta breaking change'larni olib keladi, garchi ular NestJS foydalanuvchilarining aksariyatiga ta'sir qilmasa ham. Batafsil ma'lumot uchun Fastify v5 migratsiya qo'llanmasiga qarang.

> info **Hint** Fastify v5da path matching bo'yicha o'zgarishlar yo'q (middlewaredan tashqari, quyidagi bo'limga qarang), shuning uchun oldingidek wildcard sintaksisidan foydalanishda davom etishingiz mumkin. Xatti-harakat o'zgarmaydi va `*` kabi wildcardlar bilan aniqlangan route'lar avvalgidek ishlaydi.

#### Fastify CORS

Default bo'yicha faqat CORS-safelisted methods ruxsat etiladi. Agar qo'shimcha metodlarni (masalan, `PUT`, `PATCH` yoki `DELETE`) yoqish kerak bo'lsa, ularni `methods` optionida aniq ko'rsatishingiz kerak.

```typescript
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']; // OR comma-delimited string 'GET,POST,PUT,PATH,DELETE'

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
  { cors: { methods } },
);

// OR alternatively, you can use the `enableCors` method
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
app.enableCors({ methods });
```

#### Fastify middleware ro'yxatdan o'tkazish

NestJS 11 endi `@nestjs/platform-fastify` ichida **middleware path**larni moslash uchun path-to-regexp paketining eng so'nggi versiyasidan foydalanadi. Natijada, barcha pathlarni moslash uchun `(.*)` sintaksisi endi qo'llab-quvvatlanmaydi. O'rniga named wildcardlardan foydalaning.

Masalan, barcha route'lar uchun qo'llanadigan middleware bo'lsa:

```typescript
// In NestJS 11, this will automatically be converted to a valid route, even if you don't update it.
.forRoutes('(.*)');
```

Uni named wildcardga yangilashingiz kerak:

```typescript
.forRoutes('*splat');
```

Bu yerda `splat` wildcard parametri uchun ixtiyoriy nom.

#### Modul rezolyutsiya algoritmi

NestJS 11dan boshlab modul rezolyutsiya algoritmi ko'pchilik ilovalar uchun ishlashni yaxshilash va xotira sarfini kamaytirish maqsadida yangilandi. Bu o'zgarish qo'lda aralashishni talab qilmaydi, ammo ayrim chekka holatlarda xatti-harakat oldingi versiyalardan farq qilishi mumkin.

NestJS v10 va undan oldingi versiyalarda dinamik modullarga ularning dinamik metadata'sidan generatsiya qilingan noyob opaque key berilgan. Bu key modulni modul registrida aniqlash uchun ishlatilgan. Masalan, agar `TypeOrmModule.forFeature([User])`ni bir nechta modulga qo'shsangiz, NestJS modullarni deduplicate qiladi va ularni registrda bitta modul node sifatida ko'radi. Bu jarayon node deduplication deb ataladi.

NestJS v11dan boshlab dinamik modullar uchun oldingidek predict qilinadigan hashlar endi generatsiya qilinmaydi. O'rniga, obyekt referenslari bir modul boshqasiga ekvivalentligini aniqlash uchun ishlatiladi. Bir xil dinamik modulni bir nechta modul bo'ylab ulashish uchun uni o'zgaruvchiga biriktirib, kerak bo'lgan joylarda import qiling. Bu yangi yondashuv ko'proq moslashuvchanlik beradi va dinamik modullarni yanada samarali boshqarishni ta'minlaydi.

Bu yangi algoritm ko'p dinamik modullardan foydalanadigan integratsion testlaringizga ta'sir qilishi mumkin, chunki yuqorida eslatilgan qo'lda deduplication bo'lmagani sababli, TestingModule'da dependency'ning bir nechta instansiyasi bo'lishi mumkin. Bu metodni stub qilishni biroz murakkablashtiradi, chunki to'g'ri instansiyani nishonga olishingiz kerak bo'ladi. Variantlar:

- Stub qilmoqchi bo'lgan dinamik modulni deduplicate qiling
- To'g'ri instansiyani topish uchun `module.select(ParentModule).get(Target)`dan foydalaning
- `module.get(Target, {{ '{' }} each: true &#125;)` yordamida barcha instansiyalarni stub qiling
- Yoki `Test.createTestingModule({{ '{' }}&#125;, {{ '{' }} moduleIdGeneratorAlgorithm: 'deep-hash' &#125;)` yordamida testni eski algoritmga qaytaring

#### Reflector type inference

NestJS 11 `Reflector` klassiga bir nechta yaxshilanishlarni olib keladi, bu metadata qiymatlari bilan ishlashda funksionallik va type inference'ni yaxshilaydi. Bu yangilanishlar metadata bilan ishlashda yanada intuitiv va mustahkam tajriba beradi.

1. `getAllAndMerge` endi faqat bitta metadata yozuvi bo'lsa va `value` `object` tipida bo'lsa, bitta elementli massiv o'rniga obyekt qaytaradi. Bu obyekt asosidagi metadata bilan ishlashda konsistentlikni oshiradi.
2. `getAllAndOverride` qaytish turi endi `T | undefined` (oldin `T` edi). Bu metadata topilmasligi ehtimolini to'g'ri aks ettiradi va undefined holatlarini to'g'ri boshqarishni ta'minlaydi.
3. `ReflectableDecorator`'ning transformatsiyalangan type argumenti endi barcha metodlar bo'ylab to'g'ri infer qilinadi.

Bu yaxshilanishlar NestJS 11da metadata bilan ishlashda yaxshi type safety va boshqaruvni ta'minlaydi.

#### Lifecycle hooklar bajarilish tartibi

Yakuniy lifecycle hooklar endi init hooklariga teskari tartibda bajariladi. Ya'ni `OnModuleDestroy`, `BeforeApplicationShutdown` va `OnApplicationShutdown` kabi hooklar endi teskari tartibda bajariladi.

Quyidagi ssenariyni tasavvur qiling:

```plaintext
// Where A, B, and C are modules and "->" represents the module dependency.
A -> B -> C
```

Bu holatda `OnModuleInit` hooklari quyidagi tartibda bajariladi:

```plaintext
C -> B -> A
```

`OnModuleDestroy` hooklari esa teskari tartibda bajariladi:

```plaintext
A -> B -> C
```

> info **Hint** Global modullar boshqa barcha modullarning dependency'si sifatida qaraladi. Bu global modullar birinchi bo'lib initsializatsiya qilinishi va oxirida destroy qilinishini anglatadi.

#### Middleware ro'yxatdan o'tkazish tartibi

NestJS v11da middleware ro'yxatdan o'tkazish xatti-harakati yangilandi. Avvalroq middleware ro'yxatdan o'tkazish tartibi modul dependency grafini topologik sort qilish orqali aniqlanar edi, bunda root moduldan masofa middleware tartibini belgilardi, middleware global yoki oddiy modulda ro'yxatdan o'tkazilganidan qat'i nazar. Global modullar bu borada oddiy modullar kabi ko'rilar edi, bu esa, ayniqsa boshqa framework funksiyalari bilan taqqoslanganda, nomuvofiq xatti-harakatlarga olib kelgan.

v11dan boshlab global modullarda ro'yxatdan o'tkazilgan middleware endi **birinchi bo'lib** bajariladi, modul dependency grafidagi o'rnidan qat'i nazar. Bu o'zgarish global middleware har doim import qilingan modullardagi middlewarelardan oldin ishlashini ta'minlaydi va tartibni bir xil hamda bashoratli qiladi.

#### Cache module

`CacheModule` (`@nestjs/cache-manager` paketidan) endi `cache-manager` paketining eng so'nggi versiyasini qo'llab-quvvatlaydi. Bu yangilanish bir nechta breaking change'larni olib keladi, jumladan Keyvga migratsiya, u turli backend store'lar bo'ylab storage adapterlar orqali key-value storage uchun yagona interfeys taqdim etadi.

Oldingi versiya va yangi versiya o'rtasidagi asosiy farq tashqi store'larni sozlashda. Oldingi versiyada Redis store'ni quyidagicha sozlagan bo'lishingiz mumkin:

```ts
// Old version - no longer supported
CacheModule.registerAsync({
  useFactory: async () => {
    const store = await redisStore({
      socket: {
        host: 'localhost',
        port: 6379,
      },
    });

    return {
      store,
    };
  },
}),
```

Yangi versiyada store'ni sozlash uchun `Keyv` adapteridan foydalanishingiz kerak:

```ts
// New version - supported
CacheModule.registerAsync({
  useFactory: async () => {
    return {
      stores: [
        new KeyvRedis('redis://localhost:6379'),
      ],
    };
  },
}),
```

Bu yerda `KeyvRedis` `@keyv/redis` paketidan import qilinadi. Batafsil ma'lumot uchun [Caching documentation](/docs/techniques/caching)ga qarang.

> warning **Warning** Ushbu yangilanishda Keyv kutubxonasi tomonidan boshqariladigan kesh ma'lumotlari endi `value` va `expires` maydonlarini o'z ichiga olgan obyekt ko'rinishida saqlanadi, masalan: `{{ '{' }}"value": "yourData", "expires": 1678901234567{{ '}' }}`. Keyv o'z API'si orqali ma'lumotga kirganda `value` maydonini avtomatik qaytaradi, ammo kesh ma'lumotlari bilan to'g'ridan-to'g'ri ishlasangiz (masalan, cache-manager API'sidan tashqarida) yoki oldingi `@nestjs/cache-manager` versiyasi bilan yozilgan ma'lumotlarni qo'llab-quvvatlash kerak bo'lsa, bu o'zgarishni yodda tuting.

#### Config module

Agar `@nestjs/config` paketidagi `ConfigModule`dan foydalansangiz, `@nestjs/config@4.0.0`da kiritilgan bir nechta breaking change'lardan xabardor bo'ling. Eng muhimi, `ConfigService#get` metodi konfiguratsiya qiymatlarini o'qish tartibi yangilandi. Yangi tartib:

- Ichki konfiguratsiya (config namespace'lar va custom config fayllar)
- Validatsiya qilingan environment variable'lar (agar validation yoqilgan bo'lsa va schema berilgan bo'lsa)
- `process.env` obyekti

Oldin validatsiya qilingan environment variable'lar va `process.env` birinchi o'qilar edi va ichki konfiguratsiya ularni override qila olmasdi. Bu yangilanish bilan ichki konfiguratsiya endi har doim environment variable'lardan ustun turadi.
