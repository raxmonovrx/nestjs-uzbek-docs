---
title: "Keep alive ulanishlar"
navTitle: "Keep alive ulanishlar"
description: "Standart holatda NestJS'ning HTTP adapterlari ilovani yopishdan oldin javob to'liq yakunlanishini kutadi. Biroq ayrim holatlarda bu xatti-harakat kerak bo'lmasligi yoki kutilmagan "
order: 5
group: faq
groupTitle: "FAQ"
---
Standart holatda NestJS'ning HTTP adapterlari ilovani yopishdan oldin javob to'liq yakunlanishini kutadi. Biroq ayrim holatlarda bu xatti-harakat kerak bo'lmasligi yoki kutilmagan bo'lishi mumkin. Ba'zi so'rovlar `Connection: Keep-Alive` header'laridan foydalanib, uzoq vaqt yashashi mumkin.

Agar siz ilovangiz so'rovlar tugashini kutmasdan chiqishini istasangiz, NestJS ilovasini yaratishda `forceCloseConnections` opsiyasini yoqishingiz mumkin.

> warning **Tip** Ko'pchilik foydalanuvchilarga bu opsiyani yoqish shart bo'lmaydi. Bu opsiya kerak bo'layotganining asosiy belgisi - ilova siz kutgan paytda yopilmaydi. Odatda bu `app.enableShutdownHooks()` yoqilganida va ilova restart bo'lmayotganini yoki chiqmayotganini sezganingizda kuzatiladi. Ayniqsa development vaqtida `--watch` bilan ishlaganda.

#### Foydalanish

`main.ts` faylida NestJS ilovasini yaratishda quyidagi opsiyani yoqing:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```
