---
title: "HTTP modul"
navTitle: "HTTP modul"
description: "Axios keng qo'llaniladigan, boy funksiyali HTTP client paketi. Nest Axiosni o'rab, uni o'rnatilgan HttpModule orqali taqdim etadi. HttpModule HttpService sinfini eksport qiladi; u "
order: 7
group: techniques
groupTitle: "Techniques"
---
Axios keng qo'llaniladigan, boy funksiyali HTTP client paketi. Nest Axiosni o'rab, uni o'rnatilgan `HttpModule` orqali taqdim etadi. `HttpModule` `HttpService` sinfini eksport qiladi; u Axiosga asoslangan metodlar orqali HTTP so'rovlarini bajarishga imkon beradi. Kutubxona shuningdek HTTP javoblarini `Observables` ga aylantiradi.

> info **Hint** Istalgan umumiy maqsadli Node.js HTTP client kutubxonasini ham bevosita ishlatishingiz mumkin, jumladan got yoki undici.

#### O'rnatish

Ishlatishni boshlash uchun avval kerakli bog'liqliklarni o'rnating.

```bash
$ npm i --save @nestjs/axios axios
```

#### Boshlash

O'rnatish jarayoni tugagach, `HttpService` dan foydalanish uchun avval `HttpModule` ni import qiling.

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
```

Keyin `HttpService` ni odatiy konstruktor in'eksiyasi orqali kiriting.

> info **Hint** `HttpModule` va `HttpService` `@nestjs/axios` paketidan import qilinadi.

```typescript
@@filename()
@Injectable()
export class CatsService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Observable<AxiosResponse<Cat[]>> {
    return this.httpService.get('http://localhost:3000/cats');
  }
}
@@switch
@Injectable()
@Dependencies(HttpService)
export class CatsService {
  constructor(httpService) {
    this.httpService = httpService;
  }

  findAll() {
    return this.httpService.get('http://localhost:3000/cats');
  }
}
```

> info **Hint** `AxiosResponse` `axios` paketidan eksport qilinadigan interfeys (`$ npm i axios`).

Barcha `HttpService` metodlari `Observable` obyektiga o'ralgan `AxiosResponse` qaytaradi.

#### Konfiguratsiya

Axios `HttpService` xatti-harakatini moslashtirish uchun turli opsiyalar bilan sozlanishi mumkin. Batafsil bu yerda o'qing. Asosiy Axios instansiyasini sozlash uchun `HttpModule` ni import qilayotganda `register()` metodiga ixtiyoriy opsiyalar obyektini uzating. Ushbu opsiyalar obyektini bevosita Axios konstruktoriga uzatiladi.

```typescript
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [CatsService],
})
export class CatsModule {}
```

#### Asinxron konfiguratsiya

Modul opsiyalarini statik emas, asinxron uzatish kerak bo'lsa, `registerAsync()` metodidan foydalaning. Ko'p dinamik modullarda bo'lgani kabi, Nest asinxron konfiguratsiya uchun bir nechta texnikani taqdim etadi.

Bitta texnika - factory funksiyasidan foydalanish:

```typescript
HttpModule.registerAsync({
  useFactory: () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
});
```

Boshqa factory provayderlar kabi, factory funksiyamiz async bo'lishi mumkin va `inject` orqali bog'liqliklarni in'eksiya qilishi mumkin.

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    timeout: configService.get('HTTP_TIMEOUT'),
    maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
  }),
  inject: [ConfigService],
});
```

Muqobil ravishda, quyida ko'rsatilgandek `HttpModule` ni factory o'rniga sinf orqali sozlashingiz mumkin.

```typescript
HttpModule.registerAsync({
  useClass: HttpConfigService,
});
```

Yuqoridagi konstruktsiya `HttpConfigService` ni `HttpModule` ichida instansiyalaydi va undan opsiyalar obyektini yaratish uchun foydalanadi. Bu misolda `HttpConfigService` quyida ko'rsatilganidek `HttpModuleOptionsFactory` interfeysini amalga oshirishi shart. `HttpModule` taqdim etilgan sinf instansiyasida `createHttpOptions()` metodini chaqiradi.

```typescript
@Injectable()
class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: 5000,
      maxRedirects: 5,
    };
  }
}
```

Agar `HttpModule` ichida shaxsiy nusxa yaratish o'rniga mavjud opsiyalar provayderini qayta ishlatmoqchi bo'lsangiz, `useExisting` sintaksisini ishlating.

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useExisting: HttpConfigService,
});
```

Shuningdek, `registerAsync()` metodiga `extraProviders` deb ataladigan provayderlarni uzatishingiz mumkin. Bu provayderlar modul provayderlariga qo'shib yuboriladi.

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useClass: HttpConfigService,
  extraProviders: [MyAdditionalProvider],
});
```

Bu factory funksiyasi yoki sinf konstruktori uchun qo'shimcha bog'liqliklarni taqdim etmoqchi bo'lganingizda foydali.

#### Axios'ni bevosita ishlatish

Agar `HttpModule.register` opsiyalari sizga yetarli bo'lmasa yoki `@nestjs/axios` yaratgan asosiy Axios instansiyasiga bevosita kirishni xohlasangiz, `HttpService#axiosRef` orqali kirishingiz mumkin, quyidagicha:

```typescript
@Injectable()
export class CatsService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Promise<AxiosResponse<Cat[]>> {
    return this.httpService.axiosRef.get('http://localhost:3000/cats');
    //                      ^ AxiosInstance interface
  }
}
```

#### To'liq misol

`HttpService` metodlarining qaytadigan qiymati Observable bo'lgani sababli, so'rov ma'lumotini promise ko'rinishida olish uchun `rxjs` - `firstValueFrom` yoki `lastValueFrom` dan foydalanishimiz mumkin.

```typescript
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class CatsService {
  private readonly logger = new Logger(CatsService.name);
  constructor(private readonly httpService: HttpService) {}

  async findAll(): Promise<Cat[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Cat[]>('http://localhost:3000/cats').pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }
}
```

> info **Hint** `firstValueFrom` va `lastValueFrom` o'rtasidagi farqlar uchun RxJS hujjatlaridagi `firstValueFrom` va `lastValueFrom` bo'limlariga qarang.
