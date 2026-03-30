---
title: "Direktivlar"
navTitle: "Direktivlar"
description: "Direktiv field yoki fragment inclusion ga biriktirilishi va server xohlagan tarzda so'rov bajarilishiga ta'sir qilishi mumkin (batafsil bu yerda). GraphQL spetsifikatsiyasi bir nec"
order: 3
group: graphql
groupTitle: "GraphQL"
---
Direktiv field yoki fragment inclusion ga biriktirilishi va server xohlagan tarzda so'rov bajarilishiga ta'sir qilishi mumkin (batafsil bu yerda). GraphQL spetsifikatsiyasi bir nechta default direktivlarni taqdim etadi:

- `@include(if: Boolean)` - argument true bo'lsa, bu fieldni natijaga qo'shadi
- `@skip(if: Boolean)` - argument true bo'lsa, bu fieldni o'tkazib yuboradi
- `@deprecated(reason: String)` - fieldni deprecate qilib belgilaydi va xabar ko'rsatadi

Direktiv - bu `@` belgisi bilan boshlanadigan identifikator bo'lib, ixtiyoriy ravishda nomlangan argumentlar ro'yxati bilan keladi; u GraphQL so'rovi va schema tillarining deyarli istalgan elementidan keyin yozilishi mumkin.

#### Custom direktivlar

Apollo/Mercurius sizning direktivingizga duch kelganda nima qilishini belgilash uchun transformer funksiyasini yaratishingiz mumkin. Bu funksiya `mapSchema`dan foydalanib schema ichidagi joylarni (field ta'riflari, type ta'riflari va h.k.) aylanib chiqadi va mos transformatsiyalarni bajaradi.

```typescript
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

export function upperDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string,
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];

      if (upperDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === 'string') {
            return result.toUpperCase();
          }
          return result;
        };
        return fieldConfig;
      }
    },
  });
}
```

Endi `upperDirectiveTransformer` transformatsiya funksiyasini `GraphQLModule#forRoot` metodida `transformSchema` funksiyasi orqali qo'llang:

```typescript
GraphQLModule.forRoot({
  // ...
  transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
});
```

Ro'yxatdan o'tkazilgach, `@upper` direktivini schemamizda ishlatish mumkin. Biroq direktivni qo'llash usuli siz ishlatayotgan yondashuvga bog'liq bo'ladi (code first yoki schema first).

#### Code first

Code first yondashuvida direktivni qo'llash uchun `@Directive()` dekoratoridan foydalaning.

```typescript
@Directive('@upper')
@Field()
title: string;
```

> info **Hint** `@Directive()` dekoratori `@nestjs/graphql` paketidan eksport qilinadi.

Direktivlar fieldlar, field resolverlar, input va object turlar, shuningdek query, mutation va subscriptionlarda qo'llanishi mumkin. Quyida query handler darajasida direktivni qo'llash misoli keltirilgan:

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(() => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

> warn **Warning** `@Directive()` dekoratori orqali qo'llangan direktivlar generatsiya qilingan schema definition faylida aks ettirilmaydi.

Oxirida direktivlarni `GraphQLModule` da quyidagicha e'lon qilishni unutmang:

```typescript
GraphQLModule.forRoot({
  // ...,
  transformSchema: schema => upperDirectiveTransformer(schema, 'upper'),
  buildSchemaOptions: {
    directives: [
      new GraphQLDirective({
        name: 'upper',
        locations: [DirectiveLocation.FIELD_DEFINITION],
      }),
    ],
  },
}),
```

> info **Hint** `GraphQLDirective` va `DirectiveLocation` ikkalasi ham `graphql` paketidan eksport qilinadi.

#### Schema first

Schema first yondashuvida direktivlarni bevosita SDL ichida qo'llang.

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}
```
