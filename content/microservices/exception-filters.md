---
title: "Exception filterlar"
navTitle: "Exception filterlar"
description: "HTTP exception filter qatlamidan microservices qatlamiga yagona farq shundaki, HttpException tashlash o'rniga RpcExceptiondan foydalanishingiz kerak."
order: 3
group: microservices
groupTitle: "Microservices"
---
HTTP [exception filter](/docs/core/exception-filters) qatlamidan microservices qatlamiga yagona farq shundaki, `HttpException` tashlash o'rniga `RpcException`dan foydalanishingiz kerak.

```typescript
throw new RpcException('Invalid credentials.');
```

> info **Hint** `RpcException` klassi `@nestjs/microservices` paketidan import qilinadi.

Yuqoridagi namunada Nest tashlangan exceptionni qayta ishlaydi va quyidagi struktura bilan `error` obyektini qaytaradi:

```json
{
  "status": "error",
  "message": "Invalid credentials."
}
```

#### Filterlar

Microservice exception filterlari HTTP exception filterlariga o'xshash ishlaydi, bitta kichik farq bilan. `catch()` metodi `Observable` qaytarishi kerak.

```typescript
@@filename(rpc-exception.filter)
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(() => exception.getError());
  }
}
@@switch
import { Catch } from '@nestjs/common';
import { throwError } from 'rxjs';

@Catch(RpcException)
export class ExceptionFilter {
  catch(exception, host) {
    return throwError(() => exception.getError());
  }
}
```

> warning **Warning** [hybrid application](/docs/faq/hybrid-application) ishlatilganda global microservice exception filterlari default bo'yicha yoqilmaydi.

Quyidagi misolda qo'lda instansiyalangan method-scoped filter ishlatiladi. HTTP asosidagi ilovalar kabi, controller-scoped filterlardan ham foydalanishingiz mumkin (ya'ni, controller klassiga `@UseFilters()` dekoratorini qo'shing).

```typescript
@@filename()
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
@@switch
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```

#### Meros olish

Odatda, ilovangiz talablariga moslashtirilgan to'liq custom exception filterlar yaratasiz. Biroq, ayrim hollarda shunchaki **core exception filter**ni kengaytirib, ayrim omillarga qarab xatti-harakatni override qilishni xohlashingiz mumkin.

Exceptionni bazaviy filterga delegatsiya qilish uchun `BaseExceptionFilter`ni kengaytirib, meros bo'lib kelgan `catch()` metodini chaqirishingiz kerak.

```typescript
@@filename()
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    return super.catch(exception, host);
  }
}
@@switch
import { Catch } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception, host) {
    return super.catch(exception, host);
  }
}
```

Yuqoridagi implementatsiya yondashuvni ko'rsatadigan soddalashtirilgan skelet xolos. Kengaytirilgan exception filteringiz implementatsiyasida sizning moslashtirilgan **biznes mantiqingiz** (masalan, turli shartlarni qayta ishlash) bo'ladi.
