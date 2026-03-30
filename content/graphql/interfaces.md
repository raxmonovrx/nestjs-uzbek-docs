---
title: "Interfeyslar"
navTitle: "Interfeyslar"
description: "Ko'plab type tizimlari kabi, GraphQL ham interfeyslarni qo'llab-quvvatlaydi. Interface - bu ma'lum fieldlar to'plamiga ega bo'lgan, interfeysni implementatsiya qiluvchi type lar bu"
order: 8
group: graphql
groupTitle: "GraphQL"
---
Ko'plab type tizimlari kabi, GraphQL ham interfeyslarni qo'llab-quvvatlaydi. **Interface** - bu ma'lum fieldlar to'plamiga ega bo'lgan, interfeysni implementatsiya qiluvchi type lar bu fieldlarni o'z ichiga olishi shart bo'lgan abstrakt tur (batafsil bu yerda).

#### Code first

Code first yondashuvida GraphQL interfeysini `@nestjs/graphql` paketidan eksport qilinadigan `@InterfaceType()` dekoratori bilan belgilangan abstrakt klassni yaratish orqali aniqlaysiz.

```typescript
import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class Character {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}
```

> warning **Warning** TypeScript interfeyslari GraphQL interfeyslarini aniqlash uchun ishlatilmaydi.

Bu GraphQL schema ning SDLda quyidagi qismini generatsiya qiladi:

```graphql
interface Character {
  id: ID!
  name: String!
}
```

Endi `Character` interfeysini implementatsiya qilish uchun `implements` kalitidan foydalaning:

```typescript
@ObjectType({
  implements: () => [Character],
})
export class Human implements Character {
  id: string;
  name: string;
}
```

> info **Hint** `@ObjectType()` dekoratori `@nestjs/graphql` paketidan eksport qilinadi.

Kutubxona tomonidan generatsiya qilinadigan default `resolveType()` funksiyasi resolver metodidan qaytgan qiymatga qarab turini aniqlaydi. Bu shuni anglatadiki, siz klass instansiyalarini qaytarishingiz kerak (oddiy JavaScript obyektlarini qaytara olmaysiz).

Custom `resolveType()` funksiyasini berish uchun `@InterfaceType()` dekoratoriga uzatiladigan opsiyalar obyektida `resolveType` xossasini ko'rsating, quyidagicha:

```typescript
@InterfaceType({
  resolveType(book) {
    if (book.colors) {
      return ColoringBook;
    }
    return TextBook;
  },
})
export abstract class Book {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;
}
```

#### Interfeys resolverlari

Hozirgacha interfeyslardan foydalanib faqat field ta'riflarini bo'lishishingiz mumkin edi. Agar field resolverlarning haqiqiy implementatsiyasini ham bo'lishmoqchi bo'lsangiz, quyidagicha maxsus interfeys resolverini yaratishingiz mumkin:

```typescript
import { Resolver, ResolveField, Parent, Info } from '@nestjs/graphql';

@Resolver((type) => Character) // Reminder: Character is an interface
export class CharacterInterfaceResolver {
  @ResolveField(() => [Character])
  friends(
    @Parent() character, // Resolved object that implements Character
    @Info() { parentType }, // Type of the object that implements Character
    @Args('search', { type: () => String }) searchTerm: string,
  ) {
    // Get character's friends
    return [];
  }
}
```

Endi `friends` field resolveri `Character` interfeysini implementatsiya qiladigan barcha object turlar uchun avtomatik ro'yxatdan o'tkaziladi.

> warning **Warning** Buning uchun `GraphQLModule` konfiguratsiyasida `inheritResolversFromInterfaces` xossasi true qilib o'rnatilgan bo'lishi kerak.

#### Schema first

Schema first yondashuvida interfeysni SDL yordamida bevosita aniqlang.

```graphql
interface Character {
  id: ID!
  name: String!
}
```

So'ng [quick start](/docs/graphql/quick-start) bobida ko'rsatilganidek, typings generatsiyasi funksiyasidan foydalanib mos TypeScript ta'riflarini yaratasiz:

```typescript
export interface Character {
  id: string;
  name: string;
}
```

Interfeyslar resolver mapda qaysi type ga yechilishini aniqlash uchun qo'shimcha `__resolveType` fieldini talab qiladi. `CharactersResolver` klassini yaratamiz va `__resolveType` metodini aniqlaymiz:

```typescript
@Resolver('Character')
export class CharactersResolver {
  @ResolveField()
  __resolveType(value) {
    if ('age' in value) {
      return Person;
    }
    return null;
  }
}
```

> info **Hint** Barcha dekoratorlar `@nestjs/graphql` paketidan eksport qilinadi.
