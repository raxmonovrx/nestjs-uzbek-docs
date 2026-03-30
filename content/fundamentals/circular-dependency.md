---
title: "Aylanma bog'liqlik"
navTitle: "Aylanma bog'liqlik"
description: "Aylanma bog'liqlik ikki sinf bir-biriga bog'liq bo'lganda yuzaga keladi. Masalan, A sinfi B sinfiga muhtoj, va B sinfi ham A sinfiga muhtoj. Aylanma bog'liqliklar Nestda modullar v"
order: 2
group: fundamentals
groupTitle: "Fundamentals"
---
Aylanma bog'liqlik ikki sinf bir-biriga bog'liq bo'lganda yuzaga keladi. Masalan, A sinfi B sinfiga muhtoj, va B sinfi ham A sinfiga muhtoj. Aylanma bog'liqliklar Nestda modullar va provayderlar o'rtasida paydo bo'lishi mumkin.

Imkon qadar aylanma bog'liqliklardan qochish kerak, ammo har doim ham bunga erishib bo'lmaydi. Bunday hollarda Nest provayderlar o'rtasidagi aylanma bog'liqliklarni ikki yo'l bilan yechishni qo'llab-quvvatlaydi. Ushbu bobda biz bitta texnika sifatida **forward referencing** dan foydalanishni, ikkinchi usul sifatida esa DI konteyneridan provayder instansiyasini olish uchun **ModuleRef** sinfidan foydalanishni ko'rib chiqamiz.

Shuningdek, modullar o'rtasidagi aylanma bog'liqliklarni yechish haqida ham gapiramiz.

> warning **Warning** Aylanma bog'liqlik importlarni guruhlash uchun "barrel files"/index.ts fayllaridan foydalanganda ham yuzaga kelishi mumkin. Modul/provayder sinflariga kelganda barrel fayllardan voz kechish kerak. Masalan, barrel fayl bilan bir xil katalogdagi fayllarni import qilishda barrel fayldan foydalanmaslik kerak, ya'ni `cats/cats.controller` `cats/cats.service` faylini import qilish uchun `cats` ni import qilmasligi kerak. Batafsil ma'lumot uchun ushbu GitHub issue ni ham ko'ring.

#### Forward reference

**Forward reference** Nestga hali aniqlanmagan sinflarga `forwardRef()` yordamchi funksiyasi orqali murojaat qilish imkonini beradi. Masalan, agar `CatsService` va `CommonService` bir-biriga bog'liq bo'lsa, munosabatning ikkala tomoni ham `@Inject()` va `forwardRef()` yordamchi funksiyasidan foydalanib aylanma bog'liqlikni yechishi mumkin. Aks holda Nest ularni instansiyalamaydi, chunki barcha zarur metadata mavjud bo'lmaydi. Quyida misol keltirilgan:

```typescript
@@filename(cats.service)
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}
@@switch
@Injectable()
@Dependencies(forwardRef(() => CommonService))
export class CatsService {
  constructor(commonService) {
    this.commonService = commonService;
  }
}
```

> info **Hint** `forwardRef()` funksiyasi `@nestjs/common` paketidan import qilinadi.

Bu munosabatning bir tomonini qamrab oladi. Endi xuddi shu ishni `CommonService` bilan qilamiz:

```typescript
@@filename(common.service)
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}
@@switch
@Injectable()
@Dependencies(forwardRef(() => CatsService))
export class CommonService {
  constructor(catsService) {
    this.catsService = catsService;
  }
}
```

> warning **Warning** Instansiyalash tartibi noaniq. Kodingiz qaysi konstruktor birinchi chaqirilishiga bog'liq bo'lmasligiga ishonch hosil qiling. Aylanma bog'liqliklarni `Scope.REQUEST` ga ega provayderlarga bog'lash aniqlanmagan bog'liqliklarga olib kelishi mumkin. Batafsil ma'lumot bu yerda mavjud.

#### ModuleRef sinfi muqobili

`forwardRef()` dan foydalanishga muqobil ravishda, kodingizni refaktor qilish va (aks holda) aylanma munosabatning bir tomonida provayderni olish uchun `ModuleRef` sinfidan foydalanishingiz mumkin. `ModuleRef` yordamchi sinfi haqida batafsil bu yerda.

#### Modul forward reference

Modullar o'rtasidagi aylanma bog'liqliklarni yechish uchun modul assotsiatsiyasining har ikki tomonida ham `forwardRef()` yordamchi funksiyasidan foydalaning. Masalan:

```typescript
@@filename(common.module)
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

Bu munosabatning bir tomonini qamrab oladi. Endi xuddi shu ishni `CatsModule` bilan qilamiz:

```typescript
@@filename(cats.module)
@Module({
  imports: [forwardRef(() => CommonModule)],
})
export class CatsModule {}
```
