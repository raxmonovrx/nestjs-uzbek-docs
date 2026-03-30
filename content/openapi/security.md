---
title: "Xavfsizlik"
navTitle: "Xavfsizlik"
description: "Ma'lum operatsiya uchun qaysi xavfsizlik mexanizmlari ishlatilishini belgilash uchun @ApiSecurity() dekoratoridan foydalaning."
order: 7
group: openapi
groupTitle: "OpenAPI"
---
Ma'lum operatsiya uchun qaysi xavfsizlik mexanizmlari ishlatilishini belgilash uchun `@ApiSecurity()` dekoratoridan foydalaning.

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

Ilovangizni ishga tushirishdan oldin, `DocumentBuilder` yordamida bazaviy hujjatingizga xavfsizlik ta'rifini qo'shishni unutmang:

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});
```

Eng mashhur autentifikatsiya usullarining ayrimlari (masalan, `basic` va `bearer`) ichki ko'makga ega, shuning uchun xavfsizlik mexanizmlarini yuqoridagi kabi qo'lda belgilashingiz shart emas.

#### Basic autentifikatsiya

Basic autentifikatsiyani yoqish uchun `@ApiBasicAuth()` dan foydalaning.

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}
```

Ilovangizni ishga tushirishdan oldin, `DocumentBuilder` yordamida bazaviy hujjatingizga xavfsizlik ta'rifini qo'shishni unutmang:

```typescript
const options = new DocumentBuilder().addBasicAuth();
```

#### Bearer autentifikatsiya

Bearer autentifikatsiyani yoqish uchun `@ApiBearerAuth()` dan foydalaning.

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}
```

Ilovangizni ishga tushirishdan oldin, `DocumentBuilder` yordamida bazaviy hujjatingizga xavfsizlik ta'rifini qo'shishni unutmang:

```typescript
const options = new DocumentBuilder().addBearerAuth();
```

#### OAuth2 autentifikatsiya

OAuth2 ni yoqish uchun `@ApiOAuth2()` dan foydalaning.

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}
```

Ilovangizni ishga tushirishdan oldin, `DocumentBuilder` yordamida bazaviy hujjatingizga xavfsizlik ta'rifini qo'shishni unutmang:

```typescript
const options = new DocumentBuilder().addOAuth2();
```

#### Cookie autentifikatsiya

Cookie autentifikatsiyani yoqish uchun `@ApiCookieAuth()` dan foydalaning.

```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}
```

Ilovangizni ishga tushirishdan oldin, `DocumentBuilder` yordamida bazaviy hujjatingizga xavfsizlik ta'rifini qo'shishni unutmang:

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');
```
