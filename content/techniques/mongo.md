---
title: "Mongo"
navTitle: "Mongo"
description: "Nest MongoDB bazasi bilan integratsiya qilishning ikki usulini qo'llab-quvvatlaydi. Siz bu yerda tasvirlangan MongoDB uchun connectorga ega ichki TypeORM modulidan foydalanishingiz"
order: 9
group: techniques
groupTitle: "Techniques"
---
Nest MongoDB bazasi bilan integratsiya qilishning ikki usulini qo'llab-quvvatlaydi. Siz bu yerda tasvirlangan MongoDB uchun connectorga ega ichki TypeORM modulidan foydalanishingiz yoki MongoDB uchun eng mashhur obyekt modellashtirish vositasi bo'lgan Mongoose ni ishlatishingiz mumkin. Bu bobda biz ikkinchi usulni, ya'ni `@nestjs/mongoose` paketidan foydalanishni ko'rib chiqamiz.

Kerakli bog'liqliklarni o'rnatishdan boshlang:

```bash
$ npm i @nestjs/mongoose mongoose
```

O'rnatish jarayoni tugagach, `MongooseModule` ni root `AppModule` ga import qilamiz.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}
```

`forRoot()` metodi Mongoose paketidagi `mongoose.connect()` bilan bir xil konfiguratsiya obyektini qabul qiladi, bu yerda tasvirlangan.

#### Modelni injeksiya qilish

Mongoose da hamma narsa Schema dan kelib chiqadi. Har bir schema MongoDB kolleksiyasiga mos keladi va shu kolleksiyadagi hujjatlarning shaklini belgilaydi. Schemas Model larni ta'riflashda ishlatiladi. Modellar MongoDB bazasidan hujjatlarni yaratish va o'qish uchun javob beradi.

Schemalari NestJS dekoratorlari yordamida yoki Mongoose ning o'zi bilan qo'lda yaratish mumkin. Dekoratorlar orqali schema yaratish boilerplate ni sezilarli kamaytiradi va kod o'qilishini yaxshilaydi.

`CatSchema` ni aniqlaymiz:

```typescript
@@filename(schemas/cat.schema)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

@Schema()
export class Cat {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
```

> info **Hint** Eslatma: `DefinitionsFactory` klassi (`nestjs/mongoose` dan) yordamida xom schema ta'rifini ham generatsiya qilishingiz mumkin. Bu siz bergan metadata asosida yaratilgan schema ta'rifini qo'lda o'zgartirishga imkon beradi. Bu, ba'zi chekka holatlarda hamma narsani dekoratorlar bilan ifodalash qiyin bo'lganda foydali.

`@Schema()` dekoratori klassni schema ta'rifi sifatida belgilaydi. U bizning `Cat` klassimizni xuddi shu nomdagi, lekin oxiriga qo'shimcha "s" qo'shilgan MongoDB kolleksiyasiga moslaydi, shuning uchun yakuniy mongo kolleksiya nomi `cats` bo'ladi. Bu dekorator bitta ixtiyoriy argument qabul qiladi, u schema options obyektidir. Buni `mongoose.Schema` klassi konstruktorining ikkinchi argumenti sifatida odatda beriladigan obyekt deb o'ylang (masalan, `new mongoose.Schema(_, options)`). Mavjud schema opsiyalari haqida ko'proq ma'lumot olish uchun shu bobga qarang.

`@Prop()` dekoratori hujjatdagi xossani belgilaydi. Masalan, yuqoridagi schema ta'rifida biz uchta xossani belgiladik: `name`, `age`, va `breed`. Bu xossalar uchun schema types TypeScript metadata (va reflection) imkoniyatlari orqali avtomatik aniqlanadi. Biroq, turlarni yashirin aniqlab bo'lmaydigan murakkab holatlarda (masalan, massivlar yoki ichma-ich obyekt tuzilmalari), turlarni aniq ko'rsatish kerak, quyidagicha:

```typescript
@Prop([String])
tags: string[];
```

Muqobil ravishda, `@Prop()` dekoratori options obyektini ham qabul qiladi (mavjud opsiyalar haqida o'qing). Bu orqali xossa majburiyligini ko'rsatish, default qiymat berish yoki uni immutable qilish mumkin. Masalan:

```typescript
@Prop({ required: true })
name: string;
```

Agar boshqa modelga bog'liqlikni keyinroq populate qilish uchun ko'rsatmoqchi bo'lsangiz, `@Prop()` dekoratoridan foydalanishingiz mumkin. Masalan, agar `Cat` da `Owner` bo'lsa va u `owners` nomli boshqa kolleksiyada saqlansa, xossada type va ref bo'lishi kerak. Masalan:

```typescript
import * as mongoose from 'mongoose';
import { Owner } from '../owners/schemas/owner.schema';

// inside the class definition
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
owner: Owner;
```

Agar bir nechta owner bo'lsa, xossa konfiguratsiyasi quyidagicha bo'ladi:

```typescript
@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }] })
owners: Owner[];
```

Agar boshqa kolleksiyaga bo'lgan reference ni doim ham populate qilmoqchi bo'lmasangiz, type sifatida `mongoose.Types.ObjectId` dan foydalanishni ko'rib chiqing:

```typescript
@Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' } })
// This ensures the field is not confused with a populated reference
owner: mongoose.Types.ObjectId;
```

Shundan so'ng, keyinroq uni tanlab populate qilish kerak bo'lganda, to'g'ri type ko'rsatadigan repository funksiyasidan foydalanishingiz mumkin:

```typescript
import { Owner } from './schemas/owner.schema';

// e.g. inside a service or repository
async findAllPopulated() {
  return this.catModel.find().populate<{ owner: Owner }>("owner");
}
```

> info **Hint** Agar populate qilinadigan foreign hujjat bo'lmasa, type `Owner | null` bo'lishi mumkin, sizning Mongoose konfiguratsiyangiz ga qarab. Muqobil ravishda, xato qaytarishi ham mumkin, bu holda type `Owner` bo'ladi.

Nihoyat, dekoratorga **xom** schema ta'rifini ham berish mumkin. Bu, masalan, xossa class sifatida aniqlanmagan ichma-ich obyektni ifodalaganda foydali. Buning uchun `@nestjs/mongoose` paketidagi `raw()` funksiyasidan foydalaning:

```typescript
@Prop(raw({
  firstName: { type: String },
  lastName: { type: String }
}))
details: Record<string, any>;
```

Agar **dekoratorlardan foydalanmaslikni** afzal ko'rsangiz, schemani qo'lda aniqlashingiz mumkin. Masalan:

```typescript
export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

`cat.schema` fayli `cats` papkasi ichida joylashgan bo'ladi; shu yerda `CatsModule` ham aniqlanadi. Schema fayllarini xohlagan joyingizda saqlashingiz mumkin, ammo ularni tegishli **domen** obyektlari yonida, mos modul papkasida saqlashni tavsiya qilamiz.

Endi `CatsModule` ni ko'rib chiqamiz:

```typescript
@@filename(cats.module)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat, CatSchema } from './schemas/cat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

`MongooseModule` modulni sozlash uchun `forFeature()` metodini taqdim etadi, shu jumladan joriy scope da qaysi modellarni ro'yxatdan o'tkazish kerakligini ham belgilaydi. Agar modellardan boshqa modulda ham foydalanmoqchi bo'lsangiz, `CatsModule` ning `exports` bo'limiga MongooseModule ni qo'shing va boshqa modulda `CatsModule` ni import qiling.

Schema ro'yxatdan o'tkazilgach, `@InjectModel()` dekoratori yordamida `CatsService` ga `Cat` modelini inject qilishingiz mumkin:

```typescript
@@filename(cats.service)
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat } from './schemas/cat.schema';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private catModel: Model<Cat>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
@@switch
import { Model } from 'mongoose';
import { Injectable, Dependencies } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Cat } from './schemas/cat.schema';

@Injectable()
@Dependencies(getModelToken(Cat.name))
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

#### Ulanish

Ba'zan native Mongoose Connection obyektiga kirish kerak bo'lishi mumkin. Masalan, ulanish obyektida native API chaqiruvlarini bajarishni xohlashingiz mumkin. `@InjectConnection()` dekoratori yordamida Mongoose Connection ni quyidagicha inject qilishingiz mumkin:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private connection: Connection) {}
}
```

#### Sessiyalar

Mongoose bilan sessiyani boshlash uchun `mongoose.startSession()` ni to'g'ridan-to'g'ri chaqirish o'rniga `@InjectConnection` orqali ma'lumotlar bazasi ulanishini inject qilish tavsiya etiladi. Bu yondashuv NestJS dependency injection tizimi bilan yaxshiroq integratsiya qiladi va ulanishni to'g'ri boshqarishni ta'minlaydi.

Quyida sessiyani qanday boshlash misoli keltirilgan:

```typescript
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    // Your transaction logic here
  }
}
```

Bu misolda `@InjectConnection()` dekoratori Mongoose ulanishini servicega inject qilish uchun ishlatiladi. Ulanish inject qilingach, `connection.startSession()` yordamida yangi sessiyani boshlashingiz mumkin. Bu sessiya bir nechta so'rovlar bo'ylab atomik operatsiyalarni boshqarish uchun ishlatiladi. Sessiya boshlanganidan keyin, mantiqingizga qarab tranzaksiyani commit yoki abort qilishni unutmang.

#### Bir nechta ma'lumotlar bazasi

Ba'zi loyihalar bir nechta ma'lumotlar bazasi ulanishini talab qiladi. Buni ham ushbu modul orqali amalga oshirish mumkin. Bir nechta ulanish bilan ishlash uchun avval ulanishlarni yarating. Bu holatda ulanishlarni nomlash **majburiy** bo'ladi.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test', {
      connectionName: 'cats',
    }),
    MongooseModule.forRoot('mongodb://localhost/users', {
      connectionName: 'users',
    }),
  ],
})
export class AppModule {}
```

> warning **Notice** Eslatma: nomi bo'lmagan yoki bir xil nomdagi bir nechta ulanishlarga ega bo'lmasligingiz kerak, aks holda ular bir-birini bosib ketadi.

Bu sozlama bilan `MongooseModule.forFeature()` funksiyasiga qaysi ulanishdan foydalanilishi kerakligini aytish kerak.

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }], 'cats'),
  ],
})
export class CatsModule {}
```

Berilgan ulanish uchun `Connection` ni ham inject qilishingiz mumkin:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection('cats') private connection: Connection) {}
}
```

Berilgan `Connection` ni custom providerga (masalan, factory provider) inject qilish uchun `getConnectionToken()` funksiyasidan foydalaning va ulanish nomini argument sifatida bering.

```typescript
{
  provide: CatsService,
  useFactory: (catsConnection: Connection) => {
    return new CatsService(catsConnection);
  },
  inject: [getConnectionToken('cats')],
}
```

Agar nomlangan bazadan faqat modelni inject qilmoqchi bo'lsangiz, `@InjectModel()` dekoratoriga ikkinchi parametr sifatida ulanish nomini berishingiz mumkin.

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name, 'cats') private catModel: Model<Cat>) {}
}
@@switch
@Injectable()
@Dependencies(getModelToken(Cat.name, 'cats'))
export class CatsService {
  constructor(catModel) {
    this.catModel = catModel;
  }
}
```

#### Xuklar (middleware)

Middleware (pre va post hooklar ham deyiladi) - bu asinxron funksiyalar bajarilishi davomida boshqaruvni oladigan funksiyalar. Middleware schema darajasida aniqlanadi va plaginlar yozish uchun foydali (manba). Mongoose da model kompilyatsiya qilingandan keyin `pre()` yoki `post()` ni chaqirish ishlamaydi. Hookni model ro'yxatdan o'tkazilishidan **oldin** ro'yxatdan o'tkazish uchun `MongooseModule` ning `forFeatureAsync()` metodidan factory provider (ya'ni, `useFactory`) bilan birga foydalaning. Bu usul orqali schema obyektiga kirib, `pre()` yoki `post()` metodlari yordamida hookni ro'yxatdan o'tkazishingiz mumkin. Quyidagi misolga qarang:

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        useFactory: () => {
          const schema = CatsSchema;
          schema.pre('save', function () {
            console.log('Hello from pre save');
          });
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}
```

Boshqa factory providerlar kabi, factory funksiyamiz `async` bo'lishi va `inject` orqali bog'liqliklarni qabul qilishi mumkin.

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const schema = CatsSchema;
          schema.pre('save', function() {
            console.log(
              `${configService.get('APP_NAME')}: Hello from pre save`,
            );
          });
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class AppModule {}
```

#### Plaginlar

Berilgan schema uchun plugin ro'yxatdan o'tkazish uchun `forFeatureAsync()` metodidan foydalaning.

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        useFactory: () => {
          const schema = CatsSchema;
          schema.plugin(require('mongoose-autopopulate'));
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}
```

Barcha schemalar uchun bir vaqtning o'zida plagin ro'yxatdan o'tkazish uchun `Connection` obyektining `.plugin()` metodini chaqiring. Modellar yaratilishidan oldin ulanishga kirishingiz kerak; buni `connectionFactory` orqali bajaring:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test', {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      }
    }),
  ],
})
export class AppModule {}
```

#### Diskriminatorlar

Discriminators - bu schema meros olish mexanizmi. Ular bir xil MongoDB kolleksiyasi ustida, qisman bir xil schemalarga ega bir nechta modelga ega bo'lishingizga imkon beradi.

Faraz qilaylik, siz bitta kolleksiyada turli turdagi hodisalarni kuzatmoqchisiz. Har bir hodisada vaqt tamg'asi bo'ladi.

```typescript
@@filename(event.schema)
@Schema({ discriminatorKey: 'kind' })
export class Event {
  @Prop({
    type: String,
    required: true,
    enum: [ClickedLinkEvent.name, SignUpEvent.name],
  })
  kind: string;

  @Prop({ type: Date, required: true })
  time: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
```

> info **Hint** Mongoose turli discriminator modellari o'rtasidagi farqni "discriminator key" orqali aniqlaydi, u default holatda `__t` bo'ladi. Mongoose schemalaringizga `__t` nomli String path qo'shadi va u orqali hujjat qaysi discriminator instansiyasi ekanini kuzatadi.
> `discriminatorKey` opsiyasi orqali discriminator yo'lini aniqlashingiz ham mumkin.

`SignedUpEvent` va `ClickedLinkEvent` instansiyalari umumiy hodisalar bilan bir xil kolleksiyada saqlanadi.

Endi `ClickedLinkEvent` klassini quyidagicha aniqlaymiz:

```typescript
@@filename(click-link-event.schema)
@Schema()
export class ClickedLinkEvent {
  kind: string;
  time: Date;

  @Prop({ type: String, required: true })
  url: string;
}

export const ClickedLinkEventSchema = SchemaFactory.createForClass(ClickedLinkEvent);
```

Va `SignUpEvent` klassi:

```typescript
@@filename(sign-up-event.schema)
@Schema()
export class SignUpEvent {
  kind: string;
  time: Date;

  @Prop({ type: String, required: true })
  user: string;
}

export const SignUpEventSchema = SchemaFactory.createForClass(SignUpEvent);
```

Shu bilan, berilgan schema uchun discriminator ro'yxatdan o'tkazish uchun `discriminators` opsiyasidan foydalaning. U `MongooseModule.forFeature` va `MongooseModule.forFeatureAsync` ikkalasida ham ishlaydi:

```typescript
@@filename(event.module)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema,
        discriminators: [
          { name: ClickedLinkEvent.name, schema: ClickedLinkEventSchema },
          { name: SignUpEvent.name, schema: SignUpEventSchema },
        ],
      },
    ]),
  ]
})
export class EventsModule {}
```

#### Testlash

Ilovani unit testlashda, odatda, hech qanday ma'lumotlar bazasi ulanishidan qochishni xohlaymiz, bu test to'plamlarini o'rnatishni soddalashtiradi va tezlashtiradi. Ammo klasslarimiz ulanish instansiyasidan olinadigan modellarga bog'liq bo'lishi mumkin. Bu klasslarni qanday hal qilamiz? Yechim - mock modellari yaratish.

Buni osonlashtirish uchun `@nestjs/mongoose` paketi token nomiga asoslangan tayyor injection token qaytaradigan `getModelToken()` funksiyasini taqdim etadi. Bu token yordamida `useClass`, `useValue` va `useFactory` kabi standart custom provider usullaridan foydalanib osonlik bilan mock implementatsiya berishingiz mumkin. Masalan:

```typescript
@Module({
  providers: [
    CatsService,
    {
      provide: getModelToken(Cat.name),
      useValue: catModel,
    },
  ],
})
export class CatsModule {}
```

Bu misolda, qattiq kodlangan `catModel` (obyekt instansiyasi) har safar `@InjectModel()` dekoratori orqali `Model<Cat>` inject qiladigan consumer bo'lsa taqdim etiladi.

#### Async sozlash

Modul opsiyalarini statik emas, asinxron tarzda uzatishingiz kerak bo'lganda `forRootAsync()` metodidan foydalaning. Aksariyat dinamik modullar kabi, Nest asinxron konfiguratsiya bilan ishlash uchun bir nechta usullarni taqdim etadi.

Usullardan biri - factory funksiyasidan foydalanish:

```typescript
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: 'mongodb://localhost/nest',
  }),
});
```

Boshqa factory providerlar kabi, factory funksiyamiz `async` bo'lishi va `inject` orqali bog'liqliklarni qabul qilishi mumkin.

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
  inject: [ConfigService],
});
```

Muqobil ravishda, quyida ko'rsatilganidek, `MongooseModule` ni factory o'rniga klass yordamida sozlashingiz mumkin:

```typescript
MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
});
```

Yuqoridagi konstruktsiya `MongooseConfigService` ni `MongooseModule` ichida yaratadi va undan kerakli opsiyalar obyektini yaratish uchun foydalanadi. E'tibor bering, bu misolda `MongooseConfigService` `MongooseOptionsFactory` interfeysini implementatsiya qilishi kerak, bu quyida ko'rsatilgan. `MongooseModule` taqdim etilgan klass obyektining `createMongooseOptions()` metodini chaqiradi.

```typescript
@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: 'mongodb://localhost/nest',
    };
  }
}
```

Agar `MongooseModule` ichida private nusxa yaratmasdan mavjud opsiyalar providerni qayta ishlatmoqchi bo'lsangiz, `useExisting` sintaksisidan foydalaning.

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

#### Ulanish hodisalari

Mongoose ulanish hodisalari ni `onConnectionCreate` konfiguratsiya opsiyasi yordamida tinglashingiz mumkin. Bu ulanish o'rnatilganda custom mantiqni ishga tushirishga imkon beradi. Masalan, quyida ko'rsatilgandek `connected`, `open`, `disconnected`, `reconnected`, va `disconnecting` hodisalari uchun listenerlar ro'yxatdan o'tkazishingiz mumkin:

```typescript
MongooseModule.forRoot('mongodb://localhost/test', {
  onConnectionCreate: (connection: Connection) => {
    connection.on('connected', () => console.log('connected'));
    connection.on('open', () => console.log('open'));
    connection.on('disconnected', () => console.log('disconnected'));
    connection.on('reconnected', () => console.log('reconnected'));
    connection.on('disconnecting', () => console.log('disconnecting'));

    return connection;
  },
}),
```

Bu kod parchasida biz `mongodb://localhost/test` manzilidagi MongoDB bazasiga ulanishni o'rnatmoqdamiz. `onConnectionCreate` opsiyasi ulanish holatini kuzatish uchun aniq hodisa listenerlarini sozlash imkonini beradi:

- `connected`: ulanish muvaffaqiyatli o'rnatilganda ishga tushadi.
- `open`: ulanish to'liq ochilib, operatsiyalar uchun tayyor bo'lganda chaqiriladi.
- `disconnected`: ulanish uzilganda chaqiriladi.
- `reconnected`: uzilishdan keyin ulanish qayta o'rnatilganda ishga tushadi.
- `disconnecting`: ulanish yopilish jarayonida bo'lganda sodir bo'ladi.

Shuningdek, `onConnectionCreate` xossasini `MongooseModule.forRootAsync()` bilan yaratilgan asinxron konfiguratsiyalarga ham qo'shishingiz mumkin:

```typescript
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: 'mongodb://localhost/test',
    onConnectionCreate: (connection: Connection) => {
      // Register event listeners here
      return connection;
    },
  }),
}),
```

Bu ulanish hodisalarini boshqarish uchun moslashuvchan usul bo'lib, ulanish holatidagi o'zgarishlarni samarali tarzda qayta ishlashga yordam beradi.

#### Subdokumentlar

Parent hujjat ichida subdokumentlarni joylash uchun schemalaringizni quyidagicha aniqlashingiz mumkin:

```typescript
@@filename(name.schema)
@Schema()
export class Name {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
}

export const NameSchema = SchemaFactory.createForClass(Name);
```

So'ng subdokumentni parent schema ichida ko'rsating:

```typescript
@@filename(person.schema)
@Schema()
export class Person {
  @Prop(NameSchema)
  name: Name;
}

export const PersonSchema = SchemaFactory.createForClass(Person);

export type PersonDocumentOverride = {
  name: Types.Subdocument<Types.ObjectId> & Name;
};

export type PersonDocument = HydratedDocument<Person, PersonDocumentOverride>;
```

Agar bir nechta subdokumentni kiritmoqchi bo'lsangiz, subdokumentlar massividan foydalanishingiz mumkin. Xossa tipini mos ravishda override qilish muhim:

```typescript
@@filename(name.schema)
@Schema()
export class Person {
  @Prop([NameSchema])
  name: Name[];
}

export const PersonSchema = SchemaFactory.createForClass(Person);

export type PersonDocumentOverride = {
  name: Types.DocumentArray<Name>;
};

export type PersonDocument = HydratedDocument<Person, PersonDocumentOverride>;
```

#### Virtuals

Mongoose da **virtual** - bu hujjatda mavjud, lekin MongoDB ga saqlanmaydigan xossa. U bazada saqlanmaydi, lekin unga murojaat qilganda dinamik hisoblanadi. Virtuals odatda hosila yoki hisoblangan qiymatlar uchun ishlatiladi, masalan maydonlarni birlashtirish (masalan, `firstName` va `lastName` ni qo'shib `fullName` xossasini yaratish), yoki hujjatdagi mavjud ma'lumotlarga tayanuvchi xossalarni yaratish uchun.

```ts
class Person {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Virtual({
    get: function (this: Person) {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  fullName: string;
}
```

> info **Hint** `@Virtual()` dekoratori `@nestjs/mongoose` paketidan import qilinadi.

Bu misolda `fullName` virtuali `firstName` va `lastName` dan hosil qilinadi. U chaqirilganda oddiy xossadek ishlaydi, ammo MongoDB hujjatiga hech qachon saqlanmaydi.:

#### Misol

Ishlaydigan misol bu yerda mavjud.
