---
title: "SQL (Sequelize)"
navTitle: "SQL (Sequelize)"
description: "##### Bu bo'lim faqat TypeScript uchun"
order: 16
group: recipes
groupTitle: "Recipes"
---
##### Bu bo'lim faqat TypeScript uchun

> **Warning** Bu maqolada custom component'lar yordamida **Sequelize** package'i asosida `DatabaseModule` ni noldan qanday yaratish ko'rsatiladi. Natijada bu yondashuvda qo'shimcha overhead ko'p bo'ladi. Uni tayyor `@nestjs/sequelize` package'idan foydalanish orqali oldini olish mumkin. Ko'proq ma'lumot uchun bu yerga qarang.

Sequelize vanilla JavaScript'da yozilgan mashhur Object Relational Mapper (ORM) hisoblanadi. Bundan tashqari, asosiy sequelize uchun dekoratorlar va qo'shimcha imkoniyatlar beradigan sequelize-typescript TypeScript wrapper'i ham mavjud.

#### Boshlash

Bu kutubxona bilan ishlashni boshlash uchun quyidagi dependency'larni o'rnatishimiz kerak:

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

Birinchi qadam sifatida constructor'ga options obyekt uzatib **Sequelize** instance yaratamiz. Shuningdek, barcha model'larni qo'shishimiz (`modelPaths` property'dan ham foydalanish mumkin) va database table'larini `sync()` qilishimiz kerak.

```typescript
@@filename(database.providers)
import { Sequelize } from 'sequelize-typescript';
import { Cat } from '../cats/cat.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'nest',
      });
      sequelize.addModels([Cat]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
```

> info **Hint** Best practice'ga amal qilib, custom provider'ni `*.providers.ts` suffix'iga ega alohida faylda e'lon qildik.

Keyin bu provider'larni ilovaning qolgan qismi uchun **accessible** qilish maqsadida export qilishimiz kerak.

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

Endi `Sequelize` obyektini `@Inject()` dekoratori yordamida inject qila olamiz. `Sequelize` async provider'iga bog'liq bo'lgan har bir class `Promise` resolve bo'lguncha kutadi.

#### Model injection'i

Sequelize ichida **Model** database'dagi table'ni ifodalaydi. Bu class instance'lari esa database row'ni anglatadi. Avvalo bizga kamida bitta entity kerak:

```typescript
@@filename(cat.entity)
import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class Cat extends Model {
  @Column
  name: string;

  @Column
  age: number;

  @Column
  breed: string;
}
```

`Cat` entity `cats` direktoriyasiga tegishli. Bu direktoriyaning o'zi `CatsModule` ni ifodalaydi. Endi **Repository** provider yaratish vaqti keldi:

```typescript
@@filename(cats.providers)
import { Cat } from './cat.entity';

export const catsProviders = [
  {
    provide: 'CATS_REPOSITORY',
    useValue: Cat,
  },
];
```

> warning **Warning** Real loyihalarda **magic string**'lardan qochish kerak. `CATS_REPOSITORY` ham, `SEQUELIZE` ham alohida `constants.ts` faylida saqlangani ma'qul.

Sequelize'da ma'lumotlarni boshqarish uchun static metodlardan foydalaniladi, shu sabab bu yerda **alias** yaratdik.

Endi `CATS_REPOSITORY` ni `@Inject()` dekoratori orqali `CatsService` ichiga inject qila olamiz:

```typescript
@@filename(cats.service)
import { Injectable, Inject } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CATS_REPOSITORY')
    private catsRepository: typeof Cat
  ) {}

  async findAll(): Promise<Cat[]> {
    return this.catsRepository.findAll<Cat>();
  }
}
```

Database connection **asynchronous**, lekin Nest bu jarayonni oxirgi foydalanuvchi uchun deyarli sezilmas qiladi. `CATS_REPOSITORY` provider'i db connection tayyor bo'lguncha kutadi, `CatsService` esa repository ishlatishga tayyor bo'lguncha kechiktiriladi. Barcha class'lar instantiate qilingach, butun ilova ishga tushishi mumkin.

Yakuniy `CatsModule` quyidagicha bo'ladi:

```typescript
@@filename(cats.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { catsProviders } from './cats.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [
    CatsService,
    ...catsProviders,
  ],
})
export class CatsModule {}
```

> info **Hint** `CatsModule` ni root `AppModule` ichiga import qilishni unutmang.
