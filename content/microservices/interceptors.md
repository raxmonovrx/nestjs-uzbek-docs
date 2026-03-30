---
title: "Interceptorlar"
navTitle: "Interceptorlar"
description: "regular interceptors va microservices interceptorlari o'rtasida farq yo'q. Quyidagi misolda qo'lda instansiyalangan method-scoped interceptor ishlatiladi. HTTP asosidagi ilovalar k"
order: 6
group: microservices
groupTitle: "Microservices"
---
[regular interceptors](/docs/core/interceptors) va microservices interceptorlari o'rtasida farq yo'q. Quyidagi misolda qo'lda instansiyalangan method-scoped interceptor ishlatiladi. HTTP asosidagi ilovalar kabi, controller-scoped interceptorlardan ham foydalanishingiz mumkin (ya'ni, controller klassiga `@UseInterceptors()` dekoratorini qo'shing).

```typescript
@@filename()
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
@@switch
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```
