---
title: "TypeScript va GraphQL qudratidan foydalanish"
navTitle: "TypeScript va GraphQL qudratidan foydalanish"
description: "GraphQL - bu APIlar uchun kuchli query tili va mavjud ma'lumotlaringiz bilan ushbu so'rovlarni bajarish uchun runtime. Bu REST APIlarda ko'p uchraydigan muammolarni hal qiladigan n"
order: 12
group: graphql
groupTitle: "GraphQL"
---
GraphQL - bu APIlar uchun kuchli query tili va mavjud ma'lumotlaringiz bilan ushbu so'rovlarni bajarish uchun runtime. Bu REST APIlarda ko'p uchraydigan muammolarni hal qiladigan nafis yondashuv. Asosiy ma'lumot uchun GraphQL va REST taqqoslanadigan ushbu taqqoslashni o'qishni tavsiya qilamiz. GraphQL bilan birga TypeScriptdan foydalanish GraphQL so'rovlari uchun yaxshiroq type safety beradi va end-to-end typingni ta'minlaydi.

Bu bobda GraphQL haqida asosiy tushunchalar bor deb faraz qilamiz va ichki `@nestjs/graphql` moduli bilan qanday ishlashga e'tibor qaratamiz. `GraphQLModule`ni Apollo server ( `@nestjs/apollo` driveri bilan) va Mercurius (`@nestjs/mercurius` bilan) uchun sozlash mumkin. Biz ushbu ishonchli GraphQL paketlari uchun rasmiy integratsiyalarni taqdim etamiz, shunda Nest bilan GraphQLdan foydalanish oson bo'ladi (batafsil integratsiyalar [bu yerda](/docs/graphql/quick-start#uchinchi-tomon-integratsiyalari)).

Shuningdek, o'zingizning maxsus driveringizni yaratishingiz ham mumkin (batafsil bu yerda).

#### O'rnatish

Avval kerakli paketlarni o'rnating:

```bash
# For Express and Apollo (default)
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql

# For Fastify and Apollo
# npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql

# For Fastify and Mercurius
# npm i @nestjs/graphql @nestjs/mercurius graphql mercurius
```

> warning **Warning** `@nestjs/graphql@>=9` va `@nestjs/apollo^10` paketlari **Apollo v3** bilan mos (batafsil Apollo Server 3 migration guide), `@nestjs/graphql@^8` esa faqat **Apollo v2** ni qo'llab-quvvatlaydi (masalan, `apollo-server-express@2.x.x` paketi).

#### Umumiy ko'rinish

Nest GraphQL ilovalarini yaratishning ikki usulini taklif qiladi: **code first** va **schema first**. Sizga eng mos keladiganini tanlang. GraphQL bo'limining ko'p boblari ikki qismga bo'lingan: biri **code first** qabul qilganlar uchun, ikkinchisi **schema first** qabul qilganlar uchun.

**Code first** yondashuvida siz dekoratorlar va TypeScript klasslari yordamida GraphQL schema ni generatsiya qilasiz. Bu yondashuv faqat TypeScript bilan ishlashni afzal ko'radigan va til sintaksislari orasida kontekst almashishni istamaydiganlar uchun qulay.

**Schema first** yondashuvida asosiy manba GraphQL SDL (Schema Definition Language) fayllari bo'ladi. SDL - schema fayllarini turli platformalar o'rtasida bo'lishishning tilga bog'liq bo'lmagan usuli. Nest GraphQL schemalar asosida TypeScript ta'riflarini (klasslar yoki interfeyslar) avtomatik yaratadi, bu ortiqcha boilerplate yozishni kamaytiradi.

#### GraphQL va TypeScript bilan boshlash

> info **Hint** Keyingi bo'limlarda `@nestjs/apollo` paketini integratsiya qilamiz. Agar `mercurius`dan foydalanmoqchi bo'lsangiz, [bu bo'lim](/docs/graphql/quick-start#mercurius-integratsiyasi)ga o'ting.

Paketlar o'rnatilgach, `GraphQLModule`ni import qilib, uni `forRoot()` statik metodi bilan sozlashimiz mumkin.

```typescript
@@filename()
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
    }),
  ],
})
export class AppModule {}
```

> info **Hint** `mercurius` integratsiyasi uchun `MercuriusDriver` va `MercuriusDriverConfig` ishlatishingiz kerak. Ikkalasi ham `@nestjs/mercurius` paketidan eksport qilinadi.

`forRoot()` metodi argument sifatida opsiyalar obyektini qabul qiladi. Bu opsiyalar ichki driver instansiyasiga uzatiladi (mavjud sozlamalar haqida batafsil: Apollo va Mercurius). Masalan, `playground`ni o'chirish va `debug` rejimini o'chirishni xohlasangiz (Apollo uchun), quyidagi opsiyalarni bering:

```typescript
@@filename()
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
    }),
  ],
})
export class AppModule {}
```

Bu holatda opsiyalar `ApolloServer` konstruktoriga uzatiladi.

#### GraphQL playground

Playground - bu GraphQL serverining o'zi bilan bir xil URLda default mavjud bo'lgan grafik, interaktiv, brauzerdagi GraphQL IDE. Playgroundga kirish uchun oddiy GraphQL server sozlangan va ishlayotgan bo'lishi kerak. Uni hoziroq ko'rish uchun bu yerda ishlaydigan misolni o'rnatib ishga tushirishingiz mumkin. Yoki agar shu kod namunalarini bosqichma-bosqich bajarayotgan bo'lsangiz, [Resolvers](/docs/graphql/resolvers-map) bobidagi qadamlarni tugatganingizdan so'ng playgroundga kirishingiz mumkin.

Shu bilan va ilovangiz fon rejimida ishlayotganida, brauzeringizni ochib `http://localhost:3000/graphql` manziliga o'ting (host va port konfiguratsiyangizga qarab farq qiladi). Shunda siz quyida ko'rsatilgandek GraphQL playgroundni ko'rasiz.

> info **Note** `@nestjs/mercurius` integratsiyasida built-in GraphQL Playground yo'q. Buning o'rniga GraphiQLdan foydalanishingiz mumkin (`graphiql: true` qilib qo'ying).

> warning **Warning** Yangilanish (04/14/2025): Default Apollo playground eskirgan va keyingi major release da olib tashlanadi. Buning o'rniga GraphiQLdan foydalanishingiz mumkin, shunchaki `GraphQLModule` konfiguratsiyasida `graphiql: true` qilib qo'ying, quyida ko'rsatilgandek:
>
> ```typescript
> GraphQLModule.forRoot<ApolloDriverConfig>({
>   driver: ApolloDriver,
>   graphiql: true,
> }),
> ```
>
> Agar ilovangizda [subscriptions](/docs/graphql/subscriptions) bo'lsa, `graphql-ws`dan foydalaning, chunki `subscriptions-transport-ws` GraphiQL tomonidan qo'llab-quvvatlanmaydi.

#### Code first

**Code first** yondashuvida siz dekoratorlar va TypeScript klasslari yordamida GraphQL schema ni generatsiya qilasiz.

Code first yondashuvini ishlatish uchun opsiyalar obyektiga `autoSchemaFile` xossasini qo'shing:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),
```

`autoSchemaFile` xossasi qiymati avtomatik generatsiya qilingan schema saqlanadigan yo'lni bildiradi. Muqobil ravishda, schema on-the-fly tarzda xotirada generatsiya qilinishi mumkin. Buni yoqish uchun `autoSchemaFile` ni `true` qilib qo'ying:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
}),
```

Default holatda generatsiya qilingan schemadagi turlar kiritilgan modullardagi ta'rif tartibida bo'ladi. Schemani leksikografik tartibda saralash uchun `sortSchema` xossasini `true` qiling:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
}),
```

#### Misol

To'liq ishlaydigan code first misol bu yerda mavjud.

#### Schema first

Schema first yondashuvini ishlatish uchun opsiyalar obyektiga `typePaths` xossasini qo'shing. `typePaths` xossasi `GraphQLModule` qayerdan GraphQL SDL schema definition fayllarini qidirishini ko'rsatadi. Bu fayllar xotirada birlashtiriladi; bu esa schemalarni bir nechta faylga bo'lish va ularni resolverlar yonida joylashtirish imkonini beradi.

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
}),
```

Odatda GraphQL SDL turlariga mos keladigan TypeScript ta'riflari (klasslar va interfeyslar) ham kerak bo'ladi. Bu ta'riflarni qo'lda yaratish ortiqcha va zerikarli. Bu bizni yagona haqiqat manbaisiz qoldiradi -- SDLdagi har bir o'zgarish TypeScript ta'riflarini ham moslashtirishni talab qiladi. Buni hal qilish uchun `@nestjs/graphql` paketi abstrakt sintaksis daraxti (AST) asosida TypeScript ta'riflarini **avtomatik generatsiya** qila oladi. Bu funksiyani yoqish uchun `GraphQLModule`ni sozlashda `definitions` opsiyasini qo'shing.

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
}),
```

`definitions` obyektidagi `path` xossasi generatsiya qilingan TypeScript outputni qayerga saqlashni bildiradi. Default holatda barcha generatsiya qilingan TypeScript turlar interfeys sifatida yaratiladi. Klasslar sifatida generatsiya qilish uchun `outputAs` xossasiga `'class'` qiymatini bering.

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
    outputAs: 'class',
  },
}),
```

Yuqoridagi yondashuv ilova ishga tushganida TypeScript ta'riflarini har safar dinamik generatsiya qiladi. Muqobil ravishda, bularni talab bo'yicha generatsiya qiladigan oddiy skript yozishni afzal ko'rishingiz mumkin. Masalan, `generate-typings.ts` nomli skript yaratamiz:

```typescript
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'node:path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
});
```

Endi bu skriptni istalgan vaqtda ishga tushirishingiz mumkin:

```bash
$ ts-node generate-typings
```

> info **Hint** Skriptni oldindan kompilyatsiya qilib (masalan, `tsc` bilan) so'ng `node` orqali ishga tushirishingiz mumkin.

`.graphql` fayllaridagi har qanday o'zgarishda typelar avtomatik generatsiya qilinishi uchun `generate()` metodiga `watch` opsiyasini uzating.

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});
```

Har bir object type uchun qo'shimcha `__typename` fieldini avtomatik generatsiya qilish uchun `emitTypenameField` opsiyasini yoqing:

```typescript
definitionsFactory.generate({
  // ...
  emitTypenameField: true,
});
```

Resolverlarni (queries, mutations, subscriptions) argumentlarsiz oddiy fieldlar sifatida generatsiya qilish uchun `skipResolverArgs` opsiyasini yoqing:

```typescript
definitionsFactory.generate({
  // ...
  skipResolverArgs: true,
});
```

Enumlarni oddiy TypeScript enumlar o'rniga TypeScript union turlari sifatida generatsiya qilish uchun `enumsAsTypes` opsiyasini `true` qiling:

```typescript
definitionsFactory.generate({
  // ...
  enumsAsTypes: true,
});
```

#### Apollo Sandbox

Mahalliy ishlab chiqish uchun GraphQL IDE sifatida `graphql-playground` o'rniga Apollo Sandboxdan foydalanish uchun quyidagi konfiguratsiyadan foydalaning:

```typescript
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
})
export class AppModule {}
```

#### Misol

To'liq ishlaydigan schema first misol bu yerda mavjud.

#### Generatsiya qilingan schemaga kirish

Ba'zi holatlarda (masalan, end-to-end testlarda) generatsiya qilingan schema obyektiga murojaat qilishni xohlashingiz mumkin. End-to-end testlarda HTTP listenerlardan foydalanmasdan `graphql` obyektidan so'rov yuborishingiz mumkin.

Generatsiya qilingan schemaga (code first yoki schema first yondashuvida) `GraphQLSchemaHost` klassi orqali kirishingiz mumkin:

```typescript
const { schema } = app.get(GraphQLSchemaHost);
```

> info **Hint** `GraphQLSchemaHost#schema` getterini ilova initsializatsiya qilingandan keyin ( `app.listen()` yoki `app.init()` metodi `onModuleInit` hookni ishga tushirgandan so'ng) chaqirishingiz kerak.

#### Async konfiguratsiya

Modul opsiyalarini statik emas, asinxron tarzda uzatish kerak bo'lganda `forRootAsync()` metodidan foydalaning. Aksariyat dinamik modullar kabi, Nest asinxron konfiguratsiya bilan ishlash uchun bir nechta usullarni taqdim etadi.

Usullardan biri - factory funksiyasidan foydalanish:

```typescript
 GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: () => ({
    typePaths: ['./**/*.graphql'],
  }),
}),
```

Boshqa factory providerlar kabi, factory funksiyamiz async bo'lishi va `inject` orqali bog'liqliklarni qabul qilishi mumkin.

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    typePaths: configService.get<string>('GRAPHQL_TYPE_PATHS'),
  }),
  inject: [ConfigService],
}),
```

Muqobil ravishda, quyida ko'rsatilgandek, `GraphQLModule`ni factory o'rniga klass yordamida sozlashingiz mumkin:

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useClass: GqlConfigService,
}),
```

Yuqoridagi konstruktsiya `GqlConfigService` ni `GraphQLModule` ichida instansiyalaydi va opsiyalar obyektini yaratish uchun undan foydalanadi. E'tibor bering, bu misolda `GqlConfigService` `GqlOptionsFactory` interfeysini implementatsiya qilishi kerak, bu quyida ko'rsatilgan. `GraphQLModule` taqdim etilgan klass obyektining `createGqlOptions()` metodini chaqiradi.

```typescript
@Injectable()
class GqlConfigService implements GqlOptionsFactory {
  createGqlOptions(): ApolloDriverConfig {
    return {
      typePaths: ['./**/*.graphql'],
    };
  }
}
```

Agar `GraphQLModule` ichida private nusxa yaratmasdan mavjud opsiyalar providerni qayta ishlatmoqchi bo'lsangiz, `useExisting` sintaksisidan foydalaning.

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  imports: [ConfigModule],
  useExisting: ConfigService,
}),
```

#### Mercurius integratsiyasi

Apolloodan foydalanish o'rniga, Fastify foydalanuvchilari (batafsil [bu yerda](/docs/techniques/performance)) muqobil ravishda `@nestjs/mercurius` driveridan foydalanishi mumkin.

```typescript
@@filename()
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
    }),
  ],
})
export class AppModule {}
```

> info **Hint** Ilova ishga tushgach, brauzeringizni ochib `http://localhost:3000/graphiql` manziliga o'ting. Shunda GraphQL IDEni ko'rasiz.

`forRoot()` metodi argument sifatida opsiyalar obyektini qabul qiladi. Bu opsiyalar ichki driver instansiyasiga uzatiladi. Mavjud sozlamalar haqida batafsil bu yerda o'qing.

#### Bir nechta endpoint

`@nestjs/graphql` modulining yana bir foydali imkoniyati - bir vaqtning o'zida bir nechta endpointlarni xizmat qilish. Bu qaysi modullar qaysi endpointga kirishini tanlash imkonini beradi. Default holatda `GraphQL` butun ilova bo'ylab resolverlarni qidiradi. Bu skanni faqat modulning bir qismiga cheklash uchun `include` xossasidan foydalaning.

```typescript
GraphQLModule.forRoot({
  include: [CatsModule],
}),
```

> warning **Warning** Agar bitta ilovada bir nechta GraphQL endpoint bilan `@apollo/server` va `@as-integrations/fastify` paketlaridan foydalansangiz, `GraphQLModule` konfiguratsiyasida `disableHealthCheck` sozlamasini yoqishni unutmang.

#### Uchinchi tomon integratsiyalari

- GraphQL Yoga

#### Misol

Ishlaydigan misol bu yerda mavjud.
