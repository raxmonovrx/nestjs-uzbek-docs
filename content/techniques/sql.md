---
title: "Ma'lumotlar bazasi"
navTitle: "Ma'lumotlar bazasi"
description: "Nest ma'lumotlar bazasiga bog'lanmagan (database agnostic), shuning uchun siz istalgan SQL yoki NoSQL bazani oson integratsiya qilishingiz mumkin. Tanlovlaringizga qarab bir nechta"
order: 16
group: techniques
groupTitle: "Techniques"
---
Nest ma'lumotlar bazasiga bog'lanmagan (database agnostic), shuning uchun siz istalgan SQL yoki NoSQL bazani oson integratsiya qilishingiz mumkin. Tanlovlaringizga qarab bir nechta variant mavjud. Eng umumiy holatda, Nestni ma'lumotlar bazasiga ulash shunchaki mos Node.js driverini yuklash bilan cheklanadi, xuddi Express yoki Fastify bilan qilganingiz kabi.

Shuningdek, siz MikroORM ([MikroORM recipe](/docs/recipes/mikroorm)ga qarang), Sequelize (Sequelize integrationga qarang), Knex.js (Knex.js tutorialga qarang), TypeORM va Prisma ([Prisma recipe](/docs/recipes/prisma)ga qarang) kabi umumiy maqsadli Node.js ma'lumotlar bazasi integratsiya **kutubxonasi** yoki ORMdan ham to'g'ridan-to'g'ri foydalanishingiz mumkin, bu yuqoriroq abstraksiya darajasida ishlash imkonini beradi.

Qulaylik uchun Nest TypeORM va Sequelize bilan mos ravishda `@nestjs/typeorm` va `@nestjs/sequelize` paketlari orqali tayyor integratsiyani taqdim etadi; bu bobda shularni ko'rib chiqamiz. Shuningdek, Mongoose bilan `@nestjs/mongoose` integratsiyasi ham mavjud, u bu bobda yoritilgan. Bu integratsiyalar model/repository injection, testlanish imkoniyati va asinxron konfiguratsiya kabi NestJS ga xos qo'shimcha imkoniyatlarni taqdim etadi, bu esa tanlangan bazaga kirishni yanada osonlashtiradi.

### TypeORM integratsiyasi

SQL va NoSQL bazalari bilan integratsiya qilish uchun Nest `@nestjs/typeorm` paketini taqdim etadi. TypeORM TypeScript uchun mavjud eng pishiq Object Relational Mapper (ORM). U TypeScriptda yozilganligi sababli, Nest freymvorki bilan yaxshi integratsiya qilinadi.

Undan foydalanishni boshlash uchun avval kerakli bog'liqliklarni o'rnatamiz. Bu bobda biz mashhur MySQL relatsion DBMS ni ishlatib ko'rsatamiz, ammo TypeORM ko'plab relatsion bazalarni (PostgreSQL, Oracle, Microsoft SQL Server, SQLite) va hatto MongoDB kabi NoSQL bazalarni qo'llab-quvvatlaydi. Bu bobda ko'rsatiladigan tartib TypeORM qo'llab-quvvatlaydigan istalgan baza uchun bir xil bo'ladi. Siz faqat tanlangan bazangizga mos client API kutubxonalarini o'rnatishingiz kerak bo'ladi.

```bash
$ npm install --save @nestjs/typeorm typeorm mysql2
```

O'rnatish jarayoni tugagach, `TypeOrmModule` ni root `AppModule` ga import qilamiz.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

> warning **Warning** `synchronize: true` ni productionda ishlatish tavsiya etilmaydi - aks holda production ma'lumotlarini yo'qotishingiz mumkin.

`forRoot()` metodi TypeORM paketidagi `DataSource` konstruktori taqdim etadigan barcha konfiguratsiya xossalarini qo'llab-quvvatlaydi. Bundan tashqari, quyida tasvirlangan bir nechta qo'shimcha konfiguratsiya xossalari mavjud.

<table>
  <tr>
    <td><code>retryAttempts</code></td>
    <td>Ma'lumotlar bazasiga ulanishga urinishlar soni (default: <code>10</code>)</td>
  </tr>
  <tr>
    <td><code>retryDelay</code></td>
    <td>Ulanishni qayta urinib ko'rishlar orasidagi kechikish (ms) (default: <code>3000</code>)</td>
  </tr>
  <tr>
    <td><code>autoLoadEntities</code></td>
    <td>Agar <code>true</code> bo'lsa, entitylar avtomatik yuklanadi (default: <code>false</code>)</td>
  </tr>
</table>

> info **Hint** Data source opsiyalari haqida batafsil bu yerda o'qing.

Shu ish bajarilgach, TypeORM ning `DataSource` va `EntityManager` obyektlari butun loyiha bo'ylab inject qilish uchun mavjud bo'ladi (hech qanday modul importini talab qilmasdan), masalan:

```typescript
@@filename(app.module)
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
@@switch
import { DataSource } from 'typeorm';

@Dependencies(DataSource)
@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }
}
```

#### Repository pattern

TypeORM **repository design pattern** ni qo'llab-quvvatlaydi, shuning uchun har bir entity o'z repositorysiga ega. Bu repositorylarni ma'lumotlar bazasi data source dan olish mumkin.

Misolni davom ettirish uchun kamida bitta entity kerak. `User` entityni aniqlaymiz.

```typescript
@@filename(user.entity)
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;
}
```

> info **Hint** Entitylar haqida batafsil ma'lumot uchun TypeORM hujjatlari ga qarang.

`User` entity fayli `users` direktoriyasida joylashadi. Bu direktoriyada `UsersModule` ga tegishli barcha fayllar bo'ladi. Model fayllarini qayerda saqlashni o'zingiz tanlashingiz mumkin, ammo ularni mos modul direktoriyasida, o'z **domen** obyektlari yonida saqlashni tavsiya qilamiz.

`User` entitydan foydalanishni boshlash uchun, uni moduldagi `forRoot()` metodi opsiyalaridagi `entities` massiviga qo'shib, TypeORM ga bildirishimiz kerak (agar statik glob path ishlatmasangiz):

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

Endi `UsersModule` ni ko'rib chiqamiz:

```typescript
@@filename(users.module)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

Bu modul `forFeature()` metodidan foydalanib joriy scope da qaysi repositorylar ro'yxatdan o'tkazilishini belgilaydi. Shundan so'ng `@InjectRepository()` dekoratori yordamida `UsersService` ga `UsersRepository` ni inject qilishimiz mumkin:

```typescript
@@filename(users.service)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
@@switch
import { Injectable, Dependencies } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
@Dependencies(getRepositoryToken(User))
export class UsersService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id) {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id) {
    await this.usersRepository.delete(id);
  }
}
```

> warning **Notice** `UsersModule` ni root `AppModule` ga import qilishni unutmang.

Agar `TypeOrmModule.forFeature` import qilgan moduldan tashqarida repositorydan foydalanmoqchi bo'lsangiz, u yaratgan providerlarni qayta eksport qilishingiz kerak.
Buni butun modulni export qilish orqali qilasiz, quyidagicha:

```typescript
@@filename(users.module)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule]
})
export class UsersModule {}
```

Endi `UserHttpModule` da `UsersModule` ni import qilsak, u modul providerlarida `@InjectRepository(User)` dan foydalanishimiz mumkin.

```typescript
@@filename(users-http.module)
import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
```

#### Bog'lanishlar

Bog'lanishlar ikki yoki undan ortiq jadval orasida o'rnatiladigan assotsiatsiyalardir. Bog'lanishlar har bir jadvaldagi umumiy maydonlarga asoslanadi, ko'pincha primary va foreign keylarni o'z ichiga oladi.

Bog'lanishlarning uch turi bor:

<table>
  <tr>
    <td><code>One-to-one</code></td>
    <td>Asosiy jadvaldagi har bir qator foreign jadvaldagi bitta va faqat bitta mos qatorga ega. Bu bog'lanishni aniqlash uchun <code>@OneToOne()</code> dekoratoridan foydalaning.</td>
  </tr>
  <tr>
    <td><code>One-to-many / Many-to-one</code></td>
    <td>Asosiy jadvaldagi har bir qator foreign jadvaldagi bir yoki bir nechta bog'langan qatorga ega. Bu bog'lanishni aniqlash uchun <code>@OneToMany()</code> va <code>@ManyToOne()</code> dekoratorlaridan foydalaning.</td>
  </tr>
  <tr>
    <td><code>Many-to-many</code></td>
    <td>Asosiy jadvaldagi har bir qator foreign jadvaldagi ko'plab bog'langan qatorga ega va foreign jadvaldagi har bir yozuv asosiy jadvaldagi ko'plab bog'langan qatorga ega. Bu bog'lanishni aniqlash uchun <code>@ManyToMany()</code> dekoratoridan foydalaning.</td>
  </tr>
</table>

Entitylarda bog'lanishlarni aniqlash uchun mos **dekoratorlar** dan foydalaning. Masalan, har bir `User` da bir nechta foto bo'lishini ko'rsatish uchun `@OneToMany()` dekoratoridan foydalaning.

```typescript
@@filename(user.entity)
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Photo } from '../photos/photo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}
```

> info **Hint** TypeORM dagi bog'lanishlar haqida batafsil ma'lumot uchun TypeORM hujjatlari ga qarang.

#### Entitylarni avtomatik yuklash

Entitylarni data source opsiyalari ichidagi `entities` massiviga qo'lda qo'shish zerikarli bo'lishi mumkin. Bundan tashqari, root moduldan entitylarga murojaat qilish ilova domen chegaralarini buzadi va implementatsiya tafsilotlari boshqa qismlarga sizib chiqishiga sabab bo'ladi. Bu muammoni hal qilish uchun muqobil yechim mavjud. Entitylarni avtomatik yuklash uchun konfiguratsiya obyektidagi `autoLoadEntities` xossasini (`forRoot()` metodiga uzatiladigan) `true` qilib qo'ying, quyida ko'rsatilgandek:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
```

Bu opsiya berilgach, `forFeature()` metodi orqali ro'yxatdan o'tkazilgan har bir entity avtomatik ravishda konfiguratsiya obyektidagi `entities` massiviga qo'shiladi.

> warning **Warning** Eslatma: `forFeature()` orqali ro'yxatdan o'tkazilmagan, faqat entitydan (bog'lanish orqali) referens qilingan entitylar `autoLoadEntities` sozlamasi orqali qo'shilmaydi.

#### Entity ta'rifini ajratish

Entity va uning ustunlarini dekoratorlar yordamida bevosita model ichida aniqlashingiz mumkin. Ammo ba'zilar entity va uning ustunlarini alohida fayllarda "entity schemas" yordamida belgilashni afzal ko'radi.

```typescript
import { EntitySchema } from 'typeorm';
import { User } from './user.entity';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  relations: {
    photos: {
      type: 'one-to-many',
      target: 'Photo', // the name of the PhotoSchema
    },
  },
});
```

> warning error **Warning** Agar `target` opsiyasini bersangiz, `name` opsiyasi qiymati target klass nomi bilan bir xil bo'lishi kerak.
> Agar `target` bermasangiz, istalgan nomdan foydalanishingiz mumkin.

Nest `Entity` kutiladigan istalgan joyda `EntitySchema` instansiyasidan foydalanishga ruxsat beradi, masalan:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSchema } from './user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

#### TypeORM tranzaksiyalari

Ma'lumotlar bazasi tranzaksiyasi - bu ma'lumotlar bazasi boshqaruv tizimida (DBMS) bajariladigan ish birligi bo'lib, boshqa tranzaksiyalardan mustaqil ravishda izchil va ishonchli tarzda ko'rib chiqiladi. Tranzaksiya odatda bazadagi istalgan o'zgarishni anglatadi (batafsil).

TypeORM tranzaksiyalarini boshqarishning ko'plab strategiyalari mavjud. Biz `QueryRunner` klassidan foydalanishni tavsiya qilamiz, chunki u tranzaksiyani to'liq boshqarish imkonini beradi.

Avval `DataSource` obyektini odatdagi tartibda klassga inject qilishimiz kerak:

```typescript
@Injectable()
export class UsersService {
  constructor(private dataSource: DataSource) {}
}
```

> info **Hint** `DataSource` klassi `typeorm` paketidan import qilinadi.

Endi bu obyekt yordamida tranzaksiya yaratishimiz mumkin.

```typescript
async createMany(users: User[]) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await queryRunner.manager.save(users[0]);
    await queryRunner.manager.save(users[1]);

    await queryRunner.commitTransaction();
  } catch (err) {
    // since we have errors lets rollback the changes we made
    await queryRunner.rollbackTransaction();
  } finally {
    // you need to release a queryRunner which was manually instantiated
    await queryRunner.release();
  }
}
```

> info **Hint** E'tibor bering, `dataSource` faqat `QueryRunner` yaratish uchun ishlatiladi. Biroq bu klassni test qilish uchun butun `DataSource` obyektini (u bir nechta metodlarni ochib beradi) mock qilish kerak bo'ladi. Shu sababli, yordamchi factory klass (masalan, `QueryRunnerFactory`)dan foydalanish va tranzaksiyalarni saqlash uchun kerak bo'ladigan metodlarning cheklangan to'plamiga ega interfeys aniqlashni tavsiya qilamiz. Bu yondashuv bu metodlarni mock qilishni juda osonlashtiradi.

Muqobil ravishda, `DataSource` obyektining `transaction` metodi bilan callback-uslubidan foydalanishingiz mumkin (batafsil o'qing).

```typescript
async createMany(users: User[]) {
  await this.dataSource.transaction(async manager => {
    await manager.save(users[0]);
    await manager.save(users[1]);
  });
}
```

#### Subscriberlar

TypeORM subscriberlari yordamida siz muayyan entity hodisalarini tinglashingiz mumkin.

```typescript
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
```

> error **Warning** Event subscriberlar request-scoped bo'lishi mumkin emas.

Endi `UserSubscriber` klassini `providers` massiviga qo'shing:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserSubscriber],
  controllers: [UsersController],
})
export class UsersModule {}
```

#### Migratsiyalar

Migratsiyalar bazadagi mavjud ma'lumotlarni saqlagan holda, ilovaning ma'lumotlar modeli bilan sxemani sinxron ushlab turish uchun bazani bosqichma-bosqich yangilash imkonini beradi. Migratsiyalarni yaratish, ishga tushirish va qaytarish uchun TypeORM maxsus CLI taqdim etadi.

Migratsiya klasslari Nest ilovasi source kodidan alohida bo'ladi. Ularning hayotiy sikli TypeORM CLI tomonidan boshqariladi. Shu sababli, migratsiyalarda dependency injection va boshqa Nestga xos funksiyalarni ishlata olmaysiz. Migratsiyalar haqida batafsil ma'lumot uchun TypeORM hujjatlaridagi qo'llanmaga qarang.

#### Bir nechta ma'lumotlar bazasi

Ba'zi loyihalar bir nechta ma'lumotlar bazasi ulanishini talab qiladi. Buni ham ushbu modul orqali amalga oshirish mumkin. Bir nechta ulanish bilan ishlash uchun avval ulanishlarni yarating. Bu holatda data source nomlash **majburiy** bo'ladi.

Faraz qilaylik, `Album` entity alohida bazada saqlanadi.

```typescript
const defaultOptions = {
  type: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      entities: [User],
    }),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      entities: [Album],
    }),
  ],
})
export class AppModule {}
```

> warning **Notice** Agar data source uchun `name` o'rnatmasangiz, u `default` deb nomlanadi. E'tibor bering, nomi bo'lmagan yoki bir xil nomdagi bir nechta ulanishlar bo'lmasligi kerak, aks holda ular bir-birini bosib ketadi.

> warning **Notice** Agar `TypeOrmModule.forRootAsync` dan foydalanayotgan bo'lsangiz, data source nomini `useFactory` dan tashqarida **ham** berishingiz kerak. Masalan:
>
> ```typescript
> TypeOrmModule.forRootAsync({
>   name: 'albumsConnection',
>   useFactory: ...,
>   inject: ...,
> }),
> ```
>
> Batafsil ma'lumot uchun bu issue ga qarang.

Bu nuqtada `User` va `Album` entitylari o'z data source lari bilan ro'yxatdan o'tgan bo'ladi. Bu sozlama bilan, `TypeOrmModule.forFeature()` metodi va `@InjectRepository()` dekoratoriga qaysi data source ishlatilishi kerakligini aytishingiz kerak. Agar data source nomini bermasangiz, `default` data source ishlatiladi.

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

Berilgan data source uchun `DataSource` yoki `EntityManager` ni ham inject qilishingiz mumkin:

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectDataSource('albumsConnection')
    private dataSource: DataSource,
    @InjectEntityManager('albumsConnection')
    private entityManager: EntityManager,
  ) {}
}
```

Shuningdek, istalgan `DataSource` ni providerlarga inject qilish ham mumkin:

```typescript
@Module({
  providers: [
    {
      provide: AlbumsService,
      useFactory: (albumsConnection: DataSource) => {
        return new AlbumsService(albumsConnection);
      },
      inject: [getDataSourceToken('albumsConnection')],
    },
  ],
})
export class AlbumsModule {}
```

#### Testlash

Ilovani unit testlashda, odatda, bazaga ulanish qilmaslikni xohlaymiz, bu test to'plamlarini mustaqil qiladi va bajarilishini imkon qadar tez qiladi. Ammo klasslarimiz data source (connection) instansiyasidan olinadigan repositorylarga bog'liq bo'lishi mumkin. Buni qanday hal qilamiz? Yechim - mock repositorylar yaratish. Bunga erishish uchun custom providerlar o'rnatamiz. Har bir ro'yxatdan o'tgan repository avtomatik ravishda `<EntityName>Repository` tokeni bilan ifodalanadi, bu yerda `EntityName` sizning entity klassingiz nomi.

`@nestjs/typeorm` paketi `getRepositoryToken()` funksiyasini taqdim etadi, u berilgan entity asosida tayyor token qaytaradi.

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      useValue: mockRepository,
    },
  ],
})
export class UsersModule {}
```

Endi o'rnini bosuvchi `mockRepository` `UsersRepository` sifatida ishlatiladi. Istalgan klass `@InjectRepository()` dekoratori orqali `UsersRepository` so'rasa, Nest ro'yxatdan o'tgan `mockRepository` obyektidan foydalanadi.

#### Async konfiguratsiya

Repository modul opsiyalarini statik emas, asinxron tarzda uzatishni xohlashingiz mumkin. Bu holatda, asinxron konfiguratsiya bilan ishlashning bir nechta usullarini taqdim etadigan `forRootAsync()` metodidan foydalaning.

Usullardan biri - factory funksiyasidan foydalanish:

```typescript
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    entities: [],
    synchronize: true,
  }),
});
```

Factory funksiyamiz har qanday asinxron provider kabi ishlaydi (masalan, `async` bo'lishi mumkin va `inject` orqali bog'liqliklarni qabul qiladi).

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    entities: [],
    synchronize: true,
  }),
  inject: [ConfigService],
});
```

Muqobil ravishda, `useClass` sintaksisidan foydalanishingiz mumkin:

```typescript
TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
});
```

Yuqoridagi konstruktsiya `TypeOrmConfigService` ni `TypeOrmModule` ichida instansiyalaydi va `createTypeOrmOptions()` metodini chaqirib opsiyalar obyektini taqdim etish uchun foydalanadi. Bu `TypeOrmConfigService` `TypeOrmOptionsFactory` interfeysini implementatsiya qilishi kerakligini anglatadi, quyida ko'rsatilgandek:

```typescript
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    };
  }
}
```

`TypeOrmModule` ichida `TypeOrmConfigService` ni yaratmasdan, boshqa moduldan import qilingan providerni ishlatish uchun `useExisting` sintaksisidan foydalaning.

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

Bu konstruktsiya `useClass` bilan bir xil ishlaydi, lekin bitta muhim farqi bor - `TypeOrmModule` yangi `ConfigService` instansiyasini yaratish o'rniga import qilingan modullardan mavjud `ConfigService` ni qayta ishlatish uchun qidiradi.

> info **Hint** `name` xossasi `useFactory`, `useClass` yoki `useValue` xossalari bilan bir xil darajada aniqlanganiga ishonch hosil qiling. Bu Nestga data source ni mos injection token ostida to'g'ri ro'yxatdan o'tkazishga imkon beradi.

#### Custom DataSource Factory

`useFactory`, `useClass` yoki `useExisting` orqali asinxron konfiguratsiya bilan birga, ixtiyoriy tarzda `dataSourceFactory` funksiyasini ko'rsatishingiz mumkin, bu sizga `TypeOrmModule` data source ni yaratishiga yo'l qo'ymay, o'zingizning TypeORM data source ni taqdim etishga imkon beradi.

`dataSourceFactory` asinxron konfiguratsiyada `useFactory`, `useClass` yoki `useExisting` orqali sozlangan TypeORM `DataSourceOptions` ni qabul qiladi va TypeORM `DataSource` ni `Promise` sifatida qaytaradi.

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  // Use useFactory, useClass, or useExisting
  // to configure the DataSourceOptions.
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    entities: [],
    synchronize: true,
  }),
  // dataSource receives the configured DataSourceOptions
  // and returns a Promise<DataSource>.
  dataSourceFactory: async (options) => {
    const dataSource = await new DataSource(options).initialize();
    return dataSource;
  },
});
```

> info **Hint** `DataSource` klassi `typeorm` paketidan import qilinadi.

#### Misol

Ishlaydigan misol bu yerda mavjud.

### Sequelize integratsiyasi

TypeORM ga muqobil sifatida `@nestjs/sequelize` paketi bilan Sequelize ORM dan foydalanishingiz mumkin. Bundan tashqari, entitylarni deklarativ tarzda aniqlash uchun qo'shimcha dekoratorlar to'plamini taqdim etadigan sequelize-typescript paketidan foydalanamiz.

Undan foydalanishni boshlash uchun avval kerakli bog'liqliklarni o'rnatamiz. Bu bobda mashhur MySQL relatsion DBMS ni ishlatib ko'rsatamiz, ammo Sequelize PostgreSQL, MySQL, Microsoft SQL Server, SQLite va MariaDB kabi ko'plab relatsion bazalarni qo'llab-quvvatlaydi. Bu bobda ko'rsatiladigan tartib Sequelize qo'llab-quvvatlaydigan istalgan baza uchun bir xil bo'ladi. Siz faqat tanlangan bazangizga mos client API kutubxonalarini o'rnatishingiz kerak bo'ladi.

```bash
$ npm install --save @nestjs/sequelize sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

O'rnatish jarayoni tugagach, `SequelizeModule` ni root `AppModule` ga import qilamiz.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    }),
  ],
})
export class AppModule {}
```

`forRoot()` metodi Sequelize konstruktori taqdim etadigan barcha konfiguratsiya xossalarini qo'llab-quvvatlaydi (batafsil). Bundan tashqari, quyida tasvirlangan bir nechta qo'shimcha konfiguratsiya xossalari mavjud.

<table>
  <tr>
    <td><code>retryAttempts</code></td>
    <td>Ma'lumotlar bazasiga ulanishga urinishlar soni (default: <code>10</code>)</td>
  </tr>
  <tr>
    <td><code>retryDelay</code></td>
    <td>Ulanishni qayta urinib ko'rishlar orasidagi kechikish (ms) (default: <code>3000</code>)</td>
  </tr>
  <tr>
    <td><code>autoLoadModels</code></td>
    <td>Agar <code>true</code> bo'lsa, modellar avtomatik yuklanadi (default: <code>false</code>)</td>
  </tr>
  <tr>
    <td><code>keepConnectionAlive</code></td>
    <td>Agar <code>true</code> bo'lsa, ilova o'chirilganda ulanish yopilmaydi (default: <code>false</code>)</td>
  </tr>
  <tr>
    <td><code>synchronize</code></td>
    <td>Agar <code>true</code> bo'lsa, avtomatik yuklangan modellar sinxronlashtiriladi (default: <code>true</code>)</td>
  </tr>
</table>

Shu ish bajarilgach, `Sequelize` obyektini butun loyiha bo'ylab inject qilish mumkin bo'ladi (hech qanday modul importini talab qilmasdan), masalan:

```typescript
@@filename(app.service)
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AppService {
  constructor(private sequelize: Sequelize) {}
}
@@switch
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Dependencies(Sequelize)
@Injectable()
export class AppService {
  constructor(sequelize) {
    this.sequelize = sequelize;
  }
}
```

#### Modellar

Sequelize Active Record patternini implementatsiya qiladi. Bu pattern bilan siz model klasslarini bevosita ishlatib, bazaga murojaat qilasiz. Misolni davom ettirish uchun kamida bitta model kerak. `User` modelini aniqlaymiz.

```typescript
@@filename(user.model)
import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;
}
```

> info **Hint** Mavjud dekoratorlar haqida batafsil bu yerda o'qing.

`User` model fayli `users` direktoriyasida joylashadi. Bu direktoriyada `UsersModule` ga tegishli barcha fayllar bo'ladi. Model fayllarini qayerda saqlashni o'zingiz tanlashingiz mumkin, ammo ularni mos modul direktoriyasida, o'z **domen** obyektlari yonida saqlashni tavsiya qilamiz.

`User` modelidan foydalanishni boshlash uchun, uni moduldagi `forRoot()` metodi opsiyalaridagi `models` massiviga qo'shib, Sequelize ga bildirishimiz kerak:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/user.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [User],
    }),
  ],
})
export class AppModule {}
```

Endi `UsersModule` ni ko'rib chiqamiz:

```typescript
@@filename(users.module)
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

Bu modul `forFeature()` metodidan foydalanib joriy scope da qaysi modellar ro'yxatdan o'tkazilishini belgilaydi. Shundan so'ng `@InjectModel()` dekoratori yordamida `UsersService` ga `UserModel` ni inject qilishimiz mumkin:

```typescript
@@filename(users.service)
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}
@@switch
import { Injectable, Dependencies } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
@Dependencies(getModelToken(User))
export class UsersService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  async findAll() {
    return this.userModel.findAll();
  }

  findOne(id) {
    return this.userModel.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id) {
    const user = await this.findOne(id);
    await user.destroy();
  }
}
```

> warning **Notice** `UsersModule` ni root `AppModule` ga import qilishni unutmang.

Agar `SequelizeModule.forFeature` import qilgan moduldan tashqarida modeldan foydalanmoqchi bo'lsangiz, u yaratgan providerlarni qayta eksport qilishingiz kerak.
Buni butun modulni export qilish orqali qilasiz, quyidagicha:

```typescript
@@filename(users.module)
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.entity';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [SequelizeModule]
})
export class UsersModule {}
```

Endi `UserHttpModule` da `UsersModule` ni import qilsak, u modul providerlarida `@InjectModel(User)` dan foydalanishimiz mumkin.

```typescript
@@filename(users-http.module)
import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
```

#### Bog'lanishlar

Bog'lanishlar ikki yoki undan ortiq jadval orasida o'rnatiladigan assotsiatsiyalardir. Bog'lanishlar har bir jadvaldagi umumiy maydonlarga asoslanadi, ko'pincha primary va foreign keylarni o'z ichiga oladi.

Bog'lanishlarning uch turi bor:

<table>
  <tr>
    <td><code>One-to-one</code></td>
    <td>Asosiy jadvaldagi har bir qator foreign jadvaldagi bitta va faqat bitta mos qatorga ega</td>
  </tr>
  <tr>
    <td><code>One-to-many / Many-to-one</code></td>
    <td>Asosiy jadvaldagi har bir qator foreign jadvaldagi bir yoki bir nechta bog'langan qatorga ega</td>
  </tr>
  <tr>
    <td><code>Many-to-many</code></td>
    <td>Asosiy jadvaldagi har bir qator foreign jadvaldagi ko'plab bog'langan qatorga ega, va foreign jadvaldagi har bir yozuv asosiy jadvaldagi ko'plab bog'langan qatorga ega</td>
  </tr>
</table>

Modellarda bog'lanishlarni aniqlash uchun mos **dekoratorlar** dan foydalaning. Masalan, har bir `User` da bir nechta foto bo'lishini ko'rsatish uchun `@HasMany()` dekoratoridan foydalaning.

```typescript
@@filename(user.model)
import { Column, Model, Table, HasMany } from 'sequelize-typescript';
import { Photo } from '../photos/photo.model';

@Table
export class User extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasMany(() => Photo)
  photos: Photo[];
}
```

> info **Hint** Sequelize dagi assotsiatsiyalar haqida batafsil shu bobda o'qing.

#### Modellarni avtomatik yuklash

Modellarni ulanish opsiyalaridagi `models` massiviga qo'lda qo'shish zerikarli bo'lishi mumkin. Bundan tashqari, root moduldan modellarga murojaat qilish ilova domen chegaralarini buzadi va implementatsiya tafsilotlari boshqa qismlarga sizib chiqishiga sabab bo'ladi. Bu muammoni hal qilish uchun `forRoot()` metodiga uzatiladigan konfiguratsiya obyektida `autoLoadModels` va `synchronize` xossalarini `true` qilib, modellarni avtomatik yuklang, quyida ko'rsatilgandek:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...
      autoLoadModels: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

Bu opsiya berilgach, `forFeature()` metodi orqali ro'yxatdan o'tkazilgan har bir model avtomatik ravishda konfiguratsiya obyektidagi `models` massiviga qo'shiladi.

> warning **Warning** Eslatma: `forFeature()` orqali ro'yxatdan o'tkazilmagan, faqat modeldan (assotsiatsiya orqali) referens qilingan modellar qo'shilmaydi.

#### Sequelize tranzaksiyalari

Ma'lumotlar bazasi tranzaksiyasi - bu ma'lumotlar bazasi boshqaruv tizimida (DBMS) bajariladigan ish birligi bo'lib, boshqa tranzaksiyalardan mustaqil ravishda izchil va ishonchli tarzda ko'rib chiqiladi. Tranzaksiya odatda bazadagi istalgan o'zgarishni anglatadi (batafsil).

Sequelize tranzaksiyalarini boshqarishning ko'plab strategiyalari mavjud. Quyida boshqariladigan tranzaksiyaning (auto-callback) namuna implementatsiyasi keltirilgan.

Avval `Sequelize` obyektini odatdagi tartibda klassga inject qilishimiz kerak:

```typescript
@Injectable()
export class UsersService {
  constructor(private sequelize: Sequelize) {}
}
```

> info **Hint** `Sequelize` klassi `sequelize-typescript` paketidan import qilinadi.

Endi bu obyekt yordamida tranzaksiya yaratishimiz mumkin.

```typescript
async createMany() {
  try {
    await this.sequelize.transaction(async t => {
      const transactionHost = { transaction: t };

      await this.userModel.create(
          { firstName: 'Abraham', lastName: 'Lincoln' },
          transactionHost,
      );
      await this.userModel.create(
          { firstName: 'John', lastName: 'Boothe' },
          transactionHost,
      );
    });
  } catch (err) {
    // Transaction has been rolled back
    // err is whatever rejected the promise chain returned to the transaction callback
  }
}
```

> info **Hint** E'tibor bering, `Sequelize` instansiyasi faqat tranzaksiyani boshlash uchun ishlatiladi. Biroq bu klassni test qilish uchun butun `Sequelize` obyektini (u bir nechta metodlarni ochib beradi) mock qilish kerak bo'ladi. Shu sababli, yordamchi factory klass (masalan, `TransactionRunner`)dan foydalanish va tranzaksiyalarni saqlash uchun kerak bo'ladigan metodlarning cheklangan to'plamiga ega interfeys aniqlashni tavsiya qilamiz. Bu yondashuv bu metodlarni mock qilishni juda osonlashtiradi.

#### Migratsiyalar

Migratsiyalar bazadagi mavjud ma'lumotlarni saqlagan holda, ilovaning ma'lumotlar modeli bilan sxemani sinxron ushlab turish uchun bazani bosqichma-bosqich yangilash imkonini beradi. Migratsiyalarni yaratish, ishga tushirish va qaytarish uchun Sequelize maxsus CLI taqdim etadi.

Migratsiya klasslari Nest ilovasi source kodidan alohida bo'ladi. Ularning hayotiy sikli Sequelize CLI tomonidan boshqariladi. Shu sababli, migratsiyalarda dependency injection va boshqa Nestga xos funksiyalarni ishlata olmaysiz. Migratsiyalar haqida batafsil ma'lumot uchun Sequelize hujjatlaridagi qo'llanmaga qarang.

#### Bir nechta ma'lumotlar bazasi

Ba'zi loyihalar bir nechta ma'lumotlar bazasi ulanishini talab qiladi. Buni ham ushbu modul orqali amalga oshirish mumkin. Bir nechta ulanish bilan ishlash uchun avval ulanishlarni yarating. Bu holatda ulanishlarni nomlash **majburiy** bo'ladi.

Faraz qilaylik, `Album` entity alohida bazada saqlanadi.

```typescript
const defaultOptions = {
  dialect: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      models: [User],
    }),
    SequelizeModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      models: [Album],
    }),
  ],
})
export class AppModule {}
```

> warning **Notice** Agar ulanish uchun `name` o'rnatmasangiz, u `default` deb nomlanadi. E'tibor bering, nomi bo'lmagan yoki bir xil nomdagi bir nechta ulanishlar bo'lmasligi kerak, aks holda ular bir-birini bosib ketadi.

Bu nuqtada `User` va `Album` modellar o'z ulanishlari bilan ro'yxatdan o'tgan bo'ladi. Bu sozlama bilan, `SequelizeModule.forFeature()` metodi va `@InjectModel()` dekoratoriga qaysi ulanish ishlatilishi kerakligini aytishingiz kerak. Agar ulanish nomini bermasangiz, `default` ulanish ishlatiladi.

```typescript
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    SequelizeModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

Berilgan ulanish uchun `Sequelize` instansiyasini ham inject qilishingiz mumkin:

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectConnection('albumsConnection')
    private sequelize: Sequelize,
  ) {}
}
```

Shuningdek, istalgan `Sequelize` instansiyasini providerlarga inject qilish ham mumkin:

```typescript
@Module({
  providers: [
    {
      provide: AlbumsService,
      useFactory: (albumsSequelize: Sequelize) => {
        return new AlbumsService(albumsSequelize);
      },
      inject: [getDataSourceToken('albumsConnection')],
    },
  ],
})
export class AlbumsModule {}
```

#### Testlash

Ilovani unit testlashda, odatda, bazaga ulanish qilmaslikni xohlaymiz, bu test to'plamlarini mustaqil qiladi va bajarilishini imkon qadar tez qiladi. Ammo klasslarimiz ulanish instansiyasidan olinadigan modellarga bog'liq bo'lishi mumkin. Buni qanday hal qilamiz? Yechim - mock modellar yaratish. Bunga erishish uchun custom providerlar o'rnatamiz. Har bir ro'yxatdan o'tgan model avtomatik ravishda `<ModelName>Model` tokeni bilan ifodalanadi, bu yerda `ModelName` sizning model klassingiz nomi.

`@nestjs/sequelize` paketi berilgan model asosida tayyor token qaytaradigan `getModelToken()` funksiyasini taqdim etadi.

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getModelToken(User),
      useValue: mockModel,
    },
  ],
})
export class UsersModule {}
```

Endi o'rnini bosuvchi `mockModel` `UserModel` sifatida ishlatiladi. Istalgan klass `@InjectModel()` dekoratori orqali `UserModel` so'rasa, Nest ro'yxatdan o'tgan `mockModel` obyektidan foydalanadi.

#### Async konfiguratsiya

`SequelizeModule` opsiyalarini statik emas, asinxron tarzda uzatishni xohlashingiz mumkin. Bu holatda, asinxron konfiguratsiya bilan ishlashning bir nechta usullarini taqdim etadigan `forRootAsync()` metodidan foydalaning.

Usullardan biri - factory funksiyasidan foydalanish:

```typescript
SequelizeModule.forRootAsync({
  useFactory: () => ({
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    models: [],
  }),
});
```

Factory funksiyamiz har qanday asinxron provider kabi ishlaydi (masalan, `async` bo'lishi mumkin va `inject` orqali bog'liqliklarni qabul qiladi).

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    dialect: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    models: [],
  }),
  inject: [ConfigService],
});
```

Muqobil ravishda, `useClass` sintaksisidan foydalanishingiz mumkin:

```typescript
SequelizeModule.forRootAsync({
  useClass: SequelizeConfigService,
});
```

Yuqoridagi konstruktsiya `SequelizeConfigService` ni `SequelizeModule` ichida instansiyalaydi va `createSequelizeOptions()` metodini chaqirib opsiyalar obyektini taqdim etish uchun foydalanadi. Bu `SequelizeConfigService` `SequelizeOptionsFactory` interfeysini implementatsiya qilishi kerakligini anglatadi, quyida ko'rsatilgandek:

```typescript
@Injectable()
class SequelizeConfigService implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    };
  }
}
```

`SequelizeModule` ichida `SequelizeConfigService` ni yaratmasdan, boshqa moduldan import qilingan providerni ishlatish uchun `useExisting` sintaksisidan foydalaning.

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

Bu konstruktsiya `useClass` bilan bir xil ishlaydi, lekin bitta muhim farqi bor - `SequelizeModule` yangi `ConfigService` instansiyasini yaratish o'rniga import qilingan modullardan mavjud `ConfigService` ni qayta ishlatish uchun qidiradi.

#### Misol

Ishlaydigan misol bu yerda mavjud.
