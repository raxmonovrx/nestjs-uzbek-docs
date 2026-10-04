---
title: "gRPC"
navTitle: "gRPC"
description: "gRPC zamonaviy, open source va yuqori unumdor RPC freymvorki bo'lib, istalgan muhitda ishlay oladi. U pluggable load balancing, tracing, health checking va authentication qo'llab-q"
order: 4
group: microservices
groupTitle: "Microservices"
---
gRPC zamonaviy, open source va yuqori unumdor RPC freymvorki bo'lib, istalgan muhitda ishlay oladi. U pluggable load balancing, tracing, health checking va authentication qo'llab-quvvatlashi bilan servislarni data markazlar ichida va ular orasida samarali ulaydi.

Ko'plab RPC tizimlari kabi, gRPC ham masofadan chaqiriladigan funksiyalar (metodlar) nuqtai nazaridan servisni aniqlash konsepsiyasiga asoslanadi. Har bir metod uchun parametrlar va qaytish turlarini aniqlaysiz. Servislar, parametrlar va qaytish turlari Google'ning open source, tildan mustaqil protocol buffers mexanizmi orqali `.proto` fayllarda belgilanadi.

gRPC transportyori bilan Nest `.proto` fayllardan foydalanib client va serverlarni dinamik bog'laydi, bu masofaviy prosedura chaqiruvlarini (RPC) oson implement qilishga, tuzilgan ma'lumotlarni avtomatik serializatsiya va deserializatsiya qilishga yordam beradi.

#### O'rnatish

gRPC asosidagi microservice'larni qurishni boshlash uchun avval kerakli paketlarni o'rnating:

```bash
$ npm i --save @grpc/grpc-js @grpc/proto-loader
```

#### Umumiy ko'rinish

Boshqa Nest microservice transport qatlam implementatsiyalari kabi, gRPC transportyer mexanizmini `createMicroservice()` metodiga uzatiladigan options obyektining `transport` propertysi orqali tanlaysiz. Quyidagi misolda hero servisini sozlaymiz. `options` propertysi servis haqida metadata beradi; uning propertylari <a href="/docs/microservices/grpc#options">quyida</a> tasvirlangan.

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});
```

> info **Hint** `join()` funksiyasi `path` paketidan import qilinadi; `Transport` enum'i esa `@nestjs/microservices` paketidan import qilinadi.

`nest-cli.json` faylida `assets` propertysini qo'shamiz, u non-TypeScript fayllarni distribut qilishga imkon beradi va `watchAssets` - barcha non-TypeScript assetlarni kuzatishni yoqadi. Bizning holatda `.proto` fayllar `dist` papkaga avtomatik ko'chirilishini xohlaymiz.

```json
{
  "compilerOptions": {
    "assets": ["**/*.proto"],
    "watchAssets": true
  }
}
```

#### Opsiyalar

<strong>gRPC</strong> transportyer options obyekti quyida tasvirlangan propertylarni ochadi.

<table>
  <tr>
    <td><code>package</code></td>
    <td>Protobuf package nomi (<code>.proto</code> faylidagi <code>package</code> sozlamasiga mos).  Required</td>
  </tr>
  <tr>
    <td><code>protoPath</code></td>
    <td>
      <code>.proto</code> faylga absolute (yoki root dirga nisbatan) path. Required
    </td>
  </tr>
  <tr>
    <td><code>url</code></td>
    <td>Ulanish url'i.  <code>ip address/dns name:port</code> formatidagi string (masalan, Docker serveri uchun <code>'0.0.0.0:50051'</code>), transportyor ulanishni o'rnatadigan address/portni belgilaydi.  Optional.  Default: <code>'localhost:5000'</code></td>
  </tr>
  <tr>
    <td><code>protoLoader</code></td>
    <td><code>.proto</code> fayllarni yuklash uchun utilitaga tegishli NPM paket nomi.  Optional.  Default: <code>'@grpc/proto-loader'</code></td>
  </tr>
  <tr>
    <td><code>loader</code></td>
    <td>
      <code>@grpc/proto-loader</code> options'lari. Ular <code>.proto</code> fayllar xatti-harakatini batafsil boshqarish imkonini beradi. Optional. Batafsil ma'lumot uchun
      <a
        href="https://github.com/grpc/grpc-node/blob/master/packages/proto-loader/README.md"
        rel="nofollow"
        target="_blank"
        >here</a
      >
    </td>
  </tr>
  <tr>
    <td><code>credentials</code></td>
    <td>
      Server credentials.  Optional. <a
        href="https://grpc.io/grpc/node/grpc.ServerCredentials.html"
        rel="nofollow"
        target="_blank"
        >Read more here</a
      >
    </td>
  </tr>
</table>

#### gRPC servis namunasi

`HeroesService` nomli gRPC servisimizni aniqlaymiz. Yuqoridagi `options` obyektida `protoPath` propertysi `.proto` ta'rif fayli `hero.proto` ga pathni belgilaydi. `hero.proto` fayli protocol buffers yordamida tuzilgan. U quyidagicha ko'rinadi:

```typescript
// hero/hero.proto
syntax = "proto3";

package hero;

service HeroesService {
  rpc FindOne (HeroById) returns (Hero) {}
}

message HeroById {
  int32 id = 1;
}

message Hero {
  int32 id = 1;
  string name = 2;
}
```

Bizning `HeroesService` `FindOne()` metodini ochadi. Bu metod `HeroById` turidagi input argumentni kutadi va `Hero` xabarini qaytaradi (protocol buffers `message` elementlari yordamida ham parametr turlari, ham qaytish turlari aniqlanadi).

Endi servisni implement qilishimiz kerak. Ushbu ta'rifni bajaradigan handlerni aniqlash uchun controllerda `@GrpcMethod()` dekoratoridan foydalanamiz, quyida ko'rsatilganidek. Bu dekorator metodni gRPC servis metodi sifatida e'lon qilish uchun kerakli metadatalarni taqdim etadi.

> info **Hint** Oldingi microservices boblarida kiritilgan `@MessagePattern()` dekoratori (<a href="/docs/microservices/basics#request-response">read more</a>) gRPC asosidagi microservice'larda ishlatilmaydi. `@GrpcMethod()` dekoratori gRPC microservice'lar uchun amalda uning o'rnini bosadi.

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService', 'FindOne')
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
@@switch
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService', 'FindOne')
  findOne(data, metadata, call) {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

> info **Hint** `@GrpcMethod()` dekoratori `@nestjs/microservices` paketidan import qilinadi, `Metadata` va `ServerUnaryCall` esa `grpc` paketidan import qilinadi.

Yuqorida ko'rsatilgan dekorator ikki argument oladi. Birinchisi servis nomi (masalan, `'HeroesService'`), bu `hero.proto` faylidagi `HeroesService` servis ta'rifiga mos. Ikkinchisi (`'FindOne'` stringi) `HeroesService` ichida aniqlangan `FindOne()` rpc metodiga mos keladi.

`findOne()` handler metodi uchta argument oladi: chaqiruvchidan kelgan `data`, gRPC so'rov metadatasini saqlaydigan `metadata` va `GrpcCall` obyektining `sendMetadata` kabi propertylariga kirish uchun `call`.

`@GrpcMethod()` dekoratorining har ikki argumenti ixtiyoriy. Ikkinchi argument (`'FindOne'`) berilmasa, Nest handler nomini Upper Camel Casega aylantirib, `.proto` faylidagi rpc metodga avtomatik bog'laydi (masalan, `findOne` handleri `FindOne` rpc chaqiruviga moslashtiriladi). Bu quyida ko'rsatilgan.

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService')
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
@@switch
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService')
  findOne(data, metadata, call) {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

Shuningdek, birinchi `@GrpcMethod()` argumentini ham tashlab ketishingiz mumkin. Bu holatda Nest handler aniqlangan **class** nomi asosida `.proto` faylidagi servis ta'rifi bilan avtomatik bog'laydi. Masalan, quyidagi kodda `HeroesService` klassi o'z handler metodlarini `hero.proto` faylidagi `HeroesService` servis ta'rifi bilan `'HeroesService'` nomlar mosligi bo'yicha bog'laydi.

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
@@switch
@Controller()
export class HeroesService {
  @GrpcMethod()
  findOne(data, metadata, call) {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

#### Mijoz

Nest ilovalari `.proto` fayllarda aniqlangan servislarni iste'mol qiluvchi gRPC clientlari bo'lishi mumkin. Masofaviy servisga `ClientGrpc` obyekt orqali kirasiz. `ClientGrpc` obyektini bir nechta usul bilan olishingiz mumkin.

Afzal usul - `ClientsModule`ni import qilish. `register()` metodidan foydalanib `.proto` faylda aniqlangan servislar paketini injection token bilan bog'laysiz va servisini sozlaysiz. `name` propertysi injection token hisoblanadi. gRPC servislar uchun `transport: Transport.GRPC` dan foydalaning. `options` propertysi yuqorida <a href="/docs/microservices/grpc#options">ta'riflangan</a> propertylarga ega obyekt.

```typescript
imports: [
  ClientsModule.register([
    {
      name: 'HERO_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'hero',
        protoPath: join(__dirname, 'hero/hero.proto'),
      },
    },
  ]),
];
```

> info **Hint** `register()` metodi obyektlar massivini qabul qiladi. Bir nechta paketlarni ro'yxatdan o'tkazish uchun ro'yxatga vergul bilan ajratilgan bir nechta registration obyektlarini bering.

Ro'yxatdan o'tkazilgach, `@Inject()` yordamida sozlangan `ClientGrpc` obyektini inject qilamiz. So'ng `ClientGrpc` obyektining `getService()` metodidan foydalanib servis instansiyasini olamiz, quyida ko'rsatilganidek.

```typescript
@Injectable()
export class AppService implements OnModuleInit {
  private heroesService: HeroesService;

  constructor(@Inject('HERO_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.heroesService = this.client.getService<HeroesService>('HeroesService');
  }

  getHero(): Observable<string> {
    return this.heroesService.findOne({ id: 1 });
  }
}
```

> error **Warning** gRPC Client proto loader konfiguratsiyasida `keepCase` options `true` qilinmagan bo'lsa (`options.loader.keepcase` microservice transporter konfiguratsiyasida), nomida underscore `_` bo'lgan maydonlarni yubormaydi.

E'tibor bering, boshqa microservice transport usullarida ishlatiladigan texnikadan kichik farq bor. `ClientProxy` klassi o'rniga `ClientGrpc` klassidan foydalanamiz; u `getService()` metodini taqdim etadi. `getService()` generic metodi servis nomini argument sifatida oladi va uning instansiyasini (agar mavjud bo'lsa) qaytaradi.

Muqobil ravishda, `@Client()` dekoratori yordamida `ClientGrpc` obyektini quyidagicha instansiyalash mumkin:

```typescript
@Injectable()
export class AppService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(__dirname, 'hero/hero.proto'),
    },
  })
  client: ClientGrpc;

  private heroesService: HeroesService;

  onModuleInit() {
    this.heroesService = this.client.getService<HeroesService>('HeroesService');
  }

  getHero(): Observable<string> {
    return this.heroesService.findOne({ id: 1 });
  }
}
```

Nihoyat, murakkabroq ssenariylar uchun <a href="/docs/microservices/basics#client">here</a> da ta'riflanganidek `ClientProxyFactory` klassi yordamida dinamik sozlangan clientni inject qilishimiz mumkin.

Har ikki holatda ham `.proto` faylda aniqlangan metodlar bilan bir xil metodlar to'plamiga ega `HeroesService` proxy obyektiga ega bo'lamiz. Endi bu proxy obyektga murojaat qilsak (ya'ni `heroesService`), gRPC tizimi so'rovlarni avtomatik serializatsiya qiladi, ularni masofaviy tizimga uzatadi, javobni qaytaradi va javobni deserializatsiya qiladi. gRPC bizni ushbu tarmoq muloqot tafsilotlaridan himoya qilgani sababli, `heroesService` mahalliy provider kabi ko'rinadi va ishlaydi.

Eslatma: barcha servis metodlari **lower camel cased** (tilning tabiiy konventsiyasiga rioya qilish uchun). Shuning uchun, masalan, `.proto` faylimizdagi `HeroesService` ta'rifi `FindOne()` funksiyasini o'z ichiga olsa ham, `heroesService` instansiyasi `findOne()` metodini taqdim etadi.

```typescript
interface HeroesService {
  findOne(data: { id: number }): Observable<any>;
}
```

Message handler `Observable` ham qaytarishi mumkin, bu holda stream tugaguncha natija qiymatlar emit qilinadi.

```typescript
@@filename(heroes.controller)
@Get()
call(): Observable<any> {
  return this.heroesService.findOne({ id: 1 });
}
@@switch
@Get()
call() {
  return this.heroesService.findOne({ id: 1 });
}
```

gRPC metadata (so'rov bilan birga) yuborish uchun ikkinchi argumentni quyidagicha uzatishingiz mumkin:

```typescript
call(): Observable<any> {
  const metadata = new Metadata();
  metadata.add('Set-Cookie', 'yummy_cookie=choco');

  return this.heroesService.findOne({ id: 1 }, metadata);
}
```

> info **Hint** `Metadata` klassi `grpc` paketidan import qilinadi.

Iltimos, bu avvalroq aniqlagan `HeroesService` interfeysini yangilashni talab qilishini unutmang.

#### Misol

Ishlaydigan misol here mavjud.

#### gRPC Reflection

gRPC Server Reflection Specification gRPC clientlariga server ochib bergan API tafsilotlarini so'rash imkonini beradigan standartdir, bu REST API uchun OpenAPI hujjatini ochishga o'xshaydi. Bu grpc-ui yoki postman kabi developer debugging tool'lari bilan ishlashni ancha osonlashtirishi mumkin.

Serverga gRPC reflection qo'llab-quvvatlashini qo'shish uchun avval kerakli implementatsiya paketini o'rnating:

```bash
$ npm i --save @grpc/reflection
```

So'ng uni gRPC server options'ida `onLoadPackageDefinition` hook yordamida quyidagicha ulash mumkin:

```typescript
@@filename(main)
import { ReflectionService } from '@grpc/reflection';

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  options: {
    onLoadPackageDefinition: (pkg, server) => {
      new ReflectionService(pkg).addToServer(server);
    },
  },
});
```

Endi server reflection specification bo'yicha API tafsilotlarini so'ragan xabarlarga javob beradi.

#### gRPC streamingi

gRPC o'z-o'zidan `streams` deb ataladigan uzoq muddatli live ulanishlarni qo'llab-quvvatlaydi. Streamlar Chatting, Observations yoki Chunk-data uzatish kabi holatlarda foydali. Batafsil ma'lumot uchun rasmiy hujjatdagi here ga qarang.

Nest GRPC stream handlerlarini ikki xil yo'l bilan qo'llab-quvvatlaydi:

- RxJS `Subject` + `Observable` handler: javoblarni Controller metodi ichida yozish yoki `Subject`/`Observable` iste'molchisiga uzatish uchun foydali
- Pure GRPC call stream handler: Node standart `Duplex` stream handleri uchun qolgan dispatchni bajaradigan executor'ga uzatish uchun foydali

#### Streaming namunasi

`HelloService` nomli yangi sample gRPC servisini aniqlaymiz. `hello.proto` fayli protocol buffers yordamida tuzilgan. U quyidagicha ko'rinadi:

```typescript
// hello/hello.proto
syntax = "proto3";

package hello;

service HelloService {
  rpc BidiHello(stream HelloRequest) returns (stream HelloResponse);
  rpc LotsOfGreetings(stream HelloRequest) returns (HelloResponse);
}

message HelloRequest {
  string greeting = 1;
}

message HelloResponse {
  string reply = 1;
}
```

> info **Hint** `LotsOfGreetings` metodini yuqoridagi misollarda bo'lgani kabi `@GrpcMethod` dekoratori bilan shunchaki implement qilish mumkin, chunki qaytadigan stream bir nechta qiymat emit qilishi mumkin.

Ushbu `.proto` fayli asosida `HelloService` interfeysini aniqlaymiz:

```typescript
interface HelloService {
  bidiHello(upstream: Observable<HelloRequest>): Observable<HelloResponse>;
  lotsOfGreetings(
    upstream: Observable<HelloRequest>,
  ): Observable<HelloResponse>;
}

interface HelloRequest {
  greeting: string;
}

interface HelloResponse {
  reply: string;
}
```

> info **Hint** Proto interfeysini ts-proto paketi bilan avtomatik generatsiya qilish mumkin, batafsil here.

#### Subject strategiyasi

`@GrpcStreamMethod()` dekoratori funksiya parametrini RxJS `Observable` sifatida beradi. Shunday qilib, bir nechta xabarlarni qabul qilib, qayta ishlashimiz mumkin.

```typescript
@GrpcStreamMethod()
bidiHello(messages: Observable<any>, metadata: Metadata, call: ServerDuplexStream<any, any>): Observable<any> {
  const subject = new Subject();

  const onNext = message => {
    console.log(message);
    subject.next({
      reply: 'Hello, world!'
    });
  };
  const onComplete = () => subject.complete();
  messages.subscribe({
    next: onNext,
    complete: onComplete,
  });

  return subject.asObservable();
}
```

> warning **Warning** `@GrpcStreamMethod()` dekoratori bilan full-duplex o'zaro aloqani qo'llab-quvvatlash uchun controller metodi RxJS `Observable` qaytarishi kerak.

> info **Hint** `Metadata` va `ServerUnaryCall` klasslari/interfeyslari `grpc` paketidan import qilinadi.

Servis ta'rifiga ko'ra (`.proto` faylda), `BidiHello` metodi servisga stream so'rovlarini yuborishi kerak. Clientdan streamga bir nechta asinxron xabarlarni yuborish uchun RxJS `ReplaySubject` klassidan foydalanamiz.

```typescript
const helloService = this.client.getService<HelloService>('HelloService');
const helloRequest$ = new ReplaySubject<HelloRequest>();

helloRequest$.next({ greeting: 'Hello (1)!' });
helloRequest$.next({ greeting: 'Hello (2)!' });
helloRequest$.complete();

return helloService.bidiHello(helloRequest$);
```

Yuqoridagi misolda, streamga ikki xabar yozdik (`next()` chaqiruvlari) va servisga ma'lumot yuborishni yakunlaganimizni (`complete()` chaqiruvini) bildirdik.

#### Call stream handleri

Metod qaytish qiymati `stream` qilib belgilansa, `@GrpcStreamCall()` dekoratori funksiya parametrini `grpc.ServerDuplexStream` sifatida beradi, u `.on('data', callback)`, `.write(message)` yoki `.cancel()` kabi standart metodlarni qo'llab-quvvatlaydi. Mavjud metodlar bo'yicha to'liq hujjatni heredan topishingiz mumkin.

Muqobil ravishda, metod qaytish qiymati `stream` bo'lmasa, `@GrpcStreamCall()` dekoratori mos ravishda `grpc.ServerReadableStream` (hereni o'qing) va `callback` degan ikkita parametrni beradi.

Keling, to'liq duplex o'zaro aloqani qo'llab-quvvatlashi kerak bo'lgan `BidiHello`ni implement qilishdan boshlaymiz.

```typescript
@GrpcStreamCall()
bidiHello(requestStream: any) {
  requestStream.on('data', message => {
    console.log(message);
    requestStream.write({
      reply: 'Hello, world!'
    });
  });
}
```

> info **Hint** Bu dekorator qaytish parametri berilishini talab qilmaydi. Stream har qanday boshqa standart stream turi kabi boshqarilishi kutiladi.

Yuqoridagi misolda javob streamiga obyektlar yozish uchun `write()` metodidan foydalandik. `.on()` metodiga ikkinchi parametr sifatida uzatilgan callback funksiya servis yangi data chunk olganida har safar chaqiriladi.

`LotsOfGreetings` metodini implement qilamiz.

```typescript
@GrpcStreamCall()
lotsOfGreetings(requestStream: any, callback: (err: unknown, value: HelloResponse) => void) {
  requestStream.on('data', message => {
    console.log(message);
  });
  requestStream.on('end', () => callback(null, { reply: 'Hello, world!' }));
}
```

Bu yerda `requestStream`ni qayta ishlash tugagach javob yuborish uchun `callback` funksiyasidan foydalandik.

#### Sog'liq tekshiruvlari

Kubernetes kabi orkestratorda gRPC ilova ishlayotganida, uning ishlab turganini va sog'lom holatda ekanini bilish kerak bo'lishi mumkin. gRPC Health Check specification gRPC clientlariga sog'liq holatini ochib berish imkonini beradigan standart bo'lib, orkestrator tegishli ravishda harakat qilishi mumkin.

gRPC health check qo'llab-quvvatlashini qo'shish uchun avval grpc-node paketini o'rnating:

```bash
$ npm i --save grpc-health-check
```

So'ng uni gRPC servisga `onLoadPackageDefinition` hook orqali ulash mumkin. E'tibor bering, `protoPath` health check va hero paketini ham o'z ichiga olishi kerak.

```typescript
@@filename(main)
import { HealthImplementation, protoPath as healthCheckProtoPath } from 'grpc-health-check';

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  options: {
    protoPath: [
      healthCheckProtoPath,
      protoPath: join(__dirname, 'hero/hero.proto'),
    ],
    onLoadPackageDefinition: (pkg, server) => {
      const healthImpl = new HealthImplementation({
        '': 'UNKNOWN',
      });

      healthImpl.addToServer(server);
      healthImpl.setStatus('', 'SERVING');
    },
  },
});
```

> info **Hint** gRPC health probe konteynerli muhitda gRPC health checklarini sinash uchun foydali CLI.

#### gRPC metadatasi

Metadata - bu muayyan RPC chaqiruv haqida key-value juftliklari ro'yxati ko'rinishidagi ma'lumot bo'lib, keylar string, qiymatlar esa odatda string bo'ladi, ammo binary data ham bo'lishi mumkin. Metadata gRPC uchun opaque - u clientga chaqiruv bilan bog'liq ma'lumotni serverga taqdim etish va aksincha imkonini beradi. Metadata authentication tokenlar, request identifikatorlari, monitoring uchun teglar, shuningdek data to'plamidagi yozuvlar soni kabi ma'lumotlarni o'z ichiga olishi mumkin.

`@GrpcMethod()` handlerida metadatani o'qish uchun ikkinchi argumentdan (metadata) foydalaning; uning tipi `Metadata` (`grpc` paketidan import qilinadi).

Handlerdan metadatani qaytarish uchun `ServerUnaryCall#sendMetadata()` metodidan foydalaning (uchinchi handler argumenti).

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const serverMetadata = new Metadata();
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];

    serverMetadata.add('Set-Cookie', 'yummy_cookie=choco');
    call.sendMetadata(serverMetadata);

    return items.find(({ id }) => id === data.id);
  }
}
@@switch
@Controller()
export class HeroesService {
  @GrpcMethod()
  findOne(data, metadata, call) {
    const serverMetadata = new Metadata();
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];

    serverMetadata.add('Set-Cookie', 'yummy_cookie=choco');
    call.sendMetadata(serverMetadata);

    return items.find(({ id }) => id === data.id);
  }
}
```

Xuddi shuningdek, `@GrpcStreamMethod()` handlerlarida ([subject strategy](/docs/microservices/grpc#subject-strategiyasi)) metadatani o'qish uchun ikkinchi argumentdan (metadata) foydalaning; u `Metadata` tipida (`grpc` paketidan import qilinadi).

Handlerdan metadatani qaytarish uchun `ServerDuplexStream#sendMetadata()` metodidan foydalaning (uchinchi handler argumenti).

[call stream handlers](/docs/microservices/grpc#call-stream-handleri) ichidan (`@GrpcStreamCall()` dekoratori bilan belgilangan handlerlar) metadatani o'qish uchun `requestStream` referensidagi `metadata` eventini tinglang, quyidagicha:

```typescript
requestStream.on('metadata', (metadata: Metadata) => {
  const meta = metadata.get('X-Meta');
});
```
