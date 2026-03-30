---
title: "Umumiy ko'rinish"
navTitle: "Umumiy ko'rinish"
description: "Mahalliy ilovangizni debug qilishni boshlash uchun main.ts faylini oching va application options obyektida snapshot atributi true qilib qo'yilganiga ishonch hosil qiling:"
order: 2
group: devtools
groupTitle: "Devtools"
---
> info **Hint** Ushbu bob Nest Devtools'ning Nest freymvorki bilan integratsiyasini qamrab oladi. Agar siz Devtools ilovasining o'zini izlayotgan bo'lsangiz, Devtools saytiga o'ting.

Mahalliy ilovangizni debug qilishni boshlash uchun `main.ts` faylini oching va application options obyektida `snapshot` atributi `true` qilib qo'yilganiga ishonch hosil qiling:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
```

Bu freymvorkka Nest Devtools ilovangiz grafigini vizualizatsiya qila olishi uchun kerakli metadata'ni yig'ishni buyuradi.

Endi kerakli dependency'ni o'rnatamiz:

```bash
$ npm i @nestjs/devtools-integration
```

> warning **Warning** Agar ilovangizda `@nestjs/graphql` paketidan foydalanayotgan bo'lsangiz, uning eng so'nggi versiyasini (`npm i @nestjs/graphql@11`) o'rnating.

Dependency o'rnatilgach, `app.module.ts` faylini oching va hozirgina o'rnatgan `DevtoolsModule` ni import qiling:

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> warning **Warning** Bu yerda `NODE_ENV` environment variable'ini tekshirayotganimizning sababi - ushbu moduldan production'da hech qachon foydalanmasligingiz kerak.

`DevtoolsModule` import qilingach va ilovangiz ishga tushgach (`npm run start:dev`), Devtools manziliga o'tib, introspection qilingan graph'ni ko'rishingiz kerak.

> info **Hint** Yuqoridagi skrinshotda ko'rib turganingizdek, har bir modul `InternalCoreModule` ga ulanadi. `InternalCoreModule` - bu root modulga doim import qilinadigan global modul. U global node sifatida ro'yxatdan o'tgani uchun Nest barcha modullar va `InternalCoreModule` node'i o'rtasida avtomatik edge'lar yaratadi. Agar graph'da global modullarni yashirmoqchi bo'lsangiz, sidebar'dagi "**Hide global modules**" checkbox'idan foydalaning.

Ko'rinib turibdiki, `DevtoolsModule` ilovangizga qo'shimcha HTTP server (8000-portda) ochdiradi va Devtools shu server orqali ilovangizni introspection qiladi.

Hammasi kutilganidek ishlayotganini tekshirish uchun graph ko'rinishini "Classes" ga almashtiring. Siz quyidagi oynani ko'rishingiz kerak:

Muayyan node'ga fokus qilish uchun to'rtburchak ustiga bosing, shunda graph **"Focus"** tugmasi bor popup oynani ko'rsatadi. Shuningdek, aniq node'ni topish uchun sidebar'dagi search bar'dan foydalanishingiz mumkin.

> info **Hint** Agar **Inspect** tugmasini bossangiz, ilova sizni aynan o'sha node tanlangan `/debug` sahifasiga olib boradi.

> info **Hint** Graph'ni rasm sifatida export qilish uchun graph'ning o'ng burchagidagi **Export as PNG** tugmasini bosing.

Chap tomondagi sidebar'da joylashgan form control'lar yordamida edge'larning yaqinligini boshqarishingiz va masalan, ilovaning muayyan sub-tree qismini vizualizatsiya qilishingiz mumkin:

Bu ayniqsa jamoangizda **yangi dasturchilar** bo'lganda va ularga ilova tuzilmasini ko'rsatmoqchi bo'lganingizda foydali. Bundan tashqari, muayyan modulni (masalan, `TasksModule`) va uning barcha dependency'larini ko'rsatish uchun ham ushbu imkoniyatdan foydalanishingiz mumkin. Bu katta ilovani kichik modullarga (masalan, alohida mikroservislarga) ajratayotganda ayniqsa qo'l keladi.

**Graph Explorer** funksiyasi amalda qanday ishlashini ko'rish uchun ushbu videoni tomosha qilishingiz mumkin:

#### "Cannot resolve dependency" xatosini tekshirish

> info **Note** Bu imkoniyat `@nestjs/core` >= `v9.3.10` uchun qo'llab-quvvatlanadi.

Siz ko'rgan eng ko'p uchraydigan xatolardan biri Nest provider dependency'larini resolve qila olmasligi bilan bog'liq bo'lishi mumkin. Nest Devtools yordamida muammoni tezda topish va uni qanday hal qilishni tushunish mumkin.

Buning uchun avval `main.ts` faylini oching va `bootstrap()` chaqiruvini quyidagicha yangilang:

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});
```

Shuningdek, `abortOnError` qiymati `false` bo'lishiga ishonch hosil qiling:

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});
```

Endi har safar ilovangiz **"Cannot resolve dependency"** xatosi sabab bootstrap bo'la olmasa, root katalogda qisman graph'ni ifodalovchi `graph.json` fayli paydo bo'ladi. Keyin bu faylni Devtools'ga drag & drop qilishingiz mumkin (`Interactive` rejimidan `Preview` rejimiga o'tganingizga ishonch hosil qiling):

Yuklash muvaffaqiyatli bo'lsa, quyidagi graph va dialog oynasini ko'rasiz:

Ko'rib turganingizdek, highlight qilingan `TasksModule` - aynan ko'rib chiqishimiz kerak bo'lgan modul. Dialog oynasida esa muammoni qanday tuzatish bo'yicha ayrim ko'rsatmalar allaqachon chiqadi.

Agar uning o'rniga "Classes" ko'rinishiga o'tsak, quyidagini ko'ramiz:

Bu graph `TasksService` ichiga inject qilmoqchi bo'lgan `DiagnosticsService` `TasksModule` kontekstida topilmaganini ko'rsatadi. Ehtimol muammoni hal qilish uchun `DiagnosticsModule` ni `TasksModule` ichiga import qilish kifoya qiladi.

#### Routes explorer

**Routes explorer** sahifasiga o'tganingizda, barcha ro'yxatdan o'tgan entrypoint'larni ko'rishingiz kerak:

> info **Hint** Ushbu sahifa faqat HTTP route'larni emas, balki boshqa barcha entrypoint'larni ham ko'rsatadi (masalan, WebSockets, gRPC, GraphQL resolver'lar va hokazo).

Entrypoint'lar ularning host controller'lari bo'yicha guruhlangan bo'ladi. Muayyan entrypoint'ni topish uchun search bar'dan foydalanishingiz ham mumkin.

Agar aniq bir entrypoint ustiga bossangiz, **flow graph** ko'rsatiladi. Bu graph entrypoint'ning bajarilish oqimini (masalan, ushbu route'ga bog'langan guard, interceptor, pipe va hokazolarni) ko'rsatadi. Bu, ayniqsa, muayyan route uchun request/response sikli qanday kechishini tushunmoqchi bo'lsangiz yoki nega ma'lum bir guard/interceptor/pipe ishga tushmayotganini aniqlamoqchi bo'lsangiz juda foydali.

#### Sandbox

JavaScript kodini shu zahoti bajarish va ilovangiz bilan real vaqt rejimida ishlash uchun **Sandbox** sahifasiga o'ting:

Playground yordamida API endpoint'larni **real vaqt rejimida** test qilish va debug qilish mumkin. Bu dasturchilarga, masalan, HTTP client ishlatmasdan muammolarni tezda topish va tuzatish imkonini beradi. Shuningdek, authentication qatlamini chetlab o'tishimiz mumkin, demak test uchun alohida login yoki maxsus foydalanuvchi akkaunti kerak bo'lmaydi. Event-driven ilovalarda esa event'larni bevosita playground'dan trigger qilib, ilova ularga qanday reaksiya berishini ko'rish mumkin.

Log qilingan har qanday ma'lumot playground konsoliga yuboriladi, shu sabab nima bo'layotganini oson kuzatish mumkin.

Ilovani qayta build qilish va serverni restart qilishsiz, kodni **shu zahoti** bajaring va natijani darhol ko'ring.

> info **Hint** Obyektlar massivini chiroyli ko'rsatish uchun `console.table()` (yoki shunchaki `table()`) funksiyasidan foydalaning.

**Interactive Playground** funksiyasi amalda qanday ishlashini ko'rish uchun ushbu videoni tomosha qilishingiz mumkin:

#### Bootstrap performance analyzer

Barcha class node'lar (controller, provider, enhancer va hokazo) hamda ularning instansiyalanish vaqtlarini ko'rish uchun **Bootstrap performance** sahifasiga o'ting:

Bu sahifa ilovangizning bootstrap jarayonidagi eng sekin qismlarni aniqlamoqchi bo'lganingizda ayniqsa foydali (masalan, serverless muhitlarda juda muhim bo'lgan startup vaqtini optimallashtirmoqchi bo'lsangiz).

#### Audit

Ilovangiz serialized graph'ni tahlil qilish jarayonida aniqlagan avtomatik audit - xatolar, warning'lar va hint'larni ko'rish uchun **Audit** sahifasiga o'ting:

> info **Hint** Yuqoridagi skrinshot barcha mavjud audit qoidalarini ko'rsatmaydi.

Bu sahifa ilovangizdagi potentsial muammolarni aniqlashda juda qo'l keladi.

#### Static fayllarni preview qilish

Serialized graph'ni faylga saqlash uchun quyidagi koddan foydalaning:

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());
```

> info **Hint** `SerializedGraph` `@nestjs/core` paketidan export qilinadi.

Shundan so'ng ushbu faylni drag-and-drop yoki upload qilishingiz mumkin:

Bu graph'ni boshqa birov bilan (masalan, hamkasbingiz bilan) ulashmoqchi bo'lsangiz yoki uni offline tahlil qilmoqchi bo'lsangiz foydali.
