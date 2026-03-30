---
title: "Modullar"
navTitle: "Modullar"
description: "Modul - @Module() dekoratori bilan belgilangan sinf. Bu dekorator Nest ilova tuzilmasini samarali tashkil etish va boshqarish uchun foydalanadigan metadata beradi."
order: 13
group: core
groupTitle: "Core"
---
Modul - `@Module()` dekoratori bilan belgilangan sinf. Bu dekorator **Nest** ilova tuzilmasini samarali tashkil etish va boshqarish uchun foydalanadigan metadata beradi.

Har bir Nest ilovasida kamida bitta modul bo'ladi, **asosiy modul**, u Nest uchun **ilova grafigi** ni qurishdagi boshlang'ich nuqta bo'lib xizmat qiladi. Bu graf - Nest modul va provayderlar o'rtasidagi munosabatlar hamda bog'liqliklarni yechish uchun foydalanadigan ichki tuzilma. Kichik ilovalarda faqat asosiy modul bo'lishi mumkin, ammo odatda bunday emas. Modullar komponentlarni tashkil qilishning samarali usuli sifatida **qat'iy tavsiya etiladi**. Ko'pchilik ilovalarda bir nechta modul bo'ladi, har biri yaqin bog'liq **imkoniyatlar** to'plamini kapsullaydi.

`@Module()` dekoratori modulni tavsiflovchi xossalarga ega yagona obyektni qabul qiladi:

|               |                                                                                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `providers`   | Nest injektori tomonidan instansiyalanadigan va kamida ushbu modul doirasida bo'lishilishi mumkin bo'lgan provayderlar                                                                                                    |
| `controllers` | Ushbu modulda aniqlangan va instansiyalanishi kerak bo'lgan kontrollerlar to'plami                                                                                                                                        |
| `imports`     | Ushbu modulga kerak bo'lgan provayderlarni eksport qiladigan import qilingan modullar ro'yxati                                                                                                                            |
| `exports`     | Ushbu modul tomonidan taqdim etiladigan va uni import qiladigan boshqa modullarda mavjud bo'lishi kerak bo'lgan `providers`ning qismi. Provayderning o'zini yoki uning tokenini (`provide` qiymati) ishlatishingiz mumkin |

Modul odatda provayderlarni **kapsullaydi**, ya'ni faqat joriy modulning bir qismi bo'lgan yoki import qilingan boshqa modullardan aniq eksport qilingan provayderlarni in'eksiya qila olasiz. Moduldan eksport qilingan provayderlar aslida modulning ommaviy interfeysi yoki API si vazifasini bajaradi.

#### Funksional modullar

Misolimizda `CatsController` va `CatsService` yaqin bog'liq va bir xil ilova domeniga xizmat qiladi. Ularni funksional modulga guruhlash mantiqan. Funksional modul muayyan funksiyaga tegishli kodni tashkil qiladi, bu esa aniq chegaralarni saqlash va yaxshiroq tashkilotni ta'minlaydi. Ilova yoki jamoa kattalashgani sari bu ayniqsa muhim, va bu SOLID prinsiplari bilan mos keladi.

Keyin kontroller va servisni qanday guruhlashni ko'rsatish uchun `CatsModule` ni yaratamiz.

```typescript
@@filename(cats/cats.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

> info **Hint** CLI orqali modul yaratish uchun shunchaki `$ nest g module cats` buyrug'ini bajaring.

Yuqorida biz `CatsModule` ni `cats.module.ts` faylida aniqladik va ushbu modulga tegishli hamma narsani `cats` katalogiga ko'chirdik. Oxirgi qiladigan ishimiz bu modulni asosiy modulga (`app.module.ts` faylida aniqlangan `AppModule`) import qilish.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

Hozir katalog tuzilmasi quyidagicha:

<div class="file-tree">
  <div class="item">src</div>
  <div class="children">
    <div class="item">cats</div>
    <div class="children">
      <div class="item">dto</div>
      <div class="children">
        <div class="item">create-cat.dto.ts</div>
      </div>
      <div class="item">interfaces</div>
      <div class="children">
        <div class="item">cat.interface.ts</div>
      </div>
      <div class="item">cats.controller.ts</div>
      <div class="item">cats.module.ts</div>
      <div class="item">cats.service.ts</div>
    </div>
    <div class="item">app.module.ts</div>
    <div class="item">main.ts</div>
  </div>
</div>

#### Umumiy modullar

Nestda modullar odatda **singleton** bo'ladi, shuning uchun istalgan provayderning bir xil instansiyasini bir nechta modul o'rtasida oson ulashishingiz mumkin.

Har bir modul avtomatik ravishda **umumiy modul** hisoblanadi. Bir marta yaratilgach, uni istalgan modul qayta ishlatishi mumkin. Tasavvur qilaylik, `CatsService` instansiyasini bir nechta boshqa modullar bilan ulashmoqchimiz. Buni qilish uchun avval `CatsService` provayderini modulning `exports` massiviga qo'shib **eksport** qilishimiz kerak, quyida ko'rsatilgandek:

```typescript
@@filename(cats.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}
```

Endi `CatsModule` ni import qilgan har qanday modul `CatsService` ga kirish imkoniga ega bo'ladi va uni import qilgan barcha boshqa modullar bilan bir xil instansiyani bo'lishadi.

Agar `CatsService` ni unga kerak bo'lgan har bir modulda bevosita ro'yxatdan o'tkazsak, bu albatta ishlaydi, ammo har bir modul `CatsService` ning alohida instansiyasiga ega bo'ladi. Bu bir xil servisning bir nechta instansiyalari yaratilgani uchun xotira sarfini oshirishi mumkin va servis ichki holatni saqlasa, holat nomuvofiqligi kabi kutilmagan xatti-harakatlarga ham olib kelishi mumkin.

`CatsService` ni `CatsModule` kabi modul ichida kapsullab va uni eksport qilib, biz `CatsModule` ni import qiladigan barcha modullarda `CatsService` ning bir xil instansiyasi qayta ishlatilishini ta'minlaymiz. Bu nafaqat xotira sarfini kamaytiradi, balki xatti-harakatlarni ham ko'proq prognoz qilinadigan qiladi, chunki barcha modullar bir xil instansiyani bo'lishadi; bu umumiy holatlarni yoki resurslarni boshqarishni osonlashtiradi. Bu NestJS kabi freymvorklarda modullik va dependency injectionning asosiy afzalliklaridan biridir - servislarni ilova bo'ylab samarali ulashish imkonini beradi.

#### Modulni qayta eksport qilish

Yuqorida ko'rsatilganidek, modullar ichki provayderlarini eksport qilishi mumkin. Bundan tashqari, ular import qilgan modullarini ham qayta eksport qilishi mumkin. Quyidagi misolda `CommonModule` `CoreModule` ga **ham** import qilinadi va undan eksport qilinadi, bu esa uni import qiladigan boshqa modullar uchun mavjud qiladi.

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

#### Bog'liqliklarni in'eksiya qilish

Modul sinfi ham provayderlarni **in'eksiya qilishi** mumkin (masalan, konfiguratsiya maqsadlarida):

```typescript
@@filename(cats.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {
  constructor(private catsService: CatsService) {}
}
@@switch
import { Module, Dependencies } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
@Dependencies(CatsService)
export class CatsModule {
  constructor(catsService) {
    this.catsService = catsService;
  }
}
```

Biroq, modul sinflarining o'zi provayder sifatida in'eksiya qilinmaydi, bunga [circular dependency](/docs/fundamentals/circular-dependency) sabab.

#### Global modullar

Agar bir xil modullar to'plamini hamma joyda import qilishingiz kerak bo'lsa, bu zerikarli bo'lishi mumkin. Nestdan farqli o'laroq, Angular `providers` global doirada ro'yxatdan o'tkaziladi. Bir marta aniqlangach, ular hamma joyda mavjud bo'ladi. Nest esa provayderlarni modul doirasida kapsullaydi. Siz modul provayderlaridan ularni kapsullagan modulni avval import qilmasdan turib boshqa joyda foydalana olmaysiz.

Qachonki hamma joyda tayyor holatda mavjud bo'lishi kerak bo'lgan provayderlar to'plamini (masalan, yordamchilar, ma'lumotlar bazasi ulanishlari va hokazo) taqdim etmoqchi bo'lsangiz, modulni `@Global()` dekoratori bilan **global** qiling.

```typescript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

`@Global()` dekoratori modulni global doiraga ega qiladi. Global modullar **faqat bir marta** ro'yxatdan o'tkazilishi kerak, odatda asosiy yoki core modul tomonidan. Yuqoridagi misolda `CatsService` provayderi har yerda mavjud bo'ladi va servisni in'eksiya qilmoqchi bo'lgan modullar `imports` massivida `CatsModule` ni import qilishlari shart bo'lmaydi.

> info **Hint** Hammasini global qilish dizayn amaliyoti sifatida tavsiya etilmaydi. Global modullar boilerplate ni kamaytirishga yordam berishi mumkin, ammo odatda modulning API sini boshqa modullarga boshqariladigan va aniq tarzda taqdim etish uchun `imports` massividan foydalanish yaxshiroq. Bu yondashuv yaxshiroq tuzilma va qo'llab-quvvatlashni ta'minlaydi, modulning faqat zarur qismlari boshqalar bilan ulashilishini ta'minlaydi va ilovaning o'zaro bog'liq bo'lmagan qismlari o'rtasida keraksiz bog'lanishni oldini oladi.

#### Dinamik modullar

Nestdagi dinamik modullar sizga ish vaqtida sozlanadigan modullarni yaratish imkonini beradi. Bu ayniqsa provayderlar muayyan variantlar yoki konfiguratsiyalarga qarab yaratilishi mumkin bo'lgan moslashuvchan, sozlanadigan modullarni taqdim etishingiz kerak bo'lganda foydali. Quyida **dinamik modullar** qanday ishlashining qisqacha ko'rinishi keltirilgan.

```typescript
@@filename()
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
  exports: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}
@@switch
import { Module } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
  exports: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options) {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}
```

> info **Hint** `forRoot()` metodi dinamik modulni sinxron yoki asinxron tarzda (ya'ni `Promise` orqali) qaytarishi mumkin.

Ushbu modul `@Module()` dekoratori metadatasida `Connection` provayderini standart tarzda aniqlaydi, biroq qo'shimcha ravishda - `forRoot()` metodiga uzatilgan `entities` va `options` obyektlariga qarab - provayderlar to'plamini, masalan, repozitoriyalarni taqdim etadi. Dinamik modul qaytargan xossalar `@Module()` dekoratorida aniqlangan bazaviy modul metadatasini **kengaytiradi** (almashtirmaydi). Shu tariqa moduldan statik e'lon qilingan `Connection` provayderi **va** dinamik yaratilgan repozitoriya provayderlari eksport qilinadi.

Agar dinamik modulni global doirada ro'yxatdan o'tkazmoqchi bo'lsangiz, `global` xossasini `true` ga o'rnating.

```typescript
{
  global: true,
  module: DatabaseModule,
  providers: providers,
  exports: providers,
}
```

> warning **Warning** Yuqorida aytilganidek, hammasini global qilish **yaxshi dizayn qarori emas**.

`DatabaseModule` ni quyidagi tarzda import qilib sozlash mumkin:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
})
export class AppModule {}
```

Agar dinamik modulni qayta eksport qilmoqchi bo'lsangiz, `exports` massivida `forRoot()` metodini chaqirishni tashlab ketishingiz mumkin:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
  exports: [DatabaseModule],
})
export class AppModule {}
```

[Dinamik modullar](/docs/fundamentals/dynamic-modules) bobida bu mavzu batafsilroq yoritilgan va ishlaydigan misol keltirilgan.

> info **Hint** `ConfigurableModuleBuilder` yordamida yuqori darajada sozlanadigan dinamik modullarni qanday qurishni [ushbu bob](/docs/fundamentals/dynamic-modules#configurable-module-builder)da o'rganing.
