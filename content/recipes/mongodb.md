---
title: "MongoDB (Mongoose)"
navTitle: "MongoDB (Mongoose)"
description: "Mongoose eng mashhur MongoDB obyekt modellashtirish vositasi."
order: 7
group: recipes
groupTitle: "Recipes"
---
> **Warning** Ushbu maqolada siz **Mongoose** paketiga asoslangan `DatabaseModule` ni noldan, custom komponentlardan foydalanib qanday yaratishni o'rganasiz. Natijada, bu yechimda tayyor, qutidan tashqarida mavjud `@nestjs/mongoose` paketidan foydalanib chetlab o'tishingiz mumkin bo'lgan ko'p overhead mavjud. Batafsil bu yerda.

Mongoose eng mashhur MongoDB obyekt modellashtirish vositasi.

#### Boshlash

Ushbu kutubxona bilan ishni boshlash uchun barcha kerakli qaramliklarni o'rnatishimiz kerak:

```typescript
$ npm install --save mongoose
```

Birinchi qadam - `connect()` funksiyasi yordamida ma'lumotlar bazasi bilan ulanish o'rnatish. `connect()` funksiyasi `Promise` qaytaradi, shuning uchun [async provider](/docs/fundamentals/async-components) yaratishimiz kerak.

```typescript
@@filename(database.providers)
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];
@@switch
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: () => mongoose.connect('mongodb://localhost/nest'),
  },
];
```

> info **Hint** Eng yaxshi amaliyotlarga ko'ra, custom providerni `*.providers.ts` suffiksiga ega alohida faylda e'lon qildik.

Keyin, ilovaning qolgan qismi uchun ularni **mavjud** qilish uchun bu providerlarni eksport qilishimiz kerak.

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

Endi `Connection` obyektini `@Inject()` dekoratori yordamida inject qila olamiz. `Connection` async provideriga bog'liq har bir klass `Promise` bajarilguncha kutadi.

#### Modelni inject qilish

Mongoose bilan hamma narsa Schema dan kelib chiqadi. `CatSchema` ni aniqlaymiz:

```typescript
@@filename(schemas/cat.schema)
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

`CatsSchema` `cats` katalogiga tegishli. Bu katalog `CatsModule` ni ifodalaydi.

Endi **Model** provider yaratish vaqti keldi:

```typescript
@@filename(cats.providers)
import { Connection } from 'mongoose';
import { CatSchema } from './schemas/cat.schema';

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection: Connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
@@switch
import { CatSchema } from './schemas/cat.schema';

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
```

> warning **Warning** Amaliy ilovalarda **magic string** lardan qochish kerak. `CAT_MODEL` va `DATABASE_CONNECTION` har ikkalasi alohida `constants.ts` faylida saqlanishi kerak.

Endi `CAT_MODEL` ni `CatsService` ga `@Inject()` dekoratori yordamida inject qila olamiz:

```typescript
@@filename(cats.service)
import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CAT_MODEL')
    private catModel: Model<Cat>,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
@@switch
import { Injectable, Dependencies } from '@nestjs/common';

@Injectable()
@Dependencies('CAT_MODEL')
export class CatsService {
  constructor(catModel) {
    this.catModel = catModel;
  }

  async create(createCatDto) {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll() {
    return this.catModel.find().exec();
  }
}
```

Yuqoridagi misolda `Cat` interfeysidan foydalandik. Bu interfeys mongoose paketidagi `Document` dan meros oladi:

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

Ma'lumotlar bazasi ulanishi **asinxron**, lekin Nest bu jarayonni oxirgi foydalanuvchi uchun butunlay ko'rinmas qiladi. `CatModel` klassi db ulanishini kutadi, `CatsService` esa model tayyor bo'lguncha kechiktiriladi. Har bir klass nusxasi yaratilgach butun ilova ishga tushishi mumkin.

Mana yakuniy `CatsModule`:

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

> info **Hint** `CatsModule` ni ildiz `AppModule` ga import qilishni unutmang.

#### Misol

Ishlaydigan misol bu yerda mavjud.
