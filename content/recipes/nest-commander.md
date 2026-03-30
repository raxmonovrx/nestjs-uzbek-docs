---
title: "Nest Commander"
navTitle: "Nest Commander"
description: "standalone application hujjatlariga qo'shimcha ravishda, oddiy Nest ilovasiga o'xshash tuzilma bilan command line ilovalar yozish uchun nest-commander paketi ham mavjud."
order: 9
group: recipes
groupTitle: "Recipes"
---
standalone application hujjatlariga qo'shimcha ravishda, oddiy Nest ilovasiga o'xshash tuzilma bilan command line ilovalar yozish uchun nest-commander paketi ham mavjud.

> info **info** `nest-commander` third-party paket hisoblanadi va NestJS core jamoasi tomonidan to'liq boshqarilmaydi. Kutubxonadagi muammolarni mos repository ga yuboring.

#### O'rnatish

Boshqa paketlar kabi, undan foydalanishdan oldin uni o'rnatishingiz kerak.

```bash
$ npm i nest-commander
```

#### Command fayli

`nest-commander` class'lar uchun `@Command()` va shu class metodlari uchun `@Option()` dekoratorlari orqali yangi command-line ilovalar yozishni osonlashtiradi. Har bir command fayli `CommandRunner` abstract class'ini implement qilishi va `@Command()` dekoratori bilan belgilanishi kerak.

Har bir command Nest tomonidan `@Injectable()` sifatida ko'riladi, shuning uchun odatiy Dependency Injection kutilganidek ishlaydi. E'tibor qaratish kerak bo'lgan asosiy narsa - har bir command implement qilishi kerak bo'lgan `CommandRunner` abstract class'i. `CommandRunner` barcha command'larda `Promise<void>` qaytaradigan va `string[], Record<string, any>` parametrlarini qabul qiladigan `run` metodi bo'lishini kafolatlaydi. `run` - barcha asosiy business logic boshlanadigan joy. U option flag'lariga mos tushmagan parametrlarni massiv sifatida qabul qiladi, bu bir nechta parametr bilan ishlamoqchi bo'lgan holatlar uchun foydali. `options` qismi esa `Record<string, any>` ko'rinishida bo'ladi; uning xossa nomlari `@Option()` dekoratorlarida berilgan `name` qiymatiga, xossa qiymatlari esa option handler qaytargan natijaga teng bo'ladi. Yaxshiroq type safety kerak bo'lsa, options uchun alohida interface yaratishingiz mumkin.

#### Command'ni ishga tushirish

NestJS ilovasida `NestFactory` orqali server yaratib, uni `listen` bilan ishga tushirganimiz kabi, `nest-commander` paketi ham command ilovasini ishga tushirish uchun sodda API beradi. `CommandFactory` ni import qiling, uning `static` `run` metodidan foydalaning va ilovangizning root module'ini uzating. Bu quyidagicha ko'rinadi:

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

Standart holatda `CommandFactory` ishlatilganda Nest logger'i o'chirilgan bo'ladi. Biroq uni `run` funksiyasining ikkinchi argumenti sifatida uzatish mumkin. Siz custom NestJS logger yoki saqlab qolmoqchi bo'lgan log level'lar massivini berishingiz mumkin. Masalan, faqat Nest xato loglari chiqishini istasangiz, bu yerda hech bo'lmaganda `['error']` uzatish foydali bo'ladi.

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { LogService } './log.service';

async function bootstrap() {
  await CommandFactory.run(AppModule, new LogService());

  // or, if you only want to print Nest's warnings and errors
  await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();
```

Hammasi shu. Ichki qatlamda `CommandFactory` siz uchun `NestFactory` ni chaqiradi va kerak bo'lganda `app.close()` ni ham bajaradi, shuning uchun memory leak haqida alohida qayg'urishingiz shart emas. Agar qo'shimcha error handling kerak bo'lsa, `run` chaqiruvini `try/catch` bilan o'rashingiz yoki `bootstrap()` ga `.catch()` zanjirlashingiz mumkin.

#### Testing

Ajoyib command line skript yozib, uni oson test qila olmaslikning foydasi yo'q. Yaxshiyamki, `nest-commander` NestJS ekotizimiga juda mos tushadigan utilitalarni taqdim etadi. Test rejimida command yaratish uchun `CommandFactory` o'rniga `CommandTestFactory` dan foydalanishingiz va metadata uzatishingiz mumkin. Bu `@nestjs/testing` dagi `Test.createTestingModule` ga juda o'xshaydi. Hatto ichki qatlamda aynan shu paketdan foydalanadi. `compile()` ni chaqirishdan oldin `overrideProvider` metodlarini zanjirlab, test ichida DI qismlarini almashtirishingiz ham mumkin.

#### Hammasini birlashtirish

Quyidagi class `basic` subcommand'ini qabul qiladigan yoki bevosita chaqiriladigan CLI command'ga teng bo'ladi. U `-n`, `-s`, va `-b` flag'larini (ularning uzun variantlari bilan birga) qo'llab-quvvatlaydi va har bir option uchun custom parser'ga ega. Odatdagidek `--help` flag'i ham ishlaydi.

```ts
import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from './log.service';

interface BasicCommandOptions {
  string?: string;
  boolean?: boolean;
  number?: number;
}

@Command({ name: 'basic', description: 'A parameter parse' })
export class BasicCommand extends CommandRunner {
  constructor(private readonly logService: LogService) {
    super()
  }

  async run(
    passedParam: string[],
    options?: BasicCommandOptions,
  ): Promise<void> {
    if (options?.boolean !== undefined && options?.boolean !== null) {
      this.runWithBoolean(passedParam, options.boolean);
    } else if (options?.number) {
      this.runWithNumber(passedParam, options.number);
    } else if (options?.string) {
      this.runWithString(passedParam, options.string);
    } else {
      this.runWithNone(passedParam);
    }
  }

  @Option({
    flags: '-n, --number [number]',
    description: 'A basic number parser',
  })
  parseNumber(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-s, --string [string]',
    description: 'A string return',
  })
  parseString(val: string): string {
    return val;
  }

  @Option({
    flags: '-b, --boolean [boolean]',
    description: 'A boolean parser',
  })
  parseBoolean(val: string): boolean {
    return JSON.parse(val);
  }

  runWithString(param: string[], option: string): void {
    this.logService.log({ param, string: option });
  }

  runWithNumber(param: string[], option: number): void {
    this.logService.log({ param, number: option });
  }

  runWithBoolean(param: string[], option: boolean): void {
    this.logService.log({ param, boolean: option });
  }

  runWithNone(param: string[]): void {
    this.logService.log({ param });
  }
}
```

Command class modulga qo'shilganiga ishonch hosil qiling:

```ts
@Module({
  providers: [LogService, BasicCommand],
})
export class AppModule {}
```

Endi `main.ts` ichida CLI'ni ishga tushirish uchun quyidagini yozishingiz mumkin:

```ts
async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

Shu bilan command line ilovangiz tayyor bo'ladi.

#### Qo'shimcha ma'lumot

Ko'proq ma'lumot, misollar va API hujjatlari uchun nest-commander docs site ga tashrif buyuring.
