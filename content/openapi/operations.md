---
title: "Operatsiyalar"
navTitle: "Operatsiyalar"
description: "OpenAPI terminlariga ko'ra, yo'llar (/users yoki /reports/summary kabi) sizning API'ingiz taqdim etadigan endpointlar (resurslar) bo'lib, operatsiyalar esa bu yo'llarni boshqarish "
order: 5
group: openapi
groupTitle: "OpenAPI"
---
OpenAPI terminlariga ko'ra, yo'llar (`/users` yoki `/reports/summary` kabi) sizning API'ingiz taqdim etadigan endpointlar (resurslar) bo'lib, operatsiyalar esa bu yo'llarni boshqarish uchun ishlatiladigan HTTP metodlaridir (`GET`, `POST` yoki `DELETE` kabi).

#### Teglar

Controllerni ma'lum tegga biriktirish uchun `@ApiTags(...tags)` dekoratoridan foydalaning.

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {}
```

#### Headerlar

So'rovning bir qismi sifatida kutiladigan maxsus headerlarni belgilash uchun `@ApiHeader()` dan foydalaning.

```typescript
@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@Controller('cats')
export class CatsController {}
```

#### Javoblar

Maxsus HTTP javobini belgilash uchun `@ApiResponse()` dekoratoridan foydalaning.

```typescript
@Post()
@ApiResponse({ status: 201, description: 'The record has been successfully created.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

Nest `@ApiResponse` dekoratoridan meros olgan qisqa **API response** dekoratorlari to'plamini taqdim etadi:

- `@ApiOkResponse()`
- `@ApiCreatedResponse()`
- `@ApiAcceptedResponse()`
- `@ApiNoContentResponse()`
- `@ApiMovedPermanentlyResponse()`
- `@ApiFoundResponse()`
- `@ApiBadRequestResponse()`
- `@ApiUnauthorizedResponse()`
- `@ApiNotFoundResponse()`
- `@ApiForbiddenResponse()`
- `@ApiMethodNotAllowedResponse()`
- `@ApiNotAcceptableResponse()`
- `@ApiRequestTimeoutResponse()`
- `@ApiConflictResponse()`
- `@ApiPreconditionFailedResponse()`
- `@ApiTooManyRequestsResponse()`
- `@ApiGoneResponse()`
- `@ApiPayloadTooLargeResponse()`
- `@ApiUnsupportedMediaTypeResponse()`
- `@ApiUnprocessableEntityResponse()`
- `@ApiInternalServerErrorResponse()`
- `@ApiNotImplementedResponse()`
- `@ApiBadGatewayResponse()`
- `@ApiServiceUnavailableResponse()`
- `@ApiGatewayTimeoutResponse()`
- `@ApiDefaultResponse()`

```typescript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.'})
@ApiForbiddenResponse({ description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

So'rov uchun qaytariladigan modelni ko'rsatish uchun klass yaratib, barcha xususiyatlarni `@ApiProperty()` dekoratori bilan belgilashimiz kerak.

```typescript
export class Cat {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

Keyin `Cat` modeli javob dekoratorining `type` xususiyati bilan birgalikda ishlatilishi mumkin.

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {
  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: Cat,
  })
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }
}
```

Brauzerni ochib, generatsiya qilingan `Cat` modelini tekshirib ko'ramiz:

Har bir endpoint yoki controller uchun javoblarni alohida belgilash o'rniga, `DocumentBuilder` klassi yordamida barcha endpointlar uchun global javobni belgilashingiz mumkin. Bu yondashuv ilovangizdagi barcha endpointlar uchun global javob ko'rsatmoqchi bo'lsangiz foydali (masalan, `401 Unauthorized` yoki `500 Internal Server Error` kabi xatolar uchun).

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();
```

#### Fayl yuklash

Ma'lum metod uchun `@ApiBody` dekoratori va `@ApiConsumes()` yordamida fayl yuklashni yoqishingiz mumkin. [Fayl yuklash](/docs/techniques/file-upload) texnikasidan foydalangan to'liq misol:

```typescript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'List of cats',
  type: FileUploadDto,
})
uploadFile(@UploadedFile() file: Express.Multer.File) {}
```

Bu yerda `FileUploadDto` quyidagicha aniqlanadi:

```typescript
class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
```

Bir nechta fayl yuklashni boshqarish uchun `FilesUploadDto` ni quyidagicha aniqlashingiz mumkin:

```typescript
class FilesUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}
```

#### Kengaytmalar

So'rovga Extension qo'shish uchun `@ApiExtension()` dekoratoridan foydalaning. Kengaytma nomi `x-` prefiksi bilan boshlanishi kerak.

```typescript
@ApiExtension('x-foo', { hello: 'world' })
```

#### Kengaytirilgan: Generic `ApiResponse`

[Raw Definitions](/docs/openapi/types-and-parameters#xom-tariflar) imkoniyati bilan Swagger UI uchun Generic sxema aniqlashimiz mumkin. Quyidagi DTO mavjud deb faraz qilamiz:

```ts
export class PaginatedDto<TData> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;

  results: TData[];
}
```

`results` ni bezatmaymiz, chunki keyinroq unga xom ta'rif beramiz. Endi boshqa DTO ni, masalan, `CatDto` ni quyidagicha aniqlaymiz:

```ts
export class CatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

Endi `PaginatedDto<CatDto>` javobini quyidagicha belgilashimiz mumkin:

```ts
@ApiOkResponse({
  schema: {
    allOf: [
      { $ref: getSchemaPath(PaginatedDto) },
      {
        properties: {
          results: {
            type: 'array',
            items: { $ref: getSchemaPath(CatDto) },
          },
        },
      },
    ],
  },
})
async findAll(): Promise<PaginatedDto<CatDto>> {}
```

Bu misolda javobda `PaginatedDto` ning `allOf`i bo'lishi va `results` xususiyati `Array<CatDto>` turida bo'lishi ko'rsatilgan.

- `getSchemaPath()` funksiyasi berilgan model uchun OpenAPI Spec faylidan OpenAPI Schema yo'lini qaytaradi.
- `allOf` OAS 3 tomonidan turli meros bilan bog'liq use-case larni qamrab olish uchun taqdim etilgan tushuncha.

Oxir-oqibat, `PaginatedDto` hech bir controller tomonidan to'g'ridan-to'g'ri ishlatilmagani uchun `SwaggerModule` hali mos model ta'rifini generatsiya qila olmaydi. Bunday holatda uni [Extra Model](/docs/openapi/types-and-parameters#qoshimcha-modellari) sifatida qo'shishimiz kerak. Masalan, controllerni quyidagicha `@ApiExtraModels()` dekoratori bilan belgilashimiz mumkin:

```ts
@Controller('cats')
@ApiExtraModels(PaginatedDto)
export class CatsController {}
```

Endi Swaggerni ishga tushirsangiz, ushbu endpoint uchun generatsiya qilingan `swagger.json` dagi javob quyidagi ko'rinishda bo'ladi:

```json
"responses": {
  "200": {
    "description": "",
    "content": {
      "application/json": {
        "schema": {
          "allOf": [
            {
              "$ref": "#/components/schemas/PaginatedDto"
            },
            {
              "properties": {
                "results": {
                  "$ref": "#/components/schemas/CatDto"
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

Uni qayta foydalanish mumkin bo'lishi uchun `PaginatedDto` uchun maxsus dekorator yaratishimiz mumkin, masalan:

```ts
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
```

> info **Hint** `Type<any>` interfeysi va `applyDecorators` funksiyasi `@nestjs/common` paketidan import qilinadi.

`SwaggerModule` modelimiz uchun ta'rif generatsiya qilishi uchun uni kontrollerdagi `PaginatedDto` kabi qo'shimcha model sifatida kiritishimiz kerak.

Shu tariqa, endpointimizda maxsus `@ApiPaginatedResponse()` dekoratoridan foydalanishimiz mumkin:

```ts
@ApiPaginatedResponse(CatDto)
async findAll(): Promise<PaginatedDto<CatDto>> {}
```

Mijoz generatorlari uchun bu yondashuv `PaginatedResponse<TModel>` klient uchun qanday generatsiya qilinishida noaniqlik keltirib chiqarishi mumkin. Quyidagi parcha kod yuqoridagi `GET /` endpointi uchun mijoz generatori natijasiga misol:

```typescript
// Angular
findAll(): Observable<{ total: number, limit: number, offset: number, results: CatDto[] }>
```

Ko'rib turganingizdek, bu yerda **Return Type** noaniq. Bu muammoni chetlash uchun `ApiPaginatedResponse` uchun `schema` ga `title` xususiyatini qo'shishingiz mumkin:

```typescript
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          // ...
        ],
      },
    }),
  );
};
```

Endi klient generatori natijasi quyidagicha bo'ladi:

```ts
// Angular
findAll(): Observable<PaginatedResponseOfCatDto>
```
