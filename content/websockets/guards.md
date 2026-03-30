---
title: "Guardlar"
navTitle: "Guardlar"
description: "Web sockets guardlari bilan regular HTTP application guards o'rtasida fundamental farq yo'q. Yagona farq shundaki, HttpException tashlash o'rniga WsExceptiondan foydalanishingiz ke"
order: 4
group: websockets
groupTitle: "WebSockets"
---
Web sockets guardlari bilan [regular HTTP application guards](/docs/core/guards) o'rtasida fundamental farq yo'q. Yagona farq shundaki, `HttpException` tashlash o'rniga `WsException`dan foydalanishingiz kerak.

> info **Hint** `WsException` klassi `@nestjs/websockets` paketidan taqdim etiladi.

#### Guardlarni bog'lash

Quyidagi misolda method-scoped guard ishlatiladi. HTTP asosidagi ilovalar kabi, gateway-scoped guardlardan ham foydalanishingiz mumkin (ya'ni, gateway klassiga `@UseGuards()` dekoratorini qo'shing).

```typescript
@@filename()
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
@@switch
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client, data) {
  const event = 'events';
  return { event, data };
}
```
