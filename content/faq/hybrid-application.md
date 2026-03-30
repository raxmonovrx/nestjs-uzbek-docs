---
title: "Hybrid application"
navTitle: "Hybrid application"
description: "Hybrid application - bu ikki yoki undan ortiq turli manbadan keladigan so'rovlarni tinglaydigan ilova. Bu HTTP serverni mikroservis listener bilan yoki hatto bir nechta turli mikro"
order: 4
group: faq
groupTitle: "FAQ"
---
Hybrid application - bu ikki yoki undan ortiq turli manbadan keladigan so'rovlarni tinglaydigan ilova. Bu HTTP serverni mikroservis listener bilan yoki hatto bir nechta turli mikroservis listener'lar bilan birlashtirishi mumkin. Standart `createMicroservice` metodi bir nechta serverni qo'llab-quvvatlamaydi, shu sababli bunday holatda har bir mikroservis qo'lda yaratilishi va ishga tushirilishi kerak. Buning uchun `INestApplication` instansiyasini `connectMicroservice()` metodi orqali `INestMicroservice` instansiyalari bilan ulash mumkin.

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);
```

> info **Hint** `app.listen(port)` metodi ko'rsatilgan manzilda HTTP serverni ishga tushiradi. Agar ilovangiz HTTP so'rovlarni qayta ishlamasa, uning o'rniga `app.init()` metodidan foydalanishingiz kerak.

Bir nechta mikroservis instansiyalarini ulash uchun har bir mikroservis uchun `connectMicroservice()` metodini chaqiring:

```typescript
const app = await NestFactory.create(AppModule);
// microservice #1
const microserviceTcp = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
  options: {
    port: 3001,
  },
});
// microservice #2
const microserviceRedis = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});

await app.startAllMicroservices();
await app.listen(3001);
```

Bir nechta mikroservisga ega hybrid application ichida `@MessagePattern()` ni faqat bitta transport strategiyasiga (masalan, MQTT) bog'lash uchun `Transport` tipidagi ikkinchi argumentni uzatishimiz mumkin. Bu enum ichida barcha built-in transport strategiyalari aniqlangan.

```typescript
@@filename()
@MessagePattern('time.us.*', Transport.NATS)
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@MessagePattern({ cmd: 'time.us' }, Transport.TCP)
getTCPDate(@Payload() data: number[]) {
  return new Date().toLocaleTimeString(...);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('time.us.*', Transport.NATS)
getDate(data, context) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@Bind(Payload(), Ctx())
@MessagePattern({ cmd: 'time.us' }, Transport.TCP)
getTCPDate(data, context) {
  return new Date().toLocaleTimeString(...);
}
```

> info **Hint** `@Payload()`, `@Ctx()`, `Transport` va `NatsContext` `@nestjs/microservices` paketidan import qilinadi.

#### Konfiguratsiyani ulashish

Standart holatda hybrid application asosiy (HTTP-based) ilova uchun sozlangan global pipe, interceptor, guard va filter'larni meros qilib olmaydi.
Ushbu konfiguratsiyalarni asosiy ilovadan meros qilib olish uchun `connectMicroservice()` chaqiruvidagi ikkinchi argumentda (ixtiyoriy options obyektida) `inheritAppConfig` xossasini quyidagicha o'rnating:

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);
```
