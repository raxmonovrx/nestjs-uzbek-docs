---
title: "Validatsiya"
navTitle: "Validatsiya"
description: "Veb ilovaga yuborilgan har qanday ma'lumotning to'g'riligini tekshirish eng yaxshi amaliyotdir. Kelayotgan so'rovlarni avtomatik validatsiya qilish uchun Nest bir nechta tayyor pip"
order: 19
group: techniques
groupTitle: "Techniques"
---
Veb ilovaga yuborilgan har qanday ma'lumotning to'g'riligini tekshirish eng yaxshi amaliyotdir. Kelayotgan so'rovlarni avtomatik validatsiya qilish uchun Nest bir nechta tayyor pipe larni taqdim etadi:

- `ValidationPipe`
- `ParseIntPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`

`ValidationPipe` kuchli class-validator paketidan va uning deklarativ validatsiya dekoratorlaridan foydalanadi. `ValidationPipe` barcha kiruvchi klient payloadlari uchun validatsiya qoidalarini majburan qo'llashning qulay usulini beradi; maxsus qoidalar har bir moduldagi lokal class/DTO deklaratsiyalarida oddiy annotatsiyalar orqali belgilanadi.

#### Umumiy ko'rinish

[Pipes](/docs/core/pipes) bobida biz oddiy pipe larni qurish va ularni controllerlarga, metodlarga yoki global ilovaga bog'lash jarayonini ko'rib chiqdik. Ushbu bob mavzularini yaxshiroq tushunish uchun o'sha bobni qayta ko'rib chiqishni unutmang. Bu yerda esa `ValidationPipe` ning turli **real hayot** foydalanish holatlarini ko'rib chiqamiz va uning ayrim ilg'or sozlash imkoniyatlaridan qanday foydalanishni ko'rsatamiz.

#### Ichki ValidationPipe dan foydalanish

Uni ishlatishni boshlash uchun avval kerakli bog'liqlikni o'rnatamiz.

```bash
$ npm i --save class-validator class-transformer
```

> info **Hint** `ValidationPipe` `@nestjs/common` paketidan eksport qilinadi.

Bu pipe `class-validator` va `class-transformer` kutubxonalaridan foydalangani uchun, ko'plab opsiyalar mavjud. Siz bu sozlamalarni pipe ga uzatiladigan konfiguratsiya obyektida belgilaysiz. Quyida ichki opsiyalar keltirilgan:

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}
```

Bularga qo'shimcha ravishda, barcha `class-validator` opsiyalari (ya'ni `ValidatorOptions` interfeysidan meros bo'lganlar) ham mavjud:

<table>
  <tr>
    <th>Option</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>enableDebugMessages</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, validator nimadir noto'g'ri bo'lsa konsolga qo'shimcha ogohlantirish xabarlarini chiqaradi.</td>
  </tr>
  <tr>
    <td><code>skipUndefinedProperties</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, validator tekshirilayotgan obyektidagi undefined bo'lgan barcha xossalarni validatsiyadan o'tkazmaydi.</td>
  </tr>
  <tr>
    <td><code>skipNullProperties</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, validator tekshirilayotgan obyektidagi null bo'lgan barcha xossalarni validatsiyadan o'tkazmaydi.</td>
  </tr>
  <tr>
    <td><code>skipMissingProperties</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, validator tekshirilayotgan obyektidagi null yoki undefined bo'lgan barcha xossalarni validatsiyadan o'tkazmaydi.</td>
  </tr>
  <tr>
    <td><code>whitelist</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, validator validatsiyadan o'tgan (qaytarilgan) obyektni validatsiya dekoratorlari ishlatilmagan xossalardan tozalaydi.</td>
  </tr>
  <tr>
    <td><code>forbidNonWhitelisted</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, whitelistdan tashqari xossalarni kesib tashlash o'rniga validator istisno chiqaradi.</td>
  </tr>
  <tr>
    <td><code>forbidUnknownValues</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, noma'lum obyektlarni validatsiya qilish urinishlari darhol muvaffaqiyatsiz bo'ladi.</td>
  </tr>
  <tr>
    <td><code>disableErrorMessages</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, validatsiya xatolari klientga qaytarilmaydi.</td>
  </tr>
  <tr>
    <td><code>errorHttpStatusCode</code></td>
    <td><code>number</code></td>
    <td>Bu sozlama xato bo'lganda qaysi istisno turi ishlatilishini belgilash imkonini beradi. Default holatda <code>BadRequestException</code> tashlanadi.</td>
  </tr>
  <tr>
    <td><code>exceptionFactory</code></td>
    <td><code>Function</code></td>
    <td>Validatsiya xatolari massividan istisno obyektini yaratib qaytaradi.</td>
  </tr>
  <tr>
    <td><code>groups</code></td>
    <td><code>string[]</code></td>
    <td>Obyektni validatsiya qilishda ishlatiladigan guruhlar.</td>
  </tr>
  <tr>
    <td><code>always</code></td>
    <td><code>boolean</code></td>
    <td>Dekoratorlar uchun <code>always</code> opsiyasining defaultini belgilaydi. Default dekorator opsiyalarida override qilinishi mumkin.</td>
  </tr>

  <tr>
    <td><code>strictGroups</code></td>
    <td><code>boolean</code></td>
    <td>Agar <code>groups</code> berilmasa yoki bo'sh bo'lsa, kamida bitta guruhi bo'lgan dekoratorlarni e'tiborsiz qoldiradi.</td>
  </tr>
  <tr>
    <td><code>dismissDefaultMessages</code></td>
    <td><code>boolean</code></td>
    <td>Agar true bo'lsa, validatsiya default xabarlardan foydalanmaydi. Xabar aniq ko'rsatilmagan bo'lsa, xato xabari har doim <code>undefined</code> bo'ladi.</td>
  </tr>
  <tr>
    <td><code>validationError.target</code></td>
    <td><code>boolean</code></td>
    <td><code>ValidationError</code> ichida target ko'rsatilishini belgilaydi.</td>
  </tr>
  <tr>
    <td><code>validationError.value</code></td>
    <td><code>boolean</code></td>
    <td><code>ValidationError</code> ichida validatsiyalangan qiymat ko'rsatilishini belgilaydi.</td>
  </tr>
  <tr>
    <td><code>stopAtFirstError</code></td>
    <td><code>boolean</code></td>
    <td>True bo'lsa, berilgan xossa uchun validatsiya birinchi xatodan so'ng to'xtaydi. Default false.</td>
  </tr>
</table>

> info **Notice** `class-validator` paketi haqida batafsil ma'lumotni uning repozitoriyidan toping.

#### Avto-validatsiya

`ValidationPipe` ni ilova darajasida bog'lab boshlaymiz, shunda barcha endpointlar noto'g'ri ma'lumot olishdan himoyalanadi.

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Pipe ni sinab ko'rish uchun oddiy endpoint yaratamiz.

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}
```

> info **Hint** TypeScript **generics yoki interfeyslar** haqida metadata saqlamaganligi sababli, ularni DTOlarda ishlatsangiz, `ValidationPipe` kiruvchi ma'lumotlarni to'g'ri validatsiya qila olmasligi mumkin. Shu sababli, DTOlarda aniq klasslardan foydalanishni ko'rib chiqing.

> info **Hint** DTOlarni import qilayotganda type-only importdan foydalana olmaysiz, chunki u runtime da olib tashlanadi, ya'ni `import {{ '{' }} CreateUserDto {{ '}' }}` ishlating, `import type {{ '{' }} CreateUserDto {{ '}' }}` emas.

Endi `CreateUserDto` ga bir nechta validatsiya qoidalarini qo'shishimiz mumkin. Buni `class-validator` paketi taqdim etgan dekoratorlar yordamida qilamiz, ular batafsil bu yerda tasvirlangan. Shu tarzda `CreateUserDto` ishlatadigan har qanday route avtomatik ravishda bu qoidalarni majburan qo'llaydi.

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

Bu qoidalar bilan, agar so'rovimizda `email` xossasi noto'g'ri bo'lsa, ilova avtomatik ravishda `400 Bad Request` kodi bilan javob beradi va quyidagi response body ni qaytaradi:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}
```

So'rov body larini validatsiya qilishdan tashqari, `ValidationPipe` ni so'rov obyektining boshqa xossalari bilan ham ishlatish mumkin. Masalan, endpoint pathida `:id` qabul qilishni xohlaymiz. Bu so'rov parametri uchun faqat sonlar qabul qilinishi kerak bo'lsa, quyidagi konstruktsiyadan foydalanamiz:

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}
```

`FindOneParams`, DTOga o'xshab, `class-validator` yordamida validatsiya qoidalarini belgilaydigan klass. U quyidagicha ko'rinadi:

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: string;
}
```

#### Batafsil xatolarni o'chirish

Xato xabarlari so'rovda nima noto'g'ri bo'lganini tushuntirish uchun foydali bo'lishi mumkin. Biroq, ayrim production muhitlarida batafsil xatolarni o'chirish afzal. Buni `ValidationPipe` ga opsiyalar obyektini uzatish orqali qiling:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);
```

Natijada, batafsil xato xabarlari response body da ko'rsatilmaydi.

#### Xossalarni tozalash

`ValidationPipe` metod handleriga yetib kelmasligi kerak bo'lgan xossalarni ham filtrlashi mumkin. Bunda biz qabul qilinadigan xossalarni **whitelist** qilishimiz mumkin, va whitelistga kirmagan har qanday xossa natijaviy obyektlardan avtomatik olib tashlanadi. Masalan, handler `email` va `password` xossalarini kutadi, ammo so'rovda `age` ham bo'lsa, bu xossa DTOdan avtomatik olib tashlanadi. Buni yoqish uchun `whitelist` ni `true` qiling.

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);
```

`true` bo'lganda, whitelistga kirmagan xossalar (validatsiya klassida hech qanday dekoratorga ega bo'lmaganlar) avtomatik olib tashlanadi.

Muqobil ravishda, whitelistga kirmagan xossalar mavjud bo'lsa, so'rovni to'xtatib foydalanuvchiga xato javobini qaytarishingiz mumkin. Buni yoqish uchun `whitelist` ni `true` qilib qo'ying va qo'shimcha ravishda `forbidNonWhitelisted` xossasini `true` qiling.

#### Payload obyektlarini transformatsiya qilish

Tarmoq orqali keladigan payloadlar oddiy JavaScript obyektlaridir. `ValidationPipe` payloadlarni ularning DTO klasslariga mos tiplashtirilgan obyektlarga avtomatik transformatsiya qilishi mumkin. Avto-transformatsiyani yoqish uchun `transform` ni `true` qiling. Buni metod darajasida ham qilish mumkin:

```typescript
@@filename(cats.controller)
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

Bu xatti-harakatni global yoqish uchun global pipe da opsiyani belgilang:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);
```

Avto-transformatsiya yoqilganda, `ValidationPipe` primitive turlarni ham konvertatsiya qiladi. Quyidagi misolda `findOne()` metodi extracted `id` path parametrini qabul qiladi:

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}
```

Default holatda, har bir path parametri va query parametri tarmoq orqali `string` sifatida keladi. Yuqoridagi misolda biz `id` tipini `number` deb ko'rsatdik (metod signatureda). Shuning uchun `ValidationPipe` string identifikatorni avtomatik ravishda songa aylantirishga urinadi.

#### Aniq konvertatsiya

Yuqoridagi bo'limda `ValidationPipe` kutilgan tipga asoslanib query va path parametrlarini yashirincha transformatsiya qilishini ko'rsatdik. Biroq, bu funksiya avto-transformatsiya yoqilgan bo'lgandagina ishlaydi.

Muqobil ravishda (avto-transformatsiya o'chirilgan bo'lsa), `ParseIntPipe` yoki `ParseBoolPipe` yordamida qiymatlarni aniq cast qilishingiz mumkin (eslatma: `ParseStringPipe` kerak emas, chunki oldin aytilganidek, har bir path parametri va query parametri default holatda `string` bo'lib keladi).

```typescript
@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('sort', ParseBoolPipe) sort: boolean,
) {
  console.log(typeof id === 'number'); // true
  console.log(typeof sort === 'boolean'); // true
  return 'This action returns a user';
}
```

> info **Hint** `ParseIntPipe` va `ParseBoolPipe` `@nestjs/common` paketidan eksport qilinadi.

#### Mapped types

**CRUD** (Create/Read/Update/Delete) kabi funksiyalarni qurayotganda, ko'pincha bazaviy entity tipining variantlarini yaratish foydali bo'ladi. Nest bu vazifani yengillashtirish uchun type transformatsiyalarini bajaradigan bir nechta yordamchi funksiyalarni taqdim etadi.

> **Warning** Agar ilovangiz `@nestjs/swagger` paketidan foydalansa, Mapped Types haqida batafsil ma'lumot uchun [bu bob](/docs/openapi/mapped-types)ga qarang. Xuddi shuningdek, `@nestjs/graphql` paketidan foydalansangiz [bu bob](/docs/graphql/mapped-types)ga qarang. Har ikkala paket tiplarga kuchli tayanadi va shuning uchun ularda boshqa import kerak bo'ladi. Shu sababli, agar ilova turiga mos `@nestjs/swagger` yoki `@nestjs/graphql` o'rniga `@nestjs/mapped-types` dan foydalansangiz, turli, hujjatlashtirilmagan yon ta'sirlarga duch kelishingiz mumkin.

Input validatsiya turlarini (DTOlar deb ham ataladi) qurayotganda, ko'pincha bir xil tipning **create** va **update** variantlarini yaratish kerak bo'ladi. Masalan, **create** variantida barcha maydonlar majburiy bo'lishi mumkin, **update** variantida esa barcha maydonlar ixtiyoriy bo'ladi.

Nest bu vazifani osonlashtirish va boilerplate ni kamaytirish uchun `PartialType()` yordamchi funksiyasini taqdim etadi.

`PartialType()` funksiyasi kiruvchi tipdagi barcha xossalari ixtiyoriy bo'lgan yangi tip (klass) qaytaradi. Masalan, bizda quyidagi **create** tipi bo'lsin:

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

Default holatda, bu maydonlarning barchasi majburiy. Xuddi shu maydonlarga ega, lekin har biri ixtiyoriy bo'lgan tip yaratish uchun `PartialType()` dan foydalanib klass reference (`CreateCatDto`) ni argument sifatida bering:

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

> info **Hint** `PartialType()` funksiyasi `@nestjs/mapped-types` paketidan import qilinadi.

`PickType()` funksiyasi kiruvchi tipdan xossalar to'plamini tanlab, yangi tip (klass) yaratadi. Masalan, quyidagi tipdan boshlaymiz:

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

Ushbu klassdan xossalar to'plamini `PickType()` yordamchi funksiyasi bilan tanlashimiz mumkin:

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

> info **Hint** `PickType()` funksiyasi `@nestjs/mapped-types` paketidan import qilinadi.

`OmitType()` funksiyasi kiruvchi tipdan barcha xossalarni olib, so'ng muayyan kalitlar to'plamini olib tashlab yangi tip yaratadi. Masalan, quyidagi tipdan boshlaymiz:

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

Quyida `name` dan **tashqari** barcha xossalarga ega hosila tip yaratamiz. Bu konstruktsiyada `OmitType` ning ikkinchi argumenti xossa nomlari massividir.

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

> info **Hint** `OmitType()` funksiyasi `@nestjs/mapped-types` paketidan import qilinadi.

`IntersectionType()` funksiyasi ikkita tipni birlashtirib, yangi tip (klass) hosil qiladi. Masalan, quyidagi ikki tipdan boshlaymiz:

```typescript
export class CreateCatDto {
  name: string;
  breed: string;
}

export class AdditionalCatInfo {
  color: string;
}
```

Biz barcha xossalarni ikkala tipdan birlashtiradigan yangi tip yaratamiz.

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
```

> info **Hint** `IntersectionType()` funksiyasi `@nestjs/mapped-types` paketidan import qilinadi.

Type mapping yordamchi funksiyalarini bir-biri bilan kompozitsiya qilish mumkin. Masalan, quyidagisi `CreateCatDto` tipidagi barcha xossalarga ega bo'lgan, faqat `name` dan tashqari va bu xossalar ixtiyoriy bo'lgan tipni yaratadi:

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```

#### Massivlarni parse qilish va validatsiya qilish

TypeScript generics yoki interfeyslar haqida metadata saqlamaydi, shuning uchun ularni DTOlarda ishlatganingizda `ValidationPipe` kiruvchi ma'lumotlarni to'g'ri validatsiya qila olmasligi mumkin. Masalan, quyidagi kodda `createUserDtos` to'g'ri validatsiya qilinmaydi:

```typescript
@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}
```

Massivni validatsiya qilish uchun, massivni o'rab turadigan xossaga ega alohida klass yarating yoki `ParseArrayPipe` dan foydalaning.

```typescript
@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}
```

Bundan tashqari, `ParseArrayPipe` query parametrlarini parse qilishda ham qo'l keladi. Keling, query parametrlari orqali yuborilgan identifikatorlar bo'yicha userlarni qaytaradigan `findByIds()` metodini ko'rib chiqamiz.

```typescript
@Get()
findByIds(
  @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  return 'This action returns users by ids';
}
```

Bu konstruktsiya quyidagi HTTP `GET` so'rovi orqali kelgan query parametrlarini validatsiya qiladi:

```bash
GET /?ids=1,2,3
```

#### WebSockets va Microservices

Bu bob HTTP uslubidagi ilovalar (masalan, Express yoki Fastify) misollarini ko'rsatsa-da, `ValidationPipe` ishlatilayotgan transport usulidan qat'i nazar WebSockets va microservices uchun xuddi shunday ishlaydi.

#### Batafsil

Custom validatorlar, xato xabarlari va mavjud dekoratorlar haqida batafsil ma'lumotni `class-validator` paketi taqdim etadi, bu yerda o'qing.
