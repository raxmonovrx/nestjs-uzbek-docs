---
title: "RabbitMQ"
navTitle: "RabbitMQ"
description: "RabbitMQ - bir nechta messaging protokollarini qo'llab-quvvatlaydigan open source va yengil message broker. U yuqori masshtab va yuqori mavjudlik talablarini qondirish uchun taqsim"
order: 11
group: microservices
groupTitle: "Microservices"
---
RabbitMQ - bir nechta messaging protokollarini qo'llab-quvvatlaydigan open source va yengil message broker. U yuqori masshtab va yuqori mavjudlik talablarini qondirish uchun taqsimlangan va federatsiyalangan konfiguratsiyalarda joylashtirilishi mumkin. Bundan tashqari, u dunyo bo'ylab kichik startaplardan katta korxonalargacha eng keng tarqalgan message broker hisoblanadi.

#### O'rnatish

RabbitMQ asosidagi microservice'larni qurishni boshlash uchun avval kerakli paketlarni o'rnating:

```bash
$ npm i --save amqplib amqp-connection-manager
```

#### Umumiy ko'rinish

RabbitMQ transportyoridan foydalanish uchun `createMicroservice()` metodiga quyidagi options obyektini uzating:

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'cats_queue',
    queueOptions: {
      durable: false
    },
  },
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'cats_queue',
    queueOptions: {
      durable: false
    },
  },
});
```

> info **Hint** `Transport` enum'i `@nestjs/microservices` paketidan import qilinadi.

#### Opsiyalar

`options` propertysi tanlangan transportyorga xos. <strong>RabbitMQ</strong> transportyori quyida tasvirlangan propertylarni ochadi.

<table>
  <tr>
    <td><code>urls</code></td>
    <td>Ketma-ket sinash uchun ulanish URL'lari massivi</td>
  </tr>
  <tr>
    <td><code>queue</code></td>
    <td>Serveringiz tinglaydigan queue nomi</td>
  </tr>
  <tr>
    <td><code>prefetchCount</code></td>
    <td>Kanal uchun prefetch countni o'rnatadi</td>
  </tr>
  <tr>
    <td><code>isGlobalPrefetchCount</code></td>
    <td>Kanal bo'yicha prefetchingni yoqadi</td>
  </tr>
  <tr>
    <td><code>noAck</code></td>
    <td>Agar <code>false</code> bo'lsa, qo'lda acknowledgment rejimi yoqiladi</td>
  </tr>
  <tr>
    <td><code>consumerTag</code></td>
    <td>Server consumer uchun xabar yetkazib berishni ajratish uchun foydalanadigan nom; u kanalda allaqachon ishlatilmagan bo'lishi kerak. Odatda buni tashlab yuborish osonroq, bu holda server tasodifiy nom yaratadi va uni javobda beradi. Consumer Tag Identifier (batafsil here)</td>
  </tr>
  <tr>
    <td><code>queueOptions</code></td>
    <td>Qo'shimcha queue options'lari (batafsil here)</td>
  </tr>
  <tr>
    <td><code>socketOptions</code></td>
    <td>Qo'shimcha socket options'lari (batafsil here)</td>
  </tr>
  <tr>
    <td><code>headers</code></td>
    <td>Har bir xabar bilan birga yuboriladigan headerlar</td>
  </tr>
  <tr>
    <td><code>replyQueue</code></td>
    <td>Producer uchun reply queue. Standart qiymat <code>amq.rabbitmq.reply-to</code></td>
  </tr>
  <tr>
    <td><code>persistent</code></td>
    <td>Agar truthy bo'lsa, xabar broker qayta ishga tushganda ham saqlanib qoladi, buning uchun u ham qayta ishga tushganda saqlanadigan queueda bo'lishi kerak</td>
  </tr>
  <tr>
    <td><code>noAssert</code></td>
    <td>False bo'lsa, consume qilishdan oldin queue assert qilinmaydi</td>
  </tr>
  <tr>
    <td><code>wildcards</code></td>
    <td>Queue'larga xabarlarni routlash uchun Topic Exchange ishlatmoqchi bo'lsangiz, true ga o'rnating. Bu message va event patternlari sifatida wildcardlardan (*, #) foydalanish imkonini beradi</td>
  </tr>
  <tr>
    <td><code>exchange</code></td>
    <td>Exchange nomi. "wildcards" true bo'lganda default queue nomiga teng</td>
  </tr>
  <tr>
    <td><code>exchangeType</code></td>
    <td>Exchange tipi. Default <code>topic</code>. Yaroqli qiymatlar: <code>direct</code>, <code>fanout</code>, <code>topic</code> va <code>headers</code></td>
  </tr>
  <tr>
    <td><code>routingKey</code></td>
    <td>Topic exchange uchun qo'shimcha routing key</td>
  </tr>
  <tr>
    <td><code>maxConnectionAttempts</code></td>
    <td>Maksimal ulanish urinishlari soni. Faqat consumer konfiguratsiyasiga taalluqli. -1 === infinite</td>
  </tr>
</table>

#### Mijoz

Boshqa microservice transportyorlari kabi, RabbitMQ `ClientProxy` instansiyasini yaratish uchun <a href="/docs/microservices/basics#client">bir nechta variant</a> bor.

Instansiya yaratishning bir usuli - `ClientsModule`dan foydalanish. `ClientsModule` orqali client instansiyasini yaratish uchun uni import qiling va `register()` metodiga `createMicroservice()` metodida yuqorida ko'rsatilgan xuddi shu propertylarga ega options obyektini, shuningdek injection token sifatida ishlatiladigan `name` propertysini uzating. `ClientsModule` haqida batafsil <a href="/docs/microservices/basics#client">here</a>da o'qing.

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'cats_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ]
  ...
})
```

Client yaratishning boshqa usullari (`ClientProxyFactory` yoki `@Client()`) ham qo'llanishi mumkin. Ular haqida <a href="/docs/microservices/basics#client">here</a>da o'qishingiz mumkin.

#### Kontekst

Murakkabroq ssenariylarda kiruvchi so'rov haqida qo'shimcha ma'lumotlarga kirish kerak bo'lishi mumkin. RabbitMQ transportyoridan foydalanganda `RmqContext` obyektiga kirishingiz mumkin.

```typescript
@@filename()
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(`Pattern: ${context.getPattern()}`);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  console.log(`Pattern: ${context.getPattern()}`);
}
```

> info **Hint** `@Payload()`, `@Ctx()` va `RmqContext` `@nestjs/microservices` paketidan import qilinadi.

RabbitMQ xabarining asl nusxasiga (`properties`, `fields` va `content` bilan) kirish uchun `RmqContext` obyektining `getMessage()` metodidan quyidagicha foydalaning:

```typescript
@@filename()
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getMessage());
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  console.log(context.getMessage());
}
```

RabbitMQ channeliga referens olish uchun `RmqContext` obyektining `getChannelRef` metodidan quyidagicha foydalaning:

```typescript
@@filename()
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getChannelRef());
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  console.log(context.getChannelRef());
}
```

#### Xabarni tasdiqlash (acknowledgement)

Xabar hech qachon yo'qolmasligini ta'minlash uchun RabbitMQ message acknowledgementsni qo'llab-quvvatlaydi. Acknowledgement consumer tomonidan RabbitMQga yuborilib, xabar olingani, qayta ishlangani va RabbitMQ xabarni o'chirishi mumkinligi haqida xabar beradi. Agar consumer o'lsa (kanal yopilsa, ulanish yopilsa yoki TCP ulanish uzilsa) va ack yuborilmasa, RabbitMQ xabar to'liq qayta ishlanmaganini tushunadi va uni qayta queuega qo'yadi.

Qo'lda acknowledgement rejimini yoqish uchun `noAck` propertysini `false` ga o'rnating:

```typescript
options: {
  urls: ['amqp://localhost:5672'],
  queue: 'cats_queue',
  noAck: false,
  queueOptions: {
    durable: false
  },
},
```

Qo'lda consumer acknowledgementlari yoqilganda, ishchi tomonidan to'g'ri acknowledgement yuborib, vazifa tugaganini bildirishimiz kerak.

```typescript
@@filename()
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  channel.ack(originalMsg);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  channel.ack(originalMsg);
}
```

#### Record builderlari

Xabar options'larini sozlash uchun `RmqRecordBuilder` klassidan foydalanishingiz mumkin (eslatma: bu event-based flowlar uchun ham mumkin). Masalan, `headers` va `priority` propertylarini o'rnatish uchun `setOptions` metodidan quyidagicha foydalaning:

```typescript
const message = ':cat:';
const record = new RmqRecordBuilder(message)
  .setOptions({
    headers: {
      ['x-version']: '1.0.0',
    },
    priority: 3,
  })
  .build();

this.client.send('replace-emoji', record).subscribe(...);
```

> info **Hint** `RmqRecordBuilder` klassi `@nestjs/microservices` paketidan eksport qilinadi.

Bu qiymatlarni server tomonida ham `RmqContext`ga kirish orqali quyidagicha o'qishingiz mumkin:

```typescript
@@filename()
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: RmqContext): string {
  const { properties: { headers } } = context.getMessage();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('replace-emoji')
replaceEmoji(data, context) {
  const { properties: { headers } } = context.getMessage();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

#### Instansiya holati yangilanishlari

Ulanish va asosiy driver instansiyasi holati haqida real vaqt yangilanishlarini olish uchun `status` streamiga subscribe bo'lishingiz mumkin. Bu stream tanlangan driverga xos holat yangilanishlarini beradi. RMQ driveri uchun `status` streami `connected` va `disconnected` eventlarini emit qiladi.

```typescript
this.client.status.subscribe((status: RmqStatus) => {
  console.log(status);
});
```

> info **Hint** `RmqStatus` tipi `@nestjs/microservices` paketidan import qilinadi.

Xuddi shuningdek, serverning `status` streamiga subscribe bo'lib, server holati haqida xabarlarni olishingiz mumkin.

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RmqStatus) => {
  console.log(status);
});
```

#### RabbitMQ eventlarini tinglash

Ba'zi holatlarda microservice tomonidan emit qilinadigan ichki eventlarni tinglashni xohlashingiz mumkin. Masalan, xato yuz berganda qo'shimcha operatsiyalarni ishga tushirish uchun `error` eventini tinglashingiz mumkin. Buning uchun quyida ko'rsatilgandek `on()` metodidan foydalaning:

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

Xuddi shuningdek, serverning ichki eventlarini tinglashingiz mumkin:

```typescript
server.on<RmqEvents>('error', (err) => {
  console.error(err);
});
```

> info **Hint** `RmqEvents` tipi `@nestjs/microservices` paketidan import qilinadi.

#### Asosiy driverga kirish

Murakkabroq use-case'larda asosiy driver instansiyasiga kirish kerak bo'lishi mumkin. Bu ulanishni qo'lda yopish yoki driverga xos metodlardan foydalanish kabi ssenariylar uchun foydali. Biroq, ko'p hollarda driverga to'g'ridan-to'g'ri kirish **kerak emas**ligini yodda tuting.

Buning uchun `unwrap()` metodidan foydalanishingiz mumkin, u asosiy driver instansiyasini qaytaradi. Generic type parametri kutilayotgan driver instansiyasi turini ko'rsatishi kerak.

```typescript
const managerRef =
  this.client.unwrap<import('amqp-connection-manager').AmqpConnectionManager>();
```

Xuddi shuningdek, serverning asosiy driver instansiyasiga kirishingiz mumkin:

```typescript
const managerRef =
  server.unwrap<import('amqp-connection-manager').AmqpConnectionManager>();
```

#### Wildcardlar

RabbitMQ routing keylarda wildcardlardan foydalanishni qo'llab-quvvatlaydi, bu xabarlarni moslashuvchan routlashga imkon beradi. `#` wildcardi nol yoki undan ko'p so'zlarni, `*` wildcardi esa aynan bitta so'zni moslaydi.

Masalan, `cats.#` routing keyi `cats`, `cats.meow` va `cats.meow.purr`ni moslaydi. `cats.*` routing keyi `cats.meow`ni moslaydi, ammo `cats.meow.purr`ni moslamaydi.

RabbitMQ microservice'ingizda wildcardlarni yoqish uchun options obyektida `wildcards` konfiguratsiya optionini `true` ga o'rnating:

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'cats_queue',
      wildcards: true,
    },
  },
);
```

Ushbu konfiguratsiya bilan event/message'ga subscribe bo'lganda routing keylarda wildcardlardan foydalanishingiz mumkin. Masalan, `cats.#` routing keyiga ega xabarlarni tinglash uchun quyidagi koddan foydalaning:

```typescript
@MessagePattern('cats.#')
getCats(@Payload() data: { message: string }, @Ctx() context: RmqContext) {
  console.log(`Received message with routing key: ${context.getPattern()}`);

  return {
    message: 'Hello from the cats service!',
  }
}
```

Ma'lum routing key bilan xabar yuborish uchun `ClientProxy` instansiyasining `send()` metodidan foydalanishingiz mumkin:

```typescript
this.client.send('cats.meow', { message: 'Meow!' }).subscribe((response) => {
  console.log(response);
});
```
