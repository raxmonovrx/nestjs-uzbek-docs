---
title: "Logger"
navTitle: "Logger"
description: "Nest ilovani ishga tushirish (bootstrapping) jarayonida va boshqa bir qancha holatlarda, masalan, ushlangan istisnolarni ko'rsatishda (ya'ni, tizim loglari) ishlatiladigan ichki ma"
order: 8
group: techniques
groupTitle: "Techniques"
---
Nest ilovani ishga tushirish (bootstrapping) jarayonida va boshqa bir qancha holatlarda, masalan, ushlangan istisnolarni ko'rsatishda (ya'ni, tizim loglari) ishlatiladigan ichki matnli logger bilan keladi. Bu funksionallik `@nestjs/common` paketidagi `Logger` klassi orqali taqdim etiladi. Siz loglash tizimining xatti-harakatini to'liq boshqarishingiz mumkin, jumladan quyidagilarni:

- loglashni butunlay o'chirish
- loglar tafsilot darajasini belgilash (masalan, xatolar, ogohlantirishlar, debug ma'lumotlari va h.k.)
- log xabarlarini formatlashni sozlash (raw, json, rangli va h.k.)
- default loggerdagi vaqt belgisini almashtirish (masalan, sana formati sifatida ISO8601 standartidan foydalanish)
- default loggerni to'liq almashtirish
- default loggerni undan meros olib moslashtirish
- ilovani komponovka qilish va test qilishni soddalashtirish uchun dependency injectiondan foydalanish

Shuningdek, ichki loggerdan foydalanib yoki o'zingizning custom implementatsiyangizni yaratib, ilova darajasidagi hodisalar va xabarlarni loglashingiz mumkin.

Agar ilovangizga tashqi loglash tizimlari bilan integratsiya, faylga avtomatik loglash, yoki loglarni markaziy loglash xizmatiga yuborish kerak bo'lsa, Node.js loglash kutubxonasi orqali to'liq custom yechimni implementatsiya qilishingiz mumkin. Mashhur tanlovlardan biri - yuqori unumdorligi va moslashuvchanligi bilan tanilgan Pino.

#### Asosiy sozlash

Loglashni o'chirish uchun `NestFactory.create()` metodiga ikkinchi argument sifatida uzatiladigan (ixtiyoriy) Nest ilova opsiyalari obyektida `logger` xossasini `false` qilib qo'ying.

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);
```

Muayyan log darajalarini yoqish uchun `logger` xossasini ko'rsatiladigan darajalarni belgilovchi stringlar massivi sifatida bering:

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);
```

Massivdagi qiymatlar `'log'`, `'fatal'`, `'error'`, `'warn'`, `'debug'`, va `'verbose'` kombinatsiyalaridan iborat bo'lishi mumkin.

Rangli chiqishni o'chirish uchun `logger` xossasining qiymati sifatida `colors` xossasi `false` bo'lgan `ConsoleLogger` obyektini bering.

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    colors: false,
  }),
});
```

Har bir log xabari uchun prefiks sozlash uchun `prefix` atributi berilgan `ConsoleLogger` obyektini uzating:

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    prefix: 'MyApp', // Default is "Nest"
  }),
});
```

Quyidagi jadvalda barcha mavjud opsiyalar keltirilgan:

| Parametr          | Tavsif                                                                                                                                                                                                                                                                                                                                              | Standart                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `logLevels`       | Yoqilgan log darajalari.                                                                                                                                                                                                                                                                                                                             | `['log', 'fatal', 'error', 'warn', 'debug', 'verbose']` |
| `timestamp`       | Yoqilgan bo'lsa, joriy va oldingi log xabari orasidagi vaqt tamg'asini (vaqt farqini) chiqaradi. Eslatma: `json` yoqilganda bu parametr ishlatilmaydi.                                                                                                                                                                                             | `false`                                        |
| `prefix`          | Har bir log xabari uchun prefiks. Eslatma: `json` yoqilganda bu parametr ishlatilmaydi.                                                                                                                                                                                                                                                              | `Nest`                                         |
| `json`            | Yoqilgan bo'lsa, log xabarini JSON formatida chiqaradi.                                                                                                                                                                                                                                                                                              | `false`                                        |
| `colors`          | Yoqilgan bo'lsa, log xabarini rangli qilib chiqaradi. `json` o'chirilgan bo'lsa default `true`, aks holda `false`.                                                                                                                                                                                                                                    | `true`                                         |
| `context`         | Logger konteksti.                                                                                                                                                                                                                                                                                                                                    | `undefined`                                    |
| `compact`         | Yoqilgan bo'lsa, ko'p xossali obyekt bo'lsa ham log xabarini bitta qatorda chiqaradi. Agar son berilsa, barcha xossalar `breakLength` ga sig'gan taqdirda eng ichki n ta element bitta qatorga birlashtiriladi. Qisqa massiv elementlari ham guruhlanadi.                                                                                             | `true`                                         |
| `maxArrayLength`  | Formatlashda kiritiladigan Array, TypedArray, Map, Set, WeakMap va WeakSet elementlarining maksimal sonini belgilaydi. Barcha elementlarni ko'rsatish uchun null yoki Infinity qiling. Hech qanday element ko'rsatmaslik uchun 0 yoki manfiy qiymat bering. `json` yoqilganda, ranglar o'chirilganda va `compact` true bo'lsa e'tibordan chetda qoladi, chunki u pars qilinadigan JSON chiqishini beradi. | `100`                                          |
| `maxStringLength` | Formatlashda kiritiladigan belgilar sonining maksimal qiymatini belgilaydi. Barcha elementlarni ko'rsatish uchun null yoki Infinity qiling. Hech qanday belgi ko'rsatmaslik uchun 0 yoki manfiy qiymat bering. `json` yoqilganda, ranglar o'chirilganda va `compact` true bo'lsa e'tibordan chetda qoladi, chunki u pars qilinadigan JSON chiqishini beradi.                                                                 | `10000`                                        |
| `sorted`          | Yoqilgan bo'lsa, obyektlarni formatlashda kalitlarni saralaydi. Custom saralash funksiyasi ham bo'lishi mumkin. `json` yoqilganda, ranglar o'chirilganda va `compact` true bo'lsa e'tibordan chetda qoladi, chunki u pars qilinadigan JSON chiqishini beradi.                                                                                          | `false`                                        |
| `depth`           | Obyektni formatlashda rekursiya chuqurligini belgilaydi. Bu yirik obyektlarni ko'rish uchun foydali. Maksimal call stackgacha rekursiya qilish uchun Infinity yoki null bering. `json` yoqilganda, ranglar o'chirilganda va `compact` true bo'lsa e'tibordan chetda qoladi, chunki u pars qilinadigan JSON chiqishini beradi.                                                                                 | `5`                                            |
| `showHidden`      | `true` bo'lsa, obyektning enumeratsiya qilinmaydigan belgilar va xossalari formatlangan natijaga kiritiladi. WeakMap va WeakSet yozuvlari, shuningdek, foydalanuvchi tomonidan aniqlangan prototip xossalari ham kiritiladi                                                                                                                          | `false`                                        |
| `breakLength`     | Kirish qiymatlari bir nechta qatorga bo'linadigan uzunlik. `compact` true bo'lganda ("compact" bilan birga) kirishni bitta qatorda formatlash uchun Infinity qiling. `compact` true bo'lsa default Infinity, aks holda 80. `json` yoqilganda, ranglar o'chirilganda va `compact` true bo'lsa e'tibordan chetda qoladi, chunki u pars qilinadigan JSON chiqishini beradi. | `Infinity`                                     |

#### JSON loglash

JSON loglash zamonaviy ilovalarning kuzatuvchanligi va loglarni boshqarish tizimlari bilan integratsiyasi uchun muhim. NestJS ilovangizda JSON loglashni yoqish uchun `ConsoleLogger` obyektining `json` xossasini `true` qilib sozlang. So'ng, ilova instansiyasini yaratishda `logger` xossasi qiymati sifatida shu logger konfiguratsiyasini bering.

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: true,
  }),
});
```

Bu konfiguratsiya loglarni tuzilgan JSON formatida chiqaradi, bu esa log agregatorlari va bulut platformalari kabi tashqi tizimlar bilan integratsiyani osonlashtiradi. Masalan, **AWS ECS** (Elastic Container Service) kabi platformalar JSON loglarni native qo'llab-quvvatlaydi va quyidagi kabi imkoniyatlarni beradi:

- **Log filtrlash**: log darajasi, vaqt belgisi yoki custom metadata kabi maydonlar bo'yicha loglarni tezda qisqartirish.
- **Qidirish va tahlil**: ilova xatti-harakatidagi trendlarni tahlil qilish va kuzatish uchun so'rov vositalaridan foydalanish.

> info **Note** `json` `true` qilib o'rnatilganda, `ConsoleLogger` `colors` xossasini `false` qilib, matn ranglarini avtomatik o'chiradi. Bu chiqishning formatlash artefaktlarisiz toza JSON bo'lishini ta'minlaydi. Biroq, ishlab chiqish maqsadlari uchun siz bu xatti-harakatni `colors` ni `true` qilib, aniq belgilab, bekor qilishingiz mumkin. Bu rangli JSON loglarini qo'shadi, va ular lokal debugging paytida o'qilishi osonroq bo'ladi.

JSON loglash yoqilganda, log chiqishi quyidagicha ko'rinadi (bitta qatorda):

```json
{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}
```

Turli variantlarni ushbu Pull Request da ko'rishingiz mumkin.

#### Ilova loglashi uchun loggerdan foydalanish

Yuqoridagi bir nechta usullarni birlashtirib, Nest tizim loglashi hamda o'z ilova hodisalarimiz/xabarlarimiz uchun izchil xatti-harakat va formatlashni ta'minlay olamiz.

Yaxshi amaliyot - har bir servisimizda `@nestjs/common` dan `Logger` klassini instansiyalash. `Logger` konstruktori uchun `context` argumenti sifatida servis nomini berishimiz mumkin, masalan:

```typescript
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('Doing something...');
  }
}
```

Default logger implementatsiyasida `context` kvadrat qavslar ichida chiqariladi, masalan quyidagi `NestFactory` kabi:

```bash
[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...
```

Agar `app.useLogger()` orqali custom logger bersak, u Nest tomonidan ichkarida ishlatiladi. Bu shuni anglatadiki, kodimiz implementatsiyadan mustaqil bo'lib qoladi va `app.useLogger()` ni chaqirib default loggerni custom logger bilan oson almashtira olamiz.

Shu tarzda, oldingi bo'limdagi qadamlarni bajarib `app.useLogger(app.get(MyLogger))` ni chaqirsak, `MyService` ichida `this.logger.log()` ga bo'lgan chaqiruvlar `MyLogger` instansiyasining `log` metodiga yo'naltiriladi.

Bu ko'pgina holatlar uchun yetarli bo'ladi. Biroq ko'proq sozlash kerak bo'lsa (masalan, custom metodlar qo'shish va chaqirish), keyingi bo'limga o'ting.

#### Vaqt tamg'ali loglar

Har bir log xabari uchun vaqt tamg'asi loglashni yoqish uchun logger instansiyasini yaratishda ixtiyoriy `timestamp: true` sozlamasidan foydalanishingiz mumkin.

```typescript
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name, { timestamp: true });

  doSomething() {
    this.logger.log('Doing something with timestamp here ->');
  }
}
```

Bu quyidagi formatdagi chiqishni beradi:

```bash
[Nest] 19096   - 04/19/2024, 7:12:59 AM   [MyService] Doing something with timestamp here +5ms
```

Qator oxiridagi `+5ms` ga e'tibor bering. Har bir log bayonoti uchun oldingi xabar bilan vaqt farqi hisoblanadi va qator oxirida ko'rsatiladi.

#### Custom implementatsiya

Nest tomonidan tizim loglashi uchun ishlatiladigan custom logger implementatsiyasini `logger` xossasi qiymatini `LoggerService` interfeysini bajaradigan obyekt qilib berish orqali taqdim etishingiz mumkin. Masalan, Nestga ichki global JavaScript `console` obyektidan (u `LoggerService` interfeysini amalga oshiradi) foydalanishni quyidagicha ayta olasiz:

```typescript
const app = await NestFactory.create(AppModule, {
  logger: console,
});
await app.listen(process.env.PORT ?? 3000);
```

O'zingizning custom loggeringizni implementatsiya qilish oson. Quyida ko'rsatilgandek, `LoggerService` interfeysining har bir metodini implementatsiya qiling.

```typescript
import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class MyLogger implements LoggerService {
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {}

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]) {}
}
```

So'ng `logger` xossasi orqali Nest ilova opsiyalari obyektiga `MyLogger` instansiyasini uzatishingiz mumkin.

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new MyLogger(),
});
await app.listen(process.env.PORT ?? 3000);
```

Bu texnika sodda bo'lsa-da, `MyLogger` klassi uchun dependency injectiondan foydalanmaydi. Bu, ayniqsa testlashda, muayyan qiyinchiliklar tug'dirishi va `MyLogger` ni qayta ishlatishni cheklashi mumkin. Yaxshiroq yechim uchun quyidagi <a href="/docs/techniques/logger#dependency-injection">Dependency Injection</a> bo'limiga qarang.

#### Ichki loggerni kengaytirish

Loggerni boshidan yozish o'rniga, ichki `ConsoleLogger` klassini kengaytirib va default implementatsiyaning ayrim xatti-harakatlarini qayta belgilab, ehtiyojlaringizni qondira olishingiz mumkin.

```typescript
import { ConsoleLogger } from '@nestjs/common';

export class MyLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(...arguments);
  }
}
```

Bunday kengaytirilgan loggerdan feature modullarida quyidagi <a href="/docs/techniques/logger#using-the-logger-for-application-logging">Ilova loglashi uchun loggerdan foydalanish</a> bo'limida tasvirlanganidek foydalanishingiz mumkin.

Nestga tizim loglashi uchun kengaytirilgan loggeringizdan foydalanishni ilova opsiyalari obyektidagi `logger` xossasi orqali uning instansiyasini uzatib (yuqoridagi <a href="/docs/techniques/logger#custom-logger-implementation">Custom implementatsiya</a> bo'limida ko'rsatilgandek) yoki quyidagi <a href="/docs/techniques/logger#dependency-injection">Dependency Injection</a> bo'limidagi usulni qo'llab bildirishingiz mumkin. Agar shunday qilsangiz, yuqoridagi namunadagi kabi `super` ni chaqirishga ehtiyot bo'ling, shunda konkret log metodi chaqiruvi parent (ichki) klassga yo'naltiriladi va Nest kutgan ichki imkoniyatlardan foydalana oladi.

#### Dependency injection

Murakkab loglash funksionalligi uchun dependency injectiondan foydalanishni xohlaysiz. Masalan, loggerni moslashtirish uchun unga `ConfigService` ni inject qilishingiz, va o'z navbatida custom loggeringizni boshqa controller va/yoki providerlarga inject qilishingiz mumkin. Custom loggeringiz uchun dependency injectionni yoqish uchun `LoggerService` ni implementatsiya qiladigan klass yarating va shu klassni biror modulda provider sifatida ro'yxatdan o'tkazing. Masalan, siz

1. Oldingi bo'limlarda ko'rsatilgandek, ichki `ConsoleLogger` ni kengaytiradigan yoki uni to'liq qayta belgilaydigan `MyLogger` klassini aniqlang. `LoggerService` interfeysini implementatsiya qilishni unutmang.
2. Quyida ko'rsatilgandek `LoggerModule` yarating va bu moduldan `MyLogger` ni taqdim eting.

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
```

Bu konstruktsiya bilan, custom loggeringizni boshqa istalgan modulda ishlatish uchun taqdim etasiz. `MyLogger` klassingiz modul tarkibida bo'lgani uchun, u dependency injectiondan (masalan, `ConfigService` ni inject qilishdan) foydalanishi mumkin. Nest tomonidan tizim loglashi (masalan, bootstrapping va xatolarni qayta ishlash) uchun bu custom loggerni taqdim etish uchun yana bitta usul kerak.

Ilova instansiyasini yaratish (`NestFactory.create()`) har qanday modul kontekstidan tashqarida sodir bo'lgani uchun, u odatiy Dependency Injection inicializatsiya bosqichida ishtirok etmaydi. Shuning uchun `LoggerModule` ni kamida bitta ilova moduli import qilganini ta'minlashimiz kerak, shunda Nest `MyLogger` klassining singleton instansiyasini yaratadi.

Shundan so'ng, Nestga `MyLogger` ning xuddi shu singleton instansiyasidan foydalanishni quyidagi konstruktsiya bilan ko'rsatishimiz mumkin:

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(MyLogger));
await app.listen(process.env.PORT ?? 3000);
```

> info **Note** Yuqoridagi misolda barcha loglar custom logger (bu holatda `MyLogger`) ulanmaguncha va ilova inicializatsiyasi jarayoni muvaffaqiyatli yakunlanmaguncha yoki muvaffaqiyatsiz tugamaguncha buferlanishi uchun `bufferLogs` ni `true` qilib o'rnatdik. Agar inicializatsiya jarayoni muvaffaqiyatsiz tugasa, Nest xabar qilingan xatolarni chiqarish uchun original `ConsoleLogger` ga qaytadi. Shuningdek, loglarni qo'lda flush qilish uchun `autoFlushLogs` ni `false` (default `true`) qilib sozlashingiz mumkin (`Logger.flush()` metodi orqali).

Bu yerda `NestApplication` instansiyasidagi `get()` metodini chaqirib `MyLogger` obyektining singleton instansiyasini olamiz. Bu usul aslida Nest tomonidan logger instansiyasini "inject" qilish yo'li hisoblanadi. `app.get()` chaqiruvi `MyLogger` ning singleton instansiyasini qaytaradi va bu instansiya avvalroq yuqorida ta'riflanganidek boshqa modulda inject qilingan bo'lishiga tayanadi.

Shuningdek, `MyLogger` providerni feature klasslaringizga inject qilishingiz mumkin, shu orqali Nest tizim loglashi va ilova loglashi bo'ylab izchil xatti-harakatni ta'minlaysiz. Batafsil ma'lumot uchun quyidagi <a href="/docs/techniques/logger#using-the-logger-for-application-logging">Ilova loglashi uchun loggerdan foydalanish</a> va <a href="/docs/techniques/logger#injecting-a-custom-logger">Custom loggerni inject qilish</a> bo'limlariga qarang.

#### Custom loggerni inject qilish

Avval ichki loggerni quyidagi kod bilan kengaytiring. Biz `ConsoleLogger` klassi uchun konfiguratsion metadata sifatida `scope` opsiyasini beramiz va `MyLogger` ning har bir feature modulida yagona instansiyasi bo'lishini ta'minlash uchun transient scope ni belgilaymiz. Bu misolda individual `ConsoleLogger` metodlarini (`log()`, `warn()` va h.k.) kengaytirmadik, ammo xohlasangiz buni qilishingiz mumkin.

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log('Please feed the cat!');
  }
}
```

Keyin, `LoggerModule` ni quyidagicha yarating:

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
```

Keyin `LoggerModule` ni feature modulga import qiling. Default `Logger` ni kengaytirganimiz uchun `setContext` metodidan foydalanish qulayligiga egamiz. Shunday qilib, kontekstga xabardor custom loggerdan quyidagicha foydalanishimiz mumkin:

```typescript
import { Injectable } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  constructor(private myLogger: MyLogger) {
    // Due to transient scope, CatsService has its own unique instance of MyLogger,
    // so setting context here will not affect other instances in other services
    this.myLogger.setContext('CatsService');
  }

  findAll(): Cat[] {
    // You can call all the default methods
    this.myLogger.warn('About to return cats!');
    // And your custom methods
    this.myLogger.customLog();
    return this.cats;
  }
}
```

Nihoyat, quyida ko'rsatilgandek `main.ts` faylida custom logger instansiyasidan foydalanishni Nestga ayting. Albatta, bu misolda biz logger xatti-harakatini (masalan, `log()`, `warn()` va h.k.) kengaytirib, aslida moslashtirmaganmiz, shuning uchun bu qadam kerak emas. Ammo bu metodlarga custom mantiq qo'shsangiz va Nest aynan shu implementatsiyadan foydalanishini istasangiz, bu **kerak** bo'ladi.

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(new MyLogger());
await app.listen(process.env.PORT ?? 3000);
```

> info **Hint** Muqobil ravishda, `bufferLogs` ni `true` qilish o'rniga `logger: false` ko'rsatmasi bilan loggerni vaqtincha o'chirib turishingiz mumkin. `NestFactory.create` ga `logger: false` bersangiz, `useLogger` ni chaqirmaguningizcha hech narsa loglanmaydi, shuning uchun ba'zi muhim inicializatsiya xatolarini o'tkazib yuborishingiz mumkin. Agar dastlabki xabarlaringizning ba'zilari default logger bilan loglanishiga qarshi bo'lmasangiz, `logger: false` opsiyasini kiritmasangiz ham bo'ladi.

#### Tashqi loggerdan foydalanish

Production ilovalarida ko'pincha loglash bo'yicha maxsus talablar bo'ladi, jumladan ilg'or filtrlash, formatlash va markazlashtirilgan loglash. Nestning ichki loggeri Nest tizim xatti-harakatlarini monitoring qilish uchun ishlatiladi, va ishlab chiqish vaqtida feature modullarda oddiy formatlangan matn loglash uchun foydali bo'lishi mumkin, biroq production ilovalarda ko'pincha Winston kabi maxsus loglash modullaridan foydalaniladi. Har qanday standart Node.js ilovasida bo'lgani kabi, Nestda ham bunday modullardan to'liq foydalanishingiz mumkin.
