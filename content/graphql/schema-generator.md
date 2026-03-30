---
title: "SDL generatsiya qilish"
navTitle: "SDL generatsiya qilish"
description: "GraphQL SDL schemani qo'lda generatsiya qilish uchun (ya'ni ilovani ishga tushirmasdan, bazaga ulamasdan, resolverlarni bog'lamasdan va h.k.), GraphQLSchemaBuilderModuledan foydala"
order: 15
group: graphql
groupTitle: "GraphQL"
---
> warning **Warning** Bu bob faqat code first yondashuviga tegishli.

GraphQL SDL schemani qo'lda generatsiya qilish uchun (ya'ni ilovani ishga tushirmasdan, bazaga ulamasdan, resolverlarni bog'lamasdan va h.k.), `GraphQLSchemaBuilderModule`dan foydalaning.

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}
```

> info **Hint** `GraphQLSchemaBuilderModule` va `GraphQLSchemaFactory` `@nestjs/graphql` paketidan import qilinadi. `printSchema` funksiyasi `graphql` paketidan import qilinadi.

#### Foydalanish

`gqlSchemaFactory.create()` metodi resolver klasslarining referencelaridan iborat massivni qabul qiladi. Masalan:

```typescript
const schema = await gqlSchemaFactory.create([
  RecipesResolver,
  AuthorsResolver,
  PostsResolvers,
]);
```

U shuningdek ikkinchi ixtiyoriy argument sifatida scalar klasslar massividan iborat argumentni ham qabul qiladi:

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);
```

Nihoyat, opsiyalar obyektini ham uzatishingiz mumkin:

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});
```

- `skipCheck`: schema validatsiyasini e'tiborsiz qoldirish; `boolean`, default `false`
- `orphanedTypes`: aniq referens qilinmagan (object graphning bir qismi bo'lmagan) klasslar ro'yxati; ular generatsiya qilinadi. Odatda klass e'lon qilingan, lekin graphda boshqa joyda ishlatilmagan bo'lsa, u tashlab yuboriladi. Bu xossa qiymati klass referencelari massivi.
