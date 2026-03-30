---
title: "Exception filterlar"
navTitle: "Exception filterlar"
description: "HTTP exception filter qatlamidan web sockets qatlamiga yagona farq shundaki, HttpException tashlash o'rniga WsExceptiondan foydalanishingiz kerak."
order: 2
group: websockets
groupTitle: "WebSockets"
---
HTTP [exception filter](/docs/core/exception-filters) qatlamidan web sockets qatlamiga yagona farq shundaki, `HttpException` tashlash o'rniga `WsException`dan foydalanishingiz kerak.

```typescript
throw new WsException('Invalid credentials.');
```

> info **Hint** `WsException` klassi `@nestjs/websockets` paketidan import qilinadi.

Yuqoridagi namunada Nest tashlangan exceptionni qayta ishlaydi va quyidagi struktura bilan `exception` xabarini emit qiladi:

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

#### Filterlar

Web sockets exception filterlari HTTP exception filterlariga ekvivalent tarzda ishlaydi. Quyidagi misolda qo'lda instansiyalangan method-scoped filter ishlatiladi. HTTP asosidagi ilovalar kabi, gateway-scoped filterlardan ham foydalanishingiz mumkin (ya'ni, gateway klassiga `@UseFilters()` dekoratorini qo'shing).

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}
```

#### Meros olish

Odatda, ilovangiz talablariga moslashtirilgan to'liq custom exception filterlar yaratasiz. Biroq, ayrim hollarda shunchaki **core exception filter**ni kengaytirib, ayrim omillarga qarab xatti-harakatni override qilishni xohlashingiz mumkin.

Exceptionni bazaviy filterga delegatsiya qilish uchun `BaseWsExceptionFilter`ni kengaytirib, meros bo'lib kelgan `catch()` metodini chaqirishingiz kerak.

```typescript
@@filename()
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
@@switch
import { Catch } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception, host) {
    super.catch(exception, host);
  }
}
```

Yuqoridagi implementatsiya yondashuvni ko'rsatadigan soddalashtirilgan skelet xolos. Kengaytirilgan exception filteringiz implementatsiyasida sizning moslashtirilgan **biznes mantiqingiz** (masalan, turli shartlarni qayta ishlash) bo'ladi.
