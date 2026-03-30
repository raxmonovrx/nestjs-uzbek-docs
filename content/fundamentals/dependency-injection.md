---
title: "Maxsus provayderlar"
navTitle: "Maxsus provayderlar"
description: "Oldingi boblarda biz Dependency Injection (DI) ning turli jihatlariga va uning Nestda qanday ishlatilishiga to'xtalgan edik. Bunga misol sifatida sinflarga instansiyalarni (ko'pinc"
order: 3
group: fundamentals
groupTitle: "Fundamentals"
---
Oldingi boblarda biz **Dependency Injection (DI)** ning turli jihatlariga va uning Nestda qanday ishlatilishiga to'xtalgan edik. Bunga misol sifatida sinflarga instansiyalarni (ko'pincha servis provayderlarini) in'eksiya qilish uchun ishlatiladigan constructor based dependency injectionni keltirish mumkin. Dependency Injection Nest yadroga fundamental tarzda singdirilganini bilib hayron bo'lmaysiz. Hozirgacha biz faqat bitta asosiy patternni ko'rib chiqdik. Ilovangiz murakkablashgani sari, DI tizimining to'liq imkoniyatlaridan foydalanishingiz kerak bo'lishi mumkin, keling ularni batafsilroq ko'rib chiqaylik.

#### DI asoslari

Dependency injection - bu inversion of control (IoC) texnikasi bo'lib, unda bog'liqliklarni instansiyalashni imperativ tarzda o'zingizning kodingizda qilish o'rniga, IoC konteyneriga (bizning holatda NestJS runtime tizimi) delegatsiya qilasiz. Keling, Providers chapter dagi ushbu misolda nimalar bo'layotganini ko'rib chiqamiz.

Avval provayderni aniqlaymiz. `@Injectable()` dekoratori `CatsService` sinfini provayder sifatida belgilaydi.

```typescript
@@filename(cats.service)
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

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

  findAll() {
    return this.cats;
  }
}
```

Keyin Nestdan provayderni controller sinfiga in'eksiya qilishni so'raymiz:

```typescript
@@filename(cats.controller)
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
@@switch
import { Controller, Get, Bind, Dependencies } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
@Dependencies(CatsService)
export class CatsController {
  constructor(catsService) {
    this.catsService = catsService;
  }

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }
}
```

Nihoyat, provayderni Nest IoC konteynerida ro'yxatdan o'tkazamiz:

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

Bularning ishlashi uchun ichkarida aynan nima sodir bo'ladi? Jarayonda uchta asosiy qadam bor:

1. `cats.service.ts` da `@Injectable()` dekoratori `CatsService` sinfini Nest IoC konteyneri tomonidan boshqarilishi mumkin bo'lgan sinf sifatida e'lon qiladi.
2. `cats.controller.ts` da `CatsController` konstruktor in'eksiyasi orqali `CatsService` tokeniga bog'liqlik e'lon qiladi:

```typescript
  constructor(private catsService: CatsService)
```

3. `app.module.ts` da `CatsService` tokenini `cats.service.ts` faylidagi `CatsService` sinfi bilan bog'laymiz. Bu bog'lash (ro'yxatdan o'tkazish) qanday amalga oshishini aniq quyida ko'ramiz.

Nest IoC konteyneri `CatsController` ni instansiyalaganda, avvalo har qanday bog'liqliklarni qidiradi\*. `CatsService` bog'liqligini topganda, `CatsService` tokeni bo'yicha qidiruvni amalga oshiradi va yuqoridagi #3 ro'yxatdan o'tkazish qadamiga ko'ra `CatsService` sinfini qaytaradi. `SINGLETON` scope (standart xulq) faraz qilinsa, Nest `CatsService` instansiyasini yaratadi, keshlaydi va qaytaradi, yoki agar avval keshlangan bo'lsa, mavjud instansiyani qaytaradi.

\*Bu tushuntirish nuqtani ko'rsatish uchun biroz soddalashtirilgan. Biz yuzaki o'tib ketgan muhim jihatlardan biri shundaki, bog'liqliklar uchun kodni tahlil qilish jarayoni juda murakkab bo'lib, ilova bootstrappingi vaqtida sodir bo'ladi. Muhim xususiyatlardan biri - bog'liqlik tahlili (yoki "bog'liqlik grafigini yaratish") **tranzitiv** hisoblanadi. Yuqoridagi misolda, agar `CatsService` ning o'zi ham bog'liqliklarga ega bo'lsa, ular ham yechiladi. Bog'liqlik grafigi bog'liqliklar to'g'ri tartibda, ya'ni "pastdan yuqoriga" yechilishini ta'minlaydi. Bu mexanizm dasturchini murakkab bog'liqlik grafigini boshqarish zaruratidan xalos qiladi.

#### Standart provayderlar

`@Module()` dekoratoriga yaqindan nazar tashlaylik. `app.module` da biz quyidagilarni e'lon qilamiz:

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
```

`providers` xossasi `providers` massivini qabul qiladi. Hozirgacha biz bu provayderlarni sinf nomlari ro'yxati orqali berdik. Aslida, `providers: [CatsService]` sintaksisi quyidagi to'liq sintaksisning qisqa yozuvidir:

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];
```

Endi bu aniq konstruktsiyani ko'rsak, ro'yxatdan o'tkazish jarayonini tushunishimiz mumkin. Bu yerda biz `CatsService` tokenini `CatsService` sinfi bilan aniq bog'layapmiz. Qisqa yozuv shunchaki eng ko'p uchraydigan holatni soddalashtirish uchun qulaylik, ya'ni token bir xil nomdagi sinf instansiyasini so'rash uchun ishlatiladigan holat.

#### Maxsus provayderlar

Talablaringiz _Standart provayderlar_ taqdim etadigan imkoniyatlardan kengroq bo'lsa nima bo'ladi? Quyida bir nechta misol:

- Nest sinfni instansiyalash (yoki keshlangan instansiyani qaytarish) o'rniga maxsus instansiyani yaratishni xohlaysiz
- Mavjud sinfni ikkinchi bog'liqlikda qayta ishlatmoqchisiz
- Test uchun sinfni mock versiyasi bilan almashtirmoqchisiz

Nest bunday holatlar uchun Maxsus provayderlarni aniqlash imkonini beradi. U maxsus provayderlarni aniqlashning bir nechta yo'lini taqdim etadi. Keling, ularni ko'rib chiqamiz.

> info **Hint** Agar bog'liqliklarni yechishda muammolarga duch kelsangiz, `NEST_DEBUG` muhit o'zgaruvchisini o'rnatib, ishga tushirish vaqtida qo'shimcha yechish loglarini olishingiz mumkin.

#### Qiymat provayderlari: `useValue`

`useValue` sintaksisi doimiy qiymatni in'eksiya qilish, tashqi kutubxonani Nest konteyneriga qo'shish yoki real implementatsiyani mock obyekt bilan almashtirish uchun foydali. Faraz qilaylik, test maqsadida Nestni mock `CatsService` dan foydalanishga majburlamoqchisiz.

```typescript
import { CatsService } from './cats.service';

const mockCatsService = {
  /* mock implementation
  ...
  */
};

@Module({
  imports: [CatsModule],
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
export class AppModule {}
```

Ushbu misolda `CatsService` tokeni `mockCatsService` mock obyektiga yechiladi. `useValue` qiymat talab qiladi - bu yerda u o'rnini bosayotgan `CatsService` sinfi bilan bir xil interfeysga ega literal obyekt. TypeScriptning structural typing tufayli, mos interfeysga ega istalgan obyektni, jumladan literal obyektni yoki `new` bilan instansiyalangan sinf instansiyasini ishlatishingiz mumkin.

#### Sinfga asoslanmagan provayder tokenlari

Hozirgacha biz provayder tokenlari sifatida sinf nomlaridan foydalandik (`providers` massivida ko'rsatilgan provayderdagi `provide` xossasi qiymati). Bu constructor based injection da ishlatiladigan standart pattern bilan mos keladi, unda token ham sinf nomi bo'ladi. (Agar bu tushuncha to'liq aniq bo'lmasa, tokenlar haqida eslatma uchun DI Fundamentals ga qayting). Ba'zan DI tokeni sifatida satrlar yoki symbol'lar ishlatish moslashuvchanligini xohlashimiz mumkin. Masalan:

```typescript
import { connection } from './connection';

@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
})
export class AppModule {}
```

Ushbu misolda biz satr qiymatdagi tokenni (`'CONNECTION'`) tashqi fayldan import qilingan oldindan mavjud `connection` obyektiga bog'layapmiz.

> warning **Notice** Token qiymati sifatida satrlarni ishlatishdan tashqari, JavaScript symbols yoki TypeScript enums ni ham ishlatishingiz mumkin.

Biz provayderni standart constructor based injection patterni orqali qanday in'eksiya qilishni avval ko'rganmiz. Bu pattern bog'liqlik sinf nomi bilan e'lon qilinishini **talab qiladi**. `'CONNECTION'` maxsus provayderi satr qiymatdagi tokenni ishlatadi. Keling, bunday provayderni qanday in'eksiya qilishni ko'raylik. Buning uchun `@Inject()` dekoratoridan foydalanamiz. Bu dekorator bitta argument qabul qiladi - token.

```typescript
@@filename()
@Injectable()
export class CatsRepository {
  constructor(@Inject('CONNECTION') connection: Connection) {}
}
@@switch
@Injectable()
@Dependencies('CONNECTION')
export class CatsRepository {
  constructor(connection) {}
}
```

> info **Hint** `@Inject()` dekoratori `@nestjs/common` paketidan import qilinadi.

Yuqoridagi misollarda tushuntirish uchun bevosita `'CONNECTION'` satridan foydalangan bo'lsak-da, kodni toza tashkil etish uchun eng yaxshi amaliyot - tokenlarni `constants.ts` kabi alohida faylda aniqlashdir. Ularni xuddi o'z faylida aniqlanib, kerakli joylarda import qilinadigan symbol yoki enumlar kabi ko'ring.

#### Sinf provayderlari: `useClass`

`useClass` sintaksisi token qaysi sinfga yechilishini dinamik tarzda aniqlash imkonini beradi. Masalan, bizda abstrakt (yoki default) `ConfigService` sinfi bor deb faraz qilaylik. Joriy muhitga qarab Nest konfiguratsiya servisining boshqa implementatsiyasini taqdim etishini xohlaymiz. Quyidagi kod bunday strategiyani amalga oshiradi.

```typescript
const configServiceProvider = {
  provide: ConfigService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService,
};

@Module({
  providers: [configServiceProvider],
})
export class AppModule {}
```

Ushbu kod namunadagi bir nechta detalga qaraylik. E'tibor bering, biz avval `configServiceProvider` ni literal obyekt bilan aniqladik, keyin uni modul dekoratorining `providers` xossasiga uzatdik. Bu faqat kodni tartiblash, va funksional jihatdan bu bobda hozirgacha ishlatgan misollar bilan bir xil.

Shuningdek, biz token sifatida `ConfigService` sinf nomidan foydalandik. `ConfigService` ga bog'liq bo'lgan har qanday sinf uchun Nest taqdim etilgan sinf instansiyasini (`DevelopmentConfigService` yoki `ProductionConfigService`) in'eksiya qiladi va boshqa joyda (masalan, `@Injectable()` dekoratori bilan e'lon qilingan `ConfigService`) bo'lishi mumkin bo'lgan default implementatsiyani bekor qiladi.

#### Factory provayderlari: `useFactory`

`useFactory` sintaksisi provayderlarni **dinamik** tarzda yaratish imkonini beradi. Haqiqiy provayder factory funksiyasi qaytargan qiymat bilan taqdim etiladi. Factory funksiyasi kerak bo'lsa sodda ham, murakkab ham bo'lishi mumkin. Sodda factory boshqa provayderlarga bog'liq bo'lmasligi mumkin. Murakkab factory o'z natijasini hisoblash uchun boshqa provayderlarni in'eksiya qilishi mumkin. Ikkinchi holat uchun factory provayder sintaksisi ikki bog'liq mexanizmga ega:

1. Factory funksiyasi (ixtiyoriy) argumentlarni qabul qilishi mumkin.
2. (Ixtiyoriy) `inject` xossasi Nest yechib, instansiyalash jarayonida factory funksiyasiga argument sifatida uzatadigan provayderlar massivini qabul qiladi. Shuningdek, bu provayderlar ixtiyoriy deb belgilanishi mumkin. Ikki ro'yxat o'zaro mos bo'lishi kerak: Nest `inject` ro'yxatidagi instansiyalarni factory funksiyasiga xuddi shu tartibda argument sifatida uzatadi. Quyidagi misol buni ko'rsatadi.

```typescript
@@filename()
const connectionProvider = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: MyOptionsProvider, optionalProvider?: string) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [MyOptionsProvider, { token: 'SomeOptionalProvider', optional: true }],
  //       \______________/             \__________________/
  //        This provider                The provider with this token
  //        is mandatory.                can resolve to `undefined`.
};

@Module({
  providers: [
    connectionProvider,
    MyOptionsProvider, // class-based provider
    // { provide: 'SomeOptionalProvider', useValue: 'anything' },
  ],
})
export class AppModule {}
@@switch
const connectionProvider = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider, optionalProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [MyOptionsProvider, { token: 'SomeOptionalProvider', optional: true }],
  //       \______________/            \__________________/
  //        This provider               The provider with this token
  //        is mandatory.               can resolve to `undefined`.
};

@Module({
  providers: [
    connectionProvider,
    MyOptionsProvider, // class-base provider
    // { provide: 'SomeOptionalProvider', useValue: 'anything' },
  ],
})
export class AppModule {}
```

#### Alias provayderlari: `useExisting`

`useExisting` sintaksisi mavjud provayderlar uchun aliaslar yaratish imkonini beradi. Bu bir xil provayderga kirishning ikki yo'lini yaratadi. Quyidagi misolda (satr asosidagi) `'AliasedLoggerService'` tokeni (sinf asosidagi) `LoggerService` tokeni uchun alias hisoblanadi. Faraz qilaylik, bizda ikkita turli bog'liqlik bor: biri `'AliasedLoggerService'`, boshqasi `LoggerService`. Agar har ikkala bog'liqlik `SINGLETON` scopeda bo'lsa, ikkalasi ham bir xil instansiyaga yechiladi.

```typescript
@Injectable()
class LoggerService {
  /* implementation details */
}

const loggerAliasProvider = {
  provide: 'AliasedLoggerService',
  useExisting: LoggerService,
};

@Module({
  providers: [LoggerService, loggerAliasProvider],
})
export class AppModule {}
```

#### Servisga asoslanmagan provayderlar

Provayderlar ko'pincha servislarni taqdim etsa-da, ular faqat shunga cheklanmaydi. Provayder **istalgan** qiymatni taqdim etishi mumkin. Masalan, quyida ko'rsatilgandek provayder joriy muhitga qarab konfiguratsiya obyektlari massivini taqdim etishi mumkin:

```typescript
const configFactory = {
  provide: 'CONFIG',
  useFactory: () => {
    return process.env.NODE_ENV === 'development' ? devConfig : prodConfig;
  },
};

@Module({
  providers: [configFactory],
})
export class AppModule {}
```

#### Maxsus provayderni eksport qilish

Har qanday provayder kabi, maxsus provayder ham uni e'lon qilgan modul doirasiga tegishli. Uni boshqa modullarga ko'rinarli qilish uchun eksport qilish kerak. Maxsus provayderni eksport qilish uchun biz uning tokenidan yoki to'liq provayder obyektidan foydalanishimiz mumkin.

Quyidagi misol token yordamida eksport qilishni ko'rsatadi:

```typescript
@@filename()
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],
})
export class AppModule {}
@@switch
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],
})
export class AppModule {}
```

Muqobil ravishda, to'liq provayder obyektini eksport qiling:

```typescript
@@filename()
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class AppModule {}
@@switch
const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class AppModule {}
```
