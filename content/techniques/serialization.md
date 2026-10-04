---
title: "Serializatsiya"
navTitle: "Serializatsiya"
description: "Serializatsiya tarmoq javobida obyektlar qaytarilishidan oldin sodir bo'ladigan jarayondir. Bu klientga qaytariladigan ma'lumotlarni transformatsiya qilish va sanitizatsiya qilish "
order: 13
group: techniques
groupTitle: "Techniques"
---
Serializatsiya tarmoq javobida obyektlar qaytarilishidan oldin sodir bo'ladigan jarayondir. Bu klientga qaytariladigan ma'lumotlarni transformatsiya qilish va sanitizatsiya qilish qoidalarini taqdim etish uchun mos joy. Masalan, parollar kabi maxfiy ma'lumotlar har doim javobdan chiqarib tashlanishi kerak. Yoki, ayrim xossalar qo'shimcha transformatsiyani talab qilishi mumkin, masalan, entity ning faqat ma'lum xossalarini yuborish. Bu transformatsiyalarni qo'lda bajarish zerikarli va xatolarga moyil bo'lishi mumkin, va barcha holatlar qamrab olinganiga ishonchsizlik qoldiradi.

#### Umumiy ko'rinish

Nest bu operatsiyalarni sodda tarzda bajarishga yordam beradigan ichki imkoniyatni taqdim etadi. `ClassSerializerInterceptor` interceptori kuchli class-transformer paketidan foydalanib, obyektlarni transformatsiya qilishning deklarativ va kengaytiriladigan usulini beradi. U bajaradigan asosiy ish - metod handleridan qaytgan qiymatni olib, class-transformer dan `instanceToPlain()` funksiyasini qo'llash. Shu orqali u quyida ko'rsatilganidek entity/DTO klassida `class-transformer` dekoratorlari bilan ifodalangan qoidalarni qo'llay oladi.

> info **Hint** Serializatsiya [StreamableFile](/docs/techniques/streaming-files#streamablefile-klassi) javoblariga qo'llanilmaydi.

#### Xossalarni chiqarib tashlash

Keling, `password` xossasini user entity dan avtomatik chiqarib tashlamoqchi ekanimizni faraz qilaylik. Entity ni quyidagicha belgilaymiz:

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
```

Endi ushbu klass instansiyasini qaytaradigan metod handlerga ega controllerni ko'rib chiqamiz.

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    password: 'password',
  });
}
```

> **Warning** Eslatma: biz klass instansiyasini qaytarishimiz kerak. Masalan, `{{ '{' }} user: new UserEntity() {{ '}' }}` kabi oddiy JavaScript obyektini qaytarsangiz, obyekt to'g'ri serializatsiya qilinmaydi.

> info **Hint** `ClassSerializerInterceptor` `@nestjs/common` paketidan import qilinadi.

Ushbu endpoint so'ralganda, klient quyidagi javobni oladi:

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}
```

Interceptor ilova bo'ylab qo'llanishi mumkinligini unutmang (bu [bu yerda](/docs/core/interceptors#interceptorlarni-ulash) yoritilgan). Interceptor va entity klass deklaratsiyasining kombinatsiyasi `UserEntity` qaytaradigan **har qanday** metod `password` xossasini olib tashlashini kafolatlaydi. Bu biznes qoidalarini markazlashgan tarzda ijro etishning bir usulini beradi.

#### Xossalarni chiqarish

`@Expose()` dekoratori orqali xossalarga alias nomlar berishingiz yoki xossa qiymatini hisoblash uchun funksiya bajarishingiz mumkin (bu **getter** funksiyalariga o'xshash), quyida ko'rsatilgandek.

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
```

#### Transform

Qo'shimcha ma'lumot transformatsiyasini `@Transform()` dekoratori orqali bajarishingiz mumkin. Masalan, quyidagi konstruktsiya butun obyektni qaytarish o'rniga `RoleEntity` ning `name` xossasini qaytaradi.

```typescript
@Transform(({ value }) => value.name)
role: RoleEntity;
```

#### Opsiyalarni uzatish

Transformatsiya funksiyalarining default xatti-harakatini o'zgartirishni xohlashingiz mumkin. Default sozlamalarni override qilish uchun `@SerializeOptions()` dekoratoriga `options` obyektini uzating.

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}
```

> info **Hint** `@SerializeOptions()` dekoratori `@nestjs/common` paketidan import qilinadi.

`@SerializeOptions()` orqali uzatilgan opsiyalar ichki `instanceToPlain()` funksiyasining ikkinchi argumenti sifatida uzatiladi. Bu misolda, `_` prefiksi bilan boshlanadigan barcha xossalar avtomatik chiqarib tashlanadi.

#### Oddiy obyektlarni transformatsiya qilish

`@SerializeOptions` dekoratoridan foydalanib controller darajasida transformatsiyalarni majburlashingiz mumkin. Bu barcha javoblar ko'rsatilgan klass instansiyalariga aylantirilishini va class-validator yoki class-transformer dekoratorlari qo'llanishini ta'minlaydi, hatto oddiy obyektlar qaytarilganida ham. Bu yondashuv kodni yanada toza qiladi va klassni qayta-qayta instansiyalash yoki `plainToInstance` chaqirish zaruratini yo'q qiladi.

Quyidagi misolda, ikkala shartli tarmoqda ham oddiy JavaScript obyektlarini qaytarayotgan bo'lsak-da, ular avtomatik ravishda `UserEntity` instansiyalariga aylantiriladi va tegishli dekoratorlar qo'llanadi:

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: UserEntity })
@Get()
findOne(@Query() { id }: { id: number }): UserEntity {
  if (id === 1) {
    return {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
    };
  }

  return {
    id: 2,
    firstName: 'Kamil',
    lastName: 'Mysliwiec',
    password: 'password2',
  };
}
```

> info **Hint** Controller uchun kutilayotgan qaytish tipini ko'rsatish orqali TypeScript ning type-checking imkoniyatlaridan foydalanib, qaytariladigan oddiy obyekt DTO yoki entity shakliga mos kelishini tekshirishingiz mumkin. `plainToInstance` funksiyasi bunday type hinting darajasini bermaydi, bu esa oddiy obyekt kutilgan DTO yoki entity tuzilmasiga mos kelmasa, potensial xatolarga olib kelishi mumkin.

#### Misol

Ishlaydigan misol bu yerda mavjud.

#### WebSockets va Microservices

Bu bob HTTP uslubidagi ilovalar (masalan, Express yoki Fastify) misollarini ko'rsatsa-da, `ClassSerializerInterceptor` ishlatilayotgan transport usulidan qat'i nazar WebSockets va Microservices uchun xuddi shunday ishlaydi.

#### Batafsil

`class-transformer` paketida taqdim etilgan mavjud dekoratorlar va opsiyalar haqida batafsil bu yerda o'qing.
