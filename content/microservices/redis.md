---
title: "Redis"
navTitle: "Redis"
description: "Redis transportyori publish/subscribe messaging paradigmasini implement qiladi va Redisning Pub/Sub imkoniyatidan foydalanadi. Publish qilingan xabarlar kanallarda tasniflanadi, ul"
order: 12
group: microservices
groupTitle: "Microservices"
---
Redis transportyori publish/subscribe messaging paradigmasini implement qiladi va Redisning Pub/Sub imkoniyatidan foydalanadi. Publish qilingan xabarlar kanallarda tasniflanadi, ularni oxir-oqibat qaysi subscriberlar (agar bo'lsa) olishini bilmasdan. Har bir microservice istalgan miqdordagi kanallarga subscribe bo'lishi mumkin. Bundan tashqari, bir vaqtning o'zida bir nechta kanalga ham subscribe bo'lish mumkin. Kanallar orqali almashiladigan xabarlar **fire-and-forget**, ya'ni xabar publish qilingan va unga qiziqqan subscriberlar bo'lmasa, xabar o'chiriladi va qayta tiklanmaydi. Shuning uchun kamida bitta servis xabar yoki eventni albatta qayta ishlashiga kafolat yo'q. Bitta xabar bir nechta subscriber tomonidan subscribe qilinishi (va qabul qilinishi) mumkin.

#### O'rnatish

Redis asosidagi microservice'larni qurishni boshlash uchun avval kerakli paketni o'rnating:

```bash
$ npm i --save ioredis
```

#### Umumiy ko'rinish

Redis transportyoridan foydalanish uchun `createMicroservice()` metodiga quyidagi options obyektini uzating:

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});
```

> info **Hint** `Transport` enum'i `@nestjs/microservices` paketidan import qilinadi.

#### Opsiyalar

`options` propertysi tanlangan transportyorga xos. <strong>Redis</strong> transportyori quyida tasvirlangan propertylarni ochadi.

<table>
  <tr>
    <td><code>host</code></td>
    <td>Ulanish url'i</td>
  </tr>
  <tr>
    <td><code>port</code></td>
    <td>Ulanish porti</td>
  </tr>
  <tr>
    <td><code>retryAttempts</code></td>
    <td>Xabarni qayta urinishlar soni (default: <code>0</code>)</td>
  </tr>
  <tr>
    <td><code>retryDelay</code></td>
    <td>Xabarni qayta urinishlar orasidagi kechikish (ms) (default: <code>0</code>)</td>
  </tr>
   <tr>
    <td><code>wildcards</code></td>
    <td>Redis wildcard obunalarini yoqadi, transportyorga ichkarida <code>psubscribe</code>/<code>pmessage</code> ishlatishni buyuradi. (default: <code>false</code>)</td>
  </tr>
</table>

Rasmiy ioredis clienti qo'llab-quvvatlaydigan barcha propertylar ushbu transportyor tomonidan ham qo'llab-quvvatlanadi.

#### Mijoz

Boshqa microservice transportyorlari kabi, Redis `ClientProxy` instansiyasini yaratish uchun <a href="/docs/microservices/basics#client">bir nechta variant</a> bor.

Instansiya yaratishning bir usuli - `ClientsModule`dan foydalanish. `ClientsModule` orqali client instansiyasini yaratish uchun uni import qiling va `register()` metodiga `createMicroservice()` metodida yuqorida ko'rsatilgan xuddi shu propertylarga ega options obyektini, shuningdek injection token sifatida ishlatiladigan `name` propertysini uzating. `ClientsModule` haqida batafsil <a href="/docs/microservices/basics#client">here</a>da o'qing.

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        }
      },
    ]),
  ]
  ...
})
```

Client yaratishning boshqa usullari (`ClientProxyFactory` yoki `@Client()`) ham qo'llanishi mumkin. Ular haqida <a href="/docs/microservices/basics#client">here</a>da o'qishingiz mumkin.

#### Kontekst

Murakkabroq ssenariylarda kiruvchi so'rov haqida qo'shimcha ma'lumotlarga kirish kerak bo'lishi mumkin. Redis transportyoridan foydalanganda `RedisContext` obyektiga kirishingiz mumkin.

```typescript
@@filename()
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RedisContext) {
  console.log(`Channel: ${context.getChannel()}`);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  console.log(`Channel: ${context.getChannel()}`);
}
```

> info **Hint** `@Payload()`, `@Ctx()` va `RedisContext` `@nestjs/microservices` paketidan import qilinadi.

#### Wildcardlar

Wildcardlar qo'llab-quvvatlashini yoqish uchun `wildcards` optionini `true` ga o'rnating. Bu transportyorga ichkarida `psubscribe` va `pmessage` ishlatishni buyuradi.

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});
```

Client instansiyasini yaratishda ham `wildcards` optionini uzatishni unutmang.

Ushbu option yoqilganda, message va event patternlarida wildcardlardan foydalanishingiz mumkin. Masalan, `notifications` bilan boshlanadigan barcha kanallarga subscribe qilish uchun quyidagi patterndan foydalaning:

```typescript
@EventPattern('notifications.*')
```

#### Instansiya holati yangilanishlari

Ulanish va asosiy driver instansiyasi holati haqida real vaqt yangilanishlarini olish uchun `status` streamiga subscribe bo'lishingiz mumkin. Bu stream tanlangan driverga xos holat yangilanishlarini beradi. Redis driveri uchun `status` streami `connected`, `disconnected` va `reconnecting` eventlarini emit qiladi.

```typescript
this.client.status.subscribe((status: RedisStatus) => {
  console.log(status);
});
```

> info **Hint** `RedisStatus` tipi `@nestjs/microservices` paketidan import qilinadi.

Xuddi shuningdek, serverning `status` streamiga subscribe bo'lib, server holati haqida xabarlarni olishingiz mumkin.

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RedisStatus) => {
  console.log(status);
});
```

#### Redis eventlarini tinglash

Ba'zi holatlarda microservice tomonidan emit qilinadigan ichki eventlarni tinglashni xohlashingiz mumkin. Masalan, xato yuz berganda qo'shimcha operatsiyalarni ishga tushirish uchun `error` eventini tinglashingiz mumkin. Buning uchun quyida ko'rsatilgandek `on()` metodidan foydalaning:

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

Xuddi shuningdek, serverning ichki eventlarini tinglashingiz mumkin:

```typescript
server.on<RedisEvents>('error', (err) => {
  console.error(err);
});
```

> info **Hint** `RedisEvents` tipi `@nestjs/microservices` paketidan import qilinadi.

#### Asosiy driverga kirish

Murakkabroq use-case'larda asosiy driver instansiyasiga kirish kerak bo'lishi mumkin. Bu ulanishni qo'lda yopish yoki driverga xos metodlardan foydalanish kabi ssenariylar uchun foydali. Biroq, ko'p hollarda driverga to'g'ridan-to'g'ri kirish **kerak emas**ligini yodda tuting.

Buning uchun `unwrap()` metodidan foydalanishingiz mumkin, u asosiy driver instansiyasini qaytaradi. Generic type parametri kutilayotgan driver instansiyasi turini ko'rsatishi kerak.

```typescript
const [pub, sub] =
  this.client.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();
```

Xuddi shuningdek, serverning asosiy driver instansiyasiga kirishingiz mumkin:

```typescript
const [pub, sub] =
  server.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();
```

Eslatma: boshqa transportyorlardan farqli ravishda, Redis transportyori ikki `ioredis` instansiyasidan iborat tuple qaytaradi: birinchisi xabarlarni publish qilish uchun, ikkinchisi xabarlarni subscribe qilish uchun ishlatiladi.
