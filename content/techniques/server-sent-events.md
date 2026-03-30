---
title: "Server-Sent Events"
navTitle: "Server-Sent Events"
description: "Server-Sent Events (SSE) - bu HTTP ulanishi orqali klientga serverdan avtomatik yangilanishlarni olish imkonini beradigan server push texnologiyasi. Har bir bildirishnoma ikki qato"
order: 14
group: techniques
groupTitle: "Techniques"
---
Server-Sent Events (SSE) - bu HTTP ulanishi orqali klientga serverdan avtomatik yangilanishlarni olish imkonini beradigan server push texnologiyasi. Har bir bildirishnoma ikki qatorli bo'sh qatordan iborat ajratgich bilan yakunlangan matn bloki sifatida yuboriladi (batafsil bu yerda).

#### Foydalanish

Marshrutda Server-Sent eventsni yoqish uchun (route **controller klass** ichida ro'yxatdan o'tgan bo'lsa), metod handlerini `@Sse()` dekoratori bilan belgilang.

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}
```

> info **Hint** `@Sse()` dekoratori va `MessageEvent` interfeysi `@nestjs/common` dan, `Observable`, `interval`, va `map` esa `rxjs` paketidan import qilinadi.

> warning **Warning** Server-Sent Events marshrutlari `Observable` stream qaytarishi shart.

Yuqoridagi misolda biz `sse` nomli route aniqladik, u real-time yangilanishlarni tarqatish imkonini beradi. Bu hodisalarni EventSource API orqali tinglash mumkin.

`sse` metodi bir nechta `MessageEvent` ni emit qiladigan `Observable` qaytaradi (bu misolda u har soniyada yangi `MessageEvent` emit qiladi). `MessageEvent` obyekti spetsifikatsiyaga mos kelish uchun quyidagi interfeysga rioya qilishi kerak:

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}
```

Bular joyida bo'lsa, endi klient tomoni ilovamizda `EventSource` klassi instansiyasini yaratishimiz mumkin, konstruktor argumenti sifatida `/sse` route ni uzatib (bu yuqorida `@Sse()` dekoratoriga uzatilgan endpointga mos keladi).

`EventSource` instansiyasi HTTP serveriga doimiy ulanishni ochadi, server esa hodisalarni `text/event-stream` formatida yuboradi. Ulanish `EventSource.close()` chaqirilgunga qadar ochiq qoladi.

Ulanish ochilgach, serverdan kelayotgan xabarlar kodga hodisalar ko'rinishida yetkaziladi. Agar kiruvchi xabarda event maydoni bo'lsa, ishga tushiriladigan hodisa shu event maydoni qiymatiga teng bo'ladi. Agar event maydoni bo'lmasa, umumiy `message` hodisasi chaqiriladi (manba).

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};
```

#### Misol

Ishlaydigan misol bu yerda mavjud.
