---
title: "Subscriptionlar"
navTitle: "Subscriptionlar"
description: "Querylar orqali ma'lumot olish va mutatsiyalar orqali ma'lumotni o'zgartirishdan tashqari, GraphQL spetsifikatsiyasi subscription deb ataladigan uchinchi operatsiya turini ham qo'l"
order: 17
group: graphql
groupTitle: "GraphQL"
---
Querylar orqali ma'lumot olish va mutatsiyalar orqali ma'lumotni o'zgartirishdan tashqari, GraphQL spetsifikatsiyasi `subscription` deb ataladigan uchinchi operatsiya turini ham qo'llab-quvvatlaydi. GraphQL subscriptionlari - serverdan real time xabarlarni tinglashni tanlagan klientlarga serverdan ma'lumot yuborish usuli. Subscriptionlar querylarga o'xshaydi: ular klientga yetkaziladigan fieldlar to'plamini belgilaydi, ammo bitta javobni darhol qaytarish o'rniga kanal ochiladi va serverda muayyan hodisa sodir bo'lganda har safar natija klientga yuboriladi.

Subscriptionlar uchun keng tarqalgan use case - klient tomonni muayyan hodisalar haqida xabardor qilish, masalan yangi obyekt yaratilishi, fieldlar yangilanishi va h.k. (batafsil bu yerda).

#### Apollo driver bilan subscriptionlarni yoqish

Subscriptionlarni yoqish uchun `installSubscriptionHandlers` xossasini `true` qiling.

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  installSubscriptionHandlers: true,
}),
```

> warning **Warning** `installSubscriptionHandlers` konfiguratsiya opsiyasi Apollo serverning so'nggi versiyasidan olib tashlangan va bu paketda ham tez orada deprecate qilinadi. Default holatda `installSubscriptionHandlers` `subscriptions-transport-ws`ga fallback qiladi (batafsil), ammo biz `graphql-ws` (batafsil) kutubxonasidan foydalanishni qat'iy tavsiya qilamiz.

Buning o'rniga `graphql-ws` paketidan foydalanish uchun quyidagi konfiguratsiyani ishlating:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': true
  },
}),
```

> info **Hint** Orqaga moslik uchun `subscriptions-transport-ws` va `graphql-ws` ni bir vaqtda ishlatishingiz ham mumkin.

#### Code first

Code first yondashuvida subscription yaratish uchun `@Subscription()` dekoratoridan (`@nestjs/graphql` paketidan eksport qilinadi) va `graphql-subscriptions` paketidagi `PubSub` klassidan foydalanamiz; u oddiy **publish/subscribe API** taqdim etadi.

Quyidagi subscription handler `PubSub#asyncIterableIterator` chaqiruvi orqali hodisaga **obuna bo'ladi**. Bu metod bitta argument qabul qiladi - `triggerName`, ya'ni event topic nomi.

```typescript
const pubSub = new PubSub();

@Resolver(() => Author)
export class AuthorResolver {
  // ...
  @Subscription(() => Comment)
  commentAdded() {
    return pubSub.asyncIterableIterator('commentAdded');
  }
}
```

> info **Hint** Barcha dekoratorlar `@nestjs/graphql` paketidan, `PubSub` klassi esa `graphql-subscriptions` paketidan eksport qilinadi.

> warning **Note** `PubSub` oddiy `publish` va `subscribe` API taqdim etadigan klass. Bu haqida bu yerda batafsil o'qing. Apollo hujjatlarida default implementatsiya production uchun mos emasligi haqida ogohlantiriladi (batafsil). Production ilovalarida tashqi storega tayanadigan `PubSub` implementatsiyasidan foydalanish kerak (batafsil).

Bu SDLda quyidagi qismini generatsiya qiladi:

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

Subscriptionlar ta'rifi bo'yicha bitta top-level xossaga ega obyekt qaytaradi; bu xossaning kaliti subscription nomi bo'ladi. Bu nom yoki subscription handler metodi nomidan olinadi (yuqorida `commentAdded`) yoki `@Subscription()` dekoratoriga ikkinchi argument sifatida `name` kalitli opsiya berib aniq ko'rsatiladi:

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

Bu konstruktsiya avvalgi kod namunasidagi kabi SDLni hosil qiladi, ammo metod nomini subscriptiondan ajratishga imkon beradi.

#### Publishing

Endi hodisani publish qilish uchun `PubSub#publish` metodidan foydalanamiz. Bu ko'pincha mutatsiya ichida, obyekt graphning bir qismi o'zgarganda klient tomondagi yangilanishni ishga tushirish uchun ishlatiladi. Masalan:

```typescript
@@filename(posts/posts.resolver)
@Mutation(() => Comment)
async addComment(
  @Args('postId', { type: () => Int }) postId: number,
  @Args('comment', { type: () => Comment }) comment: CommentInput,
) {
  const newComment = this.commentsService.addComment({ id: postId, comment });
  pubSub.publish('commentAdded', { commentAdded: newComment });
  return newComment;
}
```

`PubSub#publish` metodi birinchi parametr sifatida `triggerName` (event topic nomi) va ikkinchi parametr sifatida event payloadini qabul qiladi. Avval aytilganidek, subscription ta'rifi bo'yicha qiymat qaytaradi va bu qiymat ma'lum shaklga ega. `commentAdded` subscriptioni uchun generatsiya qilingan SDLga yana bir qarang:

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

Bu subscription `commentAdded` nomli top-level xossaga ega obyekt qaytarishi va bu xossa qiymati `Comment` obyektidan iborat bo'lishi kerakligini bildiradi. Muhim nuqta shuki, `PubSub#publish` orqali yuboriladigan event payloadi subscriptiondan qaytadigan qiymat shakliga mos bo'lishi kerak. Shuning uchun yuqoridagi misolda `pubSub.publish('commentAdded', {{ '{' }} commentAdded: newComment {{ '}' }})` operatori mos shakldagi payload bilan `commentAdded` eventini publish qiladi. Agar bu shakllar mos kelmasa, subscription GraphQL validation bosqichida muvaffaqiyatsiz bo'ladi.

#### Subscriptionlarni filtrlash

Muayyan eventlarni filtrlash uchun `filter` xossasiga filter funksiyasini bering. Bu funksiya array `filter` ga o'xshash ishlaydi. U ikkita argument oladi: event payloadini o'z ichiga olgan `payload` (publish qilingan) va subscription so'rovida uzatilgan argumentlarni o'z ichiga olgan `variables`. Funksiya bu event klientlar uchun publish qilinishi kerakmi-yo'qligini belgilovchi boolean qaytaradi.

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string) {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

#### Subscription payloadini o'zgartirish

Publish qilingan event payloadini o'zgartirish uchun `resolve` xossasiga funksiya bering. Funksiya event payloadini (publish qilingan) qabul qiladi va mos qiymatni qaytaradi.

```typescript
@Subscription(() => Comment, {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

> warning **Note** Agar `resolve` opsiyasidan foydalansangiz, unwrapped payloadni qaytarishingiz kerak (bizning misolda `{{ '{' }} commentAdded: newComment {{ '}' }}` emas, to'g'ridan-to'g'ri `newComment` obyektini qaytaring).

Agar injected providerlarga kirish kerak bo'lsa (masalan, ma'lumotni tekshirish uchun tashqi servisni chaqirish), quyidagi konstruktsiyadan foydalaning.

```typescript
@Subscription(() => Comment, {
  resolve(this: AuthorResolver, value) {
    // "this" refers to an instance of "AuthorResolver"
    return value;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

Xuddi shu konstruktsiya filtrlarda ham ishlaydi:

```typescript
@Subscription(() => Comment, {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

#### Schema first

Nestda shunga teng subscription yaratish uchun `@Subscription()` dekoratoridan foydalanamiz.

```typescript
const pubSub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  // ...
  @Subscription()
  commentAdded() {
    return pubSub.asyncIterableIterator('commentAdded');
  }
}
```

Muayyan eventlarni context va argumentlar bo'yicha filtrlash uchun `filter` xossasini bering.

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

Published payloadni o'zgartirish uchun `resolve` funksiyasidan foydalanamiz.

```typescript
@Subscription('commentAdded', {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

Agar injected providerlarga kirish kerak bo'lsa (masalan, ma'lumotni tekshirish uchun tashqi servisni chaqirish), quyidagi konstruktsiyadan foydalaning:

```typescript
@Subscription('commentAdded', {
  resolve(this: AuthorResolver, value) {
    // "this" refers to an instance of "AuthorResolver"
    return value;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

Xuddi shu konstruktsiya filtrlarda ham ishlaydi:

```typescript
@Subscription('commentAdded', {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

Oxirgi qadam - type definitions faylini yangilash.

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

type Comment {
  id: String
  content: String
}

type Subscription {
  commentAdded(title: String!): Comment
}
```

Shu bilan biz bitta `commentAdded(title: String!): Comment` subscription yaratdik. To'liq namuna implementatsiyani bu yerda topasiz.

#### PubSub

Yuqoridagi misollarda default `PubSub` emitteridan foydalandik (mqemitter).
Afzal yondashuv (production uchun) - `mqemitter-redis`dan foydalanish. Muqobil ravishda, custom `PubSub` implementatsiyasini ham berishingiz mumkin (batafsil).

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: {
    emitter: require('mqemitter-redis')({
      port: 6579,
      host: '127.0.0.1',
    }),
  },
});
```

#### WebSocket orqali autentifikatsiya

Foydalanuvchi autentifikatsiyadan o'tganini tekshirish `subscription` opsiyalarida ko'rsatiladigan `verifyClient` callback funksiyasi ichida bajarilishi mumkin.

`verifyClient` birinchi argument sifatida `info` obyektini oladi; undan so'rov headerlarini olish uchun foydalanishingiz mumkin.

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: {
    verifyClient: (info, next) => {
      const authorization = info.req.headers?.authorization as string;
      if (!authorization?.startsWith('Bearer ')) {
        return next(false);
      }
      next(true);
    },
  }
}),
```

#### Mercurius driver bilan subscriptionlarni yoqish

Subscriptionlarni yoqish uchun `subscription` xossasini `true` qiling.

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: true,
}),
```

> info **Hint** Custom emitter sozlash, kiruvchi ulanishlarni validatsiya qilish va h.k. uchun opsiyalar obyektini ham uzatishingiz mumkin. Batafsil bu yerda o'qing (`subscription` bo'limi).

#### Code first

Code first yondashuvida subscription yaratish uchun `@Subscription()` dekoratoridan (`@nestjs/graphql` paketidan eksport qilinadi) va `mercurius` paketidagi `PubSub` klassidan foydalanamiz; u oddiy **publish/subscribe API** taqdim etadi.

Quyidagi subscription handler `PubSub#asyncIterableIterator` chaqiruvi orqali hodisaga **obuna bo'ladi**. Bu metod bitta argument qabul qiladi - `triggerName`, ya'ni event topic nomi.

```typescript
@Resolver(() => Author)
export class AuthorResolver {
  // ...
  @Subscription(() => Comment)
  commentAdded(@Context('pubsub') pubSub: PubSub) {
    return pubSub.subscribe('commentAdded');
  }
}
```

> info **Hint** Yuqoridagi misolda ishlatilgan barcha dekoratorlar `@nestjs/graphql` paketidan eksport qilinadi, `PubSub` klassi esa `mercurius` paketidan eksport qilinadi.

> warning **Note** `PubSub` oddiy `publish` va `subscribe` API taqdim etadigan klass. Ushbu bo'limda custom `PubSub` klassini qanday ro'yxatdan o'tkazish ko'rsatilgan.

Bu SDLda quyidagi qismini generatsiya qiladi:

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

Subscriptionlar ta'rifi bo'yicha bitta top-level xossaga ega obyekt qaytaradi; bu xossaning kaliti subscription nomi bo'ladi. Bu nom yoki subscription handler metodi nomidan olinadi (yuqorida `commentAdded`) yoki `@Subscription()` dekoratoriga ikkinchi argument sifatida `name` kalitli opsiya berib aniq ko'rsatiladi:

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

Bu konstruktsiya avvalgi kod namunasidagi kabi SDLni hosil qiladi, ammo metod nomini subscriptiondan ajratishga imkon beradi.

#### Publishing

Endi hodisani publish qilish uchun `PubSub#publish` metodidan foydalanamiz. Bu ko'pincha mutatsiya ichida, obyekt graphning bir qismi o'zgarganda klient tomondagi yangilanishni ishga tushirish uchun ishlatiladi. Masalan:

```typescript
@@filename(posts/posts.resolver)
@Mutation(() => Comment)
async addComment(
  @Args('postId', { type: () => Int }) postId: number,
  @Args('comment', { type: () => Comment }) comment: CommentInput,
  @Context('pubsub') pubSub: PubSub,
) {
  const newComment = this.commentsService.addComment({ id: postId, comment });
  await pubSub.publish({
    topic: 'commentAdded',
    payload: {
      commentAdded: newComment
    }
  });
  return newComment;
}
```

Avval aytilganidek, subscription ta'rifi bo'yicha qiymat qaytaradi va bu qiymat ma'lum shaklga ega. `commentAdded` subscriptioni uchun generatsiya qilingan SDLga yana bir qarang:

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

Bu subscription `commentAdded` nomli top-level xossaga ega obyekt qaytarishi va bu xossa qiymati `Comment` obyektidan iborat bo'lishi kerakligini bildiradi. Muhim nuqta shuki, `PubSub#publish` orqali yuboriladigan event payloadi subscriptiondan qaytadigan qiymat shakliga mos bo'lishi kerak. Shuning uchun yuqoridagi misolda `pubSub.publish({{ '{' }} topic: 'commentAdded', payload: {{ '{' }} commentAdded: newComment {{ '}' }} {{ '}' }})` operatori mos shakldagi payload bilan `commentAdded` eventini publish qiladi. Agar bu shakllar mos kelmasa, subscription GraphQL validation bosqichida muvaffaqiyatsiz bo'ladi.

#### Subscriptionlarni filtrlash

Muayyan eventlarni filtrlash uchun `filter` xossasiga filter funksiyasini bering. Bu funksiya array `filter` ga o'xshash ishlaydi. U ikkita argument oladi: event payloadini o'z ichiga olgan `payload` (publish qilingan) va subscription so'rovida uzatilgan argumentlarni o'z ichiga olgan `variables`. Funksiya bu event klientlar uchun publish qilinishi kerakmi-yo'qligini belgilovchi boolean qaytaradi.

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

Agar injected providerlarga kirish kerak bo'lsa (masalan, ma'lumotni tekshirish uchun tashqi servisni chaqirish), quyidagi konstruktsiyadan foydalaning.

```typescript
@Subscription(() => Comment, {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

#### Schema first

Nestda shunga teng subscription yaratish uchun `@Subscription()` dekoratoridan foydalanamiz.

```typescript
const pubSub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  // ...
  @Subscription()
  commentAdded(@Context('pubsub') pubSub: PubSub) {
    return pubSub.subscribe('commentAdded');
  }
}
```

Muayyan eventlarni context va argumentlar bo'yicha filtrlash uchun `filter` xossasini bering.

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

Agar injected providerlarga kirish kerak bo'lsa (masalan, ma'lumotni tekshirish uchun tashqi servisni chaqirish), quyidagi konstruktsiyadan foydalaning:

```typescript
@Subscription('commentAdded', {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

Oxirgi qadam - type definitions faylini yangilash.

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

type Comment {
  id: String
  content: String
}

type Subscription {
  commentAdded(title: String!): Comment
}
```

Shu bilan biz bitta `commentAdded(title: String!): Comment` subscription yaratdik.

#### PubSub

Yuqoridagi misollarda default `PubSub` emitteridan foydalandik (mqemitter).
Afzal yondashuv (production uchun) - `mqemitter-redis`dan foydalanish. Muqobil ravishda, custom `PubSub` implementatsiyasini ham berishingiz mumkin (batafsil).

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: {
    emitter: require('mqemitter-redis')({
      port: 6579,
      host: '127.0.0.1',
    }),
  },
});
```

#### WebSocket orqali autentifikatsiya

Foydalanuvchi autentifikatsiyadan o'tganini tekshirish `subscription` opsiyalarida ko'rsatiladigan `verifyClient` callback funksiyasi ichida bajarilishi mumkin.

`verifyClient` birinchi argument sifatida `info` obyektini oladi; undan so'rov headerlarini olish uchun foydalanishingiz mumkin.

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: {
    verifyClient: (info, next) => {
      const authorization = info.req.headers?.authorization as string;
      if (!authorization?.startsWith('Bearer ')) {
        return next(false);
      }
      next(true);
    },
  }
}),
```

#### Mercurius driver bilan subscriptionlarni yoqish

Subscriptionlarni yoqish uchun `subscription` xossasini `true` qiling.

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: true,
}),
```

> info **Hint** Custom emitter sozlash, kiruvchi ulanishlarni validatsiya qilish va h.k. uchun opsiyalar obyektini ham uzatishingiz mumkin. Batafsil bu yerda o'qing (`subscription` bo'limi).

#### Code first

Code first yondashuvida subscription yaratish uchun `@Subscription()` dekoratoridan (`@nestjs/graphql` paketidan eksport qilinadi) va `mercurius` paketidagi `PubSub` klassidan foydalanamiz; u oddiy **publish/subscribe API** taqdim etadi.

Quyidagi subscription handler `PubSub#asyncIterableIterator` chaqiruvi orqali hodisaga **obuna bo'ladi**. Bu metod bitta argument qabul qiladi - `triggerName`, ya'ni event topic nomi.

```typescript
@Resolver(() => Author)
export class AuthorResolver {
  // ...
  @Subscription(() => Comment)
  commentAdded(@Context('pubsub') pubSub: PubSub) {
    return pubSub.subscribe('commentAdded');
  }
}
```

> info **Hint** Yuqoridagi misolda ishlatilgan barcha dekoratorlar `@nestjs/graphql` paketidan eksport qilinadi, `PubSub` klassi esa `mercurius` paketidan eksport qilinadi.

> warning **Note** `PubSub` oddiy `publish` va `subscribe` API taqdim etadigan klass. Ushbu bo'limda custom `PubSub` klassini qanday ro'yxatdan o'tkazish ko'rsatilgan.

Bu SDLda quyidagi qismini generatsiya qiladi:

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

Subscriptionlar ta'rifi bo'yicha bitta top-level xossaga ega obyekt qaytaradi; bu xossaning kaliti subscription nomi bo'ladi. Bu nom yoki subscription handler metodi nomidan olinadi (yuqorida `commentAdded`) yoki `@Subscription()` dekoratoriga ikkinchi argument sifatida `name` kalitli opsiya berib aniq ko'rsatiladi:

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

Bu konstruktsiya avvalgi kod namunasidagi kabi SDLni hosil qiladi, ammo metod nomini subscriptiondan ajratishga imkon beradi.

#### Publishing

Endi hodisani publish qilish uchun `PubSub#publish` metodidan foydalanamiz. Bu ko'pincha mutatsiya ichida, obyekt graphning bir qismi o'zgarganda klient tomondagi yangilanishni ishga tushirish uchun ishlatiladi. Masalan:

```typescript
@@filename(posts/posts.resolver)
@Mutation(() => Comment)
async addComment(
  @Args('postId', { type: () => Int }) postId: number,
  @Args('comment', { type: () => Comment }) comment: CommentInput,
  @Context('pubsub') pubSub: PubSub,
) {
  const newComment = this.commentsService.addComment({ id: postId, comment });
  await pubSub.publish({
    topic: 'commentAdded',
    payload: {
      commentAdded: newComment
    }
  });
  return newComment;
}
```

Avval aytilganidek, subscription ta'rifi bo'yicha qiymat qaytaradi va bu qiymat ma'lum shaklga ega. `commentAdded` subscriptioni uchun generatsiya qilingan SDLga yana bir qarang:

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

Bu subscription `commentAdded` nomli top-level xossaga ega obyekt qaytarishi va bu xossa qiymati `Comment` obyektidan iborat bo'lishi kerakligini bildiradi. Muhim nuqta shuki, `PubSub#publish` orqali yuboriladigan event payloadi subscriptiondan qaytadigan qiymat shakliga mos bo'lishi kerak. Shuning uchun yuqoridagi misolda `pubSub.publish({{ '{' }} topic: 'commentAdded', payload: {{ '{' }} commentAdded: newComment {{ '}' }} {{ '}' }})` operatori mos shakldagi payload bilan `commentAdded` eventini publish qiladi. Agar bu shakllar mos kelmasa, subscription GraphQL validation bosqichida muvaffaqiyatsiz bo'ladi.

#### Subscriptionlarni filtrlash

Muayyan eventlarni filtrlash uchun `filter` xossasiga filter funksiyasini bering. Bu funksiya array `filter` ga o'xshash ishlaydi. U ikkita argument oladi: event payloadini o'z ichiga olgan `payload` (publish qilingan) va subscription so'rovida uzatilgan argumentlarni o'z ichiga olgan `variables`. Funksiya bu event klientlar uchun publish qilinishi kerakmi-yo'qligini belgilovchi boolean qaytaradi.

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

Agar injected providerlarga kirish kerak bo'lsa (masalan, ma'lumotni tekshirish uchun tashqi servisni chaqirish), quyidagi konstruktsiyadan foydalaning.

```typescript
@Subscription(() => Comment, {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

#### Schema first

Nestda shunga teng subscription yaratish uchun `@Subscription()` dekoratoridan foydalanamiz.

```typescript
const pubSub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  // ...
  @Subscription()
  commentAdded(@Context('pubsub') pubSub: PubSub) {
    return pubSub.subscribe('commentAdded');
  }
}
```

Muayyan eventlarni context va argumentlar bo'yicha filtrlash uchun `filter` xossasini bering.

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

Agar injected providerlarga kirish kerak bo'lsa (masalan, ma'lumotni tekshirish uchun tashqi servisni chaqirish), quyidagi konstruktsiyadan foydalaning:

```typescript
@Subscription('commentAdded', {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

Oxirgi qadam - type definitions faylini yangilash.

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

type Comment {
  id: String
  content: String
}

type Subscription {
  commentAdded(title: String!): Comment
}
```

Shu bilan biz bitta `commentAdded(title: String!): Comment` subscription yaratdik.

#### PubSub

Yuqoridagi misollarda default `PubSub` emitteridan foydalandik (mqemitter).
Afzal yondashuv (production uchun) - `mqemitter-redis`dan foydalanish. Muqobil ravishda, custom `PubSub` implementatsiyasini ham berishingiz mumkin (batafsil).

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: {
    emitter: require('mqemitter-redis')({
      port: 6579,
      host: '127.0.0.1',
    }),
  },
});
```

#### WebSocket orqali autentifikatsiya

Foydalanuvchi autentifikatsiyadan o'tganini tekshirish `subscription` opsiyalarida ko'rsatiladigan `verifyClient` callback funksiyasi ichida bajarilishi mumkin.

`verifyClient` birinchi argument sifatida `info` obyektini oladi; undan so'rov headerlarini olish uchun foydalanishingiz mumkin.

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: {
    verifyClient: (info, next) => {
      const authorization = info.req.headers?.authorization as string;
      if (!authorization?.startsWith('Bearer ')) {
        return next(false);
      }
      next(true);
    },
  }
}),
```

#### Mercurius driver bilan subscriptionlarni yoqish

Subscriptionlarni yoqish uchun `subscription` xossasini `true` qiling.

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: true,
}),
```

> info **Hint** Custom emitter sozlash, kiruvchi ulanishlarni validatsiya qilish va h.k. uchun opsiyalar obyektini ham uzatishingiz mumkin. Batafsil bu yerda o'qing (`subscription` bo'limi).
