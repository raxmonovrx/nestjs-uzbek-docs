---
title: "MQTT"
navTitle: "MQTT"
description: "MQTT (Message Queuing Telemetry Transport) open source, yengil messaging protokoli bo'lib, past kechikish (low latency) uchun optimallashtirilgan. Bu protokol publish/subscribe mod"
order: 8
group: microservices
groupTitle: "Microservices"
---
MQTT (Message Queuing Telemetry Transport) open source, yengil messaging protokoli bo'lib, past kechikish (low latency) uchun optimallashtirilgan. Bu protokol **publish/subscribe** modelidan foydalanib qurilmalarni ulashning masshtablanuvchi va tejamkor usulini beradi. MQTT asosida qurilgan aloqa tizimi publish qiluvchi server, broker va bir yoki bir nechta clientdan iborat. U resurslari cheklangan qurilmalar hamda past-bandwidth, yuqori kechikishli yoki ishonchsiz tarmoqlar uchun mo'ljallangan.

#### O'rnatish

MQTT asosidagi microservice'larni qurishni boshlash uchun avval kerakli paketni o'rnating:

```bash
$ npm i --save mqtt
```

#### Umumiy ko'rinish

MQTT transportyoridan foydalanish uchun `createMicroservice()` metodiga quyidagi options obyektini uzating:

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
  },
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
  },
});
```

> info **Hint** `Transport` enum'i `@nestjs/microservices` paketidan import qilinadi.

#### Opsiyalar

`options` obyekti tanlangan transportyorga xos. <strong>MQTT</strong> transportyori here da tasvirlangan propertylarni ochadi.

#### Mijoz

Boshqa microservice transportyorlari kabi, MQTT `ClientProxy` instansiyasini yaratish uchun <a href="/docs/microservices/basics#client">bir nechta variant</a> bor.

Instansiya yaratishning bir usuli - `ClientsModule`dan foydalanish. `ClientsModule` orqali client instansiyasini yaratish uchun uni import qiling va `register()` metodiga `createMicroservice()` metodida yuqorida ko'rsatilgan xuddi shu propertylarga ega options obyektini, shuningdek injection token sifatida ishlatiladigan `name` propertysini uzating. `ClientsModule` haqida batafsil <a href="/docs/microservices/basics#client">here</a>da o'qing.

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://localhost:1883',
        }
      },
    ]),
  ]
  ...
})
```

Client yaratishning boshqa usullari (`ClientProxyFactory` yoki `@Client()`) ham qo'llanishi mumkin. Ular haqida <a href="/docs/microservices/basics#client">here</a>da o'qishingiz mumkin.

#### Kontekst

Murakkabroq ssenariylarda kiruvchi so'rov haqida qo'shimcha ma'lumotlarga kirish kerak bo'lishi mumkin. MQTT transportyoridan foydalanganda `MqttContext` obyektiga kirishingiz mumkin.

```typescript
@@filename()
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

> info **Hint** `@Payload()`, `@Ctx()` va `MqttContext` `@nestjs/microservices` paketidan import qilinadi.

Original mqtt packet obyektiga kirish uchun `MqttContext` obyektining `getPacket()` metodidan quyidagicha foydalaning:

```typescript
@@filename()
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(context.getPacket());
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('notifications')
getNotifications(data, context) {
  console.log(context.getPacket());
}
```

#### Wildcardlar

Obuna aniq topicga bo'lishi mumkin yoki wildcardlarni o'z ichiga olishi mumkin. Ikkita wildcard mavjud: `+` va `#`. `+` - bir darajali wildcard, `#` esa ko'p darajali wildcard bo'lib, ko'plab topic darajalarini qamrab oladi.

```typescript
@@filename()
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
@@switch
@Bind(Ctx())
@MessagePattern('sensors/+/temperature/+')
getTemperature(context) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

#### Xizmat sifati (QoS)

`@MessagePattern` yoki `@EventPattern` dekoratorlari bilan yaratilgan har qanday obuna QoS 0 bilan subscribe qiladi. Agar yuqori QoS kerak bo'lsa, ulanishni o'rnatishda `subscribeOptions` blokidan foydalanib global tarzda quyidagicha o'rnatish mumkin:

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
    subscribeOptions: {
      qos: 2
    },
  },
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
    subscribeOptions: {
      qos: 2
    },
  },
});
```

Agar topicga xos QoS talab qilinsa, [Custom transporter](/docs/microservices/custom-transport) yaratishni ko'rib chiqing.

#### Record builderlari

Xabar options'larini sozlash (QoS darajasini o'zgartirish, Retain yoki DUP flaglarini o'rnatish yoki payloadga qo'shimcha propertylar qo'shish) uchun `MqttRecordBuilder` klassidan foydalanishingiz mumkin. Masalan, `QoS`ni `2` ga o'rnatish uchun `setQoS` metodidan quyidagicha foydalaning:

```typescript
const userProperties = { 'x-version': '1.0.0' };
const record = new MqttRecordBuilder(':cat:')
  .setProperties({ userProperties })
  .setQoS(1)
  .build();
client.send('replace-emoji', record).subscribe(...);
```

> info **Hint** `MqttRecordBuilder` klassi `@nestjs/microservices` paketidan eksport qilinadi.

Bu options'larni server tomonida ham `MqttContext`ga kirish orqali o'qishingiz mumkin.

```typescript
@@filename()
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('replace-emoji')
replaceEmoji(data, context) {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

Ba'zi holatlarda bir nechta so'rovlar uchun user propertiesni sozlashni xohlashingiz mumkin, bu holda ushbu options'larni `ClientProxyFactory`ga uzatishingiz mumkin.

```typescript
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'API_v1',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.MQTT,
          options: {
            url: 'mqtt://localhost:1833',
            userProperties: { 'x-version': '1.0.0' },
          },
        }),
    },
  ],
})
export class ApiModule {}
```

#### Instansiya holati yangilanishlari

Ulanish va asosiy driver instansiyasi holati haqida real vaqt yangilanishlarini olish uchun `status` streamiga subscribe bo'lishingiz mumkin. Bu stream tanlangan driverga xos holat yangilanishlarini beradi. MQTT driveri uchun `status` streami `connected`, `disconnected`, `reconnecting` va `closed` eventlarini emit qiladi.

```typescript
this.client.status.subscribe((status: MqttStatus) => {
  console.log(status);
});
```

> info **Hint** `MqttStatus` tipi `@nestjs/microservices` paketidan import qilinadi.

Xuddi shuningdek, serverning `status` streamiga subscribe bo'lib, server holati haqida xabarlarni olishingiz mumkin.

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: MqttStatus) => {
  console.log(status);
});
```

#### MQTT eventlarini tinglash

Ba'zi holatlarda microservice tomonidan emit qilinadigan ichki eventlarni tinglashni xohlashingiz mumkin. Masalan, xato yuz berganda qo'shimcha operatsiyalarni ishga tushirish uchun `error` eventini tinglashingiz mumkin. Buning uchun quyida ko'rsatilgandek `on()` metodidan foydalaning:

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

Xuddi shuningdek, serverning ichki eventlarini tinglashingiz mumkin:

```typescript
server.on<MqttEvents>('error', (err) => {
  console.error(err);
});
```

> info **Hint** `MqttEvents` tipi `@nestjs/microservices` paketidan import qilinadi.

#### Asosiy driverga kirish

Murakkabroq use-case'larda asosiy driver instansiyasiga kirish kerak bo'lishi mumkin. Bu ulanishni qo'lda yopish yoki driverga xos metodlardan foydalanish kabi ssenariylar uchun foydali. Biroq, ko'p hollarda driverga to'g'ridan-to'g'ri kirish **kerak emas**ligini yodda tuting.

Buning uchun `unwrap()` metodidan foydalanishingiz mumkin, u asosiy driver instansiyasini qaytaradi. Generic type parametri kutilayotgan driver instansiyasi turini ko'rsatishi kerak.

```typescript
const mqttClient = this.client.unwrap<import('mqtt').MqttClient>();
```

Xuddi shuningdek, serverning asosiy driver instansiyasiga kirishingiz mumkin:

```typescript
const mqttClient = server.unwrap<import('mqtt').MqttClient>();
```
