---
title: "CLI buyruqlari bo'yicha ma'lumotnoma"
navTitle: "CLI buyruqlari bo'yicha ma'lumotnoma"
description: "#### nest new"
order: 4
group: cli
groupTitle: "CLI"
---
#### nest new

Yangi (standart rejim) Nest loyihasini yaratadi.

```bash
$ nest new <name> [options]
$ nest n <name> [options]
```

##### Tavsif

Yangi Nest loyihasini yaratadi va initsializatsiya qiladi. Package manager bo'yicha so'raydi.

- Berilgan `<name>` bilan papka yaratadi
- Papkani konfiguratsiya fayllari bilan to'ldiradi
- Source code (`/src`) va end-to-end testlar (`/test`) uchun pastki papkalar yaratadi
- Pastki papkalarni app komponentlari va testlar uchun default fayllar bilan to'ldiradi

##### Argumentlar

| Argument | Tavsif                     |
| -------- | -------------------------- |
| `<name>` | Yangi loyiha nomi          |

##### Opsiyalar

| Option                                | Tavsif                                                                                                                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--dry-run`                           | O'zgarishlar haqida hisobot beradi, ammo fayl tizimini o'zgartirmaydi.<br/> Alias: `-d`                                                                                                              |
| `--skip-git`                          | Git reposi initsializatsiyasini o'tkazib yuboradi.<br/> Alias: `-g`                                                                                                                                  |
| `--skip-install`                      | Paketlarni o'rnatishni o'tkazib yuboradi.<br/> Alias: `-s`                                                                                                                                           |
| `--package-manager [package-manager]` | Package manager'ni ko'rsatadi. `npm`, `yarn` yoki `pnpm`dan foydalaning. Package manager global o'rnatilgan bo'lishi kerak.<br/> Alias: `-p`                                                      |
| `--language [language]`               | Dasturlash tilini ko'rsatadi (`TS` yoki `JS`).<br/> Alias: `-l`                                                                                                                                      |
| `--collection [collectionName]`       | Schematics collection'ni ko'rsatadi. Schematicni o'z ichiga olgan o'rnatilgan npm paket nomidan foydalaning.<br/> Alias: `-c`                                                                       |
| `--strict`                            | Loyiha TypeScript kompilyatori uchun quyidagi flaglar yoqilgan holda boshlanadi: `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`, `forceConsistentCasingInFileNames`, `noFallthroughCasesInSwitch` |

#### nest generate

Schematic asosida fayllarni generatsiya qiladi va/yoki o'zgartiradi

```bash
$ nest generate <schematic> <name> [options]
$ nest g <schematic> <name> [options]
```

##### Argumentlar

| Argument      | Tavsif                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `<schematic>` | Generatsiya qilinadigan `schematic` yoki `collection:schematic`. Mavjud schematiclar uchun quyidagi jadvalga qarang. |
| `<name>`      | Generatsiya qilinadigan komponent nomi.                                                                          |

##### Schematiclar

| Name          | Alias | Tavsif                                                                                                             |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------------ |
| `app`         |       | Monorepo ichida yangi ilova yaratadi (agar tuzilma standard bo'lsa, monorepoga aylantiradi).                      |
| `library`     | `lib` | Monorepo ichida yangi kutubxona yaratadi (agar tuzilma standard bo'lsa, monorepoga aylantiradi).                  |
| `class`       | `cl`  | Yangi class generatsiya qiladi.                                                                                   |
| `controller`  | `co`  | Controller deklaratsiyasini generatsiya qiladi.                                                                    |
| `decorator`   | `d`   | Custom decorator generatsiya qiladi.                                                                              |
| `filter`      | `f`   | Filter deklaratsiyasini generatsiya qiladi.                                                                       |
| `gateway`     | `ga`  | Gateway deklaratsiyasini generatsiya qiladi.                                                                      |
| `guard`       | `gu`  | Guard deklaratsiyasini generatsiya qiladi.                                                                        |
| `interface`   | `itf` | Interface generatsiya qiladi.                                                                                    |
| `interceptor` | `itc` | Interceptor deklaratsiyasini generatsiya qiladi.                                                                  |
| `middleware`  | `mi`  | Middleware deklaratsiyasini generatsiya qiladi.                                                                   |
| `module`      | `mo`  | Module deklaratsiyasini generatsiya qiladi.                                                                       |
| `pipe`        | `pi`  | Pipe deklaratsiyasini generatsiya qiladi.                                                                         |
| `provider`    | `pr`  | Provider deklaratsiyasini generatsiya qiladi.                                                                     |
| `resolver`    | `r`   | Resolver deklaratsiyasini generatsiya qiladi.                                                                     |
| `resource`    | `res` | Yangi CRUD resursini generatsiya qiladi. Batafsil ma'lumot uchun [CRUD (resource) generator](/docs/recipes/crud-generator)ga qarang. (faqat TS) |
| `service`     | `s`   | Service deklaratsiyasini generatsiya qiladi.                                                                      |

##### Opsiyalar

| Option                          | Tavsif                                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `--dry-run`                     | O'zgarishlar haqida hisobot beradi, ammo fayl tizimini o'zgartirmaydi.<br/> Alias: `-d`                               |
| `--project [project]`           | Element qo'shilishi kerak bo'lgan loyiha.<br/> Alias: `-p`                                                            |
| `--flat`                        | Element uchun papka yaratmaydi.                                                                                      |
| `--collection [collectionName]` | Schematics collection'ni ko'rsatadi. Schematicni o'z ichiga olgan o'rnatilgan npm paket nomidan foydalaning.<br/> Alias: `-c` |
| `--spec`                        | Spec fayllarni generatsiya qilishni majbur qiladi (default)                                                          |
| `--no-spec`                     | Spec fayllarni generatsiya qilishni o'chiradi                                                                        |

#### nest build

Ilova yoki workspace'ni chiqish papkasiga kompilyatsiya qiladi.

Shuningdek, `build` buyrug'i quyidagilar uchun javobgar:

- `tsconfig-paths` orqali path mapping (agar path aliaslari ishlatilsa)
- DTO'larni OpenAPI dekoratorlari bilan annotatsiya qilish (agar `@nestjs/swagger` CLI plagin yoqilgan bo'lsa)
- DTO'larni GraphQL dekoratorlari bilan annotatsiya qilish (agar `@nestjs/graphql` CLI plagin yoqilgan bo'lsa)

```bash
$ nest build <name> [options]
```

##### Argumentlar

| Argument | Tavsif                        |
| -------- | ----------------------------- |
| `<name>` | Build qilinadigan loyiha nomi |

##### Opsiyalar

| Option                  | Tavsif                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--path [path]`         | `tsconfig` fayliga path. <br/>Alias `-p`                                                                                                                                                     |
| `--config [path]`       | `nest-cli` konfiguratsiya fayliga path. <br/>Alias `-c`                                                                                                                                       |
| `--watch`               | Watch rejimida ishlaydi (live-reload).<br /> Agar kompilyatsiya uchun `tsc` ishlatsangiz, ilovani qayta ishga tushirish uchun `rs` yozishingiz mumkin (`manualRestart` optioni `true` bo'lganda). <br/>Alias `-w` |
| `--builder [name]`      | Kompilyatsiya uchun builderni ko'rsatadi (`tsc`, `swc` yoki `webpack`). <br/>Alias `-b`                                                                                                       |
| `--webpack`             | Kompilyatsiya uchun webpackdan foydalanadi (deprecated: o'rniga `--builder webpack`dan foydalaning).                                                                                         |
| `--webpackPath`         | Webpack konfiguratsiyasi uchun path.                                                                                                                                                         |
| `--tsc`                 | Kompilyatsiya uchun majburan `tsc` ishlatadi.                                                                                                                                               |
| `--watchAssets`         | Non-TS fayllarni ( `.graphql` kabi assets) kuzatish. Batafsil ma'lumot uchun Assetsga qarang.                                                                         |
| `--type-check`          | Type checkingni yoqadi (SWC ishlatilganda).                                                                                                                                                  |
| `--all`                 | Monorepoda barcha loyihalarni build qiladi.                                                                                                                                                  |
| `--preserveWatchOutput` | Watch rejimida ekranni tozalash o'rniga eskirgan konsol chiqishini saqlaydi. (`tsc` watch rejimi uchun)                                                                                      |

#### nest start

Ilovani (yoki workspace'dagi default loyihani) kompilyatsiya qiladi va ishga tushiradi.

```bash
$ nest start <name> [options]
```

##### Argumentlar

| Argument | Tavsif                       |
| -------- | ---------------------------- |
| `<name>` | Ishga tushiriladigan loyiha nomi |

##### Opsiyalar

| Option                  | Tavsif                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `--path [path]`         | `tsconfig` fayliga path. <br/>Alias `-p`                                                                                                   |
| `--config [path]`       | `nest-cli` konfiguratsiya fayliga path. <br/>Alias `-c`                                                                                     |
| `--watch`               | Watch rejimida ishlaydi (live-reload) <br/>Alias `-w`                                                                                       |
| `--builder [name]`      | Kompilyatsiya uchun builderni ko'rsatadi (`tsc`, `swc` yoki `webpack`). <br/>Alias `-b`                                                     |
| `--preserveWatchOutput` | Watch rejimida ekranni tozalash o'rniga eskirgan konsol chiqishini saqlaydi. (`tsc` watch rejimi uchun)                                      |
| `--watchAssets`         | Watch rejimida ishlaydi (live-reload), non-TS fayllarni (assets) kuzatadi. Batafsil ma'lumot uchun Assetsga qarang. |
| `--debug [hostport]`    | Debug rejimida ishlaydi (`--inspect` flag bilan) <br/>Alias `-d`                                                                            |
| `--webpack`             | Kompilyatsiya uchun webpackdan foydalanadi. (deprecated: o'rniga `--builder webpack`dan foydalaning)                                        |
| `--webpackPath`         | Webpack konfiguratsiyasi uchun path.                                                                                                       |
| `--tsc`                 | Kompilyatsiya uchun majburan `tsc` ishlatadi.                                                                                               |
| `--exec [binary]`       | Ishga tushiriladigan binary (default: `node`). <br/>Alias `-e`                                                                              |
| `--no-shell`            | Shell ichida child processlarni yaratmaydi (node'ning `child_process.spawn()` metod docsiga qarang).                                        |
| `--env-file`            | Environment variable'larni joriy direktoriyaga nisbatan fayldan yuklaydi va ularni `process.env`ga mavjud qiladi.                            |
| `-- [key=value]`        | `process.argv` orqali foydalanish mumkin bo'lgan command-line argumentlari.                                                                  |

#### nest add

**nest library** sifatida paketlangan kutubxonani import qiladi va uning install schematicini ishga tushiradi.

```bash
$ nest add <name> [options]
```

##### Argumentlar

| Argument | Tavsif                               |
| -------- | ------------------------------------ |
| `<name>` | Import qilinadigan kutubxona nomi    |

#### nest info

O'rnatilgan nest paketlari va boshqa foydali tizim ma'lumotlarini ko'rsatadi. Masalan:

```bash
$ nest info
```

```bash
 _   _             _      ___  _____  _____  _     _____
| \ | |           | |    |_  |/  ___|/  __ \| |   |_   _|
|  \| |  ___  ___ | |_     | |\ `--. | /  \/| |     | |
| . ` | / _ \/ __|| __|    | | `--. \| |    | |     | |
| |\  ||  __/\__ \| |_ /\__/ //\__/ /| \__/\| |_____| |_
\_| \_/ \___||___/ \__|\____/ \____/  \____/\_____/\___/

[System Information]
OS Version : macOS High Sierra
NodeJS Version : v20.18.0
[Nest Information]
microservices version : 10.0.0
websockets version : 10.0.0
testing version : 10.0.0
common version : 10.0.0
core version : 10.0.0
```
