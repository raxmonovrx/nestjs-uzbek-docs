---
title: "Controllerlar"
navTitle: "Controllerlar"
description: "Controllerlar kiruvchi requestlarni qabul qilish va klientga response qaytarish uchun javob beradi."
order: 3
group: core
groupTitle: "Core"
---
Controllerlar kiruvchi **request**larni qabul qilish va klientga **response** qaytarish uchun javob beradi.

Controllerning vazifasi — ilova uchun aniq (specific) so‘rovlarni boshqarish. **Routing** mexanizmi har bir so‘rovni qaysi controller qayta ishlashini aniqlaydi. Ko‘pincha bitta controllerda bir nechta route bo‘ladi va har bir route turli action bajarishi mumkin.

Oddiy controller yaratish uchun biz class’lar va **decorator**lardan foydalanamiz. Decoratorlar class’larni kerakli metadata bilan bog‘laydi va Nest’ga request’larni tegishli controllerlarga ulaydigan routing map yaratish imkonini beradi.

> info **Hint** Ichki [validation](/docs/techniques/validation) bilan CRUD controller’ni tez yaratish uchun CLI’dagi [CRUD generator](/docs/recipes/crud-generator#crud-generator)dan foydalanishingiz mumkin: `nest g resource [name]`.

#### Routing

Quyidagi misolda biz asosiy controller’ni aniqlash uchun **majburiy** bo‘lgan `@Controller()` decoratoridan foydalanamiz. Biz ixtiyoriy route path prefix sifatida `cats` ni ko‘rsatamiz. `@Controller()` decoratorida path prefix ishlatish related route’larni bir joyga guruhlashga yordam beradi va takroriy kodni kamaytiradi. Masalan, agar `cat` entity’si bilan bog‘liq interaction’larni boshqaradigan route’larni `/cats` path’i ostida guruhlamoqchi bo‘lsak, `@Controller()` decoratorida `cats` prefix’ini belgilaymiz. Shunda fayldagi har bir route uchun path’ning shu qismini qayta-qayta yozishimizga to‘g‘ri kelmaydi.

```typescript
@@filename(cats.controller)
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
@@switch
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return 'This action returns all cats';
  }
}
```

> info **Hint** CLI yordamida controller yaratish uchun shunchaki `$ nest g controller [name]` buyrug‘ini bajaring.

`findAll()` metodidan oldin qo‘yilgan `@Get()` HTTP request method decorator’i Nest’ga HTTP so‘rovlar uchun aniq endpoint’ga handler yaratishni bildiradi. Endpoint HTTP method (bu yerda GET) va route path bilan aniqlanadi. Xo‘sh, route path nima? Handler uchun route path controller’da e’lon qilingan (ixtiyoriy) prefix bilan metod decoratorida ko‘rsatilgan path’ni birlashtirish orqali hosil bo‘ladi. Biz har bir route uchun prefix (`cats`) belgilaganmiz va metod decoratorida aniq path bermaganimiz uchun Nest `GET /cats` so‘rovlarini shu handler’ga map qiladi.

Aytilganidek, route path ixtiyoriy controller path prefix’ini **va** metod decoratorida berilgan path string’ni o‘z ichiga oladi. Masalan, controller prefix `cats` bo‘lsa va metod decorator `@Get('breed')` bo‘lsa, natijaviy route `GET /cats/breed` bo‘ladi.

Yuqoridagi misolda, ushbu endpoint’ga GET so‘rov kelganda, Nest so‘rovni foydalanuvchi yozgan `findAll()` metodiga yo‘naltiradi. E’tibor bering: bu yerda metod nomi butunlay ixtiyoriy. Biz route’ni bog‘lash uchun metod e’lon qilishimiz kerak, lekin Nest metod nomiga maxsus ma’no yuklamaydi.

Bu metod 200 status code va mos response bilan qaytadi (bu misolda oddiy string). Nega bunday bo‘ladi? Buni tushuntirish uchun avval Nest response’larni boshqarishda ikki **turli** yondashuvdan foydalanishini bilishimiz kerak:

<table>
  <tr>
    <td>Standart (tavsiya etiladi)</td>
    <td>
      Ushbu built-in usulda, request handler JavaScript object yoki array qaytarsa, u <strong>avtomatik</strong>
      ravishda JSON’ga serialize qilinadi. Ammo JavaScript primitive type (masalan, <code>string</code>, <code>number</code>, <code>boolean</code>) qaytsa, Nest uni serialize qilishga urinmasdan, shunchaki qiymatning o‘zini yuboradi. Bu response handling’ni soddalashtiradi: qiymatni qaytaring, qolganini Nest o‘zi qiladi.
      <br />
      <br /> Bundan tashqari, response’ning <strong>status code</strong>’i default holatda doimo 200 bo‘ladi, faqat POST
      so‘rovlari uchun 201 ishlatiladi. Bu xatti-harakatni handler darajasida <code>@HttpCode(...)</code>
      decoratorini qo‘shib oson o‘zgartirishimiz mumkin (qarang: <a href="/docs/core/controllers#status-code">Status codes</a>).
    </td>
  </tr>
  <tr>
    <td>Kutubxonaga xos (Library-specific)</td>
    <td>
      Biz kutubxonaga xos (masalan, Express) response object’dan foydalanishimiz mumkin,
      u metod handler signature’iga <code>@Res()</code> decoratorini qo‘yish orqali inject qilinadi (masalan, <code>findAll(@Res() response)</code>).  Bu yondashuvda siz native response handling metodlaridan foydalanish imkoniga ega bo‘lasiz.  Masalan, Express’da response’ni <code>response.status(200).send()</code> kabi kod bilan qurishingiz mumkin.
    </td>
  </tr>
</table>

> warning **Warning** Nest handler `@Res()` yoki `@Next()` ishlatayotganini aniqlasa, siz library-specific yondashuvni tanlaganingizni tushunadi. Agar ikkala yondashuv bir route ichida birgalikda ishlatilsa, Standart yondashuv shu route uchun **avtomatik o‘chirib qo‘yiladi** va kutilganidek ishlamaydi. Ikkalasidan bir vaqtda foydalanish uchun (masalan, cookie/header’larni qo‘yish uchun response object’ni inject qilib, qolganini framework’ga qoldirish) `@Res({{ '{' }} passthrough: true {{ '}' }})` decoratorida `passthrough` opsiyasini `true` qiling.

#### Request object

Ko‘pincha handler’lar klientning **request** tafsilotlariga kirishni xohlaydi. Nest (default Express) underlying platform’ning request object’iga kirish imkonini beradi. Request object’ni olish uchun Nest’ga `@Req()` decoratori orqali uni handler signature’iga inject qilishni aytasiz.

```typescript
@@filename(cats.controller)
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
@@switch
import { Controller, Bind, Get, Req } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  @Bind(Req())
  findAll(request) {
    return 'This action returns all cats';
  }
}
```

> info **Hint** `express` typings’dan foydalanish uchun (yuqoridagi `request: Request` parametri misolidagi kabi) `@types/express` paketini o‘rnatilganiga ishonch hosil qiling.

Request object HTTP so‘rovni ifodalaydi va query string, param’lar, HTTP header’lar hamda body uchun property’larni o‘z ichiga oladi (batafsil bu yerda). Ko‘p hollarda bu property’larga qo‘lda kirishingiz shart emas. Buning o‘rniga, `@Body()` yoki `@Query()` kabi dedicated decorator’lardan foydalanishingiz mumkin — ular out of the box mavjud. Quyida taqdim etilgan decorator’lar ro‘yxati va ular mos keladigan platformaga xos object’lar keltirilgan.

<table>
  <tbody>
    <tr>
      <td><code>@Request(), @Req()</code></td>
      <td><code>req</code></td></tr>
    <tr>
      <td><code>@Response(), @Res()</code><span class="table-code-asterisk">*</span></td>
      <td><code>res</code></td>
    </tr>
    <tr>
      <td><code>@Next()</code></td>
      <td><code>next</code></td>
    </tr>
    <tr>
      <td><code>@Session()</code></td>
      <td><code>req.session</code></td>
    </tr>
    <tr>
      <td><code>@Param(key?: string)</code></td>
      <td><code>req.params</code> / <code>req.params[key]</code></td>
    </tr>
    <tr>
      <td><code>@Body(key?: string)</code></td>
      <td><code>req.body</code> / <code>req.body[key]</code></td>
    </tr>
    <tr>
      <td><code>@Query(key?: string)</code></td>
      <td><code>req.query</code> / <code>req.query[key]</code></td>
    </tr>
    <tr>
      <td><code>@Headers(name?: string)</code></td>
      <td><code>req.headers</code> / <code>req.headers[name]</code></td>
    </tr>
    <tr>
      <td><code>@Ip()</code></td>
      <td><code>req.ip</code></td>
    </tr>
    <tr>
      <td><code>@HostParam()</code></td>
      <td><code>req.hosts</code></td>
    </tr>
  </tbody>
</table>

<sup>\* </sup>Underlying HTTP platform’lar (masalan, Express va Fastify) bo‘yicha typings bilan moslik uchun Nest `@Res()` va `@Response()` decoratorlarini beradi. `@Res()` — `@Response()` ning oddiy alias’i. Ikkalasi ham underlying native platform `response` object interface’ini to‘g‘ridan-to‘g‘ri expose qiladi. Ulardan foydalanganda, to‘liq imkoniyatlardan foydalanish uchun underlying kutubxona typings’ini (masalan, `@types/express`) ham import qilishingiz kerak. E’tibor bering: metod handler’da `@Res()` yoki `@Response()` ni inject qilganingizda, Nest shu handler uchun **Library-specific mode**’ga o‘tadi va response’ni boshqarish sizning mas’uliyatingizga aylanadi. Bunda `response` object’ida biror call orqali (masalan, `res.json(...)` yoki `res.send(...)`) response yuborishingiz shart, aks holda HTTP server “osilib qoladi” (hang).

> info **Hint** O‘zingizning custom decorator’laringizni qanday yaratishni bilish uchun [this](/docs/core/custom-decorators) bo‘limiga o‘ting.

#### Resurslar

Avval biz cats resursini olish uchun endpoint (**GET** route) aniqladik. Odatda biz yangi yozuvlar yaratadigan endpoint ham berishni xohlaymiz. Buning uchun **POST** handler yaratamiz:

```typescript
@@filename(cats.controller)
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
@@switch
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create() {
    return 'This action adds a new cat';
  }

  @Get()
  findAll() {
    return 'This action returns all cats';
  }
}
```

Shu qadar oson. Nest barcha standart HTTP metodlar uchun decorator’larni taqdim etadi: `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`, `@Options()`, va `@Head()`. Bundan tashqari, `@All()` ularning barchasini handle qiladigan endpoint’ni aniqlaydi.

#### Route wildcard’lari

NestJS’da pattern-based route’lar ham qo‘llab-quvvatlanadi. Masalan, yulduzcha (`*`) path oxirida wildcard sifatida ishlatilishi va route oxiridagi istalgan belgilar kombinatsiyasini match qilishi mumkin. Quyidagi misolda, `findAll()` metodi `abcd/` bilan boshlanadigan istalgan route uchun ishlaydi — undan keyin nechta belgi kelishi muhim emas.

```typescript
@Get('abcd/*')
findAll() {
  return 'This route uses a wildcard';
}
```

`'abcd/*'` route path `abcd/`, `abcd/123`, `abcd/abc` va hokazolarni match qiladi. Tire ( `-`) va nuqta (`.`) string-based path’larda literal sifatida talqin qilinadi.

Bu yondashuv Express va Fastify’da ishlaydi. Biroq Express’ning eng so‘nggi versiyasi (v5) bilan routing tizimi yanada qat’iy bo‘lib qoldi. Oddiy Express’da route ishlashi uchun named wildcard ishlatishingiz kerak — masalan, `abcd/*splat`, bu yerda `splat` wildcard parameter’ining shunchaki nomi, maxsus ma’noga ega emas. Uni xohlagan nom bilan atashingiz mumkin. Shunga qaramay, Nest Express uchun compatibility layer bergani sababli, siz baribir yulduzcha (`*`)ni wildcard sifatida ishlata olasiz.

Route’ning **o‘rtasida** ishlatiladigan yulduzchalar haqida gapirganda, Express named wildcard’larni talab qiladi (masalan, `ab{{ '{' }}*splat&#125;cd`), Fastify esa umuman bunday holatni qo‘llab-quvvatlamaydi.

#### Status code

Aytilganidek, response’lar uchun default **status code** doimo **200**, faqat POST so‘rovlari uchun default **201** bo‘ladi. Bu xatti-harakatni handler darajasida `@HttpCode(...)` decoratorini qo‘llab oson o‘zgartirish mumkin.

```typescript
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

> info **Hint** `HttpCode` ni `@nestjs/common` paketidan import qiling.

Ko‘pincha status code statik bo‘lmaydi, balki turli omillarga bog‘liq bo‘ladi. Bunday holatda siz library-specific **response** ( `@Res()` orqali inject qilingan) object’dan foydalanishingiz (yoki xato bo‘lsa exception throw qilishingiz) mumkin.

#### Response header’lari

Custom response header berish uchun siz `@Header()` decoratoridan foydalanishingiz yoki library-specific response object’ni ishlatib, `res.header()` ni bevosita chaqirishingiz mumkin.

```typescript
@Post()
@Header('Cache-Control', 'no-store')
create() {
  return 'This action adds a new cat';
}
```

> info **Hint** `Header` ni `@nestjs/common` paketidan import qiling.

#### Redirect

Response’ni ma’lum URL’ga yo‘naltirish uchun `@Redirect()` decoratoridan foydalanishingiz yoki library-specific response object orqali `res.redirect()` ni bevosita chaqirishingiz mumkin.

`@Redirect()` ikki argument qabul qiladi: `url` va `statusCode`, ikkalasi ham ixtiyoriy. `statusCode` default qiymati (agar berilmasa) `302` (`Found`).

```typescript
@Get()
@Redirect('https://nestjs.com', 301)
```

> info **Hint** Ba’zan HTTP status code yoki redirect URL’ni dinamik aniqlash kerak bo‘ladi. Buni `HttpRedirectResponse` interface’iga ( `@nestjs/common` dan) mos object qaytarish orqali bajaring.

Qaytarilgan qiymatlar `@Redirect()` decoratoriga berilgan argumentlarni override qiladi. Masalan:

```typescript
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };
  }
}
```

#### Route parameter’lari

Request tarkibida **dinamik data** qabul qilish kerak bo‘lgan holatlarda statik path’li route’lar ishlamaydi (masalan, id’si `1` bo‘lgan cat’ni olish uchun `GET /cats/1`). Parametrli route’larni aniqlash uchun URL’dagi dinamik qiymatlarni ushlab qolish maqsadida route path’ga route parameter **token**larini qo‘shishingiz mumkin. Quyidagi `@Get()` misolida route parameter tokenidan foydalanish ko‘rsatilgan. So‘ng bu route parameter’larini `@Param()` decoratoridan foydalanib olish mumkin — u metod signature’iga qo‘shiladi.

> info **Hint** Parametrli route’lar statik path’lardan keyin e’lon qilinishi kerak. Bu parameterized path’lar statik path’ga mo‘ljallangan trafikni “olib qo‘yishi”ni oldini oladi.

```typescript
@@filename()
@Get(':id')
findOne(@Param() params: any): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
@@switch
@Get(':id')
@Bind(Param())
findOne(params) {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

`@Param()` decoratori metod parametrini (yuqoridagi misolda `params`) decorate qiladi va route parameter’larini shu decorated metod parametri property’lari sifatida method ichida foydalanish imkonini beradi. Kodingizda ko‘ringanidek, `id` parameter’iga `params.id` orqali murojaat qilasiz. Muqobil tarzda, decoratorga aniq token berib, route parameter’iga nomi bo‘yicha bevosita murojaat qilishingiz mumkin.

> info **Hint** `Param` ni `@nestjs/common` paketidan import qiling.

```typescript
@@filename()
@Get(':id')
findOne(@Param('id') id: string): string {
  return `This action returns a #${id} cat`;
}
@@switch
@Get(':id')
@Bind(Param('id'))
findOne(id) {
  return `This action returns a #${id} cat`;
}
```

#### Sub-domain routing

`@Controller` decoratorida `host` opsiyasini berish mumkin — bu kiruvchi request’larning HTTP host’i ma’lum qiymatga mos kelishini talab qiladi.

```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

> warning **Warning** **Fastify** nested router’larni qo‘llab-quvvatlamagani uchun, sub-domain routing ishlatayotgan bo‘lsangiz, default Express adapter’dan foydalanish tavsiya etiladi.

Route `path` kabi, `host` opsiyasi ham host nomining shu pozitsiyasidagi dinamik qiymatni ushlab qolish uchun tokenlardan foydalanishi mumkin. Quyidagi `@Controller()` misolida host parameter tokenidan foydalanish ko‘rsatilgan. Shu tarzda e’lon qilingan host parameter’lariga `@HostParam()` decoratorini metod signature’iga qo‘shib kirishingiz mumkin.

```typescript
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}
```

#### State sharing

Boshqa dasturlash tillaridan kelgan dasturchilar uchun Nest’da deyarli hamma narsa kiruvchi request’lar o‘rtasida shared ekanini bilish hayratlanarli bo‘lishi mumkin. Bunga database connection pool kabi resurslar, global state’ga ega singleton service’lar va boshqalar kiradi. Muhim jihat shuki, Node.js request/response uchun Multi-Threaded Stateless Model’dan foydalanmaydi — ya’ni har bir request alohida thread’da ishlanmaydi. Natijada, Nest’da singleton instansiyalarni ishlatish ilovalarimiz uchun to‘liq **xavfsiz**.

Shunga qaramay, ba’zi edge case’larda controller’lar uchun request-based lifetime kerak bo‘lishi mumkin. Masalan, GraphQL ilovalarida per-request caching, request tracking yoki multi-tenancy’ni implement qilish. Injection scope’larni boshqarish haqida batafsil bu yerda o‘qing.

#### Asinxronlik

Biz zamonaviy JavaScript’ni, ayniqsa **asynchronous** data handling’ga urg‘u berishini yaxshi ko‘ramiz. Shu sababli Nest `async` funksiyalarni to‘liq qo‘llab-quvvatlaydi. Har bir `async` funksiya `Promise` qaytarishi kerak — bu esa Nest’ga “kechiktirilgan” qiymatni qaytarish imkonini beradi va Nest uni avtomatik resolve qiladi. Masalan:

```typescript
@@filename(cats.controller)
@Get()
async findAll(): Promise<any[]> {
  return [];
}
@@switch
@Get()
async findAll() {
  return [];
}
```

Bu kod to‘liq valid. Biroq Nest bundan ham oldinga o‘tadi: route handler’lar RxJS observable streams qaytarishiga ham ruxsat beradi. Nest subscription’ni ichkarida o‘zi boshqaradi va stream tugagandan so‘ng yakuniy emitted qiymatni resolve qiladi.

```typescript
@@filename(cats.controller)
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
@@switch
@Get()
findAll() {
  return of([]);
}
```

Ikkala yondashuv ham to‘g‘ri — ehtiyojingizga mosini tanlashingiz mumkin.

#### Request payload’lar

Oldingi misolda POST route handler klientdan hech qanday parameter qabul qilmagan edi. Keling, `@Body()` decoratorini qo‘shib buni to‘g‘rilaymiz.

Davom etishdan oldin (agar TypeScript ishlatayotgan bo‘lsangiz), **DTO** (Data Transfer Object) sxemasini aniqlashimiz kerak. DTO — data tarmoq orqali qanday yuborilishini belgilab beradigan object. DTO sxemasini **TypeScript** interface’lari yoki oddiy class’lar orqali aniqlashimiz mumkin. Biroq bu yerda **class**lardan foydalanishni tavsiya qilamiz. Nega? Class’lar JavaScript ES6 standartining bir qismi, shu sababli compile qilingan JavaScript’da real entity sifatida saqlanib qoladi. Aksincha, TypeScript interface’lar transpile jarayonida olib tashlanadi, ya’ni Nest runtime’da ularga murojaat qila olmaydi. Bu muhim, chunki **Pipes** kabi feature’lar runtime’da o‘zgaruvchilarning metatype’iga kirishni talab qiladi — bunga faqat class’lar orqali erishish mumkin.

`CreateCatDto` class’ini yarataylik:

```typescript
@@filename(create-cat.dto)
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

Unda 3 ta oddiy property bor. Endi yaratilgan DTO’ni `CatsController` ichida ishlatamiz:

```typescript
@@filename(cats.controller)
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
@@switch
@Post()
@Bind(Body())
async create(createCatDto) {
  return 'This action adds a new cat';
}
```

> info **Hint** Bizning `ValidationPipe` metod handler’iga kelishi kerak bo‘lmagan property’larni filtrlab tashlashi mumkin. Bu holatda biz acceptable property’larni whitelist qilib qo‘yamiz, whitelist’ga kirmagan property esa natijaviy object’dan avtomatik olib tashlanadi. `CreateCatDto` misolida whitelist — `name`, `age`, va `breed` property’lari. Batafsil [bu yerda](/docs/techniques/validation#stripping-properties).

#### Query parameter’lar

Route’larda query parameter’larni qayta ishlashda ularni kiruvchi request’dan ajratib olish uchun `@Query()` decoratoridan foydalanishingiz mumkin. Keling, amalda qanday ishlashini ko‘ramiz.

Masalan, `age` va `breed` kabi query parameter’lar asosida cats ro‘yxatini filterlashni xohlaymiz. Avval `CatsController` ichida query parameter’larni aniqlaymiz:

```typescript
@@filename(cats.controller)
@Get()
async findAll(@Query('age') age: number, @Query('breed') breed: string) {
  return `This action returns all cats filtered by age: ${age} and breed: ${breed}`;
}
```

Bu misolda, `@Query()` decoratori query string’dan `age` va `breed` qiymatlarini ajratib oladi. Masalan, quyidagi so‘rov:

```plaintext
GET /cats?age=2&breed=Persian
```

natijada `age` = `2` va `breed` = `Persian` bo‘ladi.

Agar ilovangiz yanada murakkab query parameter’larni (masalan, nested object yoki array’lar) qayta ishlashi kerak bo‘lsa:

```plaintext
?filter[where][name]=John&filter[where][age]=30
?item[]=1&item[]=2
```

HTTP adapter’ingizni (Express yoki Fastify) mos query parser’dan foydalanishga sozlashingiz kerak bo‘ladi. Express’da siz `extended` parser’dan foydalanishingiz mumkin — u “boy” (rich) query object’larni qo‘llab-quvvatlaydi:

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.set('query parser', 'extended');
```

Fastify’da `querystringParser` opsiyasidan foydalanishingiz mumkin:

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    querystringParser: (str) => qs.parse(str),
  }),
);
```

> info **Hint** `qs` — nesting va array’larni qo‘llab-quvvatlaydigan querystring parser. Uni `npm install qs` orqali o‘rnatishingiz mumkin.

#### Xatolarni boshqarish

Xatolarni boshqarish (ya’ni exception’lar bilan ishlash) bo‘yicha alohida bo‘lim [bu yerda](/docs/core/exception-filters).

#### To‘liq resurs namunasi

Quyida bir nechta mavjud decorator’lardan foydalanib oddiy controller yaratish misoli keltirilgan. Bu controller ichki data’ga kirish va uni o‘zgartirish uchun bir nechta metodlarni taqdim etadi.

```typescript
@@filename(cats.controller)
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
@@switch
import { Controller, Get, Query, Post, Body, Put, Param, Delete, Bind } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  @Bind(Body())
  create(createCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  @Bind(Query())
  findAll(query) {
    console.log(query);
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  @Bind(Param('id'))
  findOne(id) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  @Bind(Param('id'), Body())
  update(id, updateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  @Bind(Param('id'))
  remove(id) {
    return `This action removes a #${id} cat`;
  }
}
```

> info **Hint** Nest CLI generator (schematic) taqdim etadi va u **barcha boilerplate kodni** avtomatik yaratadi — qo‘lda yozishdan qutqaradi va umumiy developer experience’ni yaxshilaydi. Bu feature haqida batafsil [bu yerda](/docs/recipes/crud-generator).

#### Ishga tushirish

`CatsController` to‘liq aniqlangan bo‘lsa ham, Nest hozircha u haqida bilmaydi va class instansiyasini avtomatik yaratmaydi.

Controllerlar har doim modul tarkibida bo‘lishi shart, shu sababli biz `@Module()` decoratorida `controllers` array’ini ko‘rsatamiz. Root `AppModule`dan boshqa modullarni aniqlamaganimiz uchun, `CatsController`ni ro‘yxatdan o‘tkazish uchun shu moduldan foydalanamiz:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class AppModule {}
```

Biz `@Module()` decoratori orqali modul class’iga metadata biriktirdik, endi Nest qaysi controllerlar mount qilinishi kerakligini oson aniqlay oladi.

#### Library-specific yondashuv

Hozirgacha biz response’larni boshqarishning standart Nest usulini ko‘rib chiqdik. Yana bir yondashuv — kutubxonaga xos response object’dan foydalanish. Aniq response object’ni inject qilish uchun `@Res()` decoratoridan foydalanamiz. Farqlarni ko‘rsatish uchun `CatsController`ni quyidagicha qayta yozamiz:

```typescript
@@filename()
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res: Response) {
     res.status(HttpStatus.OK).json([]);
  }
}
@@switch
import { Controller, Get, Post, Bind, Res, Body, HttpStatus } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  @Bind(Res(), Body())
  create(res, createCatDto) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  @Bind(Res())
  findAll(res) {
     res.status(HttpStatus.OK).json([]);
  }
}
```

Bu yondashuv ishlaydi va response object ustidan to‘liq nazorat (masalan, header’larni boshqarish va kutubxonaga xos feature’lardan foydalanish) berib, ko‘proq moslashuvchanlik taqdim etadi. Biroq undan ehtiyotkorlik bilan foydalanish kerak. Odatda bu usul ancha noaniqroq va ayrim kamchiliklarga ega. Asosiy kamchiligi — kod platformaga bog‘lanib qoladi: turli underlying kutubxonalar response object uchun turlicha API’ga ega bo‘lishi mumkin. Bundan tashqari, test qilish ham qiyinlashadi, chunki response object’ni mock qilish va boshqa ishlar kerak bo‘ladi.

Bundan tashqari, bu yondashuvni ishlatganda Nest’ning standart response handling’iga tayanadigan ayrim feature’lar bilan moslikni yo‘qotasiz, masalan Interceptorlar va `@HttpCode()` / `@Header()` decoratorlari. Buni hal qilish uchun `passthrough` opsiyasini quyidagicha yoqishingiz mumkin:

```typescript
@@filename()
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(HttpStatus.OK);
  return [];
}
@@switch
@Get()
@Bind(Res({ passthrough: true }))
findAll(res) {
  res.status(HttpStatus.OK);
  return [];
}
```

Bu yondashuv bilan siz native response object bilan ishlashingiz mumkin (masalan, muayyan shartlarga ko‘ra cookie yoki header qo‘yish), shu bilan birga qolganini framework’ga boshqartirishda davom etasiz.
