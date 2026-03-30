---
title: "Interceptorlar"
navTitle: "Interceptorlar"
description: "regular interceptors va web sockets interceptorlari o'rtasida farq yo'q. Quyidagi misolda qo'lda instansiyalangan method-scoped interceptor ishlatiladi. HTTP asosidagi ilovalar kab"
order: 5
group: websockets
groupTitle: "WebSockets"
---
[regular interceptors](/docs/core/interceptors) va web sockets interceptorlari o'rtasida farq yo'q. Quyidagi misolda qo'lda instansiyalangan method-scoped interceptor ishlatiladi. HTTP asosidagi ilovalar kabi, gateway-scoped interceptorlardan ham foydalanishingiz mumkin (ya'ni, gateway klassiga `@UseInterceptors()` dekoratorini qo'shing).

```typescript
@@filename()
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
@@switch
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client, data) {
  const event = 'events';
  return { event, data };
}
```
