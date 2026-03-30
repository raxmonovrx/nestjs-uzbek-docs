---
title: "Kutubxonalar"
navTitle: "Kutubxonalar"
description: "Ko'plab ilovalar bir xil umumiy muammolarni hal qilishi yoki modulli komponentdan turli kontekstlarda qayta foydalanishi kerak bo'ladi. Nestda buni hal qilishning bir nechta yo'li "
order: 1
group: cli
groupTitle: "CLI"
---
Ko'plab ilovalar bir xil umumiy muammolarni hal qilishi yoki modulli komponentdan turli kontekstlarda qayta foydalanishi kerak bo'ladi. Nestda buni hal qilishning bir nechta yo'li bor, ammo har biri turli darajada ishlaydi va turli arxitektura hamda tashkilot ehtiyojlarini qondirishga yordam beradi.

Nest [modules](/docs/core/modules) bitta ilova ichida komponentlarni ulashishni imkon qiladigan execution context taqdim etish uchun foydali. Modullarni npm orqali paketlab, turli loyihalarda o'rnatiladigan qayta foydalaniladigan kutubxonalar yaratish mumkin. Bu turli, o'zaro bo'sh bog'langan yoki umuman bog'lanmagan tashkilotlar tomonidan ishlatilishi mumkin bo'lgan sozlanadigan, qayta foydalaniladigan kutubxonalarni tarqatishning samarali usuli (masalan, 3rd party kutubxonalarni tarqatish/o'rnatish).

Bir-biriga yaqin tashkil etilgan guruhlar (masalan, kompaniya/loyiha chegaralarida) ichida kodni ulashish uchun komponentlarni bo'lishishda yengilroq yondashuv foydali bo'lishi mumkin. Monorepo shunday imkoniyatni ta'minlaydigan konstruktsiya sifatida paydo bo'lgan, va monorepo ichida **kutubxona** kodni oson, yengil usulda ulashish imkonini beradi. Nest monoreposida kutubxonalardan foydalanish umumiy komponentlarni bo'lishadigan ilovalarni oson yig'ishga imkon beradi. Aslida, bu monolitik ilovalarni va ishlab chiqish jarayonlarini modul komponentlarni qurish va kompozitsiya qilishga yo'naltirib, dekompozitsiyani rag'batlantiradi.

#### Nest kutubxonalari

Nest kutubxonasi Nest loyihasidir, u ilovadan farqli ravishda o'zicha ishlay olmaydi. Kutubxona kodi bajarilishi uchun uni tarkibiy ilovaga import qilish kerak. Bu bo'limda tasvirlangan kutubxonalar uchun built-in qo'llab-quvvatlash faqat **monorepo**lar uchun mavjud (standart rejim loyihalar shunga o'xshash funksionallikka npm paketlari orqali erisha oladi).

Masalan, tashkilot barcha ichki ilovalarni boshqaradigan kompaniya siyosatlarini amalga oshirish orqali autentifikatsiyani boshqaradigan `AuthModule`ni ishlab chiqishi mumkin. Bu modulni har bir ilova uchun alohida qayta qurish yoki kodni npm bilan paketlab, har bir loyiha o'rnatishini talab qilish o'rniga, monorepo ichida ushbu modulni kutubxona sifatida aniqlash mumkin. Shunday tashkil etilganda, kutubxona modulining barcha iste'molchilari `AuthModule`ning commit qilingan eng so'nggi versiyasini ko'radi. Bu komponentlarni ishlab chiqish va yig'ishni muvofiqlashtirish, hamda end-to-end testlarni soddalashtirish uchun sezilarli foyda keltirishi mumkin.

#### Kutubxonalar yaratish

Qayta foydalanishga mos har qanday funksionallik kutubxona sifatida boshqarish uchun nomzoddir. Nimalar kutubxona bo'lishi va nimalar ilova tarkibida bo'lishi - arxitektura dizayni bo'yicha qaror. Kutubxona yaratish mavjud ilovadan kodni shunchaki ko'chirishdan ko'proq narsani talab qiladi. Kutubxona sifatida paketlanganda, kutubxona kodi ilovadan ajratilishi kerak. Bu dastlab **ko'proq** vaqt talab qilishi va mahkam bog'langan kod bilan ishlaganda uchramaydigan ayrim dizayn qarorlarini talab qilishi mumkin. Ammo bu qo'shimcha mehnat kutubxona bir nechta ilovalar bo'ylab tezroq ilova yig'ishni ta'minlaganda o'zini oqlaydi.

Kutubxona yaratishni boshlash uchun quyidagi buyruqni ishga tushiring:

```bash
$ nest g library my-library
```

Buyruqni ishga tushirganda, `library` schematic sizdan kutubxona uchun prefix (AKA alias) so'raydi:

```bash
What prefix would you like to use for the library (default: @app)?
```

Bu ishchi maydonda `my-library` nomli yangi loyiha yaratadi.
Kutubxona turidagi loyiha ham, ilova turidagi loyiha kabi, schematic yordamida nomlangan papkaga generatsiya qilinadi. Kutubxonalar monorepo rootidagi `libs` papkasi ostida boshqariladi. Nest kutubxona birinchi marta yaratilganda `libs` papkasini yaratadi.

Kutubxona uchun generatsiya qilinadigan fayllar ilova uchun generatsiya qilinadigan fayllardan biroz farq qiladi. Yuqoridagi buyruqdan so'ng `libs` papkasining tarkibi quyidagicha bo'ladi:

<div class="file-tree">
  <div class="item">libs</div>
  <div class="children">
    <div class="item">my-library</div>
    <div class="children">
      <div class="item">src</div>
      <div class="children">
        <div class="item">index.ts</div>
        <div class="item">my-library.module.ts</div>
        <div class="item">my-library.service.ts</div>
      </div>
      <div class="item">tsconfig.lib.json</div>
    </div>
  </div>
</div>

`nest-cli.json` faylida kutubxona uchun yangi yozuv "projects" kaliti ostida paydo bo'ladi:

```javascript
...
{
    "my-library": {
      "type": "library",
      "root": "libs/my-library",
      "entryFile": "index",
      "sourceRoot": "libs/my-library/src",
      "compilerOptions": {
        "tsConfigPath": "libs/my-library/tsconfig.lib.json"
      }
}
...
```

`nest-cli.json` metadatasida kutubxonalar va ilovalar o'rtasida ikki farq bor:

- "type" propertysi "library"ga o'rnatiladi, "application" emas
- "entryFile" propertysi "index"ga o'rnatiladi, "main" emas

Bu farqlar build jarayonini kutubxonalar bilan to'g'ri ishlashga yo'naltiradi. Masalan, kutubxona funksiyalarini `index.js` fayli orqali eksport qiladi.

Ilova turidagi loyihalarda bo'lgani kabi, kutubxonalarning har birida root (monorepo darajasidagi) `tsconfig.json` faylini kengaytiradigan o'z `tsconfig.lib.json` fayli mavjud. Zarur bo'lsa, kutubxonaga xos compiler options taqdim etish uchun bu faylni o'zgartirishingiz mumkin.

Kutubxonani CLI buyrug'i bilan build qilishingiz mumkin:

```bash
$ nest build my-library
```

#### Kutubxonalardan foydalanish

Avtomatik generatsiya qilingan konfiguratsiya fayllari mavjud bo'lsa, kutubxonalardan foydalanish juda oddiy. `my-library` kutubxonasidan `MyLibraryService`ni `my-project` ilovasiga qanday import qilamiz?

Avvalo, kutubxona modullaridan foydalanish boshqa har qanday Nest modulidan foydalanish bilan bir xilligini esda tuting. Monorepo qiladigan ish - pathlarni shunday boshqaradiki, kutubxonalarni import qilish va buildlarni generatsiya qilish endi shaffof bo'ladi. `MyLibraryService`dan foydalanish uchun uni e'lon qilgan modulni import qilishimiz kerak. Biz `my-project/src/app.module.ts`ni quyidagicha o'zgartirib, `MyLibraryModule`ni import qilamiz.

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyLibraryModule } from '@app/my-library';

@Module({
  imports: [MyLibraryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Yuqorida `@app` path aliasidan foydalanganimizni e'tibor qiling, bu `nest g library` buyrug'ida bergan `prefix` edi. Ichkarida Nest buni tsconfig path mapping orqali boshqaradi. Kutubxona qo'shilganda, Nest global (monorepo) `tsconfig.json` faylining "paths" kalitini quyidagicha yangilaydi:

```javascript
"paths": {
    "@app/my-library": [
        "libs/my-library/src"
    ],
    "@app/my-library/*": [
        "libs/my-library/src/*"
    ]
}
```

Xulosa qilib aytganda, monorepo va kutubxona funksiyalari kombinatsiyasi ilovalarga kutubxona modullarini kiritishni oson va intuitiv qiladi.

Xuddi shu mexanizm kutubxonalarni kompozitsiya qiladigan ilovalarni build qilish va deploy qilishga ham imkon beradi. `MyLibraryModule`ni import qilganingizdan so'ng, `nest build` barcha modul resolutionni avtomatik hal qiladi va deploy uchun ilova bilan birga kutubxona dependency'larini ham bundling qiladi. Monorepo uchun default compiler **webpack**, shuning uchun yakuniy distributsion fayl barcha transpilyatsiya qilingan JavaScript fayllarini bitta faylga yig'adi. Shuningdek, hereda tasvirlanganidek `tsc`ga o'tishingiz mumkin.
