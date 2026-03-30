---
title: "Mapped types"
navTitle: "Mapped types"
description: "CRUD (Create/Read/Update/Delete) kabi funksiyalarni qurayotganda, ko'pincha bazaviy entity tipining variantlarini yaratish foydali bo'ladi. Nest bu vazifani yengillashtirish uchun "
order: 9
group: graphql
groupTitle: "GraphQL"
---
> warning **Warning** Bu bob faqat code first yondashuviga tegishli.

CRUD (Create/Read/Update/Delete) kabi funksiyalarni qurayotganda, ko'pincha bazaviy entity tipining variantlarini yaratish foydali bo'ladi. Nest bu vazifani yengillashtirish uchun type transformatsiyalarini bajaradigan bir nechta yordamchi funksiyalarni taqdim etadi.

#### Partial

Input validatsiya turlarini (Data Transfer Objects yoki DTOlar) qurayotganda, ko'pincha bir xil tipning **create** va **update** variantlarini yaratish kerak bo'ladi. Masalan, **create** variantida barcha maydonlar majburiy bo'lishi mumkin, **update** variantida esa barcha maydonlar ixtiyoriy bo'ladi.

Nest bu vazifani osonlashtirish va boilerplate ni kamaytirish uchun `PartialType()` yordamchi funksiyasini taqdim etadi.

`PartialType()` funksiyasi kiruvchi tipdagi barcha xossalari ixtiyoriy bo'lgan yangi tip (klass) qaytaradi. Masalan, bizda quyidagi **create** tipi bo'lsin:

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

Default holatda, bu maydonlarning barchasi majburiy. Xuddi shu maydonlarga ega, lekin har biri ixtiyoriy bo'lgan tip yaratish uchun `PartialType()` dan foydalanib klass reference (`CreateUserInput`) ni argument sifatida bering:

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
```

> info **Hint** `PartialType()` funksiyasi `@nestjs/graphql` paketidan import qilinadi.

`PartialType()` funksiyasi ixtiyoriy ikkinchi argument sifatida dekorator factoryga reference qabul qiladi. Bu argument natijaviy (child) klassga qo'llanadigan dekoratorni o'zgartirish uchun ishlatiladi. Agar ko'rsatilmasa, child klass amalda **parent** klassga (birinchi argumentda ko'rsatilgan klassga) qo'llangan dekorator bilan qoladi. Yuqoridagi misolda `CreateUserInput` `@InputType()` dekoratori bilan bezatilgan. `UpdateUserInput` ham `@InputType()` bilan bezatilgan bo'lishini xohlaganimiz uchun, `InputType` ni ikkinchi argument sifatida berish shart emas edi. Agar parent va child turlari boshqacha bo'lsa (masalan, parent `@ObjectType` bilan bezatilgan bo'lsa), ikkinchi argument sifatida `InputType` ni beramiz. Masalan:

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}
```

#### Pick

`PickType()` funksiyasi kiruvchi tipdan xossalar to'plamini tanlab, yangi tip (klass) yaratadi. Masalan, quyidagi tipdan boshlaymiz:

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

Ushbu klassdan xossalar to'plamini `PickType()` yordamchi funksiyasi bilan tanlashimiz mumkin:

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}
```

> info **Hint** `PickType()` funksiyasi `@nestjs/graphql` paketidan import qilinadi.

#### Omit

`OmitType()` funksiyasi kiruvchi tipdan barcha xossalarni olib, so'ng muayyan kalitlar to'plamini olib tashlab yangi tip yaratadi. Masalan, quyidagi tipdan boshlaymiz:

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

Quyida `email` dan **tashqari** barcha xossalarga ega hosila tip yaratamiz. Bu konstruktsiyada `OmitType` ning ikkinchi argumenti xossa nomlari massividir.

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}
```

> info **Hint** `OmitType()` funksiyasi `@nestjs/graphql` paketidan import qilinadi.

#### Intersection

`IntersectionType()` funksiyasi ikkita tipni birlashtirib, yangi tip (klass) hosil qiladi. Masalan, quyidagi ikki tipdan boshlaymiz:

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AdditionalUserInfo {
  @Field()
  firstName: string;

  @Field()
  lastName: string;
}
```

Biz barcha xossalarni ikkala tipdan birlashtiradigan yangi tip yaratamiz.

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo,
) {}
```

> info **Hint** `IntersectionType()` funksiyasi `@nestjs/graphql` paketidan import qilinadi.

#### Composition

Type mapping yordamchi funksiyalarini bir-biri bilan kompozitsiya qilish mumkin. Masalan, quyidagisi `CreateUserInput` tipidagi barcha xossalarga ega bo'lgan, faqat `email` dan tashqari va bu xossalar ixtiyoriy bo'lgan tipni yaratadi:

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}
```
