---
title: "Turlar va parametrlari"
navTitle: "Turlar va parametrlari"
description: "SwaggerModule API hujjatini generatsiya qilish uchun marshrut handlerlaridagi barcha @Body(), @Query() va @Param() dekoratorlarini qidiradi. Shuningdek, reflectiondan foydalanib mo"
order: 8
group: openapi
groupTitle: "OpenAPI"
---
`SwaggerModule` API hujjatini generatsiya qilish uchun marshrut handlerlaridagi barcha `@Body()`, `@Query()` va `@Param()` dekoratorlarini qidiradi. Shuningdek, reflectiondan foydalanib mos model ta'riflarini yaratadi. Quyidagi kodni ko'rib chiqing:

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

> info **Hint** Body ta'rifini aniq belgilash uchun `@ApiBody()` dekoratoridan foydalaning (`@nestjs/swagger` paketidan import qilinadi).

`CreateCatDto` ga asoslanib Swagger UI uchun quyidagi model ta'rifi yaratiladi:

Ko'rib turganingizdek, klassda bir nechta xususiyatlar e'lon qilingan bo'lsa-da, ta'rif bo'sh. Klass xususiyatlarini `SwaggerModule` ga ko'rinarli qilish uchun ularni `@ApiProperty()` dekoratori bilan belgilashimiz yoki buni avtomatik bajaradigan CLI plaginidan foydalanishimiz kerak (batafsil **Plagin** bo'limida).

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

> info **Hint** Har bir xususiyatni qo'lda belgilash o'rniga, Swagger plaginidan foydalanishni o'ylab ko'ring ([Plagin](/docs/openapi/cli-plugin) bo'limiga qarang), u buni avtomatik ta'minlaydi.

Brauzerni ochib, generatsiya qilingan `CreateCatDto` modelini tekshirib ko'ramiz:

Bundan tashqari, `@ApiProperty()` dekoratori turli Schema Object xususiyatlarini o'rnatish imkonini beradi:

```typescript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;
```

> info **Hint** `{{"@ApiProperty({ required: false })"}}` ni qo'lda yozish o'rniga `@ApiPropertyOptional()` qisqa dekoratoridan foydalanishingiz mumkin.

Xususiyat turini aniq belgilash uchun `type` kalitidan foydalaning:

```typescript
@ApiProperty({
  type: Number,
})
age: number;
```

#### Massivlar

Xususiyat massiv bo'lsa, quyidagi kabi massiv turini qo'lda ko'rsatishimiz kerak:

```typescript
@ApiProperty({ type: [String] })
names: string[];
```

> info **Hint** Massivlarni avtomatik aniqlaydigan Swagger plaginidan foydalanishni o'ylab ko'ring ([Plagin](/docs/openapi/cli-plugin) bo'limiga qarang).

Yoki turini massivning birinchi elementi sifatida ko'rsating (yuqorida ko'rsatilganidek), yoki `isArray` xususiyatini `true` ga o'rnating.

#### Doiraviy qaramliklar

Klasslar o'rtasida doiraviy qaramliklar bo'lsa, `SwaggerModule` ga tur ma'lumotini taqdim etish uchun kechikkan funksiyadan foydalaning:

```typescript
@ApiProperty({ type: () => Node })
node: Node;
```

> info **Hint** Doiraviy qaramliklarni avtomatik aniqlaydigan Swagger plaginidan foydalanishni o'ylab ko'ring ([Plagin](/docs/openapi/cli-plugin) bo'limiga qarang).

#### Generiklar va interfeyslar

TypeScript generiklar yoki interfeyslar haqidagi metadata ni saqlamaganligi sababli, ularni DTOlarda ishlatsangiz, `SwaggerModule` ish vaqtida model ta'riflarini to'g'ri generatsiya qila olmasligi mumkin. Masalan, quyidagi kod Swagger modul tomonidan to'g'ri tekshirilmaydi:

```typescript
createBulk(@Body() usersDto: CreateUserDto[])
```

Bu cheklovni chetlab o'tish uchun turini aniq belgilashingiz mumkin:

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```

#### Enumlar

`enum` ni aniqlash uchun `@ApiProperty` da `enum` xususiyatini qiymatlar massiviga qo'lda o'rnatishimiz kerak.

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

Boshqa variant sifatida haqiqiy TypeScript enumini quyidagicha aniqlang:

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}
```

Keyin enumni `@ApiQuery()` dekoratori bilan birgalikda `@Query()` parametr dekoratori bilan bevosita ishlatishingiz mumkin.

```typescript
@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

`isArray` **true** bo'lsa, `enum` ni **multi-select** sifatida tanlash mumkin:

#### Enumlar sxemasi

Standart holatda, `enum` xususiyati `parameter` ga Enum ning xom ta'rifini qo'shadi.

```yaml
- breed:
    type: 'string'
    enum:
      - Persian
      - Tabby
      - Siamese
```

Yuqoridagi spetsifikatsiya ko'p hollarda yaxshi ishlaydi. Biroq, spetsifikatsiyani **input** sifatida olib, **client-side** kodni generatsiya qiluvchi vositadan foydalansangiz, yaratilgan kodda takroriy `enum` lar paydo bo'lishi muammosiga duch kelishingiz mumkin. Quyidagi kod parchasi buni ko'rsatadi:

```typescript
// generated client-side code
export class CatDetail {
  breed: CatDetailEnum;
}

export class CatInformation {
  breed: CatInformationEnum;
}

export enum CatDetailEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}

export enum CatInformationEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}
```

> info **Hint** Yuqoridagi parcha NSwag deb nomlangan vosita yordamida generatsiya qilingan.

Ko'rib turganingizdek, endi bir xil bo'lgan ikki `enum` ga egasiz. Bu muammoni hal qilish uchun dekoratorda `enum` bilan birga `enumName` ni ham uzatishingiz mumkin.

```typescript
export class CatDetail {
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
```

`enumName` xususiyati `@nestjs/swagger` ga `CatBreed` ni alohida `schema` ga aylantirish imkonini beradi, bu esa `CatBreed` enumini qayta foydalanish mumkin qiladi. Spetsifikatsiya quyidagicha ko'rinadi:

```yaml
CatDetail:
  type: 'object'
  properties:
    ...
    - breed:
        schema:
          $ref: '#/components/schemas/CatBreed'
CatBreed:
  type: string
  enum:
    - Persian
    - Tabby
    - Siamese
```

> info **Hint** `enum` xususiyatini qabul qiladigan har qanday **dekorator** `enumName` ni ham qabul qiladi.

#### Xususiyat qiymatlari namunasi

`example` kalitidan foydalanib xususiyat uchun bitta namuna berishingiz mumkin:

```typescript
@ApiProperty({
  example: 'persian',
})
breed: string;
```

Agar bir nechta namuna bermoqchi bo'lsangiz, quyidagi kabi obyektni uzatib `examples` kalitidan foydalanishingiz mumkin:

```typescript
@ApiProperty({
  examples: {
    Persian: { value: 'persian' },
    Tabby: { value: 'tabby' },
    Siamese: { value: 'siamese' },
    'Scottish Fold': { value: 'scottish_fold' },
  },
})
breed: string;
```

#### Xom ta'riflar

Ba'zi hollarda, masalan, chuqur qo'shama massivlar yoki matritsalar uchun turini qo'lda belgilashingiz kerak bo'lishi mumkin:

```typescript
@ApiProperty({
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
})
coords: number[][];
```

Shuningdek, xom obyekt sxemalarini quyidagicha ko'rsatishingiz mumkin:

```typescript
@ApiProperty({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Error'
    },
    status: {
      type: 'number',
      example: 400
    }
  },
  required: ['name', 'status']
})
rawDefinition: Record<string, any>;
```

Controller klasslarida kirish/chiqish tarkibini qo'lda belgilash uchun `schema` xususiyatidan foydalaning:

```typescript
@ApiBody({
  schema: {
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
})
async create(@Body() coords: number[][]) {}
```

#### Qo'shimcha modellari

Controllerlaringizda to'g'ridan-to'g'ri ishlatilmaydigan, lekin Swagger modul tomonidan tekshirilishi kerak bo'lgan qo'shimcha modellarga ega bo'lish uchun `@ApiExtraModels()` dekoratoridan foydalaning:

```typescript
@ApiExtraModels(ExtraModel)
export class CreateCatDto {}
```

> info **Hint** Ma'lum model klassi uchun `@ApiExtraModels()` ni faqat bir marta ishlatishingiz kifoya.

Yoki `SwaggerModule.createDocument()` metodiga `extraModels` xususiyati ko'rsatilgan parametrlar obyektini quyidagicha uzatishingiz mumkin:

```typescript
const documentFactory = () =>
  SwaggerModule.createDocument(app, options, {
    extraModels: [ExtraModel],
  });
```

Modelingizga havola (`$ref`) olish uchun `getSchemaPath(ExtraModel)` funksiyasidan foydalaning:

```typescript
'application/vnd.api+json': {
   schema: { $ref: getSchemaPath(ExtraModel) },
},
```

#### oneOf, anyOf, allOf

Sxemalarni birlashtirish uchun `oneOf`, `anyOf` yoki `allOf` kalit so'zlaridan foydalanishingiz mumkin (batafsil).

```typescript
@ApiProperty({
  oneOf: [
    { $ref: getSchemaPath(Cat) },
    { $ref: getSchemaPath(Dog) },
  ],
})
pet: Cat | Dog;
```

Agar polimorf massiv (ya'ni elementlari bir nechta sxemalarni qamrab oladigan massiv) aniqlamoqchi bo'lsangiz, turini qo'lda belgilash uchun xom ta'rifdan foydalanishingiz kerak (yuqoriga qarang).

```typescript
type Pet = Cat | Dog;

@ApiProperty({
  type: 'array',
  items: {
    oneOf: [
      { $ref: getSchemaPath(Cat) },
      { $ref: getSchemaPath(Dog) },
    ],
  },
})
pets: Pet[];
```

> info **Hint** `getSchemaPath()` funksiyasi `@nestjs/swagger` dan import qilinadi.

`Cat` va `Dog` ning ikkalasi ham klass darajasida `@ApiExtraModels()` dekoratori yordamida qo'shimcha model sifatida aniqlanishi kerak.

#### Sxema nomi va tavsifi

Ehtimol payqagandirsiz, generatsiya qilingan sxema nomi original model klassi nomiga asoslanadi (masalan, `CreateCatDto` modeli `CreateCatDto` sxemasini generatsiya qiladi). Agar sxema nomini o'zgartirmoqchi bo'lsangiz, `@ApiSchema()` dekoratoridan foydalanishingiz mumkin.

Misol:

```typescript
@ApiSchema({ name: 'CreateCatRequest' })
class CreateCatDto {}
```

Yuqoridagi model `CreateCatRequest` sxemasiga aylantiriladi.

Standart holatda generatsiya qilingan sxemaga tavsif qo'shilmaydi. `description` atributi orqali tavsif qo'shishingiz mumkin:

```typescript
@ApiSchema({ description: 'Description of the CreateCatDto schema' })
class CreateCatDto {}
```

Shunday qilib, tavsif sxemaga quyidagicha kiritiladi:

```yaml
schemas:
  CreateCatDto:
    type: object
    description: Description of the CreateCatDto schema
```
