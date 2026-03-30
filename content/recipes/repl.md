---
title: "Read-Eval-Print-Loop (REPL)"
navTitle: "Read-Eval-Print-Loop (REPL)"
description: "REPL - bu foydalanuvchi kiritgan buyruqlarni qabul qiladigan, ularni bajaradigan va natijani qaytaradigan sodda interaktiv muhit. REPL imkoniyati dependency graph'ingizni tekshiris"
order: 12
group: recipes
groupTitle: "Recipes"
---
REPL - bu foydalanuvchi kiritgan buyruqlarni qabul qiladigan, ularni bajaradigan va natijani qaytaradigan sodda interaktiv muhit.
REPL imkoniyati dependency graph'ingizni tekshirish va provider'lar (hamda controller'lar) metodlarini to'g'ridan-to'g'ri terminaldan chaqirishga imkon beradi.

#### Foydalanish

NestJS ilovangizni REPL rejimida ishga tushirish uchun yangi `repl.ts` faylini (`main.ts` bilan birga) yarating va unga quyidagi kodni yozing:

```typescript
@@filename(repl)
import { repl } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();
@@switch
import { repl } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();
```

Endi terminalda REPL'ni quyidagi buyruq bilan ishga tushiring:

```bash
$ npm run start -- --entryFile repl
```

> info **Hint** `repl` Node.js REPL server obyektini qaytaradi.

Ishga tushgach, konsolda quyidagi xabarlarni ko'rishingiz kerak:

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized
```

Shundan so'ng dependency graph bilan ishlashni boshlashingiz mumkin. Masalan, `AppService` ni olib (bu yerda starter project misol sifatida ishlatilgan) `getHello()` metodini chaqirishingiz mumkin:

```typescript
> get(AppService).getHello()
'Hello World!'
```

Terminal ichidan istalgan JavaScript kodini bajarishingiz mumkin. Masalan, `AppController` instansiyasini lokal o'zgaruvchiga yozib, asinxron metodni `await` bilan chaqirishingiz mumkin:

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'
```

Berilgan provider yoki controller'dagi barcha public metodlarni ko'rsatish uchun `methods()` funksiyasidan foydalaning:

```typescript
> methods(AppController)

Methods:
 ◻ getHello
```

Barcha ro'yxatdan o'tgan modullarni controller va provider'lari bilan birga ro'yxat ko'rinishida chiqarish uchun `debug()` dan foydalaning.

```typescript
> debug()

AppModule:
 - controllers:
  ◻ AppController
 - providers:
  ◻ AppService
```

Qisqa demo:

Oldindan taqdim etilgan native metodlar haqida ko'proq ma'lumotni quyidagi bo'limdan topasiz.

#### Native funksiyalar

O'rnatilgan NestJS REPL bir nechta native funksiyalar bilan keladi va ular REPL ishga tushganda global mavjud bo'ladi. Ularni ro'yxatlash uchun `help()` ni chaqiring.

Agar biror funksiya signature'ini (ya'ni qabul qiladigan parametrlar va qaytish turini) eslay olmasangiz, `<function_name>.help` ni chaqirishingiz mumkin.
Masalan:

```text
> $.help
Retrieves an instance of either injectable or controller, otherwise, throws exception.
Interface: $(token: InjectionToken) => any
```

> info **Hint** Bu funksiya interfeyslari TypeScript function type expression syntax da yozilgan.

| Function     | Description                                                                                                        | Signature                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `debug`      | Barcha ro'yxatdan o'tgan modullarni controller va provider'lari bilan ro'yxat ko'rinishida chiqaradi.             | `debug(moduleCls?: ClassRef \| string) => void`                       |
| `get` or `$` | Injectable yoki controller instansiyasini oladi, aks holda exception tashlaydi.                                   | `get(token: InjectionToken) => any`                                   |
| `methods`    | Berilgan provider yoki controller'dagi barcha public metodlarni ko'rsatadi.                                       | `methods(token: ClassRef \| string) => void`                          |
| `resolve`    | Transient yoki request-scoped injectable/controller instansiyasini resolve qiladi, aks holda exception tashlaydi. | `resolve(token: InjectionToken, contextId: any) => Promise<any>`      |
| `select`     | Modullar daraxti bo'ylab yurishga imkon beradi, masalan tanlangan moduldan muayyan instansiyani olish uchun.      | `select(token: DynamicModule \| ClassRef) => INestApplicationContext` |

#### Watch mode

Development vaqtida koddagi barcha o'zgarishlar avtomatik aks etishi uchun REPL'ni watch mode'da ishga tushirish foydali:

```bash
$ npm run start -- --watch --entryFile repl
```

Bunda bitta kamchilik bor: har bir reload'dan keyin REPL buyruqlar tarixi yo'qoladi va bu noqulay bo'lishi mumkin.
Yaxshiyamki, buning juda sodda yechimi bor. `bootstrap` funksiyasini quyidagicha o'zgartiring:

```typescript
async function bootstrap() {
  const replServer = await repl(AppModule);
  replServer.setupHistory(".nestjs_repl_history", (err) => {
    if (err) {
      console.error(err);
    }
  });
}
```

Endi tarix ishga tushirishlar va reload'lar orasida saqlanadi.
