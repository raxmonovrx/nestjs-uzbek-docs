---
title: "Suites"
navTitle: "Suites"
description: "Suites - bu TypeScript dependency injection freymvorklari uchun open-source unit-testing freymvorki. U mock'larni qo'lda yaratish, ko'p konfiguratsiyali uzun test setup yozish yoki"
order: 18
group: recipes
groupTitle: "Recipes"
---
Suites - bu TypeScript dependency injection freymvorklari uchun open-source unit-testing freymvorki. U mock'larni qo'lda yaratish, ko'p konfiguratsiyali uzun test setup yozish yoki type'siz test double'lar (mocks, stubs) bilan ishlashga **muqobil** sifatida ishlatiladi.

Suites runtime vaqtida NestJS servislaridan metadata'ni o'qiydi va barcha dependency'lar uchun to'liq typed mock'larni avtomatik yaratadi.
Bu boilerplate mock setup'ni yo'qotadi va type-safe testlarni ta'minlaydi. Suites'ni `Test.createTestingModule()` bilan birga ishlatish mumkin bo'lsa-da, u ayniqsa focused unit testing'da kuchli.
Modul wiring, dekoratorlar, guard'lar va interceptor'larni tekshirishda `Test.createTestingModule()` dan foydalaning.
Avtomatik mock yaratish bilan tez unit testlar uchun esa Suites'dan foydalaning.

Modulga asoslangan testing haqida ko'proq ma'lumot uchun testing fundamentals bobini ko'ring.

> info **Note** `Suites` third-party paket bo'lib, NestJS core jamoasi tomonidan qo'llab-quvvatlanmaydi. Muammolarni mos repository ga yuboring.

#### Boshlash

Ushbu qo'llanma Suites yordamida NestJS servislarini test qilishni ko'rsatadi. U isolated testing (barcha dependency'lar mock qilingan) va sociable testing (tanlangan real implementatsiyalar ishlatiladigan) yondashuvlarini qamrab oladi.

#### Suites'ni o'rnatish

NestJS runtime dependency'lari o'rnatilganini tekshiring:

```bash
$ npm install @nestjs/common @nestjs/core reflect-metadata
```

Suites core, NestJS adapter va doubles adapter'ni o'rnating:

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.jest
```

Doubles adapter (`@suites/doubles.jest`) Jest'ning mocking imkoniyatlari ustiga wrapper beradi. U type-safe test double yaratadigan `mock()` va `stub()` funksiyalarini taqdim etadi.

Jest va TypeScript mavjudligiga ishonch hosil qiling:

```bash
$ npm install --save-dev ts-jest @types/jest jest typescript
```

<details><summary>Expand if you're using Vitest</summary>

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.vitest
```

</details>

<details><summary>Expand if you're using Sinon</summary>

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.sinon
```

</details>

#### Type definition'larni sozlash

Loyiha root'ida `global.d.ts` yarating:

```typescript
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.nestjs/types" />
```

#### Namuna service yaratish

Bu qo'llanmada ikki dependency'ga ega sodda `UserService` ishlatiladi:

```typescript
@@filename(user.repository)
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    // Database query
  }

  async save(user: User): Promise<User> {
    // Database save
  }
}
```
```typescript
@@filename(user.service)
import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private logger: Logger,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    this.logger.log(`Found user ${id}`);
    return user;
  }

  async create(email: string, name: string): Promise<User> {
    const user = { id: generateId(), email, name };
    await this.repository.save(user);
    this.logger.log(`Created user ${user.id}`);
    return user;
  }
}
```

#### Unit test yozish

Barcha dependency'lar mock qilingan isolated testlar yaratish uchun `TestBed.solitary()` dan foydalaning:

```typescript
@@filename(user.service.spec)
import { TestBed, type Mocked } from '@suites/unit';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Logger } from '@nestjs/common';

describe('User Service Unit Spec', () => {
  let userService: UserService;
  let repository: Mocked<UserRepository>;
  let logger: Mocked<Logger>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();

    userService = unit;
    repository = unitRef.get(UserRepository);
    logger = unitRef.get(Logger);
  });

  it('should find user by id', async () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test' };
    repository.findById.mockResolvedValue(user);

    const result = await userService.findById('1');

    expect(result).toEqual(user);
    expect(logger.log).toHaveBeenCalled();
  });
});
```

`TestBed.solitary()` constructor'ni tahlil qilib, barcha dependency'lar uchun typed mock yaratadi.
`Mocked<T>` turi mock konfiguratsiyasi uchun IntelliSense qo'llab-quvvatlashini beradi.

#### Compile'dan oldin mock konfiguratsiyasi

Mock xatti-harakatini compile'dan oldin `.mock().impl()` orqali sozlang:

```typescript
@@filename(user.service.spec)
import { TestBed } from '@suites/unit';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('User Service Unit Spec - pre-configured', () => {
  let unit: UserService;
  let repository: Mocked<UserRepository>;
  
  beforeAll(async () => {
    const { unit: underTest, unitRef } = await TestBed.solitary(UserService)
      .mock(UserRepository)
      .impl(stubFn => ({
        findById: stubFn().mockResolvedValue({ id: '1', email: 'test@example.com', name: 'Test' })
      }))
      .compile();
    
    repository = unitRef.get(UserRepository);
    unit = underTest;
  })
  
  it('should find user with pre-configured mock', async () => {
    const result = await unit.findById('1');
    
    expect(repository.findById).toHaveBeenCalled();
    expect(result.email).toBe('test@example.com');
  });
});
```

`stubFn` parametri o'rnatilgan doubles adapter'ga mos keladi (`Jest` uchun `jest.fn()`, `Vitest` uchun `vi.fn()`, `Sinon` uchun `sinon.stub()`).

#### Real dependency'lar bilan testing

Muayyan dependency'lar uchun real implementatsiyalardan foydalanish uchun `.expose()` bilan `TestBed.sociable()` dan foydalaning:

```typescript
@@filename(user.service.spec)
import { TestBed, Mocked } from '@suites/unit';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Logger } from '@nestjs/common';

describe('UserService - with real logger', () => {
  let userService: UserService;
  let repository: Mocked<UserRepository>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.sociable(UserService)
      .expose(Logger)
      .compile();

    userService = unit;
    repository = unitRef.get(UserRepository);
  });

  it('should log when finding user', async () => {
    const user = { id: '1', email: 'test@example.com' };
    repository.findById.mockResolvedValue(user);

    await userService.findById('1');

    // Logger actually executes, no mock needed
  });
});
```

`.expose(Logger)` `Logger` ni real implementatsiyasi bilan yaratadi, qolgan dependency'lar esa mock bo'lib qoladi.

#### Token-based dependency'lar

Suites custom injection token'larni (string yoki symbol) qo'llab-quvvatlaydi:

```typescript
@@filename(config.service)
import { Injectable, Inject } from '@nestjs/common';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

@Injectable()
export class ConfigService {
  constructor(
    @Inject(CONFIG_OPTIONS) private options: { apiKey: string },
  ) {}

  getApiKey(): string {
    return this.options.apiKey;
  }
}
```

Token-based dependency'larga `unitRef.get()` orqali murojaat qiling:

```typescript
@@filename(config.service.spec)
import { TestBed } from '@suites/unit';
import { ConfigService, CONFIG_OPTIONS, ConfigOptions } from './config.service';

describe('Config Service Unit Spec', () => {
  let configService: ConfigService;
  let options: ConfigOptions;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(ConfigService).compile();
    configService = unit;

    options = unitRef.get<ConfigOptions>(CONFIG_OPTIONS);
  });

  it('should return api key', () => { ... });
});
```

#### `mock()` va `stub()` dan to'g'ridan-to'g'ri foydalanish

`TestBed` siz ishlatmoqchi bo'lmasangiz va to'g'ridan-to'g'ri nazorat kerak bo'lsa, doubles adapter paketi `mock()` va `stub()` funksiyalarini beradi:

```typescript
@@filename(user.service.spec)
import { mock } from '@suites/unit';
import { UserRepository } from './user.repository';

describe('User Service Unit Spec', () => {
  it('should work with direct mocks', async () => {
    const repository = mock<UserRepository>();
    const logger = mock<Logger>();

    const service = new UserService(repository, logger);

    // ...
  });
});
```

`mock()` typed mock object yaratadi, `stub()` esa asosiy mocking kutubxonasini (bu misolda Jest) o'rab, `mockResolvedValue()` kabi metodlarni taqdim etadi.
Bu funksiyalar o'rnatilgan doubles adapter'dan (`@suites/doubles.jest`) keladi va u test freymvorkining native mocking imkoniyatlarini moslashtiradi.

> info **Hint** `mock()` funksiyasi `@golevelup/ts-jest` dagi `createMock` ga muqobil hisoblanadi. Ikkalasi ham typed mock object yaratadi. `createMock` haqida ko'proq ma'lumot uchun testing fundamentals bobiga qarang.

#### Xulosa

**`Test.createTestingModule()` dan quyidagilar uchun foydalaning:**
- Validating module configuration and provider wiring
- Testing decorators, guards, interceptors, and pipes
- Verifying dependency injection across modules
- Testing full application context with middleware

**Suites'dan quyidagilar uchun foydalaning:**
- Fast unit tests focused on business logic
- Automatic mock generation for multiple dependencies
- Type-safe test doubles with IntelliSense

Testlarni maqsadiga qarab ajrating: alohida service xatti-harakatini tekshiradigan unit testlar uchun Suites'dan, modul konfiguratsiyasini tekshiradigan integration testlar uchun esa `Test.createTestingModule()` dan foydalaning.

Qo'shimcha ma'lumot:
- Suites Documentation
- Suites GitHub Repository
- NestJS Testing Documentation
