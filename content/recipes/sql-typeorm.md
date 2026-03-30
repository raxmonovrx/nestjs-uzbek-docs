---
title: "SQL (TypeORM)"
navTitle: "SQL (TypeORM)"
description: "##### Bu bo'lim faqat TypeScript uchun"
order: 17
group: recipes
groupTitle: "Recipes"
---
##### Bu bo'lim faqat TypeScript uchun

> **Warning** Bu maqolada custom provider mexanizmi yordamida **TypeORM** package'i asosida `DatabaseModule` ni noldan qanday yaratish ko'rsatiladi. Natijada bu yechimda qo'shimcha overhead ko'p bo'ladi. Buni tayyor `@nestjs/typeorm` package'idan foydalanib chetlab o'tish mumkin. Ko'proq ma'lumot uchun [bu yerga](/docs/techniques/sql) qarang.

TypeORM node.js ekotizimidagi eng yetuk Object Relational Mapper (ORM) lardan biri hisoblanadi. U TypeScript'da yozilgani uchun Nest framework bilan juda yaxshi ishlaydi.

#### Boshlash

Bu kutubxona bilan ishlashni boshlash uchun barcha kerakli dependency'larni o'rnatishimiz kerak:

```bash
$ npm install --save typeorm mysql2
```

Birinchi qadam `typeorm` package'idan import qilingan `new DataSource().initialize()` orqali database bilan ulanishni o'rnatishdir. `initialize()` funksiyasi `Promise` qaytaradi, shu sabab [async provider](/docs/fundamentals/async-components) yaratishimiz kerak bo'ladi.

```typescript
@@filename(database.providers)
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'test',
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
```

> warning **Warning** `synchronize: true` ni production'da ishlatmaslik kerak, aks holda production ma'lumotlarini yo'qotib qo'yishingiz mumkin.

> info **Hint** Best practice'ga amal qilib, custom provider'ni `*.providers.ts` suffix'iga ega alohida faylda e'lon qildik.

Keyin bu provider'larni ilovaning qolgan qismi uchun **accessible** qilish maqsadida export qilamiz.

```typescript
@@filename(database.module)
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

Endi `DATA_SOURCE` obyektini `@Inject()` dekoratori orqali inject qila olamiz. `DATA_SOURCE` async provider'iga bog'liq har bir class `Promise` resolve bo'lguncha kutadi.

#### Repository pattern'i

TypeORM repository design pattern'ni qo'llab-quvvatlaydi, shu sabab har bir entity o'z Repository'siga ega bo'ladi. Bu repository'larni database connection orqali olish mumkin.

Ammo avval kamida bitta entity kerak. Biz rasmiy hujjatlardagi `Photo` entity'dan qayta foydalanamiz.

```typescript
@@filename(photo.entity)
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column('int')
  views: number;

  @Column()
  isPublished: boolean;
}
```

`Photo` entity `photo` direktoriyasiga tegishli. Bu direktoriyaning o'zi `PhotoModule` ni ifodalaydi. Endi **Repository** provider yarataylik:

```typescript
@@filename(photo.providers)
import { DataSource } from 'typeorm';
import { Photo } from './photo.entity';

export const photoProviders = [
  {
    provide: 'PHOTO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Photo),
    inject: ['DATA_SOURCE'],
  },
];
```

> warning **Warning** Real loyihalarda **magic string**'lardan qochish kerak. `PHOTO_REPOSITORY` ham, `DATA_SOURCE` ham alohida `constants.ts` faylida saqlangani ma'qul.

Endi `Repository<Photo>` ni `@Inject()` dekoratori orqali `PhotoService` ichiga inject qila olamiz:

```typescript
@@filename(photo.service)
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @Inject('PHOTO_REPOSITORY')
    private photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return this.photoRepository.find();
  }
}
```

Database connection **asynchronous**, lekin Nest bu jarayonni oxirgi foydalanuvchi uchun deyarli sezilmas qiladi. `PhotoRepository` db connection tayyor bo'lguncha kutadi, `PhotoService` esa repository ishlatishga tayyor bo'lguncha kechiktiriladi. Barcha class'lar instantiate qilingach, butun ilova ishga tushishi mumkin.

Yakuniy `PhotoModule` quyidagicha bo'ladi:

```typescript
@@filename(photo.module)
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { photoProviders } from './photo.providers';
import { PhotoService } from './photo.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...photoProviders,
    PhotoService,
  ],
})
export class PhotoModule {}
```

> info **Hint** `PhotoModule` ni root `AppModule` ichiga import qilishni unutmang.
