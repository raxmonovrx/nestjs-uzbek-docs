---
title: "NATS"
navTitle: "NATS"
description: "NATS cloud-native ilovalar, IoT messaging va microservice arxitekturalari uchun sodda, xavfsiz va yuqori unumdor open source messaging tizimi. NATS serveri Go dasturlash tilida yoz"
order: 9
group: microservices
groupTitle: "Microservices"
---
NATS cloud-native ilovalar, IoT messaging va microservice arxitekturalari uchun sodda, xavfsiz va yuqori unumdor open source messaging tizimi. NATS serveri Go dasturlash tilida yozilgan, ammo server bilan ishlash uchun client kutubxonalari o'nlab asosiy dasturlash tillari uchun mavjud. NATS **At Most Once** va **At Least Once** yetkazib berishni qo'llab-quvvatlaydi. U katta serverlar va cloud instansiyalardan tortib edge gatewaylar va hatto Internet of Things qurilmalarigacha istalgan joyda ishlashi mumkin.

#### O'rnatish

NATS asosidagi microservice'larni qurishni boshlash uchun avval kerakli paketni o'rnating:

```bash
$ npm i --save nats
```

#### Umumiy ko'rinish

NATS transportyoridan foydalanish uchun `createMicroservice()` metodiga quyidagi options obyektini uzating:

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});
```

> info **Hint** `Transport` enum'i `@nestjs/microservices` paketidan import qilinadi.

#### Opsiyalar

`options` obyekti tanlangan transportyorga xos. <strong>NATS</strong> transportyori here da tasvirlangan propertylardan tashqari quyidagi propertylarni ham ochadi:

<table>
  <tr>
    <td><code>queue</code></td>
    <td>Serveringiz subscribe qilishi kerak bo'lgan queue (bu sozlamani e'tiborsiz qoldirish uchun <code>undefined</code> qoldiring). NATS queue group'lari haqida batafsil ma'lumotni <a href="/docs/microservices/nats#queue-groups">quyida</a> o'qing.
    </td> 
  </tr>
  <tr>
    <td><code>gracefulShutdown</code></td>
    <td>Graceful shutdownni yoqadi. Yoqilganda server ulanishni yopishdan oldin barcha kanallardan unsubscribe qiladi. Standart qiymat <code>false</code>.
  </tr>
  <tr>
    <td><code>gracePeriod</code></td>
    <td>Barcha kanallardan unsubscribe qilingandan so'ng serverni kutish uchun millisekunddagi vaqt. Standart <code>10000</code> ms.
  </tr>
</table>

#### Mijoz

Boshqa microservice transportyorlari kabi, NATS `ClientProxy` instansiyasini yaratish uchun <a href="/docs/microservices/basics#client">bir nechta variant</a> bor.

Instansiya yaratishning bir usuli - `ClientsModule`dan foydalanish. `ClientsModule` orqali client instansiyasini yaratish uchun uni import qiling va `register()` metodiga `createMicroservice()` metodida yuqorida ko'rsatilgan xuddi shu propertylarga ega options obyektini, shuningdek injection token sifatida ishlatiladigan `name` propertysini uzating. `ClientsModule` haqida batafsil <a href="/docs/microservices/basics#client">here</a>da o'qing.

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        }
      },
    ]),
  ]
  ...
})
```

Client yaratishning boshqa usullari (`ClientProxyFactory` yoki `@Client()`) ham qo'llanishi mumkin. Ular haqida <a href="/docs/microservices/basics#client">here</a>da o'qishingiz mumkin.

#### So'rov-javob

**So'rov-javob** message uslubi uchun ([read more](/docs/microservices/basics#request-response)), NATS transportyori NATSning built-in Request-Reply mexanizmidan foydalanmaydi. Buning o'rniga, "request" `publish()` metodi orqali berilgan subjectda, noyob reply subject nomi bilan publish qilinadi, va responderlar o'sha subjectni tinglab reply subjectga javob yuboradi. Reply subjectlar joylashuvdan qat'i nazar, so'rov yuboruvchiga dinamik ravishda yo'naltiriladi.

#### Eventga asoslangan

**Eventga asoslangan** message uslubi uchun ([read more](/docs/microservices/basics#event-based)), NATS transportyori NATSning built-in Publish-Subscribe mexanizmidan foydalanadi. Publisher subjectda xabar yuboradi va o'sha subjectni tinglayotgan har qanday faol subscriber xabarni oladi. Subscriberlar wildcard subjectlarga ham qiziqishini ro'yxatdan o'tkazishi mumkin, ular oddiy regexga biroz o'xshaydi. Bu bir-to-ko'p pattern ba'zan fan-out deb ataladi.

#### Queue grouplari

NATS distributed queues deb ataladigan built-in load balancing funksiyasini taqdim etadi. Queue subscription yaratish uchun `queue` propertysidan quyidagicha foydalaning:

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'cats_queue',
  },
});
```

#### Kontekst

Murakkabroq ssenariylarda kiruvchi so'rov haqida qo'shimcha ma'lumotlarga kirish kerak bo'lishi mumkin. NATS transportyoridan foydalanganda `NatsContext` obyektiga kirishingiz mumkin.

```typescript
@@filename()
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  console.log(`Subject: ${context.getSubject()}`);
}
```

> info **Hint** `@Payload()`, `@Ctx()` va `NatsContext` `@nestjs/microservices` paketidan import qilinadi.

#### Wildcardlar

Obuna aniq subjectga bo'lishi mumkin yoki wildcardlarni o'z ichiga olishi mumkin.

```typescript
@@filename()
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('time.us.*')
getDate(data, context) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
```

#### Record builderlari

Xabar options'larini sozlash uchun `NatsRecordBuilder` klassidan foydalanishingiz mumkin (eslatma: bu event-based flowlar uchun ham mumkin). Masalan, `x-version` headerini qo'shish uchun `setHeaders` metodidan quyidagicha foydalaning:

```typescript
import * as nats from 'nats';

// somewhere in your code
const headers = nats.headers();
headers.set('x-version', '1.0.0');

const record = new NatsRecordBuilder(':cat:').setHeaders(headers).build();
this.client.send('replace-emoji', record).subscribe(...);
```

> info **Hint** `NatsRecordBuilder` klassi `@nestjs/microservices` paketidan eksport qilinadi.

Bu headerlarni server tomonida ham `NatsContext`ga kirish orqali quyidagicha o'qishingiz mumkin:

```typescript
@@filename()
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: NatsContext): string {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('replace-emoji')
replaceEmoji(data, context) {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

Ba'zi holatlarda bir nechta so'rovlar uchun headerlarni sozlashni xohlashingiz mumkin, bu holda ularni `ClientProxyFactory`ga options sifatida uzatishingiz mumkin:

```typescript
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'API_v1',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: ['nats://localhost:4222'],
            headers: { 'x-version': '1.0.0' },
          },
        }),
    },
  ],
})
export class ApiModule {}
```

#### Instansiya holati yangilanishlari

Ulanish va asosiy driver instansiyasi holati haqida real vaqt yangilanishlarini olish uchun `status` streamiga subscribe bo'lishingiz mumkin. Bu stream tanlangan driverga xos holat yangilanishlarini beradi. NATS driveri uchun `status` streami `connected`, `disconnected` va `reconnecting` eventlarini emit qiladi.

```typescript
this.client.status.subscribe((status: NatsStatus) => {
  console.log(status);
});
```

> info **Hint** `NatsStatus` tipi `@nestjs/microservices` paketidan import qilinadi.

Xuddi shuningdek, serverning `status` streamiga subscribe bo'lib, server holati haqida xabarlarni olishingiz mumkin.

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: NatsStatus) => {
  console.log(status);
});
```

#### Nats eventlarini tinglash

Ba'zi holatlarda microservice tomonidan emit qilinadigan ichki eventlarni tinglashni xohlashingiz mumkin. Masalan, xato yuz berganda qo'shimcha operatsiyalarni ishga tushirish uchun `error` eventini tinglashingiz mumkin. Buning uchun quyida ko'rsatilgandek `on()` metodidan foydalaning:

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

Xuddi shuningdek, serverning ichki eventlarini tinglashingiz mumkin:

```typescript
server.on<NatsEvents>('error', (err) => {
  console.error(err);
});
```
