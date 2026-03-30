---
title: "Pipe'lar"
navTitle: "Pipe'lar"
description: "Pipe - @Injectable() dekoratori bilan belgilangan, PipeTransform interfeysini amalga oshiradigan sinf."
order: 14
group: core
groupTitle: "Core"
---
Pipe - `@Injectable()` dekoratori bilan belgilangan, `PipeTransform` interfeysini amalga oshiradigan sinf.

Pipe'lar odatda ikki turdagi foydalanish holatiga ega:

- **transformatsiya**: kirish ma'lumotlarini kerakli ko'rinishga o'zgartirish (masalan, satrdan butun songa)
- **validatsiya**: kirish ma'lumotlarini tekshirish va ular yaroqli bo'lsa o'zgarishsiz o'tkazish; aks holda, istisno tashlash

Har ikkala holatda pipe'lar <a href="/docs/core/controllers#route-parameters">controller route handler</a> tomonidan qayta ishlanayotgan `arguments` ustida ishlaydi. Nest metod chaqirilishidan biroz oldin pipe'ni joylashtiradi, va pipe metodga mo'ljallangan argumentlarni qabul qilib, ular ustida ishlaydi. Har qanday transformatsiya yoki validatsiya shu paytda amalga oshiriladi, shundan so'ng route handler (ehtimol) o'zgartirilgan argumentlar bilan chaqiriladi.

Nest bir qator tayyor pipe'lar bilan keladi va siz ulardan darhol foydalanishingiz mumkin. Shuningdek, o'zingizning maxsus pipe'laringizni ham qurishingiz mumkin. Bu bobda biz o'rnatilgan pipe'larni tanishtiramiz va ularni route handlerlarga qanday ulashni ko'rsatamiz. Keyin esa maxsus pipe'larni boshidan qurishni ko'rsatish uchun bir nechta misolni ko'rib chiqamiz.

> info **Hint** Pipe'lar exceptions zonasi ichida ishlaydi. Bu shuni anglatadiki, Pipe istisno tashlasa, u exceptions qatlami (global exceptions filter va joriy kontekstga qo'llangan har qanday [exceptions filters](/docs/core/exception-filters)) tomonidan qayta ishlanadi. Yuqoridagilardan kelib chiqib, Pipe ichida istisno tashlanganda, hech qanday controller metodi keyincha bajarilmasligi aniq bo'lishi kerak. Bu sizga tizim chegarasida tashqi manbalardan kelayotgan ma'lumotlarni tekshirish uchun eng yaxshi amaliyotga mos texnikani beradi.

#### O'rnatilgan pipe'lar

Nest bir nechta pipe'larni tayyor holatda taqdim etadi:

- `ValidationPipe`
- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`
- `ParseEnumPipe`
- `DefaultValuePipe`
- `ParseFilePipe`
- `ParseDatePipe`

Ular `@nestjs/common` paketidan eksport qilinadi.

Keling, `ParseIntPipe` dan foydalanishga qisqacha nazar tashlaylik. Bu **transformatsiya** foydalanish holatiga misol bo'lib, pipe metod handler parametrini JavaScript butun soniga aylantirilishini ta'minlaydi (yoki konvertatsiya muvaffaqiyatsiz bo'lsa, istisno tashlaydi). Keyingi bo'limlarda `ParseIntPipe` uchun oddiy maxsus implementatsiyani ko'rsatamiz. Quyidagi misollardagi usullar boshqa o'rnatilgan transformatsiya pipe'lariga ham (`ParseBoolPipe`, `ParseFloatPipe`, `ParseEnumPipe`, `ParseArrayPipe`, `ParseDatePipe`, va `ParseUUIDPipe`, bu bobda ularni `Parse*` pipe'lari deb ataymiz) tatbiq etiladi.

#### Pipe'larni ulash

Pipe'dan foydalanish uchun, pipe sinfining instansiyasini tegishli kontekstga ulashimiz kerak. `ParseIntPipe` misolimizda pipe'ni muayyan route handler metodiga bog'laymiz va u metod chaqirilishidan oldin ishlashini ta'minlaymiz. Buni quyidagi konstruktsiya orqali qilamiz, buni metod parametr darajasida pipe'ni ulash deb ataymiz:

```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

Bu quyidagi ikki shartdan biri bajarilishini ta'minlaydi: `findOne()` metodida qabul qiladigan parametr raqam bo'ladi (bizning `this.catsService.findOne()` chaqiruvimiz uchun kutilganidek), yoki route handler chaqirilishidan oldin istisno tashlanadi.

Masalan, route quyidagicha chaqirilgan bo'lsin:

```bash
GET localhost:3000/abc
```

Nest quyidagicha istisno tashlaydi:

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

Bu istisno `findOne()` metodining tanasi bajarilishining oldini oladi.

Yuqoridagi misolda biz instansiya emas, sinf (`ParseIntPipe`) ni uzatdik, instansiyalash mas'uliyatini freymvorkka qoldirib va dependency injection'ni yoqib. Pipe va guardlarda bo'lgani kabi, biz uning o'rniga joyida instansiya ham uzatishimiz mumkin. Joyida instansiya uzatish o'rnatilgan pipe xatti-harakatini moslashtirish uchun opsiyalarni berishni xohlaganimizda foydalidir:

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}
```

Boshqa transformatsiya pipe'larini (barcha **Parse\*** pipe'larini) ulash ham xuddi shunday ishlaydi. Bu pipe'larning barchasi route parametrlari, query string parametrlari va request body qiymatlarini validatsiya qilish kontekstida ishlaydi.

Masalan, query string parametri bilan:

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

Quyida `ParseUUIDPipe` yordamida satr parametrini ajratib olish va uning UUID ekanini tekshirish misoli keltirilgan.

```typescript
@@filename()
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}
@@switch
@Get(':uuid')
@Bind(Param('uuid', new ParseUUIDPipe()))
async findOne(uuid) {
  return this.catsService.findOne(uuid);
}
```

> info **Hint** `ParseUUIDPipe()` dan foydalanganda siz UUID ning 3, 4 yoki 5 versiyalarini ajratasiz, agar sizga faqat UUID ning muayyan versiyasi kerak bo'lsa, pipe opsiyalarida versiyani uzatishingiz mumkin.

Yuqorida `Parse*` oilasidagi o'rnatilgan pipe'larni ulash misollarini ko'rdik. Validatsiya pipe'larini ulash biroz boshqacha; buni keyingi bo'limda muhokama qilamiz.

> info **Hint** Validatsiya pipe'larining batafsil misollari uchun [Validation techniques](/docs/techniques/validation) ni ham ko'ring.

#### Maxsus pipe'lar

Aytilganidek, siz o'zingizning maxsus pipe'laringizni qurishingiz mumkin. Nest mustahkam o'rnatilgan `ParseIntPipe` va `ValidationPipe` taqdim etsa-da, maxsus pipe'lar qanday qurilishini ko'rsatish uchun har ikkisining sodda maxsus versiyasini noldan yasaymiz.

Biz oddiy `ValidationPipe` dan boshlaymiz. Avvaliga u kirish qiymatini qabul qilib, darhol o'sha qiymatni qaytaradi, ya'ni identifikatsiya funksiyasi kabi ishlaydi.

```typescript
@@filename(validation.pipe)
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationPipe {
  transform(value, metadata) {
    return value;
  }
}
```

> info **Hint** `PipeTransform<T, R>` - har qanday pipe amalga oshirishi shart bo'lgan generic interfeys. Generic interfeys `T` ni kiruvchi `value` tipini, `R` ni esa `transform()` metodining qaytish tipini ko'rsatish uchun ishlatadi.

Har bir pipe `PipeTransform` interfeysi shartnomasini bajarish uchun `transform()` metodini amalga oshirishi kerak. Bu metod ikki parametrga ega:

- `value`
- `metadata`

`value` parametri hozir qayta ishlanayotgan metod argumenti (route handling metodi qabul qilishidan oldin) bo'lib, `metadata` esa hozir qayta ishlanayotgan metod argumentining metadatasidir. Metadata obyekti quyidagi xossalarga ega:

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```

Ushbu xossalar hozir qayta ishlanayotgan argumentni tavsiflaydi.

<table>
  <tr>
    <td>
      <code>type</code>
    </td>
    <td>Argument body
      <code>@Body()</code>, query
      <code>@Query()</code>, param
      <code>@Param()</code>, yoki custom parametr (batafsil
      <a routerLink="/custom-decorators">bu yerda</a>) ekanini bildiradi.</td>
  </tr>
  <tr>
    <td>
      <code>metatype</code>
    </td>
    <td>
      Argumentning metatipini taqdim etadi, masalan,
      <code>String</code>. Eslatma: route handler metod imzosida tip deklaratsiyasini qoldirsangiz yoki oddiy JavaScript ishlatsangiz, qiymat
      <code>undefined</code> bo'ladi.
    </td>
  </tr>
  <tr>
    <td>
      <code>data</code>
    </td>
    <td>Dekoratorga uzatilgan satr, masalan
      <code>@Body('string')</code>. Qavslarni bo'sh qoldirsangiz,
      <code>undefined</code> bo'ladi.</td>
  </tr>
</table>

> warning **Warning** TypeScript interfeyslari transpilyatsiya vaqtida yo'qoladi. Shuning uchun, agar metod parametri tipi sinf o'rniga interfeys sifatida e'lon qilinsa, `metatype` qiymati `Object` bo'ladi.

#### Sxema asosidagi validatsiya

Keling, validatsiya pipe'ini biroz foydaliroq qilaylik. `CatsController` ning `create()` metodiga diqqat bilan qaraymiz; unda servis metodini ishga tushirishdan oldin post body obyekti yaroqli ekanini tekshirishni istashimiz tabiiy.

```typescript
@@filename()
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
async create(@Body() createCatDto) {
  this.catsService.create(createCatDto);
}
```

Keling, `createCatDto` body parametriga e'tibor qaratamiz. Uning tipi `CreateCatDto`:

```typescript
@@filename(create-cat.dto)
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

Biz create metodiga kelayotgan har qanday so'rov yaroqli body ni o'z ichiga olishini ta'minlamoqchimiz. Demak, `createCatDto` obyektining uchta a'zosini validatsiya qilishimiz kerak. Buni route handler metodining o'zida ham qilishimiz mumkin, ammo bu ideal emas, chunki u **yagona mas'uliyat prinsipi** (SRP) ni buzadi.

Boshqa yondashuv - **validator sinf** yaratib, vazifani o'sha yerga delegatsiya qilish. Buning kamchiligi shundaki, biz har bir metod boshida ushbu validatorni chaqirishni unutmasligimiz kerak.

Validatsiya middleware yaratish-chi? Bu ishlashi mumkin, ammo afsuski, butun ilova bo'ylab barcha kontekstlarda ishlatiladigan **umumiy middleware** yaratish mumkin emas. Buning sababi, middleware **bajarilish konteksti** haqida, jumladan chaqiriladigan handler va uning parametrlari haqida xabardor emas.

Bu, albatta, pipe'lar mo'ljallangan holatning o'zidir. Shunday ekan, validatsiya pipe'imizni yanada takomillashtiraylik.

#### Obyekt sxemasi validatsiyasi

Obyekt validatsiyasini toza, DRY usulda bajarish uchun bir nechta yondashuv mavjud. Keng tarqalgan yondashuvlardan biri - **sxema asosidagi** validatsiyadan foydalanish. Keling, shu yondashuvni sinab ko'ramiz.

Zod kutubxonasi tushunarli API bilan sxemalarni sodda tarzda yaratish imkonini beradi. Zod sxemalaridan foydalanadigan validatsiya pipe'ini quramiz.

Boshlash uchun kerakli paketni o'rnating:

```bash
$ npm install --save zod
```

Quyidagi kod misolida biz sxemani `constructor` argumenti sifatida qabul qiladigan sodda sinf yaratamiz. So'ng `schema.parse()` metodini qo'llaymiz, u kiruvchi argumentni taqdim etilgan sxemaga nisbatan tekshiradi.

Avval aytilganidek, **validatsiya pipe** yoki qiymatni o'zgarishsiz qaytaradi yoki istisno tashlaydi.

Keyingi bo'limda `@UsePipes()` dekoratori yordamida muayyan controller metodi uchun mos sxemani qanday berishimizni ko'rasiz. Bu biz ko'zlaganimizdek, validatsiya pipe'ini kontekstlar bo'ylab qayta foydalaniladigan qiladi.

```typescript
@@filename()
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema  } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}
@@switch
import { BadRequestException } from '@nestjs/common';

export class ZodValidationPipe {
  constructor(private schema) {}

  transform(value, metadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}

```

#### Validatsiya pipe'larini ulash

Oldin transformatsiya pipe'larini (`ParseIntPipe` va boshqa `Parse*` pipe'lar) qanday ulashni ko'rdik.

Validatsiya pipe'larini ulash ham juda sodda.

Bu holatda pipe'ni metod chaqiruv darajasida ulaymiz. Joriy misolimizda `ZodValidationPipe` dan foydalanish uchun quyidagilarni qilishimiz kerak:

1. `ZodValidationPipe` instansiyasini yaratish
2. Pipe sinfining konstruktoriga kontekstga xos Zod sxemasini uzatish
3. Pipe'ni metodga ulash

Zod sxemasi misoli:

```typescript
import { z } from 'zod';

export const createCatSchema = z
  .object({
    name: z.string(),
    age: z.number(),
    breed: z.string(),
  })
  .required();

export type CreateCatDto = z.infer<typeof createCatSchema>;
```

Buni quyida ko'rsatilgandek `@UsePipes()` dekoratori yordamida qilamiz:

```typescript
@@filename(cats.controller)
@Post()
@UsePipes(new ZodValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@Bind(Body())
@UsePipes(new ZodValidationPipe(createCatSchema))
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

> info **Hint** `@UsePipes()` dekoratori `@nestjs/common` paketidan import qilinadi.

> warning **Warning** `zod` kutubxonasi `tsconfig.json` faylida `strictNullChecks` konfiguratsiyasi yoqilgan bo'lishini talab qiladi.

#### Class validator

> warning **Warning** Ushbu bo'limdagi usullar TypeScriptni talab qiladi va ilovangiz oddiy JavaScriptda yozilgan bo'lsa, mavjud emas.

Keling, validatsiya texnikamizning muqobil implementatsiyasini ko'rib chiqaylik.

Nest class-validator kutubxonasi bilan yaxshi ishlaydi. Bu kuchli kutubxona dekoratorlar asosidagi validatsiyani ishlatishga imkon beradi. Dekoratorlar asosidagi validatsiya juda kuchli, ayniqsa Nestning **Pipe** imkoniyatlari bilan birga, chunki bizda qayta ishlanayotgan xossaning `metatype` iga kirish bor. Boshlashdan oldin kerakli paketlarni o'rnatamiz:

```bash
$ npm i --save class-validator class-transformer
```

Ular o'rnatilgach, `CreateCatDto` sinfiga bir nechta dekoratorlarni qo'shishimiz mumkin. Bu texnikaning muhim afzalligi shundaki, `CreateCatDto` sinfi Post body obyekti uchun yagona haqiqat manbai bo'lib qoladi (alohida validatsiya sinfini yaratish shart emas).

```typescript
@@filename(create-cat.dto)
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```

> info **Hint** class-validator dekoratorlari haqida batafsil bu yerda o'qing.

Endi ushbu anotatsiyalardan foydalanadigan `ValidationPipe` sinfini yaratishimiz mumkin.

```typescript
@@filename(validation.pipe)
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

> info **Hint** Eslatma sifatida, generic validation pipe'ini o'zingiz qurishingiz shart emas, chunki `ValidationPipe` Nest tomonidan tayyor holatda beriladi. O'rnatilgan `ValidationPipe` bu bobda ko'rsatganimizdan ko'ra ko'proq opsiyalarni taklif qiladi, biz esa maxsus pipe mexanizmini ko'rsatish uchun misolni sodda qilib qoldirdik. To'liq tafsilotlar va ko'plab misollarni [bu yerda](/docs/techniques/validation) topasiz.

> warning **Notice** Yuqorida biz class-transformer kutubxonasidan foydalandik, u **class-validator** kutubxonasining muallifi tomonidan yaratilgan, shuning uchun ular bir-biri bilan juda yaxshi ishlaydi.

Keling, ushbu kodni ko'rib chiqaylik. Avval `transform()` metodi `async` deb belgilanganiga e'tibor bering. Bu Nest sinxron va **asinxron** pipe'larni qo'llab-quvvatlagani uchun mumkin. Biz bu metodni `async` qildik, chunki class-validator validatsiyalarining ayrimlari asinxron bo'lishi mumkin (Promise'lardan foydalanadi).

Keyin, destructuring yordamida metatype maydonini ajratib (`ArgumentMetadata` dan faqat shu a'zoni olish) va uni `metatype` parametriga berayotganimizga e'tibor bering. Bu to'liq `ArgumentMetadata` ni olish va keyin metatype o'zgaruvchisini alohida tayinlashga qisqartma yozuvdir.

Keyin, `toValidate()` yordamchi funksiyasiga e'tibor bering. U hozir qayta ishlanayotgan argument native JavaScript tipi bo'lsa, validatsiya bosqichini chetlab o'tish uchun javobgar (bu tiplarga validatsiya dekoratorlari biriktirib bo'lmaydi, shuning uchun ularni validatsiya qilishning hojati yo'q).

Keyin, class-transformer funksiyasi `plainToInstance()` yordamida oddiy JavaScript argument obyektini tiplangan obyektga aylantiramiz, shunda validatsiyani qo'llay olamiz. Buni qilishimizning sababi shundaki, kiruvchi post body obyekti tarmoq so'rovidan deserializatsiya qilinganda **tip ma'lumotiga ega bo'lmaydi** (bu Express kabi platformalarning ishlash usuli). Class-validator biz DTO uchun oldin ta'riflagan validatsiya dekoratorlaridan foydalanishi kerak, shuning uchun kiruvchi body ni oddiy obyekt emas, balki mos dekoratsiyalangan obyekt sifatida ko'rish uchun bu transformatsiyani amalga oshiramiz.

Nihoyat, oldin aytilganidek, bu **validatsiya pipe** bo'lgani uchun u yoki qiymatni o'zgarishsiz qaytaradi, yoki istisno tashlaydi.

Oxirgi qadam `ValidationPipe` ni ulashdir. Pipe'lar parameter-scoped, method-scoped, controller-scoped yoki global-scoped bo'lishi mumkin. Oldin Zod asosidagi validatsiya pipe'imiz bilan pipe'ni metod darajasida ulash misolini ko'rdik.
Quyidagi misolda pipe instansiyasini route handler `@Body()` dekoratoriga bog'laymiz, shunda pipe post body ni validatsiya qilish uchun chaqiriladi.

```typescript
@@filename(cats.controller)
@Post()
async create(
  @Body(new ValidationPipe()) createCatDto: CreateCatDto,
) {
  this.catsService.create(createCatDto);
}
```

Parameter-scoped pipe'lar validatsiya mantiqi faqat bitta aniq parametrga tegishli bo'lganda foydalidir.

#### Global scoped pipe'lar

`ValidationPipe` maksimal darajada umumiy qilib yaratilgani sabab, uni **global-scoped** pipe sifatida sozlab, butun ilova bo'ylab barcha route handlerlarga qo'llash orqali uning to'liq foydasini ko'rishimiz mumkin.

```typescript
@@filename(main)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> warning **Notice** <a href="/docs/faq/hybrid-application">gibrid ilovalar</a> holatida `useGlobalPipes()` metodi gatewaylar va mikroservislarga pipe'larni o'rnatmaydi. "Standart" (gibrid bo'lmagan) mikroservis ilovalari uchun `useGlobalPipes()` pipe'larni global tarzda o'rnatadi.

Global pipe'lar butun ilova bo'ylab, har bir controller va har bir route handler uchun ishlatiladi.

Dependency injection nuqtai nazaridan shuni yodda tuting: har qanday moduldan tashqarida (`useGlobalPipes()` orqali, yuqoridagi misoldagidek) ro'yxatdan o'tkazilgan global pipe'lar bog'liqliklarni in'eksiya qila olmaydi, chunki bog'lash modul kontekstidan tashqarida bajarilgan. Bu muammoni hal qilish uchun quyidagi konstruktsiya yordamida global pipe'ni **bevosita istalgan moduldan** sozlashingiz mumkin:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

> info **Hint** Pipe uchun dependency injection'ni shu yondashuv orqali bajarishda, bu konstruktsiya qaysi modulda qo'llanmasin, pipe aslida global ekanini yodda tuting. Buni qayerda qilish kerak? Pipe (`ValidationPipe` yuqoridagi misolda) aniqlangan modulni tanlang. Shuningdek, `useClass` maxsus provayder ro'yxatga olishning yagona usuli emas. Batafsil bu yerda.

#### O'rnatilgan ValidationPipe

Eslatma sifatida, generic validation pipe'ini o'zingiz qurishingiz shart emas, chunki `ValidationPipe` Nest tomonidan tayyor holatda taqdim etiladi. O'rnatilgan `ValidationPipe` biz bu bobda ko'rsatgan namunadan ko'ra ko'proq opsiyalarni taklif qiladi, misol esa maxsus pipe mexanizmini ko'rsatish uchun soddalashtirilgan. To'liq tafsilotlar va ko'plab misollarni [bu yerda](/docs/techniques/validation) topasiz.

#### Transformatsiya foydalanish holati

Validatsiya maxsus pipe'lar uchun yagona foydalanish holati emas. Bu bob boshida aytganimizdek, pipe kirish ma'lumotlarini kerakli formatga **o'zgartirishi** ham mumkin. Bu `transform` funksiyasidan qaytgan qiymat argumentning oldingi qiymatini to'liq almashtirgani uchun mumkin.

Bu qachon foydali? Ba'zan klientdan kelgan ma'lumot route handler metodi tomonidan to'g'ri qayta ishlanishi uchun o'zgarishga muhtoj bo'ladi - masalan, satrni butun songa aylantirish. Bundan tashqari, ba'zi majburiy maydonlar yo'q bo'lishi mumkin va biz standart qiymatlarni qo'llashni istaymiz. **Transformatsiya pipe'lari** klient so'rovi va so'rov handleri orasiga qayta ishlash funksiyasini joylashtirib, buni bajarishi mumkin.

Quyida satrni butun songa aylantirish uchun javobgar bo'lgan oddiy `ParseIntPipe` keltirilgan. (Yuqorida aytilgandek, Nestda yanada mukammal o'rnatilgan `ParseIntPipe` bor; biz buni maxsus transformatsiya pipe'ining sodda misoli sifatida kiritdik).

```typescript
@@filename(parse-int.pipe)
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
@@switch
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe {
  transform(value, metadata) {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

So'ng bu pipe'ni quyida ko'rsatilganidek tanlangan parametrga ulashimiz mumkin:

```typescript
@@filename()
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return this.catsService.findOne(id);
}
@@switch
@Get(':id')
@Bind(Param('id', new ParseIntPipe()))
async findOne(id) {
  return this.catsService.findOne(id);
}
```

Yana bir foydali transformatsiya holati - so'rovda uzatilgan id yordamida ma'lumotlar bazasidan **mavjud foydalanuvchi** entitysini tanlab olish:

```typescript
@@filename()
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
  return userEntity;
}
@@switch
@Get(':id')
@Bind(Param('id', UserByIdPipe))
findOne(userEntity) {
  return userEntity;
}
```

Bu pipe'ning implementatsiyasini o'quvchiga qoldiramiz, ammo boshqa transformatsiya pipe'lar kabi, u kirish qiymatini (`id`) qabul qilib, chiqish qiymatini (`UserEntity` obyektini) qaytaradi. Bu kodni yanada deklarativ va DRY qiladi, handlerdan boilerplate kodni chiqarib, umumiy pipe ichiga joylashtiradi.

#### Standart qiymatlarni berish

`Parse*` pipe'lar parametr qiymati mavjud bo'lishini kutadi. `null` yoki `undefined` qiymatlar kelganda ular istisno tashlaydi. Endpointsiz querystring parametr qiymatlari yo'q bo'lishini qo'llab-quvvatlash uchun, `Parse*` pipe'lari bu qiymatlar ustida ishlashidan oldin standart qiymat berishimiz kerak. `DefaultValuePipe` aynan shu maqsadga xizmat qiladi. `@Query()` dekoratorida tegishli `Parse*` pipe'idan oldin `DefaultValuePipe` instansiyasini yarating, quyida ko'rsatilgandek:

```typescript
@@filename()
@Get()
async findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {
  return this.catsService.findAll({ activeOnly, page });
}
```
