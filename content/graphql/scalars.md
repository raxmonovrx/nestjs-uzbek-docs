---
title: "Scalarlar"
navTitle: "Scalarlar"
description: "GraphQL object type ning nomi va fieldlari bor, ammo oxir-oqibat bu fieldlar aniq ma'lumotga yechilishi kerak. Bu yerda scalar turlar kerak bo'ladi: ular queryning barglarini ifoda"
order: 14
group: graphql
groupTitle: "GraphQL"
---
GraphQL object type ning nomi va fieldlari bor, ammo oxir-oqibat bu fieldlar aniq ma'lumotga yechilishi kerak. Bu yerda scalar turlar kerak bo'ladi: ular queryning barglarini ifodalaydi (batafsil bu yerda). GraphQL quyidagi default turlarni o'z ichiga oladi: `Int`, `Float`, `String`, `Boolean` va `ID`. Bu built-in turlardan tashqari, sizga custom atomic data turlarini (masalan, `Date`) qo'llab-quvvatlash kerak bo'lishi mumkin.

#### Code first

Code-first yondashuvi besh ta scalar bilan keladi, ulardan uchtasi mavjud GraphQL turlari uchun oddiy aliaslardir.

- `ID` (`GraphQLID` uchun alias) - noyob identifikatorni ifodalaydi, ko'pincha obyektni qayta fetch qilish yoki cache kaliti sifatida ishlatiladi
- `Int` (`GraphQLInt` uchun alias) - signed 32-bit integer
- `Float` (`GraphQLFloat` uchun alias) - signed double-precision floating-point qiymat
- `GraphQLISODateTime` - UTCdagi date-time satri (default holatda `Date` turini ifodalash uchun ishlatiladi)
- `GraphQLTimestamp` - UNIX epoch boshidan millisekundlar soni sifatida sana va vaqtni ifodalovchi signed integer

`GraphQLISODateTime` (masalan, `2019-12-03T09:54:33Z`) default holatda `Date` turini ifodalash uchun ishlatiladi. Buning o'rniga `GraphQLTimestamp`dan foydalanish uchun `buildSchemaOptions` obyektida `dateScalarMode`ni `'timestamp'` qilib o'rnating:

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),
```

Xuddi shuningdek, `GraphQLFloat` default holatda `number` turini ifodalash uchun ishlatiladi. Buning o'rniga `GraphQLInt`dan foydalanish uchun `buildSchemaOptions` obyektida `numberScalarMode`ni `'integer'` qilib o'rnating:

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    numberScalarMode: 'integer',
  }
}),
```

Bundan tashqari, custom scalarlar yaratishingiz mumkin.

#### Default scalarni override qilish

`Date` scalarining custom implementatsiyasini yaratish uchun yangi klass yarating.

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
```

Shu bilan, `DateScalar`ni provider sifatida ro'yxatdan o'tkazing.

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}
```

Endi klasslarimizda `Date` turidan foydalanishimiz mumkin.

```typescript
@Field()
creationDate: Date;
```

#### Custom scalarni import qilish

Custom scalardan foydalanish uchun uni import qilib resolver sifatida ro'yxatdan o'tkazing. Namoyish uchun `graphql-type-json` paketidan foydalanamiz. Bu npm paket `JSON` GraphQL scalar turini belgilaydi.

Avval paketni o'rnating:

```bash
$ npm i --save graphql-type-json
```

Paket o'rnatilgach, `forRoot()` metodiga custom resolver uzatamiz:

```typescript
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    GraphQLModule.forRoot({
      resolvers: { JSON: GraphQLJSON },
    }),
  ],
})
export class AppModule {}
```

Endi klasslarimizda `JSON` turidan foydalanishimiz mumkin.

```typescript
@Field(() => GraphQLJSON)
info: JSON;
```

Foydali scalarlar to'plami uchun graphql-scalars paketiga qarang.

#### Custom scalar yaratish

Custom scalarni aniqlash uchun yangi `GraphQLScalarType` instansiyasini yarating. Biz `UUID` custom scalarini yaratamiz.

```typescript
const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validate(uuid: unknown): string | never {
  if (typeof uuid !== 'string' || !regex.test(uuid)) {
    throw new Error('invalid uuid');
  }
  return uuid;
}

export const CustomUuidScalar = new GraphQLScalarType({
  name: 'UUID',
  description: 'A simple UUID parser',
  serialize: (value) => validate(value),
  parseValue: (value) => validate(value),
  parseLiteral: (ast) => validate(ast.value),
});
```

Custom resolverni `forRoot()` metodiga uzatamiz:

```typescript
@Module({
  imports: [
    GraphQLModule.forRoot({
      resolvers: { UUID: CustomUuidScalar },
    }),
  ],
})
export class AppModule {}
```

Endi klasslarimizda `UUID` turidan foydalanishimiz mumkin.

```typescript
@Field(() => CustomUuidScalar)
uuid: string;
```

#### Schema first

Custom scalarni aniqlash uchun (scalarlarga oid batafsil ma'lumot bu yerda), type ta'rifi va maxsus resolver yarating. Bu yerda (rasmiy hujjatlardagi kabi) namoyish uchun `graphql-type-json` paketidan foydalanamiz. Bu npm paket `JSON` GraphQL scalar turini belgilaydi.

Avval paketni o'rnating:

```bash
$ npm i --save graphql-type-json
```

Paket o'rnatilgach, `forRoot()` metodiga custom resolver uzatamiz:

```typescript
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      resolvers: { JSON: GraphQLJSON },
    }),
  ],
})
export class AppModule {}
```

Endi type ta'riflarimizda `JSON` scalaridan foydalanamiz:

```graphql
scalar JSON

type Foo {
  field: JSON
}
```

Scalar turini aniqlashning yana bir usuli - oddiy klass yaratish. Masalan, schemamizni `Date` turi bilan boyitmoqchi bo'lsak.

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date')
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
```

Shu bilan, `DateScalar`ni provider sifatida ro'yxatdan o'tkazing.

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}
```

Endi type ta'riflarimizda `Date` scalaridan foydalanamiz.

```graphql
scalar Date
```

Default holatda barcha scalarlar uchun generatsiya qilingan TypeScript ta'rifi `any` bo'ladi - bu unchalik typesafe emas.
Biroq, turlarni qanday generatsiya qilishni belgilayotganda custom scalarlar uchun Nest typingsni qanday generatsiya qilishini sozlashingiz mumkin:

```typescript
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();

definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  defaultScalarType: 'unknown',
  customScalarTypeMapping: {
    DateTime: 'Date',
    BigNumber: '_BigNumber',
  },
  additionalHeader: "import _BigNumber from 'bignumber.js'",
});
```

> info **Hint** Muqobil ravishda type reference ham berishingiz mumkin, masalan: `DateTime: Date`. Bu holatda `GraphQLDefinitionsFactory` ko'rsatilgan tur (`Date.name`)ning `name` xossasini ajratib olib TS ta'riflarini generatsiya qiladi. Eslatma: built-in bo'lmagan turlar (custom turlar) uchun import bayonotini qo'shish kerak.

Endi quyidagi GraphQL custom scalar turlarini olamiz:

```graphql
scalar DateTime
scalar BigNumber
scalar Payload
```

Endi `src/graphql.ts` faylida quyidagi generatsiya qilingan TypeScript ta'riflarini ko'ramiz:

```typescript
import _BigNumber from 'bignumber.js';

export type DateTime = Date;
export type BigNumber = _BigNumber;
export type Payload = unknown;
```

Bu yerda `customScalarTypeMapping` xossasidan foydalanib custom scalarlar uchun istalgan turlar xaritasini berdik. Shuningdek, bu ta'riflar uchun kerakli importlarni qo'shish uchun `additionalHeader` xossasini ham berdik. Nihoyat, `defaultScalarType`ni `'unknown'` qilib o'rnatdik, shunda `customScalarTypeMapping`da ko'rsatilmagan har qanday custom scalar `any` o'rniga `unknown`ga map qilinadi (TypeScript 3.0 dan beri TypeScript tavsiyasi type safety uchun).

> info **Hint** `_BigNumber`ni `bignumber.js`dan import qilganimizga e'tibor bering; bu circular type referencesdan qochish uchun.
