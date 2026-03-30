---
title: "Adapterlar"
navTitle: "Adapterlar"
description: "WebSockets moduli platform-agnostik, shuning uchun WebSocketAdapter interfeysidan foydalanib o'zingizning kutubxonangizni (hatto native implementatsiyani) ulashingiz mumkin. Bu int"
order: 1
group: websockets
groupTitle: "WebSockets"
---
WebSockets moduli platform-agnostik, shuning uchun `WebSocketAdapter` interfeysidan foydalanib o'zingizning kutubxonangizni (hatto native implementatsiyani) ulashingiz mumkin. Bu interfeys quyidagi jadvalda tasvirlangan bir nechta metodlarni implement qilishni majbur qiladi:

<table>
  <tr>
    <td><code>create</code></td>
    <td>Berilgan argumentlar asosida socket instansiyasini yaratadi</td>
  </tr>
  <tr>
    <td><code>bindClientConnect</code></td>
    <td>Mijoz ulanish hodisasini bog'laydi</td>
  </tr>
  <tr>
    <td><code>bindClientDisconnect</code></td>
    <td>Mijoz uzilishi hodisasini bog'laydi (ixtiyoriy*)</td>
  </tr>
  <tr>
    <td><code>bindMessageHandlers</code></td>
    <td>Kirish xabarini mos xabar handleriga bog'laydi</td>
  </tr>
  <tr>
    <td><code>close</code></td>
    <td>Server instansiyasini yakunlaydi</td>
  </tr>
</table>

#### socket.io ni kengaytirish

socket.io paketi `IoAdapter` klassiga o'ralgan. Adapterning asosiy funksionalligini kengaytirmoqchi bo'lsangiz-chi? Masalan, texnik talablaringiz web servisingizning bir nechta load-balance qilingan instansiyalari bo'ylab hodisalarni broadcast qilish imkoniyatini talab qiladi. Buning uchun `IoAdapter`ni kengaytirib, socket.io serverlarini instansiyalash uchun mas'ul bo'lgan bitta metodni override qilishingiz mumkin. Avvalo, kerakli paketni o'rnatamiz.

> warning **Warning** Bir nechta load-balance qilingan instansiyalar bilan socket.io dan foydalanish uchun mijozlaringiz socket.io konfiguratsiyasida `transports: ['websocket']` ni o'rnatib pollingni o'chirishingiz yoki load balanceringizda cookie asosidagi routingni yoqishingiz kerak. Faqat Redisning o'zi yetarli emas. Batafsil ma'lumot uchun here.

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter
```

Paket o'rnatilgach, `RedisIoAdapter` klassini yaratishimiz mumkin.

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

Shundan so'ng, shunchaki yangi yaratilgan Redis adapteringizga o'ting.

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);
```

#### Ws kutubxonasi

Yana bir mavjud adapter bu `WsAdapter` bo'lib, u framework va tezkor, yaxshi sinovdan o'tgan ws kutubxonasi orasida proksi sifatida ishlaydi. Bu adapter native brauzer WebSockets bilan to'liq mos va socket.io paketidan ancha tez. Afsuski, unda tayyor holatda mavjud funksiyalar sezilarli darajada kamroq. Ba'zi holatlarda esa ular shart emas.

> info **Hint** `ws` kutubxonasi namespace ( `socket.io` ommalashtirgan aloqa kanallari) ni qo'llab-quvvatlamaydi. Biroq bu imkoniyatni bir muncha taqlid qilish uchun turli yo'llarda bir nechta `ws` serverlarini mount qilishingiz mumkin (masalan: `@WebSocketGateway({{ '{' }} path: '/users' {{ '}' }})`).

`ws` dan foydalanish uchun avval kerakli paketni o'rnatishimiz kerak:

```bash
$ npm i --save @nestjs/platform-ws
```

Paket o'rnatilgach, adapterga o'tishimiz mumkin:

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

> info **Hint** `WsAdapter` `@nestjs/platform-ws` paketidan import qilinadi.

`wsAdapter` `{{ '{' }} event: string, data: any {{ '}' }}` formatidagi xabarlarni qayta ishlash uchun mo'ljallangan. Agar xabarlarni boshqa formatda qabul qilib, qayta ishlashingiz kerak bo'lsa, ularni talab qilingan formatga aylantirish uchun message parserni sozlashingiz kerak.

```typescript
const wsAdapter = new WsAdapter(app, {
  // To handle messages in the [event, data] format
  messageParser: (data) => {
    const [event, payload] = JSON.parse(data.toString());
    return { event, data: payload };
  },
});
```

Muqobil ravishda, adapter yaratilgandan keyin `setMessageParser` metodidan foydalanib message parserni sozlashingiz mumkin.

#### Kengaytirilgan (custom adapter)

Namoyish uchun ws kutubxonasini qo'lda integratsiya qilamiz. Aytilganidek, bu kutubxona uchun adapter allaqachon yaratilgan va `@nestjs/platform-ws` paketidan `WsAdapter` klassi sifatida ochiq. Soddalashtirilgan implementatsiya taxminan quyidagicha ko'rinishi mumkin:

```typescript
@@filename(ws-adapter)
import * as WebSocket from 'ws';
import { WebSocketAdapter, INestApplicationContext } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

export class WsAdapter implements WebSocketAdapter {
  constructor(private app: INestApplicationContext) {}

  create(port: number, options: any = {}): any {
    return new WebSocket.Server({ port, ...options });
  }

  bindClientConnect(server, callback: Function) {
    server.on('connection', callback);
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap(data => this.bindMessageHandler(data, handlers, process)),
        filter(result => result),
      )
      .subscribe(response => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find(
      handler => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message.data));
  }

  close(server) {
    server.close();
  }
}
```

> info **Hint** ws kutubxonasining imkoniyatlaridan foydalanmoqchi bo'lsangiz, o'zingiznikini yaratish o'rniga ichki `WsAdapter`dan foydalaning.

Shundan so'ng, `useWebSocketAdapter()` metodi orqali custom adapterni sozlashimiz mumkin:

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

#### Misol

`WsAdapter`dan foydalanadigan ishlovchi misol here mavjud.
