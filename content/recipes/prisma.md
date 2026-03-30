---
title: "Prisma"
navTitle: "Prisma"
description: "Prisma - bu Node.js va TypeScript uchun open-source ORM. U oddiy SQL yozish yoki SQL query builder'lar (knex.js kabi) yoxud ORM'lar (TypeORM va Sequelize kabi) singari boshqa datab"
order: 11
group: recipes
groupTitle: "Recipes"
---
Prisma - bu Node.js va TypeScript uchun open-source ORM. U oddiy SQL yozish yoki SQL query builder'lar (knex.js kabi) yoxud ORM'lar (TypeORM va Sequelize kabi) singari boshqa database access vositalaridan foydalanishga **muqobil** sifatida ishlatiladi. Prisma hozirda PostgreSQL, MySQL, SQL Server, SQLite, MongoDB va CockroachDB'ni qo'llab-quvvatlaydi (Preview).

Prisma'ni oddiy JavaScript bilan ham ishlatish mumkin, ammo u TypeScript'ni faol qo'llab-quvvatlaydi va TypeScript ekotizimidagi boshqa ORM'larga qaraganda yuqoriroq type-safety beradi. Prisma va TypeORM'ning type-safety kafolatlari bo'yicha batafsil taqqoslashni bu yerda topishingiz mumkin.

> info **Note** Prisma qanday ishlashini tezda tushunib olmoqchi bo'lsangiz, Quickstart ni kuzating yoki documentation ichidagi Introduction ni o'qing. Shuningdek, `prisma-examples` repository'sida REST va GraphQL uchun tayyor ishlaydigan misollar ham mavjud.

#### Boshlash

Ushbu recipe'da NestJS va Prisma bilan noldan qanday boshlashni o'rganasiz. Siz database'dan ma'lumot o'qiydigan va yozadigan REST API'ga ega namuna NestJS ilovasini qurasiz.

Ushbu qo'llanma uchun database server sozlash yukidan qochish maqsadida SQLite ishlatiladi. Agar siz PostgreSQL yoki MySQL ishlatayotgan bo'lsangiz ham bu qo'llanmadan foydalanishingiz mumkin - kerakli joylarda ularga oid qo'shimcha ko'rsatmalar beriladi.

> info **Note** Agar sizda allaqachon loyiha bo'lsa va Prisma'ga o'tishni o'ylayotgan bo'lsangiz, mavjud loyihaga Prisma qo'shish bo'yicha qo'llanmadan foydalaning. Agar TypeORM'dan ko'chayotgan bo'lsangiz, Migrating from TypeORM to Prisma qo'llanmasini o'qing.

#### NestJS loyihasini yaratish

Boshlash uchun NestJS CLI'ni o'rnating va quyidagi buyruqlar bilan ilova skeleton'ini yarating:

```bash
$ npm install -g @nestjs/cli
$ nest new hello-prisma
```

[First steps](/docs/core/first-steps) sahifasini ko'rib, ushbu buyruq yaratgan loyiha fayllari haqida ko'proq bilib oling. Shuningdek, endi ilovani ishga tushirish uchun `npm start` ni ishlatishingiz mumkin. Hozir `http://localhost:3000/` da ishlayotgan REST API faqat `src/app.controller.ts` ichida yozilgan bitta route'ga ega. Ushbu qo'llanma davomida siz _users_ va _posts_ haqidagi ma'lumotlarni saqlash va olish uchun qo'shimcha route'lar yaratib borasiz.

#### Prisma'ni sozlash

Avval Prisma CLI'ni loyiha ichiga development dependency sifatida o'rnating:

```bash
$ cd hello-prisma
$ npm install prisma --save-dev
```

Keyingi qadamlar davomida Prisma CLI dan foydalanamiz. Best practice sifatida CLI'ni lokal ishlatish uchun oldiga `npx` qo'yish tavsiya etiladi:

```bash
$ npx prisma
```

<details><summary>Expand if you're using Yarn</summary>

Agar Yarn ishlatayotgan bo'lsangiz, Prisma CLI'ni quyidagicha o'rnatishingiz mumkin:

```bash
$ yarn add prisma --dev
```

O'rnatilgach, uni `yarn` prefiksi bilan chaqirishingiz mumkin:

```bash
$ yarn prisma
```

</details>

Endi Prisma CLI'dagi `init` buyrug'i yordamida boshlang'ich Prisma setup'ni yarating:

```bash
$ npx prisma init
```

Bu buyruq quyidagi tarkibga ega yangi `prisma` katalogini yaratadi:

- `schema.prisma`: Database ulanishini ko'rsatadi va database schema'ni o'z ichiga oladi
- `prisma.config.ts`: Loyihangiz uchun konfiguratsiya fayli
- `.env`: Odatda database credential'larini environment variable'lar ko'rinishida saqlash uchun ishlatiladigan dotenv fayli

#### Generator output path'ni belgilash

Generated Prisma client uchun output `path` ni `prisma init` vaqtida `--output ../src/generated/prisma` orqali yoki to'g'ridan-to'g'ri Prisma schema ichida belgilang:

```groovy
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
}
```

#### Modul formatini sozlash

Generator ichida `moduleFormat` ni `cjs` ga o'rnating:

```groovy
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat    = "cjs"
}
```

> info **Note** `moduleFormat` konfiguratsiyasi kerak, chunki Prisma v7 standart holatda ES module sifatida keladi va bu NestJS'ning CommonJS setup'i bilan mos kelmaydi. `moduleFormat` ni `cjs` ga o'rnatish Prisma'ni ESM o'rniga CommonJS modul generatsiya qilishga majbur qiladi.

#### Database ulanishini sozlash

Database ulanishi `schema.prisma` faylidagi `datasource` blokida sozlanadi. Standart holatda u `postgresql` ga o'rnatilgan bo'ladi, ammo bu qo'llanmada SQLite ishlatilgani uchun `datasource` blokidagi `provider` ni `sqlite` ga o'zgartirishingiz kerak:

```groovy
datasource db {
  provider = "sqlite"
}

generator client {
  provider      = "prisma-client"
  output        = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
```

Endi `.env` faylini oching va `DATABASE_URL` environment variable'ini quyidagicha o'zgartiring:

```bash
DATABASE_URL="file:./dev.db"
```

[ConfigModule](/docs/techniques/configuration) sozlanganiga ishonch hosil qiling, aks holda `DATABASE_URL` o'zgaruvchisi `.env` dan olinmaydi.

SQLite database'lari oddiy fayllar bo'ladi; undan foydalanish uchun alohida server kerak emas. Shu sabab _host_ va _port_ bilan connection URL yozish o'rniga, bu yerda `dev.db` deb nomlangan lokal faylga ishora qilishingiz kifoya. Bu fayl keyingi qadamda yaratiladi.

<details><summary>Expand if you're using PostgreSQL, MySQL, MsSQL or Azure SQL</summary>

PostgreSQL va MySQL bilan connection URL'ni _database server_ ga ishora qiladigan qilib sozlashingiz kerak. Kerakli connection URL formati haqida bu yerda ko'proq bilishingiz mumkin.

**PostgreSQL**

Agar PostgreSQL ishlatayotgan bo'lsangiz, `schema.prisma` va `.env` fayllarini quyidagicha o'zgartiring:

**`schema.prisma`**

```groovy
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
```

**`.env`**

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"
```

Barcha katta harflarda yozilgan placeholder'larni o'zingizning database credential'laringiz bilan almashtiring. Agar `SCHEMA` uchun nima yozishni bilmasangiz, ko'p hollarda standart qiymat `public` bo'ladi:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

PostgreSQL database'ni qanday sozlashni bilmoqchi bo'lsangiz, Heroku'da bepul PostgreSQL database sozlash qo'llanmasini kuzatishingiz mumkin.

**MySQL**

Agar MySQL ishlatayotgan bo'lsangiz, `schema.prisma` va `.env` fayllarini quyidagicha o'zgartiring:

**`schema.prisma`**

```groovy
datasource db {
  provider = "mysql"
}

generator client {
  provider = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
```

**`.env`**

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Barcha katta harflarda yozilgan placeholder'larni database credential'laringiz bilan almashtiring.

**Microsoft SQL Server / Azure SQL Server**

Agar Microsoft SQL Server yoki Azure SQL Server ishlatayotgan bo'lsangiz, `schema.prisma` va `.env` fayllarini quyidagicha o'zgartiring:

**`schema.prisma`**

```groovy
datasource db {
  provider = "sqlserver"
}

generator client {
  provider = "prisma-client"
  output          = "../src/generated/prisma"
  moduleFormat  = "cjs"
}
```

**`.env`**

Barcha katta harflarda yozilgan placeholder'larni database credential'laringiz bilan almashtiring. Agar `encrypt` uchun nima yozishni bilmasangiz, ko'p hollarda standart qiymat `true` bo'ladi:

```bash
DATABASE_URL="sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD;encrypt=true"
```

</details>

#### Prisma Migrate bilan ikkita database jadvali yaratish

Ushbu bo'limda Prisma Migrate yordamida database'da ikkita yangi jadval yaratasiz. Prisma Migrate Prisma schema ichidagi deklarativ data model asosida SQL migration fayllarini generatsiya qiladi. Bu migration fayllari to'liq sozlanadi, shu sabab database'ning qo'shimcha xususiyatlarini yoki masalan seed qilish uchun qo'shimcha buyruqlarni ham qo'shishingiz mumkin.

`schema.prisma` fayliga quyidagi ikkita modelni qo'shing:

```groovy
model User {
  id    Int     @default(autoincrement()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @default(autoincrement()) @id
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

Prisma modellari tayyor bo'lgach, SQL migration fayllarini generatsiya qilib, ularni database'ga qo'llashingiz mumkin. Terminalda quyidagi buyruqni ishga tushiring:

```bash
$ npx prisma migrate dev --name init
```

Bu `prisma migrate dev` buyrug'i SQL fayllarini generatsiya qiladi va ularni to'g'ridan-to'g'ri database'ga qo'llaydi. Bu holatda mavjud `prisma` katalogida quyidagi migration fayllari yaratiladi:

```bash
$ tree prisma
prisma
├── dev.db
├── migrations
│   └── 20201207100915_init
│       └── migration.sql
└── schema.prisma
```

<details><summary>Expand to view the generated SQL statements</summary>

SQLite database'ingizda quyidagi jadvallar yaratiladi:

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN DEFAULT false,
    "authorId" INTEGER,

    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
```

</details>

#### Prisma Client'ni o'rnatish va generatsiya qilish

Prisma Client - bu Prisma model ta'rifidan _generatsiya qilinadigan_ type-safe database client. Shu yondashuv sabab Prisma Client aynan modellaringizga moslashtirilgan CRUD operatsiyalarini taqdim etadi.

Prisma Client'ni loyihaga o'rnatish uchun terminalda quyidagi buyruqni ishga tushiring:

```bash
$ npm install @prisma/client
```

O'rnatilgach, loyiha uchun kerakli type'lar va Client'ni generatsiya qilish uchun `generate` buyrug'ini ishga tushiring. Schema'ga o'zgartirish kiritilsa, type'larni mos holda saqlash uchun `generate` buyrug'ini yana qayta ishga tushirishingiz kerak bo'ladi.

```bash
$ npx prisma generate
```

Prisma Client'dan tashqari, ishlatayotgan database turiga mos driver adapter ham kerak bo'ladi. SQLite uchun `@prisma/adapter-better-sqlite3` driver'ini o'rnatishingiz mumkin.

```bash
npm install @prisma/adapter-better-sqlite3
```

<details> <summary>Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL</summary>

- For PostgreSQL

```bash
npm install @prisma/adapter-pg
```

- For MySQL, MsSQL, AzureSQL:

```bash
npm install @prisma/adapter-mariadb
```

</details>

#### Prisma Client'ni NestJS service'larida ishlatish

Endi Prisma Client yordamida database query'larini yubora olasiz. Prisma Client bilan query yozish haqida ko'proq bilish uchun API documentation ni ko'ring.

NestJS ilovasini sozlayotganda, database query'lari uchun Prisma Client API'ni service ichida abstraksiya qilish ma'qul. Buning uchun `PrismaClient` instansiyasini yaratish va database'ga ulanishni boshqaradigan yangi `PrismaService` yarating.

`src` katalogi ichida `prisma.service.ts` nomli yangi fayl yarating va unga quyidagi kodni yozing:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
    super({ adapter });
  }
}
```

Keyin Prisma schema'dagi `User` va `Post` modellari uchun database chaqiruvlarini bajaradigan service'larni yozishingiz mumkin.

Yana `src` katalogi ichida `user.service.ts` nomli yangi fayl yarating va unga quyidagi kodni yozing:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
```

E'tibor bering, bu yerda service tashqariga chiqaradigan metodlar to'g'ri typed bo'lishi uchun Prisma Client generatsiya qilgan type'lardan foydalanilyapti. Shu bilan model type'larini qo'lda yozish va alohida interface yoki DTO fayllari yaratishdagi boilerplate kamayadi.

Endi xuddi shu ishni `Post` modeli uchun ham bajaring.

Yana `src` katalogi ichida `post.service.ts` nomli yangi fayl yarating va unga quyidagi kodni yozing:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Post, Prisma } from 'generated/prisma';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput,
  ): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    const { data, where } = params;
    return this.prisma.post.update({
      data,
      where,
    });
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({
      where,
    });
  }
}
```

Hozircha `UsersService` va `PostsService` Prisma Client'da mavjud CRUD query'larini o'rab turibdi. Real ilovada service qatlami business logic'ni ham shu yerga joylashtirish uchun ishlatiladi. Masalan, `UsersService` ichida foydalanuvchi parolini yangilaydigan `updatePassword` metodini yozishingiz mumkin.

Yangi service'larni app module ichida ro'yxatdan o'tkazishni unutmang.

##### REST API route'larini asosiy app controller'da implement qilish

Oxirida oldingi bo'limlarda yaratgan service'laringizdan foydalanib, ilovangizning turli route'larini implement qilasiz. Ushbu qo'llanma uchun barcha route'lar allaqachon mavjud `AppController` class'i ichiga joylashtiriladi.

`app.controller.ts` fayli tarkibini quyidagi kod bilan almashtiring:

```typescript
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { PostsService } from './post.service';
import { User as UserModel, Post as PostModel } from 'generated/prisma';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UsersService,
    private readonly postService: PostsService,
  ) {}

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered-posts/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData;
    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: authorEmail },
      },
    });
  }

  @Post('user')
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}
```

Ushbu controller quyidagi route'larni implement qiladi:

###### `GET`

- `/post/:id`: `id` orqali bitta post'ni olish
- `/feed`: Barcha _published_ post'larni olish
- `/filter-posts/:searchString`: `title` yoki `content` bo'yicha post'larni filter qilish

###### `POST`

- `/post`: Yangi post yaratish
  - Body:
    - `title: String` (required): post sarlavhasi
    - `content: String` (optional): post matni
    - `authorEmail: String` (required): post yaratgan foydalanuvchining email'i
- `/user`: Yangi foydalanuvchi yaratish
  - Body:
    - `email: String` (required): foydalanuvchi email manzili
    - `name: String` (optional): foydalanuvchi ismi

###### `PUT`

- `/publish/:id`: `id` bo'yicha post'ni publish qilish

###### `DELETE`

- `/post/:id`: `id` bo'yicha post'ni o'chirish

#### Xulosa

Ushbu recipe'da Prisma'ni NestJS bilan birga ishlatib REST API yaratishni o'rgandingiz. API route'larini implement qilgan controller `PrismaService` ga murojaat qiladi, u esa Prisma Client orqali database'ga query yuborib kiruvchi so'rovlarning ma'lumot ehtiyojini qoplaydi.

Agar NestJS bilan Prisma'dan foydalanish haqida ko'proq bilmoqchi bo'lsangiz, quyidagi resurslarni ko'ring:

- NestJS & Prisma
- Ready-to-run example projects for REST & GraphQL
- Production-ready starter kit
- Video: Accessing Databases using NestJS with Prisma (5min) by Marc Stammerjohann
