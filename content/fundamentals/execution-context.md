---
title: "Execution context"
navTitle: "Execution context"
description: "Nest bir nechta ilova kontekstlari bo'ylab ishlaydigan ilovalarni yozishni osonlashtiradigan bir qator yordamchi sinflarni taqdim etadi (masalan, Nest HTTP serveriga asoslangan, mi"
order: 6
group: fundamentals
groupTitle: "Fundamentals"
---
Nest bir nechta ilova kontekstlari bo'ylab ishlaydigan ilovalarni yozishni osonlashtiradigan bir qator yordamchi sinflarni taqdim etadi (masalan, Nest HTTP serveriga asoslangan, mikroservis va WebSockets ilova kontekstlari). Bu utilitalar joriy execution context haqida ma'lumot beradi va shu ma'lumotlar yordamida turli controllerlar, metodlar va execution contextlar bo'ylab ishlay oladigan umumiy [guards](/docs/core/guards), [filters](/docs/core/exception-filters) va [interceptors](/docs/core/interceptors) yaratish mumkin.

Ushbu bobda shunday ikki sinfni ko'rib chiqamiz: `ArgumentsHost` va `ExecutionContext`.

#### ArgumentsHost sinfi

`ArgumentsHost` sinfi handlerga uzatilayotgan argumentlarni olish uchun metodlar taqdim etadi. U argumentlarni olish uchun mos kontekstni (masalan, HTTP, RPC (mikroservis) yoki WebSockets) tanlash imkonini beradi. Freymvork `ArgumentsHost` instansiyasini, odatda `host` parametri sifatida, unga kirish kerak bo'lishi mumkin bo'lgan joylarda taqdim etadi. Masalan, [exception filter](/docs/core/exception-filters#arguments-host) dagi `catch()` metodi `ArgumentsHost` instansiyasi bilan chaqiriladi.

`ArgumentsHost` shunchaki handler argumentlari ustidagi abstraksiyadir. Masalan, HTTP server ilovalari uchun (`@nestjs/platform-express` ishlatilganda) `host` obyekti Expressning `[request, response, next]` massivini kapsullaydi; bu yerda `request` - so'rov obyekti, `response` - javob obyekti, `next` esa ilovaning request-response siklini boshqaradigan funksiya. Boshqa tomondan, [GraphQL](/docs/graphql/quick-start) ilovalari uchun `host` obyekti `[root, args, context, info]` massivini o'z ichiga oladi.

#### Joriy ilova konteksti

Bir nechta ilova kontekstlarida ishlashi kerak bo'lgan umumiy [guards](/docs/core/guards), [filters](/docs/core/exception-filters) va [interceptors](/docs/core/interceptors) ni yaratishda, metodimiz hozir qaysi ilova turida ishlayotganini aniqlash usuliga muhtojmiz. Buni `ArgumentsHost` ning `getType()` metodi orqali qilamiz:

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}
```

> info **Hint** `GqlContextType` `@nestjs/graphql` paketidan import qilinadi.

Ilova turi ma'lum bo'lganda, quyida ko'rsatilgandek, yanada umumiy komponentlarni yozishimiz mumkin.

#### Host handler argumentlari

Handlerga uzatilayotgan argumentlar massivini olish uchun bir yondashuv - `host` obyektining `getArgs()` metodidan foydalanish.

```typescript
const [req, res, next] = host.getArgs();
```

`getArgByIndex()` metodi yordamida indeks bo'yicha muayyan argumentni ajratib olish mumkin:

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);
```

Bu misollarda biz request va response obyektlarini indeks bo'yicha oldik, bu odatda tavsiya etilmaydi, chunki u ilovani muayyan execution contextga bog'lab qo'yadi. Buning o'rniga, `host` obyektining mos ilova kontekstiga o'tuvchi utilita metodlaridan foydalanib kodingizni yanada mustahkam va qayta foydalaniladigan qilishingiz mumkin. Kontekstni almashtirish utilita metodlari quyida ko'rsatilgan.

```typescript
/**
 * Switch context to RPC.
 */
switchToRpc(): RpcArgumentsHost;
/**
 * Switch context to HTTP.
 */
switchToHttp(): HttpArgumentsHost;
/**
 * Switch context to WebSockets.
 */
switchToWs(): WsArgumentsHost;
```

Keling, oldingi misolni `switchToHttp()` metodi yordamida qayta yozamiz. `host.switchToHttp()` yordamchi chaqiruv HTTP ilova kontekstiga mos bo'lgan `HttpArgumentsHost` obyektini qaytaradi. `HttpArgumentsHost` obyektida kerakli obyektlarni ajratib olish uchun ikkita foydali metod mavjud. Bu holatda native Express tiplangan obyektlarni qaytarish uchun Express type assertionsdan ham foydalanamiz:

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();
```

Xuddi shunday, `WsArgumentsHost` va `RpcArgumentsHost` mikroservis va WebSockets kontekstlarida mos obyektlarni qaytaradigan metodlarga ega. Quyida `WsArgumentsHost` metodlari:

```typescript
export interface WsArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;
  /**
   * Returns the client object.
   */
  getClient<T>(): T;
}
```

Quyida `RpcArgumentsHost` metodlari:

```typescript
export interface RpcArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;

  /**
   * Returns the context object.
   */
  getContext<T>(): T;
}
```

#### ExecutionContext sinfi

`ExecutionContext` `ArgumentsHost` ni kengaytirib, joriy bajarilish jarayoni haqida qo'shimcha tafsilotlarni taqdim etadi. `ArgumentsHost` kabi, Nest `ExecutionContext` instansiyasini kerak bo'lishi mumkin bo'lgan joylarda taqdim etadi, masalan [guard](/docs/core/guards#execution-context) dagi `canActivate()` metodida va [interceptor](/docs/core/interceptors#execution-context) dagi `intercept()` metodida. U quyidagi metodlarni taqdim etadi:

```typescript
export interface ExecutionContext extends ArgumentsHost {
  /**
   * Returns the type of the controller class which the current handler belongs to.
   */
  getClass<T>(): Type<T>;
  /**
   * Returns a reference to the handler (method) that will be invoked next in the
   * request pipeline.
   */
  getHandler(): Function;
}
```

`getHandler()` metodi tez orada chaqiriladigan handlerga havola qaytaradi. `getClass()` metodi esa ushbu handler tegishli bo'lgan `Controller` sinfining turini qaytaradi. Masalan, HTTP kontekstida agar hozir qayta ishlanayotgan so'rov `CatsController` dagi `create()` metodiga bog'langan `POST` so'rov bo'lsa, `getHandler()` `create()` metodiga havola, `getClass()` esa `CatsController` **sinfini** (instansiyani emas) qaytaradi.

```typescript
const methodKey = ctx.getHandler().name; // "create"
const className = ctx.getClass().name; // "CatsController"
```

Joriy sinf va handler metodiga havola olish imkoniyati katta moslashuvchanlik beradi. Eng muhimi, bu bizga guardlar yoki interceptorlar ichida `Reflector#createDecorator` orqali yaratilgan dekoratorlar yoki o'rnatilgan `@SetMetadata()` dekoratori orqali o'rnatilgan metadatalarga kirish imkonini beradi. Bu use-case'ni quyida ko'rib chiqamiz.

#### Reflection va metadata

Nest `Reflector#createDecorator` metodi orqali yaratilgan dekoratorlar va o'rnatilgan `@SetMetadata()` dekoratori yordamida route handlerlarga **custom metadata** biriktirish imkonini beradi. Bu bo'limda ikkala yondashuvni solishtiramiz va guard yoki interceptor ichidan metadatalarga qanday kirishni ko'ramiz.

`Reflector#createDecorator` yordamida kuchli tiplangan dekoratorlar yaratish uchun tip argumentini ko'rsatishimiz kerak. Masalan, `Roles` dekoratorini yaratamiz, u argument sifatida satrlar massivi oladi.

```ts
@@filename(roles.decorator)
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
```

Bu yerda `Roles` dekoratori `string[]` tipidagi bitta argument qabul qiladigan funksiya.

Endi bu dekoratordan foydalanish uchun handlerni shunchaki unga annotatsiya qilamiz:

```typescript
@@filename(cats.controller)
@Post()
@Roles(['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@Roles(['admin'])
@Bind(Body())
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

Bu yerda `Roles` dekoratori metadatasini `create()` metodiga biriktirdik, ya'ni faqat `admin` roliga ega foydalanuvchilar ushbu route'ga kirishi kerakligini ko'rsatdik.

Marshrutning roli(lar)i (custom metadata) ga kirish uchun yana `Reflector` yordamchi sinfidan foydalanamiz. `Reflector` odatiy tarzda sinfga in'eksiya qilinishi mumkin:

```typescript
@@filename(roles.guard)
@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
@@switch
@Injectable()
@Dependencies(Reflector)
export class CatsService {
  constructor(reflector) {
    this.reflector = reflector;
  }
}
```

> info **Hint** `Reflector` sinfi `@nestjs/core` paketidan import qilinadi.

Endi handler metadatasini o'qish uchun `get()` metodidan foydalanamiz:

```typescript
const roles = this.reflector.get(Roles, context.getHandler());
```

`Reflector#get` metodi metadatalarga oson kirish imkonini beradi: unga ikkita argument uzatamiz - dekorator havolasi va metadata olinadigan **kontekst** (dekorator maqsadi). Bu misolda ko'rsatilgan **dekorator** `Roles` (yuqoridagi `roles.decorator.ts` fayliga qayting). Kontekst `context.getHandler()` chaqiruviga bog'liq, bu hozir qayta ishlanayotgan route handler uchun metadatalarni ajratib olishga olib keladi. Esda tuting, `getHandler()` route handler funksiyasiga **havola** beradi.

Muqobil ravishda, controller ichidagi barcha route'lar uchun metadata qo'llash maqsadida metadata'ni controller darajasida joylashtirishimiz mumkin.

```typescript
@@filename(cats.controller)
@Roles(['admin'])
@Controller('cats')
export class CatsController {}
@@switch
@Roles(['admin'])
@Controller('cats')
export class CatsController {}
```

Bu holatda controller metadatasini ajratib olish uchun ikkinchi argument sifatida `context.getHandler()` o'rniga `context.getClass()` uzatiladi (metadata ajratib olish uchun controller sinfini kontekst sifatida berish uchun):

```typescript
@@filename(roles.guard)
const roles = this.reflector.get(Roles, context.getClass());
```

Metadata'ni bir nechta darajada berish imkoniyati bo'lgani uchun, sizga bir nechta kontekstlardan metadata'ni ajratib olib, birlashtirish kerak bo'lishi mumkin. `Reflector` sinfi bunga yordam beradigan ikkita utilita metodni taqdim etadi. Bu metodlar **ham** controller, **ham** metod metadatasini bir vaqtda ajratib olib, ularni turli usullarda birlashtiradi.

Quyidagi scenariyni ko'rib chiqing, bunda `Roles` metadatasi ikkala darajada ham berilgan.

```typescript
@@filename(cats.controller)
@Roles(['user'])
@Controller('cats')
export class CatsController {
  @Post()
  @Roles(['admin'])
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}
@@switch
@Roles(['user'])
@Controller('cats')
export class CatsController {}
  @Post()
  @Roles(['admin'])
  @Bind(Body())
  async create(createCatDto) {
    this.catsService.create(createCatDto);
  }
}
```

Agar niyatingiz `'user'` ni default rol sifatida berish va ayrim metodlar uchun uni selektiv tarzda override qilish bo'lsa, ehtimol `getAllAndOverride()` metodidan foydalanasiz.

```typescript
const roles = this.reflector.getAllAndOverride(Roles, [context.getHandler(), context.getClass()]);
```

Ushbu kodga ega guard `create()` metodi kontekstida yuqoridagi metadata bilan ishlaganda, `roles` `['admin']` ni o'z ichiga oladi.

Har ikkala metadatani olib, ularni birlashtirish uchun (bu metod massivlar va obyektlarning ikkalasini ham birlashtiradi) `getAllAndMerge()` metodidan foydalaning:

```typescript
const roles = this.reflector.getAllAndMerge(Roles, [context.getHandler(), context.getClass()]);
```

Bu holatda `roles` `['user', 'admin']` ni o'z ichiga oladi.

Bu ikki merge metodida ham birinchi argument sifatida metadata key, ikkinchi argument sifatida metadata target kontekstlari massivi (ya'ni `getHandler()` va/yoki `getClass()` chaqiruvlari) uzatiladi.

#### Past darajadagi yondashuv

Avval aytilganidek, `Reflector#createDecorator` o'rniga o'rnatilgan `@SetMetadata()` dekoratoridan ham foydalanib handlerga metadata biriktirishingiz mumkin.

```typescript
@@filename(cats.controller)
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@SetMetadata('roles', ['admin'])
@Bind(Body())
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

> info **Hint** `@SetMetadata()` dekoratori `@nestjs/common` paketidan import qilinadi.

Yuqoridagi konstruktsiya bilan biz `roles` metadatasini (`roles` - metadata key, `['admin']` - tegishli qiymat) `create()` metodiga biriktirdik. Bu ishlaydi, ammo route'larda `@SetMetadata()` dan bevosita foydalanish yaxshi amaliyot emas. Buning o'rniga, quyida ko'rsatilganidek, o'z dekoratorlaringizni yarating:

```typescript
@@filename(roles.decorator)
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
@@switch
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles) => SetMetadata('roles', roles);
```

Bu yondashuv ancha toza va o'qilishi oson, va qisman `Reflector#createDecorator` yondashuviga o'xshaydi. Farqi shundaki, `@SetMetadata` bilan metadata key va qiymatini ko'proq boshqarasiz, shuningdek bir nechta argument qabul qiladigan dekoratorlar yaratishingiz mumkin.

Endi bizda maxsus `@Roles()` dekoratori bor, uni `create()` metodini bezash uchun ishlatishimiz mumkin.

```typescript
@@filename(cats.controller)
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@Roles('admin')
@Bind(Body())
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

Marshrutning roli(lar)i (custom metadata) ga kirish uchun yana `Reflector` yordamchi sinfidan foydalanamiz:

```typescript
@@filename(roles.guard)
@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
@@switch
@Injectable()
@Dependencies(Reflector)
export class CatsService {
  constructor(reflector) {
    this.reflector = reflector;
  }
}
```

> info **Hint** `Reflector` sinfi `@nestjs/core` paketidan import qilinadi.

Endi handler metadatasini o'qish uchun `get()` metodidan foydalanamiz.

```typescript
const roles = this.reflector.get<string[]>('roles', context.getHandler());
```

Bu yerda dekorator havolasi o'rniga metadata **key** ini birinchi argument sifatida uzatamiz (bizning holatda bu `'roles'`). Qolgan hamma narsa `Reflector#createDecorator` misolidagi kabi.
