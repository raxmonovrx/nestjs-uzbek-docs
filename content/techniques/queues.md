---
title: "Navbatlar"
navTitle: "Navbatlar"
description: "Navbatlar keng tarqalgan ilova masshtablash va unumdorlik muammolarini hal qilishga yordam beradigan kuchli dizayn patternidir. Navbatlar hal qilishi mumkin bo'lgan muammolarga mis"
order: 12
group: techniques
groupTitle: "Techniques"
---
Navbatlar keng tarqalgan ilova masshtablash va unumdorlik muammolarini hal qilishga yordam beradigan kuchli dizayn patternidir. Navbatlar hal qilishi mumkin bo'lgan muammolarga misollar:

- Qayta ishlashdagi piklarni tekislash. Masalan, foydalanuvchilar resurs talabchan vazifalarni istalgan vaqtda boshlashi mumkin bo'lsa, bu vazifalarni sinxron bajarish o'rniga navbatga qo'shishingiz mumkin. Keyin ishchi jarayonlar vazifalarni navbatdan boshqariladigan tartibda oladi. Ilova masshtablashgan sari back-end vazifalarini bajarishni kengaytirish uchun yangi navbat iste'molchilarini osongina qo'shishingiz mumkin.
- Node.js event loop ini to'sib qo'yishi mumkin bo'lgan monolit vazifalarni bo'laklash. Masalan, foydalanuvchi so'rovi audio transkodlash kabi CPU talabchan ishni talab qilsa, bu vazifani boshqa jarayonlarga delegatsiya qilishingiz mumkin, shunda foydalanuvchiga xizmat ko'rsatuvchi jarayonlar javobchan bo'lib qoladi.
- Turli xizmatlar orasida ishonchli aloqa kanalini taqdim etish. Masalan, bir jarayon yoki xizmatda vazifalarni (job) navbatga qo'yib, ularni boshqa jarayon yoki xizmatda iste'mol qilishingiz mumkin. Istalgan jarayon yoki xizmatdan job hayotiy siklidagi yakunlanish, xato yoki boshqa holat o'zgarishlari bo'yicha (holat hodisalarini tinglab) xabardor bo'lishingiz mumkin. Navbat ishlab chiqaruvchilari yoki iste'molchilari ishlamay qolsa, ularning holati saqlanadi va tugunlar qayta ishga tushirilganda vazifalarni qayta ishlash avtomatik tiklanadi.

Nest BullMQ integratsiyasi uchun `@nestjs/bullmq` paketini va Bull integratsiyasi uchun `@nestjs/bull` paketini taqdim etadi. Ikkala paket ham bir xil jamoa tomonidan ishlab chiqilgan tegishli kutubxonalar ustidagi abstraksiyalar/o'rab qo'yuvchilar hisoblanadi. Bull hozirda maintenance rejimida, jamoa xatolarni tuzatishga e'tibor qaratmoqda, BullMQ esa faol rivojlanmoqda, zamonaviy TypeScript implementatsiyasi va boshqa xususiyatlar to'plamiga ega. Agar Bull sizning talablaringizga mos bo'lsa, u hali ham ishonchli va amalda sinalgan tanlov. Nest paketlari BullMQ yoki Bull navbatlarini Nest ilovangizga qulay tarzda integratsiya qilishni osonlashtiradi.

BullMQ ham, Bull ham job ma'lumotlarini saqlash uchun Redis dan foydalanadi, shuning uchun sizda Redis o'rnatilgan bo'lishi kerak. Ular Redisga asoslanganligi sababli, navbat arxitekturasi to'liq taqsimlangan va platformadan mustaqil bo'lishi mumkin. Masalan, Nestda bir (yoki bir nechta) tugunda ishlayotgan ba'zi navbat <a href="/docs/techniques/queues#producers">prodyuserlari</a> va <a href="/docs/techniques/queues#consumers">iste'molchilari</a> hamda <a href="/docs/techniques/queues#event-listeners">listenerlari</a> bo'lishi, boshqa prodyuserlar, iste'molchilar va listenerlar esa boshqa tarmoq tugunlarida boshqa Node.js platformalarida ishlashi mumkin.

Ushbu bob `@nestjs/bullmq` va `@nestjs/bull` paketlarini qamrab oladi. Shuningdek, ko'proq fon va aniq implementatsiya tafsilotlari uchun BullMQ va Bull hujjatlarini o'qishni tavsiya qilamiz.

#### BullMQ o'rnatish

BullMQ dan foydalanishni boshlash uchun avval kerakli bog'liqliklarni o'rnatamiz.

```bash
$ npm install --save @nestjs/bullmq bullmq
```

O'rnatish jarayoni tugagach, `BullModule` ni root `AppModule` ga import qilamiz.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

`forRoot()` metodi ilovada ro'yxatdan o'tadigan barcha navbatlar uchun (aks holda alohida ko'rsatilmagan bo'lsa) ishlatiladigan `bullmq` paket konfiguratsiya obyektini ro'yxatdan o'tkazish uchun ishlatiladi. Ma'lumot uchun, konfiguratsiya obyektidagi ba'zi xossalar quyidagilar:

- `connection: ConnectionOptions` - Redis ulanishini sozlash opsiyalari. Batafsil Connections. Ixtiyoriy.
- `prefix: string` - Barcha navbat kalitlari uchun prefiks. Ixtiyoriy.
- `defaultJobOptions: JobOpts` - Yangi joblar uchun default sozlamalarni boshqarish opsiyalari. Batafsil JobOpts. Ixtiyoriy.
- `settings: AdvancedSettings` - Navbat konfiguratsiyasining ilg'or sozlamalari. Odatda bularni o'zgartirmaslik kerak. Batafsil AdvancedSettings. Ixtiyoriy.
- `extraOptions` - Modulni init qilish uchun qo'shimcha opsiyalar. Batafsil [Manual Registration](/docs/techniques/queues#qolda-royxatdan-otkazish)

Barcha opsiyalar ixtiyoriy bo'lib, navbat xatti-harakatini batafsil boshqarishni ta'minlaydi. Ular to'g'ridan-to'g'ri BullMQ `Queue` konstruktoriga uzatiladi. Ushbu opsiyalar va boshqa opsiyalar haqida batafsil bu yerda o'qing.

Navbatni ro'yxatdan o'tkazish uchun `BullModule.registerQueue()` dinamik modulini import qiling, quyidagicha:

```typescript
BullModule.registerQueue({
  name: 'audio',
});
```

> info **Hint** `registerQueue()` metodiga vergul bilan ajratilgan bir nechta konfiguratsiya obyektlarini uzatib, bir nechta navbat yarating.

`registerQueue()` metodi navbatlarni instansiyalash va/yoki ro'yxatdan o'tkazish uchun ishlatiladi. Navbatlar bir xil credentiallarga ega bo'lgan bir xil Redis bazasiga ulangan modullar va jarayonlar o'rtasida bo'lishiladi. Har bir navbat o'z `name` xossasi bilan noyobdir. Navbat nomi ham injection token sifatida (controller/providerlarga navbatni inject qilish uchun), ham consumer klasslari va listenerlarni navbatlarga bog'lash uchun dekoratorlarga argument sifatida ishlatiladi.

Shuningdek, muayyan navbat uchun oldindan sozlangan ba'zi opsiyalarni quyidagicha override qilishingiz mumkin:

```typescript
BullModule.registerQueue({
  name: 'audio',
  connection: {
    port: 6380,
  },
});
```

BullMQ joblar orasidagi parent - child munosabatlarini ham qo'llab-quvvatlaydi. Bu imkoniyat joblarni ixtiyoriy chuqurlikdagi daraxt tugunlari sifatida tashkil qilishga imkon beradi. Batafsil bu yerda o'qing.

Flow qo'shish uchun quyidagicha qilishingiz mumkin:

```typescript
BullModule.registerFlowProducer({
  name: 'flowProducerName',
});
```

Joblar Redisda saqlanadi, shuning uchun har safar aniq nomlangan navbat instansiyalanganda (masalan, ilova ishga tushganda/qayta ishga tushganda), u oldingi tugallanmagan sessiyadan qolgan eski joblarni qayta ishlashga urinadi.

Har bir navbatda bir yoki bir nechta prodyuserlar, iste'molchilar va listenerlar bo'lishi mumkin. Iste'molchilar joblarni navbatdan muayyan tartibda oladi: FIFO (default), LIFO yoki prioritetlarga ko'ra. Navbatni qayta ishlash tartibini boshqarish <a href="/docs/techniques/queues#consumers">bu yerda</a> muhokama qilinadi.

#### Nomlangan konfiguratsiyalar

Agar navbatlaringiz bir nechta turli Redis instansiyalariga ulanadigan bo'lsa, **nomlangan konfiguratsiyalar** deb ataladigan usuldan foydalanishingiz mumkin. Bu funksiya sizga bir nechta konfiguratsiyalarni belgilangan kalitlar ostida ro'yxatdan o'tkazish imkonini beradi, keyin navbat opsiyalarida ularga murojaat qilasiz.

Masalan, ilovangizda bir nechta navbatlar ishlatadigan qo'shimcha Redis instansiyasi (defaultdan tashqari) bo'lsa, uning konfiguratsiyasini quyidagicha ro'yxatdan o'tkazishingiz mumkin:

```typescript
BullModule.forRoot('alternative-config', {
  connection: {
    port: 6381,
  },
});
```

Yuqoridagi misolda `'alternative-config'` shunchaki konfiguratsiya kaliti (ixtiyoriy satr bo'lishi mumkin).

Shundan so'ng, `registerQueue()` opsiyalar obyektida bu konfiguratsiyani ko'rsatishingiz mumkin:

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});
```

#### Prodyuserlar

Job prodyuserlari joblarni navbatlarga qo'shadi. Prodyuserlar odatda ilova servislaridir (Nest providers). Navbatga job qo'shish uchun, avval servisga navbatni inject qiling:

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
```

> info **Hint** `@InjectQueue()` dekoratori `registerQueue()` metodi chaqiruvida berilgan nom orqali navbatni aniqlaydi (masalan, `'audio'`).

Endi navbatning `add()` metodini chaqirib, foydalanuvchi belgilagan job obyektini uzatib job qo'shing. Joblar serializatsiya qilinadigan JavaScript obyektlari sifatida ifodalanadi (chunki ular Redis bazasida shunday saqlanadi). Uzatayotgan jobning shakli ixtiyoriy; undan job obyektining semantikasini ifodalash uchun foydalaning. Shuningdek, unga nom berishingiz kerak. Bu faqat berilgan nomdagi joblarni qayta ishlaydigan maxsus <a href="/docs/techniques/queues#consumers">iste'molchilar</a> yaratish imkonini beradi.

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});
```

#### Job opsiyalari

Joblar bilan qo'shimcha opsiyalar bog'lanishi mumkin. `Queue.add()` metodida `job` argumentidan keyin opsiyalar obyektini uzating. Job opsiyalarining ba'zi xossalari:

- `priority`: `number` - Ixtiyoriy prioritet qiymati. 1 (eng yuqori prioritet) dan MAX_INT (eng past prioritet) gacha. Prioritetlardan foydalanish unumdorlikka ozgina ta'sir qiladi, shuning uchun ehtiyotkorlik bilan ishlating.
- `delay`: `number` - Ushbu job qayta ishlanishi mumkin bo'lishidan oldin kutish vaqti (millisekundlarda). Aniq delaylar uchun server va klientlar soatlari sinxron bo'lishi kerak.
- `attempts`: `number` - Job yakunlanguncha sinab ko'rishlar soni.
- `repeat`: `RepeatOpts` - Cron spetsifikatsiyasiga ko'ra jobni takrorlash. Batafsil RepeatOpts.
- `backoff`: `number | BackoffOpts` - Job muvaffaqiyatsiz bo'lsa avtomatik qayta urinishlar uchun backoff sozlamasi. Batafsil BackoffOpts.
- `lifo`: `boolean` - `true` bo'lsa, jobni navbatning chap oxiri o'rniga o'ng oxiriga qo'shadi (default false).
- `jobId`: `number` | `string` - Job ID ni override qiladi - default holatda job ID noyob
  butun son bo'ladi, ammo bu sozlama bilan job ID ni o'zgartirishingiz mumkin. Agar bu opsiyadan foydalansangiz, jobId noyob bo'lishini ta'minlash sizning vazifangiz. Agar mavjud bo'lgan ID bilan job qo'shishga urinsangiz, u qo'shilmaydi.
- `removeOnComplete`: `boolean | number` - `true` bo'lsa, job muvaffaqiyatli yakunlanganda o'chiriladi. Son berilsa, saqlab qolinadigan joblar sonini bildiradi. Default xatti-harakat - jobni completed to'plamida saqlash.
- `removeOnFail`: `boolean | number` - `true` bo'lsa, job barcha urinishlardan keyin muvaffaqiyatsiz bo'lganda o'chiriladi. Son berilsa, saqlab qolinadigan joblar sonini bildiradi. Default xatti-harakat - jobni failed to'plamida saqlash.
- `stackTraceLimit`: `number` - stacktrace da yozib olinadigan qatorlar sonini cheklaydi.

Quyida job opsiyalari bilan joblarni sozlashning bir nechta misollari keltirilgan.

Job boshlanishini kechiktirish uchun `delay` konfiguratsiya xossasidan foydalaning.

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 3 seconds delayed
);
```

Jobni navbatning o'ng oxiriga qo'shish uchun (jobni **LIFO** (Last In First Out) tarzida qayta ishlash), konfiguratsiya obyektidagi `lifo` xossasini `true` ga o'rnating.

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { lifo: true },
);
```

Jobni prioritet bilan ishlash uchun `priority` xossasidan foydalaning.

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { priority: 2 },
);
```

Opsiyalarning to'liq ro'yxati uchun API hujjatlarini bu yerda va bu yerda ko'ring.

#### Iste'molchilar

Iste'molchi - bu navbatga qo'shilgan joblarni qayta ishlaydigan yoki navbatdagi hodisalarni tinglaydigan, yoki ikkalasini ham qiladigan metodlarni belgilovchi **klass**. Iste'molchi klassni quyidagicha `@Processor()` dekoratori yordamida e'lon qiling:

```typescript
import { Processor } from '@nestjs/bullmq';

@Processor('audio')
export class AudioConsumer {}
```

> info **Hint** Iste'molchilar `@nestjs/bullmq` paketi ularni topishi uchun `providers` sifatida ro'yxatdan o'tkazilishi kerak.

Bu yerda dekoratorning string argumenti (masalan, `'audio'`) klass metodlari bog'lanadigan navbat nomidir.

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      await doSomething(job.data);
      progress += 1;
      await job.updateProgress(progress);
    }
    return {};
  }
}
```

Process metodi worker bo'sh bo'lganida va navbatda qayta ishlash uchun joblar bo'lganda chaqiriladi. Bu handler metodi yagona argument sifatida `job` obyektini oladi. Handler metodidan qaytgan qiymat job obyektida saqlanadi va keyinroq, masalan completed hodisasi listenerida ishlatilishi mumkin.

`Job` obyektlarida holat bilan ishlash imkonini beradigan bir nechta metodlar mavjud. Masalan, yuqoridagi kod job progressini yangilash uchun `updateProgress()` metodidan foydalanadi. `Job` obyektining to'liq API ma'lumotnomasi uchun bu yerga qarang.

Eski versiyada, Bull da, job handler metodi faqat muayyan turdagi joblarni (ma'lum `name` ga ega joblarni) qayta ishlashini `@Process()` dekoratoriga shu `name` ni berib belgilashingiz mumkin edi.

> warning **Warning** Bu BullMQ bilan ishlamaydi, o'qishda davom eting.

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }
```

Bu xatti-harakat BullMQda u keltirib chiqaradigan chalkashliklar sabab qo'llab-quvvatlanmaydi. Buning o'rniga, har bir job nomi uchun turli servislar yoki mantiqni chaqirish uchun switch case lar kerak bo'ladi:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'transcode': {
        let progress = 0;
        for (i = 0; i < 100; i++) {
          await doSomething(job.data);
          progress += 1;
          await job.progress(progress);
        }
        return {};
      }
      case 'concatenate': {
        await doSomeLogic2();
        break;
      }
    }
  }
}
```

Bu BullMQ hujjatlaridagi named processor bo'limida yoritilgan.

#### Request-scoped iste'molchilar

Iste'molchi request-scoped qilib belgilansa (injection scope lar haqida batafsil bu yerda), har bir job uchun klassning alohida instansiyasi yaratiladi. Job tugagach instansiya garbage-collector tomonidan tozalanadi.

```typescript
@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})
```

Request-scoped iste'molchi klasslari dinamik tarzda instansiyalanib, bitta jobga scoped bo'lgani uchun, konstruktor orqali standart yondashuv bilan `JOB_REF` ni inject qilishingiz mumkin.

```typescript
constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}
```

> info **Hint** `JOB_REF` tokeni `@nestjs/bullmq` paketidan import qilinadi.

#### Hodisa listenerlari

BullMQ navbat va/yoki job holati o'zgarishida foydali hodisalar to'plamini generatsiya qiladi. Bu hodisalarga Worker darajasida `@OnWorkerEvent(event)` dekoratori bilan yoki Queue darajasida maxsus listener klassi va `@OnQueueEvent(event)` dekoratori bilan obuna bo'lish mumkin.

Worker hodisalari <a href="/docs/techniques/queues#consumers">iste'molchi</a> klass ichida (ya'ni `@Processor()` dekoratori bilan bezatilgan klassda) e'lon qilinishi kerak. Hodisani tinglash uchun `@OnWorkerEvent(event)` dekoratoridan foydalaning va ishlov beriladigan hodisani bering. Masalan, `audio` navbatida job active holatga kirganda chiqariladigan hodisani tinglash uchun quyidagi konstruktsiyadan foydalaning:

```typescript
import { Processor, Process, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer {
  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  // ...
}
```

Hodisalar va ularning argumentlarining to'liq ro'yxatini WorkerListener xossalari sifatida bu yerda ko'rishingiz mumkin.

QueueEvent listenerlar `@QueueEventsListener(queue)` dekoratoridan foydalanishi va `@nestjs/bullmq` taqdim etgan `QueueEventsHost` klassini kengaytirishi kerak. Hodisani tinglash uchun `@OnQueueEvent(event)` dekoratoridan foydalaning va ishlov beriladigan hodisani bering. Masalan, `audio` navbatida job active holatga kirganda chiqariladigan hodisani tinglash uchun quyidagi konstruktsiyadan foydalaning:

```typescript
import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';

@QueueEventsListener('audio')
export class AudioEventsListener extends QueueEventsHost {
  @OnQueueEvent('active')
  onActive(job: { jobId: string; prev?: string }) {
    console.log(`Processing job ${job.jobId}...`);
  }

  // ...
}
```

> info **Hint** QueueEvent listenerlar `@nestjs/bullmq` paketi ularni topishi uchun `providers` sifatida ro'yxatdan o'tkazilishi kerak.

Hodisalar va ularning argumentlarining to'liq ro'yxatini QueueEventsListener xossalari sifatida bu yerda ko'rishingiz mumkin.

#### Navbatni boshqarish

Navbatlarda pauza berish yoki davom ettirish, turli holatlardagi joblar sonini olish va yana bir qancha boshqaruv funksiyalarini bajarishga imkon beradigan API mavjud. Navbat API ning to'liq ro'yxatini bu yerda topasiz. Bu metodlarning istalganini `Queue` obyektida to'g'ridan-to'g'ri chaqiring, quyida pause/resume misollarida ko'rsatilgandek.

`pause()` metodini chaqirib navbatni pauza qiling. Pauza qilingan navbat resume qilinmaguncha yangi joblarni qayta ishlamaydi, ammo hozir qayta ishlanayotgan joblar yakunlanguncha davom etadi.

```typescript
await audioQueue.pause();
```

Pauzadan chiqarish uchun `resume()` metodidan foydalaning:

```typescript
await audioQueue.resume();
```

#### Alohida jarayonlar

Job handlerlar alohida (fork qilingan) jarayonda ham ishlashi mumkin (manba). Bu bir qancha afzalliklarga ega:

- Jarayon sandbox qilingan bo'ladi, shuning uchun u crash bo'lsa workerga ta'sir qilmaydi.
- Navbatga ta'sir qilmasdan bloklovchi kodni ishga tushirishingiz mumkin (joblar to'xtab qolmaydi).
- Ko'p yadroli CPUlardan ancha yaxshi foydalanish.
- Redisga kamroq ulanishlar.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'node:path';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
      processors: [join(__dirname, 'processor.js')],
    }),
  ],
})
export class AppModule {}
```

> warning **Warning** Eslatma: funksiyangiz fork qilingan jarayonda bajarilayotganligi sababli, Dependency Injection (va IoC container) mavjud bo'lmaydi. Bu shuni anglatadiki, processor funksiyangizga kerak bo'lgan tashqi bog'liqliklarning barcha instansiyalarini ichida saqlashi (yoki yaratishi) kerak bo'ladi.

#### Async sozlash

`bullmq` opsiyalarini statik emas, asinxron tarzda uzatishni xohlashingiz mumkin. Bunday holatda, asinxron konfiguratsiya bilan ishlashning bir nechta usullarini taqdim etadigan `forRootAsync()` metodidan foydalaning. Xuddi shuningdek, navbat opsiyalarini asinxron tarzda uzatish uchun `registerQueueAsync()` metodidan foydalaning.

Usullardan biri - factory funksiyasidan foydalanish:

```typescript
BullModule.forRootAsync({
  useFactory: () => ({
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

Factory funksiyamiz har qanday asinxron provider kabi ishlaydi (masalan, `async` bo'lishi mumkin va `inject` orqali bog'liqliklarni qabul qiladi).

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    connection: {
      host: configService.get('QUEUE_HOST'),
      port: configService.get('QUEUE_PORT'),
    },
  }),
  inject: [ConfigService],
});
```

Muqobil ravishda, `useClass` sintaksisidan foydalanishingiz mumkin:

```typescript
BullModule.forRootAsync({
  useClass: BullConfigService,
});
```

Yuqoridagi konstruktsiya `BullConfigService` ni `BullModule` ichida instansiyalaydi va `createSharedConfiguration()` metodini chaqirib opsiyalar obyektini taqdim etish uchun foydalanadi. Bu `BullConfigService` `SharedBullConfigurationFactory` interfeysini implementatsiya qilishi kerakligini anglatadi, quyida ko'rsatilgandek:

```typescript
@Injectable()
class BullConfigService implements SharedBullConfigurationFactory {
  createSharedConfiguration(): BullModuleOptions {
    return {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}
```

`BullModule` ichida `BullConfigService` ni yaratmasdan, boshqa moduldan import qilingan providerni ishlatish uchun `useExisting` sintaksisidan foydalaning.

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

Bu konstruktsiya `useClass` bilan bir xil ishlaydi, lekin bitta muhim farqi bor - `BullModule` yangi `ConfigService` instansiyasini yaratish o'rniga import qilingan modullardan mavjud `ConfigService` ni qayta ishlatish uchun qidiradi.

Xuddi shuningdek, navbat opsiyalarini asinxron tarzda uzatish uchun `registerQueueAsync()` metodidan foydalaning, shunchaki `name` atributini factory funksiyasidan tashqarida ko'rsatishni unutmang.

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

#### Qo'lda ro'yxatdan o'tkazish

Default holatda, `BullModule` `onModuleInit` lifecycle funksiyasida BullMQ komponentlarini (navbatlar, processorlar va hodisa listener servislarini) avtomatik ro'yxatdan o'tkazadi. Biroq, ayrim holatlarda bu xatti-harakat ideal bo'lmasligi mumkin. Avtomatik ro'yxatdan o'tkazishni to'xtatish uchun `BullModule` da `manualRegistration` ni yoqing:

```typescript
BullModule.forRoot({
  extraOptions: {
    manualRegistration: true,
  },
});
```

Bu komponentlarni qo'lda ro'yxatdan o'tkazish uchun `BullRegistrar` ni inject qiling va `register` funksiyasini, ideal holatda `OnModuleInit` yoki `OnApplicationBootstrap` ichida chaqiring.

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BullRegistrar } from '@nestjs/bullmq';

@Injectable()
export class AudioService implements OnModuleInit {
  constructor(private bullRegistrar: BullRegistrar) {}

  onModuleInit() {
    if (yourConditionHere) {
      this.bullRegistrar.register();
    }
  }
}
```

`BullRegistrar#register` funksiyasini chaqirmasangiz, BullMQ komponentlari ishlamaydi - ya'ni joblar qayta ishlanmaydi.

#### Bull o'rnatish

> warning **Note** Agar BullMQ ni tanlagan bo'lsangiz, bu bo'lim va keyingi boblarni o'tkazib yuboring.

Bull dan foydalanishni boshlash uchun avval kerakli bog'liqliklarni o'rnatamiz.

```bash
$ npm install --save @nestjs/bull bull
```

O'rnatish jarayoni tugagach, `BullModule` ni root `AppModule` ga import qilamiz.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

`forRoot()` metodi ilovada ro'yxatdan o'tadigan barcha navbatlar uchun (aks holda alohida ko'rsatilmagan bo'lsa) ishlatiladigan `bull` paket konfiguratsiya obyektini ro'yxatdan o'tkazish uchun ishlatiladi. Konfiguratsiya obyektining quyidagi xossalari mavjud:

- `limiter: RateLimiter` - Navbat joblari qayta ishlanadigan tezlikni boshqarish opsiyalari. Batafsil RateLimiter. Ixtiyoriy.
- `redis: RedisOpts` - Redis ulanishini sozlash opsiyalari. Batafsil RedisOpts. Ixtiyoriy.
- `prefix: string` - Barcha navbat kalitlari uchun prefiks. Ixtiyoriy.
- `defaultJobOptions: JobOpts` - Yangi joblar uchun default sozlamalarni boshqarish opsiyalari. Batafsil JobOpts. Ixtiyoriy. **Eslatma: FlowProducer orqali joblarni rejalashtirsangiz, ular kuchga kirmaydi. Izoh uchun bullmq#1034 ga qarang.**
- `settings: AdvancedSettings` - Navbat konfiguratsiyasining ilg'or sozlamalari. Odatda bularni o'zgartirmaslik kerak. Batafsil AdvancedSettings. Ixtiyoriy.

Barcha opsiyalar ixtiyoriy bo'lib, navbat xatti-harakatini batafsil boshqarishni ta'minlaydi. Ular to'g'ridan-to'g'ri Bull `Queue` konstruktoriga uzatiladi. Ushbu opsiyalar haqida batafsil bu yerda o'qing.

Navbatni ro'yxatdan o'tkazish uchun `BullModule.registerQueue()` dinamik modulini import qiling, quyidagicha:

```typescript
BullModule.registerQueue({
  name: 'audio',
});
```

> info **Hint** `registerQueue()` metodiga vergul bilan ajratilgan bir nechta konfiguratsiya obyektlarini uzatib, bir nechta navbat yarating.

`registerQueue()` metodi navbatlarni instansiyalash va/yoki ro'yxatdan o'tkazish uchun ishlatiladi. Navbatlar bir xil credentiallarga ega bo'lgan bir xil Redis bazasiga ulangan modullar va jarayonlar o'rtasida bo'lishiladi. Har bir navbat o'z `name` xossasi bilan noyobdir. Navbat nomi ham injection token sifatida (controller/providerlarga navbatni inject qilish uchun), ham consumer klasslari va listenerlarni navbatlarga bog'lash uchun dekoratorlarga argument sifatida ishlatiladi.

Shuningdek, muayyan navbat uchun oldindan sozlangan ba'zi opsiyalarni quyidagicha override qilishingiz mumkin:

```typescript
BullModule.registerQueue({
  name: 'audio',
  redis: {
    port: 6380,
  },
});
```

Joblar Redisda saqlanadi, shuning uchun har safar aniq nomlangan navbat instansiyalanganda (masalan, ilova ishga tushganda/qayta ishga tushganda), u oldingi tugallanmagan sessiyadan qolgan eski joblarni qayta ishlashga urinadi.

Har bir navbatda bir yoki bir nechta prodyuserlar, iste'molchilar va listenerlar bo'lishi mumkin. Iste'molchilar joblarni navbatdan muayyan tartibda oladi: FIFO (default), LIFO yoki prioritetlarga ko'ra. Navbatni qayta ishlash tartibini boshqarish <a href="/docs/techniques/queues#consumers">bu yerda</a> muhokama qilinadi.

#### Nomlangan konfiguratsiyalar

Agar navbatlaringiz bir nechta Redis instansiyalariga ulanadigan bo'lsa, **nomlangan konfiguratsiyalar** deb ataladigan usuldan foydalanishingiz mumkin. Bu funksiya sizga bir nechta konfiguratsiyalarni belgilangan kalitlar ostida ro'yxatdan o'tkazish imkonini beradi, keyin navbat opsiyalarida ularga murojaat qilasiz.

Masalan, ilovangizda bir nechta navbatlar ishlatadigan qo'shimcha Redis instansiyasi (defaultdan tashqari) bo'lsa, uning konfiguratsiyasini quyidagicha ro'yxatdan o'tkazishingiz mumkin:

```typescript
BullModule.forRoot('alternative-config', {
  redis: {
    port: 6381,
  },
});
```

Yuqoridagi misolda `'alternative-config'` shunchaki konfiguratsiya kaliti (ixtiyoriy satr bo'lishi mumkin).

Shundan so'ng, `registerQueue()` opsiyalar obyektida bu konfiguratsiyani ko'rsatishingiz mumkin:

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});
```

#### Prodyuserlar

Job prodyuserlari joblarni navbatlarga qo'shadi. Prodyuserlar odatda ilova servislaridir (Nest providers). Navbatga job qo'shish uchun, avval servisga navbatni inject qiling:

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
```

> info **Hint** `@InjectQueue()` dekoratori `registerQueue()` metodi chaqiruvida berilgan nom orqali navbatni aniqlaydi (masalan, `'audio'`).

Endi navbatning `add()` metodini chaqirib, foydalanuvchi belgilagan job obyektini uzatib job qo'shing. Joblar serializatsiya qilinadigan JavaScript obyektlari sifatida ifodalanadi (chunki ular Redis bazasida shunday saqlanadi). Uzatayotgan jobning shakli ixtiyoriy; undan job obyektining semantikasini ifodalash uchun foydalaning.

```typescript
const job = await this.audioQueue.add({
  foo: 'bar',
});
```

#### Nomlangan joblar

Joblar noyob nomlarga ega bo'lishi mumkin. Bu faqat berilgan nomdagi joblarni qayta ishlaydigan maxsus <a href="/docs/techniques/queues#consumers">iste'molchilar</a> yaratish imkonini beradi.

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});
```

> Warning **Warning** Nomlangan joblardan foydalanganda, navbatga qo'shilgan har bir noyob nom uchun processor yaratishingiz kerak, aks holda navbat ushbu job uchun processor yetishmayotganini bildiradi. Nomlangan joblarni iste'mol qilish bo'yicha batafsil <a href="/docs/techniques/queues#consumers">bu yerga</a> qarang.

#### Job opsiyalari

Joblar bilan qo'shimcha opsiyalar bog'lanishi mumkin. `Queue.add()` metodida `job` argumentidan keyin opsiyalar obyektini uzating. Job opsiyalari xossalari:

- `priority`: `number` - Ixtiyoriy prioritet qiymati. 1 (eng yuqori prioritet) dan MAX_INT (eng past prioritet) gacha. Prioritetlardan foydalanish unumdorlikka ozgina ta'sir qiladi, shuning uchun ehtiyotkorlik bilan ishlating.
- `delay`: `number` - Ushbu job qayta ishlanishi mumkin bo'lishidan oldin kutish vaqti (millisekundlarda). Aniq delaylar uchun server va klientlar soatlari sinxron bo'lishi kerak.
- `attempts`: `number` - Job yakunlanguncha sinab ko'rishlar soni.
- `repeat`: `RepeatOpts` - Cron spetsifikatsiyasiga ko'ra jobni takrorlash. Batafsil RepeatOpts.
- `backoff`: `number | BackoffOpts` - Job muvaffaqiyatsiz bo'lsa avtomatik qayta urinishlar uchun backoff sozlamasi. Batafsil BackoffOpts.
- `lifo`: `boolean` - `true` bo'lsa, jobni navbatning chap oxiri o'rniga o'ng oxiriga qo'shadi (default false).
- `timeout`: `number` - Job timeout xatosi bilan muvaffaqiyatsiz bo'lishidan oldin o'tadigan millisekundlar soni.
- `jobId`: `number` | `string` - Job ID ni override qiladi - default holatda job ID noyob
  butun son bo'ladi, ammo bu sozlama bilan job ID ni o'zgartirishingiz mumkin. Agar bu opsiyadan foydalansangiz, jobId noyob bo'lishini ta'minlash sizning vazifangiz. Agar mavjud bo'lgan ID bilan job qo'shishga urinsangiz, u qo'shilmaydi.
- `removeOnComplete`: `boolean | number` - `true` bo'lsa, job muvaffaqiyatli yakunlanganda o'chiriladi. Son berilsa, saqlab qolinadigan joblar sonini bildiradi. Default xatti-harakat - jobni completed to'plamida saqlash.
- `removeOnFail`: `boolean | number` - `true` bo'lsa, job barcha urinishlardan keyin muvaffaqiyatsiz bo'lganda o'chiriladi. Son berilsa, saqlab qolinadigan joblar sonini bildiradi. Default xatti-harakat - jobni failed to'plamida saqlash.
- `stackTraceLimit`: `number` - stacktrace da yozib olinadigan qatorlar sonini cheklaydi.

Quyida job opsiyalari bilan joblarni sozlashning bir nechta misollari keltirilgan.

Job boshlanishini kechiktirish uchun `delay` konfiguratsiya xossasidan foydalaning.

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 3 seconds delayed
);
```

Jobni navbatning o'ng oxiriga qo'shish uchun (jobni **LIFO** (Last In First Out) tarzida qayta ishlash), konfiguratsiya obyektidagi `lifo` xossasini `true` ga o'rnating.

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { lifo: true },
);
```

Jobni prioritet bilan ishlash uchun `priority` xossasidan foydalaning.

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { priority: 2 },
);
```

#### Iste'molchilar

Iste'molchi - bu navbatga qo'shilgan joblarni qayta ishlaydigan yoki navbatdagi hodisalarni tinglaydigan, yoki ikkalasini ham qiladigan metodlarni belgilovchi **klass**. Iste'molchi klassni quyidagicha `@Processor()` dekoratori yordamida e'lon qiling:

```typescript
import { Processor } from '@nestjs/bull';

@Processor('audio')
export class AudioConsumer {}
```

> info **Hint** Iste'molchilar `@nestjs/bull` paketi ularni topishi uchun `providers` sifatida ro'yxatdan o'tkazilishi kerak.

Bu yerda dekoratorning string argumenti (masalan, `'audio'`) klass metodlari bog'lanadigan navbat nomidir.

Iste'molchi klassi ichida `@Process()` dekoratori bilan handler metodlarini bezab, job handlerlarini e'lon qiling.

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {
  @Process()
  async transcode(job: Job<unknown>) {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      await doSomething(job.data);
      progress += 1;
      await job.progress(progress);
    }
    return {};
  }
}
```

Dekorator qo'llangan metod (masalan, `transcode()`) worker bo'sh bo'lganida va navbatda qayta ishlash uchun joblar bo'lganda chaqiriladi. Bu handler metodi yagona argument sifatida `job` obyektini oladi. Handler metodidan qaytgan qiymat job obyektida saqlanadi va keyinroq, masalan completed hodisasi listenerida ishlatilishi mumkin.

`Job` obyektlarida holat bilan ishlash imkonini beradigan bir nechta metodlar mavjud. Masalan, yuqoridagi kod job progressini yangilash uchun `progress()` metodidan foydalanadi. `Job` obyektining to'liq API ma'lumotnomasi uchun bu yerga qarang.

Job handler metodi faqat muayyan turdagi joblarni (ma'lum `name` ga ega joblarni) qayta ishlashini `@Process()` dekoratoriga shu `name` ni berib belgilashingiz mumkin. Siz bir iste'molchi klassida har bir job turi (`name`) uchun alohida `@Process()` handlerlarga ega bo'lishingiz mumkin. Nomlangan joblardan foydalanganda, har bir nom uchun mos handler bo'lishini ta'minlang.

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }
```

> warning **Warning** Bir xil navbat uchun bir nechta iste'molchi aniqlaganda, `@Process({{ '{' }} concurrency: 1 {{ '}' }})` ichidagi `concurrency` opsiyasi ishlamaydi. Minimal `concurrency` qiymati aniqlangan iste'molchilar soniga teng bo'ladi. Bu, `@Process()` handlerlar nomlangan joblarni qayta ishlash uchun boshqa `name` dan foydalansa ham qo'llanadi.

#### Request-scoped iste'molchilar

Iste'molchi request-scoped qilib belgilansa (injection scope lar haqida batafsil bu yerda), har bir job uchun klassning alohida instansiyasi yaratiladi. Job tugagach instansiya garbage-collector tomonidan tozalanadi.

```typescript
@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})
```

Request-scoped iste'molchi klasslari dinamik tarzda instansiyalanib, bitta jobga scoped bo'lgani uchun, konstruktor orqali standart yondashuv bilan `JOB_REF` ni inject qilishingiz mumkin.

```typescript
constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}
```

> info **Hint** `JOB_REF` tokeni `@nestjs/bull` paketidan import qilinadi.

#### Hodisa listenerlari

Bull navbat va/yoki job holati o'zgarishida foydali hodisalar to'plamini generatsiya qiladi. Nest core standart hodisalarga obuna bo'lishga imkon beradigan dekoratorlar to'plamini taqdim etadi. Ular `@nestjs/bull` paketidan eksport qilinadi.

Hodisa listenerlari <a href="/docs/techniques/queues#consumers">iste'molchi</a> klass ichida (ya'ni `@Processor()` dekoratori bilan bezatilgan klassda) e'lon qilinishi kerak. Hodisani tinglash uchun quyidagi jadvaldagi dekoratorlardan birini ishlatib handler e'lon qiling. Masalan, `audio` navbatida job active holatga kirganda chiqariladigan hodisani tinglash uchun quyidagi konstruktsiyadan foydalaning:

```typescript
import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
  ...
```

Bull taqsimlangan (multi-node) muhitda ishlagani uchun hodisalarning joylashuvini (locality) tushunchasini belgilaydi. Bu tushuncha hodisalar butunlay bitta jarayonda yoki turli jarayonlardagi umumiy navbatlarda yuz berishi mumkinligini tan oladi. **Local** hodisa - lokal jarayondagi navbatda harakat yoki holat o'zgarishi sodir bo'lganda yuzaga keladigan hodisa. Boshqacha qilib aytganda, hodisa prodyuserlari va iste'molchilari bitta jarayonda bo'lsa, navbatlarda sodir bo'ladigan barcha hodisalar local hisoblanadi.

Navbat bir nechta jarayonlar o'rtasida bo'linganda, **global** hodisalar paydo bo'lishi mumkin. Bir jarayondagi listener boshqa jarayonda ishga tushgan hodisa haqida xabar olish uchun global hodisa sifatida ro'yxatdan o'tishi kerak.

Hodisa handlerlari tegishli hodisa chiqarilganda chaqiriladi. Handler quyidagi jadvalda ko'rsatilgan signatura bilan chaqiriladi va hodisaga oid ma'lumotlarga kirish imkonini beradi. Local va global hodisa handlerlari signaturalari o'rtasidagi bitta muhim farqni quyida muhokama qilamiz.

<table>
  <tr>
    <th>Local event listeners</th>
    <th>Global event listeners</th>
    <th>Handler method signature / When fired</th>
  </tr>
  <tr>
    <td><code>@OnQueueError()</code></td><td><code>@OnGlobalQueueError()</code></td><td><code>handler(error: Error)</code> - Xato yuz berdi. <code>error</code> ishga tushiruvchi xatoni o'z ichiga oladi.</td>
  </tr>
  <tr>
    <td><code>@OnQueueWaiting()</code></td><td><code>@OnGlobalQueueWaiting()</code></td><td><code>handler(jobId: number | string)</code> - Job worker bo'sh bo'lganda darhol qayta ishlanishi uchun kutyapti. <code>jobId</code> bu holatga kirgan job ID sini o'z ichiga oladi.</td>
  </tr>
  <tr>
    <td><code>@OnQueueActive()</code></td><td><code>@OnGlobalQueueActive()</code></td><td><code>handler(job: Job)</code> - Job <code>job</code> ishga tushdi. </td>
  </tr>
  <tr>
    <td><code>@OnQueueStalled()</code></td><td><code>@OnGlobalQueueStalled()</code></td><td><code>handler(job: Job)</code> - Job <code>job</code> to'xtab qolgan deb belgilandi. Bu event loopni to'xtatib qo'yadigan job workerlarni debug qilishda foydali.</td>
  </tr>
  <tr>
    <td><code>@OnQueueProgress()</code></td><td><code>@OnGlobalQueueProgress()</code></td><td><code>handler(job: Job, progress: number)</code> - Job <code>job</code> progressi <code>progress</code> qiymatiga yangilandi.</td>
  </tr>
  <tr>
    <td><code>@OnQueueCompleted()</code></td><td><code>@OnGlobalQueueCompleted()</code></td><td><code>handler(job: Job, result: any)</code> Job <code>job</code> <code>result</code> natija bilan muvaffaqiyatli yakunlandi.</td>
  </tr>
  <tr>
    <td><code>@OnQueueFailed()</code></td><td><code>@OnGlobalQueueFailed()</code></td><td><code>handler(job: Job, err: Error)</code> Job <code>job</code> <code>err</code> sabab bilan muvaffaqiyatsiz bo'ldi.</td>
  </tr>
  <tr>
    <td><code>@OnQueuePaused()</code></td><td><code>@OnGlobalQueuePaused()</code></td><td><code>handler()</code> Navbat pauzaga o'tdi.</td>
  </tr>
  <tr>
    <td><code>@OnQueueResumed()</code></td><td><code>@OnGlobalQueueResumed()</code></td><td><code>handler(job: Job)</code> Navbat qayta davom ettirildi.</td>
  </tr>
  <tr>
    <td><code>@OnQueueCleaned()</code></td><td><code>@OnGlobalQueueCleaned()</code></td><td><code>handler(jobs: Job[], type: string)</code> Eski joblar navbatdan tozalandi. <code>jobs</code> - tozalangan joblar massivi, <code>type</code> - tozalangan job turi.</td>
  </tr>
  <tr>
    <td><code>@OnQueueDrained()</code></td><td><code>@OnGlobalQueueDrained()</code></td><td><code>handler()</code> Navbat kutayotgan joblarning barchasini qayta ishlaganida (hatto qayta ishlanmagan kechiktirilgan joblar bo'lsa ham) chiqariladi.</td>
  </tr>
  <tr>
    <td><code>@OnQueueRemoved()</code></td><td><code>@OnGlobalQueueRemoved()</code></td><td><code>handler(job: Job)</code> Job <code>job</code> muvaffaqiyatli o'chirildi.</td>
  </tr>
</table>

Global hodisalarni tinglaganda metod signaturalari local variantidan biroz farq qiladi. Xususan, local versiyada `job` obyektlarini qabul qiladigan metod signaturalari global versiyada `jobId` (`number`) ni qabul qiladi. Bunday holatda haqiqiy `job` obyektiga havola olish uchun `Queue#getJob` metodidan foydalaning. Bu chaqiruvni `await` qilish kerak, shuning uchun handler `async` deb e'lon qilinishi lozim. Masalan:

```typescript
@OnGlobalQueueCompleted()
async onGlobalCompleted(jobId: number, result: any) {
  const job = await this.immediateQueue.getJob(jobId);
  console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
}
```

> info **Hint** `Queue` obyektiga kirish uchun (ya'ni `getJob()` chaqiruvini qilish uchun) uni albatta inject qilishingiz kerak. Shuningdek, Queue siz inject qilayotgan modulda ro'yxatdan o'tgan bo'lishi kerak.

Muayyan hodisa listener dekoratorlaridan tashqari, `@OnQueueEvent()` dekoratorini `BullQueueEvents` yoki `BullQueueGlobalEvents` enumlari bilan birga ham ishlatishingiz mumkin. Hodisalar haqida batafsil bu yerda o'qing.

#### Navbatni boshqarish

Navbatlarda pauza berish yoki davom ettirish, turli holatlardagi joblar sonini olish va yana bir qancha boshqaruv funksiyalarini bajarishga imkon beradigan API mavjud. Navbat API ning to'liq ro'yxatini bu yerda topasiz. Bu metodlarning istalganini `Queue` obyektida to'g'ridan-to'g'ri chaqiring, quyida pause/resume misollarida ko'rsatilgandek.

`pause()` metodini chaqirib navbatni pauza qiling. Pauza qilingan navbat resume qilinmaguncha yangi joblarni qayta ishlamaydi, ammo hozir qayta ishlanayotgan joblar yakunlanguncha davom etadi.

```typescript
await audioQueue.pause();
```

Pauzadan chiqarish uchun `resume()` metodidan foydalaning:

```typescript
await audioQueue.resume();
```

#### Alohida jarayonlar

Job handlerlar alohida (fork qilingan) jarayonda ham ishlashi mumkin (manba). Bu bir qancha afzalliklarga ega:

- Jarayon sandbox qilingan bo'ladi, shuning uchun u crash bo'lsa workerga ta'sir qilmaydi.
- Navbatga ta'sir qilmasdan bloklovchi kodni ishga tushirishingiz mumkin (joblar to'xtab qolmaydi).
- Ko'p yadroli CPUlardan ancha yaxshi foydalanish.
- Redisga kamroq ulanishlar.

```ts
@@filename(app.module)
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
      processors: [join(__dirname, 'processor.js')],
    }),
  ],
})
export class AppModule {}
```

Funksiyangiz fork qilingan jarayonda bajarilayotganligi sababli, Dependency Injection (va IoC container) mavjud bo'lmaydi. Bu shuni anglatadiki, processor funksiyangizga kerak bo'lgan tashqi bog'liqliklarning barcha instansiyalarini ichida saqlashi (yoki yaratishi) kerak bo'ladi.

```ts
@@filename(processor)
import { Job, DoneCallback } from 'bull';

export default function (job: Job, cb: DoneCallback) {
  console.log(`[${process.pid}] ${JSON.stringify(job.data)}`);
  cb(null, 'It works');
}
```

#### Async sozlash

`bull` opsiyalarini statik emas, asinxron tarzda uzatishni xohlashingiz mumkin. Bunday holatda, asinxron konfiguratsiya bilan ishlashning bir nechta usullarini taqdim etadigan `forRootAsync()` metodidan foydalaning.

Usullardan biri - factory funksiyasidan foydalanish:

```typescript
BullModule.forRootAsync({
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

Factory funksiyamiz har qanday asinxron provider kabi ishlaydi (masalan, `async` bo'lishi mumkin va `inject` orqali bog'liqliklarni qabul qiladi).

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get('QUEUE_HOST'),
      port: configService.get('QUEUE_PORT'),
    },
  }),
  inject: [ConfigService],
});
```

Muqobil ravishda, `useClass` sintaksisidan foydalanishingiz mumkin:

```typescript
BullModule.forRootAsync({
  useClass: BullConfigService,
});
```

Yuqoridagi konstruktsiya `BullConfigService` ni `BullModule` ichida instansiyalaydi va `createSharedConfiguration()` metodini chaqirib opsiyalar obyektini taqdim etish uchun foydalanadi. Bu `BullConfigService` `SharedBullConfigurationFactory` interfeysini implementatsiya qilishi kerakligini anglatadi, quyida ko'rsatilgandek:

```typescript
@Injectable()
class BullConfigService implements SharedBullConfigurationFactory {
  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}
```

`BullModule` ichida `BullConfigService` ni yaratmasdan, boshqa moduldan import qilingan providerni ishlatish uchun `useExisting` sintaksisidan foydalaning.

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

Bu konstruktsiya `useClass` bilan bir xil ishlaydi, lekin bitta muhim farqi bor - `BullModule` yangi `ConfigService` instansiyasini yaratish o'rniga import qilingan modullardan mavjud `ConfigService` ni qayta ishlatish uchun qidiradi.

Xuddi shuningdek, navbat opsiyalarini asinxron tarzda uzatish uchun `registerQueueAsync()` metodidan foydalaning, shunchaki `name` atributini factory funksiyasidan tashqarida ko'rsatishni unutmang.

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

#### Misol

Ishlaydigan misol bu yerda mavjud.
