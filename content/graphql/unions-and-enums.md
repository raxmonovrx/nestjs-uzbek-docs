---
title: "Unionlar"
navTitle: "Unionlar"
description: "Union turlari interfeyslarga juda o'xshaydi, ammo ular turlar orasida umumiy maydonlarni belgilay olmaydi (batafsil here). Unionlar bitta maydondan o'zaro kesishmaydigan ma'lumot t"
order: 18
group: graphql
groupTitle: "GraphQL"
---
Union turlari interfeyslarga juda o'xshaydi, ammo ular turlar orasida umumiy maydonlarni belgilay olmaydi (batafsil here). Unionlar bitta maydondan o'zaro kesishmaydigan ma'lumot turlarini qaytarishda foydali.

#### Code first yondashuvi

GraphQL union turini aniqlash uchun bu union tarkibini tashkil etadigan klasslarni belgilashimiz kerak. Apollo hujjatlaridagi example asosida ikki klass yaratamiz. Avval `Book`:

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}
```

Keyin `Author`:

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}
```

Shu bilan, `@nestjs/graphql` paketidan eksport qilinadigan `createUnionType` funksiyasi orqali `ResultUnion` unionini ro'yxatdan o'tkazing:

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});
```

> warning **Warning** `createUnionType` funksiyasining `types` propertysi qaytargan massivga const assertion berilishi kerak. Agar const assertion berilmasa, kompilyatsiya vaqtida noto'g'ri deklaratsiya fayli generatsiya qilinadi va uni boshqa loyihadan ishlatganda xato yuz beradi.

Endi biz so'rovda `ResultUnion`ni ko'rsatishimiz mumkin:

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}
```

Bu SDL formatida GraphQL sxemasining quyidagi qismini generatsiya qiladi:

```graphql
type Author {
  name: String!
}

type Book {
  title: String!
}

union ResultUnion = Author | Book

type Query {
  search: [ResultUnion!]!
}
```

Kutubxona yaratadigan standart `resolveType()` funksiyasi type ni resolver metodidan qaytarilgan qiymat asosida aniqlaydi. Bu, literal JavaScript obyektlar emas, balki klass instansiyalarini qaytarish majburiyligini anglatadi.

Moslashtirilgan `resolveType()` funksiyasini berish uchun `createUnionType()` funksiyasiga uzatiladigan options obyektiga `resolveType` propertysini quyidagicha kiriting:

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
  resolveType(value) {
    if (value.name) {
      return Author;
    }
    if (value.title) {
      return Book;
    }
    return null;
  },
});
```

#### Schema first yondashuvi

Schema first yondashuvida unionni aniqlash uchun SDL bilan GraphQL union yarating.

```graphql
type Author {
  name: String!
}

type Book {
  title: String!
}

union ResultUnion = Author | Book
```

So'ng, mos TypeScript ta'riflarini yaratish uchun tiplashlarni generatsiya qilish funksiyasidan foydalanishingiz mumkin (bu [quick start](/docs/graphql/quick-start) bobida ko'rsatilgan):

```typescript
export class Author {
  name: string;
}

export class Book {
  title: string;
}

export type ResultUnion = Author | Book;
```

Unionlar resolver map ichida union qaysi turga yechilishini aniqlash uchun qo'shimcha `__resolveType` maydonini talab qiladi. Shuningdek, `ResultUnionResolver` klassi har qanday modulda provider sifatida ro'yxatdan o'tkazilishi kerakligini unutmang. `ResultUnionResolver` klassini yaratib, `__resolveType` metodini aniqlaymiz.

```typescript
@Resolver('ResultUnion')
export class ResultUnionResolver {
  @ResolveField()
  __resolveType(value) {
    if (value.name) {
      return 'Author';
    }
    if (value.title) {
      return 'Book';
    }
    return null;
  }
}
```

> info **Hint** Barcha dekoratorlar `@nestjs/graphql` paketidan eksport qilinadi.

### Enumlar

Enumeration turlari muayyan ruxsat etilgan qiymatlar to'plami bilan cheklangan skalyarning maxsus turi (batafsil here). Bu sizga quyidagilarga imkon beradi:

- bu turdagi har qanday argument ruxsat etilgan qiymatlardan biri ekanini tekshirish
- type tizimi orqali maydon har doim yakunli qiymatlar to'plamidan biri bo'lishini ko'rsatish

#### Code first yondashuvi

Code first yondashuvida GraphQL enum turini aniqlash uchun shunchaki TypeScript enum yaratasiz.

```typescript
export enum AllowedColor {
  RED,
  GREEN,
  BLUE,
}
```

Shu bilan, `@nestjs/graphql` paketidan eksport qilinadigan `registerEnumType` funksiyasi yordamida `AllowedColor` enumini ro'yxatdan o'tkazing:

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
});
```

Endi turlaringizda `AllowedColor`ni ko'rsatishingiz mumkin:

```typescript
@Field(type => AllowedColor)
favoriteColor: AllowedColor;
```

Bu SDL formatida GraphQL sxemasining quyidagi qismini generatsiya qiladi:

```graphql
enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

Enum uchun tavsif berish uchun `registerEnumType()` funksiyasiga `description` propertysini uzating.

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
  description: 'The supported colors.',
});
```

Enum qiymatlari uchun tavsif berish yoki qiymatni deprecated deb belgilash uchun `valuesMap` propertysini quyidagicha uzating:

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
  description: 'The supported colors.',
  valuesMap: {
    RED: {
      description: 'The default color.',
    },
    BLUE: {
      deprecationReason: 'Too blue.',
    },
  },
});
```

Bu SDL formatida quyidagi GraphQL sxemasini generatsiya qiladi:

```graphql
"""
The supported colors.
"""
enum AllowedColor {
  """
  The default color.
  """
  RED
  GREEN
  BLUE @deprecated(reason: "Too blue.")
}
```

#### Schema first yondashuvi

Schema first yondashuvida enumeratorni aniqlash uchun SDL bilan GraphQL enum yarating.

```graphql
enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

So'ng, mos TypeScript ta'riflarini yaratish uchun tiplashlarni generatsiya qilish funksiyasidan foydalanishingiz mumkin (bu [quick start](/docs/graphql/quick-start) bobida ko'rsatilgan):

```typescript
export enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

Ba'zan backend enumning qiymatini public API dagidan ichkarida boshqacha majburlashi mumkin. Bu misolda API `RED` ni o'z ichiga oladi, ammo resolverlarda buning o'rniga `#f00` ishlatishimiz mumkin (batafsil here). Buni bajarish uchun `AllowedColor` enumi uchun resolver obyektini e'lon qiling:

```typescript
export const allowedColorResolver: Record<keyof typeof AllowedColor, any> = {
  RED: '#f00',
};
```

> info **Hint** Barcha dekoratorlar `@nestjs/graphql` paketidan eksport qilinadi.

So'ng bu resolver obyektini `GraphQLModule#forRoot()` metodining `resolvers` propertysi bilan birga quyidagicha ishlating:

```typescript
GraphQLModule.forRoot({
  resolvers: {
    AllowedColor: allowedColorResolver,
  },
});
```
