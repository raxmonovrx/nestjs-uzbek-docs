---
title: "Dinamik modullar"
navTitle: "Dinamik modullar"
description: "Modullar bobi Nest modullarining asoslarini qamrab oladi va dinamik modullar haqida qisqacha kirish beradi. Ushbu bob dinamik modullar mavzusini kengaytiradi. Yakunda siz ularning "
order: 5
group: fundamentals
groupTitle: "Fundamentals"
---
[Modullar bobi](/docs/core/modules) Nest modullarining asoslarini qamrab oladi va [dinamik modullar](/docs/core/modules#dynamic-modules) haqida qisqacha kirish beradi. Ushbu bob dinamik modullar mavzusini kengaytiradi. Yakunda siz ularning nimaligini va qachon hamda qanday ishlatishni yaxshi tushunib olasiz.

#### Kirish

Hujjatlarning **Overview** bo'limidagi ilova kodi misollarining aksariyati odatiy, ya'ni statik modullardan foydalanadi. Modullar providers va [controllers](/docs/core/controllers) kabi komponentlar guruhlarini belgilaydi; ular ilovaning modulli qismi sifatida birga ishlaydi. Modullar ushbu komponentlar uchun execution context yoki scope taqdim etadi. Masalan, modul ichida aniqlangan provayderlar ularni eksport qilish shartisiz modulning boshqa a'zolariga ko'rinadi. Provayder moduldan tashqarida ko'rinishi kerak bo'lsa, avval u o'zining host modulidan eksport qilinadi, so'ng consuming modulga import qilinadi.

Keling, tanish misolni ko'rib chiqamiz.

Avval `UsersService` ni taqdim etish va eksport qilish uchun `UsersModule` ni aniqlaymiz. `UsersModule` `UsersService` uchun **host** modul hisoblanadi.

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

Keyin `UsersModule` ni import qiladigan `AuthModule` ni aniqlaymiz; shu bilan `UsersModule` eksport qilgan provayderlar `AuthModule` ichida mavjud bo'ladi:

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

Bu konstruktsiyalar `UsersService` ni, masalan, `AuthModule` ichida joylashgan `AuthService` ga in'eksiya qilishga imkon beradi:

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  /*
    Implementation that makes use of this.usersService
  */
}
```

Buni **statik** modul bog'lash deb ataymiz. Nest modullarni bir-biriga ulash uchun kerakli barcha ma'lumotlar host va consuming modullarda allaqachon e'lon qilingan. Endi bu jarayonda nimalar sodir bo'lishini ochib beramiz. Nest `UsersService` ni `AuthModule` ichida quyidagicha mavjud qiladi:

1. `UsersModule` ni instansiyalaydi, bunda `UsersModule` ning o'zi iste'mol qiladigan boshqa modullarni tranzitiv tarzda import qiladi va har qanday bog'liqliklarni tranzitiv yechadi (qarang Custom providers).
2. `AuthModule` ni instansiyalaydi va `UsersModule` eksport qilgan provayderlarni `AuthModule` komponentlariga mavjud qiladi (xuddi ular `AuthModule` da e'lon qilingandek).
3. `UsersService` instansiyasini `AuthService` ga in'eksiya qiladi.

#### Dinamik modul use-case

Statik modul bog'lashda consuming modul host modul provayderlari qanday sozlanishiga **ta'sir ko'rsata** olmaydi. Bu nega muhim? Turli use-case'larda turlicha ishlashi kerak bo'lgan umumiy modul holatini ko'rib chiqing. Bu ko'plab tizimlardagi "plugin" tushunchasiga o'xshaydi, ya'ni umumiy imkoniyat consumer tomonidan ishlatilishidan oldin qandaydir konfiguratsiyani talab qiladi.

Nestdagi yaxshi misol - **konfiguratsiya moduli**. Ko'plab ilovalar konfiguratsiya tafsilotlarini tashqi qilish uchun konfiguratsiya modulidan foydalanishni foydali deb biladi. Bu turli deploymentlarda ilova sozlamalarini dinamik o'zgartirishni osonlashtiradi: masalan, developerlar uchun development bazasi, staging/testing muhiti uchun staging bazasi va hokazo. Konfiguratsiya parametrlarini boshqarishni konfiguratsiya moduliga delegatsiya qilish orqali ilova manba kodi konfiguratsiya parametrlaridan mustaqil qoladi.

Muammo shundaki, konfiguratsiya modulining o'zi umumiy ("plugin"ga o'xshash) bo'lgani sababli, u consuming modul tomonidan moslashtirilishi kerak. Bu yerda _dinamik modullar_ ishga tushadi. Dinamik modul imkoniyatlaridan foydalanib, konfiguratsiya modulimizni **dinamik** qilamiz, shunda consuming modul import vaqtida konfiguratsiya moduli qanday moslashtirilishini API orqali boshqara oladi.

Boshqacha qilib aytganda, dinamik modullar bir modulni boshqasiga import qilish va import vaqtida u modulning xossalari hamda xatti-harakatini moslashtirish uchun API taqdim etadi; bu hozirgacha ko'rgan statik bog'lashdan farq qiladi.

#### Config modul misoli

Bu bo'lim uchun [configuration chapter](/docs/techniques/configuration#service) dagi kod misolining bazaviy versiyasidan foydalanamiz. Ushbu bob oxiridagi yakuniy versiya ishlaydigan misol sifatida bu yerda mavjud.

Talabimiz - `ConfigModule` `options` obyektini qabul qilib, o'zini moslashtira olsin. Biz qo'llab-quvvatlamoqchi bo'lgan imkoniyat mana shunday. Bazaviy namunada `.env` fayli joylashuvi project root katalogiga qattiq kodlangan. Faraz qilaylik, buni sozlanadigan qilishni xohlaymiz, ya'ni `.env` fayllarini xohlagan katalogingizda boshqara olasiz. Masalan, project root ostida `config` nomli katalogda (ya'ni `src` bilan yonma-yon) turli `.env` fayllarini saqlamoqchisiz. `ConfigModule` ni turli loyihalarda ishlatganda turli kataloglarni tanlash imkonini xohlaysiz.

Dinamik modullar import qilinayotgan modulga parametrlar uzatish imkonini beradi, shunda uning xatti-harakatini o'zgartirishimiz mumkin. Keling, bu qanday ishlashini ko'raylik. Avval consuming modul nuqtai nazaridan yakuniy ko'rinish qanday bo'lishini ko'z oldiga keltirish va keyin orqaga qarab yurish foydali. Avvalo, `ConfigModule` ni _statik_ import qilish misolini tezkor ko'rib chiqaylik (ya'ni import qilingan modul xatti-harakatiga ta'sir qila olmaydigan yondashuv). `@Module()` dekoratoridagi `imports` massiviga diqqat qiling:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Endi konfiguratsiya obyektini uzatadigan _dinamik modul_ importi qanday ko'rinishini tasavvur qilaylik. Bu ikki misolda `imports` massividagi farqqa e'tibor bering:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Yuqoridagi dinamik misolda nimalar sodir bo'lyapti? Harakatlanuvchi qismlar nimalar?

1. `ConfigModule` oddiy sinf, demak unda `register()` nomli **static metod** bo'lishi kerakligini xulosa qilamiz. Uning static ekanini bilamiz, chunki uni `ConfigModule` sinfida chaqiryapmiz, sinf **instansiyasi**da emas. Eslatma: bu metod, yaqin orada yaratadiganimiz, istalgan nomga ega bo'lishi mumkin, ammo odatga ko'ra uni `forRoot()` yoki `register()` deb atashimiz kerak.
2. `register()` metodini biz o'zimiz aniqlaymiz, shuning uchun u xohlagan argumentlarni qabul qilishi mumkin. Bu holatda biz mos xossalarga ega sodda `options` obyektini qabul qilamiz, bu odatiy hol.
3. `register()` metodi `module`ga o'xshash nimanidir qaytarishi kerakligini xulosa qilamiz, chunki uning qaytgan qiymati tanish `imports` ro'yxatida ko'rinadi va u modullar ro'yxatini o'z ichiga oladi.

Aslida, `register()` metodi qaytaradigan narsa `DynamicModule` bo'ladi. Dinamik modul - bu run-time paytida yaratilgan modul bo'lib, statik modul bilan aynan bir xil xossalarga ega, faqat bitta qo'shimcha `module` xossasi bor. Keling, `@Module()` dekoratoriga uzatilgan modul opsiyalariga diqqat qilib, statik modul deklaratsiyasining namunaviy ko'rinishini tezkor ko'rib chiqamiz:

```typescript
@Module({
  imports: [DogsModule],
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
```

Dinamik modullar xuddi shu interfeysga ega bo'lgan obyektni, qo'shimcha `module` xossasi bilan birga qaytarishi kerak. `module` xossasi modul nomi sifatida xizmat qiladi va u modul sinfi nomiga teng bo'lishi kerak, quyidagi misolda ko'rsatilganidek.

> info **Hint** Dinamik modul uchun modul opsiyalari obyektining barcha xossalari ixtiyoriy, `module` **bundan mustasno**.

Statik `register()` metodiga kelsak, endi uning vazifasi `DynamicModule` interfeysiga ega obyektni qaytarish ekanini ko'ramiz. Biz uni chaqirganimizda, statik holatda modul sinf nomini ro'yxatga qo'shgandek, amalda `imports` ro'yxatiga modul taqdim etyapmiz. Boshqacha aytganda, dinamik modul API shunchaki modulni qaytaradi, faqat `@Module` dekoratorida xossalarni qotirib qo'yish o'rniga, ularni dasturiy tarzda belgilaymiz.

Rasm to'liq bo'lishi uchun yana bir-ikki detalni ko'rib chiqish kerak:

1. Endi `@Module()` dekoratorining `imports` xossasi nafaqat modul sinf nomini (masalan, `imports: [UsersModule]`), balki dinamik modul **qaytaradigan** funksiyani ham qabul qilishi mumkinligini ayta olamiz (masalan, `imports: [ConfigModule.register(...)]`).
2. Dinamik modulning o'zi ham boshqa modullarni import qilishi mumkin. Biz bu misolda buni qilmaymiz, ammo agar dinamik modul boshqa modullardagi provayderlarga bog'liq bo'lsa, ularni ixtiyoriy `imports` xossasi orqali import qilishingiz mumkin. Bu yana statik modul uchun `@Module()` dekoratori orqali metadata e'lon qilish bilan aynan analog.

Ushbu tushunchani o'zlashtirgach, dinamik `ConfigModule` deklaratsiyasi qanday ko'rinishda bo'lishi kerakligini ko'rib chiqamiz. Keling, sinab ko'ramiz.

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
```

Endi qismlar qanday bog'lanishini aniq ko'rish mumkin. `ConfigModule.register(...)` chaqiruvi `DynamicModule` obyektini qaytaradi; uning xossalari hozirgacha `@Module()` dekoratori orqali metadata sifatida berganlarimiz bilan mohiyatan bir xil.

> info **Hint** `DynamicModule` ni `@nestjs/common` dan import qiling.

Hozircha dinamik modulimiz unchalik qiziqarli emas, chunki u hali **sozlanadigan** imkoniyatni kiritmadi, biz buni xohlaganimizni aytgan edik. Endi shu masalani hal qilaylik.

#### Modul konfiguratsiyasi

`ConfigModule` xatti-harakatini moslashtirish uchun aniq yechim - static `register()` metodiga `options` obyektini uzatish, yuqorida taxmin qilganimizdek. Keling, consuming modulning `imports` xossasiga yana bir bor qaraylik:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Bu `options` obyektini dinamik modulimizga uzatish masalasini chiroyli hal qiladi. Endi `ConfigModule` ichida `options` obyektidan qanday foydalanamiz? Keling, bu haqda o'ylab ko'ramiz. Biz bilamizki, `ConfigModule` aslida boshqa provayderlar foydalanishi uchun in'eksiya qilinadigan servis - `ConfigService` - ni taqdim etadigan va eksport qiladigan host hisoblanadi. Aslida `options` obyektini o'qib, xatti-harakatini moslashtirishi kerak bo'lgan `ConfigService` ning o'zi. Hozircha `register()` metodidan `ConfigService` ga `options` ni qandaydir yo'l bilan uzatishni bilamiz, deb faraz qilaylik. Shu faraz bilan, servisga `options` obyektidagi xossalarga asoslanib xatti-harakatini moslashtirish uchun bir nechta o'zgartirish kiritishimiz mumkin. (**Eslatma**: hozircha, biz uni qanday uzatishni _hali_ aniqlamaganimiz sababli, `options` ni shunchaki hard-code qilamiz. Buni birozdan keyin to'g'rilaymiz).

```typescript
import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const options = { folder: './config' };

    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

Endi `ConfigService` `options` da ko'rsatgan katalogimizdan `.env` faylini topishni biladi.

Endi qolgan vazifa - `register()` qadamidan `options` obyektini qanday qilib `ConfigService` ga in'eksiya qilish. Va albatta, buning uchun _dependency injection_ dan foydalanamiz. Bu muhim nuqta, shuning uchun uni yaxshi tushunib oling. Bizning `ConfigModule` `ConfigService` ni taqdim etadi. `ConfigService` esa faqat run-time paytida beriladigan `options` obyektiga bog'liq. Demak, run-time paytida avval `options` obyektini Nest IoC konteyneriga bog'lashimiz, keyin Nest uni `ConfigService` ga in'eksiya qilishi kerak. **Custom providers** bobidan esda bo'lsin, provayderlar istalgan qiymatni taqdim etishi mumkin, nafaqat servislarni, shuning uchun oddiy `options` obyektini dependency injection bilan boshqarish mumkin.

Avval `options` obyektini IoC konteyneriga bog'lashni hal qilamiz. Buni static `register()` metodimizda bajaramiz. Yodingizda bo'lsin, biz modulni dinamik tarzda tuzyapmiz va modul xossalaridan biri - provayderlar ro'yxati. Shuning uchun `options` obyektini provayder sifatida belgilashimiz kerak. Bu uni `ConfigService` ga in'eksiya qilinadigan qiladi; keyingi qadamda bundan foydalanamiz. Quyidagi kodda `providers` massiviga diqqat qiling:

```typescript
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({})
export class ConfigModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
```

Endi jarayonni `'CONFIG_OPTIONS'` provayderini `ConfigService` ga in'eksiya qilish orqali yakunlaymiz. Sifat token bilan provayder aniqlaganimizda, `@Inject()` dekoratoridan foydalanishimiz kerakligi bu yerda ta'riflangan.

```typescript
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { Injectable, Inject } from '@nestjs/common';
import { EnvConfig } from './interfaces';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(@Inject('CONFIG_OPTIONS') private options: Record<string, any>) {
    const filePath = `${process.env.NODE_ENV || 'development'}.env`;
    const envFile = path.resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

Oxirgi eslatma: soddalik uchun yuqorida satrga asoslangan in'eksiya tokenidan (`'CONFIG_OPTIONS'`) foydalandik, ammo eng yaxshi amaliyot - uni alohida faylda konstanta (yoki `Symbol`) sifatida aniqlash va o'sha faylni import qilish. Masalan:

```typescript
export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
```

#### Misol

Ushbu bobdagi kodning to'liq misolini bu yerda topishingiz mumkin.

#### Hamjamiyat ko'rsatmalari

`@nestjs/` paketlarining ayrimlarida `forRoot`, `register`, va `forFeature` kabi metodlardan foydalanishni ko'rib, bu metodlar o'rtasidagi farq nima deb qiziqqan bo'lishingiz mumkin. Bu borada qat'iy qoidalar yo'q, ammo `@nestjs/` paketlari quyidagi ko'rsatmalarga rioya qilishga harakat qiladi:

Modulni yaratishda:

- `register` - dinamik modulni faqat chaqiruvchi modul uchun maxsus konfiguratsiya bilan sozlashni kutasiz. Masalan, Nestning `@nestjs/axios` moduli bilan: `HttpModule.register({{ '{' }} baseUrl: 'someUrl' {{ '}' }})`. Agar boshqa modulda `HttpModule.register({{ '{' }} baseUrl: 'somewhere else' {{ '}' }})` ni ishlatsangiz, u boshqa konfiguratsiyaga ega bo'ladi. Buni xohlagancha ko'p modullar uchun qilishingiz mumkin.

- `forRoot` - dinamik modulni bir marta sozlab, shu konfiguratsiyani ko'p joyda qayta ishlatishni kutasiz (ko'pincha bu abstraksiyalangan bo'ladi). Shu sababli sizda bitta `GraphQLModule.forRoot()`, bitta `TypeOrmModule.forRoot()` va hokazo bo'ladi.

- `forFeature` - dinamik modulning `forRoot` konfiguratsiyasidan foydalanmoqchisiz, ammo chaqiruvchi modul ehtiyojlariga xos ba'zi konfiguratsiyani o'zgartirishingiz kerak (ya'ni bu modul qaysi repozitoriyaga kirishi kerakligi yoki logger qaysi kontekstdan foydalanishi kerakligi).

Ularning barchasida odatda `async` muqobillari ham bo'ladi: `registerAsync`, `forRootAsync`, va `forFeatureAsync`. Ma'nosi bir xil, faqat konfiguratsiya uchun Nestning Dependency Injection imkoniyatlaridan ham foydalaniladi.

#### Configurable module builder

`registerAsync`, `forRootAsync` kabi `async` metodlarni taqdim etadigan yuqori darajada sozlanadigan, dinamik modullarni qo'lda yaratish ancha murakkab, ayniqsa yangi boshlovchilar uchun. Shu sababli Nest bu jarayonni yengillashtiradigan va bir necha qator kod bilan modulning "blueprint"ini tuzishga imkon beradigan `ConfigurableModuleBuilder` sinfini taqdim etadi.

Masalan, yuqorida ishlatgan misolimizni (`ConfigModule`) olaylik va uni `ConfigurableModuleBuilder` dan foydalanishga o'zgartiraylik. Boshlashdan oldin, `ConfigModule` qabul qiladigan opsiyalarni ifodalaydigan alohida interfeys yaratganimizga ishonch hosil qilaylik.

```typescript
export interface ConfigModuleOptions {
  folder: string;
}
```

Shu bilan, yangi alohida fayl yarating (mavjud `config.module.ts` fayli yonida) va uni `config.module-definition.ts` deb nomlang. Bu faylda `ConfigurableModuleBuilder` dan foydalanib `ConfigModule` definitsiyasini tuzamiz.

```typescript
@@filename(config.module-definition)
import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ConfigModuleOptions } from './interfaces/config-module-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().build();
@@switch
import { ConfigurableModuleBuilder } from '@nestjs/common';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder().build();
```

Endi `config.module.ts` faylini ochib, uning implementatsiyasini auto-generated `ConfigurableModuleClass` dan foydalanish uchun o'zgartiramiz:

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigurableModuleClass } from './config.module-definition';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends ConfigurableModuleClass {}
```

`ConfigurableModuleClass` ni kengaytirish `ConfigModule` ga endi faqat `register` metodini emas (avvalgi maxsus implementatsiyadagi kabi), balki `registerAsync` metodini ham taqdim etadi. Bu metod consumerlarga modulni asinxron tarzda sozlash imkonini beradi, masalan, asinxron factory'larni uzatish orqali:

```typescript
@Module({
  imports: [
    ConfigModule.register({ folder: './config' }),
    // or alternatively:
    // ConfigModule.registerAsync({
    //   useFactory: () => {
    //     return {
    //       folder: './config',
    //     }
    //   },
    //   inject: [...any extra dependencies...]
    // }),
  ],
})
export class AppModule {}
```

`registerAsync` metodi quyidagi obyektni argument sifatida qabul qiladi:

```typescript
{
  /**
   * Injection token resolving to a class that will be instantiated as a provider.
   * The class must implement the corresponding interface.
   */
  useClass?: Type<
    ConfigurableModuleOptionsFactory<ModuleOptions, FactoryClassMethodKey>
  >;
  /**
   * Function returning options (or a Promise resolving to options) to configure the
   * module.
   */
  useFactory?: (...args: any[]) => Promise<ModuleOptions> | ModuleOptions;
  /**
   * Dependencies that a Factory may inject.
   */
  inject?: FactoryProvider['inject'];
  /**
   * Injection token resolving to an existing provider. The provider must implement
   * the corresponding interface.
   */
  useExisting?: Type<
    ConfigurableModuleOptionsFactory<ModuleOptions, FactoryClassMethodKey>
  >;
}
```

Endi yuqoridagi xossalarni birma-bir ko'rib chiqamiz:

- `useFactory` - konfiguratsiya obyektini qaytaradigan funksiya. U sinxron yoki asinxron bo'lishi mumkin. Factory funksiyasiga bog'liqliklarni in'eksiya qilish uchun `inject` xossasidan foydalaning. Yuqoridagi misolda biz shu variantni ishlatdik.
- `inject` - factory funksiyasiga in'eksiya qilinadigan bog'liqliklar massivi. Bog'liqliklar tartibi factory funksiyasidagi parametrlar tartibiga mos bo'lishi kerak.
- `useClass` - provayder sifatida instansiyalanadigan sinf. Sinf mos interfeysni amalga oshirishi kerak. Odatda bu konfiguratsiya obyektini qaytaradigan `create()` metodini taqdim etadigan sinf. Buning haqida quyidagi [Custom method key](/docs/fundamentals/dynamic-modules#custom-method-key) bo'limida batafsil o'qing.
- `useExisting` - `useClass` ning varianti bo'lib, Nestga yangi instansiya yaratishni buyurish o'rniga, mavjud provayderdan foydalanishga imkon beradi. Modulda allaqachon ro'yxatdan o'tgan provayderdan foydalanishni xohlaganingizda foydali. E'tiborda tuting, sinf `useClass` da ishlatilgan interfeys bilan bir xil interfeysni amalga oshirishi kerak (shuning uchun u `create()` metodini taqdim etishi shart, agar siz default metod nomini o'zgartirmagan bo'lsangiz; qarang [Custom method key](/docs/fundamentals/dynamic-modules#custom-method-key) bo'limi).

Yuqoridagi variantlardan birini (`useFactory`, `useClass` yoki `useExisting`) har doim tanlang, chunki ular o'zaro mos kelmaydi.

Oxirida, `ConfigService` sinfini hozirgacha ishlatgan `'CONFIG_OPTIONS'` o'rniga generatsiya qilingan modul opsiyalari provayderini in'eksiya qilishga yangilaymiz.

```typescript
@Injectable()
export class ConfigService {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions) { ... }
}
```

#### Maxsus metod kaliti

`ConfigurableModuleClass` default holatda `register` va uning muqobili `registerAsync` metodlarini taqdim etadi. Boshqa metod nomidan foydalanish uchun `ConfigurableModuleBuilder#setClassMethodName` metodini quyidagicha ishlating:

```typescript
@@filename(config.module-definition)
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setClassMethodName('forRoot').build();
@@switch
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder().setClassMethodName('forRoot').build();
```

Bu konstruktsiya `ConfigurableModuleBuilder` ga endi `register` va `registerAsync` o'rniga `forRoot` va `forRootAsync` ni taqdim etadigan sinfni generatsiya qilishni buyuradi. Misol:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ folder: './config' }), // <-- note the use of "forRoot" instead of "register"
    // or alternatively:
    // ConfigModule.forRootAsync({
    //   useFactory: () => {
    //     return {
    //       folder: './config',
    //     }
    //   },
    //   inject: [...any extra dependencies...]
    // }),
  ],
})
export class AppModule {}
```

#### Maxsus options factory sinfi

`registerAsync` metodi (yoki konfiguratsiyaga qarab `forRootAsync` yoki boshqa nom) consumerga modul konfiguratsiyasiga yechiladigan provayder ta'rifini uzatishga imkon beradi, shuning uchun kutubxona iste'molchisi konfiguratsiya obyektini tuzish uchun sinf berishi mumkin.

```typescript
@Module({
  imports: [
    ConfigModule.registerAsync({
      useClass: ConfigModuleOptionsFactory,
    }),
  ],
})
export class AppModule {}
```

Default holatda bu sinf modul konfiguratsiya obyektini qaytaradigan `create()` metodini taqdim etishi kerak. Biroq, agar kutubxonangiz boshqa nomlash an'anasiga amal qilsa, siz bu xatti-harakatni o'zgartirib, `ConfigurableModuleBuilder` ga boshqa metodni kutishini aytishingiz mumkin, masalan `createConfigOptions`, `ConfigurableModuleBuilder#setFactoryMethodName` metodidan foydalanib:

```typescript
@@filename(config.module-definition)
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>().setFactoryMethodName('createConfigOptions').build();
@@switch
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder().setFactoryMethodName('createConfigOptions').build();
```

Endi `ConfigModuleOptionsFactory` sinfi `create` o'rniga `createConfigOptions` metodini taqdim etishi shart:

```typescript
@Module({
  imports: [
    ConfigModule.registerAsync({
      useClass: ConfigModuleOptionsFactory, // <-- this class must provide the "createConfigOptions" method
    }),
  ],
})
export class AppModule {}
```

#### Qo'shimcha opsiyalar

Ba'zi chekka holatlarda modulingiz o'zini qanday tutishini belgilovchi qo'shimcha opsiyalarni qabul qilishi kerak bo'lishi mumkin (bunday opsiyaga yaxshi misol `isGlobal` bayrog'i - yoki shunchaki `global`) va shu bilan birga, ular `MODULE_OPTIONS_TOKEN` provayderiga kiritilmasligi kerak bo'ladi (chunki ular modul ichida ro'yxatdan o'tgan servis/provayderlar uchun ahamiyatsiz, masalan `ConfigService` host modul global ekanini bilishi shart emas).

Bunday holatlarda `ConfigurableModuleBuilder#setExtras` metodidan foydalanish mumkin. Quyidagi misolga qarang:

```typescript
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<ConfigModuleOptions>()
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .build();
```

Yuqoridagi misolda `setExtras` metodiga uzatilgan birinchi argument "extra" xossalar uchun default qiymatlarni o'z ichiga olgan obyekt. Ikkinchi argument - auto-generated modul definitsiyasini (`provider`, `exports` va boshqalar bilan) va `extras` obyektini qabul qiladigan funksiya; `extras` qo'shimcha xossalarni (consumer tomonidan berilgan yoki default) ifodalaydi. Funksiyaning qaytgan qiymati - o'zgartirilgan modul definitsiyasi. Bu aniq misolda biz `extras.isGlobal` xossasini modul definitsiyasining `global` xossasiga biriktiryapmiz (bu esa modul global yoki yo'qligini belgilaydi, batafsil [bu yerda](/docs/core/modules#dynamic-modules)).

Endi bu modulni iste'mol qilganda qo'shimcha `isGlobal` bayrog'ini quyidagicha uzatish mumkin:

```typescript
@Module({
  imports: [
    ConfigModule.register({
      isGlobal: true,
      folder: './config',
    }),
  ],
})
export class AppModule {}
```

Biroq, `isGlobal` "extra" xossa sifatida e'lon qilinganligi uchun, u `MODULE_OPTIONS_TOKEN` provayderida mavjud bo'lmaydi:

```typescript
@Injectable()
export class ConfigService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: ConfigModuleOptions,
  ) {
    // "options" object will not have the "isGlobal" property
    // ...
  }
}
```

#### Auto-generated metodlarni kengaytirish

Auto-generated static metodlar (`register`, `registerAsync` va hokazo) kerak bo'lsa quyidagicha kengaytirilishi mumkin:

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} from './config.module-definition';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      // your custom logic here
      ...super.register(options),
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      // your custom logic here
      ...super.registerAsync(options),
    };
  }
}
```

Quyida ko'rsatilganidek, modul definitsiya faylidan `OPTIONS_TYPE` va `ASYNC_OPTIONS_TYPE` tiplari eksport qilinishi shart:

```typescript
export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ConfigModuleOptions>().build();
```
