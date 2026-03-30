---
title: "Kirish"
navTitle: "Kirish"
description: "OpenAPI spetsifikatsiyasi RESTful APIlarni tasvirlash uchun qo'llaniladigan tilga bog'liq bo'lmagan ta'rif formatidir. Nest dekoratorlardan foydalanib shunday spetsifikatsiyani yar"
order: 3
group: openapi
groupTitle: "OpenAPI"
---
OpenAPI spetsifikatsiyasi RESTful APIlarni tasvirlash uchun qo'llaniladigan tilga bog'liq bo'lmagan ta'rif formatidir. Nest dekoratorlardan foydalanib shunday spetsifikatsiyani yaratishga imkon beradigan maxsus modulni taqdim etadi.

#### O'rnatish

Uni ishlata boshlash uchun avval kerakli qaramlikni o'rnatamiz.

```bash
$ npm install --save @nestjs/swagger
```

#### Dastlabki sozlash

O'rnatish yakunlangach, `main.ts` faylini oching va `SwaggerModule` klassi yordamida Swaggerni ishga tushiring:

```typescript
@@filename(main)
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> info **Hint** Fabrika metodi `SwaggerModule.createDocument()` Swagger hujjatini aynan so'ralganda generatsiya qilish uchun ishlatiladi. Bu yondashuv boshlang'ich vaqtni tejaydi va natijaviy hujjat OpenAPI Document spetsifikatsiyasiga mos keladigan serializatsiya qilinadigan obyekt bo'ladi. Hujjatni HTTP orqali berish o'rniga, uni JSON yoki YAML fayl sifatida saqlab, turli usullarda ishlatishingiz mumkin.

`DocumentBuilder` OpenAPI spetsifikatsiyasiga mos bazaviy hujjatni tuzishga yordam beradi. U sarlavha, tavsif, versiya kabi xususiyatlarni o'rnatish imkonini beruvchi bir nechta metodlarni taqdim etadi. To'liq hujjatni (barcha HTTP marshrutlari bilan) yaratish uchun `SwaggerModule` klassining `createDocument()` metodidan foydalanamiz. Bu metod ikkita argument qabul qiladi: ilova nusxasi va Swagger parametrlar obyekti. Bundan tashqari, uchinchi argument sifatida `SwaggerDocumentOptions` turidagi obyektni berishimiz mumkin. Bu haqda ko'proq [Hujjat parametrlar bo'limida](/docs/openapi/introduction#document-options) yozilgan.

Hujjat yaratganimizdan so'ng, `setup()` metodini chaqirishimiz mumkin. U quyidagilarni qabul qiladi:

1. Swagger UI joylashtiriladigan yo'l
2. Ilova nusxasi
3. Yuqorida yaratilgan hujjat obyekti
4. Ixtiyoriy konfiguratsiya parametri (batafsil [bu yerda](/docs/openapi/introduction#setup-options))

Endi HTTP serverni ishga tushirish uchun quyidagi buyruqni bajaring:

```bash
$ npm run start
```

Ilova ishlayotgan vaqtda brauzerni ochib, `http://localhost:3000/api` manziliga o'ting. Swagger UI ko'rinadi.

Ko'rib turganingizdek, `SwaggerModule` endpointlaringizni avtomatik aks ettiradi.

> info **Hint** Swagger JSON faylini yaratish va yuklab olish uchun `http://localhost:3000/api-json` manziliga o'ting (Swagger hujjatlaringiz `http://localhost:3000/api` ostida mavjud deb faraz qilinadi).
> Uni faqat `@nestjs/swagger` paketidagi setup metodidan foydalanib, xohlagan marshrutda taqdim etish ham mumkin, masalan:
>
> ```typescript
> SwaggerModule.setup('swagger', app, documentFactory, {
>   jsonDocumentUrl: 'swagger/json',
> });
> ```
>
> Bu uni `http://localhost:3000/swagger/json` manzilida taqdim etadi

> warning **Warning** `fastify` va `helmet` ishlatilganda CSP bilan bog'liq muammo yuzaga kelishi mumkin, bu kolliziyani quyidagi kabi CSP ni sozlab hal qiling:
>
> ```typescript
> app.register(helmet, {
>   contentSecurityPolicy: {
>     directives: {
>       defaultSrc: [`'self'`],
>       styleSrc: [`'self'`, `'unsafe-inline'`],
>       imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
>       scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
>     },
>   },
> });
>
> // If you are not going to use CSP at all, you can use this:
> app.register(helmet, {
>   contentSecurityPolicy: false,
> });
> ```

#### Hujjat parametrlar

Hujjat yaratishda kutubxona xulqini yanada nozik sozlash uchun qo'shimcha parametrlar berish mumkin. Bu parametrlar `SwaggerDocumentOptions` turida bo'lishi kerak va quyidagilardan iborat bo'lishi mumkin:

```TypeScript
export interface SwaggerDocumentOptions {
  /**
   * List of modules to include in the specification
   */
  include?: Function[];

  /**
   * Additional, extra models that should be inspected and included in the specification
   */
  extraModels?: Function[];

  /**
   * If `true`, swagger will ignore the global prefix set through `setGlobalPrefix()` method
   */
  ignoreGlobalPrefix?: boolean;

  /**
   * If `true`, swagger will also load routes from the modules imported by `include` modules
   */
  deepScanRoutes?: boolean;

  /**
   * Custom operationIdFactory that will be used to generate the `operationId`
   * based on the `controllerKey`, `methodKey`, and version.
   * @default () => controllerKey_methodKey_version
   */
  operationIdFactory?: OperationIdFactory;

  /**
   * Custom linkNameFactory that will be used to generate the name of links
   * in the `links` field of responses
   *
   * @see [Link objects](https://swagger.io/docs/specification/links/)
   *
   * @default () => `${controllerKey}_${methodKey}_from_${fieldKey}`
   */
  linkNameFactory?: (
    controllerKey: string,
    methodKey: string,
    fieldKey: string
  ) => string;

  /*
   * Generate tags automatically based on the controller name.
   * If `false`, you must use the `@ApiTags()` decorator to define tags.
   * Otherwise, the controller name without the suffix `Controller` will be used.
   * @default true
   */
  autoTagControllers?: boolean;
}
```

Masalan, kutubxona `UsersController_createUser` o'rniga `createUser` kabi operatsiya nomlarini generatsiya qilishiga ishonch hosil qilmoqchi bo'lsangiz, quyidagicha sozlash mumkin:

```TypeScript
const options: SwaggerDocumentOptions =  {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};
const documentFactory = () => SwaggerModule.createDocument(app, config, options);
```

#### Setup parametrlari

`SwaggerModule#setup` metodining to'rtinchi argumenti sifatida `SwaggerCustomOptions` interfeysiga mos keluvchi parametrlar obyektini uzatib, Swagger UI ni sozlashingiz mumkin.

```TypeScript
export interface SwaggerCustomOptions {
  /**
   * If `true`, Swagger resources paths will be prefixed by the global prefix set through `setGlobalPrefix()`.
   * Default: `false`.
   * @see https://docs.nestjs.com/faq/global-prefix
   */
  useGlobalPrefix?: boolean;

  /**
   * If `false`, the Swagger UI will not be served. Only API definitions (JSON and YAML)
   * will be accessible (on `/{path}-json` and `/{path}-yaml`). To fully disable both the Swagger UI and API definitions, use `raw: false`.
   * Default: `true`.
   * @deprecated Use `ui` instead.
   */
  swaggerUiEnabled?: boolean;

  /**
   * If `false`, the Swagger UI will not be served. Only API definitions (JSON and YAML)
   * will be accessible (on `/{path}-json` and `/{path}-yaml`). To fully disable both the Swagger UI and API definitions, use `raw: false`.
   * Default: `true`.
   */
  ui?: boolean;

  /**
   * If `true`, raw definitions for all formats will be served.
   * Alternatively, you can pass an array to specify the formats to be served, e.g., `raw: ['json']` to serve only JSON definitions.
   * If omitted or set to an empty array, no definitions (JSON or YAML) will be served.
   * Use this option to control the availability of Swagger-related endpoints.
   * Default: `true`.
   */
  raw?: boolean | Array<'json' | 'yaml'>;

  /**
   * Url point the API definition to load in Swagger UI.
   */
  swaggerUrl?: string;

  /**
   * Path of the JSON API definition to serve.
   * Default: `<path>-json`.
   */
  jsonDocumentUrl?: string;

  /**
   * Path of the YAML API definition to serve.
   * Default: `<path>-yaml`.
   */
  yamlDocumentUrl?: string;

  /**
   * Hook allowing to alter the OpenAPI document before being served.
   * It's called after the document is generated and before it is served as JSON & YAML.
   */
  patchDocumentOnRequest?: <TRequest = any, TResponse = any>(
    req: TRequest,
    res: TResponse,
    document: OpenAPIObject
  ) => OpenAPIObject;

  /**
   * If `true`, the selector of OpenAPI definitions is displayed in the Swagger UI interface.
   * Default: `false`.
   */
  explorer?: boolean;

  /**
   * Additional Swagger UI options
   */
  swaggerOptions?: SwaggerUiOptions;

  /**
   * Custom CSS styles to inject in Swagger UI page.
   */
  customCss?: string;

  /**
   * URL(s) of a custom CSS stylesheet to load in Swagger UI page.
   */
  customCssUrl?: string | string[];

  /**
   * URL(s) of custom JavaScript files to load in Swagger UI page.
   */
  customJs?: string | string[];

  /**
   * Custom JavaScript scripts to load in Swagger UI page.
   */
  customJsStr?: string | string[];

  /**
   * Custom favicon for Swagger UI page.
   */
  customfavIcon?: string;

  /**
   * Custom title for Swagger UI page.
   */
  customSiteTitle?: string;

  /**
   * File system path (ex: ./node_modules/swagger-ui-dist) containing static Swagger UI assets.
   */
  customSwaggerUiPath?: string;

  /**
   * @deprecated This property has no effect.
   */
  validatorUrl?: string;

  /**
   * @deprecated This property has no effect.
   */
  url?: string;

  /**
   * @deprecated This property has no effect.
   */
  urls?: Record<'url' | 'name', string>[];
}
```

> info **Hint** `ui` va `raw` mustaqil parametrlar. Swagger UI (`ui: false`) ni o'chirish API ta'riflarini (JSON/YAML) o'chirmaydi. Aksincha, API ta'riflarini (`raw: []`) o'chirish Swagger UI ni o'chirmaydi.
>
> Masalan, quyidagi konfiguratsiya Swagger UI ni o'chiradi, lekin API ta'riflariga kirish imkonini qoldiradi:
>
> ```typescript
> const options: SwaggerCustomOptions = {
>   ui: false, // Swagger UI is disabled
>   raw: ['json'], // JSON API definition is still accessible (YAML is disabled)
> };
> SwaggerModule.setup('api', app, options);
> ```
>
> Bu holda http://localhost:3000/api-json hali ham ochiq bo'ladi, lekin http://localhost:3000/api (Swagger UI) emas.

#### Misol

Ishlaydigan misol bu yerda mavjud.
