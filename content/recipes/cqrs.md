---
title: "CQRS"
navTitle: "CQRS"
description: "Oddiy CRUD (Create, Read, Update va Delete) ilovalari oqimi quyidagicha tasvirlanishi mumkin:"
order: 2
group: recipes
groupTitle: "Recipes"
---
Oddiy CRUD (Create, Read, Update va Delete) ilovalari oqimi quyidagicha tasvirlanishi mumkin:

1. Controllerlar qatlami HTTP so'rovlarni qabul qiladi va vazifalarni servislar qatlamiga delegatsiya qiladi.
2. Servislar qatlami biznes mantiqning asosiy qismi joylashgan qismdir.
3. Servislar entitetlarni o'zgartirish / saqlash uchun repository/DAOlardan foydalanadi.
4. Entitetlar qiymatlar uchun konteyner bo'lib, setter va getterlarga ega.

Bu pattern odatda kichik va o'rta hajmdagi ilovalar uchun yetarli bo'lsa-da, yirik, murakkab ilovalar uchun eng yaxshi tanlov bo'lmasligi mumkin. Bunday hollarda **CQRS** (Command and Query Responsibility Segregation) modeli ko'proq mos va masshtablanuvchi bo'lishi mumkin (ilova talablariga qarab). Ushbu modelning afzalliklariga quyidagilar kiradi:

- **Mas'uliyatni ajratish**. Model o'qish va yozish operatsiyalarini alohida modellarga ajratadi.
- **Masshtablanuvchanlik**. O'qish va yozish operatsiyalarini mustaqil ravishda masshtablash mumkin.
- **Moslashuvchanlik**. Model o'qish va yozish operatsiyalari uchun turli ma'lumotlar omborlaridan foydalanishga imkon beradi.
- **Ishlash**. Model o'qish va yozish operatsiyalari uchun optimallashtirilgan turli ma'lumotlar omborlarini ishlatishga imkon beradi.

Bu modelni qo'llab-quvvatlash uchun Nest yengil CQRS modulini taqdim etadi. Ushbu bob uni qanday ishlatishni tushuntiradi.

#### O'rnatish

Avval kerakli paketni o'rnating:

```bash
$ npm install --save @nestjs/cqrs
```

O'rnatish tugagach, ilovangizning ildiz moduliga (odatda `AppModule`) o'ting va `CqrsModule.forRoot()` ni import qiling:

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule.forRoot()],
})
export class AppModule {}
```

Ushbu modul ixtiyoriy konfiguratsiya obyektini qabul qiladi. Quyidagi parametrlar mavjud:

| Attribute                     | Description                                                                                                                  | Default                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `commandPublisher`            | The publisher responsible for dispatching commands to the system.                                                            | `DefaultCommandPubSub`            |
| `eventPublisher`              | The publisher used to publish events, allowing them to be broadcasted or processed.                                          | `DefaultPubSub`                   |
| `queryPublisher`              | The publisher used for publishing queries, which can trigger data retrieval operations.                                      | `DefaultQueryPubSub`              |
| `unhandledExceptionPublisher` | Publisher responsible for handling unhandled exceptions, ensuring they are tracked and reported.                             | `DefaultUnhandledExceptionPubSub` |
| `eventIdProvider`             | Service that provides unique event IDs by generating or retrieving them from event instances.                                | `DefaultEventIdProvider`          |
| `rethrowUnhandled`            | Determines whether unhandled exceptions should be rethrown after being processed, useful for debugging and error management. | `false`                           |

#### Commandlar

Commandlar ilova holatini o'zgartirish uchun ishlatiladi. Ular ma'lumotga emas, vazifaga yo'naltirilgan bo'lishi kerak. Command yuborilganda, u tegishli **Command Handler** tomonidan ko'rib chiqiladi. Handler ilova holatini yangilash uchun mas'ul.

```typescript
@@filename(heroes-game.service)
@Injectable()
export class HeroesGameService {
  constructor(private commandBus: CommandBus) {}

  async killDragon(heroId: string, killDragonDto: KillDragonDto) {
    return this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}
@@switch
@Injectable()
@Dependencies(CommandBus)
export class HeroesGameService {
  constructor(commandBus) {
    this.commandBus = commandBus;
  }

  async killDragon(heroId, killDragonDto) {
    return this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}
```

Yuqoridagi kod parchasi `KillDragonCommand` klassini yaratib, uni `CommandBus` ning `execute()` metodiga uzatadi. Ko'rsatilgan command klassi quyidagicha:

```typescript
@@filename(kill-dragon.command)
export class KillDragonCommand extends Command<{
  actionId: string // This type represents the command execution result
}> {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {
    super();
  }
}
@@switch
export class KillDragonCommand extends Command {
  constructor(heroId, dragonId) {
    this.heroId = heroId;
    this.dragonId = dragonId;
  }
}
```

Ko'rib turganingizdek, `KillDragonCommand` `Command` klassini kengaytiradi. `Command` klassi `@nestjs/cqrs` paketidan eksport qilinadigan sodda utiliti bo'lib, commandning qaytarish turini belgilash imkonini beradi. Bu yerda qaytish turi `actionId` xususiyatiga ega obyekt. Endi `KillDragonCommand` yuborilganda, `CommandBus#execute()` metodining qaytish turi `Promise<{{ '{' }} actionId: string {{ '}' }}>` deb aniqlanadi. Bu command handlerdan ma'lumot qaytarmoqchi bo'lganingizda foydali.

> info **Hint** `Command` klassidan meros olish ixtiyoriy. U faqat command qaytish turini belgilamoqchi bo'lsangiz kerak bo'ladi.

`CommandBus` commandlar **oqimi** ni ifodalaydi. U commandlarni tegishli handlerlarga yuborish uchun mas'ul. `execute()` metodi handler qaytargan qiymatga yechiladigan promise qaytaradi.

Keling, `KillDragonCommand` command uchun handler yarataylik.

```typescript
@@filename(kill-dragon.handler)
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(private repository: HeroesRepository) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);

    // "ICommandHandler<KillDragonCommand>" forces you to return a value that matches the command's return type
    return {
      actionId: crypto.randomUUID(), // This value will be returned to the caller
    }
  }
}
@@switch
@CommandHandler(KillDragonCommand)
@Dependencies(HeroesRepository)
export class KillDragonHandler {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(command) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);

    // "ICommandHandler<KillDragonCommand>" forces you to return a value that matches the command's return type
    return {
      actionId: crypto.randomUUID(), // This value will be returned to the caller
    }
  }
}
```

Bu handler repository dan `Hero` entitetini olib, `killEnemy()` metodini chaqiradi va keyin o'zgarishlarni saqlaydi. `KillDragonHandler` klassi `ICommandHandler` interfeysini implementatsiya qiladi, u `execute()` metodini implementatsiya qilishni talab qiladi. `execute()` metodi argument sifatida command obyektini oladi.

`ICommandHandler<KillDragonCommand>` command qaytish turiga mos qiymat qaytarishni majbur qiladi. Bu holatda qaytish turi `actionId` xususiyatiga ega obyekt. Bu faqat `Command` klassidan meros olgan commandlar uchun amal qiladi. Aks holda, xohlagan narsani qaytarishingiz mumkin.

Va nihoyat, `KillDragonHandler` ni modulda provider sifatida ro'yxatdan o'tkazganingizga ishonch hosil qiling:

```typescript
providers: [KillDragonHandler];
```

#### Querylar

Querylar ilova holatidan ma'lumot olish uchun ishlatiladi. Ular vazifaga emas, ma'lumotga yo'naltirilgan bo'lishi kerak. Query yuborilganda, u tegishli **Query Handler** tomonidan ko'rib chiqiladi. Handler ma'lumotni olish uchun mas'ul.

`QueryBus` `CommandBus` bilan bir xil patternni kuzatadi. Query handlerlar `IQueryHandler` interfeysini implementatsiya qilishi va `@QueryHandler()` dekoratori bilan belgilanishi kerak. Quyidagi misolni ko'rib chiqing:

```typescript
export class GetHeroQuery extends Query<Hero> {
  constructor(public readonly heroId: string) {}
}
```

`Command` klassiga o'xshab, `Query` klassi ham `@nestjs/cqrs` paketidan eksport qilinadigan sodda utiliti bo'lib, query qaytish turini belgilash imkonini beradi. Bu yerda qaytish turi `Hero` obyektidir. Endi `GetHeroQuery` yuborilganda, `QueryBus#execute()` metodining qaytish turi `Promise<Hero>` sifatida aniqlanadi.

Hero ni olish uchun query handler yaratishimiz kerak:

```typescript
@@filename(get-hero.handler)
@QueryHandler(GetHeroQuery)
export class GetHeroHandler implements IQueryHandler<GetHeroQuery> {
  constructor(private repository: HeroesRepository) {}

  async execute(query: GetHeroQuery) {
    return this.repository.findOneById(query.heroId);
  }
}
@@switch
@QueryHandler(GetHeroQuery)
@Dependencies(HeroesRepository)
export class GetHeroHandler {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(query) {
    return this.repository.findOneById(query.hero);
  }
}
```

`GetHeroHandler` klassi `IQueryHandler` interfeysini implementatsiya qiladi, u `execute()` metodini implementatsiya qilishni talab qiladi. `execute()` metodi argument sifatida query obyektini oladi va query qaytish turiga mos ma'lumotni (bu yerda `Hero` obyekti) qaytarishi kerak.

Va nihoyat, `GetHeroHandler` ni modulda provider sifatida ro'yxatdan o'tkazganingizga ishonch hosil qiling:

```typescript
providers: [GetHeroHandler];
```

Endi query yuborish uchun `QueryBus` dan foydalaning:

```typescript
const hero = await this.queryBus.execute(new GetHeroQuery(heroId)); // "hero" will be auto-inferred as "Hero" type
```

#### Eventlar

Eventlar ilova holatidagi o'zgarishlar haqida ilovaning boshqa qismlarini xabardor qilish uchun ishlatiladi. Ular **modellalar** tomonidan yoki to'g'ridan-to'g'ri `EventBus` orqali yuboriladi. Event yuborilganda, u tegishli **Event Handlerlar** tomonidan ko'rib chiqiladi. Handlerlar, masalan, read modelni yangilashi mumkin.

Namoyish uchun event klassini yarataylik:

```typescript
@@filename(hero-killed-dragon.event)
export class HeroKilledDragonEvent {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
@@switch
export class HeroKilledDragonEvent {
  constructor(heroId, dragonId) {
    this.heroId = heroId;
    this.dragonId = dragonId;
  }
}
```

Eventlarni `EventBus.publish()` metodi orqali to'g'ridan-to'g'ri yuborish mumkin bo'lsa-da, ularni modeldan ham yuborishimiz mumkin. `Hero` modelini `killEnemy()` metodi chaqirilganda `HeroKilledDragonEvent` ni yuboradigan qilib yangilaylik.

```typescript
@@filename(hero.model)
export class Hero extends AggregateRoot {
  constructor(private id: string) {
    super();
  }

  killEnemy(enemyId: string) {
    // Business logic
    this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }
}
@@switch
export class Hero extends AggregateRoot {
  constructor(id) {
    super();
    this.id = id;
  }

  killEnemy(enemyId) {
    // Business logic
    this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }
}
```

`apply()` metodi eventlarni yuborish uchun ishlatiladi. U argument sifatida event obyektini qabul qiladi. Biroq modelimiz `EventBus` dan bexabar bo'lganligi sababli, uni modelga bog'lashimiz kerak. Buni `EventPublisher` klassi yordamida amalga oshirishimiz mumkin.

```typescript
@@filename(kill-dragon.handler)
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private repository: HeroesRepository,
    private publisher: EventPublisher,
  ) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    hero.killEnemy(dragonId);
    hero.commit();
  }
}
@@switch
@CommandHandler(KillDragonCommand)
@Dependencies(HeroesRepository, EventPublisher)
export class KillDragonHandler {
  constructor(repository, publisher) {
    this.repository = repository;
    this.publisher = publisher;
  }

  async execute(command) {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    hero.killEnemy(dragonId);
    hero.commit();
  }
}
```

`EventPublisher#mergeObjectContext` metodi event publisherni taqdim etilgan obyektga birlashtiradi, ya'ni endi obyekt eventlar oqimiga event yubora oladi.

Ushbu misolda modelda `commit()` metodini ham chaqirayotganimizga e'tibor bering. Bu metod bajarilmagan eventlarni yuborish uchun ishlatiladi. Eventlarni avtomatik yuborish uchun `autoCommit` xususiyatini `true` ga o'rnatishimiz mumkin:

```typescript
export class Hero extends AggregateRoot {
  constructor(private id: string) {
    super();
    this.autoCommit = true;
  }
}
```

Agar event publisherni mavjud bo'lmagan obyektda emas, balki klassga birlashtirmoqchi bo'lsak, `EventPublisher#mergeClassContext` metodidan foydalanishimiz mumkin:

```typescript
const HeroModel = this.publisher.mergeClassContext(Hero);
const hero = new HeroModel('id'); // <-- HeroModel is a class
```

Endi `HeroModel` klassining har bir nusxasi `mergeObjectContext()` metodidan foydalanmasdan event yubora oladi.

Bundan tashqari, `EventBus` yordamida eventlarni qo'lda yuborishimiz mumkin:

```typescript
this.eventBus.publish(new HeroKilledDragonEvent());
```

> info **Hint** `EventBus` inject qilinadigan klassdir.

Har bir event bir nechta **Event Handler** ga ega bo'lishi mumkin.

```typescript
@@filename(hero-killed-dragon.handler)
@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonHandler implements IEventHandler<HeroKilledDragonEvent> {
  constructor(private repository: HeroesRepository) {}

  handle(event: HeroKilledDragonEvent) {
    // Business logic
  }
}
```

> info **Hint** Event handlerlardan foydalanishni boshlaganingizda an'anaviy HTTP web kontekstidan tashqariga chiqishingizni yodda tuting.
>
> - `CommandHandlers` dagi xatolarni hamon o'rnatilgan [Exception filterlar](/docs/core/exception-filters) ushlashi mumkin.
> - `EventHandlers` dagi xatolar Exception filterlar tomonidan ushlanmaydi: ularni qo'lda hal qilishingiz kerak bo'ladi. Oddiy `try/catch`, [Sagas](/docs/recipes/cqrs#sagas) orqali kompensatsion event qo'zg'atish yoki boshqa usullar.
> - `CommandHandlers` dagi HTTP javoblarini mijozga yuborish mumkin.
> - `EventHandlers` dagi HTTP javoblarini yuborib bo'lmaydi. Mijozga ma'lumot yubormoqchi bo'lsangiz [WebSocket](/docs/websockets/gateways), [SSE](/docs/techniques/server-sent-events) yoki boshqa yechimlardan foydalanishingiz mumkin.

Command va querylar bilan bo'lgani kabi, `HeroKilledDragonHandler` ni modulda provider sifatida ro'yxatdan o'tkazganingizga ishonch hosil qiling:

```typescript
providers: [HeroKilledDragonHandler];
```

#### Sagalari

Saga eventlarni tinglaydigan va yangi commandlarni qo'zg'atishi mumkin bo'lgan uzoq davom etuvchi jarayon. U odatda ilovadagi murakkab ish oqimlarini boshqarish uchun ishlatiladi. Masalan, foydalanuvchi ro'yxatdan o'tganda, saga `UserRegisteredEvent` ni tinglab, foydalanuvchiga xush kelibsiz xatini yuborishi mumkin.

Saga juda kuchli imkoniyatdir. Bitta saga 1..\* eventlarni tinglashi mumkin. RxJS kutubxonasi yordamida biz event oqimlarini filtrlay, map qila, fork va merge qila olamiz va murakkab ish jarayonlarini yaratamiz. Har bir saga Observable qaytaradi, u command nusxasini yaratadi. Bu command keyin `CommandBus` tomonidan **asinxron** yuboriladi.

`HeroKilledDragonEvent` ni tinglab, `DropAncientItemCommand` commandni yuboradigan sagani yarataylik.

```typescript
@@filename(heroes-game.saga)
@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(HeroKilledDragonEvent),
      map((event) => new DropAncientItemCommand(event.heroId, fakeItemID)),
    );
  }
}
@@switch
@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$) => {
    return events$.pipe(
      ofType(HeroKilledDragonEvent),
      map((event) => new DropAncientItemCommand(event.heroId, fakeItemID)),
    );
  }
}
```

> info **Hint** `ofType` operatori va `@Saga()` dekoratori `@nestjs/cqrs` paketidan eksport qilinadi.

`@Saga()` dekoratori metodni saga sifatida belgilaydi. `events$` argumenti barcha event'larning Observable stream'i hisoblanadi. `ofType` operatori stream'ni ko'rsatilgan event turi bo'yicha filter qiladi. `map` operatori esa event'ni yangi command instance'iga o'giradi.

Bu misolda `HeroKilledDragonEvent` ni `DropAncientItemCommand` command'iga map qilyapmiz. Keyin `DropAncientItemCommand` command'i `CommandBus` tomonidan avtomatik dispatch qilinadi.

Query, command va event handler'larda bo'lgani kabi, `HeroesGameSagas` ni modul ichida provider sifatida ro'yxatdan o'tkazishni unutmang:

```typescript
providers: [HeroesGameSagas];
```

#### Handled qilinmagan exception'lar

Event handler'lar asynchronous bajariladi, shu sabab ilova nomuvofiq holatga tushib qolmasligi uchun exception'larni doim to'g'ri handle qilish kerak. Agar exception handle qilinmasa, `EventBus` `UnhandledExceptionInfo` obyektini yaratadi va uni `UnhandledExceptionBus` stream'iga yuboradi. Bu stream `Observable` bo'lib, handle qilinmagan exception'larni qayta ishlash uchun ishlatiladi.

```typescript
private destroy$ = new Subject<void>();

constructor(private unhandledExceptionsBus: UnhandledExceptionBus) {
  this.unhandledExceptionsBus
    .pipe(takeUntil(this.destroy$))
    .subscribe((exceptionInfo) => {
      // Handle exception here
      // e.g. send it to external service, terminate process, or publish a new event
    });
}

onModuleDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

Exception'larni filter qilish uchun `ofType` operatoridan quyidagicha foydalanish mumkin:

```typescript
this.unhandledExceptionsBus
  .pipe(
    takeUntil(this.destroy$),
    UnhandledExceptionBus.ofType(TransactionNotAllowedException),
  )
  .subscribe((exceptionInfo) => {
    // Handle exception here
  });
```

Bu yerda `TransactionNotAllowedException` filter qilmoqchi bo'lgan exception'imiz hisoblanadi.

`UnhandledExceptionInfo` obyektida quyidagi property'lar mavjud:

```typescript
export interface UnhandledExceptionInfo<
  Cause = IEvent | ICommand,
  Exception = any,
> {
  /**
   * The exception that was thrown.
   */
  exception: Exception;
  /**
   * The cause of the exception (event or command reference).
   */
  cause: Cause;
}
```

#### Barcha event'larga subscribe bo'lish

`CommandBus`, `QueryBus` va `EventBus`'ning barchasi **Observable** hisoblanadi. Bu shuni anglatadiki, butun stream'ga subscribe bo'lib, masalan, barcha event'larni qayta ishlashimiz mumkin. Masalan, barcha event'larni console'ga log qilish yoki event store'ga saqlash mumkin.

```typescript
private destroy$ = new Subject<void>();

constructor(private eventBus: EventBus) {
  this.eventBus
    .pipe(takeUntil(this.destroy$))
    .subscribe((event) => {
      // Save events to database
    });
}

onModuleDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

#### Request scope

Boshqa dasturlash tillari fonidan kelganlar uchun Nest'da ko'p narsalar kiruvchi request'lar orasida ulashilishini bilish g'alati tuyulishi mumkin. Bunga database connection pool, global holatga ega singleton service'lar va boshqalar kiradi. Esda tuting, Node.js har bir request alohida thread'da qayta ishlanadigan request/response multi-threaded stateless model'ga amal qilmaydi. Shu sabab singleton instance'lardan foydalanish ilovalarimiz uchun **xavfsiz** hisoblanadi.

Ammo ayrim edge case'larda handler uchun request-based lifecycle kerak bo'lishi mumkin. Masalan, GraphQL ilovalarida har bir request uchun alohida cache, request tracking yoki multi-tenancy holatlari. Scope'larni qanday boshqarish haqida ko'proq ma'lumotni bu yerda topasiz.

CQRS bilan birga request-scoped provider'lardan foydalanish murakkab bo'lishi mumkin, chunki `CommandBus`, `QueryBus` va `EventBus` singleton hisoblanadi. Yaxshiyamki, `@nestjs/cqrs` package'i buni soddalashtiradi va har bir qayta ishlanayotgan command, query yoki event uchun request-scoped handler'ning yangi instance'ini avtomatik yaratadi.

Handler'ni request-scoped qilish uchun quyidagilardan birini qilishingiz mumkin:

1. Request-scoped provider'ga bog'laning.
2. Quyidagidek `@CommandHandler`, `@QueryHandler` yoki `@EventsHandler` dekoratori orqali uning scope'ini aniq `REQUEST` qilib belgilang:

```typescript
@CommandHandler(KillDragonCommand, {
  scope: Scope.REQUEST,
})
export class KillDragonHandler {
  // Implementation here
}
```

Request payload'ini istalgan request-scoped provider ichiga inject qilish uchun `@Inject(REQUEST)` dekoratoridan foydalaniladi. Ammo CQRS ichida request payload tabiati context'ga bog'liq bo'ladi: u HTTP request, scheduled job yoki command'ni ishga tushiradigan boshqa har qanday operatsiya bo'lishi mumkin.

Payload `AsyncContext` ni kengaytiradigan class'ning instance'i bo'lishi kerak (`@nestjs/cqrs` tomonidan taqdim etiladi). U request context sifatida ishlaydi va request lifecycle davomida foydalaniladigan ma'lumotlarni saqlaydi.

```typescript
import { AsyncContext } from '@nestjs/cqrs';

export class MyRequest extends AsyncContext {
  constructor(public readonly user: User) {
    super();
  }
}
```

Command bajarilganda custom request context'ni `CommandBus#execute` metodiga ikkinchi argument sifatida uzating:

```typescript
const myRequest = new MyRequest(user);
await this.commandBus.execute(
  new KillDragonCommand(heroId, killDragonDto.dragonId),
  myRequest,
);
```

Shunda `MyRequest` instance'i mos handler ichida `REQUEST` provider sifatida mavjud bo'ladi:

```typescript
@CommandHandler(KillDragonCommand, {
  scope: Scope.REQUEST,
})
export class KillDragonHandler {
  constructor(
    @Inject(REQUEST) private request: MyRequest, // Inject the request context
  ) {}

  // Handler implementation here
}
```

Query'lar uchun ham xuddi shu yondashuvdan foydalanish mumkin:

```typescript
const myRequest = new MyRequest(user);
const hero = await this.queryBus.execute(new GetHeroQuery(heroId), myRequest);
```

Query handler ichida esa:

```typescript
@QueryHandler(GetHeroQuery, {
  scope: Scope.REQUEST,
})
export class GetHeroHandler {
  constructor(
    @Inject(REQUEST) private request: MyRequest, // Inject the request context
  ) {}

  // Handler implementation here
}
```

For events, while you can pass the request provider to `EventBus#publish`, this is less common. Instead, use `EventPublisher` to merge the request provider into a model:

```typescript
const hero = this.publisher.mergeObjectContext(
  await this.repository.findOneById(+heroId),
  this.request, // Inject the request context here
);
```

Request-scoped event handlers subscribing to these events will have access to the request provider.

Sagas are always singleton instances because they manage long-running processes. However, you can retrieve the request provider from event objects:

```typescript
@Saga()
dragonKilled = (events$: Observable<any>): Observable<ICommand> => {
  return events$.pipe(
    ofType(HeroKilledDragonEvent),
    map((event) => {
      const request = AsyncContext.of(event); // Retrieve the request context
      const command = new DropAncientItemCommand(event.heroId, fakeItemID);

      AsyncContext.merge(request, command); // Merge the request context into the command
      return command;
    }),
  );
}
```

Alternatively, use the `request.attachTo(command)` method to tie the request context to the command.

#### Example

A working example is available here.
