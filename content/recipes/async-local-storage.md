---
title: "Async Local Storage"
navTitle: "Async Local Storage"
description: "AsyncLocalStorage Node.js API ( asynchooks API ga asoslangan) bo'lib, lokal holatni funksiyaga parametr sifatida aniq uzatmasdan butun ilova bo'ylab uzatishning muqobil usulini taq"
order: 1
group: recipes
groupTitle: "Recipes"
---
`AsyncLocalStorage` Node.js API ( `async_hooks` API ga asoslangan) bo'lib, lokal holatni funksiyaga parametr sifatida aniq uzatmasdan butun ilova bo'ylab uzatishning muqobil usulini taqdim etadi. Bu boshqa tillardagi thread-local storage ga o'xshaydi.

Async Local Storage ning asosiy g'oyasi shuki, biz ba'zi funksiyalarni `AsyncLocalStorage#run` chaqirig'i bilan _o'rab_ olamiz. O'ralgan chaqiriq ichida ishga tushadigan barcha kodlar bir xil `store` ga (har bir chaqiriq zanjiri uchun noyob) kirish imkoniga ega bo'ladi.

NestJS kontekstida bu shuni anglatadiki, agar so'rov hayotiy sikli davomida qolgan so'rov kodini o'rashimiz mumkin bo'lgan joyni topsak, faqat o'sha so'rovga ko'rinadigan holatga kirish va uni o'zgartira olamiz, bu esa REQUEST scope dagi providerlar va ularning ba'zi cheklovlariga muqobil bo'lishi mumkin.

Yoki ALS dan tizimning faqat bir qismi uchun (masalan, _transaction_ obyekti) kontekstni, uni servislarda aniq uzatmasdan, tarqatish uchun foydalanishimiz mumkin, bu izolyatsiya va inkapsulyatsiyani oshirishi mumkin.

#### Maxsus implementatsiya

NestJS o'zida `AsyncLocalStorage` uchun hech qanday o'rnatilgan abstraksiyani taqdim etmaydi, shuning uchun butun konsepsiyani yaxshiroq tushunish uchun uni eng sodda HTTP holati uchun qanday o'zimiz implementatsiya qilishimizni ko'rib chiqamiz:

> info **info** Tayyor [maxsus paket](/docs/recipes/async-local-storage#nestjs-cls) uchun pastroqda o'qing.

1. Avval, umumiy manba faylida `AsyncLocalStorage` ning yangi nusxasini yarating. NestJS dan foydalanganimiz sababli, uni maxsus providerga ega modulga aylantiramiz.

```ts
@@filename(als.module)
@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [AsyncLocalStorage],
})
export class AlsModule {}
```
>  info **Hint** `AsyncLocalStorage` `async_hooks` dan import qilinadi.

2. Biz faqat HTTP bilan ishlaymiz, shuning uchun `next` funksiyasini `AsyncLocalStorage#run` bilan o'rash uchun middleware dan foydalanamiz. Middleware so'rov keladigan birinchi nuqta bo'lgani uchun, bu `store` ni barcha enhancerlar va qolgan tizimda mavjud qiladi.

```ts
@@filename(app.module)
@Module({
  imports: [AlsModule],
  providers: [CatsService],
  controllers: [CatsController],
})
export class AppModule implements NestModule {
  constructor(
    // inject the AsyncLocalStorage in the module constructor,
    private readonly als: AsyncLocalStorage
  ) {}

  configure(consumer: MiddlewareConsumer) {
    // bind the middleware,
    consumer
      .apply((req, res, next) => {
        // populate the store with some default values
        // based on the request,
        const store = {
          userId: req.headers['x-user-id'],
        };
        // and pass the "next" function as callback
        // to the "als.run" method together with the store.
        this.als.run(store, () => next());
      })
      .forRoutes('*path');
  }
}
@@switch
@Module({
  imports: [AlsModule],
  providers: [CatsService],
  controllers: [CatsController],
})
@Dependencies(AsyncLocalStorage)
export class AppModule {
  constructor(als) {
    // inject the AsyncLocalStorage in the module constructor,
    this.als = als
  }

  configure(consumer) {
    // bind the middleware,
    consumer
      .apply((req, res, next) => {
        // populate the store with some default values
        // based on the request,
        const store = {
          userId: req.headers['x-user-id'],
        };
        // and pass the "next" function as callback
        // to the "als.run" method together with the store.
        this.als.run(store, () => next());
      })
      .forRoutes('*path');
  }
}
```

3. Endi so'rov hayotiy siklining istalgan joyida lokal store nusxasiga murojaat qilishimiz mumkin.

```ts
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor(
    // We can inject the provided ALS instance.
    private readonly als: AsyncLocalStorage,
    private readonly catsRepository: CatsRepository,
  ) {}

  getCatForUser() {
    // The "getStore" method will always return the
    // store instance associated with the given request.
    const userId = this.als.getStore()["userId"] as number;
    return this.catsRepository.getForUser(userId);
  }
}
@@switch
@Injectable()
@Dependencies(AsyncLocalStorage, CatsRepository)
export class CatsService {
  constructor(als, catsRepository) {
    // We can inject the provided ALS instance.
    this.als = als
    this.catsRepository = catsRepository
  }

  getCatForUser() {
    // The "getStore" method will always return the
    // store instance associated with the given request.
    const userId = this.als.getStore()["userId"] as number;
    return this.catsRepository.getForUser(userId);
  }
}
```

4. Tamom. Endi butun `REQUEST` obyektini inject qilmasdan so'rov bilan bog'liq holatni almashish usuliga egamiz.

> warning **warning** Bu usul ko'plab use-case lar uchun foydali bo'lsa-da, tabiatan kod oqimini yashiradi (implitsit kontekst yaratadi), shuning uchun undan mas'uliyat bilan foydalaning va ayniqsa kontekstual "God objects" yaratishdan saqlaning.

### NestJS CLS

`nestjs-cls` paketi oddiy `AsyncLocalStorage` ishlatishga nisbatan bir nechta DX yaxshilanishlarini taqdim etadi (`CLS` _continuation-local storage_ atamasining qisqartmasi). U implementatsiyani `ClsModule` ga abstraksiyalaydi va `store` ni turli transportlar (faqat HTTP emas) uchun boshlashning turli usullarini hamda qat'iy tiplashni qo'llab-quvvatlaydi.

Store ga keyin injectable `ClsService` yordamida kirish mumkin, yoki uni Proxy Providers orqali biznes mantiqdan to'liq abstraksiyalash mumkin.

> info **info** `nestjs-cls` uchinchi tomon paketi bo'lib, NestJS core jamoasi tomonidan boshqarilmaydi. Kutubxona bilan bog'liq muammolarni tegishli repoda xabar bering.

#### O'rnatish

`@nestjs` kutubxonalariga peer qaramlikdan tashqari, u faqat o'rnatilgan Node.js API dan foydalanadi. Uni boshqa paketlar kabi o'rnating.

```bash
npm i nestjs-cls
```

#### Foydalanish

Yuqorida tasvirlangan [o'xshash funksionallik](/docs/recipes/async-local-storage#maxsus-implementatsiya) ni `nestjs-cls` yordamida quyidagicha amalga oshirish mumkin:

1. `ClsModule` ni ildiz modulga import qiling.

```ts
@@filename(app.module)
@Module({
  imports: [
    // Register the ClsModule,
    ClsModule.forRoot({
      middleware: {
        // automatically mount the
        // ClsMiddleware for all routes
        mount: true,
        // and use the setup method to
        // provide default store values.
        setup: (cls, req) => {
          cls.set('userId', req.headers['x-user-id']);
        },
      },
    }),
  ],
  providers: [CatsService],
  controllers: [CatsController],
})
export class AppModule {}
```

2. So'ng `ClsService` ni store qiymatlariga kirish uchun ishlatish mumkin.

```ts
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor(
    // We can inject the provided ClsService instance,
    private readonly cls: ClsService,
    private readonly catsRepository: CatsRepository,
  ) {}

  getCatForUser() {
    // and use the "get" method to retrieve any stored value.
    const userId = this.cls.get('userId');
    return this.catsRepository.getForUser(userId);
  }
}
@@switch
@Injectable()
@Dependencies(AsyncLocalStorage, CatsRepository)
export class CatsService {
  constructor(cls, catsRepository) {
    // We can inject the provided ClsService instance,
    this.cls = cls
    this.catsRepository = catsRepository
  }

  getCatForUser() {
    // and use the "get" method to retrieve any stored value.
    const userId = this.cls.get('userId');
    return this.catsRepository.getForUser(userId);
  }
}
```

3. `ClsService` boshqaradigan store qiymatlarining qat'iy tiplanishini olish (va string kalitlar uchun auto-suggestion ga ega bo'lish) uchun uni inject qilganda ixtiyoriy `ClsService<MyClsStore>` tip parametridan foydalanishimiz mumkin.

```ts
export interface MyClsStore extends ClsStore {
  userId: number;
}
```

> info **hint** Paketning so'rov ID sini avtomatik generatsiya qilishiga ruxsat berish va keyin `cls.getId()` orqali olish, yoki butun Request obyektini `cls.get(CLS_REQ)` orqali olish ham mumkin.
#### Testlash

`ClsService` shunchaki yana bir injectable provider bo'lgani uchun, uni unit testlarda to'liq mock qilish mumkin.

Ammo ayrim integratsion testlarda haqiqiy `ClsService` implementatsiyasidan foydalanishni xohlashimiz mumkin. Bunday holatda kontekstga bog'liq kod qismini `ClsService#run` yoki `ClsService#runWith` chaqirig'i bilan o'rashimiz kerak bo'ladi.

```ts
describe('CatsService', () => {
  let service: CatsService
  let cls: ClsService
  const mockCatsRepository = createMock<CatsRepository>()

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      // Set up most of the testing module as we normally would.
      providers: [
        CatsService,
        {
          provide: CatsRepository
          useValue: mockCatsRepository
        }
      ],
      imports: [
        // Import the static version of ClsModule which only provides
        // the ClsService, but does not set up the store in any way.
        ClsModule
      ],
    }).compile()

    service = module.get(CatsService)

    // Also retrieve the ClsService for later use.
    cls = module.get(ClsService)
  })

  describe('getCatForUser', () => {
    it('retrieves cat based on user id', async () => {
      const expectedUserId = 42
      mocksCatsRepository.getForUser.mockImplementationOnce(
        (id) => ({ userId: id })
      )

      // Wrap the test call in the `runWith` method
      // in which we can pass hand-crafted store values.
      const cat = await cls.runWith(
        { userId: expectedUserId },
        () => service.getCatForUser()
      )

      expect(cat.userId).toEqual(expectedUserId)
    })
  })
})
```

#### Qo'shimcha ma'lumot

To'liq API hujjatlari va ko'proq kod namunalari uchun NestJS CLS GitHub sahifasi ga tashrif buyuring.
