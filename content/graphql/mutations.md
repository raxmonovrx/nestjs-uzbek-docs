---
title: "Mutatsiyalar"
navTitle: "Mutatsiyalar"
description: "GraphQL haqida ko'p muhokamalar ma'lumot olishga qaratilgan, ammo to'liq ma'lumot platformasi server tomondagi ma'lumotlarni o'zgartirish usuliga ham muhtoj. RESTda har qanday so'r"
order: 10
group: graphql
groupTitle: "GraphQL"
---
GraphQL haqida ko'p muhokamalar ma'lumot olishga qaratilgan, ammo to'liq ma'lumot platformasi server tomondagi ma'lumotlarni o'zgartirish usuliga ham muhtoj. RESTda har qanday so'rov serverda side-effect keltirib chiqarishi mumkin, ammo eng yaxshi amaliyot GET so'rovlarida ma'lumotni o'zgartirmaslikni tavsiya qiladi. GraphQL ham shunga o'xshaydi - texnik jihatdan har qanday query ma'lumot yozish bilan implementatsiya qilinishi mumkin. Biroq, RESTdagi kabi, yozishlarni keltirib chiqaradigan operatsiyalarni aniq mutatsiya orqali yuborish tavsiya etiladi (batafsil bu yerda).

Rasmiy Apollo hujjatlarida `upvotePost()` mutatsiyasi misoli keltiriladi. Bu mutatsiya postning `votes` xossasini oshiradigan metodni implementatsiya qiladi. Nestda shunga o'xshash mutatsiya yaratish uchun `@Mutation()` dekoratoridan foydalanamiz.

#### Code first

Oldingi bo'limda ishlatilgan `AuthorResolver` ga yana bir metod qo'shamiz (qarang: resolvers).

```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

> info **Hint** Barcha dekoratorlar (`@Resolver`, `@ResolveField`, `@Args` va h.k.) `@nestjs/graphql` paketidan eksport qilinadi.

Bu GraphQL schema ning SDLda quyidagi qismini generatsiya qiladi:

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}
```

`upvotePost()` metodi `postId` (`Int`) argumentini oladi va yangilangan `Post` entityni qaytaradi. resolvers bo'limida tushuntirilgan sabablarga ko'ra, kutilayotgan tipni aniq ko'rsatishimiz kerak.

Agar mutatsiya argument sifatida obyekt qabul qilishi kerak bo'lsa, **input type** yaratishimiz mumkin. Input type - bu argument sifatida uzatilishi mumkin bo'lgan maxsus object type (batafsil bu yerda). Input type e'lon qilish uchun `@InputType()` dekoratoridan foydalaning.

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}
```

> info **Hint** `@InputType()` dekoratori argument sifatida opsiyalar obyektini qabul qiladi, shuning uchun, masalan, input type tavsifini belgilashingiz mumkin. Shuni yodda tutingki, TypeScript metadata reflection tizimidagi cheklovlar tufayli, turini qo'lda ko'rsatish uchun `@Field` dekoratoridan foydalanishingiz yoki [CLI plugin](/docs/graphql/cli-plugin)dan foydalanishingiz kerak.

So'ng bu type ni resolver klassida ishlatamiz:

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}
```

#### Schema first

Oldingi bo'limda ishlatilgan `AuthorResolver` ni kengaytiramiz (qarang: resolvers).

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

Yuqorida biznes mantiq `PostsService` ga ko'chirilgan deb faraz qildik (postni topish va `votes` xossasini oshirish). `PostsService` ichidagi mantiq ehtiyojga qarab sodda yoki murakkab bo'lishi mumkin. Bu misolning asosiy maqsadi resolvers qanday qilib boshqa providerlar bilan ishlashini ko'rsatishdir.

Oxirgi qadam - mutatsiyani mavjud types definitionga qo'shish.

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post]
}

type Post {
  id: Int!
  title: String
  votes: Int
}

type Query {
  author(id: Int!): Author
}

type Mutation {
  upvotePost(postId: Int!): Post
}
```

`upvotePost(postId: Int!): Post` mutatsiyasi endi ilovamizning GraphQL API si tarkibida chaqirilishi mumkin.
