---
title: "CRUD generator (faqat TypeScript)"
navTitle: "CRUD generator (faqat TypeScript)"
description: "Loyiha davomida yangi imkoniyatlar qo'shayotganda ilovamizga yangi resurslarni qo'shishimizga to'g'ri keladi. Bu resurslar odatda har safar yangi resurs aniqlaganimizda takrorlanad"
order: 3
group: recipes
groupTitle: "Recipes"
---
Loyiha davomida yangi imkoniyatlar qo'shayotganda ilovamizga yangi resurslarni qo'shishimizga to'g'ri keladi. Bu resurslar odatda har safar yangi resurs aniqlaganimizda takrorlanadigan ko'p amallarni talab qiladi.

#### Kirish

Keling, **User** va **Product** entitetlari uchun CRUD endpointlari taqdim etishimiz kerak bo'lgan real holatni tasavvur qilaylik.
Eng yaxshi amaliyotlarga ko'ra, har bir entitet uchun quyidagi bir nechta amallarni bajarishimiz kerak bo'ladi:

- Kodni tartibli saqlash va aniq chegaralar o'rnatish (bog'liq komponentlarni guruhlash) uchun modul yaratish (`nest g mo`)
- CRUD marshrutlarini (yoki GraphQL ilovalari uchun query/mutatsiyalarni) belgilash uchun controller yaratish (`nest g co`)
- Biznes mantiqni amalga oshirish va ajratish uchun servis yaratish (`nest g s`)
- Resurs ma'lumotlar tuzilmasini ifodalash uchun entitet klass/interfeys yaratish
- Ma'lumotlar tarmoq orqali qanday yuborilishini belgilash uchun Data Transfer Object larni (yoki GraphQL ilovalari uchun inputlarni) yaratish

Bu juda ko'p qadamlar!

Bu takroriy jarayonni tezlashtirish uchun [Nest CLI](/docs/cli/overview) barcha boilerplate kodni avtomatik generatsiya qiluvchi generator (sxema) taqdim etadi, bu bizni bularni qo'lda bajarishdan qutqaradi va ishlab chiquvchi tajribasini ancha soddalashtiradi.

> info **Note** Sxema **HTTP** controllerlari, **Microservice** controllerlari, **GraphQL** resolverlarga (code first va schema first) hamda **WebSocket** Gatewaylarga kod generatsiya qilishni qo'llab-quvvatlaydi.

#### Yangi resurs yaratish

Yangi resurs yaratish uchun loyihangiz ildiz katalogida quyidagi buyruqni bajaring:

```shell
$ nest g resource
```

`nest g resource` buyrug'i NestJS ning barcha asosiy qismlarini (modul, servis, controller klasslari) emas, balki entitet klassi, DTO klasslari va test (`.spec`) fayllarini ham generatsiya qiladi.

Quyida generatsiya qilingan controller faylini (REST API uchun) ko'rishingiz mumkin:

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

Shuningdek, u barcha CRUD endpointlar uchun plaseholderlarni (REST API lar uchun marshrutlar, GraphQL uchun query va mutatsiyalar, Microservice va WebSocket Gatewaylar uchun xabar obunalari) avtomatik yaratadi.

> warning **Note** Generatsiya qilingan servis klasslari ma'lum bir **ORM (yoki ma'lumotlar manbasi)** ga bog'lanmagan. Bu generatorni har qanday loyiha ehtiyojlariga yetarlicha moslashuvchan qiladi. Standart holatda barcha metodlar plaseholderlarga ega bo'ladi, shuning uchun ularni loyihangizga xos ma'lumotlar manbalariga moslab to'ldirishingiz mumkin.

Xuddi shunday, GraphQL ilovasi uchun resolverlar yaratmoqchi bo'lsangiz, transport qatlami sifatida `GraphQL (code first)` (yoki `GraphQL (schema first)`) ni tanlang.

Bu holda NestJS REST API controlleri o'rniga resolver klassini generatsiya qiladi:

```shell
$ nest g resource users

> ? What transport layer do you use? GraphQL (code first)
> ? Would you like to generate CRUD entry points? Yes
> CREATE src/users/users.module.ts (224 bytes)
> CREATE src/users/users.resolver.spec.ts (525 bytes)
> CREATE src/users/users.resolver.ts (1109 bytes)
> CREATE src/users/users.service.spec.ts (453 bytes)
> CREATE src/users/users.service.ts (625 bytes)
> CREATE src/users/dto/create-user.input.ts (195 bytes)
> CREATE src/users/dto/update-user.input.ts (281 bytes)
> CREATE src/users/entities/user.entity.ts (187 bytes)
> UPDATE src/app.module.ts (312 bytes)
```

> info **Hint** Test fayllar generatsiya qilinmasligi uchun `--no-spec` flagini berishingiz mumkin: `nest g resource users --no-spec`

Quyida ko'rib turganingizdek, nafaqat barcha boilerplate mutatsiya va querylar yaratilgan, balki hammasi bir-biriga bog'langan: `UsersService`, `User` entiteti va DTOlardan foydalanilmoqda.

```typescript
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
```
