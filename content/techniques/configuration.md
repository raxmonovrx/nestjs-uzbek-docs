---
title: "Konfiguratsiya"
navTitle: "Konfiguratsiya"
description: "Ilovalar ko'pincha turli environmentlarda ishlaydi. Environmentga qarab turli konfiguratsiya sozlamalari ishlatilishi kerak. Masalan, odatda local environment faqat local DB instan"
order: 3
group: techniques
groupTitle: "Techniques"
---
Ilovalar ko'pincha turli **environment**larda ishlaydi. Environmentga qarab turli konfiguratsiya sozlamalari ishlatilishi kerak. Masalan, odatda local environment faqat local DB instansiyasi uchun yaroqli bo'lgan maxsus ma'lumotlar bazasi kredensiallariga tayanadi. Production environment esa alohida DB kredensiallar to'plamidan foydalanadi. Konfiguratsiya o'zgaruvchilari o'zgarib turishi sababli, eng yaxshi amaliyot - konfiguratsiya o'zgaruvchilarini environmentda saqlash.

Tashqi aniqlangan environment o'zgaruvchilari Node.js ichida `process.env` globali orqali ko'rinadi. Bir nechta environment muammosini har bir environmentda environment o'zgaruvchilarini alohida o'rnatish orqali hal qilishga urinib ko'rishimiz mumkin. Bu tezda boshqarib bo'lmas holga keladi, ayniqsa development va testing environmentlarida bu qiymatlarni oson mock qilish va/yoki o'zgartirish kerak bo'lganda.

Node.js ilovalarida `.env` fayllaridan foydalanish odatiy bo'lib, bunda har bir key muayyan qiymatni ifodalovchi key-value juftliklari saqlanadi va har bir environmentni ifodalaydi. Turli environmentlarda ilovani ishga tushirish shunchaki to'g'ri `.env` faylini almashtirishdan iborat bo'ladi.

Nestda bu texnikadan foydalanish uchun yaxshi yondashuv - mos `.env` faylini yuklaydigan `ConfigService` ni taqdim etuvchi `ConfigModule` yaratish. Bunday modulni o'zingiz yozishni tanlashingiz mumkin, ammo qulaylik uchun Nest tayyor holda `@nestjs/config` paketini taqdim etadi. Ushbu bobda aynan shu paketni ko'rib chiqamiz.

#### O'rnatish

Ishlatishni boshlash uchun avval kerakli bog'liqlikni o'rnating.

```bash
$ npm i --save @nestjs/config
```

> info **Hint** `@nestjs/config` paketi ichkarida dotenv dan foydalanadi.

> warning **Note** `@nestjs/config` TypeScript 4.1 yoki undan yuqorini talab qiladi.

#### Boshlash

O'rnatish jarayoni tugagach, `ConfigModule` ni import qilamiz. Odatda uni root `AppModule` ga import qilib, `.forRoot()` statik metodi bilan xatti-harakatini boshqaramiz. Ushbu bosqichda environment o'zgaruvchilarining key/value juftliklari parse qilinadi va yechiladi. Keyinroq `ConfigModule` ning `ConfigService` sinfiga boshqa feature modullardan qanday kirishni bir nechta usulda ko'ramiz.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}
```

Yuqoridagi kod default joylashuvdan (project root katalogi) `.env` faylini yuklaydi va parse qiladi, `.env` faylidagi key/value juftliklarini `process.env` ga berilgan environment o'zgaruvchilari bilan birlashtiradi va natijani `ConfigService` orqali kirish mumkin bo'lgan xususiy tuzilmada saqlaydi. `forRoot()` metodi `ConfigService` provayderini ro'yxatdan o'tkazadi; u ushbu parse qilingan/birlashtirilgan konfiguratsiya o'zgaruvchilarini o'qish uchun `get()` metodini taqdim etadi. `@nestjs/config` dotenv ga tayanadiganligi sababli, environment o'zgaruvchi nomlaridagi ziddiyatlarni hal qilishda o'sha paket qoidalaridan foydalanadi. Agar key runtime environmentda environment o'zgaruvchisi sifatida (masalan, OS shell exportlari orqali `export DATABASE_USER=test`) ham, `.env` faylida ham mavjud bo'lsa, runtime environmentdagi o'zgaruvchi ustunlik qiladi.

Namunaviy `.env` fayli quyidagicha ko'rinadi:

```json
DATABASE_USER=test
DATABASE_PASSWORD=test
```

Agar ayrim env o'zgaruvchilar `ConfigModule` yuklanishidan va Nest ilovasi bootstrapping qilinishidan oldin ham mavjud bo'lishi kerak bo'lsa (masalan, `NestFactory#createMicroservice` metodiga mikroservis konfiguratsiyasini uzatish uchun), Nest CLI ning `--env-file` opsiyasidan foydalanishingiz mumkin. Bu opsiya ilova ishga tushishidan oldin yuklanishi kerak bo'lgan `.env` fayl pathini ko'rsatish imkonini beradi. `--env-file` flag qo'llab-quvvatlashi Node v20 da joriy etilgan, batafsil ma'lumot uchun hujjatlarga qarang.

```bash
$ nest start --env-file .env
```

#### Maxsus env fayl pathi

Standart holatda paket ilovaning root katalogida `.env` faylini qidiradi. `.env` fayli uchun boshqa path ko'rsatish uchun `forRoot()` ga uzatiladigan (ixtiyoriy) opsiyalar obyektidagi `envFilePath` xossasini sozlang, quyidagicha:

```typescript
ConfigModule.forRoot({
  envFilePath: '.development.env',
});
```

`.env` fayllari uchun bir nechta pathni quyidagicha ko'rsatishingiz mumkin:

```typescript
ConfigModule.forRoot({
  envFilePath: ['.env.development.local', '.env.development'],
});
```

Agar o'zgaruvchi bir nechta faylda topilsa, birinchisi ustunlik qiladi.

#### Env o'zgaruvchilarini yuklashni o'chirish

Agar `.env` faylini yuklamoqchi bo'lmasangiz, balki runtime environmentdan (masalan, OS shell exportlari `export DATABASE_USER=test`) environment o'zgaruvchilariga kirishni xohlasangiz, opsiyalar obyektidagi `ignoreEnvFile` xossasini `true` qilib qo'ying, quyidagicha:

```typescript
ConfigModule.forRoot({
  ignoreEnvFile: true,
});
```

#### Modulni global ishlatish

`ConfigModule` ni boshqa modullarda ishlatmoqchi bo'lsangiz, uni import qilishingiz kerak (istalgan Nest modulida bo'lgani kabi). Muqobil ravishda, opsiyalar obyektidagi `isGlobal` xossasini `true` qilib, uni [global modul](/docs/core/modules#global-modullar) sifatida e'lon qilishingiz mumkin. Bunda `ConfigModule` root modulda (masalan, `AppModule`) yuklangach, boshqa modullarda uni import qilishingiz shart bo'lmaydi.

```typescript
ConfigModule.forRoot({
  isGlobal: true,
});
```

#### Maxsus konfiguratsiya fayllari

Murakkabroq loyihalar uchun nested konfiguratsiya obyektlarini qaytaradigan maxsus konfiguratsiya fayllaridan foydalanishingiz mumkin. Bu bog'liq konfiguratsiya sozlamalarini funksiyaga ko'ra guruhlash imkonini beradi (masalan, DBga oid sozlamalar), hamda bog'liq sozlamalarni alohida fayllarda saqlab, ularni mustaqil boshqarishni osonlashtiradi.

Maxsus konfiguratsiya fayli konfiguratsiya obyektini qaytaradigan factory funksiyani eksport qiladi. Konfiguratsiya obyekti istalgan darajada nested bo'lgan oddiy JavaScript obyekt bo'lishi mumkin. `process.env` obyekti to'liq yechilgan environment variable key/value juftliklarini o'z ichiga oladi (`.env` fayli va tashqi aniqlangan o'zgaruvchilar yuqorida ta'riflanganidek yechilib va birlashtiriladi). Qaytariladigan konfiguratsiya obyektini siz nazorat qilganingiz sababli, qiymatlarni mos tipga cast qilish, default qiymatlar berish va hokazo kabi kerakli mantiqni qo'shishingiz mumkin. Masalan:

```typescript
@@filename(config/configuration)
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432
  }
});
```

Bu faylni `ConfigModule.forRoot()` metodiga uzatadigan opsiyalar obyektidagi `load` xossasi orqali yuklaymiz:

```typescript
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
})
export class AppModule {}
```

> info **Notice** `load` xossasiga berilgan qiymat massivdir, bu bir nechta konfiguratsiya faylini yuklash imkonini beradi (masalan, `load: [databaseConfig, authConfig]`)

Maxsus konfiguratsiya fayllari bilan YAML fayllarini ham boshqarishingiz mumkin. Quyida YAML formatidagi konfiguratsiya misoli:

```yaml
http:
  host: 'localhost'
  port: 8080

db:
  postgres:
    url: 'localhost'
    port: 5432
    database: 'yaml-db'

  sqlite:
    database: 'sqlite.db'
```

YAML fayllarini o'qish va parse qilish uchun `js-yaml` paketidan foydalanamiz.

```bash
$ npm i js-yaml
$ npm i -D @types/js-yaml
```

Paket o'rnatilgach, yuqorida yaratgan YAML faylini yuklash uchun `yaml#load` funksiyasidan foydalanamiz.

```typescript
@@filename(config/configuration)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';

const YAML_CONFIG_FILENAME = 'config.yaml';

export default () => {
  return yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
};
```

> warning **Note** Nest CLI build jarayonida "assets" (TS bo'lmagan fayllar)ni avtomatik ravishda `dist` papkasiga ko'chirmaydi. YAML fayllaringiz ko'chirilishini ta'minlash uchun `nest-cli.json` faylida `compilerOptions#assets` obyektida buni ko'rsatishingiz kerak. Masalan, agar `config` papkasi `src` papkasi bilan bir xil darajada bo'lsa, `compilerOptions#assets` ga "assets": [{{ '{' }}"include": "../config/*.yaml", "outDir": "./dist/config"{{ '}' }}] qiymatini qo'shing. Batafsil bu yerda.

Qisqa eslatma: konfiguratsiya fayllari avtomatik validatsiya qilinmaydi, hatto NestJS `ConfigModule`ida `validationSchema` opsiyasidan foydalansangiz ham. Agar validatsiya kerak bo'lsa yoki transformatsiyalarni qo'llamoqchi bo'lsangiz, buni konfiguratsiya obyektini to'liq nazorat qiladigan factory funksiya ichida bajarishingiz kerak. Bu kerakli custom validatsiya mantiqini amalga oshirishga imkon beradi.

Masalan, port ma'lum bir diapazonda ekanini ta'minlash uchun factory funksiyasiga validatsiya qadamini qo'shishingiz mumkin:

```typescript
@@filename(config/configuration)
export default () => {
  const config = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;

  if (config.http.port < 1024 || config.http.port > 49151) {
    throw new Error('HTTP port must be between 1024 and 49151');
  }

  return config;
};
```

Endi port ko'rsatilgan diapazondan tashqarida bo'lsa, ilova ishga tushishda xato tashlaydi.

#### `ConfigService`dan foydalanish

`ConfigService` dan konfiguratsiya qiymatlarini olish uchun avvalo `ConfigService` ni in'eksiya qilishimiz kerak. Istalgan provayder kabi, uni ishlatadigan modulga o'zini o'z ichiga olgan `ConfigModule` ni import qilishimiz kerak (agar `ConfigModule.forRoot()` ga uzatiladigan opsiyalar obyektida `isGlobal` xossasini `true` qilmagan bo'lsangiz). Uni feature modulga quyidagicha import qiling.

```typescript
@@filename(feature.module)
@Module({
  imports: [ConfigModule],
  // ...
})
```

So'ng uni odatiy konstruktor in'eksiyasi orqali kiriting:

```typescript
constructor(private configService: ConfigService) {}
```

> info **Hint** `ConfigService` `@nestjs/config` paketidan import qilinadi.

Va sinfda undan foydalaning:

```typescript
// get an environment variable
const dbUser = this.configService.get<string>('DATABASE_USER');

// get a custom configuration value
const dbHost = this.configService.get<string>('database.host');
```

Yuqorida ko'rsatilganidek, oddiy environment o'zgaruvchisini olish uchun `configService.get()` metodidan foydalanib o'zgaruvchi nomini uzating. Yuqorida ko'rsatilgandek, TypeScript type hinting uchun tipni uzatishingiz mumkin (masalan, `get<string>(...)`). `get()` metodi nested custom konfiguratsiya obyektini ham ko'ra oladi (<a href="/docs/techniques/configuration#custom-configuration-files">Custom configuration file</a> orqali yaratilgan), bu yuqoridagi ikkinchi misolda ko'rsatilgan.

Siz butun nested custom konfiguratsiya obyektini interfeysni type hint sifatida berib ham olishingiz mumkin:

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
}

const dbConfig = this.configService.get<DatabaseConfig>('database');

// you can now use `dbConfig.port` and `dbConfig.host`
const port = dbConfig.port;
```

`get()` metodi ixtiyoriy ikkinchi argumentni ham qabul qiladi, u default qiymatni belgilaydi va key mavjud bo'lmasa qaytariladi, quyidagicha:

```typescript
// use "localhost" when "database.host" is not defined
const dbHost = this.configService.get<string>('database.host', 'localhost');
```

`ConfigService` ikkita ixtiyoriy generic (tip argumenti)ga ega. Birinchisi mavjud bo'lmagan config xossasiga kirishni oldini olishga yordam beradi. Uni quyidagicha ishlating:

```typescript
interface EnvironmentVariables {
  PORT: number;
  TIMEOUT: string;
}

// somewhere in the code
constructor(private configService: ConfigService<EnvironmentVariables>) {
  const port = this.configService.get('PORT', { infer: true });

  // TypeScript Error: this is invalid as the URL property is not defined in EnvironmentVariables
  const url = this.configService.get('URL', { infer: true });
}
```

`infer` xossasi `true` bo'lsa, `ConfigService#get` metodi interfeys asosida xossa tipini avtomatik aniqlaydi, masalan `PORT` `EnvironmentVariables` interfeysida `number` tipi bo'lgani uchun `typeof port === "number"` (agar TypeScriptning `strictNullChecks` flagidan foydalanmayotgan bo'lsangiz).

Shuningdek, `infer` imkoniyati bilan, dot notation ishlatilganda ham nested custom konfiguratsiya obyektining xossasi tipini aniqlashingiz mumkin, quyidagicha:

```typescript
constructor(private configService: ConfigService<{ database: { host: string } }>) {
  const dbHost = this.configService.get('database.host', { infer: true })!;
  // typeof dbHost === "string"                                          |
  //                                                                     +--> non-null assertion operator
}
```

Ikkinchi generic birinchisiga tayanadi va `strictNullChecks` yoqilganda `ConfigService` metodlari qaytarishi mumkin bo'lgan barcha `undefined` tiplarni olib tashlash uchun type assertion vazifasini bajaradi. Masalan:

```typescript
// ...
constructor(private configService: ConfigService<{ PORT: number }, true>) {
  //                                                               ^^^^
  const port = this.configService.get('PORT', { infer: true });
  //    ^^^ The type of port will be 'number' thus you don't need TS type assertions anymore
}
```

> info **Hint** `ConfigService#get` metodi qiymatlarni faqat custom konfiguratsiya fayllaridan olishini va `process.env` o'zgaruvchilarini e'tiborsiz qoldirishini istasangiz, `ConfigModule` ning `forRoot()` metodiga uzatiladigan opsiyalar obyektida `skipProcessEnv` opsiyasini `true` qilib qo'ying.

#### Konfiguratsiya namespace'lari

`ConfigModule` yuqorida <a href="/docs/techniques/configuration#custom-configuration-files">Custom configuration files</a> bo'limida ko'rsatilganidek, bir nechta maxsus konfiguratsiya fayllarini aniqlash va yuklash imkonini beradi. O'sha bo'limda ko'rsatilgandek nested konfiguratsiya obyektlari bilan murakkab konfiguratsiya ierarxiyalarini boshqarishingiz mumkin. Muqobil ravishda, `registerAs()` funksiyasi bilan "namespaced" konfiguratsiya obyektini qaytarishingiz mumkin, quyidagicha:

```typescript
@@filename(config/database.config)
export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 5432
}));
```

Custom konfiguratsiya fayllarida bo'lgani kabi, `registerAs()` factory funksiyasi ichida `process.env` obyekti to'liq yechilgan environment variable key/value juftliklarini o'z ichiga oladi (`.env` fayli va tashqi aniqlangan o'zgaruvchilar yuqorida ta'riflanganidek yechilib va birlashtiriladi).

> info **Hint** `registerAs` funksiyasi `@nestjs/config` paketidan eksport qilinadi.

Namespaced konfiguratsiyani `forRoot()` metodining opsiyalar obyektidagi `load` xossasi orqali, custom konfiguratsiya faylini yuklagandek, yuklang:

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
  ],
})
export class AppModule {}
```

Endi `database` namespace'dan `host` qiymatini olish uchun dot notationdan foydalaning. `registerAs()` funksiyasiga birinchi argument sifatida berilgan namespace nomiga mos ravishda, xossa nomidan oldin `'database'` prefiksini ishlating:

```typescript
const dbHost = this.configService.get<string>('database.host');
```

Yana bir maqbul variant - `database` namespace'ni bevosita in'eksiya qilish. Bu strong typingdan foydalanish imkonini beradi:

```typescript
constructor(
  @Inject(databaseConfig.KEY)
  private dbConfig: ConfigType<typeof databaseConfig>,
) {}
```

> info **Hint** `ConfigType` `@nestjs/config` paketidan eksport qilinadi.

#### Modullarda namespaced konfiguratsiyalar

Namespaced konfiguratsiyani ilovangizdagi boshqa modul uchun konfiguratsiya obyektiga aylantirish uchun konfiguratsiya obyektining `.asProvider()` metodidan foydalanishingiz mumkin. Bu metod namespaced konfiguratsiyani provayderga aylantiradi va uni ishlatmoqchi bo'lgan modulning `forRootAsync()` (yoki boshqa ekvivalent metodiga) uzatish mumkin.

Misol:

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
  ],
})
```

`.asProvider()` metodi qanday ishlashini tushunish uchun uning qaytadigan qiymatini ko'rib chiqamiz:

```typescript
// Return value of the .asProvider() method
{
  imports: [ConfigModule.forFeature(databaseConfig)],
  useFactory: (configuration: ConfigType<typeof databaseConfig>) => configuration,
  inject: [databaseConfig.KEY]
}
```

Ushbu tuzilma namespaced konfiguratsiyalarni modullarga muammosiz integratsiya qilishga imkon beradi, ilovangizni tartibli va modulli holatda ushlab, boilerplate va takroriy kod yozmasdan.

#### Environment o'zgaruvchilarini keshlash

`process.env` ga kirish sekin bo'lishi mumkinligi sababli, `ConfigService#get` metodi `process.env` dagi o'zgaruvchilar uchun ishlaganda performance oshishi uchun `ConfigModule.forRoot()` ga uzatiladigan opsiyalar obyektida `cache` xossasini `true` qilib qo'yishingiz mumkin.

```typescript
ConfigModule.forRoot({
  cache: true,
});
```

#### Qisman ro'yxatdan o'tkazish

Hozirgacha konfiguratsiya fayllarini root modulimizda (masalan, `AppModule`) `forRoot()` metodi bilan qayta ishladik. Balki sizda murakkabroq loyiha tuzilmasi bor, feature'ga xos konfiguratsiya fayllari bir nechta kataloglarda joylashgan. Bu fayllarning barchasini root modulda yuklash o'rniga, `@nestjs/config` paketi **partial registration** deb ataladigan imkoniyatni taqdim etadi; u har bir feature modulga tegishli konfiguratsiya fayllarinigina referenslaydi. Qisman ro'yxatdan o'tkazishni feature modulda `forFeature()` statik metodi bilan bajaring, quyidagicha:

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
})
export class DatabaseModule {}
```

> info **Warning** Ba'zi holatlarda, qisman ro'yxatdan o'tkazilgan xossalarga konstruktor ichida emas, `onModuleInit()` hook'i orqali kirish talab qilinishi mumkin. Buning sababi `forFeature()` metodi modul inicializatsiyasi vaqtida ishlaydi va modullar inicializatsiyasi tartibi noaniq bo'lishi mumkin. Agar boshqa modul yuklagan qiymatlarga konstruktor ichida kirilsa, konfiguratsiya bog'liq bo'lgan modul hali inicializatsiya bo'lmagan bo'lishi mumkin. `onModuleInit()` metodi faqat bog'liq bo'lgan barcha modullar inicializatsiya bo'lgandan keyin ishlaydi, shuning uchun bu usul xavfsiz.

#### Schema validatsiyasi

Kerakli environment o'zgaruvchilari berilmagan yoki ular muayyan validatsiya qoidalariga mos kelmagan bo'lsa, ilova ishga tushishda istisno tashlash standard amaliyot hisoblanadi. `@nestjs/config` paketi buni ikki xil yo'l bilan qilishga imkon beradi:

- Joi o'rnatilgan validator. Joi bilan siz obyekt sxemasini aniqlab, JavaScript obyektlarini unga nisbatan validatsiya qilasiz.
- Environment o'zgaruvchilarini input sifatida oladigan maxsus `validate()` funksiyasi.

Joi'dan foydalanish uchun Joi paketini o'rnatishimiz kerak:

```bash
$ npm install --save joi
```

Endi Joi validatsiya sxemasini aniqlab, uni `forRoot()` metodining opsiyalar obyektidagi `validationSchema` xossasi orqali uzatamiz, quyida ko'rsatilganidek:

```typescript
@@filename(app.module)
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
    }),
  ],
})
export class AppModule {}
```

Standart holatda sxema kalitlarining barchasi ixtiyoriy deb hisoblanadi. Bu yerda biz `NODE_ENV` va `PORT` uchun default qiymatlarni berdik; agar bu o'zgaruvchilarni environmentda taqdim etmasak (`.env` fayli yoki process environment), shu qiymatlar ishlatiladi. Muqobil ravishda, `required()` validatsiya metodidan foydalanib qiymat environmentda majburiy bo'lishini talab qilishingiz mumkin (`.env` fayli yoki process environment). Bu holatda validatsiya bosqichi o'zgaruvchi berilmagan bo'lsa istisno tashlaydi. Validatsiya sxemalarini qanday qurish bo'yicha batafsil Joi validation methodsga qarang.

Standart holatda noma'lum environment o'zgaruvchilari (kalitlari sxemada mavjud bo'lmaganlari) ruxsat etiladi va validatsiya istisnosini keltirib chiqarmaydi. Standart holatda barcha validatsiya xatolari qayd etiladi. Bu xatti-harakatlarni `forRoot()` opsiyalar obyektidagi `validationOptions` kaliti orqali opsiyalar obyektini uzatib o'zgartirishingiz mumkin. Bu opsiyalar obyektida Joi validation options taqdim etadigan standard validatsiya opsiyalari bo'lishi mumkin. Masalan, yuqoridagi ikki sozlamani teskari qilish uchun quyidagicha opsiyalar uzating:

```typescript
@@filename(app.module)
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}
```

`@nestjs/config` paketining default sozlamalari:

- `allowUnknown`: environment o'zgaruvchilarida noma'lum kalitlarga ruxsat berish-bermasligini boshqaradi. Default `true`
- `abortEarly`: `true` bo'lsa birinchi xatoda validatsiyani to'xtatadi; `false` bo'lsa barcha xatolarni qaytaradi. Default `false`.

E'tibor bering, `validationOptions` obyektini uzatishga qaror qilsangiz, aniq berilmagan har qanday sozlama `Joi`ning standard default qiymatlariga o'rnatiladi (`@nestjs/config` defaultlari emas). Masalan, custom `validationOptions` obyektida `allowUnknown` ko'rsatilmasa, u `Joi` default qiymati `false` bo'ladi. Shu sababli custom obyekt ichida bu ikki sozlamaning **ikkalasini ham** ko'rsatish xavfsizroq bo'ladi.

> info **Hint** Oldindan belgilangan environment o'zgaruvchilarini validatsiya qilishni o'chirish uchun `forRoot()` metodining opsiyalar obyektida `validatePredefined` atributini `false` ga o'rnating. Oldindan belgilangan environment o'zgaruvchilari - modul import qilinishidan oldin o'rnatilgan process o'zgaruvchilari (`process.env` o'zgaruvchilari). Masalan, ilovani `PORT=3000 node main.js` bilan ishga tushirsangiz, `PORT` oldindan belgilangan environment o'zgaruvchisidir.

#### Maxsus validate funksiyasi

Muqobil ravishda, env fayli va processdan olingan environment o'zgaruvchilarini o'z ichiga olgan obyektni qabul qiladigan va zarur bo'lsa ularni konvertatsiya/mutatsiya qiladigan, validatsiyalangan environment o'zgaruvchilarini qaytaradigan **sinxron** `validate` funksiyasini ko'rsatishingiz mumkin. Funksiya xato tashlasa, ilova bootstrapping qilinmaydi.

Bu misolda `class-transformer` va `class-validator` paketlaridan foydalanamiz. Avval quyidagilarni aniqlaymiz:

- validatsiya cheklovlariga ega sinf,
- `plainToInstance` va `validateSync` funksiyalaridan foydalanadigan validate funksiyasi.

```typescript
@@filename(env.validation)
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, Max, Min, validateSync } from 'class-validator';

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
  Provision = "provision",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
```

Shu bilan, `validate` funksiyasini `ConfigModule` konfiguratsiya opsiyasi sifatida ishlating, quyidagicha:

```typescript
@@filename(app.module)
import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
  ],
})
export class AppModule {}
```

#### Maxsus getter funksiyalari

`ConfigService` kalit bo'yicha konfiguratsiya qiymatini olish uchun generik `get()` metodini taqdim etadi. Shuningdek, yanada tabiiy kodlash uslubi uchun `getter` funksiyalarini ham qo'shishimiz mumkin:

```typescript
@@filename()
@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isAuthEnabled(): boolean {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}
@@switch
@Dependencies(ConfigService)
@Injectable()
export class ApiConfigService {
  constructor(configService) {
    this.configService = configService;
  }

  get isAuthEnabled() {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}
```

Endi getter funksiyasidan quyidagicha foydalanishimiz mumkin:

```typescript
@@filename(app.service)
@Injectable()
export class AppService {
  constructor(apiConfigService: ApiConfigService) {
    if (apiConfigService.isAuthEnabled) {
      // Authentication is enabled
    }
  }
}
@@switch
@Dependencies(ApiConfigService)
@Injectable()
export class AppService {
  constructor(apiConfigService) {
    if (apiConfigService.isAuthEnabled) {
      // Authentication is enabled
    }
  }
}
```

#### Environment o'zgaruvchilari yuklangan hook

Agar modul konfiguratsiyasi environment o'zgaruvchilariga bog'liq bo'lsa va bu o'zgaruvchilar `.env` faylidan yuklansa, `process.env` obyektiga murojaat qilishdan oldin fayl yuklanganini ta'minlash uchun `ConfigModule.envVariablesLoaded` hook'idan foydalanishingiz mumkin, quyidagi misolga qarang:

```typescript
export async function getStorageModule() {
  await ConfigModule.envVariablesLoaded;
  return process.env.STORAGE === 'S3' ? S3StorageModule : DefaultStorageModule;
}
```

Bu konstruktsiya `ConfigModule.envVariablesLoaded` Promise resolve bo'lgach, barcha konfiguratsiya o'zgaruvchilari yuklanganini kafolatlaydi.

#### Shartli modul konfiguratsiyasi

Ba'zan modulni shartli tarzda yuklash va shartni env o'zgaruvchisida ko'rsatish kerak bo'ladi. Yaxshiyamki, `@nestjs/config` buni qilish uchun `ConditionalModule` ni taqdim etadi.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(FooModule, 'USE_FOO'),
  ],
})
export class AppModule {}
```

Yuqoridagi modul `.env` faylida `USE_FOO` env o'zgaruvchisi uchun `false` qiymati bo'lmasa, `FooModule` ni yuklaydi. Siz o'zingizning shart funksiyangizni ham uzatishingiz mumkin; bu funksiya `process.env` havolasini qabul qiladi va `ConditionalModule` ishlatishi uchun boolean qaytarishi kerak:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    ConditionalModule.registerWhen(
      FooBarModule,
      (env: NodeJS.ProcessEnv) => !!env['foo'] && !!env['bar'],
    ),
  ],
})
export class AppModule {}
```

`ConditionalModule` dan foydalanganda `ConfigModule` ham ilovada yuklanganiga ishonch hosil qilish muhim, shunda `ConfigModule.envVariablesLoaded` hook'i to'g'ri referenslanadi va ishlatiladi. Agar hook 5 soniya ichida true bo'lib o'zgarmasa yoki `registerWhen` metodining uchinchi opsiya parametrida foydalanuvchi tomonidan millisekundlarda belgilangan timeout tugasa, `ConditionalModule` xato tashlaydi va Nest ilovani ishga tushirishni bekor qiladi.

#### Kengaytiriladigan o'zgaruvchilar

`@nestjs/config` paketi environment o'zgaruvchilarini kengaytirishni qo'llab-quvvatlaydi. Bu texnika yordamida nested environment o'zgaruvchilarini yaratishingiz mumkin, bunda bitta o'zgaruvchi boshqasining ta'rifida ishlatiladi. Masalan:

```json
APP_URL=mywebsite.com
SUPPORT_EMAIL=support@${APP_URL}
```

Ushbu konstruktsiyada `SUPPORT_EMAIL` o'zgaruvchisi `'support@mywebsite.com'` ga yechiladi. `${{ '{' }}...{{ '}' }}` sintaksisidan foydalanib `SUPPORT_EMAIL` ta'rifida `APP_URL` qiymatini yechish yoqilganiga e'tibor bering.

> info **Hint** Bu imkoniyat uchun `@nestjs/config` paketi ichkarida dotenv-expand dan foydalanadi.

Environment o'zgaruvchilarini kengaytirishni `ConfigModule` ning `forRoot()` metodiga uzatiladigan opsiyalar obyektida `expandVariables` xossasi orqali yoqing, quyida ko'rsatilgandek:

```typescript
@@filename(app.module)
@Module({
  imports: [
    ConfigModule.forRoot({
      // ...
      expandVariables: true,
    }),
  ],
})
export class AppModule {}
```

#### `main.ts` ichida foydalanish

Konfiguratsiyamiz servis ichida saqlansa ham, uni `main.ts` faylida ishlatish mumkin. Shu tarzda ilova porti yoki CORS host kabi o'zgaruvchilarni saqlashda foydalanishingiz mumkin.

Unga kirish uchun `app.get()` metodidan, so'ng servis havolasidan foydalanishingiz kerak:

```typescript
const configService = app.get(ConfigService);
```

So'ng `get` metodini konfiguratsiya kaliti bilan chaqirib, odatdagidek foydalanishingiz mumkin:

```typescript
const port = configService.get('PORT');
```
