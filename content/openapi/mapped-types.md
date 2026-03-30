---
title: "Xaritaga tushirilgan turlar"
navTitle: "Xaritaga tushirilgan turlar"
description: "CRUD (Create/Read/Update/Delete) kabi imkoniyatlarni qurishda bazaviy entitet turiga asoslangan variantlarni yaratish ko'pincha foydali bo'ladi. Nest bu vazifani qulaylashtirish uc"
order: 4
group: openapi
groupTitle: "OpenAPI"
---
**CRUD** (Create/Read/Update/Delete) kabi imkoniyatlarni qurishda bazaviy entitet turiga asoslangan variantlarni yaratish ko'pincha foydali bo'ladi. Nest bu vazifani qulaylashtirish uchun turga transformatsiyalarni bajaradigan bir nechta yordamchi funksiyalarni taqdim etadi.

#### Partial

Kiritma validatsiya turlarini (DTO) yaratishda bir xil tur asosida **create** va **update** variantlarini qurish ko'pincha foydali. Masalan, **create** varianti barcha maydonlarni talab qilishi mumkin, **update** varianti esa hamma maydonlarni ixtiyoriy qilishi mumkin.

Nest bu vazifani yengillashtirish va ortiqcha kodni kamaytirish uchun `PartialType()` yordamchi funksiyasini taqdim etadi.

`PartialType()` funksiyasi kiritma turining barcha xususiyatlari ixtiyoriy qilib belgilangan tur (klass) ni qaytaradi. Masalan, quyidagicha **create** turimiz bo'lsa:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

Standart holatda bu maydonlarning barchasi majburiy. Xuddi shu maydonlarga ega, lekin har biri ixtiyoriy bo'lgan tur yaratish uchun `PartialType()` dan foydalaning va argument sifatida klassga havolani (`CreateCatDto`) uzating:

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

> info **Hint** `PartialType()` funksiyasi `@nestjs/swagger` paketidan import qilinadi.

#### Pick

`PickType()` funksiyasi kiritma turidan xususiyatlar to'plamini tanlab yangi tur (klass) hosil qiladi. Masalan, quyidagi turdan boshlasak:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

`PickType()` yordamchi funksiyasi orqali ushbu klassdan xususiyatlar to'plamini tanlashimiz mumkin:

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

> info **Hint** `PickType()` funksiyasi `@nestjs/swagger` paketidan import qilinadi.

#### Omit

`OmitType()` funksiyasi kiritma turidagi barcha xususiyatlarni oladi va keyin ma'lum kalitlar to'plamini olib tashlab tur hosil qiladi. Masalan, quyidagi turdan boshlasak:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

Quyidagi kabi `name` dan tashqari barcha xususiyatlarga ega hosila tur yaratishimiz mumkin. Bu konstruksiyada `OmitType` ning ikkinchi argumenti xususiyat nomlari massividir.

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

> info **Hint** `OmitType()` funksiyasi `@nestjs/swagger` paketidan import qilinadi.

#### Intersection

`IntersectionType()` funksiyasi ikki turni bitta yangi tur (klass) ga birlashtiradi. Masalan, quyidagi ikki turdan boshlasak:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

export class AdditionalCatInfo {
  @ApiProperty()
  color: string;
}
```

Har ikkala turdagi barcha xususiyatlarni birlashtiruvchi yangi tur yaratishimiz mumkin.

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
```

> info **Hint** `IntersectionType()` funksiyasi `@nestjs/swagger` paketidan import qilinadi.

#### Kompozitsiya

Tur xaritalash yordamchi funksiyalari kombinatsiya qilinishi mumkin. Masalan, quyidagi kod `CreateCatDto` turidagi `name` dan tashqari barcha xususiyatlarga ega bo'lgan va ularni ixtiyoriy qilib belgilovchi tur (klass) yaratadi:

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```
