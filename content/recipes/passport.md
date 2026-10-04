---
title: "Passport (autentifikatsiya)"
navTitle: "Passport (autentifikatsiya)"
description: "Passport - bu eng mashhur Node.js authentication kutubxonasi bo'lib, community orasida yaxshi tanilgan va ko'plab production ilovalarda muvaffaqiyatli ishlatiladi. Ushbu kutubxonan"
order: 10
group: recipes
groupTitle: "Recipes"
---
Passport - bu eng mashhur Node.js authentication kutubxonasi bo'lib, community orasida yaxshi tanilgan va ko'plab production ilovalarda muvaffaqiyatli ishlatiladi. Ushbu kutubxonani `@nestjs/passport` moduli yordamida **Nest** ilovasi bilan integratsiya qilish oson. Yuqori darajada Passport quyidagi qadamlarni bajaradi:

- Foydalanuvchini uning "credentials" ma'lumotlarini tekshirish orqali autentifikatsiya qiladi (masalan, username/password, JSON Web Token (JWT) yoki Identity Provider'dan olingan identity token)
- Authenticated holatni boshqaradi (masalan, JWT kabi portable token berish yoki Express session yaratish orqali)
- Autentifikatsiyadan o'tgan foydalanuvchi haqidagi ma'lumotni keyinchalik route handler'larda ishlatish uchun `Request` obyektiga biriktiradi

Passport turli authentication mexanizmlarini amalga oshiradigan boy strategy ekotizimiga ega. Konsepsiya jihatidan sodda bo'lsa-da, tanlash mumkin bo'lgan Passport strategiyalari juda ko'p va xilma-xildir. Passport bu turli qadamlarni yagona standart pattern ichiga joylaydi, `@nestjs/passport` esa ushbu pattern'ni Nest'ga xos construct'lar bilan o'rab, standartlashtiradi.

Ushbu bobda ushbu kuchli va moslashuvchan modullar yordamida RESTful API server uchun to'liq end-to-end authentication yechimini implement qilamiz. Bu yerda tushuntirilgan g'oyalar yordamida authentication sxemangizni moslashtirish uchun istalgan Passport strategy'ni implement qilishingiz mumkin. Ushbu bobdagi qadamlarni kuzatib, to'liq ishlaydigan namunani qurishingiz mumkin.

#### Authentication talablari

Talablarni aniq belgilab olaylik. Ushbu use case'da client'lar avval username va password bilan autentifikatsiya qiladi. Autentifikatsiyadan so'ng server JWT beradi va u keyingi so'rovlarda autentifikatsiyani isbotlash uchun authorization header'dagi bearer token sifatida yuboriladi. Shuningdek, faqat yaroqli JWT bo'lgan so'rovlar kira oladigan protected route ham yaratamiz.

Avval birinchi talabdan boshlaymiz: foydalanuvchini autentifikatsiya qilish. So'ngra uni JWT berish bilan kengaytiramiz. Oxirida so'rovda yaroqli JWT borligini tekshiradigan protected route yaratamiz.

Avval kerakli paketlarni o'rnatishimiz kerak. Passport username/password asosidagi authentication mexanizmini implement qiladigan passport-local strategy'sini taqdim etadi va bu use case'ning ushbu qismi uchun mos keladi.

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local
```

> warning **Notice** Qaysi Passport strategy'ni tanlamang, har doim `@nestjs/passport` va `passport` paketlari kerak bo'ladi. Keyin siz qurayotgan authentication strategy'ni implement qiladigan strategy'ga xos paketni (`passport-jwt` yoki `passport-local` kabi) ham o'rnatishingiz kerak. Bundan tashqari, yuqoridagi `@types/passport-local` misolida bo'lgani kabi, istalgan Passport strategy uchun type definition'larni ham o'rnatishingiz mumkin. Bu TypeScript kod yozishda yordam beradi.

#### Passport strategiyalarini implement qilish

Endi authentication funksiyasini implement qilishga tayyormiz. Avval **har qanday** Passport strategy uchun ishlatiladigan umumiy jarayonni ko'rib chiqamiz. Passport'ni o'zicha kichik freymvork deb tasavvur qilish foydali. Uning jozibasi shundaki, authentication jarayonini siz implement qilayotgan strategy'ga qarab sozlanadigan bir nechta asosiy qadamga abstraksiyalaydi. U freymvorkka o'xshaydi, chunki siz uni customization parametrlar (oddiy JSON obyektlari) va Passport kerakli vaqtda chaqiradigan callback funksiyalar ko'rinishidagi custom kod bilan sozlaysiz. `@nestjs/passport` moduli ushbu freymvorkni Nest uslubidagi paketga o'raydi va uni Nest ilovasiga integratsiya qilishni osonlashtiradi. Quyida `@nestjs/passport` dan foydalanamiz, ammo avval **vanilla Passport** qanday ishlashini ko'raylik.

Vanilla Passport'da strategy'ni sozlash uchun ikkita narsa kerak bo'ladi:

1. O'sha strategy'ga xos opsiyalar to'plami. Masalan, JWT strategy'sida tokenlarni imzolash uchun secret berishingiz mumkin.
2. "verify callback", ya'ni Passport'ga user store bilan qanday ishlashni aytadigan joy (foydalanuvchi account'lari shu yerda boshqariladi). Bu yerda foydalanuvchi mavjudligini (va/yoki yangi foydalanuvchi yaratishni) hamda credential'lari yaroqliligini tekshirasiz. Passport kutubxonasi validatsiya muvaffaqiyatli bo'lsa to'liq user obyektini, muvaffaqiyatsiz bo'lsa `null` qaytishini kutadi (muvaffaqiyatsizlik degani foydalanuvchi topilmagan yoki `passport-local` holatida parol mos kelmagan bo'lishi mumkin).

`@nestjs/passport` bilan Passport strategy `PassportStrategy` class'ini extend qilish orqali sozlanadi. Strategy opsiyalari (yuqoridagi 1-band) subclass ichidagi `super()` metodiga options obyektini uzatish orqali beriladi. Verify callback (yuqoridagi 2-band) esa subclass ichida `validate()` metodini implement qilish orqali taqdim etiladi.

Boshlash uchun `AuthModule` va uning ichida `AuthService` generatsiya qilamiz:

```bash
$ nest g module auth
$ nest g service auth
```

`AuthService` ni implement qilayotganda user operatsiyalarini `UsersService` ichiga kapsullash foydali bo'ladi, shuning uchun hozir shu modul va service'ni ham yarataylik:

```bash
$ nest g module users
$ nest g service users
```

Yaratilgan fayllarning standart tarkibini quyidagidek almashtiring. Namuna ilovamizda `UsersService` xotirada saqlanadigan hard-coded foydalanuvchilar ro'yxatini va username orqali topish metodini saqlaydi. Real ilovada esa aynan shu yerda user model va persistence layer quriladi, o'zingiz tanlagan kutubxona (masalan, TypeORM, Sequelize, Mongoose va boshqalar) bilan.

```typescript
@@filename(users/users.service)
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
      },
      {
        userId: 2,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  async findOne(username) {
    return this.users.find(user => user.username === username);
  }
}
```

`UsersModule` ichida kerakli yagona o'zgarish - `UsersService` ni `@Module` dekoratoridagi `exports` massiviga qo'shish. Shunda u modul tashqarisida ham ko'rinadi (tez orada uni `AuthService` ichida ishlatamiz).

```typescript
@@filename(users/users.module)
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
@@switch
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

`AuthService` ning vazifasi foydalanuvchini olish va parolni tekshirishdan iborat. Shu maqsadda `validateUser()` metodini yaratamiz. Quyidagi kodda qaytarishdan oldin user obyektidan `password` xossasini olib tashlash uchun qulay ES6 spread operator'dan foydalanamiz. Bir ozdan keyin `validateUser()` metodini Passport local strategy ichidan chaqiramiz.

```typescript
@@filename(auth/auth.service)
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
@@switch
import { Injectable, Dependencies } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
@Dependencies(UsersService)
export class AuthService {
  constructor(usersService) {
    this.usersService = usersService;
  }

  async validateUser(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
```

> Warning **Warning** Albatta, real ilovada parolni plain text ko'rinishida saqlamaysiz. Buning o'rniga bcrypt kabi, salted one-way hash algoritmiga ega kutubxonadan foydalanasiz. Bu yondashuvda faqat hash qilingan parollar saqlanadi va keyin saqlangan parol **kelayotgan** parolning hash qilingan versiyasi bilan solishtiriladi. Shunday qilib parol hech qachon plain text ko'rinishida saqlanmaydi yoki oshkor qilinmaydi. Namuna ilovani sodda saqlash uchun biz bu qoidani buzib, plain text ishlatyapmiz. **Buni real ilovangizda qilmang!**

Endi `AuthModule` ni yangilab, `UsersModule` ni import qilamiz.

```typescript
@@filename(auth/auth.module)
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}
@@switch
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}
```

#### Passport local'ni implement qilish

Endi Passport **local authentication strategy** ni implement qilishimiz mumkin. `auth` papkasi ichida `local.strategy.ts` faylini yarating va quyidagi kodni qo'shing:

```typescript
@@filename(auth/local.strategy)
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
@@switch
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Dependencies } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
@Dependencies(AuthService)
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(authService) {
    super();
    this.authService = authService;
  }

  async validate(username, password) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

Biz oldin Passport strategiyalari uchun tasvirlangan umumiy recipe'ga amal qildik. `passport-local` holatida qo'shimcha konfiguratsiya opsiyalari yo'q, shu sabab constructor oddiygina `super()` ni options obyektisiz chaqiradi.

> info **Hint** Passport strategy xatti-harakatini moslashtirish uchun `super()` chaqiruviga options obyektini uzatish mumkin. Bu misolda `passport-local` strategy standart holatda request body ichida `username` va `password` nomli xossalarni kutadi. Boshqa property nomlarini berish uchun options obyektini uzating, masalan: `super({{ '{' }} usernameField: 'email' {{ '}' }})`. Batafsil ma'lumot uchun Passport documentation ni ko'ring.

Biz `validate()` metodini ham implement qildik. Har bir strategy uchun Passport verify funksiyasini (`@nestjs/passport` ichida `validate()` orqali implement qilinadi) strategy'ga xos parametrlar to'plami bilan chaqiradi. Local strategy uchun Passport quyidagi signature'ga ega `validate()` metodini kutadi: `validate(username: string, password:string): any`.

Validatsiyaning asosiy qismi `AuthService` ichida (`UsersService` yordamida) bajariladi, shuning uchun bu metod ancha sodda. **Har qanday** Passport strategy uchun `validate()` metodi o'xshash pattern'ga amal qiladi, farq faqat credential'lar qanday ifodalanishida bo'ladi. Agar foydalanuvchi topilsa va credential'lar to'g'ri bo'lsa, user obyekt qaytariladi va Passport o'z vazifalarini tugatadi (masalan, `Request` obyektida `user` xossasini yaratadi), keyin request pipeline davom etadi. Agar foydalanuvchi topilmasa, exception tashlaymiz va uni <a href="/docs/core/exception-filters">exceptions layer</a> ga topshiramiz.

Odatda har bir strategy uchun `validate()` metodidagi asosiy farq - foydalanuvchi mavjudligi va yaroqliligi **qanday** tekshirilishidadir. Masalan, JWT strategy'da talabga qarab decoded token ichidagi `userId` bizning user database'dagi yozuvga mos keladimi yoki revoked token'lar ro'yxatida bormi - shuni tekshirishingiz mumkin. Shuning uchun subclass yozish va strategy'ga xos validatsiyani implement qilish pattern'i izchil, chiroyli va kengaytiriladigan yondashuv hisoblanadi.

Endi `AuthModule` ni Passport'ning hozirgina yaratgan imkoniyatlaridan foydalanadigan qilib sozlashimiz kerak. `auth.module.ts` ni quyidagicha yangilang:

```typescript
@@filename(auth/auth.module)
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
@@switch
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
```

#### Built-in Passport Guard'lari

<a href="/docs/core/guards">Guards</a> bo'limida Guard'larning asosiy vazifasi request route handler tomonidan qayta ishlanishi yoki yo'qligini aniqlash ekani tushuntirilgan. Bu yerda ham shu to'g'ri bo'lib qoladi va biz bu standart imkoniyatdan tez orada foydalanamiz. Ammo `@nestjs/passport` modulidan foydalanganda boshida biroz chalkashtirishi mumkin bo'lgan kichik bir farq paydo bo'ladi, shuning uchun avval shuni muhokama qilamiz. Authentication nuqtai nazaridan ilovangiz ikki holatdan birida bo'lishi mumkin:

1. foydalanuvchi/client hali **log in qilmagan** (`authenticated` emas)
2. foydalanuvchi/client **log in qilgan** (`authenticated`)

Birinchi holatda (foydalanuvchi log in qilmaganida) biz ikki xil vazifani bajarishimiz kerak:

- Authentication qilinmagan foydalanuvchi kira oladigan route'larni cheklash, ya'ni himoyalangan route'larga kirishni rad etish. Buni odatdagi usulda, protected route'larga Guard qo'yish orqali qilamiz. Kutilganidek, bu Guard ichida valid JWT mavjudligini tekshiramiz, shuning uchun JWT muvaffaqiyatli berila boshlagach bu Guard'ga qaytamiz.

- Oldin authentication qilinmagan foydalanuvchi log in qilishga uringanda **authentication bosqichi**ni boshlash. Aynan shu bosqichda biz valid foydalanuvchiga JWT **beramiz**. Bir oz o'ylab ko'rsak, authentication'ni boshlash uchun `username`/`password` credential'larini `POST` qilishimiz kerak bo'ladi, shu sabab `POST /auth/login` route'ini yaratamiz. Bu esa savol tug'diradi: shu route ichida passport-local strategy qanday ishga tushiriladi?

Javob oddiy: Guard'ning boshqa, biroz farqli turi orqali. `@nestjs/passport` moduli bu ish uchun built-in Guard beradi. Bu Guard Passport strategy'ni ishga tushiradi va yuqorida aytilgan bosqichlarni boshlaydi: credential'larni olish, verify funksiyani ishga tushirish, `user` property yaratish va hokazo.

Yuqoridagi ikkinchi holat esa (foydalanuvchi log in qilgan bo'lsa) himoyalangan route'larga kirishni ruxsat etish uchun biz allaqachon ko'rib chiqqan standart Guard turiga tayanadi.

#### Login route'i

Endi strategy tayyor bo'lgani uchun oddiy `/auth/login` route'ini implement qilamiz va passport-local flow'ni boshlash uchun built-in Guard'ni qo'llaymiz.

`app.controller.ts` faylini ochib, tarkibini quyidagiga almashtiring:

```typescript
@@filename(app.controller)
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }
}
@@switch
import { Controller, Bind, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  @Bind(Request())
  async login(req) {
    return req.user;
  }
}
```

`@UseGuards(AuthGuard('local'))` bilan biz passport-local strategy'ni kengaytirganimizda `@nestjs/passport` biz uchun **avtomatik yaratgan** `AuthGuard`'dan foydalanayapmiz. Keling, buni ajratib ko'ramiz. Bizning Passport local strategy'mizning standart nomi `'local'`. Shu nomni `@UseGuards()` dekoratorida ko'rsatib, uni `passport-local` package taqdim etgan kod bilan bog'laymiz. Bu, ilovamizda bir nechta Passport strategy bo'lganda qaysi biri ishga tushirilishini aniq ajratish uchun kerak bo'ladi, chunki har biri o'ziga xos `AuthGuard` yaratishi mumkin. Hozircha bitta strategy bor, lekin birozdan keyin ikkinchisini ham qo'shamiz, shuning uchun bunday ajratish zarur.

Route'ni test qilish uchun hozircha `/auth/login` route'i shunchaki user'ni qaytarsin. Bu Passport'ning yana bir foydali imkoniyatini ko'rsatadi: Passport `validate()` metodidan qaytgan qiymat asosida avtomatik ravishda `user` obyektini yaratadi va uni `Request` obyektiga `req.user` sifatida biriktiradi. Keyinroq biz buni JWT yaratib qaytaradigan kod bilan almashtiramiz.

Bu API route'lari bo'lgani uchun ularni keng tarqalgan cURL kutubxonasi orqali test qilamiz. `UsersService` ichida hard-code qilingan istalgan `user` obyektidan foydalanishingiz mumkin.

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"userId":1,"username":"john"}
```

Bu ishlasa ham, strategy nomini `AuthGuard()` ichiga to'g'ridan-to'g'ri berish codebase ichida magic string'lar paydo bo'lishiga olib keladi. Shuning o'rniga quyidagidek o'z class'ingizni yaratishni tavsiya qilamiz:

```typescript
@@filename(auth/local-auth.guard)
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

Endi `/auth/login` route handler'ini yangilab, `LocalAuthGuard` dan foydalanishimiz mumkin:

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/login')
async login(@Request() req) {
  return req.user;
}
```

#### Logout route'i

Log out qilish uchun `req.logout()` ni chaqirib foydalanuvchi session'ini tozalaydigan qo'shimcha route yaratishimiz mumkin. Bu session-based authentication'da odatiy yondashuv, lekin JWT uchun qo'llanmaydi.

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/logout')
async logout(@Request() req) {
  return req.logout();
}
```

#### JWT funksionalligi

Endi auth tizimimizning JWT qismiga o'tishga tayyormiz. Talablarni yana bir bor ko'rib chiqib, aniqlashtiraylik:

- Foydalanuvchilar `username`/`password` bilan authentication qila olishi va keyinchalik protected API endpoint'larga murojaat qilish uchun JWT olishi kerak. Bunga ancha yaqinlashdik. Uni yakunlash uchun JWT beradigan kodni yozishimiz kerak.
- Valid JWT bearer token mavjud bo'lsa ishlaydigan protected API route'larini yaratish kerak

JWT talablarini qo'llab-quvvatlash uchun yana bir nechta package o'rnatishimiz kerak bo'ladi:

```bash
$ npm install --save @nestjs/jwt passport-jwt
$ npm install --save-dev @types/passport-jwt
```

`@nestjs/jwt` package'i (bu yerda ko'proq ma'lumot bor) JWT bilan ishlashni osonlashtiradigan utility package hisoblanadi. `passport-jwt` esa JWT strategy'ni implement qiladigan Passport package'i, `@types/passport-jwt` esa TypeScript type definition'larini beradi.

Endi `POST /auth/login` request'i qanday qayta ishlanishini yaqinroq ko'rib chiqamiz. Biz route'ni passport-local strategy taqdim etgan built-in `AuthGuard` bilan dekoratsiya qildik. Bu shuni anglatadiki:

1. Route handler **faqat foydalanuvchi validatsiyadan o'tgandagina chaqiriladi**
2. `req` parametri ichida `user` property bo'ladi (Passport uni passport-local authentication flow davomida to'ldiradi)

Shuni hisobga olib, endi nihoyat haqiqiy JWT yaratib, uni shu route'dan qaytarishimiz mumkin. Service'lar modullarga toza ajratilgan bo'lishi uchun JWT yaratishni `authService` ichida qilamiz. `auth` papkasidagi `auth.service.ts` faylini ochib, `login()` metodini qo'shing va `JwtService` ni quyidagidek import qiling:

```typescript
@@filename(auth/auth.service)
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

@@switch
import { Injectable, Dependencies } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Dependencies(UsersService, JwtService)
@Injectable()
export class AuthService {
  constructor(usersService, jwtService) {
    this.usersService = usersService;
    this.jwtService = jwtService;
  }

  async validateUser(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

Biz `@nestjs/jwt` kutubxonasidan foydalanayapmiz, u `user` obyektining ma'lum property'lari asosida JWT yaratish uchun `sign()` funksiyasini beradi. So'ng uni faqat bitta `access_token` property'ga ega oddiy obyekt ko'rinishida qaytaramiz. Eslatma: `userId` qiymatini JWT standartlariga mos bo'lishi uchun `sub` nomli property ichida saqlayapmiz. `JwtService` provider'ini `AuthService` ichiga inject qilishni unutmang.

Endi `AuthModule` ni yangilab, yangi dependency'larni import qilishimiz va `JwtModule` ni sozlashimiz kerak.

Avval `auth` papkasi ichida `constants.ts` faylini yaratib, quyidagi kodni qo'shing:

```typescript
@@filename(auth/constants)
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
@@switch
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
```

Biz bundan JWT'ni sign qilish va verify qilish bosqichlari o'rtasida bir xil key'ni ulashish uchun foydalanamiz.

> Warning **Warning** Bu key'ni **ommaga oshkor qilmang**. Biz bu yerda kod nima qilayotganini aniq ko'rsatish uchun shunday yozdik, lekin production tizimda **bu key'ni albatta himoya qilishingiz kerak**. Masalan, secrets vault, environment variable yoki configuration service orqali.

Endi `auth` papkasidagi `auth.module.ts` faylini ochib, quyidagicha yangilang:

```typescript
@@filename(auth/auth.module)
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
@@switch
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

Biz `JwtModule` ni `register()` orqali configuration obyekt uzatib sozlaymiz. Nest `JwtModule` haqida ko'proq ma'lumotni bu yerda, mavjud konfiguratsiya opsiyalari haqida esa bu yerda ko'rishingiz mumkin.

Endi `/auth/login` route'ini JWT qaytaradigan qilib yangilashimiz mumkin.

```typescript
@@filename(app.controller)
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
@@switch
import { Controller, Bind, Request, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @Bind(Request())
  async login(req) {
    return this.authService.login(req.user);
  }
}
```

Keling, route'larni yana cURL bilan test qilib ko'ramiz. `UsersService` ichida hard-code qilingan istalgan `user` obyektidan foydalanishingiz mumkin.

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated
```

#### Passport JWT'ni implement qilish

Endi oxirgi talabni hal qilamiz: endpoint'larni request ichida valid JWT bo'lishini talab qilgan holda himoyalash. Bu yerda ham Passport yordam beradi. U JSON Web Token orqali RESTful endpoint'larni himoyalash uchun passport-jwt strategy'sini taqdim etadi. Avval `auth` papkasida `jwt.strategy.ts` nomli fayl yarating va quyidagi kodni qo'shing:

```typescript
@@filename(auth/jwt.strategy)
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
@@switch
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

Bizning `JwtStrategy` bilan oldin barcha Passport strategy'lar uchun ko'rsatib o'tilgan bir xil recipe'ga amal qildik. Bu strategy'ga boshlang'ich konfiguratsiya kerak, shuning uchun `super()` chaqiruviga options obyekt uzatamiz. Mavjud opsiyalar haqida ko'proq ma'lumotni bu yerda o'qishingiz mumkin. Bizning holatda opsiyalar quyidagilar:

- `jwtFromRequest`: JWT `Request` dan qanday usul bilan olinishi kerakligini belgilaydi. Biz API request'larida `Authorization` header orqali bearer token uzatishning standart yondashuvidan foydalanamiz. Boshqa variantlar bu yerda keltirilgan.
- `ignoreExpiration`: aniq ko'rsatish uchun standart `false` qiymatini tanlaymiz. Bu JWT muddati tugagan-tugamaganini tekshirish mas'uliyatini Passport moduliga topshiradi. Ya'ni route'ga muddati o'tgan JWT yuborilsa, request rad etiladi va `401 Unauthorized` javobi qaytadi. Passport buni biz uchun avtomatik bajaradi.
- `secretOrKey`: token'ni sign qilish uchun symmetric secret'ni to'g'ridan-to'g'ri uzatayapmiz. PEM formatdagi public key kabi boshqa variantlar production ilovalar uchun ko'proq mos kelishi mumkin (bu yerda ko'proq ma'lumot bor). Har holda, yuqorida ogohlantirilganidek, **bu secret'ni oshkor qilmang**.

`validate()` metodi haqida alohida to'xtalish kerak. `jwt-strategy` uchun Passport avval JWT signature'sini tekshiradi va JSON'ni decode qiladi. So'ng decoded JSON'ni yagona parametr sifatida uzatib, bizning `validate()` metodimizni chaqiradi. JWT sign qilish qanday ishlashini hisobga olsak, **bizga avval o'zimiz sign qilib, valid foydalanuvchiga bergan token kelayotganiga ishonch hosil qilamiz**.

Shu sabab `validate()` callback'iga javobimiz juda oddiy: `userId` va `username` property'lariga ega obyektni qaytaramiz. Yana bir bor eslatamiz, Passport `validate()` metodidan qaytgan qiymat asosida `user` obyektini yaratadi va uni `Request` obyektiga property sifatida biriktiradi.

Bundan tashqari, siz array ham qaytarishingiz mumkin: birinchi qiymat `user` obyektini yaratish uchun, ikkinchi qiymat esa `authInfo` obyektini yaratish uchun ishlatiladi.

Bu yondashuv jarayonga boshqa business logic qo'shish uchun ham joy qoldirishini aytib o'tish kerak. Masalan, `validate()` metodi ichida database query qilib, foydalanuvchi haqida qo'shimcha ma'lumot olib, `Request` ichida boyitilganroq `user` obyektiga ega bo'lishimiz mumkin. Yoki shu joyda token'ni qo'shimcha validatsiya qilish, masalan `userId` ni revoked token'lar ro'yxatidan tekshirish orqali token revocation'ni amalga oshirish mumkin. Bu sample kodda implement qilgan model tez ishlovchi, "stateless JWT" modeli bo'lib, unda har bir API chaqiruvi valid JWT mavjudligi asosida darhol autorizatsiya qilinadi va request pipeline ichida so'rov yuboruvchiga oid kichik ma'lumot to'plami (`userId` va `username`) mavjud bo'ladi.

Yangi `JwtStrategy` ni `AuthModule` ichida provider sifatida qo'shing:

```typescript
@@filename(auth/auth.module)
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
@@switch
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

JWT sign qilinganda ishlatilgan shu bir xil secret'ni import qilish orqali Passport bajaradigan **verify** bosqichi va `AuthService` ichidagi **sign** bosqichi bir xil secret'dan foydalanishini ta'minlaymiz.

Oxirida built-in `AuthGuard` ni kengaytiradigan `JwtAuthGuard` class'ini yaratamiz:

```typescript
@@filename(auth/jwt-auth.guard)
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### Protected route va JWT strategy guard'larini implement qilish

Endi protected route va unga bog'liq Guard'ni implement qilishimiz mumkin.

`app.controller.ts` faylini ochib, quyidagicha yangilang:

```typescript
@@filename(app.controller)
import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
@@switch
import { Controller, Dependencies, Bind, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Dependencies(AuthService)
@Controller()
export class AppController {
  constructor(authService) {
    this.authService = authService;
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @Bind(Request())
  async login(req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Bind(Request())
  getProfile(req) {
    return req.user;
  }
}
```

Yana bir bor, `passport-jwt` modulini sozlaganimizda `@nestjs/passport` biz uchun avtomatik yaratgan `AuthGuard` ni qo'llayapmiz. Bu Guard standart nomi `jwt` orqali chaqiriladi. `GET /profile` route'iga request kelganda, Guard avtomatik ravishda biz sozlagan passport-jwt strategy'ni ishga tushiradi, JWT'ni validatsiya qiladi va `user` property'ni `Request` obyektiga biriktiradi.

Ilova ishlayotganiga ishonch hosil qiling va route'larni `cURL` orqali test qiling.

```bash
$ # GET /profile
$ curl http://localhost:3000/profile
$ # result -> {"statusCode":401,"message":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm... }

$ # GET /profile using access_token returned from previous step as bearer code
$ curl http://localhost:3000/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
$ # result -> {"userId":1,"username":"john"}
```

E'tibor bering, `AuthModule` ichida JWT muddati `60 seconds` qilib sozlangan. Bu ehtimol juda qisqa muddat, token expiration va refresh tafsilotlari esa ushbu maqola doirasidan tashqarida. Lekin biz buni JWT va passport-jwt strategy'ning muhim xususiyatini ko'rsatish uchun tanladik. Agar authentication'dan keyin 60 soniya kutib, so'ng `GET /profile` request'ini yuborsangiz, `401 Unauthorized` javobini olasiz. Sababi Passport JWT ichidagi expiration vaqtini avtomatik tekshiradi va bu ishni ilova kodida qo'lda yozishingizga hojat qoldirmaydi.

Shu bilan JWT authentication implementatsiyasini yakunladik. Endi JavaScript client'lar (masalan Angular/React/Vue) va boshqa JavaScript ilovalar bizning API server bilan authentication qilib, xavfsiz aloqa qila oladi.

#### Guard'larni kengaytirish

Ko'p holatlarda tayyor `AuthGuard` class'idan foydalanish yetarli bo'ladi. Ammo ayrim use case'larda standart error handling yoki authentication logic'ni kengaytirish kerak bo'lishi mumkin. Buning uchun built-in class'ni kengaytirib, sub-class ichida kerakli metodlarni override qilishingiz mumkin.

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

Standart error handling va authentication logic'ni kengaytirishdan tashqari, authentication'ni strategy'lar zanjiri orqali ham o'tkazish mumkin. Muvaffaqiyatli bo'lgan, redirect qilgan yoki error qaytargan birinchi strategy zanjirni to'xtatadi. Authentication xatolari esa har bir strategy bo'ylab ketma-ket yuradi va hammasi muvaffaqiyatsiz tugasa, yakuniy xato qaytadi.

```typescript
export class JwtAuthGuard extends AuthGuard(['strategy_jwt_1', 'strategy_jwt_2', '...']) { ... }
```

#### Authentication'ni global yoqish

Agar endpoint'laringizning katta qismi standart holatda protected bo'lishi kerak bo'lsa, authentication guard'ni [global guard](/docs/core/guards#guardlarni-ulash) sifatida ro'yxatdan o'tkazishingiz mumkin. Shunda har bir controller ustiga `@UseGuards()` dekoratori yozish o'rniga, qaysi route'lar public ekanini belgilab qo'yishning o'zi kifoya qiladi.

Avval `JwtAuthGuard` ni quyidagi ko'rinishda global guard sifatida ro'yxatdan o'tkazing (istalgan modul ichida):

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

Shundan keyin Nest avtomatik ravishda `JwtAuthGuard` ni barcha endpoint'larga bog'laydi.

Endi route'larni public deb e'lon qilish mexanizmini berishimiz kerak. Buning uchun `SetMetadata` decorator factory funksiyasi yordamida custom decorator yaratamiz.

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Yuqoridagi faylda biz ikkita constant export qildik. Birinchisi `IS_PUBLIC_KEY` nomli metadata key, ikkinchisi esa `Public` deb atayotgan yangi dekoratorning o'zi. Xohlasangiz uni `SkipAuth` yoki `AllowAnon` deb ham nomlashingiz mumkin, loyihangizga qaysi biri mos tushsa o'shani ishlating.

Endi custom `@Public()` dekoratorimiz bor ekan, uni istalgan metodni bezash uchun quyidagicha ishlatishimiz mumkin:

```typescript
@Public()
@Get()
findAll() {
  return [];
}
```

Oxirida `JwtAuthGuard` `"isPublic"` metadata'sini topsa `true` qaytarishi kerak. Buning uchun `Reflector` class'idan foydalanamiz ([bu yerda](/docs/core/guards#hammasini-birlashtiramiz) batafsilroq o'qishingiz mumkin).

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
```

#### Request scope'li strategy'lar

Passport API strategy'larni kutubxonaning global instance'iga ro'yxatdan o'tkazish g'oyasiga asoslangan. Shu sabab strategy'lar request'ga bog'liq options'ga ega bo'lish yoki har bir request uchun dinamik yaratilish uchun mo'ljallanmagan (request-scoped provider'lar haqida ko'proq o'qing). Agar strategy'ni request-scoped qilib sozlasangiz, Nest uni umuman instantiate qilmaydi, chunki u aniq bir route'ga bog'lanmagan bo'ladi. Qaysi "request-scoped" strategy qaysi request uchun ishlashi kerakligini fizik jihatdan aniqlashning iloji yo'q.

Shunga qaramay, strategy ichida request-scoped provider'larni dinamik resolve qilish usullari bor. Buning uchun module reference imkoniyatidan foydalanamiz.

Avval `local.strategy.ts` faylini ochib, odatdagi usulda `ModuleRef` ni inject qiling:

```typescript
constructor(private moduleRef: ModuleRef) {
  super({
    passReqToCallback: true,
  });
}
```

> info **Hint** `ModuleRef` class'i `@nestjs/core` package'idan import qilinadi.

Yuqorida ko'rsatilganidek, `passReqToCallback` konfiguratsiya property'sini `true` qilishni unutmang.

Keyingi bosqichda yangi context identifier yaratish o'rniga request instance'ning o'zi orqali joriy context identifier olinadi (request context haqida ko'proq bu yerda o'qishingiz mumkin).

Endi `LocalStrategy` class'ining `validate()` metodi ichida `ContextIdFactory` class'idagi `getByRequest()` metodidan foydalanib request obyektiga asoslangan context id yarating va uni `resolve()` chaqiruviga uzating:

```typescript
async validate(
  request: Request,
  username: string,
  password: string,
) {
  const contextId = ContextIdFactory.getByRequest(request);
  // "AuthService" is a request-scoped provider
  const authService = await this.moduleRef.resolve(AuthService, contextId);
  ...
}
```

Yuqoridagi misolda `resolve()` metodi `AuthService` provider'ining request-scoped instance'ini asynchronous tarzda qaytaradi (`AuthService` request-scoped provider sifatida belgilangan deb faraz qilyapmiz).

#### Passport'ni moslashtirish

Passport'ning istalgan standart customization opsiyalari xuddi shu usulda, `register()` metodi orqali uzatilishi mumkin. Mavjud opsiyalar implement qilinayotgan strategy'ga bog'liq bo'ladi. Masalan:

```typescript
PassportModule.register({ session: true });
```

Strategy'larni constructor ichida options obyekt berib ham sozlashingiz mumkin.
Masalan, local strategy uchun quyidagini uzatishingiz mumkin:

```typescript
constructor(private authService: AuthService) {
  super({
    usernameField: 'email',
    passwordField: 'password',
  });
}
```

Property nomlari uchun rasmiy Passport Website ni ko'rib chiqing.

#### Nomlangan strategy'lar

Strategy implement qilayotganda `PassportStrategy` funksiyasiga ikkinchi argument sifatida nom berishingiz mumkin. Agar buni qilmasangiz, har bir strategy standart nomga ega bo'ladi (masalan, jwt-strategy uchun `'jwt'`):

```typescript
export class JwtStrategy extends PassportStrategy(Strategy, 'myjwt')
```

Keyin uni `@UseGuards(AuthGuard('myjwt'))` kabi dekorator orqali ishlatasiz.

#### GraphQL

[GraphQL](/docs/graphql/quick-start) bilan `AuthGuard` ishlatish uchun built-in `AuthGuard` class'ini kengaytirib, `getRequest()` metodini override qiling.

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

GraphQL resolver ichida joriy authenticated user'ni olish uchun `@CurrentUser()` dekoratorini yaratishingiz mumkin:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
```

Yuqoridagi dekoratordan resolver ichida foydalanish uchun uni query yoki mutation parametriga qo'shishni unutmang:

```typescript
@Query(() => User)
@UseGuards(GqlAuthGuard)
whoAmI(@CurrentUser() user: User) {
  return this.usersService.findById(user.id);
}
```

passport-local strategy uchun GraphQL context argument'larini request body'ga ham qo'shishingiz kerak, shunda Passport ularni validatsiya uchun o'qiy oladi. Aks holda `Unauthorized` xatosini olasiz.

```typescript
@Injectable()
export class GqlLocalAuthGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    const gqlExecutionContext = GqlExecutionContext.create(context);
    const gqlContext = gqlExecutionContext.getContext();
    const gqlArgs = gqlExecutionContext.getArgs();

    gqlContext.req.body = { ...gqlContext.req.body, ...gqlArgs };
    return gqlContext.req;
  }
}
```
