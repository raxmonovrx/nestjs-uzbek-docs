---
title: "Modulga murojaat"
navTitle: "Modulga murojaat"
description: "Nest provayderlarning ichki ro'yxatini ko'rib chiqish va in'eksiya tokeni bo'yicha istalgan provayderga havola olish uchun ModuleRef sinfini taqdim etadi. ModuleRef sinfi statik va"
order: 9
group: fundamentals
groupTitle: "Fundamentals"
---
Nest provayderlarning ichki ro'yxatini ko'rib chiqish va in'eksiya tokeni bo'yicha istalgan provayderga havola olish uchun `ModuleRef` sinfini taqdim etadi. `ModuleRef` sinfi statik va scoped provayderlarni dinamik instansiyalash yo'lini ham taqdim etadi. `ModuleRef` ni odatdagi tarzda sinfga in'eksiya qilish mumkin:

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}
@@switch
@Injectable()
@Dependencies(ModuleRef)
export class CatsService {
  constructor(moduleRef) {
    this.moduleRef = moduleRef;
  }
}
```

> info **Hint** `ModuleRef` sinfi `@nestjs/core` paketidan import qilinadi.

#### Instansiyalarni olish

`ModuleRef` instansiyasi (keyingi o'rinlarda **modulga murojaat** deb ataymiz) `get()` metodiga ega. Standart holatda bu metod *joriy modul*da ro'yxatdan o'tgan va instansiyalangan provayderni, controllerni yoki injectable ni (masalan, guard, interceptor va hokazo) uning in'eksiya tokeni/sinf nomi bo'yicha qaytaradi. Agar instansiya topilmasa, istisno tashlanadi.

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
@@switch
@Injectable()
@Dependencies(ModuleRef)
export class CatsService {
  constructor(moduleRef) {
    this.moduleRef = moduleRef;
  }

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}
```

> warning **Warning** `get()` metodi bilan scoped provayderlarni (transient yoki request-scoped) olish mumkin emas. Buning o'rniga, quyida ta'riflangan usuldan foydalaning. Scope'larni qanday boshqarishni bu yerda bilib oling.

Global kontekstdan provayderni olish uchun (masalan, provayder boshqa modulda in'eksiya qilingan bo'lsa), `get()` metodining ikkinchi argumenti sifatida `{{ '{' }} strict: false {{ '}' }}` opsiyasini uzating.

```typescript
this.moduleRef.get(Service, { strict: false });
```

#### Scoped provayderlarni yechish

Scoped provayderni (transient yoki request-scoped) dinamik yechish uchun `resolve()` metodidan foydalaning va provayderning in'eksiya tokenini argument sifatida uzating.

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}
@@switch
@Injectable()
@Dependencies(ModuleRef)
export class CatsService {
  constructor(moduleRef) {
    this.moduleRef = moduleRef;
  }

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}
```

`resolve()` metodi provayderning noyob instansiyasini, uning **DI container sub-tree** sidan qaytaradi. Har bir sub-tree uchun noyob **context identifier** mavjud. Shuning uchun bu metodni bir necha marta chaqirib, instansiya havolalarini solishtirsangiz, ular teng emasligini ko'rasiz.

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}
@@switch
@Injectable()
@Dependencies(ModuleRef)
export class CatsService {
  constructor(moduleRef) {
    this.moduleRef = moduleRef;
  }

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}
```

Bir nechta `resolve()` chaqiruvlari bo'ylab bitta instansiyani generatsiya qilish va ular bir xil DI container sub-tree'ni bo'lishishini ta'minlash uchun `resolve()` metodiga context identifier uzatishingiz mumkin. Context identifier generatsiya qilish uchun `ContextIdFactory` sinfidan foydalaning. Bu sinf mos noyob identifikator qaytaradigan `create()` metodini taqdim etadi.

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}
@@switch
@Injectable()
@Dependencies(ModuleRef)
export class CatsService {
  constructor(moduleRef) {
    this.moduleRef = moduleRef;
  }

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}
```

> info **Hint** `ContextIdFactory` sinfi `@nestjs/core` paketidan import qilinadi.

#### `REQUEST` provayderini ro'yxatdan o'tkazish

`ContextIdFactory.create()` bilan qo'lda yaratilgan context identifierlar DI sub-tree'larini ifodalaydi, ularda `REQUEST` provayderi `undefined` bo'ladi, chunki ular Nest dependency injection tizimi tomonidan instansiyalanmaydi va boshqarilmaydi.

Qo'lda yaratilgan DI sub-tree uchun maxsus `REQUEST` obyektini ro'yxatdan o'tkazish uchun `ModuleRef#registerRequestByContextId()` metodidan foydalaning, quyidagicha:

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);
```

#### Joriy sub-tree ni olish

Ba'zan **request context** ichida request-scoped provayder instansiyasini yechishingiz kerak bo'lishi mumkin. Masalan, `CatsService` request-scoped va siz `CatsRepository` instansiyasini yechmoqchisiz, u ham request-scoped provayder sifatida belgilangan. Bir xil DI container sub-tree'ni bo'lishish uchun yangi context identifier yaratish o'rniga (masalan, yuqorida ko'rsatilgandek `ContextIdFactory.create()` bilan), joriy context identifierni olish kerak. Joriy context identifierni olish uchun `@Inject()` dekoratori yordamida request obyektini in'eksiya qilishdan boshlang.

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}
@@switch
@Injectable()
@Dependencies(REQUEST)
export class CatsService {
  constructor(request) {
    this.request = request;
  }
}
```

> info **Hint** Request provayderi haqida batafsil bu yerda o'qing.

Endi `ContextIdFactory` sinfining `getByRequest()` metodidan foydalanib request obyektiga asoslangan context id yarating va buni `resolve()` chaqiruviga uzating:

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);
```

#### Maxsus sinflarni dinamik instansiyalash

Avval **provayder** sifatida ro'yxatdan o'tkazilmagan sinfni dinamik instansiyalash uchun modulga murojaatning `create()` metodidan foydalaning.

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}
@@switch
@Injectable()
@Dependencies(ModuleRef)
export class CatsService {
  constructor(moduleRef) {
    this.moduleRef = moduleRef;
  }

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}
```

Bu texnika freymvork konteyneridan tashqarida turli sinflarni shartli instansiyalashga imkon beradi.
