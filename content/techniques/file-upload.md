---
title: "Fayl yuklash"
navTitle: "Fayl yuklash"
description: "Fayl yuklashni boshqarish uchun Nest Express uchun multer middleware paketiga asoslangan ichki modulni taqdim etadi. Multer multipart/form-data formatida yuborilgan ma'lumotlarni q"
order: 6
group: techniques
groupTitle: "Techniques"
---
Fayl yuklashni boshqarish uchun Nest Express uchun multer middleware paketiga asoslangan ichki modulni taqdim etadi. Multer `multipart/form-data` formatida yuborilgan ma'lumotlarni qayta ishlaydi, bu format asosan HTTP `POST` so'rovi orqali fayl yuklash uchun ishlatiladi. Bu modul to'liq sozlanadi va uning xatti-harakatini ilova talablariga moslab sozlashingiz mumkin.

> warning **Warning** Multer qo'llab-quvvatlanadigan multipart formatida (`multipart/form-data`) bo'lmagan ma'lumotlarni qayta ishlay olmaydi. Shuningdek, bu paket `FastifyAdapter` bilan mos emasligini unutmang.

Yaxshiroq tip xavfsizligi uchun Multer typings paketini o'rnatamiz:

```shell
$ npm i -D @types/multer
```

Bu paket o'rnatilgach, `Express.Multer.File` turidan foydalanishimiz mumkin (bu turni quyidagicha import qilishingiz mumkin: `import {{ '{' }} Express {{ '}' }} from 'express'`).

#### Asosiy misol

Bitta faylni yuklash uchun `FileInterceptor()` interceptorini marshrut handleriga bog'lang va `@UploadedFile()` dekoratori yordamida `request` ichidan `file` ni oling.

```typescript
@@filename()
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}
@@switch
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
@Bind(UploadedFile())
uploadFile(file) {
  console.log(file);
}
```

> info **Hint** `FileInterceptor()` dekoratori `@nestjs/platform-express` paketidan eksport qilinadi. `@UploadedFile()` dekoratori `@nestjs/common` dan eksport qilinadi.

`FileInterceptor()` dekoratori ikki argument qabul qiladi:

- `fieldName`: HTML formadagi fayl saqlanadigan maydon nomini ko'rsatadigan string
- `options`: `MulterOptions` turidagi ixtiyoriy obyekt. Bu multer konstruktorida ishlatiladigan xuddi shu obyekt (batafsil bu yerda).

> warning **Warning** `FileInterceptor()` Google Firebase kabi uchinchi tomon bulut provayderlari yoki boshqalari bilan mos kelmasligi mumkin.

#### Faylni validatsiya qilish

Ko'pincha kelayotgan fayl metama'lumotlarini, masalan fayl hajmi yoki MIME turi, tekshirish foydali bo'ladi. Buning uchun o'zingizning [Pipe](/docs/core/pipes) yaratib, uni `UploadedFile` dekoratori bilan belgilangan parametrga bog'lashingiz mumkin. Quyidagi misol oddiy fayl hajmi validator pipe qanday amalga oshirilishini ko'rsatadi:

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const oneKb = 1000;
    return value.size < oneKb;
  }
}
```

Buni `FileInterceptor` bilan birga quyidagicha ishlatish mumkin:

```typescript
@Post('file')
@UseInterceptors(FileInterceptor('file'))
uploadFileAndValidate(@UploadedFile(
  new FileSizeValidationPipe(),
  // other pipes can be added here
) file: Express.Multer.File, ) {
  return file;
}
```

Nest keng tarqalgan holatlarni qamrab olish va yangilarini qo'shishni osonlashtirish/standartlashtirish uchun ichki pipe taqdim etadi. Bu pipe `ParseFilePipe` deb ataladi va undan quyidagicha foydalanishingiz mumkin:

```typescript
@Post('file')
uploadFileAndPassValidation(
  @Body() body: SampleDto,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        // ... Set of file validator instances here
      ]
    })
  )
  file: Express.Multer.File,
) {
  return {
    body,
    file: file.buffer.toString(),
  };
}
```

Ko'rib turganingizdek, `ParseFilePipe` bajaradigan fayl validatorlari massivini ko'rsatish talab qilinadi. Validator interfeysi haqida keyinroq gaplashamiz, ammo bu pipe yana ikki **ixtiyoriy** parametrga ega ekanini aytib o'tish kerak:

<table>
  <tr>
    <td><code>errorHttpStatusCode</code></td>
    <td>Har qanday validator muvaffaqiyatsiz bo'lsa, tashlanadigan HTTP status kodi. Standarti <code>400</code> (BAD REQUEST)</td>
  </tr>
  <tr>
    <td><code>exceptionFactory</code></td>
    <td>Xato xabarini qabul qilib, xatoni qaytaradigan factory.</td>
  </tr>
</table>

Endi `FileValidator` interfeysiga qaytamiz. Validatorlarni bu pipe bilan integratsiya qilish uchun siz ichki implementatsiyalardan foydalanishingiz yoki o'zingizning `FileValidator` ni taqdim etishingiz kerak. Quyidagi misolga qarang:

```typescript
export abstract class FileValidator<TValidationOptions = Record<string, any>> {
  constructor(protected readonly validationOptions: TValidationOptions) {}

  /**
   * Indicates if this file should be considered valid, according to the options passed in the constructor.
   * @param file the file from the request object
   */
  abstract isValid(file?: any): boolean | Promise<boolean>;

  /**
   * Builds an error message in case the validation fails.
   * @param file the file from the request object
   */
  abstract buildErrorMessage(file: any): string;
}
```

> info **Hint** `FileValidator` interfeysi `isValid` funksiyasi orqali async validatsiyani qo'llab-quvvatlaydi. Tip xavfsizligidan foydalanish uchun, agar driver sifatida express (default) ishlatayotgan bo'lsangiz, `file` parametrini `Express.Multer.File` sifatida tiplashingiz ham mumkin.

`FileValidator` oddiy klass bo'lib, fayl obyektiga kirish huquqiga ega va mijoz taqdim etgan variantlarga ko'ra uni tekshiradi. Nestda loyihangizda ishlatishingiz mumkin bo'lgan ikkita ichki `FileValidator` implementatsiyasi mavjud:

- `MaxFileSizeValidator` - berilgan fayl hajmi ko'rsatilgan qiymatdan kichikligini tekshiradi (`bytes` da o'lchanadi)
- `FileTypeValidator` - berilgan faylning MIME turini berilgan satr yoki RegExp bilan mosligini tekshiradi. Default holatda MIME turini fayl kontentidagi magic number orqali tekshiradi

Yuqorida tilga olingan `FileParsePipe` bilan birga qanday ishlatilishini tushunish uchun, oxirgi misolning o'zgartirilgan parchasi bilan ko'rsatamiz:

```typescript
@UploadedFile(
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1000 }),
      new FileTypeValidator({ fileType: 'image/jpeg' }),
    ],
  }),
)
file: Express.Multer.File,
```

> info **Hint** Agar validatorlar soni ancha ko'payib ketsa yoki ularning opsiyalari faylni to'ldirib yuborsa, bu massivni alohida faylda aniqlab, bu yerda `fileValidators` kabi nomlangan konstanta sifatida import qilishingiz mumkin.

Nihoyat, validatorlarni tuzish va kompozitsiya qilish imkonini beradigan maxsus `ParseFilePipeBuilder` klassidan foydalanishingiz mumkin. Quyida ko'rsatilgandek ishlatsangiz, har bir validatorni qo'lda yaratishdan qochib, ularning opsiyalarini bevosita uzatasiz:

```typescript
@UploadedFile(
  new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: 'jpeg',
    })
    .addMaxSizeValidator({
      maxSize: 1000
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    }),
)
file: Express.Multer.File,
```

> info **Hint** Fayl mavjudligi default bo'yicha talab qilinadi, ammo `build` funksiyasi opsiyalarida (xuddi `errorHttpStatusCode` bilan bir xil darajada) `fileIsRequired: false` parametrini qo'shib, uni ixtiyoriy qilishingiz mumkin.

#### Fayllar massivi

Bitta maydon nomi bilan aniqlanadigan fayllar massivini yuklash uchun `FilesInterceptor()` dekoratoridan foydalaning (dekorator nomidagi ko'plik **Files** ga e'tibor bering). Bu dekorator uchta argument qabul qiladi:

- `fieldName`: yuqorida tasvirlanganidek
- `maxCount`: qabul qilinadigan maksimal fayllar sonini belgilovchi ixtiyoriy son
- `options`: yuqorida ta'riflanganidek ixtiyoriy `MulterOptions` obyekti

`FilesInterceptor()` dan foydalanganda, `@UploadedFiles()` dekoratori orqali `request` ichidan fayllarni oling.

```typescript
@@filename()
@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  console.log(files);
}
@@switch
@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
@Bind(UploadedFiles())
uploadFile(files) {
  console.log(files);
}
```

> info **Hint** `FilesInterceptor()` dekoratori `@nestjs/platform-express` paketidan eksport qilinadi. `@UploadedFiles()` dekoratori `@nestjs/common` dan eksport qilinadi.

#### Bir nechta fayl

Bir nechta faylni (har biri turli maydon nomlari bilan) yuklash uchun `FileFieldsInterceptor()` dekoratoridan foydalaning. Bu dekorator ikki argument qabul qiladi:

- `uploadedFields`: obyektlar massivi bo'lib, har bir obyekt yuqorida ta'riflanganidek maydon nomini ko'rsatadigan `name` xossasiga ega bo'lishi shart, hamda ixtiyoriy `maxCount` xossasiga ega bo'lishi mumkin
- `options`: yuqorida ta'riflanganidek ixtiyoriy `MulterOptions` obyekti

`FileFieldsInterceptor()` dan foydalanganda, `@UploadedFiles()` dekoratori orqali `request` ichidan fayllarni oling.

```typescript
@@filename()
@Post('upload')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 },
]))
uploadFile(@UploadedFiles() files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] }) {
  console.log(files);
}
@@switch
@Post('upload')
@Bind(UploadedFiles())
@UseInterceptors(FileFieldsInterceptor([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 },
]))
uploadFile(files) {
  console.log(files);
}
```

#### Ixtiyoriy fayllar

Ixtiyoriy maydon nomlari bilan barcha maydonlarni yuklash uchun `AnyFilesInterceptor()` dekoratoridan foydalaning. Bu dekorator yuqorida ta'riflanganidek ixtiyoriy `options` obyektini qabul qilishi mumkin.

`AnyFilesInterceptor()` dan foydalanganda, `@UploadedFiles()` dekoratori orqali `request` ichidan fayllarni oling.

```typescript
@@filename()
@Post('upload')
@UseInterceptors(AnyFilesInterceptor())
uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  console.log(files);
}
@@switch
@Post('upload')
@Bind(UploadedFiles())
@UseInterceptors(AnyFilesInterceptor())
uploadFile(files) {
  console.log(files);
}
```

#### Faylsiz

`multipart/form-data` ni qabul qilib, lekin hech qanday fayl yuklashga ruxsat bermaslik uchun `NoFilesInterceptor` dan foydalaning. Bu multipart ma'lumotlarni request body atributlari sifatida o'rnatadi. So'rov bilan yuborilgan istalgan fayl `BadRequestException` ni chiqaradi.

```typescript
@Post('upload')
@UseInterceptors(NoFilesInterceptor())
handleMultiPartData(@Body() body) {
  console.log(body)
}
```

#### Standart parametrlar

Yuqorida ta'riflanganidek, fayl interceptorslarida multer opsiyalarini ko'rsatishingiz mumkin. Standart opsiyalarni o'rnatish uchun `MulterModule` ni import qilayotganingizda statik `register()` metodini chaqirib, qo'llab-quvvatlanadigan opsiyalarni uzatishingiz mumkin. Bu yerda keltirilgan barcha opsiyalardan foydalanishingiz mumkin.

```typescript
MulterModule.register({
  dest: './upload',
});
```

> info **Hint** `MulterModule` klassi `@nestjs/platform-express` paketidan eksport qilinadi.

#### Async sozlash

`MulterModule` opsiyalarini statik emas, asinxron tarzda o'rnatishingiz kerak bo'lganda `registerAsync()` metodidan foydalaning. Aksariyat dinamik modullar kabi, Nest asinxron konfiguratsiya uchun bir nechta usullarni taqdim etadi.

Usullardan biri - factory funksiyasidan foydalanish:

```typescript
MulterModule.registerAsync({
  useFactory: () => ({
    dest: './upload',
  }),
});
```

Boshqa factory providerlar kabi, factory funksiyamiz `async` bo'lishi va `inject` orqali bog'liqliklarni qabul qilishi mumkin.

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    dest: configService.get<string>('MULTER_DEST'),
  }),
  inject: [ConfigService],
});
```

Muqobil ravishda, quyida ko'rsatilganidek, `MulterModule` ni factory o'rniga klass yordamida sozlashingiz mumkin:

```typescript
MulterModule.registerAsync({
  useClass: MulterConfigService,
});
```

Yuqoridagi konstruktsiya `MulterConfigService` ni `MulterModule` ichida yaratadi va undan kerakli opsiyalar obyektini yaratish uchun foydalanadi. E'tibor bering, bu misolda `MulterConfigService` `MulterOptionsFactory` interfeysini implementatsiya qilishi kerak, bu quyida ko'rsatilgan. `MulterModule` taqdim etilgan klass obyektining `createMulterOptions()` metodini chaqiradi.

```typescript
@Injectable()
class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      dest: './upload',
    };
  }
}
```

Agar `MulterModule` ichida private nusxa yaratmasdan mavjud opsiyalar providerni qayta ishlatmoqchi bo'lsangiz, `useExisting` sintaksisidan foydalaning.

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

Shuningdek, `registerAsync()` metodiga `extraProviders` deb ataladigan providerlarni uzatishingiz mumkin. Bu providerlar modul providerlari bilan birlashtiriladi.

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useClass: ConfigService,
  extraProviders: [MyAdditionalProvider],
});
```

Bu factory funksiyasi yoki klass konstruktori uchun qo'shimcha bog'liqliklar taqdim etmoqchi bo'lganingizda foydali.

#### Misol

Ishlaydigan misol bu yerda mavjud.
