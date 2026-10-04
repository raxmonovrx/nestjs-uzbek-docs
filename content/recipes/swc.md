---
title: "SWC"
navTitle: "SWC"
description: "SWC (Speedy Web Compiler) - bu kompilyatsiya ham, bundling ham uchun ishlatilishi mumkin bo'lgan kengaytiriladigan Rust asosidagi platforma. SWC'ni Nest CLI bilan ishlatish develop"
order: 19
group: recipes
groupTitle: "Recipes"
---
SWC (Speedy Web Compiler) - bu kompilyatsiya ham, bundling ham uchun ishlatilishi mumkin bo'lgan kengaytiriladigan Rust asosidagi platforma.
SWC'ni Nest CLI bilan ishlatish development jarayonini sezilarli darajada tezlashtirishning sodda va samarali usulidir.

> info **Hint** SWC standart TypeScript kompilyatoridan taxminan **x20 marta tezroq**.

#### O'rnatish

Boshlash uchun avval bir nechta paketni o'rnating:

```bash
$ npm i --save-dev @swc/cli @swc/core
```

#### Boshlash

O'rnatish tugagach, `swc` builder'ni Nest CLI bilan quyidagicha ishlatishingiz mumkin:

```bash
$ nest start -b swc
# OR nest start --builder swc
```

> info **Hint** Agar repository'ingiz monorepo bo'lsa, [ushbu bo'lim](/docs/recipes/swc#monorepo) ni ko'ring.

`-b` flag'ini uzatish o'rniga, `nest-cli.json` faylida `compilerOptions.builder` xossasini `"swc"` qilib ham qo'yishingiz mumkin:

```json
{
  "compilerOptions": {
    "builder": "swc"
  }
}
```

Builder xatti-harakatini moslashtirish uchun `type` (`"swc"`) va `options` atributlarini o'z ichiga olgan obyekt uzatishingiz mumkin:

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": "infrastructure/.swcrc",
      }
    }
  }
}
```

Masalan, SWC `.jsx` va `.tsx` fayllarni ham kompilyatsiya qilishi uchun quyidagicha yozing:

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": { "extensions": [".ts", ".tsx", ".js", ".jsx"] }
    },
  }
}

```

Ilovani watch mode'da ishga tushirish uchun quyidagi buyruqdan foydalaning:

```bash
$ nest start -b swc -w
# OR nest start --builder swc --watch
```

#### Type checking

SWC o'zi mustaqil ravishda type checking bajarmaydi (standart TypeScript kompilyatoridan farqli ravishda). Uni yoqish uchun `--type-check` flag'idan foydalaning:

```bash
$ nest start -b swc --type-check
```

Bu buyruq Nest CLI'ga SWC bilan birga `tsc` ni `noEmit` rejimida ishga tushirishni buyuradi va u asinxron ravishda type checking bajaradi. Yana, `--type-check` flag'ini uzatish o'rniga `nest-cli.json` faylida `compilerOptions.typeCheck` ni `true` ga o'rnatishingiz ham mumkin:

```json
{
  "compilerOptions": {
    "builder": "swc",
    "typeCheck": true
  }
}
```

#### CLI plugin'lar (SWC)

`--type-check` flag'i **NestJS CLI plugin'larini** avtomatik ishga tushiradi va keyin runtime vaqtida ilova yuklay oladigan serialized metadata faylini yaratadi.

#### SWC konfiguratsiyasi

SWC builder NestJS ilovalari talablariga mos holda oldindan sozlangan. Biroq siz loyiha root katalogida `.swcrc` faylini yaratib, opsiyalarni xohlaganingizcha sozlashingiz mumkin.

```json
{
  "$schema": "https://swc.rs/schema.json",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "baseUrl": "./"
  },
  "minify": false
}
```

#### Monorepo

Agar repository monorepo bo'lsa, `swc` builder'ni ishlatish o'rniga `webpack` ni `swc-loader` bilan sozlashingiz kerak bo'ladi.

Avval kerakli paketni o'rnating:

```bash
$ npm i --save-dev swc-loader
```

O'rnatish tugagach, ilovangiz root katalogida `webpack.config.js` faylini yarating va unga quyidagi kodni yozing:

```js
const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcDefaultConfig,
        },
      },
    ],
  },
};
```

#### Monorepo va CLI plugin'lar

Agar siz CLI plugin'lardan foydalansangiz, `swc-loader` ularni avtomatik yuklamaydi. Buning o'rniga, ularni qo'lda yuklaydigan alohida fayl yaratishingiz kerak. Buning uchun `main.ts` yonida `generate-metadata.ts` faylini yarating va unga quyidagi kodni yozing:

```ts
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname })],
  outputDir: __dirname,
  watch: true,
  tsconfigPath: 'apps/<name>/tsconfig.app.json',
});
```

> info **Hint** Bu misolda `@nestjs/swagger` plugin'i ishlatilgan, ammo siz istalgan plugin'dan foydalanishingiz mumkin.

`generate()` metodi quyidagi opsiyalarni qabul qiladi:

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `watch`            | Loyiha o'zgarishlarini kuzatish kerakmi yoki yo'qmi.                                           |
| `tsconfigPath`     | `tsconfig.json` fayliga yo'l. Joriy ish katalogiga (`process.cwd()`) nisbatan olinadi.         |
| `outputDir`        | Metadata fayli saqlanadigan katalog yo'li.                                                     |
| `visitors`         | Metadata yaratishda ishlatiladigan visitor'lar massivi.                                        |
| `filename`         | Metadata fayli nomi. Standart qiymati `metadata.ts`.                                           |
| `printDiagnostics` | Diagnostika ma'lumotlarini konsolga chiqarish kerakmi. Standart qiymati `true`.                |

Oxirida `generate-metadata` skriptini alohida terminal oynasida quyidagi buyruq bilan ishga tushirishingiz mumkin:

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts
```

#### Keng uchraydigan muammolar

Agar ilovangizda TypeORM/MikroORM yoki boshqa ORM ishlatsangiz, circular import muammolariga duch kelishingiz mumkin. SWC **circular import** larni yaxshi boshqarmaydi, shuning uchun quyidagi workaround'dan foydalaning:

```typescript
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>; // <--- see "Relation<>" type here instead of just "Profile"
}
```

> info **Hint** `Relation` turi `typeorm` paketidan export qilinadi.

Bu yondashuv xossa turining transpiled koddagi property metadata ichida saqlanib qolishining oldini oladi va shu bilan circular dependency muammolarini kamaytiradi.

Agar ORM'ingiz shunga o'xshash workaround bermasa, wrapper type'ni o'zingiz aniqlashingiz mumkin:

```typescript
/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
export type WrapperType<T> = T; // WrapperType === Relation
```

Loyihangizdagi barcha [circular dependency injection](/docs/fundamentals/circular-dependency) holatlarida ham yuqorida ta'riflangan custom wrapper type'dan foydalanishingiz kerak bo'ladi:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: WrapperType<ProfileService>,
  ) {};
}
```

### Jest + SWC

SWC'ni Jest bilan ishlatish uchun quyidagi paketlarni o'rnatishingiz kerak:

```bash
$ npm i --save-dev jest @swc/core @swc/jest
```

O'rnatish tugagach, konfiguratsiyangizga qarab `package.json` yoki `jest.config.js` faylini quyidagicha yangilang:

```json
{
  "jest": {
    "transform": {
      "^.+\\.(t|j)s?$": ["@swc/jest"]
    }
  }
}
```

Bundan tashqari, `.swcrc` fayliga quyidagi `transform` xossalarini qo'shishingiz kerak bo'ladi: `legacyDecorator`, `decoratorMetadata`:

```json
{
  "$schema": "https://swc.rs/schema.json",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    },
    "baseUrl": "./"
  },
  "minify": false
}
```

Agar loyihada NestJS CLI plugin'lari ishlatilsa, `PluginMetadataGenerator` ni qo'lda ishga tushirishingiz kerak bo'ladi. Batafsil ma'lumot uchun [ushbu bo'lim](/docs/recipes/swc#monorepo-va-cli-pluginlar) ga qarang.

### Vitest

Vitest - bu Vite bilan ishlash uchun mo'ljallangan tez va yengil test runner. U NestJS loyihalariga integratsiya qilinishi mumkin bo'lgan zamonaviy, tez va ishlatish oson testing yechimini taqdim etadi.

#### O'rnatish

Boshlash uchun avval kerakli paketlarni o'rnating:

```bash
$ npm i --save-dev vitest unplugin-swc @swc/core @vitest/coverage-v8
```

#### Konfiguratsiya

Ilovangiz root katalogida `vitest.config.ts` faylini yarating va unga quyidagi kodni yozing:

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      'src': resolve(__dirname, './src'),
    },
  },
});
```

Bu konfiguratsiya fayli Vitest muhiti, root katalog va SWC plugin'ini sozlaydi. Bundan tashqari, e2e testlar uchun alohida konfiguratsiya fayli ham yaratishingiz kerak bo'ladi. Unda test yo'lini ko'rsatadigan qo'shimcha `include` maydoni bo'ladi:

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },
  plugins: [swc.vite()],
});
```

Bundan tashqari, testlarda TypeScript path'larini qo'llab-quvvatlash uchun `alias` opsiyalarini ham sozlashingiz mumkin:

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    alias: {
      '@src': './src',
      '@test': './test',
    },
    root: './',
  },
  resolve: {
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },
  plugins: [swc.vite()],
});
```

### Path alias'lar

Jest'dan farqli ravishda, Vitest `src/` kabi TypeScript path alias'larini avtomatik resolve qilmaydi. Bu test vaqtida dependency resolution xatolariga olib kelishi mumkin. Buni tuzatish uchun `vitest.config.ts` fayliga quyidagi `resolve.alias` konfiguratsiyasini qo'shing:

```ts
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'src': resolve(__dirname, './src'),
    },
  },
});
```
Bu Vitest'ning modul import'larini to'g'ri resolve qilishini ta'minlaydi va yo'q dependency'lar bilan bog'liq xatolarni kamaytiradi.

#### E2E testlardagi import'larni yangilash

`import * as request from 'supertest'` ko'rinishidagi barcha E2E test import'larini `import request from 'supertest'` ga o'zgartiring. Bu kerak, chunki Vitest Vite bilan bundle qilinganda `supertest` uchun default import kutadi. Namespace import ushbu setup'da muammo keltirib chiqarishi mumkin.

Oxirida `package.json` ichidagi test script'larini quyidagicha yangilang:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:debug": "vitest --inspect-brk --inspect --logHeapUsage --threads=false",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts"
  }
}
```

Bu script'lar Vitest'ni testlarni ishga tushirish, o'zgarishlarni kuzatish, code coverage hisobotlarini yaratish va debug qilish uchun sozlaydi. `test:e2e` skripti esa maxsus konfiguratsiya fayli bilan E2E testlarni ishga tushirish uchun mo'ljallangan.

Ushbu setup bilan NestJS loyihangizda Vitest'dan foydalanishning afzalliklarini, jumladan tezroq test bajarilishi va zamonaviyroq testing tajribasini olasiz.

> info **Hint** Ishlaydigan namunani ushbu repository da ko'rishingiz mumkin.
