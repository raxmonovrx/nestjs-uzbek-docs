---
title: "Pipes"
navTitle: "Pipes"
description: "regular pipes va microservices pipes o'rtasida fundamental farq yo'q. Yagona farq shundaki, HttpException tashlash o'rniga RpcExceptiondan foydalanishingiz kerak."
order: 10
group: microservices
groupTitle: "Microservices"
---
[regular pipes](/docs/core/pipes) va microservices pipes o'rtasida fundamental farq yo'q. Yagona farq shundaki, `HttpException` tashlash o'rniga `RpcException`dan foydalanishingiz kerak.

> info **Hint** `RpcException` klassi `@nestjs/microservices` paketidan taqdim etiladi.

#### Pipelarni bog'lash

Quyidagi misolda qo'lda instansiyalangan method-scoped pipe ishlatiladi. HTTP asosidagi ilovalar kabi, controller-scoped pipe'lardan ham foydalanishingiz mumkin (ya'ni, controller klassiga `@UsePipes()` dekoratorini qo'shing).

```typescript
@@filename()
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
@@switch
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```
