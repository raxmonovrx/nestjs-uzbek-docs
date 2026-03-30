---
title: "Avtorizatsiya"
navTitle: "Avtorizatsiya"
description: "Avtorizatsiya foydalanuvchi nima qila olishini aniqlovchi jarayon. Masalan, administrator foydalanuvchi postlarni yaratish, tahrirlash va o'chirish huquqiga ega. Administrator bo'l"
order: 2
group: security
groupTitle: "Security"
---
**Avtorizatsiya** foydalanuvchi nima qila olishini aniqlovchi jarayon. Masalan, administrator foydalanuvchi postlarni yaratish, tahrirlash va o'chirish huquqiga ega. Administrator bo'lmagan foydalanuvchi esa postlarni faqat o'qishi mumkin.

Avtorizatsiya autentifikatsiyadan mustaqil va ortogonal. Biroq, avtorizatsiya autentifikatsiya mexanizmini talab qiladi.

Avtorizatsiyani boshqarish uchun turli yondashuv va strategiyalar mavjud. Har bir loyiha uchun yondashuv uning aniq ilova talablariga bog'liq. Bu bob turli talablar uchun moslashtirilishi mumkin bo'lgan avtorizatsiya yondashuvlarini taqdim etadi.

#### Oddiy RBAC implementatsiyasi

Role-based access control (**RBAC**) - rollar va imtiyozlar atrofida aniqlangan, siyosatdan mustaqil access-control mexanizmi. Bu bo'limda Nest [guards](/docs/core/guards) yordamida juda oddiy RBAC mexanizmini qanday implementatsiya qilishni ko'rsatamiz.

Avval tizimdagi rollarni ifodalovchi `Role` enumni yaratamiz:

```typescript
@@filename(role.enum)
export enum Role {
  User = 'user',
  Admin = 'admin',
}
```

> info **Hint** Murakkabroq tizimlarda rollarni bazada saqlashingiz yoki tashqi autentifikatsiya provayderidan olishingiz mumkin.

Shu bilan, `@Roles()` dekoratorini yaratamiz. Bu dekorator muayyan resurslarga kirish uchun qaysi rollar talab qilinishini ko'rsatishga imkon beradi.

```typescript
@@filename(roles.decorator)
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
@@switch
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);
```

Endi custom `@Roles()` dekoratorimiz bor, uni istalgan route handlerni bezash uchun ishlata olamiz.

```typescript
@@filename(cats.controller)
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@Roles(Role.Admin)
@Bind(Body())
create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

Nihoyat, `RolesGuard` klassini yaratamiz. U joriy foydalanuvchiga biriktirilgan rollarni joriy so'rov qayta ishlanayotgan route talab qiladigan rollar bilan solishtiradi. Route rollariga (custom metadata) kirish uchun framework tomonidan tayyor taqdim etiladigan va `@nestjs/core` paketidan eksport qilinadigan `Reflector` helper klassidan foydalanamiz.

```typescript
@@filename(roles.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
@@switch
import { Injectable, Dependencies } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
@Dependencies(Reflector)
export class RolesGuard {
  constructor(reflector) {
    this.reflector = reflector;
  }

  canActivate(context) {
    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

> info **Hint** `Reflector`dan kontekstga bog'liq tarzda foydalanish haqida batafsil ma'lumot uchun Execution context bobidagi [Reflection and metadata](/docs/fundamentals/execution-context#reflection-and-metadata) bo'limiga qarang.

> warning **Notice** Bu misol "**oddiy**" deb nomlangan, chunki biz faqat route handler darajasida rollar mavjudligini tekshiramiz. Haqiqiy ilovalarda bir nechta operatsiyalarni o'z ichiga oladigan endpoint/handlerlar bo'lishi mumkin va ularning har biri ma'lum ruxsatlar to'plamini talab qiladi. Bunday holatda siz biznes mantiqingiz ichida rollarni tekshirish mexanizmini taqdim etishingiz kerak bo'ladi, bu esa markaziy tarzda qaysi amallar qaysi ruxsatlar bilan bog'lanishini saqlashni biroz qiyinlashtiradi.

Bu misolda `request.user` foydalanuvchi instansiyasi va ruxsat etilgan rollarni (`roles` xossasi ostida) o'z ichiga oladi deb taxmin qildik. Ilovangizda bu bog'lanishni odatda custom **autentifikatsiya guard** ichida yaratasiz - batafsil ma'lumot uchun [authentication](/docs/security/authentication) bobiga qarang.

Ushbu misol ishlashi uchun `User` klassingiz quyidagicha bo'lishi kerak:

```typescript
class User {
  // ...other properties
  roles: Role[];
}
```

Oxirida `RolesGuard` ni ro'yxatdan o'tkazing, masalan, controller darajasida yoki global tarzda:

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],
```

Imtiyozlari yetarli bo'lmagan foydalanuvchi endpointga murojaat qilganda, Nest avtomatik ravishda quyidagi javobni qaytaradi:

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

> info **Hint** Agar boshqacha xato javobi qaytarishni xohlasangiz, boolean qiymat qaytarish o'rniga o'zingizning aniq istisnoingizni tashlang.

#### Claims-based avtorizatsiya

Shaxs (identity) yaratilganda, unga ishonchli tomon tomonidan bir yoki bir nechta claim berilishi mumkin. Claim - bu subyekt nima qila olishini ifodalovchi name-value juftligi, subyektning kimligi emas.

Nestda claims-based avtorizatsiyani implementatsiya qilish uchun yuqorida [RBAC](/docs/security/authorization#basic-rbac-implementation) bo'limida ko'rsatgan qadamlarni bir muhim farq bilan takrorlaysiz: aniq rollarni tekshirish o'rniga **permissions** ni solishtirasiz. Har bir foydalanuvchida ruxsatlar to'plami bo'ladi. Shuningdek, har bir resurs/endpoint kirish uchun qanday ruxsatlar kerakligini belgilaydi (masalan, maxsus `@RequirePermissions()` dekoratori orqali).

```typescript
@@filename(cats.controller)
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@RequirePermissions(Permission.CREATE_CAT)
@Bind(Body())
create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

> info **Hint** Yuqoridagi misolda `Permission` (RBAC bo'limida ko'rsatgan `Role` ga o'xshash) tizimingizda mavjud barcha ruxsatlarni o'z ichiga oladigan TypeScript enum.

#### CASL integratsiyasi

CASL - bu berilgan klient qaysi resurslarga kira olishini cheklaydigan isomorphic avtorizatsiya kutubxonasi. U bosqichma-bosqich joriy etishga moslashtirilgan va oddiy claim based modeldan to'liq funksional subject va attribute based avtorizatsiyagacha oson masshtablanadi.

Boshlash uchun avval `@casl/ability` paketini o'rnating:

```bash
$ npm i @casl/ability
```

> info **Hint** Bu misolda biz CASLni tanladik, lekin xohishingiz va loyiha ehtiyojlaringizga qarab `accesscontrol` yoki `acl` kabi boshqa kutubxonadan ham foydalanishingiz mumkin.

O'rnatish tugagach, CASL mexanikasini ko'rsatish uchun ikki entity klassini aniqlaymiz: `User` va `Article`.

```typescript
class User {
  id: number;
  isAdmin: boolean;
}
```

`User` klassi ikki xossadan iborat: noyob foydalanuvchi identifikatori bo'lgan `id` va foydalanuvchi administrator imtiyozlariga ega ekanini bildiradigan `isAdmin`.

```typescript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}
```

`Article` klassi uchta xossaga ega: `id` - noyob maqola identifikatori, `isPublished` - maqola chop etilgan yoki yo'qligini bildiradi, va `authorId` - maqolani yozgan foydalanuvchi ID si.

Endi ushbu misol uchun talablarimizni ko'rib chiqamiz va aniqlashtiramiz:

- Adminlar barcha entitylarni boshqara oladi (create/read/update/delete)
- Foydalanuvchilar hamma narsaga faqat o'qish huquqiga ega
- Foydalanuvchilar o'z maqolalarini yangilay oladi (`article.authorId === userId`)
- Allaqachon chop etilgan maqolalar o'chirilmaydi (`article.isPublished === true`)

Shu asosda, foydalanuvchilar entitylar bilan bajarishi mumkin bo'lgan barcha harakatlarni ifodalovchi `Action` enumini yaratamiz:

```typescript
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
```

> warning **Notice** `manage` CASLdagi maxsus keyword bo'lib, "har qanday amal" degan ma'noni anglatadi.

CASL kutubxonasini kapsullash uchun, `CaslModule` va `CaslAbilityFactory` ni generatsiya qilamiz.

```bash
$ nest g module casl
$ nest g class casl/casl-ability.factory
```

Shu bilan, `CaslAbilityFactory` ichida `createForUser()` metodini aniqlaymiz. Bu metod berilgan foydalanuvchi uchun `Ability` obyektini yaratadi:

```typescript
type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.isAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.Update, Article, { authorId: user.id });
    cannot(Action.Delete, Article, { isPublished: true });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
```

> warning **Notice** `all` CASLdagi maxsus keyword bo'lib, "istalgan subject"ni anglatadi.

> info **Hint** CASL v6 dan boshlab, `MongoAbility` MongoDBga o'xshash sintaksisdagi shartlarga asoslangan ruxsatlarni yaxshiroq qo'llab-quvvatlash uchun legacy `Ability` ni almashtirib, default ability klassi bo'lib xizmat qiladi. Nomiga qaramay, u MongoDBga bog'lanmagan - u obyektlarni Mongo uslubidagi shartlar bilan solishtirish orqali har qanday ma'lumot bilan ishlaydi.

> info **Hint** `MongoAbility`, `AbilityBuilder`, `AbilityClass`, va `ExtractSubjectType` klasslari `@casl/ability` paketidan eksport qilinadi.

> info **Hint** `detectSubjectType` opsiyasi CASLga obyektning subject tipini qanday olishni tushunishga yordam beradi. Batafsil ma'lumot uchun CASL documentation ga qarang.

Yuqoridagi misolda biz `AbilityBuilder` klassi yordamida `MongoAbility` instansiyasini yaratdik. Taxmin qilganingizdek, `can` va `cannot` bir xil argumentlarni qabul qiladi, ammo ma'nosi turlicha: `can` ruxsat beradi, `cannot` taqiqlaydi. Ikkalasi ham 4 tagacha argument qabul qilishi mumkin. Bu funksiyalar haqida ko'proq ma'lumot olish uchun rasmiy CASL hujjatlariga qarang.

Oxirida `CaslModule` modul ta'rifida `CaslAbilityFactory` ni `providers` va `exports` massivlariga qo'shishni unutmang:

```typescript
import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
```

Shu bilan, `CaslModule` host kontekstda import qilingan bo'lsa, `CaslAbilityFactory` ni istalgan klassga standart konstruktor injection orqali inject qilishimiz mumkin:

```typescript
constructor(private caslAbilityFactory: CaslAbilityFactory) {}
```

So'ng uni klassda quyidagicha ishlatamiz.

```typescript
const ability = this.caslAbilityFactory.createForUser(user);
if (ability.can(Action.Read, 'all')) {
  // "user" has read access to everything
}
```

> info **Hint** `MongoAbility` klassi haqida batafsil rasmiy CASL hujjatlarida o'qing.

Masalan, admin bo'lmagan foydalanuvchini olamiz. Bu holatda u maqolalarni o'qiy oladi, ammo yangilarini yaratish yoki mavjudlarini o'chirish taqiqlangan bo'lishi kerak.

```typescript
const user = new User();
user.isAdmin = false;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Read, Article); // true
ability.can(Action.Delete, Article); // false
ability.can(Action.Create, Article); // false
```

> info **Hint** `MongoAbility` va `AbilityBuilder` klasslari ikkalasi ham `can` va `cannot` metodlarini taqdim etsa-da, ularning maqsadi va qabul qiladigan argumentlari biroz farq qiladi.

Shuningdek, talablarimizga ko'ra, foydalanuvchi o'z maqolalarini yangilay olishi kerak:

```typescript
const user = new User();
user.id = 1;

const article = new Article();
article.authorId = user.id;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Update, article); // true

article.authorId = 2;
ability.can(Action.Update, article); // false
```

Ko'rib turganingizdek, `MongoAbility` instansiyasi ruxsatlarni ancha o'qilishi oson tarzda tekshirishga imkon beradi. Xuddi shuningdek, `AbilityBuilder` ruxsatlarni (va turli shartlarni) o'xshash tarzda belgilash imkonini beradi. Ko'proq misollar uchun rasmiy hujjatlarga qarang.

#### Ilg'or: `PoliciesGuard` ni implementatsiya qilish

Bu bo'limda biz bir oz murakkabroq guardni qurishni ko'rsatamiz; u metod darajasida sozlanishi mumkin bo'lgan **avtorizatsiya siyosatlari** bo'yicha foydalanuvchining mosligini tekshiradi (xohlasangiz, uni klass darajasidagi siyosatlarga ham moslashtirishingiz mumkin). Bu misolda CASL paketidan faqat illyustratsiya sifatida foydalanamiz, ammo bu kutubxonadan foydalanish majburiy emas. Shuningdek, oldingi bo'limda yaratgan `CaslAbilityFactory` providerdan foydalanamiz.

Avval talablarimizni aniqlaymiz. Maqsad - har bir route handler uchun siyosat tekshiruvlarini ko'rsatishga imkon beradigan mexanizm taqdim etish. Biz obyektlarni ham, funksiyalarni ham qo'llab-quvvatlaymiz (oddiy tekshiruvlar va funksional uslubni afzal ko'rganlar uchun).

Keling, siyosat handlerlari uchun interfeyslarni aniqlaymiz:

```typescript
import { AppAbility } from '../casl/casl-ability.factory';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
```

Yuqorida aytilganidek, siyosat handlerini aniqlashning ikki yo'lini taqdim etdik: obyekt (ya'ni `IPolicyHandler` interfeysini implementatsiya qiladigan klass instansiyasi) va funksiya (ya'ni `PolicyHandlerCallback` tipiga mos keladigan).

Shu bilan, `@CheckPolicies()` dekoratorini yaratamiz. Bu dekorator muayyan resurslarga kirish uchun qaysi siyosatlar bajarilishi kerakligini ko'rsatishga imkon beradi.

```typescript
export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

Endi route handlerga bog'langan barcha siyosat handlerlarini ajratib olib, bajaradigan `PoliciesGuard` yaratamiz.

```typescript
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
```

> info **Hint** Bu misolda `request.user` foydalanuvchi instansiyasini o'z ichiga oladi deb taxmin qildik. Ilovangizda bu bog'lanishni odatda custom **autentifikatsiya guard** ichida yaratasiz - batafsil ma'lumot uchun [authentication](/docs/security/authentication) bobiga qarang.

Keling, bu misolni qisqacha tahlil qilaylik. `policyHandlers` - bu `@CheckPolicies()` dekoratori orqali metodga biriktirilgan handlerlar massivi. Keyin `CaslAbilityFactory#create` metodidan foydalanib `Ability` obyektini yaratamiz, bu obyekt foydalanuvchi aniq amallarni bajarish uchun yetarli ruxsatga ega yoki yo'qligini tekshirishga imkon beradi. Biz bu obyektni siyosat handleriga uzatamiz; u funksiya yoki `IPolicyHandler` interfeysini implementatsiya qiladigan klass instansiyasi bo'lishi mumkin va `handle()` metodi boolean qiymat qaytaradi. Oxirida barcha handlerlar `true` qaytarganini tekshirish uchun `Array#every` metodidan foydalanamiz.

Nihoyat, bu guardni sinash uchun uni istalgan route handlerga bog'lang va inline siyosat handlerini (funksional yondashuv) ro'yxatdan o'tkazing, quyidagicha:

```typescript
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Article))
findAll() {
  return this.articlesService.findAll();
}
```

Muqobil ravishda, `IPolicyHandler` interfeysini implementatsiya qiladigan klassni aniqlashimiz mumkin:

```typescript
export class ReadArticlePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Article);
  }
}
```

Va undan quyidagicha foydalanamiz:

```typescript
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies(new ReadArticlePolicyHandler())
findAll() {
  return this.articlesService.findAll();
}
```

> warning **Notice** Siyosat handlerini `new` keywordi bilan joyida instansiyalashimiz kerak bo'lgani uchun, `ReadArticlePolicyHandler` klassi Dependency Injectiondan foydalana olmaydi. Buni `ModuleRef#get` metodi yordamida hal qilish mumkin (batafsil bu yerda). Aslida, `@CheckPolicies()` dekoratori orqali funksiya va instansiyalarni ro'yxatdan o'tkazish o'rniga `Type<IPolicyHandler>` uzatishga ruxsat berishingiz kerak. So'ng guard ichida type reference yordamida instansiyani olishingiz mumkin: `moduleRef.get(YOUR_HANDLER_TYPE)` yoki hatto `ModuleRef#create` metodi orqali dinamik instansiyalashingiz mumkin.
