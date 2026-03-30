---
title: "Request lifecycle"
navTitle: "Request lifecycle"
description: "Nest ilovalari so'rovlarni qayta ishlash va javoblarni yaratishni biz request lifecycle deb ataydigan ketma-ketlikda bajaradi. Middleware, pipe, guard va interceptor'lardan foydala"
order: 8
group: faq
groupTitle: "FAQ"
---
Nest ilovalari so'rovlarni qayta ishlash va javoblarni yaratishni biz **request lifecycle** deb ataydigan ketma-ketlikda bajaradi. Middleware, pipe, guard va interceptor'lardan foydalanilganda, ayniqsa global, controller-level va route-level komponentlar ishga tushganda, kodning qaysi qismi lifecycle'ning qayerida bajarilayotganini kuzatish qiyinlashishi mumkin. Umuman olganda, so'rov middleware'dan guard'larga, keyin interceptor'larga, so'ng pipe'larga o'tadi va oxirida qaytish yo'lida yana interceptor'lar orqali javob hosil bo'ladi.

#### Middleware

Middleware ma'lum bir ketma-ketlikda bajariladi. Avval Nest global bog'langan middleware'larni (`app.use` bilan bog'langan middleware kabi) ishga tushiradi, keyin esa yo'llar bo'yicha aniqlangan module-bound middleware larni bajaradi. Middleware'lar Express'dagi kabi, bog'langan tartibida ketma-ket ishlaydi. Turli modullar bo'ylab bog'langan middleware'lar bo'lsa, root modulga bog'langani birinchi ishlaydi, keyin esa `imports` massiviga modullar qanday tartibda qo'shilgan bo'lsa, shu tartibda davom etadi.

#### Guards

Guard'larning bajarilishi global guard'lardan boshlanadi, keyin controller guard'lariga, oxirida esa route guard'lariga o'tadi. Middleware kabi, guard'lar ham qaysi tartibda bog'langan bo'lsa, shu tartibda ishlaydi. Masalan:

```typescript
@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}
```

`Guard1`, `Guard2` dan oldin ishlaydi va ikkalasi ham `Guard3` dan oldin bajariladi.

> info **Hint** Global bog'langan va controller yoki lokal bog'langan komponentlar haqida gapirganda, farq guard (yoki boshqa komponent) qayerga bog'langanida. Agar siz `app.useGlobalGuard()` dan foydalansangiz yoki komponentni modul orqali taqdim etsangiz, u global bog'langan bo'ladi. Aks holda, dekorator controller class'dan oldin kelsa controller'ga, route e'lonidan oldin kelsa route'ga bog'langan bo'ladi.

#### Interceptors

Interceptor'lar ko'p jihatdan guard'lar bilan bir xil qolipga amal qiladi, ammo bitta farqi bor: interceptor'lar RxJS Observable qaytargani uchun ular first in last out tartibida resolve bo'ladi. Demak, kiruvchi so'rovlar odatdagi global -> controller -> route ketma-ketligi bo'yicha o'tadi, biroq javob tomoni (ya'ni controller method handler'dan qaytgandan keyin) route -> controller -> global tartibida resolve bo'ladi. Shuningdek, pipe, controller yoki service ichida throw qilingan xatolarni interceptor'dagi `catchError` operatorida ushlash mumkin.

#### Pipes

Pipe'lar standart global -> controller -> route ketma-ketligiga amal qiladi va `@UsePipes()` parametrlari uchun ham first in first out tartibi saqlanadi. Biroq route parametri darajasida bir nechta pipe ishlayotgan bo'lsa, ular pipe biriktirilgan oxirgi parametrdan birinchi parametrgacha bo'lgan tartibda bajariladi. Bu qoida route-level va controller-level pipe'larga ham tegishli. Masalan, quyidagi controller bo'lsa:

```typescript
@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery,
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}
```

unda `GeneralValidationPipe` avval `query`, keyin `params`, so'ng `body` obyektlari uchun ishlaydi va undan keyin xuddi shu tartib bo'yicha `RouteSpecificPipe` ga o'tadi. Agar parametrga xos pipe'lar bo'lsa, ular controller-level va route-level pipe'lardan keyin yana o'sha oxirgidan birinchiga qarab ishlaydi.

#### Filters

Filter'lar global-first resolve bo'lmaydigan yagona komponentdir. Aksincha, ular mumkin bo'lgan eng past darajadan resolve bo'ladi, ya'ni bajarilish avval route'ga bog'langan filter'lardan boshlanadi, keyin controller-level, oxirida esa global filter'larga o'tadi. E'tibor bering, exception bir filter'dan boshqasiga uzatilmaydi; agar route-level filter exception'ni ushlasa, controller-level yoki global filter o'sha exception'ni qayta ushlay olmaydi. Bunday effektga erishishning yagona yo'li - filter'lar orasida inheritance'dan foydalanish.

> info **Hint** Filter'lar faqat request jarayonida ushlanmagan exception yuz berganida ishlaydi. `try/catch` bilan ushlangan exception'lar Exception Filter'larni ishga tushirmaydi. Uhlanmagan exception uchrashi bilan lifecycle'ning qolgan qismi e'tiborsiz qoldiriladi va request to'g'ridan-to'g'ri filter'ga o'tadi.

#### Xulosa

Umuman olganda, request lifecycle quyidagicha ko'rinadi:

1. Kiruvchi request
2. Middleware
3. Guards
4. Interceptors (controller'dan oldin)
5. Pipes
6. Controller (method handler)
7. Service (agar mavjud bo'lsa)
8. Interceptors (request'dan keyin)
9. Exception filters
10. Server javobi

Tartib quyidagicha aniqlashadi:
`Middleware`: global, keyin module-bound.
`Guards`: global, keyin controller, keyin route.
`Interceptors` (oldin): global, keyin controller, keyin route.
`Pipes`: global, keyin controller, keyin route, keyin route parametrlari.
`Interceptors` (keyin): route, keyin controller, keyin global.
`Exception filters`: route, keyin controller, keyin global.
