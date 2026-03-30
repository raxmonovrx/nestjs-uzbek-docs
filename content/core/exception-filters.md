---
title: "Exception filterlar"
navTitle: "Exception filterlar"
description: "Nest ilova bo'ylab qayta ishlanmagan barcha istisnolarni qayta ishlash uchun mas'ul bo'lgan o'rnatilgan exceptions layer bilan keladi. Istisno ilova kodingiz tomonidan qo'lga olinm"
order: 6
group: core
groupTitle: "Core"
---
Nest ilova bo'ylab qayta ishlanmagan barcha istisnolarni qayta ishlash uchun mas'ul bo'lgan o'rnatilgan **exceptions layer** bilan keladi. Istisno ilova kodingiz tomonidan qo'lga olinmasa, u ushbu qatlam tomonidan ushlanadi va keyin avtomatik ravishda mos, foydalanuvchi uchun qulay javob yuboriladi.

Tayyor holatda bu ish o'rnatilgan **global exception filter** tomonidan bajariladi; u `HttpException` (va undan meros oladigan sinflar) turidagi istisnolarni qayta ishlaydi. Istisno **tanilmagan** bo'lsa (`HttpException` ham emas, `HttpException` dan meros oladigan sinf ham emas), o'rnatilgan exception filter quyidagi standart JSON javobini hosil qiladi:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

> info **Hint** Global exception filter `http-errors` kutubxonasini qisman qo'llab-quvvatlaydi. Asosan, `statusCode` va `message` xossalarini o'z ichiga olgan har qanday tashlangan istisno to'g'ri to'ldiriladi va javob sifatida qaytariladi (tanilmagan istisnolar uchun odatdagi `InternalServerErrorException` o'rniga).

#### Standart istisnolarni tashlash

Nest `@nestjs/common` paketidan eksport qilinadigan o'rnatilgan `HttpException` sinfini taqdim etadi. Odatdagi HTTP REST/GraphQL API ilovalari uchun, muayyan xato holatlarida standart HTTP javob obyektlarini yuborish eng yaxshi amaliyot hisoblanadi.

Masalan, `CatsController` da `findAll()` metodi (`GET` route handler) bor. Tasavvur qilaylik, bu route handler qandaydir sabab bilan istisno tashlaydi. Buni ko'rsatish uchun uni quyidagicha hard-code qilamiz:

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

> info **Hint** Bu yerda `HttpStatus` dan foydalandik. Bu `@nestjs/common` paketidan import qilinadigan yordamchi enum.

Klient ushbu endpointni chaqirganda, javob quyidagicha bo'ladi:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

`HttpException` konstruktori javobni aniqlovchi ikkita majburiy argument qabul qiladi:

- `response` argumenti JSON javob bodysini aniqlaydi. U quyida tasvirlanganidek `string`
  yoki `object` bo'lishi mumkin.
- `status` argumenti HTTP status code ni aniqlaydi.

Standart holatda JSON javob bodysi quyidagi ikkita xossani o'z ichiga oladi:

- `statusCode`: `status` argumentida berilgan HTTP status code qiymatiga standartlashadi
- `message`: `status` ga asoslangan HTTP xatoning qisqa tavsifi

JSON javob bodysidagi faqat `message` qismini o'zgartirmoqchi bo'lsangiz,
`response` argumentida satr yuboring. To'liq JSON javob bodysini almashtirish uchun `response` argumentida obyekt uzating. Nest obyektni serializatsiya qilib, JSON javob bodysi sifatida qaytaradi.

Ikkinchi konstruktor argumenti - `status` - to'g'ri HTTP status code bo'lishi kerak.
Eng yaxshi amaliyot - `@nestjs/common` dan import qilingan `HttpStatus` enumidan foydalanish.

**Uchinchi** konstruktor argumenti (ixtiyoriy) - `options` - xato cause ni taqdim etish uchun ishlatilishi mumkin. Bu `cause` obyekti javob obyektiga serializatsiya qilinmaydi, ammo `HttpException` tashlanishiga sabab bo'lgan ichki xato haqida qimmatli ma'lumot berib, loglash uchun foydali bo'lishi mumkin.

Quyida butun javob bodysini almashtirish va xato sababini taqdim etish misoli:

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  try {
    await this.service.findAll()
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.FORBIDDEN,
      error: 'This is a custom message',
    }, HttpStatus.FORBIDDEN, {
      cause: error
    });
  }
}
```

Yuqoridagidan foydalanilganda, javob quyidagicha ko'rinadi:

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

#### Istisnolarni loglash

Standart holatda exception filter `HttpException` (va undan meros oladigan istisnolar) kabi o'rnatilgan istisnolarni loglamaydi. Bu istisnolar tashlanganda, ular konsolda ko'rinmaydi, chunki ular ilovaning normal oqimi bir qismi sifatida qaraladi. Xuddi shunday xatti-harakat `WsException` va `RpcException` kabi boshqa o'rnatilgan istisnolar uchun ham qo'llaniladi.

Bu istisnolar `@nestjs/common` paketidan eksport qilinadigan `IntrinsicException` bazaviy sinfidan meros oladi. Ushbu sinf normal ilova ishlashining bir qismi bo'lgan istisnolarni bo'lmaganlaridan ajratishga yordam beradi.

Agar bu istisnolarni loglashni xohlasangiz, maxsus exception filter yaratishingiz mumkin. Buni keyingi bo'limda tushuntiramiz.

#### Maxsus istisnolar

Ko'p holatlarda sizga maxsus istisnolar yozish shart bo'lmaydi va keyingi bo'limda ta'riflangan o'rnatilgan Nest HTTP istisnosidan foydalanishingiz mumkin. Agar baribir moslashtirilgan istisnolar yaratishingiz kerak bo'lsa, o'zingizning **istisnolar ierarxiyasi** ni yaratish yaxshi amaliyot; bunda maxsus istisnolar `HttpException` bazaviy sinfidan meros oladi. Bu yondashuv bilan Nest istisnolaringizni tanib oladi va xato javoblarini avtomatik boshqaradi. Keling, shunday maxsus istisnoni yaratamiz:

```typescript
@@filename(forbidden.exception)
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```

`ForbiddenException` bazaviy `HttpException` dan meros olganligi sabab, u o'rnatilgan exception handler bilan to'liq mos ishlaydi, shuning uchun uni `findAll()` metodida bemalol ishlatishimiz mumkin.

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  throw new ForbiddenException();
}
```

#### O'rnatilgan HTTP istisnolari

Nest bazaviy `HttpException` dan meros oladigan standart istisnolar to'plamini taqdim etadi. Ular `@nestjs/common` paketidan eksport qilinadi va eng ko'p uchraydigan HTTP istisnolarini ifodalaydi:

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `HttpVersionNotSupportedException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableEntityException`
- `InternalServerErrorException`
- `NotImplementedException`
- `ImATeapotException`
- `MethodNotAllowedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`
- `PreconditionFailedException`

Barcha o'rnatilgan istisnolar `options` parametri orqali xato `cause` va xato tavsifini ham taqdim etishi mumkin:

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});
```

Yuqoridagidan foydalansak, javob quyidagicha ko'rinadi:

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}
```

#### Exception filterlar

Bazaviy (o'rnatilgan) exception filter ko'plab holatlarni avtomatik tarzda boshqarishi mumkin bo'lsa-da, siz exceptions layer ustidan **to'liq nazorat**ni xohlashingiz mumkin. Masalan, loglash qo'shish yoki dinamik omillarga qarab boshqa JSON sxemasini ishlatishni istashingiz mumkin. **Exception filterlar** aynan shu maqsad uchun mo'ljallangan. Ular boshqaruv oqimini va klientga yuboriladigan javob tarkibini aniq boshqarishga imkon beradi.

Keling, `HttpException` sinfining instansiyasi bo'lgan istisnolarni ushlash va ular uchun maxsus javob mantiqini amalga oshirish uchun exception filter yaratamiz. Buni qilish uchun underlying platform `Request` va `Response` obyektlariga kirishimiz kerak. `Request` obyektini olib, original `url` ni ajratib olamiz va uni loglash ma'lumotiga qo'shamiz. `Response` obyektidan foydalanib, `response.json()` metodini chaqirish orqali yuboriladigan javobni bevosita nazorat qilamiz.

```typescript
@@filename(http-exception.filter)
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
@@switch
import { Catch, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

> info **Hint** Barcha exception filterlar `ExceptionFilter<T>` generic interfeysini amalga oshirishi kerak. Bu sizdan `catch(exception: T, host: ArgumentsHost)` metodini ko'rsatilgan imzo bilan taqdim etishni talab qiladi. `T` istisno tipini bildiradi.

> warning **Warning** Agar `@nestjs/platform-fastify` dan foydalanayotgan bo'lsangiz, `response.json()` o'rniga `response.send()` dan foydalanishingiz mumkin. `fastify` dan to'g'ri tiplarni import qilishni unutmang.

`@Catch(HttpException)` dekoratori kerakli metadatani exception filterga biriktiradi va Nestga ushbu filter `HttpException` turidagi istisnolarni qidirayotganini va boshqa hech narsani emasligini bildiradi. `@Catch()` dekoratori bitta parametrni yoki vergul bilan ajratilgan parametrlar ro'yxatini qabul qilishi mumkin. Bu sizga bir vaqtning o'zida bir nechta istisno turlari uchun filter sozlash imkonini beradi.

#### Arguments host

Keling, `catch()` metodining parametrlarini ko'rib chiqamiz. `exception` parametri hozir qayta ishlanayotgan istisno obyektidir. `host` parametri esa `ArgumentsHost` obyektidir. `ArgumentsHost` kuchli yordamchi obyekt bo'lib, uni [execution context chapter](/docs/fundamentals/execution-context) da batafsil ko'rib chiqamiz\*. Bu kod namunasida biz undan original request handlerga (istisno kelib chiqqan controllerdagi) uzatilayotgan `Request` va `Response` obyektlariga havola olish uchun foydalanamiz. Bu kod namunasi ichida `ArgumentsHost` ning ba'zi yordamchi metodlarini qo'llab, kerakli `Request` va `Response` obyektlarini olamiz. `ArgumentsHost` haqida batafsil [bu yerda](/docs/fundamentals/execution-context).

\*Ushbu abstraksiya darajasining sababi shuki, `ArgumentsHost` barcha kontekstlarda ishlaydi (masalan, hozir ishlayotgan HTTP server konteksti, shuningdek Microservices va WebSockets). Execution context bobida `ArgumentsHost` va uning yordamchi funksiyalari yordamida **har qanday** execution context uchun mos <a href="/docs/fundamentals/execution-context#host-methods">underlying arguments</a> ga qanday kirishimizni ko'ramiz. Bu bizga barcha kontekstlarda ishlaydigan umumiy exception filterlarini yozish imkonini beradi.

#### Filterlarni ulash

Yangi `HttpExceptionFilter` ni `CatsController` ning `create()` metodiga bog'laylik.

```typescript
@@filename(cats.controller)
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
@@switch
@Post()
@UseFilters(new HttpExceptionFilter())
@Bind(Body())
async create(createCatDto) {
  throw new ForbiddenException();
}
```

> info **Hint** `@UseFilters()` dekoratori `@nestjs/common` paketidan import qilinadi.

Bu yerda biz `@UseFilters()` dekoratoridan foydalandik. `@Catch()` dekoratoriga o'xshash, u bitta filter instansiyasini yoki vergul bilan ajratilgan filter instansiyalari ro'yxatini qabul qilishi mumkin. Bu yerda biz `HttpExceptionFilter` instansiyasini joyida yaratdik. Muqobil ravishda, instansiya o'rniga sinfni uzatishingiz mumkin; bu instansiyalash mas'uliyatini freymvorkka qoldiradi va **dependency injection**ni yoqadi.

```typescript
@@filename(cats.controller)
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
@@switch
@Post()
@UseFilters(HttpExceptionFilter)
@Bind(Body())
async create(createCatDto) {
  throw new ForbiddenException();
}
```

> info **Hint** Imkon bo'lganda, filterlarni instansiya emas, sinf orqali qo'llashni afzal ko'ring. Bu **xotira sarfi**ni kamaytiradi, chunki Nest bir xil sinf instansiyalarini butun modul bo'ylab oson qayta ishlatishi mumkin.

Yuqoridagi misolda `HttpExceptionFilter` faqat bitta `create()` route handlerga qo'llanilgan, ya'ni u method-scoped. Exception filterlar turli darajalarda scoped bo'lishi mumkin: controller/resolver/gateway darajasida method-scoped, controller-scoped yoki global-scoped.
Masalan, filterni controller-scoped qilib sozlash uchun quyidagicha qilasiz:

```typescript
@@filename(cats.controller)
@Controller()
@UseFilters(new HttpExceptionFilter())
export class CatsController {}
```

Bu konstruktsiya `CatsController` ichida aniqlangan har bir route handler uchun `HttpExceptionFilter` ni sozlaydi.

Global-scoped filter yaratish uchun quyidagicha qilasiz:

```typescript
@@filename(main)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> warning **Warning** `useGlobalFilters()` metodi gatewaylar yoki gibrid ilovalar uchun filterlarni sozlamaydi.

Global-scoped filterlar butun ilova bo'ylab, har bir controller va har bir route handler uchun ishlatiladi. Dependency injection nuqtai nazaridan shuni yodda tuting: har qanday moduldan tashqarida (`useGlobalFilters()` orqali, yuqoridagi misoldagidek) ro'yxatdan o'tkazilgan global filterlar bog'liqliklarni in'eksiya qila olmaydi, chunki bu modul kontekstidan tashqarida amalga oshiriladi. Bu muammoni hal qilish uchun quyidagi konstruktsiya yordamida global-scoped filterni **bevosita istalgan moduldan** ro'yxatdan o'tkazishingiz mumkin:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

> info **Hint** Filter uchun dependency injection'ni shu yondashuv orqali bajarayotganda, bu konstruktsiya qaysi modulda qo'llanmasin, filter aslida global ekanini yodda tuting. Buni qayerda qilish kerak? Filter (`HttpExceptionFilter` yuqoridagi misolda) aniqlangan modulni tanlang. Shuningdek, `useClass` maxsus provayder ro'yxatga olishning yagona usuli emas. Batafsil bu yerda.

Bu usul bilan kerak bo'lganicha filterlar qo'shishingiz mumkin; shunchaki har birini `providers` massiviga qo'shing.

#### Hammasini ushlash

**Har qanday** qayta ishlanmagan istisnoni (istisno turidan qat'i nazar) ushlash uchun `@Catch()` dekoratorining parametrlar ro'yxatini bo'sh qoldiring, masalan, `@Catch()`.

Quyidagi misolda platformaga bog'liq bo'lmagan kod berilgan, chunki u javobni yetkazish uchun [HTTP adapter](/docs/faq/http-adapter) dan foydalanadi va platformaga xos obyektlardan (`Request` va `Response`) bevosita foydalanmaydi:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

> warning **Warning** Hammasini ushlaydigan exception filterni ma'lum bir turga bog'langan filter bilan birlashtirganda, "Hammasini ushla" filteri bog'langan turdagi istisnoni to'g'ri qayta ishlashi uchun birinchi bo'lib e'lon qilinishi kerak.

#### Meros olish

Odatda siz ilovangiz talablarini qondirish uchun to'liq moslashtirilgan exception filterlar yaratasiz. Biroq, ba'zi holatlarda o'rnatilgan standart **global exception filter** ni shunchaki kengaytirib, muayyan omillarga ko'ra xatti-harakatni o'zgartirishni xohlashingiz mumkin.

Istisnolarni bazaviy filterga delegatsiya qilish uchun `BaseExceptionFilter` dan meros olib, meros qilingan `catch()` metodini chaqirishingiz kerak.

```typescript
@@filename(all-exceptions.filter)
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
@@switch
import { Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception, host) {
    super.catch(exception, host);
  }
}
```

> warning **Warning** `BaseExceptionFilter` dan meros olgan method-scoped va controller-scoped filterlar `new` bilan instansiyalanmasligi kerak. Buning o'rniga, freymvork ularni avtomatik instansiyalasin.

Global filterlar bazaviy filterni **meros olishi** mumkin. Buni ikki usuldan biri bilan qilish mumkin.

Birinchi usul - maxsus global filterni instansiyalashda `HttpAdapter` havolasini in'eksiya qilish:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Ikkinchi usul - `APP_FILTER` tokenidan <a href="/docs/core/exception-filters#binding-filters">bu yerda ko'rsatilgandek</a> foydalanish.
