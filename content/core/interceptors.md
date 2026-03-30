---
title: "Interceptorlar"
navTitle: "Interceptorlar"
description: "Interceptor - @Injectable() dekoratori bilan belgilangan va NestInterceptor interfeysini amalga oshiradigan sinf."
order: 9
group: core
groupTitle: "Core"
---
Interceptor - `@Injectable()` dekoratori bilan belgilangan va `NestInterceptor` interfeysini amalga oshiradigan sinf.

Interceptorlar Aspect Oriented Programming (AOP) texnikasidan ilhomlangan foydali imkoniyatlar to'plamiga ega. Ular quyidagilarga imkon beradi:

- metod bajarilishidan oldin / keyin qo'shimcha mantiqni bog'lash
- funksiya qaytargan natijani o'zgartirish
- funksiya tashlagan istisnoni o'zgartirish
- funksiyaning asosiy xatti-harakatini kengaytirish
- muayyan shartlarga ko'ra funksiyani to'liq almashtirish (masalan, keshlash maqsadida)

#### Asoslar

Har bir interceptor `intercept()` metodini amalga oshiradi, u ikki argumentni qabul qiladi. Birinchisi `ExecutionContext` instansiyasi (xuddi [guards](/docs/core/guards) dagi obyekt bilan bir xil). `ExecutionContext` `ArgumentsHost` dan meros oladi. Biz `ArgumentsHost` ni exception filters bobida ko'rganmiz. U yerda u original handlerga uzatilgan argumentlarni o'rab turuvchi qobiq ekanini va ilova turiga qarab turli argumentlar massivlarini o'z ichiga olishini ko'rgandik. Bu mavzu bo'yicha qo'shimcha ma'lumot uchun [exception filters](/docs/core/exception-filters#arguments-host) ga qarang.

#### Execution context

`ArgumentsHost` ni kengaytirish orqali `ExecutionContext` hozirgi bajarilish jarayoni haqida qo'shimcha tafsilotlarni taqdim etadigan bir nechta yangi yordamchi metodlarni ham qo'shadi. Bu tafsilotlar keng ko'lamdagi controllerlar, metodlar va bajarilish kontekstlarida ishlaydigan yanada umumiy interceptorlar qurishda foydali bo'lishi mumkin. `ExecutionContext` haqida batafsil [bu yerda](/docs/fundamentals/execution-context).

#### Call handler

Ikkinchi argument - `CallHandler`. `CallHandler` interfeysi `handle()` metodini amalga oshiradi, uni interceptor ichida istalgan paytda route handler metodini chaqirish uchun ishlatishingiz mumkin. Agar `intercept()` metodingizda `handle()` ni chaqirmasangiz, route handler metodi umuman bajarilmaydi.

Bu yondashuv `intercept()` metodi request/response oqimini samarali tarzda **o'rab olishini** anglatadi. Natijada, siz yakuniy route handler bajarilishidan **oldin ham, keyin ham** maxsus mantiqni amalga oshirishingiz mumkin. `handle()` ni chaqirishdan **oldin** ishlaydigan kodni `intercept()` metodiga yozish mumkinligi aniq, ammo undan keyin nima bo'lishiga qanday ta'sir qilamiz? `handle()` metodi `Observable` qaytargani sababli, javobni yanada boshqarish uchun kuchli RxJS operatorlaridan foydalanishimiz mumkin. Aspect Oriented Programming terminologiyasida route handler chaqiruvi (ya'ni `handle()` ni chaqirish) Pointcut deb ataladi, ya'ni qo'shimcha mantiqimiz kiritiladigan nuqta.

Masalan, kiruvchi `POST /cats` so'rovini ko'rib chiqamiz. Bu so'rov `CatsController` ichida aniqlangan `create()` handleriga yo'naltiriladi. Agar `handle()` metodini chaqirmaydigan interceptor yo'lning istalgan nuqtasida chaqirilsa, `create()` metodi bajarilmaydi. `handle()` chaqirilgach (va uning `Observable` i qaytgach), `create()` handleri ishga tushadi. `Observable` orqali javob oqimi olingach, oqim ustida qo'shimcha operatsiyalar bajarilishi va yakuniy natija chaqiruvchiga qaytarilishi mumkin.

#### Aspect interception

Ko'rib chiqadigan birinchi use-case - interceptor orqali foydalanuvchi o'zaro ta'sirini log qilish (masalan, foydalanuvchi chaqiruvlarini saqlash, hodisalarni asinxron tarqatish yoki timestamp hisoblash). Quyida oddiy `LoggingInterceptor` ni ko'rsatamiz:

```typescript
@@filename(logging.interceptor)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor {
  intercept(context, next) {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
```

> info **Hint** `NestInterceptor<T, R>` generic interfeys bo'lib, unda `T` `Observable<T>` (javob oqimini qo'llab-quvvatlovchi) tipini, `R` esa `Observable<R>` tomonidan o'ralgan qiymat tipini bildiradi.

> warning **Notice** Interceptorlar kontrollerlar, provayderlar, guardlar va boshqalar kabi `constructor` orqali **bog'liqliklarni in'eksiya** qilishi mumkin.

`handle()` RxJS `Observable` qaytargani uchun, oqimni boshqarishda foydalanishimiz mumkin bo'lgan operatorlar juda ko'p. Yuqoridagi misolda biz `tap()` operatoridan foydalandik; u observable oqimi odatiy yoki istisno bilan yakunlanganda anonim log funksiyamizni chaqiradi, ammo javob sikliga boshqacha aralashmaydi.

#### Interceptorlarni ulash

Interceptorni sozlash uchun `@nestjs/common` paketidan import qilinadigan `@UseInterceptors()` dekoratoridan foydalanamiz. [pipes](/docs/core/pipes) va [guards](/docs/core/guards) kabi, interceptorlar controller-scoped, method-scoped yoki global-scoped bo'lishi mumkin.

```typescript
@@filename(cats.controller)
@UseInterceptors(LoggingInterceptor)
export class CatsController {}
```

> info **Hint** `@UseInterceptors()` dekoratori `@nestjs/common` paketidan import qilinadi.

Yuqoridagi konstruktsiyani ishlatsak, `CatsController` da aniqlangan har bir route handler `LoggingInterceptor` dan foydalanadi. Kimdir `GET /cats` endpointini chaqirganda, standart chiqishda quyidagi natijani ko'rasiz:

```typescript
Before...
After... 1ms
```

E'tibor bering, biz `LoggingInterceptor` sinfini (instansiya emas) uzatdik, instansiyalash mas'uliyatini freymvorkka qoldirib va dependency injection'ni yoqib. Pipe, guard va exception filterlarda bo'lgani kabi, joyida instansiya ham uzatishimiz mumkin:

```typescript
@@filename(cats.controller)
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}
```

Aytilganidek, yuqoridagi konstruktsiya interceptorni ushbu controller tomonidan e'lon qilingan har bir handlerga biriktiradi. Agar interceptorning qamrovini bitta metod bilan cheklamoqchi bo'lsak, dekoratorni **metod darajasida** qo'llaymiz.

Global interceptorni sozlash uchun Nest ilovasi instansiyasining `useGlobalInterceptors()` metodidan foydalanamiz:

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

Global interceptorlar butun ilova bo'ylab, har bir controller va har bir route handler uchun ishlatiladi. Dependency injection nuqtai nazaridan shuni yodda tuting: har qanday moduldan tashqarida (`useGlobalInterceptors()` orqali, yuqoridagi misoldagidek) ro'yxatdan o'tkazilgan global interceptorlar bog'liqliklarni in'eksiya qila olmaydi, chunki bu modul kontekstidan tashqarida amalga oshiriladi. Bu muammoni hal qilish uchun quyidagi konstruktsiya yordamida interceptorni **bevosita istalgan moduldan** sozlashingiz mumkin:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

> info **Hint** Interceptor uchun dependency injection'ni shu yondashuv orqali bajarayotganda, bu konstruktsiya qaysi modulda qo'llanmasin, interceptor aslida global ekanini yodda tuting. Buni qayerda qilish kerak? Interceptor (`LoggingInterceptor` yuqoridagi misolda) aniqlangan modulni tanlang. Shuningdek, `useClass` maxsus provayder ro'yxatga olishning yagona usuli emas. Batafsil bu yerda.

#### Response mapping

Biz `handle()` `Observable` qaytarishini allaqachon bilamiz. Oqim route handlerdan **qaytgan** qiymatni o'z ichiga oladi, shuning uchun biz RxJS `map()` operatori yordamida uni osonlikcha o'zgartirishimiz mumkin.

> warning **Warning** Response mapping funksiyasi kutubxona-specific response strategiyasi bilan ishlamaydi (`@Res()` obyektidan bevosita foydalanish taqiqlanadi).

Keling, `TransformInterceptor` ni yaratamiz, u jarayonni ko'rsatish uchun har bir javobni sodda tarzda o'zgartiradi. U RxJS `map()` operatoridan foydalanib, javob obyektini yangi yaratilgan obyektning `data` xossasiga biriktiradi va yangi obyektni klientga qaytaradi.

```typescript
@@filename(transform.interceptor)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor {
  intercept(context, next) {
    return next.handle().pipe(map(data => ({ data })));
  }
}
```

> info **Hint** Nest interceptorlari sinxron va asinxron `intercept()` metodlari bilan ishlaydi. Kerak bo'lsa, metodni oddiygina `async` ga o'tkazishingiz mumkin.

Yuqoridagi konstruktsiya bilan, kimdir `GET /cats` endpointini chaqirganda, javob quyidagicha ko'rinadi (route handler bo'sh massiv `[]` qaytargan deb hisoblaymiz):

```json
{
  "data": []
}
```

Interceptorlar butun ilova bo'ylab uchraydigan talablar uchun qayta foydalaniladigan yechimlar yaratishda katta qiymatga ega.
Masalan, har bir `null` qiymatini bo'sh satr `''` ga o'zgartirish kerak deb tasavvur qiling. Buni bitta kod qatori bilan bajarish va interceptorni global tarzda ulash mumkin, shunda u har bir ro'yxatdan o'tgan handler uchun avtomatik ishlatiladi.

```typescript
@@filename()
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map(value => value === null ? '' : value ));
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor {
  intercept(context, next) {
    return next
      .handle()
      .pipe(map(value => value === null ? '' : value ));
  }
}
```

#### Exception mapping

Yana bir qiziqarli foydalanish holati - RxJS `catchError()` operatoridan foydalanib, tashlangan istisnolarni qayta yozish:

```typescript
@@filename(errors.interceptor)
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(err => throwError(() => new BadGatewayException())),
      );
  }
}
@@switch
import { Injectable, BadGatewayException } from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor {
  intercept(context, next) {
    return next
      .handle()
      .pipe(
        catchError(err => throwError(() => new BadGatewayException())),
      );
  }
}
```

#### Oqimni almashtirish

Ba'zan handlerni umuman chaqirmasdan, o'rniga boshqa qiymat qaytarishni to'liq oldini olishni xohlashimizga bir nechta sabablar bo'lishi mumkin. Eng aniq misollardan biri - javob vaqtini yaxshilash uchun keshni joriy qilish. Keling, javobini keshdan qaytaradigan sodda **cache interceptor** ga nazar tashlaylik. Haqiqiy misolda TTL, keshni invalidatsiya qilish, kesh hajmi va boshqa omillarni ko'rib chiqishimiz kerak bo'ladi, ammo bu ushbu muhokama doirasidan tashqarida. Bu yerda asosiy tushunchani ko'rsatadigan bazaviy misolni beramiz.

```typescript
@@filename(cache.interceptor)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isCached = true;
    if (isCached) {
      return of([]);
    }
    return next.handle();
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { of } from 'rxjs';

@Injectable()
export class CacheInterceptor {
  intercept(context, next) {
    const isCached = true;
    if (isCached) {
      return of([]);
    }
    return next.handle();
  }
}
```

Bizning `CacheInterceptor` qattiq kodlangan `isCached` o'zgaruvchisiga va qattiq kodlangan `[]` javobiga ega. Asosiy nuqta shuki, bu yerda biz RxJS `of()` operatori tomonidan yaratilgan yangi oqimni qaytaramiz, demak route handler **umuman chaqirilmaydi**. Kimdir `CacheInterceptor` dan foydalanadigan endpointni chaqirsa, javob (qattiq kodlangan, bo'sh massiv) darhol qaytariladi. Umumiy yechim yaratish uchun `Reflector` dan foydalanib maxsus dekorator yaratishingiz mumkin. `Reflector` [guards](/docs/core/guards) bobida yaxshi tushuntirilgan.

#### Ko'proq operatorlar

RxJS operatorlari yordamida oqimni boshqarish imkoniyati bizga ko'plab imkoniyatlarni beradi. Yana bir umumiy holatni ko'rib chiqaylik. Tasavvur qiling, route so'rovlari uchun **timeout** ni boshqarishni xohlaysiz. Endpoint ma'lum vaqt davomida hech narsa qaytarmasa, xato javobi bilan yakunlashni istaysiz. Quyidagi konstruktsiya buni amalga oshiradi:

```typescript
@@filename(timeout.interceptor)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  };
};
@@switch
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor {
  intercept(context, next) {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  };
};
```

5 soniyadan so'ng, so'rovni qayta ishlash bekor qilinadi. `RequestTimeoutException` tashlashdan oldin maxsus mantiqni ham qo'shishingiz mumkin (masalan, resurslarni bo'shatish).
