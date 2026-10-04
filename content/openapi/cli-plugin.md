---
title: "CLI plagini"
navTitle: "CLI plagini"
description: "TypeScript metadata aks ettirish tizimi bir nechta cheklovlarga ega, masalan, klass qanday xususiyatlardan iboratligini yoki berilgan xususiyat majburiy yoki ixtiyoriy ekanini aniq"
order: 1
group: openapi
groupTitle: "OpenAPI"
---
TypeScript metadata aks ettirish tizimi bir nechta cheklovlarga ega, masalan, klass qanday xususiyatlardan iboratligini yoki berilgan xususiyat majburiy yoki ixtiyoriy ekanini aniqlash qiyin. Biroq, bu cheklovlarning ayrimlarini kompilyatsiya vaqtida hal qilish mumkin. Nest boilerplate kod miqdorini kamaytirish uchun TypeScript kompilyatsiya jarayonini yaxshilovchi plagin taqdim etadi.

> info **Hint** Bu plagin **ixtiyoriy**. Istasangiz, barcha dekoratorlarni qo'lda yoki kerak bo'lgan joylardagina deklaratsiya qilishingiz mumkin.

#### Umumiy ma'lumot

Swagger plagini avtomatik:

- `@ApiHideProperty` qo'llanilmagan bo'lsa, barcha DTO xususiyatlarini `@ApiProperty` bilan belgilaydi
- `required` xususiyatini so'roq belgisiga qarab o'rnatadi (masalan, `name?: string` `required: false` ni o'rnatadi)
- `type` yoki `enum` xususiyatini turiga qarab o'rnatadi (massivlarni ham qo'llab-quvvatlaydi)
- `default` xususiyatini berilgan standart qiymatga qarab o'rnatadi
- `class-validator` dekoratorlariga asoslangan bir nechta tekshiruv qoidalarini o'rnatadi (`classValidatorShim` `true` bo'lsa)
- har bir endpointga tegishli status va `type` (javob modeli) bilan javob dekoratorini qo'shadi
- xususiyatlar va endpointlar uchun tavsiflarni kommentariyalarga asoslanib generatsiya qiladi (`introspectComments` `true` bo'lsa)
- xususiyatlar uchun namuna qiymatlarni kommentariyalarga asoslanib generatsiya qiladi (`introspectComments` `true` bo'lsa)

E'tibor bering, fayl nomlaringiz plagin tomonidan tahlil qilinishi uchun albatta quyidagi suffikslardan biriga ega bo'lishi **kerak**: `['.dto.ts', '.entity.ts']` (masalan, `create-user.dto.ts`).

Agar boshqa suffiks ishlatayotgan bo'lsangiz, `dtoFileNameSuffix` parametrini ko'rsatib plagin xatti-harakatini moslashtirishingiz mumkin (quyida qarang).

Ilgari, Swagger UI bilan interaktiv tajriba taqdim etmoqchi bo'lsangiz, spetsifikatsiyada modellaringiz/komponentlaringiz qanday e'lon qilinishi kerakligini paketga bildirish uchun ko'p kodni takrorlashingiz kerak edi. Masalan, oddiy `CreateUserDto` klassini quyidagicha aniqlashingiz mumkin:

```typescript
export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: RoleEnum, default: [], isArray: true })
  roles: RoleEnum[] = [];

  @ApiProperty({ required: false, default: true })
  isEnabled?: boolean = true;
}
```

O'rta hajmdagi loyihalarda bu katta muammo bo'lmaydi, ammo ko'p sonli klasslar bilan ishlaganda kod ortiqcha va qo'llab-quvvatlash qiyin bo'lib qoladi.

[Swagger plaginini yoqish](/docs/openapi/cli-plugin#cli-plagindan-foydalanish) orqali yuqoridagi klass ta'rifini soddaroq ko'rinishda yozish mumkin:

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}
```

> info **Note** Swagger plagini @ApiProperty() annotatsiyalarini TypeScript turlari va class-validator dekoratorlaridan oladi. Bu generatsiya qilingan Swagger UI hujjatlari uchun API ni aniq tasvirlashga yordam beradi. Biroq, ish vaqtida tekshiruv baribir class-validator dekoratorlari orqali bajariladi. Shuning uchun `IsEmail()`, `IsNumber()` kabi validatorlardan foydalanishda davom etish kerak.

Shunday qilib, hujjatlarni avtomatik annotatsiyalarga tayangan holda yaratmoqchi bo'lsangiz va ish vaqtida ham tekshiruvlarni xohlasangiz, class-validator dekoratorlari hali ham zarur.

> info **Hint** DTOlarda [mapped types utilities](/docs/openapi/mapped-types) (masalan, `PartialType`) ishlatganda ularni sxemani plagin ushlashi uchun `@nestjs/mapped-types` o'rniga `@nestjs/swagger` dan import qiling.

Plagin **Abstract Syntax Tree** asosida kerakli dekoratorlarni darhol qo'shadi. Shunday qilib, kod bo'ylab tarqalgan `@ApiProperty` dekoratorlari bilan qiynalmaysiz.

> info **Hint** Plagin yetishmayotgan swagger xususiyatlarini avtomatik generatsiya qiladi, lekin ularni almashtirishingiz kerak bo'lsa, `@ApiProperty()` orqali aniq ko'rsatib qo'yishingiz kifoya.

#### Kommentariyalarni tahlil qilish

Kommentariyalarni tahlil qilish funksiyasi yoqilganda, CLI plagini xususiyatlar uchun tavsiflar va namuna qiymatlarni kommentariyalarga asoslanib generatsiya qiladi.

Masalan, `roles` xususiyati misolida:

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
@ApiProperty({
  description: `A list of user's roles`,
  example: ['admin'],
})
roles: RoleEnum[] = [];
```

Siz tavsif va namuna qiymatlarni ikkita joyda takrorlashingiz kerak. `introspectComments` yoqilganda, CLI plagini bu kommentariyalarni ajratib olib, xususiyatlar uchun tavsiflarni (va agar berilgan bo'lsa, namuna qiymatlarni) avtomatik taqdim etadi. Endi yuqoridagi xususiyatni quyidagicha sodda ko'rinishda yozish mumkin:

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
roles: RoleEnum[] = [];
```

Plagin `dtoKeyOfComment` va `controllerKeyOfComment` parametrlarini taqdim etadi, ular mos ravishda `ApiProperty` va `ApiOperation` dekoratorlariga qiymatlar qanday berilishini sozlash imkonini beradi. Quyidagi misolga qarang:

```typescript
export class SomeController {
  /**
   * Create some resource
   */
  @Post()
  create() {}
}
```

Bu quyidagi ko'rsatmaga teng:

```typescript
@ApiOperation({ summary: "Create some resource" })
```

> info **Hint** Modellar uchun ham xuddi shu mantiq qo'llaniladi, faqat `ApiProperty` dekoratori bilan.

Controllerlar uchun nafaqat qisqa mazmun, balki tavsif (izohlar), teglar (masalan, `@deprecated`) va javob namunalarini ham quyidagicha ko'rsatishingiz mumkin:

```ts
/**
 * Create a new cat
 *
 * @remarks This operation allows you to create a new cat.
 *
 * @deprecated
 * @throws {500} Something went wrong.
 * @throws {400} Bad Request.
 */
@Post()
async create(): Promise<Cat> {}
```

#### CLI plagindan foydalanish

Plaginni yoqish uchun `nest-cli.json` (agar [Nest CLI](/docs/cli/overview) ishlatayotgan bo'lsangiz) faylini ochib, quyidagi `plugins` konfiguratsiyasini qo'shing:

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

Plagin xatti-harakatini moslashtirish uchun `options` xususiyatidan foydalanishingiz mumkin.

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": false,
          "introspectComments": true,
          "skipAutoHttpCode": true
        }
      }
    ]
  }
}
```

`options` xususiyati quyidagi interfeysga mos bo'lishi kerak:

```typescript
export interface PluginOptions {
  dtoFileNameSuffix?: string[];
  controllerFileNameSuffix?: string[];
  classValidatorShim?: boolean;
  dtoKeyOfComment?: string;
  controllerKeyOfComment?: string;
  introspectComments?: boolean;
  skipAutoHttpCode?: boolean;
  esmCompatible?: boolean;
}
```

<table>
  <tr>
    <th>Parametr</th>
    <th>Standart</th>
    <th>Tavsif</th>
  </tr>
  <tr>
    <td><code>dtoFileNameSuffix</code></td>
    <td><code>['.dto.ts', '.entity.ts']</code></td>
    <td>DTO (Data Transfer Object) fayllar suffiksi</td>
  </tr>
  <tr>
    <td><code>controllerFileNameSuffix</code></td>
    <td><code>.controller.ts</code></td>
    <td>Controller fayllar suffiksi</td>
  </tr>
  <tr>
    <td><code>classValidatorShim</code></td>
    <td><code>true</code></td>
    <td>Agar true bo'lsa, modul <code>class-validator</code> tekshiruv dekoratorlaridan qayta foydalanadi (masalan, <code>@Max(10)</code> sxema ta'rifiga <code>max: 10</code> ni qo'shadi) </td>
  </tr>
  <tr>
    <td><code>dtoKeyOfComment</code></td>
    <td><code>'description'</code></td>
    <td><code>ApiProperty</code> da kommentariya matnini o'rnatish uchun ishlatiladigan xususiyat kaliti.</td>
  </tr>
  <tr>
    <td><code>controllerKeyOfComment</code></td>
    <td><code>'summary'</code></td>
    <td><code>ApiOperation</code> da kommentariya matnini o'rnatish uchun ishlatiladigan xususiyat kaliti.</td>
  </tr>
  <tr>
    <td><code>introspectComments</code></td>
    <td><code>false</code></td>
    <td>Agar true bo'lsa, plagin kommentariyalarga asoslanib xususiyatlar uchun tavsif va namuna qiymatlarni generatsiya qiladi</td>
  </tr>
  <tr>
    <td><code>skipAutoHttpCode</code></td>
    <td><code>false</code></td>
    <td>Controllerlarda <code>@HttpCode()</code> ni avtomatik qo'shishni o'chiradi</td>
  </tr>
  <tr>
    <td><code>esmCompatible</code></td>
    <td><code>false</code></td>
    <td>Agar true bo'lsa, ESM (<code>&#123; "type": "module" &#125;</code>) ishlatilganda yuzaga keladigan sintaksis xatolarini hal qiladi.</td>
  </tr>
</table>

Plagin parametrlari yangilanganda `/dist` papkasini o'chirib, ilovangizni qayta build qiling.
Agar CLI dan foydalanmasangiz va maxsus `webpack` konfiguratsiyasiga ega bo'lsangiz, bu plaginini `ts-loader` bilan birgalikda ishlatishingiz mumkin:

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/swagger/plugin').before({}, program)]
}),
```

#### SWC builder

Standart (monorepo bo'lmagan) sozlamalarda SWC builder bilan CLI plaginlarini ishlatish uchun [bu yerda](/docs/recipes/swc#type-checking) ko'rsatilganidek type checkingni yoqish kerak.

```bash
$ nest start -b swc --type-check
```

Monorepo sozlamalari uchun [bu yerdagi](/docs/recipes/swc#monorepo-va-cli-pluginlar) ko'rsatmalarga amal qiling.

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts
```

Endi serializatsiya qilingan metadata fayli quyidagidek `SwaggerModule#loadPluginMetadata` metodi orqali yuklanishi kerak:

```typescript
import metadata from './metadata'; // <-- file auto-generated by the "PluginMetadataGenerator"

await SwaggerModule.loadPluginMetadata(metadata); // <-- here
const document = SwaggerModule.createDocument(app, config);
```

#### `ts-jest` bilan integratsiya (e2e testlar)

e2e testlarni ishlatish uchun `ts-jest` manba fayllaringizni xotirada, joyida kompilyatsiya qiladi. Demak, u Nest CLI kompilyatoridan foydalanmaydi va hech qanday plagin qo'llamaydi yoki AST transformatsiyalarini bajaradi.

Plaginni yoqish uchun e2e testlar katalogida quyidagi faylni yarating:

```javascript
const transformer = require('@nestjs/swagger/plugin');

module.exports.name = 'nestjs-swagger-transformer';
// you should change the version number anytime you change the configuration below - otherwise, jest will not detect changes
module.exports.version = 1;

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/swagger/plugin options (can be empty)
    },
    cs.program, // "cs.tsCompiler.program" for older versions of Jest (<= v27)
  );
};
```

Bundan so'ng, `jest` konfiguratsiya faylingizda AST transformerni import qiling. Standart holatda (starter ilovada) e2e testlar konfiguratsiyasi `test` papkasi ostida joylashgan va `jest-e2e.json` deb nomlanadi.

Agar `jest@<29` ishlatsangiz, quyidagi parcha kodni qo'llang.

```json
{
  ... // other configuration
  "globals": {
    "ts-jest": {
      "astTransformers": {
        "before": ["<path to the file created above>"]
      }
    }
  }
}
```

Agar `jest@^29` ishlatsangiz, avvalgi yondashuv eskirganligi sababli quyidagi parcha kodni qo'llang.

```json
{
  ... // other configuration
  "transform": {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        "astTransformers": {
          "before": ["<path to the file created above>"]
        }
      }
    ]
  }
}
```

#### `jest` (e2e testlar) bilan muammolarni hal qilish

`jest` konfiguratsiya o'zgarishlarini ko'rmayotgandek bo'lsa, Jest allaqachon build natijasini **kesh**lagan bo'lishi mumkin. Yangi konfiguratsiyani qo'llash uchun Jest kesh katalogini tozalash kerak.

Kesh katalogini tozalash uchun NestJS loyihangiz papkasida quyidagi buyruqni bajaring:

```bash
$ npx jest --clearCache
```

Agar keshni avtomatik tozalash muvaffaqiyatsiz bo'lsa, quyidagi buyruqlar bilan kesh papkasini qo'lda o'chirishingiz mumkin:

```bash
# Find jest cache directory (usually /tmp/jest_rs)
# by running the following command in your NestJS project root
$ npx jest --showConfig | grep cache
# ex result:
#   "cache": true,
#   "cacheDirectory": "/tmp/jest_rs"

# Remove or empty the Jest cache directory
$ rm -rf  <cacheDirectory value>
# ex:
# rm -rf /tmp/jest_rs
```
