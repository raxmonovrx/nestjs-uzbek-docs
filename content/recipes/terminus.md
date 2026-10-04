---
title: "Healthchecks (Terminus)"
navTitle: "Healthchecks (Terminus)"
description: "Terminus integratsiyasi sizga readiness/liveness health check'larni taqdim etadi. Healthcheck'lar murakkab backend setup'larda juda muhim. Qisqacha aytganda, web development'dagi h"
order: 20
group: recipes
groupTitle: "Recipes"
---
Terminus integratsiyasi sizga **readiness/liveness** health check'larni taqdim etadi. Healthcheck'lar murakkab backend setup'larda juda muhim.
Qisqacha aytganda, web development'dagi health check odatda maxsus manzildan iborat bo'ladi, masalan `https://my-website.com/health/readiness`.
Servis yoki infratuzilmangizdagi biror komponent (masalan, Kubernetes) bu manzilni doimiy tekshiradi. Ushbu manzilga yuborilgan `GET` so'rovidan qaytgan HTTP status code'ga qarab, servis "unhealthy" javob olganda kerakli chorani ko'radi.
Siz taqdim etayotgan servis turiga qarab "healthy" yoki "unhealthy" ta'rifi farqlanadi. Shu sabab **Terminus** integratsiyasi sizga **health indicator** lar to'plamini beradi.

Masalan, agar web server ma'lumot saqlash uchun MongoDB ishlatsa, MongoDB hali ham ishlayaptimi yoki yo'qmi degan ma'lumot juda muhim bo'ladi.
Bunday holatda `MongooseHealthIndicator` dan foydalanishingiz mumkin. U to'g'ri sozlansa - bu haqda keyinroq - health check manzilingiz MongoDB ishlayotgan yoki ishlamayotganiga qarab healthy yoki unhealthy HTTP status code qaytaradi.

#### Boshlash

`@nestjs/terminus` bilan ishlashni boshlash uchun kerakli dependency'ni o'rnatish kerak.

```bash
$ npm install --save @nestjs/terminus
```

#### Healthcheck sozlash

Health check - bu **health indicator** lar yig'indisining qisqacha natijasi. Health indicator servisni tekshiradi va uning healthy yoki unhealthy holatda ekanini aniqlaydi. Agar biriktirilgan barcha health indicator'lar ishlayotgan bo'lsa, health check ijobiy hisoblanadi. Ko'plab ilovalarga o'xshash indicator'lar kerak bo'lgani uchun `@nestjs/terminus` oldindan tayyorlangan indicator'lar to'plamini beradi:

- `HttpHealthIndicator`
- `TypeOrmHealthIndicator`
- `MongooseHealthIndicator`
- `SequelizeHealthIndicator`
- `MikroOrmHealthIndicator`
- `PrismaHealthIndicator`
- `MicroserviceHealthIndicator`
- `GRPCHealthIndicator`
- `MemoryHealthIndicator`
- `DiskHealthIndicator`

Birinchi health check'ni boshlash uchun `HealthModule` yarating va uning `imports` massiviga `TerminusModule` ni qo'shing.

> info **Hint** Modulni [Nest CLI](/docs/cli/overview) bilan yaratish uchun `$ nest g module health` buyrug'ini ishga tushiring.

```typescript
@@filename(health.module)
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}
```

Healthcheck'larni [controller](/docs/core/controllers) orqali ishga tushirish mumkin va uni [Nest CLI](/docs/cli/overview) bilan osongina yaratish mumkin.

```bash
$ nest g controller health
```

> info **Info** Ilovada shutdown hook'larni yoqish qat'iy tavsiya etiladi. Terminus integratsiyasi ushbu lifecycle event'dan foydalanadi. Shutdown hook'lar haqida ko'proq [bu yerda](/docs/fundamentals/lifecycle-events#ilovani-ochirish) o'qing.

#### HTTP Healthcheck

`@nestjs/terminus` o'rnatilib, `TerminusModule` import qilinib va yangi controller yaratilgach, health check yaratishga tayyor bo'lamiz.

`HTTPHealthIndicator` uchun `@nestjs/axios` paketi kerak bo'ladi, shuning uchun u o'rnatilganiga ishonch hosil qiling:

```bash
$ npm i --save @nestjs/axios axios
```

Endi `HealthController` ni sozlashimiz mumkin:

```typescript
@@filename(health.controller)
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
@@switch
import { Controller, Dependencies, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller('health')
@Dependencies(HealthCheckService, HttpHealthIndicator)
export class HealthController {
  constructor(
    private health,
    private http,
  ) { }

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ])
  }
}
```

```typescript
@@filename(health.module)
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}
@@switch
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

Endi health check `https://docs.nestjs.com` manziliga _GET_ so'rovi yuboradi. Agar u yerdan healthy javob kelsa, `http://localhost:3000/health` route'i 200 status code bilan quyidagi obyektni qaytaradi.

```json
{
  "status": "ok",
  "info": {
    "nestjs-docs": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "nestjs-docs": {
      "status": "up"
    }
  }
}
```

Ushbu response obyektining interfeysi `@nestjs/terminus` paketidagi `HealthCheckResult` interfeysi orqali mavjud.

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| `status`  | Agar biror health indicator muvaffaqiyatsiz bo'lsa, status `'error'` bo'ladi. Agar NestJS ilovasi yopilish jarayonida bo'lsa, ammo hali HTTP so'rovlarni qabul qilayotgan bo'lsa, health check `'shutting_down'` holatida bo'ladi. | `'error' \| 'ok' \| 'shutting_down'` |
| `info`    | Status'i `'up'`, ya'ni healthy bo'lgan health indicator'lar ma'lumotini o'z ichiga olgan obyekt.                                                                                             | `object`                             |
| `error`   | Status'i `'down'`, ya'ni unhealthy bo'lgan health indicator'lar ma'lumotini o'z ichiga olgan obyekt.                                                                                         | `object`                             |
| `details` | Har bir health indicator haqidagi barcha ma'lumotlarni o'z ichiga olgan obyekt.                                                                                                              | `object`                             |

##### Muayyan HTTP response code'larni tekshirish

Ba'zi hollarda siz muayyan kriteriyalarni tekshirib, response'ni validatsiya qilmoqchi bo'lasiz. Masalan, `https://my-external-service.com` manzili `204` response code qaytaradi deb faraz qilaylik. `HttpHealthIndicator.responseCheck` yordamida aynan shu response code'ni tekshirib, boshqa barcha kodlarni unhealthy deb belgilashingiz mumkin.

`204` dan boshqa response code qaytsa, quyidagi misol unhealthy bo'ladi. Uchinchi parametr sifatida response healthy (`true`) yoki unhealthy (`false`) ekanini bildiradigan sync yoki async funksiya uzatiladi.

```typescript
@@filename(health.controller)
// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () =>
      this.http.responseCheck(
        'my-external-service',
        'https://my-external-service.com',
        (res) => res.status === 204,
      ),
  ]);
}
```

#### TypeOrm health indicator

Terminus health check'ga database tekshiruvlarini qo'shish imkonini beradi. Ushbu health indicator bilan ishlashni boshlashdan oldin [Database chapter](/docs/techniques/sql) ni ko'rib chiqing va ilovangizda database ulanishi o'rnatilganiga ishonch hosil qiling.

> info **Hint** Ichki qatlamda `TypeOrmHealthIndicator` shunchaki database tirikligini tekshirish uchun ko'p ishlatiladigan `SELECT 1` SQL buyruqini bajaradi. Agar Oracle database ishlatilayotgan bo'lsa, `SELECT 1 FROM DUAL` ishlatiladi.

```typescript
@@filename(health.controller)
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
@@switch
@Controller('health')
@Dependencies(HealthCheckService, TypeOrmHealthIndicator)
export class HealthController {
  constructor(
    private health,
    private db,
  ) { }

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ])
  }
}
```

Agar database'ga ulanib bo'lsa, `http://localhost:3000/health` manziliga `GET` so'rovi yuborilganda quyidagi JSON natijani ko'rishingiz kerak:

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

Agar ilovangiz bir nechta database ishlatsa, har bir connection'ni `HealthController` ichiga inject qilishingiz kerak. Shundan so'ng connection reference'ni `TypeOrmHealthIndicator` ga uzatishingiz mumkin.

```typescript
@@filename(health.controller)
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectConnection('albumsConnection')
    private albumsConnection: Connection,
    @InjectConnection()
    private defaultConnection: Connection,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('albums-database', { connection: this.albumsConnection }),
      () => this.db.pingCheck('database', { connection: this.defaultConnection }),
    ]);
  }
}
```

#### Disk health indicator

`DiskHealthIndicator` yordamida qancha storage ishlatilayotganini tekshirish mumkin. Boshlash uchun `DiskHealthIndicator` ni `HealthController` ichiga inject qiling. Quyidagi misol `/` path'idagi (Windows'da `C:\\`) ishlatilayotgan storage'ni tekshiradi.
Agar u umumiy storage hajmining 50% idan oshsa, unhealthy Health Check qaytariladi.

```typescript
@@filename(health.controller)
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ]);
  }
}
@@switch
@Controller('health')
@Dependencies(HealthCheckService, DiskHealthIndicator)
export class HealthController {
  constructor(health, disk) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ])
  }
}
```

`DiskHealthIndicator.checkStorage` orqali ma'lum bir qat'iy hajm chegarasini ham tekshirishingiz mumkin.
Quyidagi misolda `/my-app/` yo'li 250GB dan oshsa, holat unhealthy bo'ladi.

```typescript
@@filename(health.controller)
// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.disk.checkStorage('storage', {  path: '/', threshold: 250 * 1024 * 1024 * 1024, })
  ]);
}
```

#### Memory health indicator

Jarayon ma'lum memory limitidan oshib ketmasligini tekshirish uchun `MemoryHealthIndicator` dan foydalanish mumkin.
Quyidagi misol process heap'ini tekshiradi.

> info **Hint** Heap - bu dinamik ajratilgan xotira joylashadigan memory qismi (masalan, `malloc` orqali ajratilgan xotira). Heap'dan ajratilgan xotira quyidagilardan biri sodir bo'lmaguncha band holatda qoladi:
> - The memory is _free_'d
> - The program terminates

```typescript
@@filename(health.controller)
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
@@switch
@Controller('health')
@Dependencies(HealthCheckService, MemoryHealthIndicator)
export class HealthController {
  constructor(health, memory) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ])
  }
}
```

`MemoryHealthIndicator.checkRSS` yordamida process RSS memory'sini ham tekshirish mumkin. Quyidagi misolda process 150MB dan ko'p xotira ajratgan bo'lsa, unhealthy response code qaytariladi.

> info **Hint** RSS - bu Resident Set Size bo'lib, process uchun ajratilgan va RAM'da turgan xotira miqdorini ko'rsatadi.
> U swap qilingan xotirani o'z ichiga olmaydi. Ammo shared library'lardan real memory'da turgan sahifalar hisobga olinadi.
> Bundan tashqari, barcha stack va heap memory ham kiritiladi.

```typescript
@@filename(health.controller)
// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
  ]);
}
```

#### Custom health indicator

Ba'zi hollarda `@nestjs/terminus` taqdim etgan oldindan tayyor health indicator'lar barcha talablaringizni qamrab olmaydi. Bunday vaziyatda ehtiyojingizga mos custom health indicator yaratishingiz mumkin.

Boshlash uchun custom indicator'imizni ifodalaydigan service yaratamiz. Indicator qanday tuzilishini sodda tushunish uchun `DogHealthIndicator` namunasini yaratamiz. Ushbu service har bir `Dog` obyekti `'goodboy'` turiga ega bo'lsa `'up'` holatda bo'lishi kerak. Agar bu shart bajarilmasa, u xato tashlashi kerak.

```typescript
@@filename(dog.health)
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

export interface Dog {
  name: string;
  type: string;
}

@Injectable()
export class DogHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService
  ) {}

  private dogs: Dog[] = [
    { name: 'Fido', type: 'goodboy' },
    { name: 'Rex', type: 'badboy' },
  ];

  async isHealthy(key: string){
    const indicator = this.healthIndicatorService.check(key);
    const badboys = this.dogs.filter(dog => dog.type === 'badboy');
    const isHealthy = badboys.length === 0;

    if (!isHealthy) {
      return indicator.down({ badboys: badboys.length });
    }

    return indicator.up();
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
@Dependencies(HealthIndicatorService)
export class DogHealthIndicator {
  constructor(healthIndicatorService) {
    this.healthIndicatorService = healthIndicatorService;
  }

  private dogs = [
    { name: 'Fido', type: 'goodboy' },
    { name: 'Rex', type: 'badboy' },
  ];

  async isHealthy(key){
    const indicator = this.healthIndicatorService.check(key);
    const badboys = this.dogs.filter(dog => dog.type === 'badboy');
    const isHealthy = badboys.length === 0;

    if (!isHealthy) {
      return indicator.down({ badboys: badboys.length });
    }

    return indicator.up();
  }
}
```

Keyingi qadam - health indicator'ni provider sifatida ro'yxatdan o'tkazish.

```typescript
@@filename(health.module)
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DogHealthIndicator } from './dog.health';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
  providers: [DogHealthIndicator]
})
export class HealthModule { }
```

> info **Hint** Real ilovada `DogHealthIndicator` alohida modulda, masalan `DogModule` ichida taqdim etilib, keyin u `HealthModule` ga import qilinishi kerak.

Oxirgi kerakli qadam - endi mavjud bo'lgan health indicator'ni kerakli health check endpoint'ga qo'shish. Buning uchun `HealthController` ga qaytib, uni `check` funksiyasiga qo'shamiz.

```typescript
@@filename(health.controller)
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Injectable, Dependencies, Get } from '@nestjs/common';
import { DogHealthIndicator } from './dog.health';

@Injectable()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dogHealthIndicator: DogHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}
@@switch
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Injectable, Get } from '@nestjs/common';
import { DogHealthIndicator } from './dog.health';

@Injectable()
@Dependencies(HealthCheckService, DogHealthIndicator)
export class HealthController {
  constructor(
    health,
    dogHealthIndicator
  ) {
    this.health = health;
    this.dogHealthIndicator = dogHealthIndicator;
  }

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}
```

#### Logging

Terminus faqat error xabarlarini log qiladi, masalan Healthcheck muvaffaqiyatsiz bo'lganda. `TerminusModule.forRoot()` metodi orqali xatolar qanday log qilinishini aniqroq boshqarishingiz, hatto logging'ni to'liq o'z qo'lingizga olishingiz mumkin.

Ushbu bo'limda `TerminusLogger` nomli custom logger qanday yaratilishini ko'rsatamiz. Bu logger built-in logger'dan meros oladi.
Shuning uchun logger'ning qaysi qismini override qilishni xohlasangiz, o'shani tanlashingiz mumkin.

> info **Info** NestJS'dagi custom logger'lar haqida ko'proq bilmoqchi bo'lsangiz, [bu yerda o'qing](/docs/techniques/logger#custom-loggerni-inject-qilish).

```typescript
@@filename(terminus-logger.service)
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TerminusLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string): void;
  error(message: any, ...optionalParams: any[]): void;
  error(
    message: unknown,
    stack?: unknown,
    context?: unknown,
    ...rest: unknown[]
  ): void {
    // Overwrite here how error messages should be logged
  }
}
```

Custom logger yaratilgach, uni `TerminusModule.forRoot()` ga quyidagicha uzatish kifoya.

```typescript
@@filename(health.module)
@Module({
imports: [
  TerminusModule.forRoot({
    logger: TerminusLogger,
  }),
],
})
export class HealthModule {}
```

Terminus'dan keladigan barcha log xabarlarini, jumladan error log'larini ham to'liq o'chirish uchun uni quyidagicha sozlang.

```typescript
@@filename(health.module)
@Module({
imports: [
  TerminusModule.forRoot({
    logger: false,
  }),
],
})
export class HealthModule {}
```

Terminus healthcheck xatolari loglarda qanday ko'rsatilishini sozlash imkonini beradi.

| Error Log Style          | Description                                                                                                                        | Example                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| `json`  (default) | Xato yuz berganda health check natijasining qisqacha mazmunini JSON obyekt ko'rinishida chiqaradi                                 |    |
| `pretty`          | Xato yuz berganda health check natijasining qisqacha mazmunini formatlangan bloklarda chiqaradi va muvaffaqiyatli/xatoli natijalarni ajratib ko'rsatadi |  |

Log uslubini `errorLogStyle` konfiguratsiyasi orqali quyidagicha o'zgartirishingiz mumkin.

```typescript
@@filename(health.module)
@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ]
})
export class HealthModule {}
```

#### Graceful shutdown timeout

Agar ilovangizga shutdown jarayonini biroz kechiktirish kerak bo'lsa, Terminus buni siz uchun boshqarishi mumkin.
Bu sozlama, ayniqsa, Kubernetes kabi orchestrator bilan ishlaganda foydali bo'ladi.
Readiness check interval'idan biroz uzunroq kechikish belgilash orqali container'larni o'chirish paytida zero downtime'ga erishish mumkin.

```typescript
@@filename(health.module)
@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
  ]
})
export class HealthModule {}
```

#### Ko'proq misollar

Ko'proq ishlaydigan misollar bu yerda mavjud.
