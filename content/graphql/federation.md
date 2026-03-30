---
title: "Federatsiya"
navTitle: "Federatsiya"
description: "Federatsiya monolit GraphQL serveringizni mustaqil mikroservislarga bo'lish imkonini beradi. U ikki komponentdan iborat: gateway va bir yoki bir nechta federatsiyalangan mikroservi"
order: 5
group: graphql
groupTitle: "GraphQL"
---
Federatsiya monolit GraphQL serveringizni mustaqil mikroservislarga bo'lish imkonini beradi. U ikki komponentdan iborat: gateway va bir yoki bir nechta federatsiyalangan mikroservis. Har bir mikroservis schema ning bir qismini saqlaydi va gateway ularni bitta schema ga birlashtirib, klientga taqdim etadi.

Apollo docsdan iqtibos keltirsak, Federatsiya quyidagi asosiy tamoyillar bilan yaratilgan:

- Grafni qurish **deklarativ** bo'lishi kerak. Federatsiyada grafni schema ichida deklarativ tarzda kompozitsiya qilasiz, imperativ schema stitching kodini yozmaysiz.
- Kod **turlar** bo'yicha emas, **concern** bo'yicha ajratilishi kerak. Ko'pincha User yoki Product kabi muhim turlarning barcha jihatlarini bitta jamoa boshqarmaydi, shuning uchun bu turlar ta'rifi markazlashtirilgan emas, balki jamoalar va kod bazalari bo'ylab taqsimlangan bo'lishi kerak.
- Graf klientlar uchun foydalanishga qulay bo'lishi kerak. Federatsiyalangan servislar birgalikda klientdagi iste'mol uslubini aniq aks ettiradigan to'liq, mahsulotga yo'naltirilgan grafni hosil qiladi.
- Bu shunchaki **GraphQL** bo'lib, tilning faqat spetsifikatsiyaga mos imkoniyatlaridan foydalanadi. Federatsiyani faqat JavaScript emas, istalgan til implementatsiya qilishi mumkin.

> warning **Warning** Federatsiya hozircha subscriptions ni qo'llab-quvvatlamaydi.

Quyidagi bo'limlarda gateway va ikki federatsiyalangan endpointdan (Users service va Posts service) iborat demo ilovani sozlaymiz.

#### Apollo bilan Federatsiya

Avval kerakli bog'liqliklarni o'rnating:

```bash
$ npm install --save @apollo/subgraph
```

#### Schema first

"User service" oddiy schema taqdim etadi. `@key` direktiviga e'tibor bering: u Apollo query plannerga `User`ning muayyan instansiyasini `id` ko'rsatilsa olish mumkinligini bildiradi. Shuningdek, `Query` turini `extend` qilayotganimizga e'tibor bering.

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}
```

Resolver qo'shimcha `resolveReference()` metodini taqdim etadi. Bu metod Apollo Gateway boshqa bog'liq resursga `User` instansiyasi kerak bo'lganda ishga tushadi. Buni keyinroq Posts service misolida ko'ramiz. Eslatma: metod `@ResolveReference()` dekoratori bilan belgilanishi kerak.

```typescript
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  getUser(@Args('id') id: string) {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.usersService.findById(reference.id);
  }
}
```

Oxirida hammasini `GraphQLModule` ga `ApolloFederationDriver` driverini konfiguratsiya obyektida ko'rsatib ulaymiz:

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [UsersResolver],
})
export class AppModule {}
```

#### Code first

`User` entityga bir nechta qo'shimcha dekoratorlarni qo'shishdan boshlaymiz.

```ts
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
```

Resolver qo'shimcha `resolveReference()` metodini taqdim etadi. Bu metod Apollo Gateway boshqa bog'liq resursga `User` instansiyasi kerak bo'lganda ishga tushadi. Buni keyinroq Posts service misolida ko'ramiz. Eslatma: metod `@ResolveReference()` dekoratori bilan belgilanishi kerak.

```ts
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  getUser(@Args('id') id: number): User {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }): User {
    return this.usersService.findById(reference.id);
  }
}
```

Oxirida hammasini `GraphQLModule` ga `ApolloFederationDriver` driverini konfiguratsiya obyektida ko'rsatib ulaymiz:

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // Not included in this example

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class AppModule {}
```

Ishlaydigan misol code first rejimida bu yerda va schema first rejimida bu yerda mavjud.

#### Federatsiyalangan misol: Posts

Posts service `getPosts` query orqali agregatsiya qilingan postlarni taqdim etishi, shuningdek `User` turini `user.posts` fieldi bilan kengaytirishi kerak.

#### Schema first

"Posts service" schema ichida `extend` keywordi orqali `User` turiga murojaat qiladi. U `User` turiga bitta qo'shimcha xossa (`posts`) qo'shadi. User instansiyalarini moslashtirish uchun ishlatiladigan `@key` direktiviga va `id` fieldi boshqa joyda boshqarilishini bildiruvchi `@external` direktivasiga e'tibor bering.

```graphql
type Post @key(fields: "id") {
  id: ID!
  title: String!
  body: String!
  user: User
}

extend type User @key(fields: "id") {
  id: ID! @external
  posts: [Post]
}

extend type Query {
  getPosts: [Post]
}
```

Quyidagi misolda `PostsResolver` `getUser()` metodini taqdim etadi; u `__typename` va ilovangiz reference ni yechish uchun kerak bo'lishi mumkin bo'lgan qo'shimcha xossalar (bu holatda `id`)ni o'z ichiga olgan reference qaytaradi. `__typename` GraphQL Gatewayga `User` turi uchun mas'ul mikroservisni aniqlash va mos instansiyani olishga yordam beradi. Yuqorida tasvirlangan "Users service" `resolveReference()` metodi bajarilganda chaqiriladi.

```typescript
import { Query, Resolver, Parent, ResolveField } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './posts.interfaces';

@Resolver('Post')
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query('getPosts')
  getPosts() {
    return this.postsService.findAll();
  }

  @ResolveField('user')
  getUser(@Parent() post: Post) {
    return { __typename: 'User', id: post.userId };
  }
}
```

Oxirida `GraphQLModule` ni "Users service" bo'limida qilganimiz kabi ro'yxatdan o'tkazishimiz kerak.

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PostsResolver } from './posts.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [PostsResolvers],
})
export class AppModule {}
```

#### Code first

Avval `User` entityni ifodalovchi klassni e'lon qilishimiz kerak. Entityning o'zi boshqa servisda bo'lsa-da, bu yerda uni ishlatamiz (ta'rifini kengaytiramiz). `@extends` va `@external` direktivalariga e'tibor bering.

```ts
import { Directive, ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  @Directive('@external')
  id: number;

  @Field(() => [Post])
  posts?: Post[];
}
```

Endi `User` entitydagi kengaytma uchun mos resolverni quyidagicha yaratamiz:

```ts
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField(() => [Post])
  public posts(@Parent() user: User): Post[] {
    return this.postsService.forAuthor(user.id);
  }
}
```

`Post` entity klassini ham aniqlashimiz kerak:

```ts
import { Directive, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Directive('@key(fields: "id")')
export class Post {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => Int)
  authorId: number;

  @Field(() => User)
  user?: User;
}
```

Va uning resolvery:

```ts
import { Query, Args, ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => Post)
  findPost(@Args('id') id: number): Post {
    return this.postsService.findOne(id);
  }

  @Query(() => [Post])
  getPosts(): Post[] {
    return this.postsService.all();
  }

  @ResolveField(() => User)
  user(@Parent() post: Post): any {
    return { __typename: 'User', id: post.authorId };
  }
}
```

Va nihoyat, hammasini modulda bog'laymiz. Schema build opsiyalariga e'tibor bering, bu yerda `User` yetim (tashqi) tur ekanini ko'rsatamiz.

```ts
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { User } from './user.entity';
import { PostsResolvers } from './posts.resolvers';
import { UsersResolvers } from './users.resolvers';
import { PostsService } from './posts.service'; // Not included in example

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
  ],
  providers: [PostsResolver, UsersResolver, PostsService],
})
export class AppModule {}
```

Ishlaydigan misol code first rejimi uchun bu yerda va schema first rejimi uchun bu yerda mavjud.

#### Federatsiyalangan misol: Gateway

Avval kerakli bog'liqlikni o'rnating:

```bash
$ npm install --save @apollo/gateway
```

Gateway endpointlar ro'yxatini talab qiladi va mos schemalarni avtomatik topadi. Shuning uchun gateway servisining implementatsiyasi code va schema first yondashuvlari uchun bir xil bo'ladi.

```typescript
import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        // ... Apollo server options
        cors: true,
      },
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'users', url: 'http://user-service/graphql' },
            { name: 'posts', url: 'http://post-service/graphql' },
          ],
        }),
      },
    }),
  ],
})
export class AppModule {}
```

Ishlaydigan misol code first rejimi uchun bu yerda va schema first rejimi uchun bu yerda mavjud.

#### Mercurius bilan Federatsiya

Avval kerakli bog'liqliklarni o'rnating:

```bash
$ npm install --save @apollo/subgraph @nestjs/mercurius
```

> info **Note** `@apollo/subgraph` paketi subgraph schema ni yaratish uchun kerak (`buildSubgraphSchema`, `printSubgraphSchema` funksiyalari).

#### Schema first

"User service" oddiy schema taqdim etadi. `@key` direktiviga e'tibor bering: u Mercurius query plannerga `User`ning muayyan instansiyasini `id` ko'rsatilsa olish mumkinligini bildiradi. Shuningdek, `Query` turini `extend` qilayotganimizga e'tibor bering.

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}
```

Resolver qo'shimcha `resolveReference()` metodini taqdim etadi. Bu metod Mercurius Gateway boshqa bog'liq resursga `User` instansiyasi kerak bo'lganda ishga tushadi. Buni keyinroq Posts service misolida ko'ramiz. Eslatma: metod `@ResolveReference()` dekoratori bilan belgilanishi kerak.

```typescript
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  getUser(@Args('id') id: string) {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.usersService.findById(reference.id);
  }
}
```

Oxirida `GraphQLModule` ga `MercuriusFederationDriver` driverini konfiguratsiya obyektida ko'rsatib ulaymiz:

```typescript
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusFederationDriverConfig>({
      driver: MercuriusFederationDriver,
      typePaths: ['**/*.graphql'],
      federationMetadata: true,
    }),
  ],
  providers: [UsersResolver],
})
export class AppModule {}
```

#### Code first

`User` entityga bir nechta qo'shimcha dekoratorlarni qo'shishdan boshlaymiz.

```ts
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
```

Resolver qo'shimcha `resolveReference()` metodini taqdim etadi. Bu metod Mercurius Gateway boshqa bog'liq resursga `User` instansiyasi kerak bo'lganda ishga tushadi. Buni keyinroq Posts service misolida ko'ramiz. Eslatma: metod `@ResolveReference()` dekoratori bilan belgilanishi kerak.

```ts
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  getUser(@Args('id') id: number): User {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }): User {
    return this.usersService.findById(reference.id);
  }
}
```

Oxirida `GraphQLModule` ga `MercuriusFederationDriver` driverini konfiguratsiya obyektida ko'rsatib ulaymiz:

```typescript
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // Not included in this example

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusFederationDriverConfig>({
      driver: MercuriusFederationDriver,
      autoSchemaFile: true,
      federationMetadata: true,
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class AppModule {}
```

#### Federatsiyalangan misol: Posts

Posts service `getPosts` query orqali agregatsiya qilingan postlarni taqdim etishi, shuningdek `User` turini `user.posts` fieldi bilan kengaytirishi kerak.

#### Schema first

"Posts service" schema ichida `extend` keywordi orqali `User` turiga murojaat qiladi. U `User` turiga bitta qo'shimcha xossa (`posts`) qo'shadi. User instansiyalarini moslashtirish uchun ishlatiladigan `@key` direktiviga va `id` fieldi boshqa joyda boshqarilishini bildiruvchi `@external` direktivasiga e'tibor bering.

```graphql
type Post @key(fields: "id") {
  id: ID!
  title: String!
  body: String!
  user: User
}

extend type User @key(fields: "id") {
  id: ID! @external
  posts: [Post]
}

extend type Query {
  getPosts: [Post]
}
```

Quyidagi misolda `PostsResolver` `getUser()` metodini taqdim etadi; u `__typename` va ilovangiz reference ni yechish uchun kerak bo'lishi mumkin bo'lgan qo'shimcha xossalar (bu holatda `id`)ni o'z ichiga olgan reference qaytaradi. `__typename` GraphQL Gatewayga `User` turi uchun mas'ul mikroservisni aniqlash va mos instansiyani olishga yordam beradi. Yuqorida tasvirlangan "Users service" `resolveReference()` metodi bajarilganda chaqiriladi.

```typescript
import { Query, Resolver, Parent, ResolveField } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './posts.interfaces';

@Resolver('Post')
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query('getPosts')
  getPosts() {
    return this.postsService.findAll();
  }

  @ResolveField('user')
  getUser(@Parent() post: Post) {
    return { __typename: 'User', id: post.userId };
  }
}
```

Oxirida `GraphQLModule` ni "Users service" bo'limida qilganimiz kabi ro'yxatdan o'tkazishimiz kerak.

```typescript
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PostsResolver } from './posts.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusFederationDriverConfig>({
      driver: MercuriusFederationDriver,
      federationMetadata: true,
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [PostsResolvers],
})
export class AppModule {}
```

#### Code first

Avval `User` entityni ifodalovchi klassni e'lon qilishimiz kerak. Entityning o'zi boshqa servisda bo'lsa-da, bu yerda uni ishlatamiz (ta'rifini kengaytiramiz). `@extends` va `@external` direktivalariga e'tibor bering.

```ts
import { Directive, ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  @Directive('@external')
  id: number;

  @Field(() => [Post])
  posts?: Post[];
}
```

Endi `User` entitydagi kengaytma uchun mos resolverni quyidagicha yaratamiz:

```ts
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField(() => [Post])
  public posts(@Parent() user: User): Post[] {
    return this.postsService.forAuthor(user.id);
  }
}
```

`Post` entity klassini ham aniqlashimiz kerak:

```ts
import { Directive, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Directive('@key(fields: "id")')
export class Post {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => Int)
  authorId: number;

  @Field(() => User)
  user?: User;
}
```

Va uning resolvery:

```ts
import { Query, Args, ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => Post)
  findPost(@Args('id') id: number): Post {
    return this.postsService.findOne(id);
  }

  @Query(() => [Post])
  getPosts(): Post[] {
    return this.postsService.all();
  }

  @ResolveField(() => User)
  user(@Parent() post: Post): any {
    return { __typename: 'User', id: post.authorId };
  }
}
```

Va nihoyat, hammasini modulda bog'laymiz. Schema build opsiyalariga e'tibor bering, bu yerda `User` yetim (tashqi) tur ekanini ko'rsatamiz.

```ts
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { User } from './user.entity';
import { PostsResolvers } from './posts.resolvers';
import { UsersResolvers } from './users.resolvers';
import { PostsService } from './posts.service'; // Not included in example

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusFederationDriverConfig>({
      driver: MercuriusFederationDriver,
      autoSchemaFile: true,
      federationMetadata: true,
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
  ],
  providers: [PostsResolver, UsersResolver, PostsService],
})
export class AppModule {}
```

#### Federatsiyalangan misol: Gateway

Gateway endpointlar ro'yxatini talab qiladi va mos schemalarni avtomatik topadi. Shuning uchun gateway servisining implementatsiyasi code va schema first yondashuvlari uchun bir xil bo'ladi.

```typescript
import {
  MercuriusGatewayDriver,
  MercuriusGatewayDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusGatewayDriverConfig>({
      driver: MercuriusGatewayDriver,
      gateway: {
        services: [
          { name: 'users', url: 'http://user-service/graphql' },
          { name: 'posts', url: 'http://post-service/graphql' },
        ],
      },
    }),
  ],
})
export class AppModule {}
```

### Federatsiya 2

Apollo docsdan iqtibos keltirsak, Federatsiya 2 original Apollo Federation (bu hujjatda Federation 1 deb ataladi)ga nisbatan developer tajribasini yaxshilaydi va original supergraphlarning ko'pchiligi bilan orqaga mos keladi.

> warning **Warning** Mercurius Federatsiya 2 ni to'liq qo'llab-quvvatlamaydi. Federatsiya 2 ni qo'llab-quvvatlaydigan kutubxonalar ro'yxatini bu yerda ko'rishingiz mumkin.

Quyidagi bo'limlarda oldingi misolni Federatsiya 2 ga yangilaymiz.

#### Federatsiyalangan misol: Users

Federatsiya 2 dagi o'zgarishlardan biri - entitylarning originating subgraphi yo'q, shuning uchun endi `Query`ni extend qilish shart emas. Batafsil ma'lumot uchun Apollo Federation 2 hujjatlaridagi entities mavzusiga qarang.

#### Schema first

Schemadan `extend` keywordini olib tashlash kifoya.

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

type Query {
  getUser(id: ID!): User
}
```

#### Code first

Federatsiya 2 dan foydalanish uchun `autoSchemaFile` opsiyasida federatsiya versiyasini ko'rsatish kerak.

```ts
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // Not included in this example

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class AppModule {}
```

#### Federatsiyalangan misol: Posts

Yuqoridagi sabab bilan, endi `User` va `Query`ni extend qilish shart emas.

#### Schema first

Schemadan `extend` va `external` direktivlarini olib tashlash kifoya.

```graphql
type Post @key(fields: "id") {
  id: ID!
  title: String!
  body: String!
  user: User
}

type User @key(fields: "id") {
  id: ID!
  posts: [Post]
}

type Query {
  getPosts: [Post]
}
```

#### Code first

Endi `User` entityni extend qilmaganimiz uchun, `User` dan `extends` va `external` direktivalarini olib tashlash kifoya.

```ts
import { Directive, ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: number;

  @Field(() => [Post])
  posts?: Post[];
}
```

Shuningdek, User service dagi kabi, `GraphQLModule` da Federatsiya 2 ni ishlatishni ko'rsatishimiz kerak.

```ts
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { User } from './user.entity';
import { PostsResolvers } from './posts.resolvers';
import { UsersResolvers } from './users.resolvers';
import { PostsService } from './posts.service'; // Not included in example

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
  ],
  providers: [PostsResolver, UsersResolver, PostsService],
})
export class AppModule {}
```
