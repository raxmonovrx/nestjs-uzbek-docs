---
title: "Gatewaylar"
navTitle: "Gatewaylar"
description: "Hujjatlarning boshqa joylarida muhokama qilingan ko'plab tushunchalar, masalan, dependency injection, dekoratorlar, exception filterlar, pipelar, guardlar va interceptorlar gateway"
order: 3
group: websockets
groupTitle: "WebSockets"
---
Hujjatlarning boshqa joylarida muhokama qilingan ko'plab tushunchalar, masalan, dependency injection, dekoratorlar, exception filterlar, pipelar, guardlar va interceptorlar gatewaylarga ham birdek qo'llanadi. Imkon qadar Nest implementatsiya tafsilotlarini abstraksiyalaydi, shuning uchun bir xil komponentlar HTTP asosidagi platformalar, WebSockets va Microservices bo'ylab ishlay oladi. Bu bo'lim WebSocketsga xos bo'lgan Nest jihatlarini qamrab oladi.

Nest'da gateway bu shunchaki `@WebSocketGateway()` dekoratori bilan belgilangan klass. Texnik jihatdan gatewaylar platforma-agnostik bo'lib, adapter yaratilgandan so'ng istalgan WebSockets kutubxonasi bilan mos keladi. Qutidan ikkita WS platformasi qo'llab-quvvatlanadi: socket.io va ws. Ehtiyojingizga mosini tanlashingiz mumkin. Shuningdek, ushbu [guide](/docs/websockets/adapter) bo'yicha o'zingizning adapteringizni ham yaratishingiz mumkin.

> info **Hint** Gatewaylar providers sifatida qaralishi mumkin; bu ularning konstruktor orqali dependency inject qilishini anglatadi. Shuningdek, gatewaylarni boshqa klasslar (providerlar va controllerlar) ham inject qilishi mumkin.

#### O'rnatish

WebSockets asosidagi ilovalarni qurishni boshlash uchun avval kerakli paketni o'rnating:

```bash
@@filename()
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
@@switch
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
```

#### Umumiy ko'rinish

Umuman olganda, har bir gateway **HTTP server** bilan bir xil portda tinglaydi, agar ilovangiz web ilova bo'lmasa yoki portni qo'lda o'zgartirmagan bo'lsangiz. Bu standart xatti-harakat `@WebSocketGateway(80)` dekoratoriga argument uzatish orqali o'zgartiriladi, bu yerda `80` tanlangan port raqami. Shuningdek, quyidagi konstruktsiya orqali gateway ishlatadigan namespace ni belgilashingiz mumkin:

```typescript
@WebSocketGateway(80, { namespace: 'events' })
```

> warning **Warning** Gatewaylar mavjud modulning providers massivida ko'rsatilmaguncha instansiyalanmaydi.

Quyida ko'rsatilgandek, `@WebSocketGateway()` dekoratorining ikkinchi argumenti bilan socket konstruktoriga qo'llab-quvvatlanadigan istalgan optionni uzatishingiz mumkin:

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })
```

Gateway endi tinglayapti, ammo biz hali hech qanday kiruvchi xabarlarga obuna bo'lmadiq. Keling, `events` xabarlariga obuna bo'lib, foydalanuvchiga aynan shu ma'lumotni qaytaradigan handler yarataylik.

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}
@@switch
@Bind(MessageBody())
@SubscribeMessage('events')
handleEvent(data) {
  return data;
}
```

> info **Hint** `@SubscribeMessage()` va `@MessageBody()` dekoratorlari `@nestjs/websockets` paketidan import qilinadi.

Gateway yaratilgach, uni modulimizda ro'yxatdan o'tkazishimiz mumkin.

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@@filename(events.module)
@Module({
  providers: [EventsGateway]
})
export class EventsModule {}
```

Shuningdek, dekoratorga property key uzatib, uni kiruvchi xabar body'sidan ajratib olishingiz mumkin:

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}
@@switch
@Bind(MessageBody('id'))
@SubscribeMessage('events')
handleEvent(id) {
  // id === messageBody.id
  return id;
}
```

Agar dekoratorlardan foydalanishni xohlamasangiz, quyidagi kod funksional jihatdan ekvivalent:

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(client: Socket, data: string): string {
  return data;
}
@@switch
@SubscribeMessage('events')
handleEvent(client, data) {
  return data;
}
```

Yuqoridagi misolda `handleEvent()` funksiyasi ikki argumentni qabul qiladi. Birinchisi platformaga xos socket instansiyasi, ikkinchisi esa mijozdan olingan ma'lumot. Biroq bu yondashuv tavsiya etilmaydi, chunki u har bir unit testda `socket` instansiyasini mock qilishni talab qiladi.

`events` xabari qabul qilingach, handler tarmoq orqali yuborilgan ma'lumotning o'zini qaytarib, acknowledgment yuboradi. Bundan tashqari, kutubxonaga xos yondashuv orqali xabarlar emit qilish ham mumkin, masalan, `client.emit()` metodidan foydalanish. Ulangan socket instansiyasiga kirish uchun `@ConnectedSocket()` dekoratoridan foydalaning.

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}
@@switch
@Bind(MessageBody(), ConnectedSocket())
@SubscribeMessage('events')
handleEvent(data, client) {
  return data;
}
```

> info **Hint** `@ConnectedSocket()` dekoratori `@nestjs/websockets` paketidan import qilinadi.

Biroq, bu holatda interceptorlardan foydalana olmaysiz. Agar foydalanuvchiga javob qaytarishni xohlamasangiz, shunchaki `return` statementini tashlab ketishingiz mumkin (yoki aniq "falsy" qiymatni qaytarishingiz mumkin, masalan `undefined`).

Endi mijoz quyidagicha xabar emit qilganda:

```typescript
socket.emit('events', { name: 'Nest' });
```

`handleEvent()` metodi bajariladi. Yuqoridagi handler ichidan emit qilingan xabarlarni eshitish uchun mijoz mos acknowledgment listenerni ulashi kerak:

```typescript
socket.emit('events', { name: 'Nest' }, (data) => console.log(data));
```

Message handlerdan qiymat qaytarish implicit ravishda acknowledgment yuborsa-da, murakkab ssenariylar ko'pincha acknowledgment callbackini bevosita boshqarishni talab qiladi.

`@Ack()` parametr dekoratori `ack` callback funksiyasini to'g'ridan-to'g'ri message handlerga inject qilish imkonini beradi.
Dekoratorsiz bu callback metodning uchinchi argumenti sifatida uzatiladi.

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @Ack() ack: (response: { status: string; data: string }) => void,
) {
  ack({ status: 'received', data });
}
@@switch
@Bind(MessageBody(), Ack())
@SubscribeMessage('events')
handleEvent(data, ack) {
  ack({ status: 'received', data });
}
```

#### Bir nechta javoblar

Acknowledgment faqat bir marta yuboriladi. Bundan tashqari, u native WebSockets implementatsiyasida qo'llab-quvvatlanmaydi. Bu cheklovni yechish uchun ikki propertydan iborat obyekt qaytarishingiz mumkin. `event` - emit qilinadigan hodisa nomi, `data` esa mijozga uzatilishi kerak bo'lgan ma'lumot.

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
@@switch
@Bind(MessageBody())
@SubscribeMessage('events')
handleEvent(data) {
  const event = 'events';
  return { event, data };
}
```

> info **Hint** `WsResponse` interfeysi `@nestjs/websockets` paketidan import qilinadi.

> warning **Warning** Agar `data` maydoni `ClassSerializerInterceptor`ga tayanayotgan bo'lsa, `WsResponse`ni implement qiladigan klass instansiyasini qaytarishingiz kerak, chunki u oddiy JavaScript obyekt javoblarini e'tiborsiz qoldiradi.

Kiruvchi javob(lar)ni eshitish uchun mijoz yana bir event listener ulashi kerak.

```typescript
socket.on('events', (data) => console.log(data));
```

#### Asinxron javoblar

Message handlerlar sinxron yoki **asinxron** javob bera oladi. Shuning uchun `async` metodlar qo'llab-quvvatlanadi. Message handler `Observable` ham qaytarishi mumkin, bu holda stream tugaguncha natija qiymatlar emit qilinadi.

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
onEvent(@MessageBody() data: unknown): Observable<WsResponse<number>> {
  const event = 'events';
  const response = [1, 2, 3];

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}
@@switch
@Bind(MessageBody())
@SubscribeMessage('events')
onEvent(data) {
  const event = 'events';
  const response = [1, 2, 3];

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}
```

Yuqoridagi misolda message handler **3 marta** javob beradi (massivdagi har bir element bilan).

#### Lifecycle hooklar

3 ta foydali lifecycle hook mavjud. Ularning barchasi mos interfeyslarga ega va quyidagi jadvalda tasvirlangan:

<table>
  <tr>
    <td>
      <code>OnGatewayInit</code>
    </td>
    <td>
      <code>afterInit()</code> metodini implement qilishni majbur qiladi. Kutubxonaga xos server instansiyasini argument sifatida oladi (va kerak bo'lsa qolganlarini spread qiladi).
    </td>
  </tr>
  <tr>
    <td>
      <code>OnGatewayConnection</code>
    </td>
    <td>
      <code>handleConnection()</code> metodini implement qilishni majbur qiladi. Kutubxonaga xos client socket instansiyasini argument sifatida oladi.
    </td>
  </tr>
  <tr>
    <td>
      <code>OnGatewayDisconnect</code>
    </td>
    <td>
      <code>handleDisconnect()</code> metodini implement qilishni majbur qiladi. Kutubxonaga xos client socket instansiyasini argument sifatida oladi.
    </td>
  </tr>
</table>

> info **Hint** Har bir lifecycle interfeysi `@nestjs/websockets` paketidan taqdim etiladi.

#### Server va Namespace

Ba'zan native, **platformaga xos** server instansiyasiga bevosita kirishni xohlashingiz mumkin. Bu obyektga referensiya `afterInit()` metodiga (`OnGatewayInit` interfeysi) argument sifatida uzatiladi. Yana bir variant - `@WebSocketServer()` dekoratoridan foydalanish.

```typescript
@WebSocketServer()
server: Server;
```

Shuningdek, quyidagicha `namespace` atributi orqali mos namespace'ni olishingiz mumkin:

```typescript
@WebSocketGateway({ namespace: 'my-namespace' })
export class EventsGateway {
  @WebSocketServer()
  namespace: Namespace;
}
```

`@WebSocketServer()` dekoratori `@WebSocketGateway()` dekoratori saqlagan metadata'ga tayangan holda server instansiyasini inject qiladi. Agar `@WebSocketGateway()` dekoratoriga namespace opsiyasini bersangiz, `@WebSocketServer()` dekoratori `Server` instansiyasi o'rniga `Namespace` instansiyasini qaytaradi.

> warning **Notice** `@WebSocketServer()` dekoratori `@nestjs/websockets` paketidan import qilinadi.

Nest server instansiyasini foydalanishga tayyor bo'lishi bilan avtomatik ravishda ushbu property'ga tayinlaydi.

#### Misol

Ishlaydigan misol here mavjud.
