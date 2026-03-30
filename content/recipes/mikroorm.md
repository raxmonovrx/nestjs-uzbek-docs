---
title: "MikroORM"
navTitle: "MikroORM"
description: "Bu retsept foydalanuvchilarga Nest ichida MikroORM bilan ishlashni boshlashga yordam beradi. MikroORM Data Mapper, Unit of Work va Identity Map patternlariga asoslangan, Node.js uc"
order: 6
group: recipes
groupTitle: "Recipes"
---
Bu retsept foydalanuvchilarga Nest ichida MikroORM bilan ishlashni boshlashga yordam beradi. MikroORM Data Mapper, Unit of Work va Identity Map patternlariga asoslangan, Node.js uchun TypeScript ORM. U TypeORM ga yaxshi muqobil bo'lib, TypeORM dan migratsiya qilish ancha oson bo'lishi kerak. MikroORM ning to'liq hujjatlarini bu yerda topishingiz mumkin.

> info **info** `@mikro-orm/nestjs` uchinchi tomon paketi bo'lib, NestJS core jamoasi tomonidan boshqarilmaydi. Kutubxona bilan bog'liq muammolarni tegishli repoda xabar bering.

#### O'rnatish

MikroORM ni Nest ga integratsiya qilishning eng oson yo'li `@mikro-orm/nestjs` moduli orqali.
Uni Nest, MikroORM va drayver bilan birga o'rnating:

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite
```

MikroORM `postgres`, `sqlite` va `mongo` ni ham qo'llab-quvvatlaydi. Barcha drayverlar uchun rasmiy hujjat ga qarang.

O'rnatish yakunlangach, `MikroOrmModule` ni ildiz `AppModule` ga import qilishimiz mumkin.

```typescript
import { SqliteDriver } from '@mikro-orm/sqlite';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: ['./dist/entities'],
      entitiesTs: ['./src/entities'],
      dbName: 'my-db-name.sqlite3',
      driver: SqliteDriver,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

`forRoot()` metodi MikroORM paketidagi `init()` dagi kabi konfiguratsiya obyektini qabul qiladi. To'liq konfiguratsiya hujjati uchun ushbu sahifa ga qarang.

Boshqa variant sifatida, `mikro-orm.config.ts` konfiguratsiya faylini yaratib, `forRoot()` ni argumentlarsiz chaqirib CLI ni sozlashimiz mumkin.

```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot(),
  ],
  ...
})
export class AppModule {}
```

Lekin tree shaking ishlatadigan build vositalarida bu ishlamaydi, bunday holatda konfiguratsiyani aniq ko'rsatgan ma'qul:

```typescript
import config from './mikro-orm.config'; // your ORM config

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
  ],
  ...
})
export class AppModule {}
```

Shundan so'ng `EntityManager` butun loyiha bo'ylab inject qilish uchun mavjud bo'ladi (boshqa joyda modul import qilmasdan).

```ts
// Import everything from your driver package or `@mikro-orm/knex`
import { EntityManager, MikroORM } from '@mikro-orm/sqlite';

@Injectable()
export class MyService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}
}
```

> info **info** `EntityManager` `@mikro-orm/driver` paketidan import qilinishiga e'tibor bering, bu yerda drayver `mysql`, `sqlite`, `postgres` yoki foydalanayotgan drayveringiz. Agar qaramlik sifatida `@mikro-orm/knex` o'rnatilgan bo'lsa, `EntityManager` ni o'sha yerdan ham import qilishingiz mumkin.

#### Repositorylar

MikroORM repository dizayn patternini qo'llab-quvvatlaydi. Har bir entitet uchun repository yaratishimiz mumkin. Repositorylar bo'yicha to'liq hujjatni bu yerda o'qing. Joriy scope da qaysi repositorylar ro'yxatdan o'tishi kerakligini `forFeature()` metodi orqali belgilashingiz mumkin. Masalan:

> info **info** Bazaviy entitetlarni `forFeature()` orqali ro'yxatdan o'tkazmang, chunki ular uchun repositorylar yo'q. Biroq, bazaviy entitetlar `forRoot()` dagi ro'yxatning (yoki umumiy ORM konfiguratsiyasining) bir qismi bo'lishi kerak.

```typescript
// photo.module.ts
@Module({
  imports: [MikroOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```

and import it into the root `AppModule`:

```typescript
// app.module.ts
@Module({
  imports: [MikroOrmModule.forRoot(...), PhotoModule],
})
export class AppModule {}
```

Shu tarzda `PhotoRepository` ni `PhotoService` ga `@InjectRepository()` dekoratori yordamida inject qilishimiz mumkin:

```typescript
@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: EntityRepository<Photo>,
  ) {}
}
```

#### Custom repositorylardan foydalanish

Custom repositorylardan foydalanganda `@InjectRepository()` dekoratori endi kerak emas, chunki Nest DI klassga havola asosida resolve qiladi.

```ts
// `**./author.entity.ts**`
@Entity({ repository: () => AuthorRepository })
export class Author {
  // to allow inference in `em.getRepository()`
  [EntityRepositoryType]?: AuthorRepository;
}

// `**./author.repository.ts**`
export class AuthorRepository extends EntityRepository<Author> {
  // your custom methods...
}
```

Custom repository nomi `getRepositoryToken()` qaytaradigan nom bilan bir xil bo'lgani uchun `@InjectRepository()` dekoratori endi kerak emas:

```ts
@Injectable()
export class MyService {
  constructor(private readonly repo: AuthorRepository) {}
}
```

#### Entitetlarni avtomatik yuklash

Entitetlarni qo'lda connection parametrlaridagi entities massiviga qo'shish zerikarli bo'lishi mumkin. Bundan tashqari, entitetlarga ildiz moduli orqali murojaat qilish ilova domen chegaralarini buzadi va implementatsiya tafsilotlarining boshqa qismlarga sizib chiqishiga sabab bo'ladi. Bu muammoni hal qilish uchun statik glob yo'llardan foydalanish mumkin.

Ammo glob yo'llar webpack tomonidan qo'llab-quvvatlanmasligini unutmang, shuning uchun monorepo ichida ilova qurayotgan bo'lsangiz, ulardan foydalana olmaysiz. Bu muammoni hal qilish uchun alternativ yechim taqdim etilgan. Entitetlarni avtomatik yuklash uchun konfiguratsiya obyektining (`forRoot()` metodiga uzatiladigan) `autoLoadEntities` xususiyatini `true` ga o'rnating:

```ts
@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
```

Bu parametr ko'rsatilgan bo'lsa, `forFeature()` orqali ro'yxatdan o'tkazilgan har bir entitet konfiguratsiya obyektidagi entities massiviga avtomatik qo'shiladi.

> info **info** `forFeature()` orqali ro'yxatdan o'tkazilmagan, lekin entitetdan (aloqa orqali) murojaat qilinadigan entitetlar `autoLoadEntities` yordamida kiritilmaydi.

> info **info** `autoLoadEntities` MikroORM CLI ga ham ta'sir qilmaydi - u yerda ham entitetlarning to'liq ro'yxati ko'rsatilgan CLI konfiguratsiyasi kerak. Boshqa tomondan, u yerda globlardan foydalanishimiz mumkin, chunki CLI webpackdan o'tmaydi.

#### Serialization

> warning **Note** MikroORM har bir entitet aloqasini yaxshiroq type-safety uchun `Reference<T>` yoki `Collection<T>` obyektiga o'rab beradi. Bu [Nest'ning o'rnatilgan serializerini](/docs/techniques/serialization) o'ralgan aloqalardan bexabar qiladi. Boshqacha aytganda, HTTP yoki WebSocket handlerlaridan MikroORM entitetlarini qaytarsangiz, ularning barcha aloqalari serializatsiya qilinmaydi.

Yaxshiyamki, MikroORM `ClassSerializerInterceptor` o'rniga ishlatish mumkin bo'lgan serialization API ni taqdim etadi.

```typescript
@Entity()
export class Book {
  @Property({ hidden: true }) // Equivalent of class-transformer's `@Exclude`
  hiddenField = Date.now();

  @Property({ persist: false }) // Similar to class-transformer's `@Expose()`. Will only exist in memory, and will be serialized.
  count?: number;

  @ManyToOne({
    serializer: (value) => value.name,
    serializedName: 'authorName',
  }) // Equivalent of class-transformer's `@Transform()`
  author: Author;
}
```

#### Queue larda request scope handlerlar

Hujjatda aytilganidek, har bir so'rov uchun toza holat kerak. Bu middleware orqali ro'yxatdan o'tgan `RequestContext` yordamchisi tufayli avtomatik boshqariladi.

Lekin middleware lar faqat odatiy HTTP so'rovlarini bajaradi, agar shundan tashqarida request scope metod kerak bo'lsa-chi? Masalan, queue handlerlari yoki rejalashtirilgan vazifalar.

`@CreateRequestContext()` dekoratoridan foydalanishimiz mumkin. Avval `MikroORM` nusxasini joriy kontekstga inject qilishingiz kerak bo'ladi, u siz uchun kontekst yaratishda ishlatiladi. Dekorator parda ortida yangi request kontekstni ro'yxatdan o'tkazadi va metodni shu kontekst ichida bajaradi.

```ts
@Injectable()
export class MyService {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async doSomething() {
    // this will be executed in a separate context
  }
}
```

> warning **Note** Nomidan ko'rinib turibdiki, bu dekorator har doim yangi kontekst yaratadi; uning alternativasi `@EnsureRequestContext` esa faqat boshqa kontekst ichida bo'lmagandagina yaratadi.

#### Testlash

`@mikro-orm/nestjs` paketi repositoryni mock qilish uchun berilgan entitet asosida tayyor token qaytaruvchi `getRepositoryToken()` funksiyasini ochib beradi.

```typescript
@Module({
  providers: [
    PhotoService,
    {
      // or when you have a custom repository: `provide: PhotoRepository`
      provide: getRepositoryToken(Photo),
      useValue: mockedRepository,
    },
  ],
})
export class PhotoModule {}
```

#### Misol

NestJS va MikroORM bilan real loyiha misolini bu yerda topishingiz mumkin.
