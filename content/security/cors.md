---
title: "CORS"
navTitle: "CORS"
description: "Cross-origin resource sharing (CORS) - bu resurslarni boshqa domendan so'rashga imkon beradigan mexanizm. Ichkarida Nest platformaga qarab Express cors yoki Fastify @fastify/cors p"
order: 3
group: security
groupTitle: "Security"
---
Cross-origin resource sharing (CORS) - bu resurslarni boshqa domendan so'rashga imkon beradigan mexanizm. Ichkarida Nest platformaga qarab Express cors yoki Fastify @fastify/cors paketlaridan foydalanadi. Bu paketlar talablaringizga qarab sozlashingiz mumkin bo'lgan turli opsiyalarni taqdim etadi.

#### Boshlash

CORS ni yoqish uchun Nest ilova obyektida `enableCors()` metodini chaqiring.

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);
```

`enableCors()` metodi ixtiyoriy konfiguratsiya obyektini qabul qiladi. Ushbu obyektning mavjud xossalari rasmiy CORS hujjatlarida tasvirlangan. Yana bir usul - so'rovga qarab (real vaqt rejimida) konfiguratsiya obyektini asinxron tarzda aniqlash imkonini beradigan callback funksiyasini uzatish.

Muqobil ravishda, `create()` metodining opsiyalar obyektida CORS ni yoqing. Default sozlamalar bilan CORS ni yoqish uchun `cors` xossasini `true` qiling.
Yoki, xatti-harakatini sozlash uchun `cors` xossasi qiymati sifatida CORS konfiguratsiya obyektini yoki callback funksiyasini uzating.

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);
```
