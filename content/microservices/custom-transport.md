---
title: "Custom transportyorlar"
navTitle: "Custom transportyorlar"
description: "Nest qutidan turli xil transporterslarni taqdim etadi, shuningdek, yangi custom transport strategiyalarini yaratish imkonini beruvchi API ham bor. Transportyorlar komponentlarni ta"
order: 2
group: microservices
groupTitle: "Microservices"
---
Nest qutidan turli xil **transporters**larni taqdim etadi, shuningdek, yangi custom transport strategiyalarini yaratish imkonini beruvchi API ham bor.
Transportyorlar komponentlarni tarmoq orqali ulanadigan, pluggable aloqa qatlami va juda sodda ilova darajasidagi xabar protokoli orqali bog'lash imkonini beradi (to'liq articleni o'qing).

> info **Hint** Nest bilan microservice qurish degani albatta `@nestjs/microservices` paketidan foydalanish kerak degani emas. Masalan, tashqi servislar bilan muloqot qilmoqchi bo'lsangiz (aytaylik, boshqa tillarda yozilgan microservice'lar), `@nestjs/microservice` kutubxonasi taqdim etadigan barcha imkoniyatlar kerak bo'lmasligi mumkin.
> Aslida, subscriberlarni deklarativ tarzda aniqlash imkonini beradigan dekoratorlar (`@EventPattern` yoki `@MessagePattern`) kerak bo'lmasa, [Standalone Application](/docs/core/application-context)ni ishga tushirish va kanallarga qo'lda ulanish/subscribe qilish ko'p hollarda yetarli bo'ladi va sizga ko'proq moslashuvchanlik beradi.

Custom transporter bilan siz istalgan messaging tizimi/protokolini (jumladan Google Cloud Pub/Sub, Amazon Kinesis va boshqalar) integratsiya qilishingiz yoki mavjudini kengaytirib, qo'shimcha imkoniyatlar qo'shishingiz mumkin (masalan, MQTT uchun QoS).

> info **Hint** Nest microservice'lari qanday ishlashini va mavjud transportyorlar imkoniyatlarini qanday kengaytirish mumkinligini yaxshiroq tushunish uchun NestJS Microservices in Action hamda Advanced NestJS Microservices maqolalar turkumini o'qishni tavsiya qilamiz.

#### Strategiya yaratish

Avval custom transportyerimizni ifodalovchi klassni aniqlaymiz.

```typescript
import { CustomTransportStrategy, Server } from '@nestjs/microservices';

class GoogleCloudPubSubServer
  extends Server
  implements CustomTransportStrategy
{
  /**
   * Triggered when you run "app.listen()".
   */
  listen(callback: () => void) {
    callback();
  }

  /**
   * Triggered on application shutdown.
   */
  close() {}

  /**
   * You can ignore this method if you don't want transporter users
   * to be able to register event listeners. Most custom implementations
   * will not need this.
   */
  on(event: string, callback: Function) {
    throw new Error('Method not implemented.');
  }

  /**
   * You can ignore this method if you don't want transporter users
   * to be able to retrieve the underlying native server. Most custom implementations
   * will not need this.
   */
  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
```

> warning **Warning** Iltimos, ushbu bobda to'liq funksional Google Cloud Pub/Sub serverini implement qilmaymiz, chunki bu transportyorga xos texnik tafsilotlarga chuqur kirishni talab qiladi.

Yuqoridagi misolda `GoogleCloudPubSubServer` klassini e'lon qildik va `CustomTransportStrategy` interfeysi majbur qiladigan `listen()` va `close()` metodlarini taqdim etdik.
Shuningdek, klassimiz `@nestjs/microservices` paketidan import qilingan `Server` klassini kengaytiradi; u Nest runtime tomonidan message handlerlarni ro'yxatdan o'tkazishda foydalaniladigan foydali metodlarni taqdim etadi. Muqobil ravishda, mavjud transport strategiyasi imkoniyatlarini kengaytirmoqchi bo'lsangiz, mos server klassini, masalan `ServerRedis`ni kengaytirishingiz mumkin.
An'anaviy tarzda, biz klass nomiga `"Server"` suffiksini qo'shdik, chunki u xabarlar/eventlarga subscribe qilish (va kerak bo'lsa ularga javob berish) uchun javobgar bo'ladi.

Shu bilan, endi built-in transportyor o'rniga custom strategiyamizdan quyidagicha foydalanishimiz mumkin:

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    strategy: new GoogleCloudPubSubServer(),
  },
);
```

Aslida, `transport` va `options` propertylari bilan odatdagi transport options obyektini berish o'rniga, biz bitta `strategy` propertysini uzatamiz va uning qiymati custom transportyer klassining instansiyasi bo'ladi.

`GoogleCloudPubSubServer` klassimizga qaytsak, real ilovada biz `listen()` metodida message broker/tashqi servisga ulanishni o'rnatib, subscriberlarni ro'yxatdan o'tkazardik (so'ng `close()` teardown metodida obunalarni bekor qilib, ulanishni yopardik),
lekin bu Nest microservice'lar bir-biri bilan qanday muloqot qilishini yaxshi tushunishni talab qiladi, shuning uchun ushbu article seriesni o'qishni tavsiya qilamiz.
Bu bobda esa `Server` klassi taqdim etadigan imkoniyatlar va ularni custom strategiyalar qurishda qanday ishlatishingiz mumkinligiga e'tibor qaratamiz.

Masalan, ilovamizning biror joyida quyidagi message handler aniqlangan bo'lsin:

```typescript
@MessagePattern('echo')
echo(@Payload() data: object) {
  return data;
}
```

Bu message handler Nest runtime tomonidan avtomatik ro'yxatdan o'tkaziladi. `Server` klassi bilan siz qaysi message patternlar ro'yxatdan o'tganini ko'rishingiz va ularga biriktirilgan metodlarga kirish hamda ularni bajarishingiz mumkin.
Buni sinab ko'rish uchun `listen()` metodida `callback` funksiyasi chaqirilishidan oldin oddiy `console.log` qo'shamiz:

```typescript
listen(callback: () => void) {
  console.log(this.messageHandlers);
  callback();
}
```

Ilova qayta ishga tushgandan so'ng terminalda quyidagi logni ko'rasiz:

```typescript
Map { 'echo' => [AsyncFunction] { isEventHandler: false } }
```

> info **Hint** Agar `@EventPattern` dekoratoridan foydalansak, xuddi shu chiqishni ko'rasiz, ammo `isEventHandler` propertysi `true` bo'ladi.

Ko'rib turganingizdek, `messageHandlers` propertysi barcha message (va event) handlerlarining `Map` kolleksiyasidir, unda patternlar key sifatida ishlatiladi.
Endi, masalan, `"echo"` kabi key yordamida message handlerga referensni olishingiz mumkin:

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  console.log(await echoHandler('Hello world!'));
  callback();
}
```

`echoHandler`ni ixtiyoriy string argument bilan chaqirgach (bu yerda `"Hello world!"`), uni konsolda ko'rishimiz kerak:

```json
Hello world!
```

Bu handler metodimiz to'g'ri bajarilganini anglatadi.

[Interceptors](/docs/core/interceptors) bilan `CustomTransportStrategy` ishlatilganda, handlerlar RxJS streamlariga o'raladi. Bu, streamning ichki mantiqi bajarilishi uchun ularga subscribe bo'lishingiz kerakligini anglatadi (masalan, interceptor bajarilgandan so'ng controller mantiqiga o'tish).

Bunga misol quyida ko'rsatilgan:

```typescript
async listen(callback: () => void) {
  const echoHandler = this.messageHandlers.get('echo');
  const streamOrResult = await echoHandler('Hello World');
  if (isObservable(streamOrResult)) {
    streamOrResult.subscribe();
  }
  callback();
}
```

#### Client proksi

Birinchi bo'limda aytib o'tganimizdek, microservice yaratish uchun `@nestjs/microservices` paketidan foydalanishingiz shart emas, lekin agar shunday qilishni xohlasangiz va custom strategiyani integratsiya qilmoqchi bo'lsangiz, sizga "client" klassi ham kerak bo'ladi.

> info **Hint** Yana bir bor, `@nestjs/microservices`ning barcha imkoniyatlariga (masalan, streaming) mos to'liq funksional client klassini implement qilish framework ishlatadigan muloqot texnikalarini yaxshi tushunishni talab qiladi. Batafsil ma'lumot uchun articlega qarang.

Tashqi servis bilan muloqot qilish/xabarlarni emit va publish qilish (yoki eventlar) uchun siz kutubxonaga xos SDK paketidan foydalanishingiz yoki `ClientProxy`ni kengaytiradigan custom client klassini quyidagicha implement qilishingiz mumkin:

```typescript
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';

class GoogleCloudPubSubClient extends ClientProxy {
  async connect(): Promise<any> {}
  async close() {}
  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {}
  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): Function {}
  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
```

> warning **Warning** Iltimos, ushbu bobda to'liq funksional Google Cloud Pub/Sub clientini implement qilmaymiz, chunki bu transportyorga xos texnik tafsilotlarga chuqur kirishni talab qiladi.

Ko'rib turganingizdek, `ClientProxy` klassi bizdan ulanishni o'rnatish va yopish hamda xabarlarni (`publish`) va eventlarni (`dispatchEvent`) yuborish uchun bir nechta metodlarni taqdim etishni talab qiladi.
Eslatma: request-response muloqotini qo'llab-quvvatlash shart bo'lmasa, `publish()` metodini bo'sh qoldirishingiz mumkin. Xuddi shuningdek, event-based muloqotni qo'llab-quvvatlash kerak bo'lmasa, `dispatchEvent()` metodini tashlab keting.

Ushbu metodlar qachon va nimalarni bajarishini ko'rish uchun quyidagicha bir nechta `console.log` qo'shamiz:

```typescript
class GoogleCloudPubSubClient extends ClientProxy {
  async connect(): Promise<any> {
    console.log('connect');
  }

  async close() {
    console.log('close');
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    return console.log('event to dispatch: ', packet);
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): Function {
    console.log('message:', packet);

    // In a real-world application, the "callback" function should be executed
    // with payload sent back from the responder. Here, we'll simply simulate (5 seconds delay)
    // that response came through by passing the same "data" as we've originally passed in.
    //
    // The "isDisposed" bool on the WritePacket tells the response that no further data is
    // expected. If not sent or is false, this will simply emit data to the Observable.
    setTimeout(() => callback({ 
      response: packet.data,
      isDisposed: true,
    }), 5000);

    return () => console.log('teardown');
  }

  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }
}
```

Shu bilan, `GoogleCloudPubSubClient` klassi instansiyasini yaratib, (oldingi boblarda ko'rganingiz kabi) `send()` metodini ishga tushiramiz va qaytgan observable streamga subscribe bo'lamiz.

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .subscribe((response) => console.log(response));
```

Endi terminalda quyidagi chiqishni ko'rasiz:

```typescript
connect
message: { pattern: 'pattern', data: 'Hello world!' }
Hello world! // <-- after 5 seconds
```

"teardown" metodimiz (`publish()` metodi qaytaradigan) to'g'ri bajarilayotganini tekshirish uchun streamga timeout operatorini qo'llaymiz va uni 2 soniyaga o'rnatamiz. Bu `setTimeout` `callback`ni chaqirishidan oldin xatoni chiqarishini ta'minlaydi.

```typescript
const googlePubSubClient = new GoogleCloudPubSubClient();
googlePubSubClient
  .send('pattern', 'Hello world!')
  .pipe(timeout(2000))
  .subscribe(
    (response) => console.log(response),
    (error) => console.error(error.message),
  );
```
