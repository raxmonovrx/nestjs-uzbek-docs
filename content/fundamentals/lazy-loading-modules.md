---
title: "Modullarni lazy loading qilish"
navTitle: "Modullarni lazy loading qilish"
description: "Standart holatda modullar eager tarzda yuklanadi, ya'ni ilova yuklanishi bilan birga barcha modullar ham yuklanadi, ular darhol kerak bo'lishi yoki bo'lmasligidan qat'i nazar. Bu k"
order: 7
group: fundamentals
groupTitle: "Fundamentals"
---
Standart holatda modullar eager tarzda yuklanadi, ya'ni ilova yuklanishi bilan birga barcha modullar ham yuklanadi, ular darhol kerak bo'lishi yoki bo'lmasligidan qat'i nazar. Bu ko'pchilik ilovalar uchun yaxshi, ammo **serverless environment** da ishlaydigan ilova/workerlar uchun bo'g'in nuqtaga aylanishi mumkin, chunki ishga tushish kechikishi ("cold start") juda muhim.

Lazy loading muayyan serverless funksiya chaqiruvi uchun kerak bo'lgan modullargina yuklanishi hisobiga bootstrap vaqtini qisqartirishga yordam beradi. Bundan tashqari, serverless funksiya "warm" bo'lgach, keyingi chaqiruvlar uchun bootstrap vaqtini yanada tezlashtirish maqsadida boshqa modullarni asinxron tarzda yuklashingiz mumkin (kechiktirilgan modullar ro'yxatdan o'tkazilishi).

> info **Hint** Agar siz **Angular** freymvorki bilan tanish bo'lsangiz, "lazy-loading modules" atamasini avval ko'rgan bo'lishingiz mumkin. E'tibor bering, Nestda bu texnika **funksional jihatdan boshqacha**, shuning uchun buni nomlanishi o'xshash bo'lgan butunlay boshqa imkoniyat sifatida ko'ring.

> warning **Warning** [lifecycle hooks methods](/docs/fundamentals/lifecycle-events) lazy loaded modullar va servislarda chaqirilmaydi.

#### Boshlash

Modullarni talab bo'yicha yuklash uchun Nest `LazyModuleLoader` sinfini taqdim etadi, uni odatdagi tarzda sinfga in'eksiya qilish mumkin:

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}
@@switch
@Injectable()
@Dependencies(LazyModuleLoader)
export class CatsService {
  constructor(lazyModuleLoader) {
    this.lazyModuleLoader = lazyModuleLoader;
  }
}
```

> info **Hint** `LazyModuleLoader` sinfi `@nestjs/core` paketidan import qilinadi.

Muqobil ravishda, `LazyModuleLoader` provayderiga havolani ilovangizning bootstrap faylidan (`main.ts`) quyidagicha olishingiz mumkin:

```typescript
// "app" represents a Nest application instance
const lazyModuleLoader = app.get(LazyModuleLoader);
```

Shundan so'ng, quyidagi konstruktsiya yordamida istalgan modulni yuklashingiz mumkin:

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);
```

> info **Hint** "Lazy loaded" modullar birinchi `LazyModuleLoader#load` metodi chaqirilganda **keshlanadi**. Bu shuni anglatadiki, `LazyModule` ni ketma-ket yuklashga bo'lgan har bir urinish **juda tez** bo'ladi va modulni qayta yuklash o'rniga keshlangan instansiyani qaytaradi.
>
> ```bash
> Load "LazyModule" attempt: 1
> time: 2.379ms
> Load "LazyModule" attempt: 2
> time: 0.294ms
> Load "LazyModule" attempt: 3
> time: 0.303ms
> ```
>
> Shuningdek, "lazy loaded" modullar ilovaning bootstrapi vaqtida eager tarzda yuklangan modullar bilan, hamda keyinroq ro'yxatdan o'tkazilgan boshqa lazy modullar bilan bir xil modullar grafini bo'lishadi.

Bu yerda `lazy.module.ts` - **oddiy Nest modul**ni eksport qiladigan TypeScript fayli (qo'shimcha o'zgarishlar talab etilmaydi).

`LazyModuleLoader#load` metodi module reference (`LazyModule` uchun) ni qaytaradi; u provayderlarning ichki ro'yxatini ko'rish va in'eksiya tokeni bo'yicha istalgan provayderga havola olish imkonini beradi.

Masalan, quyidagi ta'rifga ega `LazyModule` bor deylik:

```typescript
@Module({
  providers: [LazyService],
  exports: [LazyService],
})
export class LazyModule {}
```

> info **Hint** Lazy loaded modullarni **global modullar** sifatida ro'yxatdan o'tkazib bo'lmaydi, bu mantiqan to'g'ri emas (chunki ular lazily ro'yxatdan o'tkaziladi, talab bo'yicha, va shu vaqtga kelib barcha statik ro'yxatdan o'tgan modullar allaqachon instansiyalangan bo'ladi). Xuddi shuningdek, ro'yxatdan o'tkazilgan **global enhancers** (guards/interceptors/etc.) ham **to'g'ri ishlamaydi**.

Shu bilan, `LazyService` provayderiga havolani quyidagicha olishimiz mumkin:

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

const { LazyService } = await import('./lazy.service');
const lazyService = moduleRef.get(LazyService);
```

> warning **Warning** Agar siz **Webpack** dan foydalansangiz, `tsconfig.json` faylingizni yangilang - `compilerOptions.module` ni `"esnext"` ga o'rnating va `compilerOptions.moduleResolution` xossasini `"node"` qiymati bilan qo'shing:
>
> ```json
> {
>   "compilerOptions": {
>     "module": "esnext",
>     "moduleResolution": "node",
>     ...
>   }
> }
> ```
>
> Ushbu opsiyalar o'rnatilgach, code splitting imkoniyatidan foydalanishingiz mumkin bo'ladi.

#### Kontrollerlar, gatewaylar va resolverlarni lazy loading qilish

Nestda kontrollerlar (yoki GraphQL ilovalarida resolverlar) route/path/topiclar (yoki query/mutationlar) to'plamini ifodalaydi, shuning uchun ularni `LazyModuleLoader` sinfi yordamida **lazy load qilib bo'lmaydi**.

> error **Warning** Lazy loaded modullar ichida ro'yxatdan o'tkazilgan kontrollerlar, resolvers va [gateways](/docs/websockets/gateways) kutilgandek ishlamaydi. Xuddi shuningdek, middleware funksiyalarini ( `MiddlewareConsumer` interfeysini amalga oshirish orqali) talab bo'yicha ro'yxatdan o'tkazib bo'lmaydi.

Masalan, Fastify drayveri ( `@nestjs/platform-fastify` paketi) ostida REST API (HTTP ilova) qurayapsiz deylik. Fastify ilova tayyor bo'lib, xabarlarni tinglashni boshlagandan keyin route'larni ro'yxatdan o'tkazishga ruxsat bermaydi. Bu shuni anglatadiki, modul kontrollerlarida ro'yxatdan o'tkazilgan route mapping'larini tahlil qilsak ham, barcha lazy loaded route'lar ochiq bo'lmaydi, chunki ularni runtime paytida ro'yxatdan o'tkazishning iloji yo'q.

Xuddi shuningdek, `@nestjs/microservices` paketi doirasida taqdim etiladigan ba'zi transport strategiyalari (jumladan Kafka, gRPC yoki RabbitMQ) ulanish o'rnatilishidan oldin muayyan topic/channel'larni subscribe/listen qilishni talab qiladi. Ilovangiz xabarlarni tinglashni boshlagach, freymvork yangi topic'larni subscribe/listen qila olmaydi.

Nihoyat, `@nestjs/graphql` paketi code-first yondashuvi yoqilgan bo'lsa, metadata asosida GraphQL sxemasini avtomatik generatsiya qiladi. Bu esa barcha sinflar oldindan yuklangan bo'lishini talab qiladi. Aks holda, mos va to'g'ri sxemani yaratib bo'lmaydi.

#### Keng tarqalgan use-case'lar

Ko'pincha lazy loaded modullarni worker/cron job/lambda & serverless function/webhook kiruvchi argumentlarga (route path/date/query parameters va hokazo) qarab turli servislarni (turli mantiqni) ishga tushirishi kerak bo'lgan holatlarda ko'rasiz. Boshqa tomondan, monolit ilovalar uchun modullarni lazy loading qilish unchalik mantiqli bo'lmasligi mumkin, chunki u yerda startup vaqti uncha ahamiyatli emas.
