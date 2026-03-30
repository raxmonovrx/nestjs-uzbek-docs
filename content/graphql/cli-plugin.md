---
title: "CLI plagin"
navTitle: "CLI plagin"
description: "TypeScriptning metadata reflection tizimida bir nechta cheklovlar bor: masalan, klass qaysi xossalardan iboratligini aniqlash yoki berilgan xossa ixtiyoriy yoki majburiyligini bili"
order: 1
group: graphql
groupTitle: "GraphQL"
---
> warning **Warning** Bu bob faqat code first yondashuviga tegishli.

TypeScriptning metadata reflection tizimida bir nechta cheklovlar bor: masalan, klass qaysi xossalardan iboratligini aniqlash yoki berilgan xossa ixtiyoriy yoki majburiyligini bilish imkonsiz. Biroq, bu cheklovlarning ayrimlarini kompilyatsiya vaqtida hal qilish mumkin. Nest TypeScript kompilyatsiya jarayonini yaxshilaydigan plagin taqdim etadi, bu esa kerakli boilerplate kod miqdorini kamaytiradi.

> info **Hint** Bu plagin **opt-in**. Xohlasangiz, barcha dekoratorlarni qo'lda e'lon qilishingiz yoki faqat kerak bo'lgan dekoratorlarni qo'shishingiz mumkin.

#### Umumiy ko'rinish

GraphQL plagin avtomatik ravishda:

- barcha input object, object type va args klasslaridagi xossalarni `@Field` bilan annotatsiya qiladi, agar `@HideField` ishlatilmagan bo'lsa
- savol belgisi mavjudligiga qarab `nullable` xossasini o'rnatadi (masalan, `name?: string` bo'lsa `nullable: true` bo'ladi)
- turiga qarab `type` xossasini o'rnatadi (massivlarni ham qo'llab-quvvatlaydi)
- kommentariylar asosida xossalar uchun tavsiflarni generatsiya qiladi (`introspectComments` `true` bo'lsa)

E'tibor bering, fayl nomlari plagin tomonidan tahlil qilinishi uchun quyidagi suffixlardan biriga **ega bo'lishi shart**: `['.input.ts', '.args.ts', '.entity.ts', '.model.ts']` (masalan, `author.entity.ts`). Agar boshqa suffixdan foydalansangiz, `typeFileNameSuffix` opsiyasini ko'rsatib plagin xatti-harakatini sozlashingiz mumkin (quyida qarang).

Hozirgacha o'rganganlarimiz asosida, type GraphQLda qanday e'lon qilinishi kerakligini paketga bildirish uchun ko'p kodni takrorlashga to'g'ri keladi. Masalan, oddiy `Author` klassini quyidagicha belgilashingiz mumkin:

```typescript
@@filename(authors/models/author.model)
@ObjectType()
export class Author {
  @Field(type => ID)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Post])
  posts: Post[];
}
```

O'rta hajmdagi loyihalar uchun bu katta muammo emas, ammo klasslar to'plami katta bo'lsa, bu yondashuv haddan tashqari batafsil va boshqarish qiyin bo'lib qoladi.

GraphQL plaginini yoqsangiz, yuqoridagi klass ta'rifini quyidagicha soddalashtirib yozishingiz mumkin:

```typescript
@@filename(authors/models/author.model)
@ObjectType()
export class Author {
  @Field(type => ID)
  id: number;
  firstName?: string;
  lastName?: string;
  posts: Post[];
}
```

Plagin **Abstract Syntax Tree** asosida kerakli dekoratorlarni dinamik qo'shadi. Shunday qilib, butun kod bo'ylab `@Field` dekoratorlarini qo'lda tarqatish bilan ovora bo'lmaysiz.

> info **Hint** Plagin yetishmayotgan GraphQL xossalarini avtomatik generatsiya qiladi, ammo ularni override qilish kerak bo'lsa, `@Field()` orqali ularni aniq belgilang.

#### Kommentariylarni introspektsiya qilish

Kommentariylarni introspektsiya qilish yoqilgan bo'lsa, CLI plagin kommentariylar asosida fieldlar uchun tavsiflarni generatsiya qiladi.

Masalan, quyidagi `roles` xossasiga qarang:

```typescript
/**
 * A list of user's roles
 */
@Field(() => [String], {
  description: `A list of user's roles`
})
roles: string[];
```

Bu yerda tavsif qiymatini takrorlashga to'g'ri keladi. `introspectComments` yoqilganda, CLI plagin bu kommentariylarni ajratib olib, xossalar uchun avtomatik tavsiflarni taqdim eta oladi. Endi yuqoridagi fieldni quyidagicha yozish kifoya:

```typescript
/**
 * A list of user's roles
 */
roles: string[];
```

#### CLI plaginini ishlatish

Plaginni yoqish uchun `nest-cli.json` faylini oching (agar [Nest CLI](/docs/cli/overview) dan foydalansangiz) va quyidagi `plugins` konfiguratsiyasini qo'shing:

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}
```

Plagin xatti-harakatini sozlash uchun `options` xossasidan foydalanishingiz mumkin.

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/graphql",
        "options": {
          "typeFileNameSuffix": [".input.ts", ".args.ts"],
          "introspectComments": true
        }
      }
    ]
  }
}

```

`options` xossasi quyidagi interfeysga mos bo'lishi kerak:

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}
```

<table>
  <tr>
    <th>Option</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>typeFileNameSuffix</code></td>
    <td><code>['.input.ts', '.args.ts', '.entity.ts', '.model.ts']</code></td>
    <td>GraphQL type fayllari suffixi</td>
  </tr>
  <tr>
    <td><code>introspectComments</code></td>
      <td><code>false</code></td>
      <td>True bo'lsa, plagin kommentariylar asosida xossalar uchun tavsiflar generatsiya qiladi</td>
  </tr>
</table>

Agar CLI dan foydalanmasangiz va custom `webpack` konfiguratsiyangiz bo'lsa, bu plaginni `ts-loader` bilan birga ishlatishingiz mumkin:

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),
```

#### SWC builder

Standart setup (monorepo emas) uchun, SWC builder bilan CLI plaginlaridan foydalanish uchun type checkingni yoqishingiz kerak, bu [bu yerda](/docs/recipes/swc#type-checking) tasvirlangan.

```bash
$ nest start -b swc --type-check
```

Monorepo setup uchun, [bu yerdagi](/docs/recipes/swc#monorepo-and-cli-plugins) ko'rsatmalarga amal qiling.

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts
```

Endi serializatsiya qilingan metadata fayli `GraphQLModule` metodiga quyidagicha yuklanishi kerak:

```typescript
import metadata from './metadata'; // <-- file auto-generated by the "PluginMetadataGenerator"

GraphQLModule.forRoot<...>({
  ..., // other options
  metadata,
}),
```

#### `ts-jest` bilan integratsiya (e2e testlar)

Ushbu plagin yoqilgan holda e2e testlarni ishga tushirayotganda, schema kompilyatsiyasida muammo bo'lishi mumkin. Masalan, eng ko'p uchraydigan xatolardan biri:

```json
Object type <name> must define one or more fields.
```

Bu `jest` konfiguratsiyasi `@nestjs/graphql/plugin` plaginini hech qayerda import qilmagani uchun sodir bo'ladi.

Buni tuzatish uchun e2e testlar direktoriyangizda quyidagi faylni yarating:

```javascript
const transformer = require('@nestjs/graphql/plugin');

module.exports.name = 'nestjs-graphql-transformer';
// you should change the version number anytime you change the configuration below - otherwise, jest will not detect changes
module.exports.version = 1;

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/graphql/plugin options (can be empty)
    },
    cs.program, // "cs.tsCompiler.program" for older versions of Jest (<= v27)
  );
};
```

Shu bilan, `jest` konfiguratsiya faylida AST transformer ni import qiling. Default holatda (starter ilovada) e2e testlar konfiguratsiya fayli `test` papkasi ostida bo'ladi va `jest-e2e.json` deb nomlanadi.

```json
{
  ... // other configuration
  "globals": {
    "ts-jest": {
      "astTransformers": {
        "before": ["<path to the file created above>"]
      }
    }
  }
}
```

Agar `jest@^29` dan foydalansangiz, oldingi yondashuv eskirgan bo'lgani uchun quyidagi parcha koddan foydalaning.

```json
{
  ... // other configuration
  "transform": {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        "astTransformers": {
          "before": ["<path to the file created above>"]
        }
      }
    ]
  }
}
```
