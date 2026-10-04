---
title: "Boshqa imkoniyatlar"
navTitle: "Boshqa imkoniyatlar"
description: "Bu sahifada foydali bo'lishi mumkin bo'lgan boshqa imkoniyatlar keltirilgan."
order: 6
group: openapi
groupTitle: "OpenAPI"
---
Bu sahifada foydali bo'lishi mumkin bo'lgan boshqa imkoniyatlar keltirilgan.

#### Global prefiks

`setGlobalPrefix()` orqali yo'llar uchun o'rnatilgan global prefiksni inkor qilish uchun `ignoreGlobalPrefix` dan foydalaning:

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true,
});
```

#### Global parametrlari

Quyida ko'rsatilganidek `DocumentBuilder` yordamida barcha yo'llar uchun parametrlarni belgilashingiz mumkin:

```typescript
const config = new DocumentBuilder()
  .addGlobalParameters({
    name: 'tenantId',
    in: 'header',
  })
  // other configurations
  .build();
```

#### Global javoblar

`DocumentBuilder` yordamida barcha yo'llar uchun global javoblarni belgilashingiz mumkin. Bu ilovangizdagi barcha endpointlar bo'yicha bir xil javoblarni (masalan, `401 Unauthorized` yoki `500 Internal Server Error` kabi xato kodlarini) sozlashda foydali.

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();
```

#### Bir nechta spetsifikatsiyalar

`SwaggerModule` bir nechta spetsifikatsiyalarni qo'llab-quvvatlash usulini taqdim etadi. Boshqacha aytganda, turli endpointlarda turli UI lar bilan turli hujjatlarni taqdim etishingiz mumkin.

Bir nechta spetsifikatsiyani qo'llab-quvvatlash uchun ilovangiz modular yondashuvda yozilishi kerak. `createDocument()` metodi uchinchi argument sifatida `extraOptions` ni qabul qiladi, unda `include` nomli xususiyat mavjud obyekt bo'ladi. `include` xususiyati modul massivini qabul qiladi.

Bir nechta spetsifikatsiyalarni quyidagicha sozlashingiz mumkin:

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CatsModule } from './cats/cats.module';
import { DogsModule } from './dogs/dogs.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * createDocument(application, configurationOptions, extraOptions);
   *
   * createDocument method takes an optional 3rd argument "extraOptions"
   * which is an object with "include" property where you can pass an Array
   * of Modules that you want to include in that Swagger Specification
   * E.g: CatsModule and DogsModule will have two separate Swagger Specifications which
   * will be exposed on two different SwaggerUI with two different endpoints.
   */

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const catDocumentFactory = () =>
    SwaggerModule.createDocument(app, options, {
      include: [CatsModule],
    });
  SwaggerModule.setup('api/cats', app, catDocumentFactory);

  const secondOptions = new DocumentBuilder()
    .setTitle('Dogs example')
    .setDescription('The dogs API description')
    .setVersion('1.0')
    .addTag('dogs')
    .build();

  const dogDocumentFactory = () =>
    SwaggerModule.createDocument(app, secondOptions, {
      include: [DogsModule],
    });
  SwaggerModule.setup('api/dogs', app, dogDocumentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

Endi serveringizni quyidagi buyruq bilan ishga tushirishingiz mumkin:

```bash
$ npm run start
```

`http://localhost:3000/api/cats` manziliga o'tib, mushuklar uchun Swagger UI ni ko'ring:

Xuddi shunday, `http://localhost:3000/api/dogs` itlar uchun Swagger UI ni ko'rsatadi:

#### Explorer panelidagi dropdown

Explorer paneli dropdown menyusida bir nechta spetsifikatsiyalarni qo'llab-quvvatlash uchun `explorer: true` ni o'rnating va `SwaggerCustomOptions` ichida `swaggerOptions.urls` ni sozlang.

> info **Hint** `swaggerOptions.urls` Swagger hujjatlaringizning JSON formatiga ishora qilayotganiga ishonch hosil qiling! JSON hujjatini ko'rsatish uchun `SwaggerCustomOptions` ichida `jsonDocumentUrl` dan foydalaning. Qo'shimcha sozlash variantlari uchun [bu yerga](/docs/openapi/introduction#setup-parametrlari) qarang.

Explorer paneli dropdownidan bir nechta spetsifikatsiyalarni quyidagicha sozlash mumkin:

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CatsModule } from './cats/cats.module';
import { DogsModule } from './dogs/dogs.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Main API options
  const options = new DocumentBuilder()
    .setTitle('Multiple Specifications Example')
    .setDescription('Description for multiple specifications')
    .setVersion('1.0')
    .build();

  // Create main API document
  const document = SwaggerModule.createDocument(app, options);

  // Setup main API Swagger UI with dropdown support
  SwaggerModule.setup('api', app, document, {
    explorer: true,
    swaggerOptions: {
      urls: [
        {
          name: '1. API',
          url: 'api/swagger.json',
        },
        {
          name: '2. Cats API',
          url: 'api/cats/swagger.json',
        },
        {
          name: '3. Dogs API',
          url: 'api/dogs/swagger.json',
        },
      ],
    },
    jsonDocumentUrl: '/api/swagger.json',
  });

  // Cats API options
  const catOptions = new DocumentBuilder()
    .setTitle('Cats Example')
    .setDescription('Description for the Cats API')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  // Create Cats API document
  const catDocument = SwaggerModule.createDocument(app, catOptions, {
    include: [CatsModule],
  });

  // Setup Cats API Swagger UI
  SwaggerModule.setup('api/cats', app, catDocument, {
    jsonDocumentUrl: '/api/cats/swagger.json',
  });

  // Dogs API options
  const dogOptions = new DocumentBuilder()
    .setTitle('Dogs Example')
    .setDescription('Description for the Dogs API')
    .setVersion('1.0')
    .addTag('dogs')
    .build();

  // Create Dogs API document
  const dogDocument = SwaggerModule.createDocument(app, dogOptions, {
    include: [DogsModule],
  });

  // Setup Dogs API Swagger UI
  SwaggerModule.setup('api/dogs', app, dogDocument, {
    jsonDocumentUrl: '/api/dogs/swagger.json',
  });

  await app.listen(3000);
}

bootstrap();
```

Bu misolda asosiy API hamda mushuklar va itlar uchun alohida spetsifikatsiyalarni sozladik, ularning har biri explorer panelidagi dropdown orqali ochiladi.
