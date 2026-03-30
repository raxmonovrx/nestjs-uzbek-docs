---
title: "Autentifikatsiya"
navTitle: "Autentifikatsiya"
description: "Autentifikatsiya aksariyat ilovalarning muhim qismidir. Autentifikatsiyani boshqarish uchun turli yondashuv va strategiyalar mavjud. Har bir loyiha uchun yondashuv uning aniq ilova"
order: 1
group: security
groupTitle: "Security"
---
Autentifikatsiya aksariyat ilovalarning **muhim** qismidir. Autentifikatsiyani boshqarish uchun turli yondashuv va strategiyalar mavjud. Har bir loyiha uchun yondashuv uning aniq ilova talablariga bog'liq. Bu bob turli talablar uchun moslashtirilishi mumkin bo'lgan autentifikatsiya yondashuvlarini taqdim etadi.

Keling, talablarimizni aniqlaymiz. Bu use case da klientlar avval foydalanuvchi nomi va parol bilan autentifikatsiya qiladi. Autentifikatsiyadan so'ng, server keyingi so'rovlarda autentifikatsiyani isbotlash uchun authorization headerda bearer token sifatida yuborilishi mumkin bo'lgan JWT ni beradi. Shuningdek, faqat yaroqli JWT bo'lgan so'rovlargina kira oladigan himoyalangan route yaratamiz.

Avval birinchi talabdan boshlaymiz: foydalanuvchini autentifikatsiya qilish. So'ngra JWT chiqarish bilan davom etamiz. Nihoyat, so'rovda yaroqli JWT borligini tekshiradigan himoyalangan route yaratamiz.

#### Autentifikatsiya modulini yaratish

Avval `AuthModule` ni va uning ichida `AuthService` va `AuthController` ni generatsiya qilamiz. Autentifikatsiya mantiqini `AuthService` da, autentifikatsiya endpointlarini esa `AuthController` da amalga oshiramiz.

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```

`AuthService` ni implementatsiya qilarkanmiz, foydalanuvchi operatsiyalarini `UsersService` ichiga kapsullash foydali bo'ladi, shuning uchun hoziroq o'sha modul va servisni generatsiya qilamiz:

```bash
$ nest g module users
$ nest g service users
```

Yaratilgan fayllarning default mazmunini quyidagicha almashtiring. Namuna ilovamizda `UsersService` faqat qattiq kodlangan xotiradagi foydalanuvchilar ro'yxatini va username bo'yicha bitta foydalanuvchini topish metodini ushlab turadi. Haqiqiy ilovada esa bu yerda o'zingiz tanlagan kutubxona (masalan, TypeORM, Sequelize, Mongoose va h.k.) bilan user modelingiz va persistence qatlamingiz bo'ladi.

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

`UsersModule` da kerak bo'ladigan yagona o'zgarish - `UsersService` ni `@Module` dekoratoridagi `exports` massiviga qo'shish, shunda u modul tashqarisida ko'rinadigan bo'ladi (buni tez orada `AuthService` da ishlatamiz).

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

#### "Sign in" endpointini implementatsiya qilish

`AuthService` ning vazifasi foydalanuvchini topish va parolni tekshirish. Shu maqsadda `signIn()` metodini yaratamiz. Quyidagi kodda biz ES6 spread operatoridan foydalanib, foydalanuvchi obyektini qaytarishdan oldin undan `password` xossasini olib tashlaymiz. Bu foydalanuvchi obyektlarini qaytarishda keng tarqalgan amaliyot, chunki parol yoki boshqa xavfsizlik kalitlari kabi maxfiy maydonlarni oshkor qilmaslik kerak.

```typescript
@@filename(auth/auth.service)
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}
@@switch
import { Injectable, Dependencies, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
@Dependencies(UsersService)
export class AuthService {
  constructor(usersService) {
    this.usersService = usersService;
  }

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}
```

> Warning **Warning** Albatta, haqiqiy ilovada parolni oddiy matn ko'rinishida saqlamaysiz. Buning o'rniga bcrypt kabi kutubxona va tuzlangan (salted) bir yo'nalishli hash algoritmidan foydalanasiz. Bunday yondashuvda siz faqat hash qilingan parollarni saqlaysiz, so'ng saqlangan parolni **kiruvchi** parolning hash qilingan nusxasi bilan solishtirasiz, natijada parolni oddiy matn ko'rinishida hech qachon saqlamaysiz yoki oshkor qilmaysiz. Namuna ilovani sodda saqlash uchun bu qat'iy talabni buzib, oddiy matndan foydalanamiz. **Buni haqiqiy ilovangizda qilmang!**

Endi `AuthModule` ni `UsersModule` ni import qiladigan qilib yangilaymiz.

```typescript
@@filename(auth/auth.module)
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
@@switch
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
```

Shu bilan, `AuthController` ni ochib, unga `signIn()` metodini qo'shamiz. Bu metod klient tomonidan foydalanuvchini autentifikatsiya qilish uchun chaqiriladi. U so'rov bodysida username va parolni oladi va foydalanuvchi autentifikatsiya qilingan bo'lsa JWT token qaytaradi.

```typescript
@@filename(auth/auth.controller)
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}
```

> info **Hint** Ideal holatda, `Record<string, any>` o'rniga so'rov body shaklini belgilovchi DTO klassidan foydalanishimiz kerak. Batafsil ma'lumot uchun [validation](/docs/techniques/validation) bobiga qarang.

#### JWT token

Endi auth tizimimizning JWT qismiga o'tishga tayyormiz. Talablarimizni qayta ko'rib chiqamiz va aniqlashtiramiz:

- Foydalanuvchilarga username/parol bilan autentifikatsiya qilishga ruxsat berish va himoyalangan API endpointlariga keyingi chaqiruvlarda ishlatish uchun JWT qaytarish. Bu talabning katta qismi bajarildi. Uni yakunlash uchun JWT chiqaradigan kodni yozishimiz kerak.
- Yaroqli JWT bearer token mavjudligiga qarab himoyalanadigan API routelarini yaratish

JWT talablarini qo'llab-quvvatlash uchun yana bitta paket o'rnatishimiz kerak:

```bash
$ npm install --save @nestjs/jwt
```

> info **Hint** `@nestjs/jwt` paketi (batafsil bu yerda) JWT bilan ishlashni osonlashtiradigan yordamchi paketdir. Bu JWT tokenlarini yaratish va tekshirishni o'z ichiga oladi.

Servislarimizni aniq modullashgan holda saqlash uchun JWT ni `authService` da generatsiya qilamiz. `auth` papkasidagi `auth.service.ts` faylini oching, `JwtService` ni inject qiling va `signIn` metodini quyidagicha JWT token yaratadigan qilib yangilang:

```typescript
@@filename(auth/auth.service)
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
@@switch
import { Injectable, Dependencies, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Dependencies(UsersService, JwtService)
@Injectable()
export class AuthService {
  constructor(usersService, jwtService) {
    this.usersService = usersService;
    this.jwtService = jwtService;
  }

  async signIn(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

Biz `@nestjs/jwt` kutubxonasidan foydalanmoqdamiz; u `user` obyektining bir qismidan JWT yaratish uchun `signAsync()` funksiyasini beradi, so'ng biz uni bitta `access_token` xossasiga ega oddiy obyekt sifatida qaytaramiz. Eslatma: `userId` qiymatini JWT standartlariga mos ravishda `sub` xossasida saqlashni tanlaymiz.

Endi `AuthModule` ni yangi bog'liqliklarni import qiladigan va `JwtModule` ni sozlaydigan qilib yangilashimiz kerak.

Avval `auth` papkasida `constants.ts` yarating va quyidagi kodni qo'shing:

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

JWT ni imzolash va tekshirish bosqichlari uchun kalitni shu yerda ulashamiz.

> Warning **Warning** **Bu kalitni ommaga oshkor qilmang**. Bu yerda kod nimani qilayotganini aniq ko'rsatish uchun shunday qildik, ammo production tizimda **bu kalitni himoya qilishingiz kerak**, masalan, secrets vault, environment variable yoki konfiguratsiya xizmati orqali.

Endi `auth` papkasidagi `auth.module.ts` ni ochib, uni quyidagicha yangilang:

```typescript
@@filename(auth/auth.module)
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
@@switch
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

> info **Hint** `JwtModule` ni global sifatida ro'yxatdan o'tkazyapmiz, bu ishimizni osonlashtiradi. Bu shuni anglatadiki, ilovaning boshqa joyida `JwtModule` ni import qilish shart emas.

`JwtModule` ni `register()` orqali konfiguratsiya obyektini uzatib sozlaymiz. Nest `JwtModule` haqida ko'proq bu yerda va mavjud konfiguratsiya opsiyalari haqida ko'proq bu yerda o'qing.

Endi marshrutlarimizni yana cURL bilan sinab ko'ramiz. `UsersService` da qattiq kodlangan `user` obyektlaridan birini ishlatib test qilishingiz mumkin.

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated
```

#### Autentifikatsiya guardini implementatsiya qilish

Endi yakuniy talabni bajarishimiz mumkin: endpointlarni himoyalash uchun so'rovda yaroqli JWT bo'lishini talab qilish. Buni routelarimizni himoya qilish uchun ishlatiladigan `AuthGuard` yaratish orqali qilamiz.

```typescript
@@filename(auth/auth.guard)
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: jwtConstants.secret
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

Endi himoyalangan route ni implementatsiya qilib, uni himoyalash uchun `AuthGuard` ni ro'yxatdan o'tkazamiz.

`auth.controller.ts` faylini ochib, uni quyidagicha yangilang:

```typescript
@@filename(auth.controller)
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

Biz hozirgina yaratgan `AuthGuard` ni `GET /profile` route ga qo'lladik, shuning uchun u himoyalangan bo'ladi.

Ilova ishga tushganini tekshiring va routelarni `cURL` bilan sinab ko'ring.

```bash
$ # GET /profile
$ curl http://localhost:3000/auth/profile
{"statusCode":401,"message":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."}

$ # GET /profile using access_token returned from previous step as bearer code
$ curl http://localhost:3000/auth/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
{"sub":1,"username":"john","iat":...,"exp":...}
```

E'tibor bering, `AuthModule` da JWT ning amal qilish muddati `60 seconds` deb sozlangan. Bu juda qisqa muddat, va tokenning muddati tugashi hamda refresh tafsilotlarini ko'rib chiqish bu maqola doirasidan tashqarida. Biroq, biz buni JWTlarning muhim xususiyatini ko'rsatish uchun tanladik. Agar autentifikatsiyadan keyin 60 soniya kutib, `GET /auth/profile` so'rovini yuborsangiz, `401 Unauthorized` javobini olasiz. Buning sababi `@nestjs/jwt` JWT ning amal qilish vaqtini avtomatik tekshiradi, siz ilovangizda buni qo'lda qilishdan qutulasiz.

Biz endi JWT autentifikatsiya implementatsiyasini yakunladik. JavaScript klientlari (Angular/React/Vue kabi) va boshqa JavaScript ilovalari endi API serverimiz bilan autentifikatsiya qilib, xavfsiz tarzda muloqot qilishi mumkin.

#### Autentifikatsiyani global yoqish

Agar endpointlaringizning aksariyati default bo'yicha himoyalangan bo'lishi kerak bo'lsa, autentifikatsiya guardini [global guard](/docs/core/guards#binding-guards) sifatida ro'yxatdan o'tkazishingiz mumkin va har bir controller ustida `@UseGuards()` dekoratorini qo'yish o'rniga, qaysi routelar public ekanini belgilashingiz mumkin.

Avval `AuthGuard` ni global guard sifatida quyidagi konstruktsiya bilan ro'yxatdan o'tkazing (istalgan modulda, masalan, `AuthModule` da):

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
],
```

Shu bilan, Nest avtomatik ravishda barcha endpointlarga `AuthGuard` ni bog'laydi.

Endi routelarni public deb belgilash mexanizmini ta'minlashimiz kerak. Buning uchun `SetMetadata` dekorator factory funksiyasi yordamida custom dekorator yaratamiz.

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Yuqoridagi faylda ikkita konstantani eksport qildik: biri metadata kalitimiz `IS_PUBLIC_KEY`, ikkinchisi esa `Public` deb ataladigan yangi dekoratorimiz (xohlasangiz `SkipAuth` yoki `AllowAnon` deb ham nomlashingiz mumkin, loyihangizga mos bo'lsa).

Endi custom `@Public()` dekoratorimiz bor, uni istalgan metodni bezash uchun quyidagicha ishlatishimiz mumkin:

```typescript
@Public()
@Get()
findAll() {
  return [];
}
```

Nihoyat, `AuthGuard` "isPublic" metadata topilganda `true` qaytarishi kerak. Buning uchun `Reflector` klassidan foydalanamiz (batafsil [bu yerda](/docs/core/guards#putting-it-all-together)).

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

#### Passport integratsiyasi

Passport node.js uchun eng mashhur autentifikatsiya kutubxonasi bo'lib, hamjamiyat tomonidan yaxshi tanilgan va ko'plab production ilovalarda muvaffaqiyatli qo'llanadi. Bu kutubxonani **Nest** ilovasiga `@nestjs/passport` moduli yordamida oson integratsiya qilish mumkin.

Passport ni NestJS bilan qanday integratsiya qilish haqida [bu bob](/docs/recipes/passport)da o'qing.

#### Misol

Ushbu bobdagi kodning to'liq versiyasini bu yerda topishingiz mumkin.
