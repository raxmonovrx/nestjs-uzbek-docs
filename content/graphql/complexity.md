---
title: "Murakkablik"
navTitle: "Murakkablik"
description: "So'rov murakkabligi muayyan fieldlar qanchalik murakkabligini belgilash va maksimal murakkablik asosida so'rovlarni cheklash imkonini beradi. G'oya - har bir field uchun murakkabli"
order: 2
group: graphql
groupTitle: "GraphQL"
---
> warning **Warning** Bu bob faqat code first yondashuviga tegishli.

So'rov murakkabligi muayyan fieldlar qanchalik murakkabligini belgilash va **maksimal murakkablik** asosida so'rovlarni cheklash imkonini beradi. G'oya - har bir field uchun murakkablikni oddiy son bilan belgilashdir. Keng tarqalgan default qiymat - har bir field uchun `1` murakkablik berish. Bundan tashqari, GraphQL so'rovi murakkabligini hisoblashni complexity estimatorlar bilan moslashtirish mumkin. Complexity estimator - bu field murakkabligini hisoblaydigan oddiy funksiya. Qoidaga istalgancha estimator qo'shishingiz mumkin, va ular ketma-ket bajariladi. Birinchi bo'lib sonli murakkablik qiymatini qaytargan estimator o'sha field uchun murakkablikni belgilaydi.

`@nestjs/graphql` paketi graphql-query-complexity kabi, cost analysis asosida yechim beradigan vositalar bilan juda yaxshi integratsiya qilinadi. Bu kutubxona yordamida juda qimmat deb baholangan so'rovlarni GraphQL serveringizda rad etishingiz mumkin.

#### O'rnatish

Undan foydalanishni boshlash uchun avval kerakli bog'liqlikni o'rnatamiz.

```bash
$ npm install --save graphql-query-complexity
```

#### Boshlash

O'rnatish jarayoni tugagach, `ComplexityPlugin` klassini aniqlashimiz mumkin:

```typescript
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private gqlSchemaHost: GraphQLSchemaHost) {}

  async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const maxComplexity = 20;
    const { schema } = this.gqlSchemaHost;

    return {
      async didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });
        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
          );
        }
        console.log('Query Complexity:', complexity);
      },
    };
  }
}
```

Namoyish uchun, maksimal ruxsat etilgan murakkablikni `20` deb belgiladik. Yuqoridagi misolda 2 ta estimator ishlatdik: `simpleEstimator` va `fieldExtensionsEstimator`.

- `simpleEstimator`: har bir field uchun qat'iy murakkablikni qaytaradi
- `fieldExtensionsEstimator`: schemadagi har bir field uchun murakkablik qiymatini field extensionsdan oladi

> info **Hint** Bu klassni istalgan moduldagi providers massiviga qo'shishni unutmang.

#### Field darajasidagi murakkablik

Ushbu plagin bilan endi istalgan field uchun murakkablikni `@Field()` dekoratoriga uzatiladigan opsiyalar obyektidagi `complexity` xossasi orqali belgilashingiz mumkin:

```typescript
@Field({ complexity: 3 })
title: string;
```

Muqobil ravishda, estimator funksiyasini belgilashingiz mumkin:

```typescript
@Field({ complexity: (options: ComplexityEstimatorArgs) => ... })
title: string;
```

#### Query/Mutation darajasidagi murakkablik

Bundan tashqari, `@Query()` va `@Mutation()` dekoratorlari quyidagicha `complexity` xossasiga ega bo'lishi mumkin:

```typescript
@Query({ complexity: (options: ComplexityEstimatorArgs) => options.args.count * options.childComplexity })
items(@Args('count') count: number) {
  return this.itemsService.getItems({ count });
}
```
