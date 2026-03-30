---
title: "Provayderlar"
navTitle: "Provayderlar"
description: "Provayderlar Nestdagi asosiy tushuncha. Servislar, repozitoriyalar, fabrikalar va yordamchilar kabi Nestning ko'plab bazaviy sinflari provayder sifatida qaralishi mumkin. Provayder"
order: 2
group: core
groupTitle: "Core"
---
Provayderlar Nestdagi asosiy tushuncha. Servislar, repozitoriyalar, fabrikalar va yordamchilar kabi Nestning ko'plab bazaviy sinflari provayder sifatida qaralishi mumkin. Provayderning asosiy g'oyasi shuki, u bog'liqlik sifatida **in'eksiya qilinishi** mumkin, bu esa obyektlarga bir-biri bilan turli munosabatlarni shakllantirish imkonini beradi. Bu obyektlarni "bog'lash" mas'uliyati asosan Nest runtime tizimi tomonidan bajariladi.

Oldingi bobda biz oddiy `CatsController` yaratdik. Kontrollerlar HTTP so'rovlarini qayta ishlashi va murakkabroq vazifalarni **provayderlar**ga delegatsiya qilishi kerak. Provayderlar NestJS modulida `providers` sifatida e'lon qilinadigan oddiy JavaScript sinflaridir. Batafsil ma'lumot uchun "Modullar" bobiga qarang.

> info **Hint** Nest bog'liqliklarni obyektga yo'naltirilgan tarzda loyihalash va tashkil qilish imkonini bergani uchun, biz SOLID prinsiplariga amal qilishni qat'iy tavsiya qilamiz.

#### Servislar

Keling, oddiy `CatsService` yaratishdan boshlaylik. Bu servis ma'lumotlarni saqlash va qaytarib olishni boshqaradi, va u `CatsController` tomonidan ishlatiladi. Ilovaning logikasini boshqarishdagi roli tufayli uni provayder sifatida aniqlash uchun ideal nomzod.

```typescript
@@filename(cats.service)
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  constructor() {
    this.cats = [];
  }

  create(cat) {
    this.cats.push(cat);
  }

  findAll() {
    return this.cats;
  }
}
```

> info **Hint** CLI orqali servis yaratish uchun shunchaki `$ nest g service cats` buyrug'ini bajaring.

Bizning `CatsService` bitta xossa va ikki metodga ega oddiy sinf. Bu yerda asosiy qo'shimcha `@Injectable()` dekoratori. Ushbu dekorator sinfga metadata biriktirib, `CatsService` Nest IoC konteyneri tomonidan boshqarilishi mumkin bo'lgan sinf ekanini bildiradi.

Shuningdek, bu misolda `Cat` interfeysi ishlatiladi, u taxminan quyidagicha ko'rinadi:

```typescript
@@filename(interfaces/cat.interface)
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

Endi mushuklarni olish uchun servis sinfiga ega bo'lganimizdan so'ng, undan `CatsController` ichida foydalanamiz:

```typescript
@@filename(cats.controller)
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
@@switch
import { Controller, Get, Post, Body, Bind, Dependencies } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
@Dependencies(CatsService)
export class CatsController {
  constructor(catsService) {
    this.catsService = catsService;
  }

  @Post()
  @Bind(Body())
  async create(createCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }
}
```

`CatsService` sinf konstruktori orqali **in'eksiya qilinadi**. `private` kalit so'zidan foydalanilganiga e'tibor bering. Bu qisqa yozuv bir qatorda `catsService` a'zosini ham e'lon qilish, ham boshlang'ich qiymatini berish imkonini beradi va jarayonni soddalashtiradi.

#### Bog'liqliklarni in'eksiya qilish

Nest **Dependency Injection** deb ataladigan kuchli dizayn namunasi asosida qurilgan. Bu tushuncha haqida rasmiy Angular hujjatlari dagi ajoyib maqolani o'qishni qat'iy tavsiya qilamiz.

Nestda TypeScript imkoniyatlari tufayli bog'liqliklarni boshqarish oson, chunki ular turiga qarab yechiladi. Quyidagi misolda Nest `catsService` ni `CatsService` instansiyasini yaratib va qaytarib yechadi (yoki singleton bo'lsa, u allaqachon boshqa joyda so'ralgan bo'lsa, mavjud instansiyani qaytaradi). Bu bog'liqlik so'ng kontroller konstruktori ichiga in'eksiya qilinadi (yoki ko'rsatilgan xossaga biriktiriladi):

```typescript
constructor(private catsService: CatsService) {}
```

#### Qamrovlar

Provayderlar odatda ilovaning hayot davriga mos keladigan yashash muddati ("scope") ga ega. Ilova bootstrapping qilinganda, har bir bog'liqlik yechilishi kerak, ya'ni har bir provayder instansiyalanadi. Xuddi shuningdek, ilova to'xtatilganda, barcha provayderlar yo'q qilinadi. Biroq provayderni **request-scoped** qilish ham mumkin, ya'ni uning yashash muddati ilovaning hayot davriga emas, balki muayyan so'rovga bog'lanadi. Bu usullar haqida In'eksiya qamrovlari bobidan ko'proq bilib olishingiz mumkin.

#### Maxsus provayderlar

Nest provayderlar orasidagi munosabatlarni boshqaradigan o'rnatilgan inversion of control ("IoC") konteyneri bilan keladi. Bu imkoniyat bog'liqliklarni in'eksiya qilishning poydevori, ammo u biz hozirgacha ko'rganimizdan ancha kuchli. Provayderni aniqlashning bir nechta usuli bor: oddiy qiymatlar, sinflar, hamda asinxron yoki sinxron fabrikalardan foydalanishingiz mumkin. Provayderlarni aniqlash bo'yicha ko'proq misollar uchun [Bog'liqliklarni in'eksiya qilish](/docs/fundamentals/dependency-injection) bobini ko'ring.

#### Ixtiyoriy provayderlar

Ba'zan har doim ham yechilishi shart bo'lmagan bog'liqliklar bo'lishi mumkin. Masalan, sinfingiz **konfiguratsiya obyektiga** bog'liq bo'lishi mumkin, ammo u taqdim etilmasa, standart qiymatlar ishlatilishi kerak. Bunday holatlarda bog'liqlik ixtiyoriy hisoblanadi va konfiguratsiya provayderi bo'lmasa, xato yuzaga kelmasligi kerak.

Provayderni ixtiyoriy deb belgilash uchun konstruktor imzosida `@Optional()` dekoratoridan foydalaning.

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}
```

Yuqoridagi misolda biz maxsus provayderdan foydalanmoqdamiz, shuning uchun `HTTP_OPTIONS` maxsus **token**ini qo'shamiz. Oldingi misollarda konstruktor asosidagi in'eksiya ko'rsatilgan edi, bunda bog'liqlik konstruktorda sinf orqali ko'rsatiladi. Maxsus provayderlar va ularning tegishli tokenlari qanday ishlashi haqida ko'proq ma'lumot uchun Maxsus provayderlar bobini ko'ring.

#### Xossalarga asoslangan in'eksiya

Hozirgacha qo'llagan usulimiz konstruktor asosidagi in'eksiya deb ataladi, bunda provayderlar konstruktor metodi orqali in'eksiya qilinadi. Ayrim aniq holatlarda **xossalarga asoslangan in'eksiya** foydali bo'lishi mumkin. Masalan, yuqori darajadagi sinfingiz bir yoki bir nechta provayderga bog'liq bo'lsa, ularni quyi sinflarda `super()` orqali yuqorigacha uzatish noqulay bo'lib qolishi mumkin. Buni oldini olish uchun `@Inject()` dekoratorini bevosita xossa darajasida ishlatishingiz mumkin.

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

> warning **Warning** Agar sinfingiz boshqa sinfni kengaytirmasa, odatda **konstruktor asosidagi** in'eksiyadan foydalanish yaxshiroq. Konstruktor qaysi bog'liqliklar kerakligini aniq ko'rsatadi, bu esa `@Inject` bilan belgilangan sinf xossalariga qaraganda ko'proq ko'rinish beradi va kodni tushunishni osonlashtiradi.

#### Provayderni ro'yxatdan o'tkazish

Endi provayder (`CatsService`) va iste'molchi (`CatsController`) ni aniqlaganimizdan so'ng, in'eksiyani bajara olishi uchun servisni Nestda ro'yxatdan o'tkazishimiz kerak. Bu modul faylini (`app.module.ts`) tahrirlab va servisni `@Module()` dekoratoridagi `providers` massiviga qo'shish orqali amalga oshiriladi.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

Endi Nest `CatsController` sinfining bog'liqliklarini yecha oladi.

Hozircha katalog tuzilmasi quyidagicha bo'lishi kerak:

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
<div class="item">cats.service.ts</div>
</div>
<div class="item">app.module.ts</div>
<div class="item">main.ts</div>
</div>
</div>

#### Qo'lda instansiyalash

Hozirga qadar Nest bog'liqliklarni yechishdagi aksariyat tafsilotlarni avtomatik tarzda qanday boshqarishini ko'rib chiqdik. Biroq, ayrim holatlarda o'rnatilgan Dependency Injection tizimidan tashqariga chiqib, provayderlarni qo'lda olish yoki instansiyalashga ehtiyoj tug'ilishi mumkin. Shunday ikki usul quyida qisqacha bayon qilingan.

- Mavjud instansiyalarni olish yoki provayderlarni dinamik instansiyalash uchun Modulga murojaat dan foydalanishingiz mumkin.
- `bootstrap()` funksiyasi ichida provayderlarni olish (masalan, mustaqil ilovalar uchun yoki bootstrapping jarayonida konfiguratsiya servisidan foydalanish uchun) uchun Mustaqil ilovalar sahifasiga qarang.
