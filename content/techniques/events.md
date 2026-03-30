---
title: "Events"
navTitle: "Events"
description: "Event Emitter paketi (@nestjs/event-emitter) sodda observer implementatsiyasini taqdim etadi va ilovangizda sodir bo'ladigan turli hodisalarni subscribe qilib tinglash imkonini ber"
order: 5
group: techniques
groupTitle: "Techniques"
---
Event Emitter paketi (`@nestjs/event-emitter`) sodda observer implementatsiyasini taqdim etadi va ilovangizda sodir bo'ladigan turli hodisalarni subscribe qilib tinglash imkonini beradi. Events ilovangizning turli qismlarini ajratish uchun juda yaxshi yo'l, chunki bitta event bir-biriga bog'liq bo'lmagan bir nechta listenerga ega bo'lishi mumkin.

`EventEmitterModule` ichkarida eventemitter2 paketidan foydalanadi.

#### Boshlash

Avval kerakli paketni o'rnating:

```shell
$ npm i --save @nestjs/event-emitter
```

O'rnatish tugagach, `EventEmitterModule` ni root `AppModule` ga import qiling va quyida ko'rsatilgandek `forRoot()` statik metodini ishga tushiring:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot()
  ],
})
export class AppModule {}
```

`.forRoot()` chaqiruvi event emitter'ni inicializatsiya qiladi va ilovangizda mavjud bo'lgan deklarativ event listenerlarni ro'yxatdan o'tkazadi. Ro'yxatdan o'tkazish `onApplicationBootstrap` lifecycle hook sodir bo'lganda amalga oshadi, bu esa barcha modullar yuklanganini va rejalashtirilgan ishlarni e'lon qilganini ta'minlaydi.

Asosiy `EventEmitter` instansiyasini sozlash uchun `forRoot()` metodiga konfiguratsiya obyektini uzating, quyidagicha:

```typescript
EventEmitterModule.forRoot({
  // set this to `true` to use wildcards
  wildcard: false,
  // the delimiter used to segment namespaces
  delimiter: '.',
  // set this to `true` if you want to emit the newListener event
  newListener: false,
  // set this to `true` if you want to emit the removeListener event
  removeListener: false,
  // the maximum amount of listeners that can be assigned to an event
  maxListeners: 10,
  // show event name in memory leak message when more than maximum amount of listeners is assigned
  verboseMemoryLeak: false,
  // disable throwing uncaughtException if an error event is emitted and it has no listeners
  ignoreErrors: false,
});
```

#### Eventlarni yuborish

Eventni yuborish (ya'ni, fire qilish) uchun avval odatiy konstruktor in'eksiyasi orqali `EventEmitter2` ni kiriting:

```typescript
constructor(private eventEmitter: EventEmitter2) {}
```

> info **Hint** `EventEmitter2` ni `@nestjs/event-emitter` paketidan import qiling.

So'ng uni sinfda quyidagicha ishlating:

```typescript
this.eventEmitter.emit(
  'order.created',
  new OrderCreatedEvent({
    orderId: 1,
    payload: {},
  }),
);
```

#### Eventlarni tinglash

Event listenerni e'lon qilish uchun bajariladigan kod joylashgan metoddan oldin `@OnEvent()` dekoratorini qo'ying, quyidagicha:

```typescript
@OnEvent('order.created')
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}
```

> warning **Warning** Event subscriberlar request-scoped bo'la olmaydi.

Birinchi argument oddiy event emitter uchun `string` yoki `symbol` bo'lishi mumkin, wildcard emitter holatida esa `string | symbol | Array<string | symbol>` bo'lishi mumkin.

Ikkinchi argument (ixtiyoriy) - listener opsiyalari obyektidir, quyidagicha:

```typescript
export type OnEventOptions = OnOptions & {
  /**
   * If "true", prepends (instead of append) the given listener to the array of listeners.
   *
   * @see https://github.com/EventEmitter2/EventEmitter2#emitterprependlistenerevent-listener-options
   *
   * @default false
   */
  prependListener?: boolean;

  /**
   * If "true", the onEvent callback will not throw an error while handling the event. Otherwise, if "false" it will throw an error.
   *
   * @default true
   */
  suppressErrors?: boolean;
};
```

> info **Hint** `OnOptions` opsiyalar obyektining tafsilotlari uchun `eventemitter2` hujjatlariga qarang.

```typescript
@OnEvent('order.created', { async: true })
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}
```

Namespace/wildcardlardan foydalanish uchun `EventEmitterModule#forRoot()` metodiga `wildcard` opsiyasini uzating. Namespace/wildcardlar yoqilganda, eventlar delimiter bilan ajratilgan satrlar (`foo.bar`) yoki massivlar (`['foo', 'bar']`) bo'lishi mumkin. Delimiter ham konfiguratsiya xossasi (`delimiter`) orqali sozlanadi. Namespaces yoqilganda eventlarga wildcard orqali subscribe bo'lishingiz mumkin:

```typescript
@OnEvent('order.*')
handleOrderEvents(payload: OrderCreatedEvent | OrderRemovedEvent | OrderUpdatedEvent) {
  // handle and process an event
}
```

Bu wildcard faqat bitta blokka taalluqli. `order.*` argumenti masalan `order.created` va `order.shipped` eventlariga mos keladi, ammo `order.delayed.out_of_stock` ga mos kelmaydi. Bunday eventlarni tinglash uchun `multilevel wildcard` patternidan (ya'ni `**`) foydalaning, bu `EventEmitter2` hujjatlarida ta'riflangan.

Ushbu pattern bilan, masalan, barcha eventlarni ushlaydigan listener yaratishingiz mumkin.

```typescript
@OnEvent('**')
handleEverything(payload: any) {
  // handle and process an event
}
```

> info **Hint** `EventEmitter2` sinfi eventlar bilan ishlash uchun `waitFor` va `onAny` kabi bir nechta foydali metodlarni taqdim etadi. Ular haqida batafsil bu yerda o'qing.

#### Event yo'qolishining oldini olish

`onApplicationBootstrap` lifecycle hookidan oldin yoki uning davomida ishga tushgan eventlar — masalan, modul konstruktori yoki `onModuleInit` metodi ichidagi eventlar — listenerlar hali o'rnatilib bo'lmagan bo'lsa, o'tkazib yuborilishi mumkin.

Bunga yo'l qo'ymaslik uchun `EventEmitterReadinessWatcher` ning `waitUntilReady` metodidan foydalanishingiz mumkin; u barcha listenerlar ro'yxatdan o'tgach resolve bo'ladigan promise qaytaradi. Bu metod modulning `onApplicationBootstrap` lifecycle hookida chaqirilib, barcha eventlar to'g'ri ushlanishini ta'minlaydi.

```typescript
await this.eventEmitterReadinessWatcher.waitUntilReady();
this.eventEmitter.emit(
  'order.created',
  new OrderCreatedEvent({ orderId: 1, payload: {} }),
);
```

> info **Note** Bu faqat `onApplicationBootstrap` lifecycle hooki tugashidan oldin yuborilgan eventlar uchun kerak bo'ladi.

#### Misol

Ishlaydigan misol bu yerda mavjud.
