---
title: "HTTP adapter"
navTitle: "HTTP adapter"
description: "Ba'zan sizga asosiy HTTP serverga Nest ilova konteksti ichidan yoki tashqarisidan murojaat qilish kerak bo'lishi mumkin."
order: 3
group: faq
groupTitle: "FAQ"
---
Ba'zan sizga asosiy HTTP serverga Nest ilova konteksti ichidan yoki tashqarisidan murojaat qilish kerak bo'lishi mumkin.

Har bir native (platformaga xos) HTTP server/kutubxona (masalan, Express yoki Fastify) instansiyasi **adapter** ichiga o'raladi. Adapter global mavjud provider sifatida ro'yxatdan o'tadi va uni ilova kontekstidan olish yoki boshqa provider'larga inject qilish mumkin.

#### Ilova kontekstidan tashqaridagi usul

Ilova kontekstidan tashqarida `HttpAdapter` ga havola olish uchun `getHttpAdapter()` metodini chaqiring.

```typescript
@@filename()
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();
```

#### Injectable sifatida

Ilova konteksti ichida `HttpAdapterHost` ga havola olish uchun uni boshqa mavjud provider'lar kabi inject qiling (masalan, constructor injection orqali).

```typescript
@@filename()
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}
@@switch
@Dependencies(HttpAdapterHost)
export class CatsService {
  constructor(adapterHost) {
    this.adapterHost = adapterHost;
  }
}
```

> info **Hint** `HttpAdapterHost` `@nestjs/core` paketidan import qilinadi.

`HttpAdapterHost` haqiqiy `HttpAdapter` emas. Haqiqiy `HttpAdapter` instansiyasini olish uchun shunchaki `httpAdapter` xossasiga murojaat qiling.

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
```

`httpAdapter` - bu underlying freymvork ishlatayotgan haqiqiy HTTP adapter instansiyasi. U `ExpressAdapter` yoki `FastifyAdapter` instansiyasi bo'ladi (ikkala class ham `AbstractHttpAdapter` ni extend qiladi).

Adapter obyekti HTTP server bilan ishlash uchun bir nechta foydali metodlarni expose qiladi. Agar kutubxona instansiyasining o'ziga (masalan, Express instansiyasiga) bevosita murojaat qilmoqchi bo'lsangiz, `getInstance()` metodini chaqiring.

```typescript
const instance = httpAdapter.getInstance();
```

#### Listening hodisasi

Server kiruvchi so'rovlarni tinglashni boshlaganda biror amal bajarish uchun quyidagidek `listen$` stream'iga subscribe bo'lishingiz mumkin:

```typescript
this.httpAdapterHost.listen$.subscribe(() =>
  console.log('HTTP server is listening'),
);
```

Bundan tashqari, `HttpAdapterHost` server hozir faol va tinglayotganini bildiruvchi `listening` boolean xossasini taqdim etadi:

```typescript
if (this.httpAdapterHost.listening) {
  console.log('HTTP server is listening');
}
```
