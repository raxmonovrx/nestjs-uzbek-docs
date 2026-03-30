---
title: "Serve Static"
navTitle: "Serve Static"
description: "Single Page Application (SPA) kabi statik kontentni serve qilish uchun @nestjs/serve-static paketidagi ServeStaticModule dan foydalanishimiz mumkin."
order: 15
group: recipes
groupTitle: "Recipes"
---
Single Page Application (SPA) kabi statik kontentni serve qilish uchun `@nestjs/serve-static` paketidagi `ServeStaticModule` dan foydalanishimiz mumkin.

#### O'rnatish

Avval kerakli paketni o'rnatamiz:

```bash
$ npm install --save @nestjs/serve-static
```

#### Bootstrap

O'rnatish tugagach, `ServeStaticModule` ni root `AppModule` ga import qilib, `forRoot()` metodiga konfiguratsiya obyekti uzatish orqali sozlaymiz.

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Shundan so'ng statik saytni build qiling va uning fayllarini `rootPath` xossasida ko'rsatilgan joyga joylashtiring.

#### Konfiguratsiya

ServeStaticModule xatti-harakatini moslashtirish uchun turli opsiyalar bilan sozlanishi mumkin.
Masalan, statik ilovangiz render qilinadigan path'ni belgilashingiz, chiqarib tashlanadigan yo'llarni ko'rsatishingiz, `Cache-Control` response header'ini yoqish yoki o'chirishingiz va hokazo. Opsiyalarning to'liq ro'yxati bu yerda.

> warning **Notice** Static App uchun standart `renderPath` qiymati `*` (barcha yo'llar) bo'lib, modul javob sifatida `index.html` faylini yuboradi.
> Bu sizga SPA uchun client-side routing yaratish imkonini beradi. Controller'larda belgilangan path'lar serverga fallback qiladi.
> Ushbu xatti-harakatni `serveRoot`, `renderPath` va boshqa opsiyalarni birga sozlash orqali o'zgartirishingiz mumkin.
> Bundan tashqari, Fastify adapterida Express'dagi fallthrough xatti-harakatini taqlid qilish uchun `serveStaticOptions.fallthrough` opsiyasi qo'shilgan. Mavjud bo'lmagan route uchun 404 o'rniga `index.html` yuborilishi kerak bo'lsa, uni `true` ga o'rnatish kerak.

#### Misol

Ishlaydigan namunani bu yerda ko'rishingiz mumkin.
