---
title: "Router moduli"
navTitle: "Router moduli"
description: "HTTP ilovada (masalan, REST API) handler uchun route path controller uchun e'lon qilingan ixtiyoriy prefix (@Controller dekoratori ichida) bilan metod dekoratorida berilgan path'ni"
order: 13
group: recipes
groupTitle: "Recipes"
---
> info **Hint** Bu bo'lim faqat HTTP asosidagi ilovalar uchun tegishli.

HTTP ilovada (masalan, REST API) handler uchun route path controller uchun e'lon qilingan ixtiyoriy prefix (`@Controller` dekoratori ichida) bilan metod dekoratorida berilgan path'ni (masalan, `@Get('users')`) birlashtirish orqali aniqlanadi. Bu haqda ko'proq [ushbu bo'limda](/docs/core/controllers#routing) o'qishingiz mumkin. Bundan tashqari, ilovangizdagi barcha route'lar uchun [global prefix](/docs/faq/global-prefix) belgilashingiz yoki [versioning](/docs/techniques/versioning) ni yoqishingiz mumkin.

Ba'zi edge case'larda prefix'ni modul darajasida belgilash ham qulay bo'lishi mumkin, ya'ni shu modul ichida ro'yxatdan o'tgan barcha controller'lar uchun bir xil prefix ishlatiladi.
Masalan, ilovangizning "Dashboard" deb nomlangan qismi foydalanadigan bir nechta endpoint'larni expose qiladigan REST ilovani tasavvur qiling.
Bunday holatda har bir controller ichida `/dashboard` prefix'ini takrorlash o'rniga, quyidagicha utility `RouterModule` modulidan foydalanishingiz mumkin:

```typescript
@Module({
  imports: [
    DashboardModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ]),
  ],
})
export class AppModule {}
```

> info **Hint** `RouterModule` class'i `@nestjs/core` package'idan export qilinadi.

Bundan tashqari, ierarxik strukturalar ham belgilashingiz mumkin. Bu degani har bir modul `children` modullarga ega bo'lishi mumkin.
Child module'lar parent module prefix'ini meros qilib oladi. Quyidagi misolda `AdminModule` ni `DashboardModule` va `MetricsModule` uchun parent module sifatida ro'yxatdan o'tkazamiz.

```typescript
@Module({
  imports: [
    AdminModule,
    DashboardModule,
    MetricsModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
        children: [
          {
            path: 'dashboard',
            module: DashboardModule,
          },
          {
            path: 'metrics',
            module: MetricsModule,
          },
        ],
      },
    ])
  ],
});
```

> info **Hint** Bu imkoniyatdan juda ehtiyotkorlik bilan foydalanish kerak, chunki uni ortiqcha ishlatish vaqt o'tishi bilan kodni maintain qilishni qiyinlashtirishi mumkin.

Yuqoridagi misolda `DashboardModule` ichida ro'yxatdan o'tgan istalgan controller qo'shimcha `/admin/dashboard` prefix'iga ega bo'ladi, chunki modul path'larni yuqoridan pastga, ya'ni parent'dan child'ga rekursiv tarzda birlashtiradi.
Xuddi shuningdek, `MetricsModule` ichida aniqlangan har bir controller ham qo'shimcha `/admin/metrics` modul darajasidagi prefix'ga ega bo'ladi.
