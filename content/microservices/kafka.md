---
title: "Kafka"
navTitle: "Kafka"
description: "Kafka open source, taqsimlangan streaming platforma bo'lib, uchta asosiy imkoniyatga ega:"
order: 7
group: microservices
groupTitle: "Microservices"
---
Kafka open source, taqsimlangan streaming platforma bo'lib, uchta asosiy imkoniyatga ega:

- Yozuvlar oqimini publish va subscribe qilish, message queue yoki enterprise messaging tizimiga o'xshash.
- Yozuvlar oqimini xatolarga chidamli, bardoshli tarzda saqlash.
- Yozuvlar oqimini paydo bo'lishi bilan qayta ishlash.

Kafka loyihasi real vaqt ma'lumot oqimlarini boshqarish uchun yagona, yuqori o'tkazuvchanlik va past kechikishli platformani taqdim etishni maqsad qiladi. U real vaqt streaming data tahlili uchun Apache Storm va Spark bilan juda yaxshi integratsiyalanadi.

#### O'rnatish

Kafka asosidagi microservice'larni qurishni boshlash uchun avval kerakli paketni o'rnating:

```bash
$ npm i --save kafkajs
```

#### Umumiy ko'rinish

Boshqa Nest microservice transport qatlam implementatsiyalari kabi, Kafka transportyer mexanizmini `createMicroservice()` metodiga uzatiladigan options obyektining `transport` propertysi orqali, ixtiyoriy `options` propertysi bilan birga, quyida ko'rsatilgandek tanlaysiz:

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    }
  }
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    }
  }
});
```

> info **Hint** `Transport` enum'i `@nestjs/microservices` paketidan import qilinadi.

#### Opsiyalar

`options` propertysi tanlangan transportyorga xos. <strong>Kafka</strong> transportyori quyida tasvirlangan propertylarni ochadi.

<table>
  <tr>
    <td><code>client</code></td>
    <td>Client konfiguratsiya options'lari (batafsil
      <a
        href="https://kafka.js.org/docs/configuration"
        rel="nofollow"
        target="blank"
        >here</a
      >)</td>
  </tr>
  <tr>
    <td><code>consumer</code></td>
    <td>Consumer konfiguratsiya options'lari (batafsil
      <a
        href="https://kafka.js.org/docs/consuming#a-name-options-a-options"
        rel="nofollow"
        target="blank"
        >here</a
      >)</td>
  </tr>
  <tr>
    <td><code>run</code></td>
    <td>Run konfiguratsiya options'lari (batafsil
      <a
        href="https://kafka.js.org/docs/consuming"
        rel="nofollow"
        target="blank"
        >here</a
      >)</td>
  </tr>
  <tr>
    <td><code>subscribe</code></td>
    <td>Subscribe konfiguratsiya options'lari (batafsil
      <a
        href="https://kafka.js.org/docs/consuming#frombeginning"
        rel="nofollow"
        target="blank"
        >here</a
      >)</td>
  </tr>
  <tr>
    <td><code>producer</code></td>
    <td>Producer konfiguratsiya options'lari (batafsil
      <a
        href="https://kafka.js.org/docs/producing#options"
        rel="nofollow"
        target="blank"
        >here</a
      >)</td>
  </tr>
  <tr>
    <td><code>send</code></td>
    <td>Send konfiguratsiya options'lari (batafsil
      <a
        href="https://kafka.js.org/docs/producing#options"
        rel="nofollow"
        target="blank"
        >here</a
      >)</td>
  </tr>
  <tr>
    <td><code>producerOnlyMode</code></td>
    <td>Consumer group ro'yxatdan o'tishini o'tkazib yuborib, faqat producer sifatida ishlash uchun feature flag (<code>boolean</code>)</td>
  </tr>
  <tr>
    <td><code>postfixId</code></td>
    <td>clientId qiymatining suffiksini o'zgartirish (<code>string</code>)</td>
  </tr>
</table>

#### Mijoz

Kafka boshqa microservice transportyorlariga qaraganda kichik farqqa ega. `ClientProxy` klassi o'rniga `ClientKafkaProxy` klassidan foydalanamiz.

Boshqa microservice transportyorlari kabi, `ClientKafkaProxy` instansiyasini yaratish uchun <a href="/docs/microservices/basics#client">bir nechta variant</a> bor.

Instansiya yaratishning bir usuli - `ClientsModule`dan foydalanish. `ClientsModule` orqali client instansiyasini yaratish uchun uni import qiling va `register()` metodiga `createMicroservice()` metodida yuqorida ko'rsatilgan xuddi shu propertylarga ega options obyektini, shuningdek injection token sifatida ishlatiladigan `name` propertysini uzating. `ClientsModule` haqida batafsil <a href="/docs/microservices/basics#client">here</a>da o'qing.

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HERO_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'hero',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'hero-consumer'
          }
        }
      },
    ]),
  ]
  ...
})
```

Client yaratishning boshqa usullari (`ClientProxyFactory` yoki `@Client()`) ham qo'llanishi mumkin. Ular haqida <a href="/docs/microservices/basics#client">here</a>da o'qishingiz mumkin.

`@Client()` dekoratoridan quyidagicha foydalaning:

```typescript
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer'
    }
  }
})
client: ClientKafkaProxy;
```

#### Xabar patterni

Kafka microservice message patterni so'rov va javob kanallari uchun ikki topicdan foydalanadi. `ClientKafkaProxy.send()` metodi return address bilan xabarlarni, correlation id, reply topic va reply partitionni so'rov xabariga bog'lab yuboradi. Bu xabar yuborishdan oldin `ClientKafkaProxy` instansiyasi reply topicga subscribe qilingan va kamida bitta partitionga biriktirilgan bo'lishini talab qiladi.

Keyin, ishlayotgan har bir Nest ilovasi uchun kamida bitta reply topic partition bo'lishi kerak. Masalan, agar siz 4 ta Nest ilovasini ishlatayotgan bo'lsangiz, lekin reply topicda faqat 3 ta partition bo'lsa, Nest ilovalaridan 1 tasi xabar yuborishga uringanda xatoga uchraydi.

Yangi `ClientKafkaProxy` instansiyalari ishga tushganda ular consumer groupga qo'shiladi va tegishli topiclarga subscribe qiladi. Bu jarayon consumer group iste'molchilariga biriktirilgan topic partitionlarining qayta balanslanishini keltirib chiqaradi.

Odatda topic partitionlari round robin partitioner yordamida biriktiriladi, u topic partitionlarini application ishga tushganda tasodifiy o'rnatiladigan consumer nomlari bo'yicha saralangan consumerlar kolleksiyasiga taqsimlaydi. Biroq, yangi consumer consumer groupga qo'shilganda, u consumerlar kolleksiyasining istalgan joyida joylashishi mumkin. Bu, yangi consumer mavjud consumerdan oldin joylashganda, mavjud consumerlarga boshqa partitionlar berilishiga olib keladi. Natijada, partitioni o'zgargan consumerlar rebalance'dan oldin yuborilgan so'rovlarning response xabarlarini yo'qotadi.

`ClientKafkaProxy` consumerlari response xabarlarini yo'qotmasligi uchun Nest'ga xos built-in custom partitioner ishlatiladi. Bu custom partitioner partitionlarni application ishga tushganda o'rnatilgan yuqori aniqlikdagi timestamp (`process.hrtime()`) bo'yicha saralangan consumerlar kolleksiyasiga taqsimlaydi.

#### Javobga obuna bo'lish

> warning **Note** Bu bo'lim faqat [request-response](/docs/microservices/basics#sorov-javob) message uslubidan foydalansangiz ( `@MessagePattern` dekoratori va `ClientKafkaProxy.send` metodi bilan) tegishli. [event-based](/docs/microservices/basics#eventga-asoslangan) muloqot (`@EventPattern` dekoratori va `ClientKafkaProxy.emit` metodi) uchun response topicga subscribe bo'lish shart emas.

`ClientKafkaProxy` klassi `subscribeToResponseOf()` metodini taqdim etadi. `subscribeToResponseOf()` metodi so'rov topic nomini argument sifatida oladi va hosil qilingan reply topic nomini reply topiclar kolleksiyasiga qo'shadi. Bu metod message patternni implement qilishda talab etiladi.

```typescript
@@filename(heroes.controller)
onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
}
```

Agar `ClientKafkaProxy` instansiyasi asinxron yaratilsa, `subscribeToResponseOf()` metodi `connect()` metodini chaqirishdan oldin chaqirilishi kerak.

```typescript
@@filename(heroes.controller)
async onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
  await this.client.connect();
}
```

#### Kiruvchi

Nest kiruvchi Kafka xabarlarini `key`, `value` va `headers` propertylariga ega obyekt sifatida qabul qiladi; ularning qiymatlari `Buffer` tipida bo'ladi. So'ng Nest bu qiymatlarni bufferlarni stringga aylantirish orqali parse qiladi. Agar string "object like" bo'lsa, Nest uni `JSON` sifatida parse qilishga urinadi. Shundan so'ng `value` o'ziga mos handlerga uzatiladi.

#### Chiquvchi

Nest outgoing Kafka xabarlarini event publish qilish yoki xabar yuborishda serializatsiya jarayonidan so'ng yuboradi. Bu `ClientKafkaProxy`ning `emit()` va `send()` metodlariga uzatilgan argumentlarda yoki `@MessagePattern` metodidan qaytgan qiymatlarda sodir bo'ladi. Bu serializatsiya string bo'lmagan yoki buffer bo'lmagan obyektlarni `JSON.stringify()` yoki `toString()` prototip metodi yordamida "stringify" qiladi.

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const dragonId = message.dragonId;
    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];
    return items;
  }
}
```

> info **Hint** `@Payload()` `@nestjs/microservices` paketidan import qilinadi.

Outgoing xabarlar `key` va `value` propertylariga ega obyekt uzatish orqali key'lanishi ham mumkin. Xabarlarni key'lash co-partitioning requirement talabini bajarish uchun muhim.

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        realm
      },
      key: heroId,
      value: items
    }
  }
}
```

Bundan tashqari, bu formatda uzatilgan xabarlar `headers` hash propertysida o'rnatilgan custom headerlarni ham o'z ichiga olishi mumkin. Header hash property qiymatlari `string` yoki `Buffer` tipida bo'lishi kerak.

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        kafka_nestRealm: realm
      },
      key: heroId,
      value: items
    }
  }
}
```

#### Eventga asoslangan

Request-response usuli servislar o'rtasida xabar almashish uchun ideal bo'lsa-da, xabar uslubi event-based bo'lganda (bu Kafka uchun ideal), ya'ni **javob kutmasdan** event publish qilmoqchi bo'lsangiz, u kamroq mos. Bunday holatda request-response uchun ikki topicni ushlab turish ortiqcha bo'ladi.

Batafsil ma'lumot uchun ushbu ikki bo'limga qarang: [Umumiy ko'rinish: Eventga asoslangan](/docs/microservices/basics#eventga-asoslangan) va [Umumiy ko'rinish: Eventlarni publish qilish](/docs/microservices/basics#eventlarni-publish-qilish).

#### Kontekst

Murakkabroq ssenariylarda kiruvchi so'rov haqida qo'shimcha ma'lumotlarga kirish kerak bo'lishi mumkin. Kafka transportyoridan foydalanganda `KafkaContext` obyektiga kirishingiz mumkin.

```typescript
@@filename()
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('hero.kill.dragon')
killDragon(message, context) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

> info **Hint** `@Payload()`, `@Ctx()` va `KafkaContext` `@nestjs/microservices` paketidan import qilinadi.

Original Kafka `IncomingMessage` obyektiga kirish uchun `KafkaContext` obyektining `getMessage()` metodidan quyidagicha foydalaning:

```typescript
@@filename()
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  const originalMessage = context.getMessage();
  const partition = context.getPartition();
  const { headers, timestamp } = originalMessage;
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('hero.kill.dragon')
killDragon(message, context) {
  const originalMessage = context.getMessage();
  const partition = context.getPartition();
  const { headers, timestamp } = originalMessage;
}
```

Bu yerda `IncomingMessage` quyidagi interfeysga mos keladi:

```typescript
interface IncomingMessage {
  topic: string;
  partition: number;
  timestamp: string;
  size: number;
  attributes: number;
  offset: string;
  key: any;
  value: any;
  headers: Record<string, any>;
}
```

Agar handleringiz har bir qabul qilingan xabar uchun sekin ishlov berishni talab qilsa, `heartbeat` callbackdan foydalanishni ko'rib chiqing. `heartbeat` funksiyasini olish uchun `KafkaContext`ning `getHeartbeat()` metodidan quyidagicha foydalaning:

```typescript
@@filename()
@MessagePattern('hero.kill.dragon')
async killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  const heartbeat = context.getHeartbeat();

  // Do some slow processing
  await doWorkPart1();

  // Send heartbeat to not exceed the sessionTimeout
  await heartbeat();

  // Do some slow processing again
  await doWorkPart2();
}
```

#### Nomlash konventsiyalari

Kafka microservice komponentlari Nest microservice client va server komponentlari o'rtasida kolliziyalarni oldini olish uchun `client.clientId` va `consumer.groupId` opsiyalariga o'z rollarining tavsifini qo'shib boradi. Standart bo'yicha `ClientKafkaProxy` komponentlari `-client`, `ServerKafka` komponentlari esa `-server` suffiksini har ikki optionga ham qo'shadi. Quyida berilgan qiymatlar qanday o'zgartirilganini ko'ring (izohlarda ko'rsatilgan).

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero', // hero-server
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer' // hero-consumer-server
    },
  }
});
```

Va client uchun:

```typescript
@@filename(heroes.controller)
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero', // hero-client
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer' // hero-consumer-client
    }
  }
})
client: ClientKafkaProxy;
```

> info **Hint** Kafka client va consumer naming conventions'ni o'zingizning custom provideringizda `ClientKafkaProxy` va `KafkaServer`ni kengaytirib, konstruktorni override qilish orqali sozlash mumkin.

Kafka microservice message patterni so'rov va javob kanallari uchun ikki topicdan foydalanar ekan, reply pattern so'rov topicidan hosil qilinishi kerak. Standart bo'yicha reply topic nomi so'rov topic nomiga `.reply` qo'shilgan ko'rinish bo'ladi.

```typescript
@@filename(heroes.controller)
onModuleInit() {
  this.client.subscribeToResponseOf('hero.get'); // hero.get.reply
}
```

> info **Hint** Kafka reply topic naming conventions'ni o'zingizning custom provideringizda `ClientKafkaProxy`ni kengaytirib, `getResponsePatternName` metodini override qilish orqali sozlash mumkin.

#### Qayta uriniladigan exceptionlar

Boshqa transportyorlar kabi, barcha qayta ishlanmagan exceptionlar avtomatik tarzda `RpcException`ga o'raladi va "user-friendly" formatga aylantiriladi. Biroq, ba'zi chekka holatlarda bu mexanizmdan chetlab o'tib, exceptionlarni `kafkajs` driveri tomonidan iste'mol qilinishini xohlashingiz mumkin. Xabarni qayta ishlash paytida exception tashlash `kafkajs`ga uni **retry** qilishni (qayta yetkazishni) buyuradi, ya'ni message (yoki event) handler ishga tushgan bo'lsa ham, offset Kafka'ga commit qilinmaydi.

> warning **Warning** Event handlerlar (event-based muloqot) uchun barcha qayta ishlanmagan exceptionlar default bo'yicha **retriable exceptions** hisoblanadi.

Buning uchun `KafkaRetriableException` deb nomlangan maxsus klassdan quyidagicha foydalanishingiz mumkin:

```typescript
throw new KafkaRetriableException('...');
```

> info **Hint** `KafkaRetriableException` klassi `@nestjs/microservices` paketidan eksport qilinadi.

### Custom exceptionlarni boshqarish

Standart error handling mexanizmlariga qo'shimcha ravishda, Kafka eventlari uchun retry logikasini boshqarish maqsadida custom Exception Filter yaratishingiz mumkin. Masalan, quyidagi misolda muammoli eventni ma'lum miqdordagi retrylardan so'ng o'tkazib yuborish ko'rsatilgan:

```typescript
import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { KafkaContext } from '../ctx-host';

@Catch()
export class KafkaMaxRetryExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(KafkaMaxRetryExceptionFilter.name);

  constructor(
    private readonly maxRetries: number,
    // Optional custom function executed when max retries are exceeded
    private readonly skipHandler?: (message: any) => Promise<void>,
  ) {
    super();
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const kafkaContext = host.switchToRpc().getContext<KafkaContext>();
    const message = kafkaContext.getMessage();
    const currentRetryCount = this.getRetryCountFromContext(kafkaContext);

    if (currentRetryCount >= this.maxRetries) {
      this.logger.warn(
        `Max retries (${
          this.maxRetries
        }) exceeded for message: ${JSON.stringify(message)}`,
      );

      if (this.skipHandler) {
        try {
          await this.skipHandler(message);
        } catch (err) {
          this.logger.error('Error in skipHandler:', err);
        }
      }

      try {
        await this.commitOffset(kafkaContext);
      } catch (commitError) {
        this.logger.error('Failed to commit offset:', commitError);
      }
      return; // Stop propagating the exception
    }

    // If retry count is below the maximum, proceed with the default Exception Filter logic
    super.catch(exception, host);
  }

  private getRetryCountFromContext(context: KafkaContext): number {
    const headers = context.getMessage().headers || {};
    const retryHeader = headers['retryCount'] || headers['retry-count'];
    return retryHeader ? Number(retryHeader) : 0;
  }

  private async commitOffset(context: KafkaContext): Promise<void> {
    const consumer = context.getConsumer && context.getConsumer();
    if (!consumer) {
      throw new Error('Consumer instance is not available from KafkaContext.');
    }

    const topic = context.getTopic && context.getTopic();
    const partition = context.getPartition && context.getPartition();
    const message = context.getMessage();
    const offset = message.offset;

    if (!topic || partition === undefined || offset === undefined) {
      throw new Error(
        'Incomplete Kafka message context for committing offset.',
      );
    }

    await consumer.commitOffsets([
      {
        topic,
        partition,
        // When committing an offset, commit the next number (i.e., current offset + 1)
        offset: (Number(offset) + 1).toString(),
      },
    ]);
  }
}
```

Bu filter Kafka eventini configurable miqdorda qayta ishlashga urinish imkonini beradi. Maksimal retrylar soniga yetilgach, u custom `skipHandler`ni (agar berilgan bo'lsa) ishga tushiradi va offsetni commit qiladi, ya'ni muammoli eventni o'tkazib yuboradi. Bu keyingi eventlarning to'xtamasdan qayta ishlanishiga imkon beradi.

Ushbu filterni event handlerlaringizga qo'shish orqali integratsiya qilishingiz mumkin:

```typescript
@UseFilters(new KafkaMaxRetryExceptionFilter(5))
export class MyEventHandler {
  @EventPattern('your-topic')
  async handleEvent(@Payload() data: any, @Ctx() context: KafkaContext) {
    // Your event processing logic...
  }
}
```

#### Offsetlarni commit qilish

Kafka bilan ishlaganda offsetlarni commit qilish muhim. Standart bo'yicha xabarlar ma'lum vaqt o'tgach avtomatik commit qilinadi. Batafsil ma'lumot uchun KafkaJS docsga tashrif buyuring. `KafkaContext` manual commit qilish uchun faol consumerga kirish imkonini beradi. Consumer KafkaJS consumer bo'lib, native KafkaJS implementation kabi ishlaydi.

```typescript
@@filename()
@EventPattern('user.created')
async handleUserCreated(@Payload() data: IncomingMessage, @Ctx() context: KafkaContext) {
  // business logic

  const { offset } = context.getMessage();
  const partition = context.getPartition();
  const topic = context.getTopic();
  const consumer = context.getConsumer();
  await consumer.commitOffsets([{ topic, partition, offset }])
}
@@switch
@Bind(Payload(), Ctx())
@EventPattern('user.created')
async handleUserCreated(data, context) {
  // business logic

  const { offset } = context.getMessage();
  const partition = context.getPartition();
  const topic = context.getTopic();
  const consumer = context.getConsumer();
  await consumer.commitOffsets([{ topic, partition, offset }])
}
```

Xabarlarni auto-commit qilishni o'chirish uchun `run` konfiguratsiyasida `autoCommit: false` ni quyidagicha o'rnating:

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    },
    run: {
      autoCommit: false
    }
  }
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    },
    run: {
      autoCommit: false
    }
  }
});
```

#### Instansiya holati yangilanishlari

Ulanish va asosiy driver instansiyasi holati haqida real vaqt yangilanishlarini olish uchun `status` streamiga subscribe bo'lishingiz mumkin. Bu stream tanlangan driverga xos holat yangilanishlarini beradi. Kafka driveri uchun `status` streami `connected`, `disconnected`, `rebalancing`, `crashed` va `stopped` eventlarini emit qiladi.

```typescript
this.client.status.subscribe((status: KafkaStatus) => {
  console.log(status);
});
```

> info **Hint** `KafkaStatus` tipi `@nestjs/microservices` paketidan import qilinadi.

Xuddi shuningdek, serverning `status` streamiga subscribe bo'lib, server holati haqida xabarlarni olishingiz mumkin.

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: KafkaStatus) => {
  console.log(status);
});
```

#### Asosiy producer va consumer

Murakkabroq use-case'larda asosiy producer va consumer instansiyalariga kirish kerak bo'lishi mumkin. Bu ulanishni qo'lda yopish yoki driverga xos metodlardan foydalanish kabi ssenariylar uchun foydali. Biroq, ko'p hollarda driverga to'g'ridan-to'g'ri kirish **kerak emas**ligini yodda tuting.

Buning uchun `ClientKafkaProxy` instansiyasi taqdim etadigan `producer` va `consumer` getterlaridan foydalanishingiz mumkin.

```typescript
const producer = this.client.producer;
const consumer = this.client.consumer;
```
