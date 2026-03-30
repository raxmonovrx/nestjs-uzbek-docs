---
title: "Testing"
navTitle: "Testing"
description: "Avtomatlashtirilgan testlash har qanday jiddiy dasturiy ta'minot ishlab chiqishining muhim qismi hisoblanadi. Avtomatlashtirish ishlab chiqish jarayonida alohida testlarni yoki tes"
order: 12
group: fundamentals
groupTitle: "Fundamentals"
---
Avtomatlashtirilgan testlash har qanday jiddiy dasturiy ta'minot ishlab chiqishining muhim qismi hisoblanadi. Avtomatlashtirish ishlab chiqish jarayonida alohida testlarni yoki test to'plamlarini tez va oson takrorlash imkonini beradi. Bu relizlar sifat va performance maqsadlariga javob berishini ta'minlashga yordam beradi. Avtomatlashtirish qamrovni oshiradi va dasturchilarga tezroq feedback loop taqdim etadi. Avtomatlashtirish alohida dasturchilar unumdorligini oshiradi hamda testlar manba kodini versiya nazoratiga kiritish, funksiyalarni integratsiya qilish va versiya relizi kabi muhim lifecycle nuqtalarida ishga tushirilishini ta'minlaydi.

Bunday testlar odatda turli turlarni qamrab oladi, jumladan unit testlar, end-to-end (e2e) testlar, integratsion testlar va hokazo. Foydalari shubhasiz bo'lsa-da, ularni sozlash zerikarli bo'lishi mumkin. Nest rivojlanishdagi eng yaxshi amaliyotlarni, jumladan samarali testlashni targ'ib qiladi, shuning uchun u dasturchilar va jamoalarga testlarni qurish va avtomatlashtirishda yordam beruvchi quyidagi imkoniyatlarni taqdim etadi. Nest:

- komponentlar uchun default unit testlar va ilovalar uchun e2e testlarni avtomatik scaffold qiladi
- default tooling (masalan, izolyatsiyalangan modul/ilova loaderini quradigan test runner) taqdim etadi
- Jest va Supertest bilan out-of-the-box integratsiya beradi, testlash vositalari bo'yicha agnostik bo'lib qoladi
- Nest dependency injection tizimini test muhitida ham taqdim etadi, komponentlarni oson mock qilish uchun

Aytilganidek, siz xohlagan **testing framework** dan foydalanishingiz mumkin, chunki Nest hech qanday maxsus vositani majburlamaydi. Kerakli elementlarni (masalan, test runner) almashtiring, va siz baribir Nestning tayyor testlash imkoniyatlaridan foydalanasiz.

#### O'rnatish

Boshlash uchun, avval kerakli paketni o'rnating:

```bash
$ npm i --save-dev @nestjs/testing
```

#### Unit testlash

Quyidagi misolda biz ikki sinfni test qilamiz: `CatsController` va `CatsService`. Aytilganidek, Jest default testing framework sifatida taqdim etiladi. U test-runner bo'lib xizmat qiladi va mocking, spying va hokazo uchun assert funksiyalari hamda test-double utilitalarini taqdim etadi. Quyidagi sodda testda biz bu sinflarni qo'lda instansiyalaymiz va controller hamda service o'z API kontraktini bajarayotganini tekshiramiz.

```typescript
@@filename(cats.controller.spec)
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(() => {
    catsService = new CatsService();
    catsController = new CatsController(catsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
@@switch
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController;
  let catsService;

  beforeEach(() => {
    catsService = new CatsService();
    catsController = new CatsController(catsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```

> info **Hint** Test fayllarini test qilinayotgan sinflarga yaqin joylashtiring. Test fayllari `.spec` yoki `.test` suffiksiga ega bo'lishi kerak.

Yuqoridagi namuna trivial bo'lgani uchun, biz Nestga xos narsalarni deyarli test qilmayapmiz. Aslida, biz hatto dependency injectiondan ham foydalanmayapmiz (e'tibor bering, `CatsService` instansiyasini `catsController` ga uzatyapmiz). Bunday testlash shakli - test qilinayotgan sinflarni qo'lda instansiyalash - ko'pincha **isolated testing** deb ataladi, chunki u freymvorkdan mustaqil. Endi Nest imkoniyatlaridan kengroq foydalanadigan ilovalarni testlashda yordam beruvchi biroz ilg'or imkoniyatlarni ko'rib chiqamiz.

#### Testing utilitalari

`@nestjs/testing` paketi yanada mustahkam test jarayonini ta'minlaydigan utilitalar to'plamini taqdim etadi. Oldingi misolni o'rnatilgan `Test` sinfi yordamida qayta yozaylik:

```typescript
@@filename(cats.controller.spec)
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        controllers: [CatsController],
        providers: [CatsService],
      }).compile();

    catsService = moduleRef.get(CatsService);
    catsController = moduleRef.get(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
@@switch
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController;
  let catsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        controllers: [CatsController],
        providers: [CatsService],
      }).compile();

    catsService = moduleRef.get(CatsService);
    catsController = moduleRef.get(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});
```

`Test` sinfi to'liq Nest runtime'ini mocking qiladigan ilova execution contextini taqdim etishda foydalidir, lekin sinf instansiyalarini boshqarish, mock qilish va override qilish uchun qulay hooklarni beradi. `Test` sinfi `createTestingModule()` metodiga ega bo'lib, u modul metadata obyektini argument sifatida qabul qiladi (bu `@Module()` dekoratoriga uzatadigan obyekt bilan bir xil). Bu metod `TestingModule` instansiyasini qaytaradi, u esa bir nechta metodlarni taqdim etadi. Unit testlar uchun eng muhim metod - `compile()`. Bu metod modulni bog'liqliklari bilan birga bootstrap qiladi (xuddi odatdagi `main.ts` faylida `NestFactory.create()` bilan ilovani bootstrapping qilgandek) va testlashga tayyor modulni qaytaradi.

> info **Hint** `compile()` metodi **asinxron**, shuning uchun uni `await` qilish kerak. Modul kompilyatsiya qilingach, `get()` metodi orqali u e'lon qilgan istalgan **statik** instansiyani (controllerlar va provayderlar) olishingiz mumkin.

`TestingModule` module reference sinfidan meros oladi va shuning uchun scoped provayderlarni (transient yoki request-scoped) dinamik yechish imkoniyatiga ega. Buni `resolve()` metodi bilan bajaring (`get()` metodi faqat statik instansiyalarni oladi).

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);
```

> warning **Warning** `resolve()` metodi provayderning noyob instansiyasini, uning **DI container sub-tree** sidan qaytaradi. Har bir sub-tree uchun noyob context identifier bor. Shuning uchun bu metodni bir necha marta chaqirib, instansiya havolalarini solishtirsangiz, ular teng emasligini ko'rasiz.

> info **Hint** Modulga murojaat imkoniyatlari haqida batafsil bu yerda o'qing.

Ishlab chiqarishdagi provayder o'rniga, test uchun custom provider bilan uni override qilishingiz mumkin. Masalan, live bazaga ulanmasdan, ma'lumotlar bazasi servisini mock qilishingiz mumkin. Override'lar keyingi bo'limda ko'rib chiqiladi, ammo ular unit testlar uchun ham mavjud.

#### Auto mocking

Nest shuningdek yetishmayotgan barcha bog'liqliklarga qo'llanadigan mock factory aniqlash imkonini beradi. Bu katta sonli bog'liqliklarga ega sinflarda ularning barchasini mock qilish ko'p vaqt va ko'p sozlash talab qiladigan holatlar uchun foydali. Bu imkoniyatdan foydalanish uchun `createTestingModule()` chaqiruvi `useMocker()` metodi bilan zanjirlanadi va bog'liqlik mocklari uchun factory uzatiladi. Bu factory ixtiyoriy token qabul qilishi mumkin; token - instansiya tokeni bo'lib, Nest provayderi uchun yaroqli bo'lgan istalgan token bo'lishi mumkin, va u mock implementatsiyani qaytaradi. Quyida `jest-mock` yordamida umumiy mocker va `CatsService` uchun `jest.fn()` yordamida maxsus mock yaratish misoli keltirilgan.

```typescript
// ...
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('CatsController', () => {
  let controller: CatsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatsController],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        if (token === CatsService) {
          return { findAll: jest.fn().mockResolvedValue(results) };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockMetadata<
            any,
            any
          >;
          const Mock = moduleMocker.generateFromMetadata(
            mockMetadata,
          ) as ObjectConstructor;
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(CatsController);
  });
});
```

Siz ushbu mocklarni testing konteyneridan odatdagi custom provayderlar kabi `moduleRef.get(CatsService)` bilan ham olishingiz mumkin.

> info **Hint** Umumiy mock factory, masalan `@golevelup/ts-jest` paketidagi `createMock` ham bevosita uzatilishi mumkin.

> info **Hint** `REQUEST` va `INQUIRER` provayderlarini auto-mock qilib bo'lmaydi, chunki ular kontekstda allaqachon aniqlangan. Biroq, ularni custom provayder sintaksisi yoki `.overrideProvider` metodi orqali _override_ qilish mumkin.

#### End-to-end testlash

Unit testlashdan farqli o'laroq, end-to-end (e2e) testlash sinflar va modullar o'zaro ta'sirini ko'proq agregat darajada qamrab oladi -- bu production tizimida oxirgi foydalanuvchilar qanday o'zaro ta'sir qilishiga yaqin. Ilova kattalashgani sari har bir API endpointning end-to-end xatti-harakatini qo'lda testlash qiyinlashadi. Avtomatlashtirilgan end-to-end testlar tizimning umumiy xatti-harakati to'g'ri ekanini va loyiha talablariga javob berishini ta'minlaydi. E2e testlarni bajarish uchun biz hozirgina ko'rib chiqqan **unit testing** dagi konfiguratsiyaga o'xshashini ishlatamiz. Bundan tashqari, Nest HTTP so'rovlarini simulyatsiya qilish uchun Supertest kutubxonasidan foydalanishni osonlashtiradi.

```typescript
@@filename(cats.e2e-spec)
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';

describe('Cats', () => {
  let app: INestApplication;
  let catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
@@switch
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';

describe('Cats', () => {
  let app: INestApplication;
  let catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

> info **Hint** Agar HTTP adapter sifatida [Fastify](/docs/techniques/performance) dan foydalansangiz, u biroz boshqacha konfiguratsiyani talab qiladi va o'zining ichki testing imkoniyatlariga ega:
>
> ```ts
> let app: NestFastifyApplication;
>
> beforeAll(async () => {
>   app = moduleRef.createNestApplication<NestFastifyApplication>(
>     new FastifyAdapter(),
>   );
>
>   await app.init();
>   await app.getHttpAdapter().getInstance().ready();
> });
>
> it(`/GET cats`, () => {
>   return app
>     .inject({
>       method: 'GET',
>       url: '/cats',
>     })
>     .then((result) => {
>       expect(result.statusCode).toEqual(200);
>       expect(result.payload).toEqual(/* expectedPayload */);
>     });
> });
>
> afterAll(async () => {
>   await app.close();
> });
> ```

Ushbu misolda biz oldin ta'riflangan ayrim tushunchalarga tayanganmiz. Oldin ishlatgan `compile()` metodidan tashqari, endi `createNestApplication()` metodidan foydalanib to'liq Nest runtime muhitini instansiyalaymiz.

E'tibor berish kerak bo'lgan bir cheklov shuki, ilova `compile()` metodi yordamida kompilyatsiya qilinganda `HttpAdapterHost#httpAdapter` bu vaqtda `undefined` bo'ladi. Sababi, kompilyatsiya bosqichida HTTP adapter yoki server hali yaratilmagan bo'ladi. Agar test `httpAdapter` ga muhtoj bo'lsa, `createNestApplication()` metodidan foydalanib ilova instansiyasini yarating yoki loyihangizni bog'liqliklar grafini inicializatsiya qilishda bu qaramlikdan qochadigan qilib refaktor qiling.

Yaxshi, endi misolni tahlil qilamiz:

Biz ishlayotgan ilovaga havola olish uchun `app` o'zgaruvchisiga saqlab qo'yamiz, shunda undan HTTP so'rovlarni simulyatsiya qilishda foydalanamiz.

Supertest'dagi `request()` funksiyasi orqali HTTP testlarni simulyatsiya qilamiz. Bu HTTP so'rovlar ishlayotgan Nest ilovasiga yo'naltirilishi kerak, shuning uchun `request()` ga Nestning ostidagi HTTP listenerga havola uzatamiz (u o'z navbatida Express platformasi tomonidan taqdim etilishi mumkin). Shu sababli `request(app.getHttpServer())` konstruktsiyasidan foydalanamiz. `request()` chaqiruvi bizga o'ralgan HTTP Serverni beradi; u endi Nest ilovaga ulangan va real HTTP so'rovni simulyatsiya qilish uchun metodlarni taqdim etadi. Masalan, `request(...).get('/cats')` chaqiruvi tarmoq orqali kelgan **real** HTTP so'rovga xuddi shunday bo'lgan Nest ilovasiga so'rovni boshlaydi.

Ushbu misolda biz `CatsService` ning muqobil (test-double) implementatsiyasini ham taqdim etamiz; u test qilib ko'rishimiz mumkin bo'lgan hard-coded qiymatni qaytaradi. Bunday muqobil implementatsiyani berish uchun `overrideProvider()` dan foydalaning. Xuddi shuningdek, Nest `overrideModule()`, `overrideGuard()`, `overrideInterceptor()`, `overrideFilter()` va `overridePipe()` metodlari bilan modullar, guardlar, interceptorlar, filterlar va pipe'larni override qilish imkonini beradi.

Har bir override metodi (`overrideModule()` dan tashqari) custom providers da ta'riflanganlarga mos 3 xil metodga ega obyektni qaytaradi:

- `useClass`: instansiya taqdim etish uchun instansiyalanadigan sinfni berasiz (provider, guard va hokazo obyektni override qiladi).
- `useValue`: obyektni override qiladigan instansiyani berasiz.
- `useFactory`: obyektni override qiladigan instansiyani qaytaradigan funksiyani berasiz.

Boshqa tomondan, `overrideModule()` `useModule()` metodiga ega obyektni qaytaradi, u bilan original modulni override qiladigan modulni berishingiz mumkin, quyidagicha:

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(CatsModule)
  .useModule(AlternateCatsModule)
  .compile();
```

Har bir override metodi turi o'z navbatida `TestingModule` instansiyasini qaytaradi va shuning uchun u boshqa metodlar bilan fluent uslubda zanjirlanishi mumkin. Bunday zanjir oxirida `compile()` ni chaqirish kerak, shunda Nest modulni instansiyalaydi va inicializatsiya qiladi.

Shuningdek, ba'zida testlar ishlayotganida (masalan, CI serverda) maxsus logger taqdim etishni xohlashingiz mumkin. `setLogger()` metodidan foydalaning va testlar paytida loglash qanday bo'lishini `LoggerService` interfeysiga mos obyektni uzatib ko'rsating (standart holatda faqat "error" loglar konsolga chiqariladi).

Kompilyatsiya qilingan modul bir nechta foydali metodlarga ega, ular quyidagi jadvalda ta'riflangan:

<table>
  <tr>
    <td>
      <code>createNestApplication()</code>
    </td>
    <td>
      Berilgan modul asosida Nest ilovasini yaratadi va qaytaradi (<code>INestApplication</code> instansiyasi).
      E'tibor bering, ilovani <code>init()</code> metodi yordamida qo'lda inicializatsiya qilishingiz kerak.
    </td>
  </tr>
  <tr>
    <td>
      <code>createNestMicroservice()</code>
    </td>
    <td>
      Berilgan modul asosida Nest mikroservisini yaratadi va qaytaradi (<code>INestMicroservice</code> instansiyasi).
    </td>
  </tr>
  <tr>
    <td>
      <code>get()</code>
    </td>
    <td>
      Ilova kontekstida mavjud bo'lgan controller yoki provayderning (jumladan guardlar, filterlar va hokazo) statik instansiyasini oladi. module reference sinfidan meros olingan.
    </td>
  </tr>
  <tr>
     <td>
      <code>resolve()</code>
    </td>
    <td>
      Ilova kontekstida mavjud bo'lgan controller yoki provayderning (jumladan guardlar, filterlar va hokazo) dinamik yaratilgan scoped instansiyasini (request yoki transient) oladi. module reference sinfidan meros olingan.
    </td>
  </tr>
  <tr>
    <td>
      <code>select()</code>
    </td>
    <td>
      Modulning dependency graph'i bo'ylab navigatsiya qiladi; tanlangan moduldan aniq instansiyani olish uchun ishlatiladi (`get()` metodida strict mode (<code>strict: true</code>) bilan birga ishlatiladi).
    </td>
  </tr>
</table>

> info **Hint** E2e test fayllarini `test` katalogida saqlang. Test fayllari `.e2e-spec` suffiksiga ega bo'lishi kerak.

#### Global ro'yxatdan o'tkazilgan enhancerlarni override qilish

Agar sizda global ro'yxatdan o'tkazilgan guard (yoki pipe, interceptor, yoki filter) bo'lsa, bu enhancerni override qilish uchun yana bir nechta qadam bajarish kerak bo'ladi. Qisqacha eslatma: original ro'yxatdan o'tkazish quyidagicha:

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

Bu guardni `APP_*` token orqali "multi"-provider sifatida ro'yxatdan o'tkazadi. Bu joyda `JwtAuthGuard` ni almashtirish uchun ro'yxatdan o'tkazish shu slotda mavjud provayderdan foydalanishi kerak:

```typescript
providers: [
  {
    provide: APP_GUARD,
    useExisting: JwtAuthGuard,
    // ^^^^^^^^ notice the use of 'useExisting' instead of 'useClass'
  },
  JwtAuthGuard,
],
```

> info **Hint** `useClass` o'rniga `useExisting` ni qo'llang, shunda Nest token ortida instansiya yaratish o'rniga ro'yxatdan o'tgan provayderga havola qiladi.

Endi `JwtAuthGuard` Nest uchun oddiy provayder sifatida ko'rinadi va `TestingModule` yaratishda override qilinishi mumkin:

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useClass(MockAuthGuard)
  .compile();
```

Endi barcha testlaringiz har bir so'rovda `MockAuthGuard` ni ishlatadi.

#### Request-scoped instansiyalarni testlash

Request-scoped provayderlar har bir kiruvchi **so'rov** uchun alohida yaratiladi. So'rov qayta ishlanishi tugagach, instansiya garbage-collected bo'ladi. Bu muammo tug'diradi, chunki test qilinayotgan so'rov uchun maxsus yaratilgan dependency injection sub-tree'ga kira olmaymiz.

Yuqoridagi bo'limlarga asoslanib, `resolve()` metodi dinamik instansiyalangan sinfni olish uchun ishlatilishi mumkinligini bilamiz. Shuningdek, bu yerda aytilganidek, DI container sub-tree'ning lifecycle'ini boshqarish uchun noyob context identifier uzatishimiz mumkinligini bilamiz. Buni test kontekstida qanday ishlatamiz?

Strategiya shundaki, oldindan context identifier yaratib, Nestni barcha kiruvchi so'rovlar uchun aynan shu IDdan sub-tree yaratishga majbur qilamiz. Shu tarzda test qilinayotgan so'rov uchun yaratilgan instansiyalarga kira olamiz.

Buni amalga oshirish uchun `ContextIdFactory` ga `jest.spyOn()` ni qo'llang:

```typescript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);
```

Endi `contextId` yordamida keyingi har qanday so'rov uchun bitta yaratilgan DI container sub-tree'ga kirishimiz mumkin.

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);
```
