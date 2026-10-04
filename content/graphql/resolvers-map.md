---
title: "Resolverlar"
navTitle: "Resolverlar"
description: "Resolverlar GraphQL operatsiyasini (query, mutation yoki subscription) ma'lumotga aylantirish bo'yicha ko'rsatmalarni beradi. Ular schemamizda ko'rsatgan shakldagi ma'lumotni - sin"
order: 13
group: graphql
groupTitle: "GraphQL"
---
Resolverlar GraphQL operatsiyasini (query, mutation yoki subscription) ma'lumotga aylantirish bo'yicha ko'rsatmalarni beradi. Ular schemamizda ko'rsatgan shakldagi ma'lumotni - sinxron yoki shu shakldagi natijaga yechiladigan promise ko'rinishida - qaytaradi. Odatda siz **resolver map** ni qo'lda yaratasiz. `@nestjs/graphql` paketi esa klasslarni annotatsiya qilish uchun ishlatilgan dekoratorlar taqdim etgan metadata asosida resolver map ni avtomatik generatsiya qiladi. Paket imkoniyatlaridan foydalanib GraphQL API yaratish jarayonini ko'rsatish uchun oddiy authors API ni yaratamiz.

#### Code first

Code first yondashuvida GraphQL schemani qo'lda GraphQL SDL yozish orqali yaratmaymiz. Buning o'rniga, TypeScript dekoratorlaridan foydalanib SDLni TypeScript klass ta'riflaridan generatsiya qilamiz. `@nestjs/graphql` paketi dekoratorlar orqali berilgan metadatani o'qiydi va schemani avtomatik yaratadi.

#### Object types

GraphQL schemadagi ko'p ta'riflar **object types** dan iborat. Har bir object type ilova klienti ishlashi mumkin bo'lgan domen obyektini ifodalashi kerak. Masalan, namunaviy API da authorlar va ularning postlari ro'yxatini olish imkoniyatini berishimiz kerak, shuning uchun bu funksionallikni qo'llab-quvvatlash uchun `Author` va `Post` turlarini aniqlashimiz kerak.

Agar schema first yondashuvdan foydalansak, SDLda schemani quyidagicha belgilardik:

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}
```

Bu holatda, code first yondashuvda schemalarni TypeScript klasslari va ularning fieldlarini annotatsiya qiladigan dekoratorlar bilan belgilaymiz. Yuqoridagi SDLning code firstdagi ekvivalenti:

```typescript
@@filename(authors/models/author.model)
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from './post';

@ObjectType()
export class Author {
  @Field(type => Int)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Post])
  posts: Post[];
}
```

> info **Hint** TypeScriptning metadata reflection tizimida bir nechta cheklovlar mavjud: masalan, klass qaysi xossalardan iboratligini aniqlash yoki berilgan xossa ixtiyoriy yoki majburiyligini bilish imkonsiz. Shu sababli, schemadagi har bir fieldning GraphQL tipi va optionalitysi haqida metadata berish uchun `@Field()` dekoratoridan ochiq foydalanishimiz yoki bularni generatsiya qilish uchun [CLI plugin](/docs/graphql/cli-plugin)dan foydalanishimiz kerak.

`Author` object type ham har qanday klass kabi fieldlar to'plamidan iborat bo'lib, har bir field o'z turini e'lon qiladi. Field turi GraphQL typega mos keladi. Fieldning GraphQL turi boshqa object type yoki scalar type bo'lishi mumkin. GraphQL scalar type - bu `ID`, `String`, `Boolean`, yoki `Int` kabi bitta qiymatga yechiladigan primitiv tur.

> info **Hint** GraphQLning built-in scalar turlaridan tashqari, custom scalar turlarni ham belgilashingiz mumkin (batafsil [bu yerda](/docs/graphql/scalars)).

Yuqoridagi `Author` object type ta'rifi SDLda biz ko'rsatgan matnni **generatsiya** qiladi:

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}
```

`@Field()` dekoratori ixtiyoriy type funksiyasini (masalan, `type => Int`) va ixtiyoriy opsiyalar obyektini qabul qiladi.

Type funksiyasi TypeScript tipi va GraphQL tipi o'rtasida noaniqlik bo'lishi mumkin bo'lgan holatlarda kerak bo'ladi. Aniqrog'i: `string` va `boolean` turlari uchun **kerak emas**; `number` uchun esa **kerak** (u GraphQL `Int` yoki `Float` ga moslashtirilishi kerak). Type funksiyasi shunchaki kerakli GraphQL turini qaytarishi kerak (bu boblarda ko'rsatilgan misollar kabi).

Opsiyalar obyekti quyidagi key/value juftliklarini qabul qilishi mumkin:

- `nullable`: field nullable bo'lishini belgilash (`@nestjs/graphql`da har bir field default bo'yicha non-nullable); `boolean`
- `description`: field tavsifi; `string`
- `deprecationReason`: fieldni deprecated deb belgilash; `string`

Masalan:

```typescript
@Field({ description: `Book title`, deprecationReason: 'Not useful in v2 schema' })
title: string;
```

> info **Hint** Butun object type uchun ham tavsif qo'shish yoki deprecate qilish mumkin: `@ObjectType({{ '{' }} description: 'Author model' {{ '}' }})`.

Field massiv bo'lsa, quyida ko'rsatilgandek, `Field()` dekoratorining type funksiyasida massiv turini qo'lda ko'rsatishimiz kerak:

```typescript
@Field(type => [Post])
posts: Post[];
```

> info **Hint** Array qavs notatsiyasi (`[ ]`) orqali massiv chuqurligini ko'rsatishimiz mumkin. Masalan, `[[Int]]` butun sonli matritsani bildiradi.

Massivning o'zi emas, balki uning elementlari nullable bo'lishini belgilash uchun `nullable` xossasini `'items'` qilib qo'ying:

```typescript
@Field(type => [Post], { nullable: 'items' })
posts: Post[];
```

> info **Hint** Agar massivning o'zi ham, elementlari ham nullable bo'lsa, `nullable` ni `'itemsAndList'` qilib qo'ying.

Endi `Author` object type yaratilgach, `Post` object type ni ham aniqlaymiz.

```typescript
@@filename(posts/models/post.model)
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Post {
  @Field(type => Int)
  id: number;

  @Field()
  title: string;

  @Field(type => Int, { nullable: true })
  votes?: number;
}
```

`Post` object type SDLda quyidagi qismini generatsiya qiladi:

```graphql
type Post {
  id: Int!
  title: String!
  votes: Int
}
```

#### Code first resolver

Bu nuqtada biz data graphda mavjud bo'lishi mumkin bo'lgan objectlar (type ta'riflari)ni belgiladik, ammo klientlar hali bu objectlar bilan o'zaro ishlay olmaydi. Buni hal qilish uchun resolver klassini yaratishimiz kerak. Code first usulida resolver klassi ham resolver funksiyalarini **aniqlaydi**, ham **Query type** ni generatsiya qiladi. Buni quyidagi misolda ko'ramiz:

```typescript
@@filename(authors/authors.resolver)
@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author)
  async author(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField()
  async posts(@Parent() author: Author) {
    const { id } = author;
    return this.postsService.findAll({ authorId: id });
  }
}
```

> info **Hint** Barcha dekoratorlar (`@Resolver`, `@ResolveField`, `@Args` va h.k.) `@nestjs/graphql` paketidan eksport qilinadi.

Bir nechta resolver klassini aniqlashingiz mumkin. Nest ularni runtime da birlashtiradi. Kodni qanday tashkil qilish bo'yicha batafsil ma'lumot uchun quyidagi module bo'limiga qarang.

> warning **Note** `AuthorsService` va `PostsService` ichidagi mantiq ehtiyojga qarab sodda yoki murakkab bo'lishi mumkin. Bu misolning asosiy maqsadi resolverlarni qanday qurish va ularning boshqa providerlar bilan qanday ishlashini ko'rsatishdir.

Yuqoridagi misolda `AuthorsResolver` ni yaratdik; u bitta query resolver funksiyasi va bitta field resolver funksiyasini belgilaydi. Resolver yaratish uchun resolver funksiyalari metodlar bo'lgan klass yaratamiz va klassni `@Resolver()` dekoratori bilan belgilaymiz.

Bu misolda so'rovda yuborilgan `id`ga asoslanib author obyektini olish uchun query handler aniqladik. Metod query handler ekanini ko'rsatish uchun `@Query()` dekoratoridan foydalaning.

`@Resolver()` dekoratoriga uzatiladigan argument ixtiyoriy, ammo graf murakkablashganda muhim bo'ladi. U field resolver funksiyalari object graph bo'ylab pastga tushganda foydalanadigan parent obyektni ko'rsatish uchun ishlatiladi.

Bizning misolda klassda **field resolver** funksiyasi (`Author` object type ning `posts` xossasi uchun) mavjud bo'lgani uchun, `@Resolver()` dekoratoriga ushbu klassda aniqlangan barcha field resolverlar uchun parent type (ya'ni mos `ObjectType` klassi nomi)ni ko'rsatishimiz **shart**. Misoldan ko'rinib turibdiki, field resolver yozganda parent obyektga kirish kerak bo'ladi (field shu obyektning a'zosi). Bizning misolda authorning `id` sini oladigan servisni chaqirib, `posts` massivini to'ldiramiz. Shuning uchun `@Resolver()` dekoratorida parent obyektni ko'rsatish zarur. Keyin `@Parent()` parametr dekoratori orqali field resolver ichida parent obyektga havola olamiz.

Bir nechta `@Query()` resolver funksiyalarini (shu klass ichida ham, boshqa resolver klasslarida ham) aniqlashingiz mumkin va ular generatsiya qilingan SDLda bitta **Query type** ta'rifiga hamda resolver mapdagi mos entrylarga birlashtiriladi. Bu querylarni ular foydalanadigan model va servislar yonida belgilash va modullarda tartibli saqlash imkonini beradi.

> info **Hint** Nest CLI boilerplate kodning **barchasini** avtomatik generatsiya qiladigan generator (schematic) taqdim etadi; bu qo'lda qilishimizni oldini oladi va developer tajribasini ancha soddalashtiradi. Bu imkoniyat haqida batafsil [bu yerda](/docs/recipes/crud-generator) o'qing.

#### Query type nomlari

Yuqoridagi misollarda `@Query()` dekoratori GraphQL schema query type nomini metod nomiga qarab generatsiya qiladi. Masalan, quyidagi konstruktsiyani oling:

```typescript
@Query(() => Author)
async author(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

Bu schemada author query uchun quyidagi entryni generatsiya qiladi (query type metodi bilan bir xil nomdan foydalanadi):

```graphql
type Query {
  author(id: Int!): Author
}
```

> info **Hint** GraphQL querylar haqida ko'proq bu yerda o'qing.

Odatda biz bu nomlarni ajratishni afzal ko'ramiz; masalan, query handler metod nomi `getAuthor()` bo'lsin, lekin query type nomi `author` bo'lib qolsin. Xuddi shu narsa field resolverlar uchun ham qo'llanadi. Buni `@Query()` va `@ResolveField()` dekoratorlariga mapping nomlarini argument sifatida berib oson qilamiz, quyida ko'rsatilgandek:

```typescript
@@filename(authors/authors.resolver)
@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author, { name: 'author' })
  async getAuthor(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField('posts', () => [Post])
  async getPosts(@Parent() author: Author) {
    const { id } = author;
    return this.postsService.findAll({ authorId: id });
  }
}
```

Yuqoridagi `getAuthor` handler metodi SDLda quyidagi qismini generatsiya qiladi:

```graphql
type Query {
  author(id: Int!): Author
}
```

#### Query dekoratori opsiyalari

`@Query()` dekoratorining opsiyalar obyektida (yuqorida `{{ '{' }}name: 'author'{{ '}' }}` bergan joyimizda) quyidagi key/value juftliklari bo'lishi mumkin:

- `name`: query nomi; `string`
- `description`: GraphQL schema hujjatlarida ishlatiladigan tavsif (masalan, GraphQL playgroundda); `string`
- `deprecationReason`: queryni deprecated deb belgilash uchun metadata; `string`
- `nullable`: query null data qaytarishi mumkinligini belgilaydi; `boolean` yoki `'items'` yoki `'itemsAndList'` (yuqorida tushuntirilgan)

#### Args dekoratori opsiyalari

`@Args()` dekoratoridan so'rovdagi argumentlarni olish uchun foydalaning. Bu [REST route parameter argument extraction](/docs/core/controllers#route-parameter’lari) bilan juda o'xshash ishlaydi.

Odatda `@Args()` dekoratori sodda bo'ladi va yuqoridagi `getAuthor()` misolidagi kabi obyekt argumentini talab qilmaydi. Masalan, identifikator turi string bo'lsa, quyidagi konstruktsiya yetarli va GraphQL so'rovdan nomlangan fieldni olib metod argumenti sifatida beradi.

```typescript
@Args('id') id: string
```

`getAuthor()` holatida `number` tipi ishlatilgan va bu muammo tug'diradi. `number` TypeScript tipi kutilayotgan GraphQL ko'rinishi haqida yetarli ma'lumot bermaydi (masalan, `Int` va `Float`). Shuning uchun type referenceni **aniq** uzatishimiz kerak. Buni `Args()` dekoratoriga ikkinchi argument sifatida opsiyalarni berish orqali qilamiz:

```typescript
@Query(() => Author, { name: 'author' })
async getAuthor(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

Opsiyalar obyektida quyidagi ixtiyoriy key/value juftliklarini ko'rsatish mumkin:

- `type`: GraphQL turini qaytaradigan funksiya
- `defaultValue`: default qiymat; `any`
- `description`: tavsif metadata; `string`
- `deprecationReason`: fieldni deprecate qilish va nega deprecate qilinganini ko'rsatuvchi metadata; `string`
- `nullable`: field nullable bo'lishi

Query handler metodlari bir nechta argument qabul qilishi mumkin. Faraz qilaylik, authorni `firstName` va `lastName` bo'yicha topmoqchimiz. Bu holatda `@Args` ni ikki marta chaqiramiz:

```typescript
getAuthor(
  @Args('firstName', { nullable: true }) firstName?: string,
  @Args('lastName', { defaultValue: '' }) lastName?: string,
) {}
```

> info **Hint** `firstName` GraphQL nullable field bo'lgani uchun, `null` yoki `undefined`ning non-value turlarini field tipiga qo'shish shart emas. Biroq, resolverlarda bu non-value turlarni hisobga olgan holda type guard qilish kerakligini yodda tuting, chunki GraphQL nullable field bunday turlarni resolverga o'tkazadi.

#### Ajratilgan arguments klassi

Inline `@Args()` chaqiruvlari bilan yuqoridagi kabi kod shishib ketadi. Buning o'rniga alohida `GetAuthorArgs` arguments klassini yaratib, uni handlerda quyidagicha ishlatishingiz mumkin:

```typescript
@Args() args: GetAuthorArgs
```

`GetAuthorArgs` klassini `@ArgsType()` yordamida quyidagicha yarating:

```typescript
@@filename(authors/dto/get-author.args)
import { MinLength } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
class GetAuthorArgs {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ defaultValue: '' })
  @MinLength(3)
  lastName: string;
}
```

> info **Hint** TypeScript metadata reflection tizimi cheklovlari sababli, tur va optionalityni ko'rsatish uchun `@Field` dekoratoridan foydalanish yoki [CLI plugin](/docs/graphql/cli-plugin)dan foydalanish kerak. Shuningdek, `firstName` GraphQL nullable field bo'lgani uchun, `null` yoki `undefined`ning non-value turlarini field tipiga qo'shish shart emas. Biroq, resolverlarda bu non-value turlarni hisobga olgan holda type guard qilish kerakligini yodda tuting, chunki GraphQL nullable field bunday turlarni resolverga o'tkazadi. 

Bu SDLda quyidagi qismini generatsiya qiladi:

```graphql
type Query {
  author(firstName: String, lastName: String = ''): Author
}
```

> info **Hint** `GetAuthorArgs` kabi arguments klasslari `ValidationPipe` bilan juda yaxshi ishlaydi (batafsil [bu yerda](/docs/techniques/validation)).

#### Klass merosi

Standart TypeScript klass merosidan foydalanib, generic utility type funksiyalariga ega (fieldlar, field xossalari, validatsiyalar va h.k.) bazaviy klasslarni yaratish va ularni kengaytirish mumkin. Masalan, sahifalashga oid argumentlar doimo `offset` va `limit` fieldlarini o'z ichiga oladi, lekin boshqa indeks fieldlari typega xos bo'lishi mumkin. Quyidagi kabi iyerarxiya qurishingiz mumkin.

Bazaviy `@ArgsType()` klass:

```typescript
@ArgsType()
class PaginationArgs {
  @Field(() => Int)
  offset: number = 0;

  @Field(() => Int)
  limit: number = 10;
}
```

Bazaviy `@ArgsType()` klassdan typega xos subklass:

```typescript
@ArgsType()
class GetAuthorArgs extends PaginationArgs {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ defaultValue: '' })
  @MinLength(3)
  lastName: string;
}
```

Xuddi shu yondashuvni `@ObjectType()` obyektlari bilan ham ishlatish mumkin. Bazaviy klassda generic xossalarni aniqlang:

```typescript
@ObjectType()
class Character {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}
```

Subklasslarda typega xos xossalarni qo'shing:

```typescript
@ObjectType()
class Warrior extends Character {
  @Field()
  level: number;
}
```

Resolver bilan ham merosdan foydalanishingiz mumkin. Merdos va TypeScript generiklarini birlashtirib type safety ta'minlaysiz. Masalan, generic `findAll` queryga ega bazaviy klass yaratish uchun quyidagi konstruktsiyadan foydalaning:

```typescript
function BaseResolver<T extends Type<unknown>>(classRef: T): any {
  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost {
    @Query(() => [classRef], { name: `findAll${classRef.name}` })
    async findAll(): Promise<T[]> {
      return [];
    }
  }
  return BaseResolverHost;
}
```

Quyidagilarni yodda tuting:

- aniq return type (`any` yuqorida) kerak: aks holda TypeScript private klass ta'rifidan foydalanishga shikoyat qiladi. Tavsiya: `any` o'rniga interfeys aniqlang.
- `Type` `@nestjs/common` paketidan import qilinadi
- `isAbstract: true` xossasi ushbu klass uchun SDL generatsiya qilinmasligi kerakligini bildiradi. Eslatma: bu xossani boshqa turlar uchun ham SDL generatsiyasini to'xtatish maqsadida qo'llash mumkin.

Quyidagicha `BaseResolver` ning konkret subklassini generatsiya qilishingiz mumkin:

```typescript
@Resolver(() => Recipe)
export class RecipesResolver extends BaseResolver(Recipe) {
  constructor(private recipesService: RecipesService) {
    super();
  }
}
```

Bu konstruktsiya SDLda quyidagini generatsiya qiladi:

```graphql
type Query {
  findAllRecipe: [Recipe!]!
}
```

#### Generiklar

Yuqorida generiklardan foydalanishning bir misolini ko'rdik. Bu kuchli TypeScript xususiyati foydali abstraksiyalar yaratishda qo'l keladi. Masalan, quyida shu hujjatga asoslangan kursorli pagination implementatsiyasi keltirilgan:

```typescript
import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

interface IEdgeType<T> {
  cursor: string;
  node: T;
}

export interface IPaginatedType<T> {
  edges: IEdgeType<T>[];
  nodes: T[];
  totalCount: number;
  hasNextPage: boolean;
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field(() => String)
    cursor: string;

    @Field(() => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => [EdgeType], { nullable: true })
    edges: EdgeType[];

    @Field(() => [classRef], { nullable: true })
    nodes: T[];

    @Field(() => Int)
    totalCount: number;

    @Field()
    hasNextPage: boolean;
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}
```

Yuqoridagi bazaviy klass aniqlangach, endi shu xatti-harakatni meros oladigan maxsus turlarni oson yarata olamiz. Masalan:

```typescript
@ObjectType()
class PaginatedAuthor extends Paginated(Author) {}
```

#### Schema first

[Oldingi](/docs/graphql/quick-start) bobda aytilganidek, schema first yondashuvda SDLda schema turlarini qo'lda belgilaymiz (batafsil bu yerda). Quyidagi SDL type ta'riflarini ko'rib chiqing.

> info **Hint** Ushbu bobda qulaylik uchun barcha SDLni bir joyga (masalan, bitta `.graphql` faylga) jamladik. Amalda esa kodni modul tarzda tashkil qilish maqsadga muvofiq bo'lishi mumkin. Masalan, har bir domen entitiga mos type ta'riflarini, tegishli servislar, resolver kodi va Nest modul ta'rifi klassi bilan birga alohida direktoriyada saqlash foydali bo'ladi. Nest barcha individual schema type ta'riflarini runtime da birlashtiradi.

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post]
}

type Post {
  id: Int!
  title: String!
  votes: Int
}

type Query {
  author(id: Int!): Author
}
```

#### Schema first resolver

Yuqoridagi schema bitta queryni taqdim etadi - `author(id: Int!): Author`.

> info **Hint** GraphQL querylar haqida ko'proq bu yerda o'qing.

Endi author querylarini yechadigan `AuthorsResolver` klassini yaratamiz:

```typescript
@@filename(authors/authors.resolver)
@Resolver('Author')
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query()
  async author(@Args('id') id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField()
  async posts(@Parent() author) {
    const { id } = author;
    return this.postsService.findAll({ authorId: id });
  }
}
```

> info **Hint** Barcha dekoratorlar (`@Resolver`, `@ResolveField`, `@Args` va h.k.) `@nestjs/graphql` paketidan eksport qilinadi.

> warning **Note** `AuthorsService` va `PostsService` ichidagi mantiq ehtiyojga qarab sodda yoki murakkab bo'lishi mumkin. Bu misolning asosiy maqsadi resolverlarni qanday qurish va ularning boshqa providerlar bilan qanday ishlashini ko'rsatishdir.

`@Resolver()` dekoratori majburiy. U ixtiyoriy string argument qabul qiladi va klass nomini bildiradi. Bu klass nomi, agar klassda `@ResolveField()` dekoratorlari bo'lsa, Nestga dekorator bilan belgilangan metod qaysi parent type (bizning misolda `Author`)ga tegishli ekanini bildirish uchun kerak. Muqobil ravishda, `@Resolver()`ni klass boshida belgilash o'rniga, har bir metodga qo'shish mumkin:

```typescript
@Resolver('Author')
@ResolveField()
async posts(@Parent() author) {
  const { id } = author;
  return this.postsService.findAll({ authorId: id });
}
```

Bu holatda (`@Resolver()` metod darajasida bo'lsa), klass ichidagi har bir `@ResolveField()` uchun `@Resolver()`ni alohida qo'shishingiz kerak. Bu yaxshi amaliyot hisoblanmaydi (ortiqcha yuk keltiradi).

> info **Hint** `@Resolver()`ga uzatilgan klass nomi argumenti querylar (`@Query()` dekoratori) yoki mutatsiyalarga (`@Mutation()` dekoratori) **ta'sir qilmaydi**.

> warning **Warning** `@Resolver` dekoratorini metod darajasida ishlatish **code first** yondashuvda qo'llab-quvvatlanmaydi.

Yuqoridagi misollarda `@Query()` va `@ResolveField()` dekoratorlari GraphQL schema turlariga metod nomi asosida bog'lanadi. Masalan, quyidagi konstruktsiyani oling:

```typescript
@Query()
async author(@Args('id') id: number) {
  return this.authorsService.findOneById(id);
}
```

Bu schemada author query uchun quyidagi entryni generatsiya qiladi (query type metodi bilan bir xil nomdan foydalanadi):

```graphql
type Query {
  author(id: Int!): Author
}
```

Odatda biz bu nomlarni ajratishni afzal ko'ramiz; resolver metodlari uchun `getAuthor()` yoki `getPosts()` kabi nomlardan foydalanamiz. Buni dekoratorga mapping nomini argument sifatida berish orqali oson qilamiz, quyida ko'rsatilgandek:

```typescript
@@filename(authors/authors.resolver)
@Resolver('Author')
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query('author')
  async getAuthor(@Args('id') id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return this.postsService.findAll({ authorId: id });
  }
}
```

> info **Hint** Nest CLI barcha boilerplate kodni avtomatik generatsiya qiladigan generator (schematic) taqdim etadi va developer tajribasini ancha soddalashtiradi. Bu imkoniyat haqida batafsil [bu yerda](/docs/recipes/crud-generator) o'qing.

#### Typelarni generatsiya qilish

Schema first yondashuvida typings generatsiyasi funksiyasi yoqilgan ( [oldingi](/docs/graphql/quick-start) bobda `outputAs: 'class'` bilan ko'rsatilganidek) deb faraz qilsak, ilovani ishga tushirgach quyidagi fayl generatsiya qilinadi ( `GraphQLModule.forRoot()` metodida ko'rsatgan joyga). Masalan, `src/graphql.ts`:

```typescript
@@filename(graphql)
export class Author {
  id: number;
  firstName?: string;
  lastName?: string;
  posts?: Post[];
}
export class Post {
  id: number;
  title: string;
  votes?: number;
}

export abstract class IQuery {
  abstract author(id: number): Author | Promise<Author>;
}
```

Klasslarni generatsiya qilish orqali (default interfeys generatsiyasi o'rniga) schema first yondashuv bilan birga deklarativ validatsiya **dekoratorlari**dan foydalanishingiz mumkin; bu juda foydali yondashuv (batafsil [bu yerda](/docs/techniques/validation)). Masalan, generatsiya qilingan `CreatePostInput` klassiga `class-validator` dekoratorlarini qo'shib `title` fieldi uchun minimal va maksimal uzunlikni belgilashingiz mumkin:

```typescript
import { MinLength, MaxLength } from 'class-validator';

export class CreatePostInput {
  @MinLength(3)
  @MaxLength(50)
  title: string;
}
```

> warning **Notice** Inputlar (va parametrlar) uchun auto-validationni yoqish uchun `ValidationPipe`dan foydalaning. Validatsiya haqida batafsil [bu yerda](/docs/techniques/validation) va pipe lar haqida [bu yerda](/docs/core/pipes) o'qing.

Biroq, avtomatik generatsiya qilingan faylga bevosita dekorator qo'shsangiz, bu fayl har safar generatsiya qilinganda **ustidan yoziladi**. Buning o'rniga, alohida fayl yarating va generatsiya qilingan klassni shunchaki kengaytiring.

```typescript
import { MinLength, MaxLength } from 'class-validator';
import { Post } from '../../graphql.ts';

export class CreatePostInput extends Post {
  @MinLength(3)
  @MaxLength(50)
  title: string;
}
```

#### GraphQL argument dekoratorlari

Standart GraphQL resolver argumentlariga maxsus dekoratorlar orqali kirishimiz mumkin. Quyida Nest dekoratorlari va ular ifodalovchi oddiy Apollo parametrlari taqqoslanadi.

<table>
  <tbody>
    <tr>
      <td><code>@Root()</code> and <code>@Parent()</code></td>
      <td><code>root</code>/<code>parent</code></td>
    </tr>
    <tr>
      <td><code>@Context(param?: string)</code></td>
      <td><code>context</code> / <code>context[param]</code></td>
    </tr>
    <tr>
      <td><code>@Info(param?: string)</code></td>
      <td><code>info</code> / <code>info[param]</code></td>
    </tr>
    <tr>
      <td><code>@Args(param?: string)</code></td>
      <td><code>args</code> / <code>args[param]</code></td>
    </tr>
  </tbody>
</table>

Bu argumentlarning ma'nosi quyidagicha:

- `root`: parent field resolveridan qaytgan natijani o'z ichiga oladigan obyekt yoki top-level `Query` fieldida server konfiguratsiyasidan berilgan `rootValue`
- `context`: ma'lum querydagi barcha resolverlar uchun umumiy obyekt; odatda har bir so'rov holatini saqlash uchun ishlatiladi
- `info`: query bajarilish holati haqida ma'lumotni o'z ichiga oladigan obyekt
- `args`: querydagi fieldga uzatilgan argumentlar obyekti

#### Modul

Yuqoridagi qadamlarni bajarganimizdan so'ng, `GraphQLModule` resolver mapni generatsiya qilish uchun zarur bo'lgan barcha ma'lumotni deklarativ tarzda belgilab oldik. `GraphQLModule` dekoratorlar orqali berilgan metadatani reflection yordamida tahlil qiladi va klasslarni to'g'ri resolver mapga avtomatik o'zgartiradi.

Qolgan yagona ish - resolver klass(lar)ini (`AuthorsResolver`) modulda **provider** sifatida ko'rsatish va modulni (`AuthorsModule`) import qilish, shunda Nest undan foydalanadi.

Masalan, buni `AuthorsModule`da qilishimiz mumkin; u shu kontekstda kerak bo'ladigan boshqa servislarni ham taqdim etishi mumkin. `AuthorsModule`ni albatta biror joyda import qiling (masalan, root modulda yoki root modul import qiladigan boshqa modulda).

```typescript
@@filename(authors/authors.module)
@Module({
  imports: [PostsModule],
  providers: [AuthorsService, AuthorsResolver],
})
export class AuthorsModule {}
```

> info **Hint** Kodingizni **domen modeli** bo'yicha tashkil qilish foydali (REST API dagi entry pointlarni qanday tashkil qilishingizga o'xshash). Bu yondashuvda modellaringizni (`ObjectType` klasslari), resolverlaringizni va servislaringizni domen modelini ifodalovchi Nest moduli ichida birga saqlang. Har bir modul uchun bularning barchasini bitta papkada saqlang. Shunday qilganingizda va [Nest CLI](/docs/cli/overview) orqali har bir elementni generatsiya qilsangiz, Nest bu qismlarning barchasini avtomatik bog'laydi (fayllarni mos papkalarga joylashtiradi, `provider` va `imports` massivlariga yozuvlar qo'shadi va h.k.).
