---
title: "Standalone ilovalar"
navTitle: "Standalone ilovalar"
description: "Nest ilovasini ishga tushirishning bir nechta usuli bor. Siz web ilova, microservice yoki shunchaki tarmoq tinglovchilarisiz Nest standalone ilovani (hech qanday network listenerla"
order: 1
group: core
groupTitle: "Core"
---
Nest ilovasini ishga tushirishning bir nechta usuli bor. Siz web ilova, microservice yoki shunchaki tarmoq tinglovchilarisiz Nest **standalone ilova**ni (hech qanday network listenerlarsiz) yaratishingiz mumkin. Nest standalone ilova Nest **IoC konteyneri** ustidagi wrapper bo'lib, u barcha instansiyalangan klasslarni saqlaydi. Har qanday import qilingan modul ichidan standalone ilova obyektini bevosita ishlatib, mavjud istalgan instansiyaga referens olamiz. Shuning uchun, masalan, skriptlangan **CRON** joblarida ham Nest frameworkidan foydalanishingiz mumkin. Hatto uning ustiga **CLI** ham qurishingiz mumkin.

#### Boshlash

Nest standalone ilovasini yaratish uchun quyidagi konstruktsiyadan foydalaning:

```typescript
@@filename()
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // your application logic here ...
}
bootstrap();
```

#### Static modullardan providerlarni olish

Standalone ilova obyekti Nest ilovasida ro'yxatdan o'tgan istalgan instansiyaga referens olish imkonini beradi. Tasavvur qiling, `AppModule` moduli import qilgan `TasksModule` modulida `TasksService` provideri bor. Bu klass biz CRON job ichidan chaqirmoqchi bo'lgan metodlar to'plamini taqdim etadi.

```typescript
@@filename()
const tasksService = app.get(TasksService);
```

`TasksService` instansiyasiga kirish uchun `get()` metodidan foydalanamiz. `get()` metodi har bir ro'yxatdan o'tgan modul ichida instansiyani qidiradigan **query** kabi ishlaydi. Unga istalgan provider tokenini uzatishingiz mumkin. Muqobil ravishda, qat'iy context tekshiruvi uchun `strict: true` propertysi bilan options obyektini uzating. Bu option yoqilganda, tanlangan contextdan aniq instansiyani olish uchun maxsus modullar bo'ylab navigatsiya qilishingiz kerak.

```typescript
@@filename()
const tasksService = app.select(TasksModule).get(TasksService, { strict: true });
```

Quyida standalone ilova obyektidan instansiya referenslarini olish uchun mavjud metodlar qisqacha jamlangan.

<table>
  <tr>
    <td>
      <code>get()</code>
    </td>
    <td>
      Ilova contextida mavjud controller yoki providerdan (guardlar, filterlar va h.k.) instansiyani oladi.
    </td>
  </tr>
  <tr>
    <td>
      <code>select()</code>
    </td>
    <td>
      Modul grafigi bo'ylab navigatsiya qilib, tanlangan modulning aniq instansiyasini oladi (yuqorida ta'riflangan strict mode bilan birga ishlatiladi).
    </td>
  </tr>
</table>

> info **Hint** Non-strict rejimda root modul default bo'yicha tanlanadi. Boshqa istalgan modulni tanlash uchun modul grafigi bo'ylab qo'lda, bosqichma-bosqich navigatsiya qilish kerak.

Standalone ilovada hech qanday network listener bo'lmagani uchun, HTTP bilan bog'liq Nest imkoniyatlari (masalan, middleware, interceptorlar, pipelar, guardlar va h.k.) bu contextda mavjud emas.

Masalan, ilovangizda global interceptor ro'yxatdan o'tkazib, so'ng `app.get()` metodi orqali controller instansiyasini olsangiz ham, interceptor ishlamaydi.

#### Dinamik modullardan providerlarni olish

[dynamic modules](/docs/fundamentals/dynamic-modules) bilan ishlaganda, `app.select` ga ilovada ro'yxatdan o'tgan dinamik modulni ifodalovchi aynan o'sha obyektni berishimiz kerak. Masalan:

```typescript
@@filename()
export const dynamicConfigModule = ConfigModule.register({ folder: './config' });

@Module({
  imports: [dynamicConfigModule],
})
export class AppModule {}
```

So'ng bu modulni keyinroq tanlashingiz mumkin:

```typescript
@@filename()
const configService = app.select(dynamicConfigModule).get(ConfigService, { strict: true });
```

#### Yakunlash bosqichi

Agar skript yakunlangach Node ilovasi yopilishini xohlasangiz (masalan, CRON joblarini ishga tushiradigan skript uchun), `bootstrap` funksiyangiz oxirida `app.close()` metodini quyidagicha chaqirishingiz kerak:

```typescript
@@filename()
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // application logic...
  await app.close();
}
bootstrap();
```

Va [Lifecycle events](/docs/fundamentals/lifecycle-events) bobida aytilganidek, bu lifecycle hooklarni ishga tushiradi.

#### Misol

Ishlaydigan misol here mavjud.
