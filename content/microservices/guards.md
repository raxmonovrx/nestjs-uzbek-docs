---
title: "Guardlar"
navTitle: "Guardlar"
description: "Microservice guardlari va regular HTTP application guards o'rtasida fundamental farq yo'q. Yagona farq shundaki, HttpException tashlash o'rniga RpcExceptiondan foydalanishingiz ker"
order: 5
group: microservices
groupTitle: "Microservices"
---
Microservice guardlari va [regular HTTP application guards](/docs/core/guards) o'rtasida fundamental farq yo'q.
Yagona farq shundaki, `HttpException` tashlash o'rniga `RpcException`dan foydalanishingiz kerak.

> info **Hint** `RpcException` klassi `@nestjs/microservices` paketidan taqdim etiladi.

#### Guardlarni bog'lash

Quyidagi misolda method-scoped guard ishlatiladi. HTTP asosidagi ilovalar kabi, controller-scoped guardlardan ham foydalanishingiz mumkin (ya'ni, controller klassiga `@UseGuards()` dekoratorini qo'shing).

```typescript
@@filename()
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
@@switch
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```
