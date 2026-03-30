---
title: "So'rovlar tezligini cheklash"
navTitle: "So'rovlar tezligini cheklash"
description: "Ilovalarni brute-force hujumlardan himoyalashning keng tarqalgan usuli - rate-limiting. Boshlash uchun @nestjs/throttler paketini o'rnatishingiz kerak."
order: 7
group: security
groupTitle: "Security"
---
Ilovalarni brute-force hujumlardan himoyalashning keng tarqalgan usuli - **rate-limiting**. Boshlash uchun `@nestjs/throttler` paketini o'rnatishingiz kerak.

```bash
$ npm i --save @nestjs/throttler
```

O'rnatish tugagach, `ThrottlerModule` ni boshqa Nest paketlari kabi `forRoot` yoki `forRootAsync` metodlari bilan sozlashingiz mumkin.

```typescript
@@filename(app.module)
@Module({
  imports: [
     ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
})
export class AppModule {}
```

Yuqoridagi sozlama `ttl` (millisekundlarda yashash vaqti) va `limit` (ttl ichidagi maksimal so'rovlar soni) bo'yicha global opsiyalarni belgilaydi; ular guard bilan himoyalangan ilova routelarida qo'llanadi.

Modul import qilingach, `ThrottlerGuard` ni qanday bog'lashni tanlashingiz mumkin. [guards](/docs/core/guards) bo'limida aytilgan har qanday bog'lash turi mos keladi. Masalan, guardni global bog'lamoqchi bo'lsangiz, quyidagi providerni istalgan modulga qo'shishingiz mumkin:

```typescript
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard
}
```

#### Bir nechta Throttler ta'riflari

Ba'zi holatlarda bir nechta throttling ta'riflarini sozlamoqchi bo'lishingiz mumkin, masalan soniyada 3 tadan ortiq bo'lmasin, 10 soniyada 20 tadan ortiq bo'lmasin va bir daqiqada 100 tadan ortiq bo'lmasin. Buni amalga oshirish uchun ta'riflaringizni nomlangan opsiyalar bilan massivga joylashingiz mumkin, keyinchalik esa `@SkipThrottle()` va `@Throttle()` dekoratorlarida bu nomlarga murojaat qilib opsiyalarni yana o'zgartirasiz.

```typescript
@@filename(app.module)
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
  ],
})
export class AppModule {}
```

#### Moslashtirish

Ba'zan guardni controllerga yoki global darajada bog'lab, lekin bir yoki bir nechta endpointlar uchun rate limitingni o'chirmoqchi bo'lishingiz mumkin. Buning uchun `@SkipThrottle()` dekoratoridan foydalanib, butun klass yoki bitta routening throttlerini inkor qilasiz. `@SkipThrottle()` dekoratori string kalitlari va boolean qiymatlaridan iborat obyektni ham qabul qilishi mumkin; bu controllerning _aksariyat_ qismini istisno qilib, hammasini emas, va bir nechta throttler bo'lsa, ularni alohida sozlash uchun kerak bo'ladi. Agar obyekt bermasangiz, default qiymat `{{ '{' }} default: true {{ '}' }}` bo'ladi.

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {}
```

Bu `@SkipThrottle()` dekoratori route yoki klassni o'tkazib yuborish, yoki klass bo'ylab skip qilingan route ichidagi aniq routeda skipni bekor qilish uchun ishlatiladi.

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {
  // Rate limiting is applied to this route.
  @SkipThrottle({ default: false })
  dontSkip() {
    return 'List users work with Rate limiting.';
  }
  // This route will skip rate limiting.
  doSkip() {
    return 'List users work without Rate limiting.';
  }
}
```

Shuningdek, global modulda o'rnatilgan `limit` va `ttl` ni qattiqroq yoki yumshoqroq qilish uchun `@Throttle()` dekoratoridan foydalanishingiz mumkin. Bu dekorator klassda ham, funksiyada ham ishlatiladi. 5-versiyadan boshlab dekorator throttler to'plami nomiga mos string va `limit`/`ttl` kalitlariga ega integer qiymatli obyektni qabul qiladi, xuddi root modulga uzatiladigan opsiyalar kabi. Agar original opsiyalarda nom berilmagan bo'lsa, `default` stringidan foydalaning. Uni quyidagicha sozlashingiz kerak:

```typescript
// Override default configuration for Rate limiting and duration.
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Get()
findAll() {
  return "List users works with custom rate limiting.";
}
```

#### Proksilar

Agar ilovangiz proksi server ortida ishlayotgan bo'lsa, HTTP adapterda proksiga ishonishni sozlash muhim. `trust proxy` sozlamasini yoqish uchun Express va Fastify uchun mos HTTP adapter opsiyalariga qarang.

Quyida Express adapteri uchun `trust proxy` ni yoqish misoli keltirilgan:

```typescript
@@filename(main)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address
  await app.listen(3000);
}

bootstrap();
@@switch
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address
  await app.listen(3000);
}

bootstrap();
```

`trust proxy`ni yoqish `X-Forwarded-For` headeridan asl IP manzilni olish imkonini beradi. Shuningdek, `req.ip` ga tayanmasdan, ushbu headerdan IP manzilni ajratib olish uchun `getTracker()` metodini override qilib ilova xatti-harakatini sozlashingiz mumkin. Quyidagi misol buni Express va Fastify uchun qanday qilishni ko'rsatadi:

```typescript
@@filename(throttler-behind-proxy.guard)
import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
  }
}
```

> info **Hint** Express uchun `req` Request obyektining API sini bu yerda va fastify uchun bu yerda topishingiz mumkin.

#### Websockets

Bu modul websockets bilan ishlashi mumkin, ammo buning uchun klassni kengaytirish kerak. `ThrottlerGuard` ni kengaytirib, `handleRequest` metodini quyidagicha override qilishingiz mumkin:

```typescript
@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const {
      context,
      limit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    } = requestProps;

    const client = context.switchToWs().getClient();
    const tracker = client._socket.remoteAddress;
    const key = generateKey(context, tracker, throttler.name);
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
      await this.storageService.increment(
        key,
        ttl,
        limit,
        blockDuration,
        throttler.name,
      );

    const getThrottlerSuffix = (name: string) =>
      name === 'default' ? '' : `-${name}`;

    // Throw an error when the user reached their limit.
    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit,
        ttl,
        key,
        tracker,
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire,
      });
    }

    return true;
  }
}
```

> info **Hint** Agar ws dan foydalanayotgan bo'lsangiz, `_socket` o'rniga `conn` dan foydalanish kerak

WebSockets bilan ishlaganda e'tiborga olish kerak bo'lgan bir nechta narsa bor:

- Guardni `APP_GUARD` yoki `app.useGlobalGuards()` bilan ro'yxatdan o'tkazib bo'lmaydi
- Limitga yetilganda, Nest `exception` eventini chiqaradi, shuning uchun bu uchun listener tayyor bo'lishi kerak

> info **Hint** Agar `@nestjs/platform-ws` paketidan foydalansangiz, `client._socket.remoteAddress` o'rniga ishlatishingiz mumkin.

#### GraphQL

`ThrottlerGuard` GraphQL so'rovlari bilan ishlash uchun ham qo'llanilishi mumkin. Yana, guardni kengaytirish mumkin, lekin bu safar `getRequestResponse` metodi override qilinadi.

```typescript
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
```

#### Konfiguratsiya

Quyidagi opsiyalar `ThrottlerModule` opsiyalarining massiviga uzatiladigan obyekt uchun yaroqli:

<table>
  <tr>
    <td><code>name</code></td>
    <td>qaysi throttler to'plami ishlatilayotganini ichki kuzatish uchun nom. Berilmasa default <code>default</code></td>
  </tr>
  <tr>
    <td><code>ttl</code></td>
    <td>har bir so'rov storage'da qancha millisekund saqlanishi</td>
  </tr>
  <tr>
    <td><code>limit</code></td>
    <td>TTL limitida maksimal so'rovlar soni</td>
  </tr>
  <tr>
    <td><code>blockDuration</code></td>
    <td>so'rov qancha millisekund bloklanishi</td>
  </tr>
  <tr>
    <td><code>ignoreUserAgents</code></td>
    <td>so'rovlarni throttle qilishda e'tibordan chetda qoldiriladigan user-agent regexlari massivi</td>
  </tr>
  <tr>
    <td><code>skipIf</code></td>
    <td><code>ExecutionContext</code> ni qabul qilib, throttler mantiqini short circuit qiladigan <code>boolean</code> qaytaruvchi funksiya. <code>@SkipThrottler()</code> ga o'xshaydi, lekin so'rovga asoslanadi</td>
  </tr>
</table>

Agar storage sozlamoqchi bo'lsangiz yoki yuqoridagi opsiyalarning ayrimlarini har bir throttler to'plamiga globalroq qo'llamoqchi bo'lsangiz, `throttlers` opsiyasi orqali yuqoridagi opsiyalarni berib, quyidagi jadvaldan foydalanishingiz mumkin.

<table>
  <tr>
    <td><code>storage</code></td>
    <td>throttling qayerda kuzatilishi uchun custom storage xizmati. <a href="/docs/security/rate-limiting#storages">Bu yerga qarang.</a></td>
  </tr>
  <tr>
    <td><code>ignoreUserAgents</code></td>
    <td>so'rovlarni throttle qilishda e'tibordan chetda qoldiriladigan user-agent regexlari massivi</td>
  </tr>
  <tr>
    <td><code>skipIf</code></td>
    <td><code>ExecutionContext</code> ni qabul qilib, throttler mantiqini short circuit qiladigan <code>boolean</code> qaytaruvchi funksiya. <code>@SkipThrottler()</code> ga o'xshaydi, lekin so'rovga asoslanadi</td>
  </tr>
  <tr>
    <td><code>throttlers</code></td>
    <td>yuqoridagi jadvaldan foydalanib aniqlangan throttler to'plamlari massivi</td>
  </tr>
  <tr>
    <td><code>errorMessage</code></td>
    <td><code>string</code> YOKI <code>ExecutionContext</code> va <code>ThrottlerLimitDetail</code> ni qabul qilib, default throttler xato xabarini override qiladigan <code>string</code> qaytaruvchi funksiya</td>
  </tr>
  <tr>
    <td><code>getTracker</code></td>
    <td><code>Request</code> ni qabul qilib, `getTracker` metodining default mantiqini override qiladigan <code>string</code> qaytaruvchi funksiya</td>
  </tr>
  <tr>
    <td><code>generateKey</code></td>
    <td><code>ExecutionContext</code>, tacker <code>string</code> va throttler nomi <code>string</code> ni qabul qilib, rate limit qiymatini saqlash uchun ishlatiladigan yakuniy kalitni override qiladigan <code>string</code> qaytaruvchi funksiya. Bu `generateKey` metodining default mantiqini override qiladi</td>
  </tr>
</table>

#### Async konfiguratsiya

Rate-limiting konfiguratsiyasini sinxron emas, asinxron tarzda olishni xohlashingiz mumkin. Bunda `forRootAsync()` metodidan foydalanishingiz mumkin, u dependency injection va `async` metodlarni qo'llab-quvvatlaydi.

Usullardan biri - factory funksiyasidan foydalanish:

```typescript
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL'),
          limit: config.get('THROTTLE_LIMIT'),
        },
      ],
    }),
  ],
})
export class AppModule {}
```

`useClass` sintaksisidan ham foydalanishingiz mumkin:

```typescript
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfigService,
    }),
  ],
})
export class AppModule {}
```

Bu `ThrottlerConfigService` `ThrottlerOptionsFactory` interfeysini implementatsiya qilsa bo'ladi.

#### Storage

Ichki storage - bu global opsiyalarda belgilangan TTL o'tguncha yuborilgan so'rovlarni kuzatib turadigan xotiradagi (in-memory) kesh. `ThrottlerStorage` interfeysini implementatsiya qiladigan klass bo'lsa, `ThrottlerModule` ning `storage` opsiyasiga o'zingizning storage variantingizni ulashingiz mumkin.

Taqsimlangan serverlar uchun yagona truth manbai sifatida Redis uchun hamjamiyat storage providerdan foydalanishingiz mumkin.

> info **Note** `ThrottlerStorage` `@nestjs/throttler` paketidan import qilinadi.

#### Time helpers

Vaqtlarni o'qilishi osonroq qilish uchun bir nechta yordamchi metodlar mavjud. `@nestjs/throttler` beshta yordamchini eksport qiladi: `seconds`, `minutes`, `hours`, `days`, va `weeks`. Ulardan foydalanish uchun `seconds(5)` yoki boshqa helperlardan birini chaqirish kifoya, shunda to'g'ri millisekund qiymati qaytariladi.

#### Migratsiya qo'llanmasi

Ko'pchilik uchun opsiyalarni massivga o'rashning o'zi yetarli bo'ladi.

Agar custom storage ishlatayotgan bo'lsangiz, `ttl` va `limit` ni massivga o'rab, opsiyalar obyektidagi `throttlers` xossasiga tayinlang.

`@SkipThrottle()` dekoratorlaridan har qanday biri muayyan route yoki metodlar uchun throttlingni aylanib o'tish uchun ishlatilishi mumkin. U ixtiyoriy boolean parametrini qabul qiladi va default `true` bo'ladi. Bu muayyan endpointlarda rate limitingni o'tkazib yuborish kerak bo'lganda foydali.

`@Throttle()` dekoratorlari endi string kalitli obyektni qabul qilishi kerak, bu kalitlar throttler kontekstlarining nomlariga mos keladi (nom bo'lmasa yana `'default'`) va qiymatlar `limit` va `ttl` kalitlariga ega obyektlar bo'ladi.

> Warning **Important** `ttl` endi **millisekundlarda**. Agar o'qilish uchun ttlni soniyalarda saqlamoqchi bo'lsangiz, ushbu paketning `seconds` helperidan foydalaning. U ttlni 1000 ga ko'paytirib, millisekundga aylantiradi.

Batafsil ma'lumot uchun Changelogga qarang.
