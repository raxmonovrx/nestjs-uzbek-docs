---
title: "Umumiy ko'rinish"
navTitle: "Umumiy ko'rinish"
description: "An'anaviy (ba'zan monolitik deb ataladigan) ilova arxitekturalaridan tashqari, Nest microservice arxitektura uslubini nativ tarzda qo'llab-quvvatlaydi. Hujjatlarning boshqa joylari"
order: 1
group: microservices
groupTitle: "Microservices"
---
An'anaviy (ba'zan monolitik deb ataladigan) ilova arxitekturalaridan tashqari, Nest microservice arxitektura uslubini nativ tarzda qo'llab-quvvatlaydi. Hujjatlarning boshqa joylarida muhokama qilingan ko'plab tushunchalar, masalan dependency injection, dekoratorlar, exception filterlar, pipelar, guardlar va interceptorlar microservicelarga ham birdek qo'llanadi. Imkon qadar Nest implementatsiya tafsilotlarini abstraksiyalaydi, shuning uchun bir xil komponentlar HTTP asosidagi platformalar, WebSockets va Microservices bo'ylab ishlay oladi. Bu bo'lim microservicelarga xos bo'lgan Nest jihatlarini qamrab oladi.

Nest'da microservice aslida HTTPdan boshqa **transport** qatlamidan foydalanadigan ilovadir.

Nest bir nechta ichki transport qatlam implementatsiyalarini qo'llab-quvvatlaydi, ular **transporters** deb ataladi va turli microservice instansiyalari orasida xabarlarni uzatish uchun mas'ul. Ko'pgina transportyorlar nativ tarzda ham **request-response**, ham **event-based** xabar uslublarini qo'llab-quvvatlaydi. Nest har bir transportyorning implementatsiya tafsilotlarini request-response va event-based messaging uchun yagona kanonik interfeys ortiga yashiradi. Bu aniq bir transport qatlamining ishonchliligi yoki ishlash xususiyatlaridan foydalanish uchun boshqa transport qatlamiga oson o'tish imkonini beradi va ilova kodingizga ta'sir qilmaydi.

#### O'rnatish

Microservice qurishni boshlash uchun avval kerakli paketni o'rnating:

```bash
$ npm i --save @nestjs/microservices
```

#### Boshlash

Microservice instansiyasini yaratish uchun `NestFactory` klassining `createMicroservice()` metodidan foydalaning:

```typescript
@@filename(main)
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
    },
  );
  await app.listen();
}
bootstrap();
@@switch
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
  });
  await app.listen();
}
bootstrap();
```

> info **Hint** Microservicelar default bo'yicha **TCP** transport qatlamidan foydalanadi.

`createMicroservice()` metodining ikkinchi argumenti `options` obyekti. Bu obyekt ikki a'zodan iborat bo'lishi mumkin:

<table>
  <tr>
    <td><code>transport</code></td>
    <td>Transportyorni ko'rsatadi (masalan, <code>Transport.NATS</code>)</td>
  </tr>
  <tr>
    <td><code>options</code></td>
    <td>Transportyorga xos options obyekti, transportyorning xatti-harakatini belgilaydi</td>
  </tr>
</table>
<p>
  <code>options</code> obyekti tanlangan transportyorga xos. <strong>TCP</strong> transportyori quyida tasvirlangan propertylarni ochadi.  Boshqa transportyorlar (masalan, Redis, MQTT va h.k.) uchun mavjud options tavsifi tegishli bobda berilgan.
</p>
<table>
  <tr>
    <td><code>host</code></td>
    <td>Ulanish hostname'i</td>
  </tr>
  <tr>
    <td><code>port</code></td>
    <td>Ulanish porti</td>
  </tr>
  <tr>
    <td><code>retryAttempts</code></td>
    <td>Xabarni qayta urinishlar soni (default: <code>0</code>)</td>
  </tr>
  <tr>
    <td><code>retryDelay</code></td>
    <td>Xabarni qayta urinishlar orasidagi kechikish (ms) (default: <code>0</code>)</td>
  </tr>
  <tr>
    <td><code>serializer</code></td>
    <td>Chiquvchi xabarlar uchun custom serializer</td>
  </tr>
  <tr>
    <td><code>deserializer</code></td>
    <td>Kiruvchi xabarlar uchun custom deserializer</td>
  </tr>
  <tr>
    <td><code>socketClass</code></td>
    <td><code>TcpSocket</code>ni kengaytiradigan custom Socket (default: <code>JsonSocket</code>)</td>
  </tr>
  <tr>
    <td><code>tlsOptions</code></td>
    <td>tls protokolini sozlash options'lari</td>
  </tr>
</table>

> info **Hint** Yuqoridagi propertylar TCP transportyoriga xos. Boshqa transportyorlar uchun mavjud options haqida ma'lumot olish uchun tegishli bobga murojaat qiling.

#### Xabar va hodisa patternlari

Microservicelar xabarlar va hodisalarni **patternlar** orqali tan oladi. Pattern - bu oddiy qiymat, masalan literal obyekt yoki string. Patternlar avtomatik tarzda serializatsiya qilinadi va xabarning data qismi bilan birga tarmoq orqali yuboriladi. Shu tariqa, xabar yuboruvchilar va iste'molchilar qaysi so'rovlar qaysi handlerlar tomonidan iste'mol qilinishini muvofiqlashtira oladi.

#### So'rov-javob

Request-response xabar uslubi turli tashqi servislar orasida xabarlarni **almashish** kerak bo'lganda foydali. Bu paradigma servis xabarni haqiqatan ham qabul qilganini ta'minlaydi (acknowledgment protokolini qo'lda implement qilmasdan). Biroq request-response yondashuvi har doim ham eng mos bo'lmasligi mumkin. Masalan, log asosidagi persistence dan foydalanadigan Kafka yoki NATS streaming kabi streaming transportyorlar boshqa turdagi muammolarga optimallashtirilgan bo'lib, event messaging paradigmasiga ko'proq mos keladi (batafsil [event-based messaging](/docs/microservices/basics#event-based) ga qarang).

Request-response xabar turini yoqish uchun Nest ikki mantiqiy kanal yaratadi: biri ma'lumot uzatish, ikkinchisi kiruvchi javoblarni kutish uchun. NATS kabi ayrim transportlar uchun bu ikki kanalli qo'llab-quvvatlash qutidan tayyor. Boshqalarida esa Nest alohida kanallarni qo'lda yaratish orqali kompensatsiya qiladi. Bu samarali bo'lsa-da, ba'zi ortiqcha yuk keltirishi mumkin. Shu sababli, agar sizga request-response xabar uslubi kerak bo'lmasa, event-based usuldan foydalanishni ko'rib chiqing.

Request-response paradigmasi asosida message handler yaratish uchun `@MessagePattern()` dekoratoridan foydalaning, u `@nestjs/microservices` paketidan import qilinadi. Bu dekoratordan faqat [controller](/docs/core/controllers) klasslarida foydalanish kerak, chunki ular ilovangizning kirish nuqtalari hisoblanadi. Uni providerlarda ishlatish hech qanday ta'sir ko'rsatmaydi, chunki Nest runtime tomonidan e'tiborga olinmaydi.

```typescript
@@filename(math.controller)
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }
}
@@switch
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data) {
    return (data || []).reduce((a, b) => a + b);
  }
}
```

Yuqoridagi kodda `accumulate()` **message handler** `{{ '{' }} cmd: 'sum' {{ '}' }}` message patterniga mos keladigan xabarlarni tinglaydi. Message handler bitta argument oladi - mijozdan uzatilgan `data`. Bu holatda data yig'ish kerak bo'lgan sonlar massividir.

#### Asinxron javoblar

Message handlerlar sinxron yoki **asinxron** javob bera oladi, ya'ni `async` metodlar qo'llab-quvvatlanadi.

```typescript
@@filename()
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}
@@switch
@MessagePattern({ cmd: 'sum' })
async accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```

Message handler `Observable` ham qaytarishi mumkin, bu holda stream tugaguncha natija qiymatlar emit qilinadi.

```typescript
@@filename()
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}
@@switch
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}
```

Yuqoridagi misolda message handler **uch marta** javob beradi, massivdagi har bir element uchun bir martadan.

#### Eventga asoslangan

Request-response usuli servislar o'rtasida xabar almashish uchun juda qulay, ammo faqat **event**larni publish qilishni xohlaganda va javob kutmasangiz, event-based messaging uchun u unchalik mos emas. Bunday holatlarda request-response uchun ikki kanalni ushlab turish ortiqcha bo'ladi.

Masalan, tizimning bu qismida muayyan shart yuz bergani haqida boshqa servisni xabardor qilmoqchi bo'lsangiz, event-based xabar uslubi ideal bo'ladi.

Event handler yaratish uchun `@nestjs/microservices` paketidan import qilinadigan `@EventPattern()` dekoratoridan foydalanishingiz mumkin.

```typescript
@@filename()
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}
@@switch
@EventPattern('user_created')
async handleUserCreated(data) {
  // business logic
}
```

> info **Hint** Bitta event pattern uchun bir nechta event handlerlarni ro'yxatdan o'tkazishingiz mumkin va ularning barchasi avtomatik ravishda parallel ishlaydi.

`handleUserCreated()` **event handler** `'user_created'` eventini tinglaydi. Event handler bitta argument oladi - mijozdan uzatilgan `data` (bu holatda tarmoq orqali yuborilgan event payload).

#### Qo'shimcha so'rov tafsilotlari

Murakkabroq ssenariylarda kiruvchi so'rov haqida qo'shimcha tafsilotlarga kirish kerak bo'lishi mumkin. Masalan, wildcard subscriptionlar bilan NATS ishlatayotganda, producent xabarni yuborgan original subjectni olishni xohlashingiz mumkin. Xuddi shuningdek, Kafka bilan xabar sarlavhalariga kirish kerak bo'lishi mumkin. Bunga erishish uchun quyida ko'rsatilgandek built-in dekoratorlardan foydalanishingiz mumkin:

```typescript
@@filename()
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('time.us.*')
getDate(data, context) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
```

> info **Hint** `@Payload()`, `@Ctx()` va `NatsContext` `@nestjs/microservices` paketidan import qilinadi.

> info **Hint** `@Payload()` dekoratoriga property key ham uzatib, kiruvchi payload obyektidan aniq bir propertyni ajratib olishingiz mumkin, masalan, `@Payload('id')`.

#### Client (producer klassi)

Client Nest ilovasi Nest microservice bilan xabar almashishi yoki event publish qilishi uchun `ClientProxy` klassidan foydalanishi mumkin. Bu klass `send()` (request-response messaging uchun) va `emit()` (event-driven messaging uchun) kabi bir nechta metodlarni taqdim etadi va masofaviy microservice bilan muloqot qilishga imkon beradi. Bu klass instansiyasini quyidagi yo'llar bilan olishingiz mumkin:

Bitta yondashuv - `ClientsModule`ni import qilish bo'lib, u `register()` statik metodini ochadi. Bu metod microservice transportyorlarini ifodalovchi obyektlar massivini qabul qiladi. Har bir obyekt `name` propertysini o'z ichiga olishi kerak va ixtiyoriy `transport` propertysi (default `Transport.TCP`) hamda ixtiyoriy `options` propertysi bo'lishi mumkin.

`name` propertysi **injection token** sifatida ishlaydi va zarur joyda `ClientProxy` instansiyasini inject qilish uchun foydalaniladi. Bu `name` qiymati here da ta'riflanganidek, istalgan string yoki JavaScript symbol bo'lishi mumkin.

`options` propertysi oldin `createMicroservice()` metodida ko'rganimizdek, xuddi shu propertylarni o'z ichiga olgan obyektdir.

```typescript
@Module({
  imports: [
    ClientsModule.register([
      { name: 'MATH_SERVICE', transport: Transport.TCP },
    ]),
  ],
})
```

Agar sozlash jarayonida konfiguratsiya berish yoki boshqa asinxron jarayonlarni bajarish kerak bo'lsa, `registerAsync()` metodidan ham foydalanishingiz mumkin.

```typescript
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'MATH_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            url: configService.get('URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
})
```

Modul import qilingandan so'ng, `@Inject()` dekoratori yordamida `'MATH_SERVICE'` transportyori uchun ko'rsatilgan options bilan sozlangan `ClientProxy` instansiyasini inject qilishingiz mumkin.

```typescript
constructor(
  @Inject('MATH_SERVICE') private client: ClientProxy,
) {}
```

> info **Hint** `ClientsModule` va `ClientProxy` klasslari `@nestjs/microservices` paketidan import qilinadi.

Ba'zan transportyor konfiguratsiyasini client ilovasida hard-code qilish o'rniga boshqa servisdan (masalan, `ConfigService`) olish kerak bo'lishi mumkin. Bunga erishish uchun `ClientProxyFactory` klassi yordamida custom provider ro'yxatdan o'tkazishingiz mumkin. Bu klass transportyor options obyektini qabul qilib, moslashtirilgan `ClientProxy` instansiyasini qaytaradigan statik `create()` metodini taqdim etadi.

```typescript
@Module({
  providers: [
    {
      provide: 'MATH_SERVICE',
      useFactory: (configService: ConfigService) => {
        const mathSvcOptions = configService.getMathSvcOptions();
        return ClientProxyFactory.create(mathSvcOptions);
      },
      inject: [ConfigService],
    }
  ]
  ...
})
```

> info **Hint** `ClientProxyFactory` `@nestjs/microservices` paketidan import qilinadi.

Yana bir variant - `@Client()` property dekoratoridan foydalanish.

```typescript
@Client({ transport: Transport.TCP })
client: ClientProxy;
```

> info **Hint** `@Client()` dekoratori `@nestjs/microservices` paketidan import qilinadi.

`@Client()` dekoratoridan foydalanish afzal usul emas, chunki u test qilishni qiyinlashtiradi va client instansiyasini ulashish ham qiyinroq.

`ClientProxy` **lazy**. U ulanishni darhol boshlamaydi. Buning o'rniga, birinchi microservice chaqiruvigacha ulanish o'rnatiladi va keyingi chaqiruvlar davomida qayta ishlatiladi. Biroq, agar ulanish o'rnatilmaguncha ilovani bootstrapping qilishni kechiktirmoqchi bo'lsangiz, `OnApplicationBootstrap` lifecycle hook ichida `ClientProxy` obyektining `connect()` metodini chaqirib, ulanishni qo'lda boshlashingiz mumkin.

```typescript
@@filename()
async onApplicationBootstrap() {
  await this.client.connect();
}
```

Agar ulanish yaratilmasa, `connect()` metodi mos xato obyektini qaytarib, reject qiladi.

#### Xabarlarni yuborish

`ClientProxy` `send()` metodini taqdim etadi. Bu metod microservice'ni chaqirish uchun mo'ljallangan va javob bilan `Observable` qaytaradi. Shunday qilib, emit bo'layotgan qiymatlarga osongina subscribe bo'lamiz.

```typescript
@@filename()
accumulate(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send<number>(pattern, payload);
}
@@switch
accumulate() {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send(pattern, payload);
}
```

`send()` metodi `pattern` va `payload` degan ikki argumentni oladi. `pattern` `@MessagePattern()` dekoratorida aniqlanganlardan biriga mos bo'lishi kerak. `payload` esa masofaviy microservice'ga uzatmoqchi bo'lgan xabarimizdir. Bu metod **cold `Observable`** qaytaradi, ya'ni xabar yuborilishi uchun aniq `subscribe` qilish kerak.

#### Eventlarni publish qilish

Event yuborish uchun `ClientProxy` obyektining `emit()` metodidan foydalaning. Bu metod eventni message brokerga publish qiladi.

```typescript
@@filename()
async publish() {
  this.client.emit<number>('user_created', new UserCreatedEvent());
}
@@switch
async publish() {
  this.client.emit('user_created', new UserCreatedEvent());
}
```

`emit()` metodi `pattern` va `payload` degan ikki argumentni oladi. `pattern` `@EventPattern()` dekoratorida aniqlanganlardan biriga mos bo'lishi kerak, `payload` esa masofaviy microservice'ga uzatmoqchi bo'lgan event ma'lumotidir. Bu metod **hot `Observable`** qaytaradi (`send()` qaytaradigan cold `Observable`dan farqli), ya'ni observable'ga subscribe qilsangiz ham, qilmasangiz ham, proxy eventni darhol yetkazishga urinadi.

#### So'rov scoping

Turli dasturlash tillari fonidan kelganlar uchun Nest'da ko'p narsalar kiruvchi so'rovlar bo'ylab umumiy ekanini bilish ajablanarli bo'lishi mumkin. Bunga ma'lumotlar bazasiga ulanish pooli, global holatli singleton servislar va boshqalar kiradi. E'tibor bering, Node.js request/response multi-threaded stateless modelga amal qilmaydi, bu modelda har bir so'rov alohida thread tomonidan qayta ishlanadi. Natijada singleton instansiyalarni ishlatish ilovalarimiz uchun **xavfsiz**.

Biroq, ba'zi chekka holatlarda handler uchun requestga bog'liq lifetime kerak bo'lishi mumkin. Bunga GraphQL ilovalarida har-so'rov keshlash, request tracking yoki multi-tenancy kabi ssenariylar kiradi. Scope'larni qanday boshqarish haqida batafsil here da o'qishingiz mumkin.

Request-scoped handlerlar va providerlar `@Inject()` dekoratori va `CONTEXT` tokeni kombinatsiyasi orqali `RequestContext`ni inject qilishi mumkin:

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT, RequestContext } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private ctx: RequestContext) {}
}
```

Bu `RequestContext` obyektiga kirish beradi, unda ikki property mavjud:

```typescript
export interface RequestContext<T = any> {
  pattern: string | Record<string, any>;
  data: T;
}
```

`data` propertysi message producent yuborgan xabar payloadidir. `pattern` propertysi esa kiruvchi xabarni qayta ishlaydigan mos handlerni aniqlash uchun ishlatiladigan pattern.

#### Instansiya holati yangilanishlari

Ulanish va asosiy driver instansiyasi holati haqida real vaqt yangilanishlarini olish uchun `status` streamiga subscribe bo'lishingiz mumkin. Bu stream tanlangan driverga xos holat yangilanishlarini beradi. Masalan, TCP transportyoridan (default) foydalanayotgan bo'lsangiz, `status` streami `connected` va `disconnected` eventlarini emit qiladi.

```typescript
this.client.status.subscribe((status: TcpStatus) => {
  console.log(status);
});
```

> info **Hint** `TcpStatus` tipi `@nestjs/microservices` paketidan import qilinadi.

Xuddi shuningdek, serverning `status` streamiga subscribe bo'lib, server holati haqida xabarlarni olishingiz mumkin.

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: TcpStatus) => {
  console.log(status);
});
```

#### Ichki eventlarni tinglash

Ba'zi holatlarda microservice tomonidan emit qilinadigan ichki eventlarni tinglashni xohlashingiz mumkin. Masalan, xato yuz berganda qo'shimcha operatsiyalarni ishga tushirish uchun `error` eventini tinglashingiz mumkin. Buning uchun quyida ko'rsatilgandek `on()` metodidan foydalaning:

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

Xuddi shuningdek, serverning ichki eventlarini tinglashingiz mumkin:

```typescript
server.on<TcpEvents>('error', (err) => {
  console.error(err);
});
```

> info **Hint** `TcpEvents` tipi `@nestjs/microservices` paketidan import qilinadi.

#### Asosiy driverga kirish

Murakkabroq use-case'larda asosiy driver instansiyasiga kirish kerak bo'lishi mumkin. Bu ulanishni qo'lda yopish yoki driverga xos metodlardan foydalanish kabi ssenariylar uchun foydali. Biroq, ko'p hollarda driverga to'g'ridan-to'g'ri kirish **kerak emas**ligini yodda tuting.

Buning uchun `unwrap()` metodidan foydalanishingiz mumkin, u asosiy driver instansiyasini qaytaradi. Generic type parametri kutilayotgan driver instansiyasi turini ko'rsatishi kerak.

```typescript
const netServer = this.client.unwrap<Server>();
```

Bu yerda `Server` `net` modulidan import qilinadigan tip.

Xuddi shuningdek, serverning asosiy driver instansiyasiga kirishingiz mumkin:

```typescript
const netServer = server.unwrap<Server>();
```

#### Timeoutlarni boshqarish

Distribyutlangan tizimlarda microservice'lar ba'zan ishlamay qolishi yoki mavjud bo'lmasligi mumkin. Cheksiz kutishni oldini olish uchun timeoutlardan foydalanishingiz mumkin. Timeout boshqa servislarga murojaat qilishda juda foydali pattern hisoblanadi. Microservice chaqiruvlariga timeout qo'llash uchun RxJS `timeout` operatoridan foydalanishingiz mumkin. Agar microservice belgilangan vaqt ichida javob bermasa, xato chiqariladi va uni mos ravishda ushlab, qayta ishlashingiz mumkin.

Buni amalga oshirish uchun `rxjs` paketidan foydalaning. Shunchaki pipe ichida `timeout` operatorini ishlating:

```typescript
@@filename()
this.client
  .send<TResult, TInput>(pattern, data)
  .pipe(timeout(5000));
@@switch
this.client
  .send(pattern, data)
  .pipe(timeout(5000));
```

> info **Hint** `timeout` operatori `rxjs/operators` paketidan import qilinadi.

5 soniyadan so'ng, microservice javob bermasa, xato chiqaradi.

#### TLS qo'llab-quvvatlash

Shaxsiy tarmoqdan tashqarida muloqot qilganda xavfsizlik uchun trafikni shifrlash muhim. NestJS'da bu Node'ning built-in TLS moduli yordamida TCP ustida TLS bilan amalga oshiriladi. Nest TCP transportida TLSni built-in qo'llab-quvvatlaydi va microservice'lar yoki clientlar orasidagi muloqotni shifrlash imkonini beradi.

TCP serveri uchun TLSni yoqish uchun PEM formatidagi private key va sertifikat kerak bo'ladi. Bular server options'iga `tlsOptions`ni o'rnatib, key va cert fayllarini ko'rsatish orqali qo'shiladi:

```typescript
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const key = fs.readFileSync('<pathToKeyFile>', 'utf8').toString();
  const cert = fs.readFileSync('<pathToCertFile>', 'utf8').toString();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        tlsOptions: {
          key,
          cert,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
```

Client TLS orqali xavfsiz muloqot qilishi uchun biz `tlsOptions` obyektini bu safar CA sertifikati bilan belgilaymiz. Bu server sertifikatini imzolagan authority sertifikatidir. Bu client server sertifikatiga ishonishini va xavfsiz ulanishni o'rnata olishini ta'minlaydi.

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.TCP,
        options: {
          tlsOptions: {
            ca: [fs.readFileSync('<pathToCaFile>', 'utf-8').toString()],
          },
        },
      },
    ]),
  ],
})
export class AppModule {}
```

Agar sozlashingiz bir nechta ishonchli authority'larni o'z ichiga olsa, CA'lar massivini ham uzatishingiz mumkin.

Hammasi sozlangach, servislaringizda clientdan foydalanish uchun `@Inject()` dekoratori orqali `ClientProxy`ni odatdagidek inject qilishingiz mumkin. Bu Node'ning `TLS` moduli shifrlash tafsilotlarini boshqaradigan NestJS microservice'lari bo'ylab shifrlangan muloqotni ta'minlaydi.

Batafsil ma'lumot uchun Node'ning TLS documentation hujjatiga murojaat qiling.

#### Dinamik konfiguratsiya

Microservice'ni `ConfigService` ( `@nestjs/config` paketidan) orqali sozlash kerak bo'lganda, lekin injection context faqat microservice instansiyasi yaratilgandan keyin mavjud bo'lsa, `AsyncMicroserviceOptions` yechim beradi. Bu yondashuv dinamik konfiguratsiyaga imkon beradi va `ConfigService` bilan silliq integratsiyani ta'minlaydi.

```typescript
import { ConfigService } from '@nestjs/config';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('HOST'),
          port: configService.get<number>('PORT'),
        },
      }),
      inject: [ConfigService],
    },
  );

  await app.listen();
}
bootstrap();
```
