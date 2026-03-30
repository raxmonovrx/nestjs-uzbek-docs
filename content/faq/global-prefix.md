---
title: "Global prefix"
navTitle: "Global prefix"
description: "HTTP ilovasida ro'yxatdan o'tgan har bir route uchun prefix o'rnatish uchun INestApplication instansiyasining setGlobalPrefix() metodidan foydalaning."
order: 2
group: faq
groupTitle: "FAQ"
---
HTTP ilovasida ro'yxatdan o'tgan **har bir route** uchun prefix o'rnatish uchun `INestApplication` instansiyasining `setGlobalPrefix()` metodidan foydalaning.

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');
```

Quyidagi konstruktsiya yordamida route'larni global prefix'dan chiqarib tashlashingiz mumkin:

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});
```

Muqobil ravishda, route'ni string sifatida ko'rsatishingiz mumkin (u barcha request method'lar uchun qo'llanadi):

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });
```

> info **Hint** `path` xossasi path-to-regexp paketi orqali wildcard parametrlarni qo'llab-quvvatlaydi. Eslatma: bu yerda `*` wildcard asteriski qabul qilinmaydi. Uning o'rniga parametrlar (`:param`) yoki nomlangan wildcard'lar (`*splat`) dan foydalanishingiz kerak.
