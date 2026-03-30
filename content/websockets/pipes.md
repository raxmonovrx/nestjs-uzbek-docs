---
title: "Pipes"
navTitle: "Pipes"
description: "regular pipes va web sockets pipes o'rtasida fundamental farq yo'q. Yagona farq shundaki, HttpException tashlash o'rniga WsExceptiondan foydalanishingiz kerak. Bundan tashqari, bar"
order: 6
group: websockets
groupTitle: "WebSockets"
---
[regular pipes](/docs/core/pipes) va web sockets pipes o'rtasida fundamental farq yo'q. Yagona farq shundaki, `HttpException` tashlash o'rniga `WsException`dan foydalanishingiz kerak. Bundan tashqari, barcha pipe'lar faqat `data` parametriga qo'llanadi (chunki `client` instansiyasini validatsiya qilish yoki transform qilish foydasiz).

> info **Hint** `WsException` klassi `@nestjs/websockets` paketidan taqdim etiladi.

#### Pipelarni bog'lash

Quyidagi misolda qo'lda instansiyalangan method-scoped pipe ishlatiladi. HTTP asosidagi ilovalar kabi, gateway-scoped pipe'larni ham ishlatishingiz mumkin (ya'ni, gateway klassiga `@UsePipes()` dekoratorini qo'shing).

```typescript
@@filename()
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
@@switch
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client, data) {
  const event = 'events';
  return { event, data };
}
```
