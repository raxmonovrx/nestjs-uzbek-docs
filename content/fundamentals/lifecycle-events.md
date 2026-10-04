---
title: "Lifecycle hodisalari"
navTitle: "Lifecycle hodisalari"
description: "Nest ilovasi, shuningdek har bir ilova elementi, Nest tomonidan boshqariladigan lifecycle'ga ega. Nest lifecycle hooks ni taqdim etadi; ular asosiy lifecycle hodisalarini ko'rish i"
order: 8
group: fundamentals
groupTitle: "Fundamentals"
---
Nest ilovasi, shuningdek har bir ilova elementi, Nest tomonidan boshqariladigan lifecycle'ga ega. Nest **lifecycle hooks** ni taqdim etadi; ular asosiy lifecycle hodisalarini ko'rish imkonini beradi va ular sodir bo'lganda harakat qilish (modul, provayder yoki controllerlarda ro'yxatdan o'tkazilgan kodni ishga tushirish) imkonini beradi.

#### Lifecycle ketma-ketligi

Quyidagi diagrammada ilovaning bootstrappingidan boshlab node jarayoni yakunlangungacha bo'lgan asosiy lifecycle hodisalari ketma-ketligi ko'rsatilgan. Umumiy lifecycle'ni uch bosqichga bo'lishimiz mumkin: **initializing**, **running** va **terminating**. Ushbu lifecycle yordamida modullar va servislarning mos inicializatsiyasini rejalashtirishingiz, faol ulanishlarni boshqarishingiz va ilova tugatish signalini olganda uni silliq tarzda o'chirishingiz mumkin.

#### Lifecycle hodisalari

Lifecycle hodisalari ilovani bootstrap qilish va shutdown paytida sodir bo'ladi. Nest quyidagi lifecycle hodisalarining har birida modullar, provayderlar va controllerlardagi ro'yxatdan o'tgan lifecycle hook metodlarini chaqiradi (**shutdown hooks** avval yoqilishi kerak, quyida [shunday ta'riflangan](/docs/fundamentals/lifecycle-events#ilovani-ochirish)idek). Yuqoridagi diagrammada ko'rsatilganidek, Nest ulanishlarni tinglashni boshlash va ulanishlarni to'xtatish uchun mos underlying metodlarni ham chaqiradi.

Quyidagi jadvalda `onModuleInit` va `onApplicationBootstrap` faqat `app.init()` yoki `app.listen()` ni aniq chaqirganingizda ishga tushadi.

Quyidagi jadvalda `onModuleDestroy`, `beforeApplicationShutdown` va `onApplicationShutdown` faqat `app.close()` ni aniq chaqirganingizda yoki jarayon maxsus tizim signalini (masalan, SIGTERM) olganda va siz ilova bootstrapida `enableShutdownHooks` ni to'g'ri chaqirganingizda ishga tushadi (quyidagi **Application shutdown** bo'limiga qarang).

| Lifecycle hook method           | Hook metodi chaqirilishiga sabab bo'ladigan lifecycle hodisasi                                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onModuleInit()`                | Host modul bog'liqliklari yechilgach bir marta chaqiriladi.                                                                                                                                                    |
| `onApplicationBootstrap()`      | Barcha modullar inicializatsiya qilingach, ammo ulanishlarni tinglash boshlanishidan oldin chaqiriladi.                                                                                                        |
| `onModuleDestroy()`\*           | Termination signali (masalan, `SIGTERM`) olingach chaqiriladi.                                                                                                                                                  |
| `beforeApplicationShutdown()`\* | Barcha `onModuleDestroy()` handlerlari tugagach (Promise'lar resolve yoki reject bo'lgach) chaqiriladi;<br />tugatish yakunlangach (Promise'lar resolve yoki reject bo'lgach), mavjud ulanishlarning barchasi yopiladi (`app.close()` chaqiriladi). |
| `onApplicationShutdown()`\*     | Ulanishlar yopilgach chaqiriladi (`app.close()` resolve bo'lgach).                                                                                                                                             |

\* Bu hodisalar uchun, agar `app.close()` ni aniq chaqirmayotgan bo'lsangiz, SIGTERM kabi tizim signallari bilan ishlashi uchun ularni yoqish kerak. Quyidagi [Application shutdown](/docs/fundamentals/lifecycle-events#ilovani-ochirish) bo'limiga qarang.

> warning **Warning** Yuqorida keltirilgan lifecycle hook'lar **request-scoped** sinflar uchun ishga tushirilmaydi. Request-scoped sinflar ilova lifecycle'iga bog'liq emas va ularning yashash muddati oldindan aytib bo'lmaydi. Ular har bir so'rov uchun alohida yaratiladi va javob yuborilgach avtomatik garbage-collected bo'ladi.

> info **Hint** `onModuleInit()` va `onApplicationBootstrap()` ning bajarilish tartibi modul importlari tartibiga bevosita bog'liq, oldingi hook tugashini kutadi.

#### Foydalanish

Har bir lifecycle hook interfeys bilan ifodalanadi. Interfeyslar texnik jihatdan ixtiyoriy, chunki ular TypeScript kompilyatsiyasidan so'ng mavjud bo'lmaydi. Shunga qaramay, kuchli tipizatsiya va editor toolingdan foydalanish uchun ularni ishlatish yaxshi amaliyotdir. Lifecycle hookni ro'yxatdan o'tkazish uchun tegishli interfeysni amalga oshiring. Masalan, muayyan sinfda (masalan, Controller, Provider yoki Module) modul inicializatsiyasi paytida chaqiriladigan metodni ro'yxatdan o'tkazish uchun `OnModuleInit` interfeysini amalga oshirib, `onModuleInit()` metodini taqdim eting, quyida ko'rsatilganidek:

```typescript
@@filename()
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
```

#### Asinxron inicializatsiya

`OnModuleInit` ham, `OnApplicationBootstrap` ham ilovani inicializatsiya qilish jarayonini kechiktirishga imkon beradi (`Promise` qaytarish yoki metodni `async` deb belgilab, metod tanasida asinxron metod yakunlanishini `await` qilish).

```typescript
@@filename()
async onModuleInit(): Promise<void> {
  await this.fetch();
}
@@switch
async onModuleInit() {
  await this.fetch();
}
```

#### Ilovani o'chirish

`onModuleDestroy()`, `beforeApplicationShutdown()` va `onApplicationShutdown()` hook'lari terminating bosqichda chaqiriladi (`app.close()` aniq chaqirilganda yoki SIGTERM kabi tizim signallari olinganda va siz bu holatni yoqqan bo'lsangiz). Bu imkoniyat ko'pincha Kubernetes bilan konteyner lifecycle'larini boshqarishda, Heroku da dyno'lar yoki shunga o'xshash servislar uchun ishlatiladi.

Shutdown hook listenerlar tizim resurslarini iste'mol qiladi, shuning uchun ular standart holatda o'chirilgan. Shutdown hooklardan foydalanish uchun `enableShutdownHooks()` ni chaqirib **listenerlarni yoqishingiz shart**:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> warning **warning** Platforma cheklovlari sababli, NestJS Windows'da application shutdown hook'larini cheklangan darajada qo'llab-quvvatlaydi. `SIGINT` ishlashini, shuningdek `SIGBREAK` va ma'lum darajada `SIGHUP` ishlashini kutishingiz mumkin - batafsil o'qing. Biroq `SIGTERM` Windowsda hech qachon ishlamaydi, chunki task manager orqali jarayonni to'xtatish shartsiz bo'ladi, "ya'ni ilova buni aniqlay yoki oldini ololmaydi". Windowsda `SIGINT`, `SIGBREAK` va boshqalar qanday boshqarilishi haqida ko'proq bilish uchun libuv'dan tegishli hujjatlarga qarang. Shuningdek Node.js'dagi Process Signal Events hujjatlariga qarang

> info **Info** `enableShutdownHooks` listenerlarni ishga tushirishi sababli xotira sarflaydi. Bitta Node jarayonida bir nechta Nest ilovalarini ishlatayotgan holatlarda (masalan, Jest bilan parallel testlar), Node ortiqcha listener jarayonlari haqida shikoyat qilishi mumkin. Shu sababli `enableShutdownHooks` standart holatda yoqilmagan. Bitta Node jarayonida bir nechta instansiyalarni ishga tushirayotganingizda bu holatni yodda tuting.

Ilova termination signalini olganda, ro'yxatdan o'tgan `onModuleDestroy()`, `beforeApplicationShutdown()`, so'ng `onApplicationShutdown()` metodlari (yuqorida ta'riflangan ketma-ketlikda) birinchi parametr sifatida tegishli signal bilan chaqiriladi. Agar ro'yxatdan o'tgan funksiya asinxron chaqiruvni kutsa (promise qaytarsa), Nest promise resolve yoki reject bo'lmaguncha ketma-ketlikni davom ettirmaydi.

```typescript
@@filename()
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}
@@switch
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal) {
    console.log(signal); // e.g. "SIGINT"
  }
}
```

> info **Info** `app.close()` ni chaqirish Node jarayonini to'xtatmaydi, faqat `onModuleDestroy()` va `onApplicationShutdown()` hook'larini ishga tushiradi. Shuning uchun agar interval'lar, uzoq ishlaydigan fon vazifalari va hokazo bo'lsa, jarayon avtomatik ravishda tugamaydi.
