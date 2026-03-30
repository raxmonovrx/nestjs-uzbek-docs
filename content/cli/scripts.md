---
title: "Nest CLI va skriptlar"
navTitle: "Nest CLI va skriptlar"
description: "Ushbu bo'lim nest buyrug'i kompilyatorlar va skriptlar bilan qanday ishlashi haqida qo'shimcha ma'lumot beradi, bu DevOps mutaxassislariga development muhitini boshqarishda yordam "
order: 3
group: cli
groupTitle: "CLI"
---
Ushbu bo'lim `nest` buyrug'i kompilyatorlar va skriptlar bilan qanday ishlashi haqida qo'shimcha ma'lumot beradi, bu DevOps mutaxassislariga development muhitini boshqarishda yordam beradi.

Nest ilovasi - bu **standart** TypeScript ilova bo'lib, uni bajarishdan oldin JavaScriptga kompilyatsiya qilish kerak. Kompilyatsiya bosqichini bajarishning turli yo'llari mavjud va developerlar/jamoalar o'zlariga mos keladigan usulni tanlashda erkin. Shu nuqtai nazardan, Nest quyidagi maqsadlarni ko'zlaydigan built-in vositalar to'plamini taqdim etadi:

- Buyruq qatorida mavjud, oqilona defaultlar bilan "shunchaki ishlaydigan" standart build/execute jarayonini taqdim etish.
- Build/execute jarayonining **ochiq** bo'lishini ta'minlash, shunda developerlar native imkoniyatlar va opsiyalar orqali underlying vositalarga bevosita kirib, ularni moslashtira oladi.
- To'liq standart TypeScript/Node.js freymvorki bo'lib qolish, shunda butun compile/deploy/execute pipeline'ini development jamoasi tanlagan istalgan tashqi vositalar bilan boshqarish mumkin bo'ladi.

Bu maqsad `nest` buyrug'i, lokal o'rnatilgan TypeScript kompilyatori va `package.json` skriptlarining kombinatsiyasi orqali amalga oshiriladi. Quyida bu texnologiyalar qanday birga ishlashini tasvirlaymiz. Bu build/execute jarayonining har bir bosqichida nima bo'layotganini va zarur bo'lsa xatti-harakatni qanday moslashtirishni tushunishga yordam beradi.

#### nest binary

`nest` buyrug'i OS darajasidagi binary (ya'ni OS command line'dan ishlaydi). Bu buyruq aslida quyida tasvirlangan 3 ta alohida sohani qamrab oladi. Biz build (`nest build`) va execute (`nest start`) sub-buyruqlarini loyiha scaffold qilinganda avtomatik yaratiladigan `package.json` skriptlari orqali ishga tushirishni tavsiya qilamiz (repo'ni klon qilish orqali boshlamoqchi bo'lsangiz typescript starterga qarang, `nest new`dan foydalanish o'rniga).

#### Build

`nest build` - bu standart `tsc` kompilyatori yoki `swc` kompilyatori ( [standard projects](/docs/cli/overview#project-structure) uchun) yoki `ts-loader`dan foydalanuvchi webpack bundler ( [monorepos](/docs/cli/overview#project-structure) uchun) ustidagi wrapper. U `tsconfig-paths`ni qutidan ishlatishdan tashqari boshqa kompilyatsiya funksiyalari yoki bosqichlarini qo'shmaydi. Uning mavjud bo'lish sababi shuki, ko'plab developerlar, ayniqsa Nest bilan yangi boshlayotganlar, kompilyator opsiyalarini (masalan, `tsconfig.json` fayli) sozlashga hojat sezmaydi va bu ba'zan murakkab bo'lishi mumkin.

Batafsil ma'lumot uchun [nest build](/docs/cli/usages#nest-build) hujjatiga qarang.

#### Execution

`nest start` shunchaki loyiha build qilinganini ( `nest build` bilan bir xil) ta'minlaydi va so'ng kompilyatsiya qilingan ilovani bajarish uchun `node` buyrug'ini ko'chma va qulay tarzda ishga tushiradi. Buildlar kabi, bu jarayonni ham xohlaganingizcha moslashtira olasiz: `nest start` buyrug'i va uning opsiyalaridan foydalanish yoki butunlay o'zingizning jarayoningizni yaratish orqali. Butun jarayon standart TypeScript ilovasini build va execute qilish pipeline'idir, va siz bu jarayonni xohlaganingizcha boshqarishingiz mumkin.

Batafsil ma'lumot uchun [nest start](/docs/cli/usages#nest-start) hujjatiga qarang.

#### Generation

`nest generate` buyruqlari, nomidan ko'rinib turganidek, yangi Nest loyihalarini yoki ularning ichidagi komponentlarni generatsiya qiladi.

#### Package skriptlari

`nest` buyruqlarini OS darajasida ishga tushirish `nest` binary'sining global o'rnatilgan bo'lishini talab qiladi. Bu npm'ning standart xususiyati bo'lib, Nestning bevosita nazoratidan tashqarida. Buning oqibatlaridan biri - global o'rnatilgan `nest` binary `package.json`da loyiha dependency'si sifatida boshqarilmaydi. Masalan, turli developerlar `nest` binary'ning turli versiyalarini ishlatayotgan bo'lishi mumkin. Buni hal qilishning standart yo'li - package skriptlaridan foydalanish, shunda build va execute bosqichlarida ishlatiladigan vositalarni development dependency sifatida boshqarasiz.

`nest new`ni ishga tushirganda yoki typescript starterni klon qilganda, Nest yangi loyihaning `package.json` skriptlarini `build` va `start` kabi buyruqlar bilan to'ldiradi. Shuningdek, u underlying kompilyator vositalarini (masalan, `typescript`) **dev dependencies** sifatida o'rnatadi.

Build va execute skriptlarini quyidagi buyruqlar bilan ishga tushirasiz:

```bash
$ npm run build
```

va

```bash
$ npm run start
```

Bu buyruqlar npm'ning script ishlatish imkoniyatlaridan foydalanib `nest build` yoki `nest start`ni **lokal o'rnatilgan** `nest` binary orqali bajaradi. Bu built-in package skriptlaridan foydalanganingizda, Nest CLI buyruqlari ustidan to'liq dependency boshqaruviga ega bo'lasiz*. Bu shuni anglatadiki, **tavsiya etilgan** ushbu foydalanish usuliga amal qilganda, tashkilotingizdagi barcha a'zolar buyruqlarning bir xil versiyasini ishlatayotganiga ishonch hosil qiladi.

*Bu `build` va `start` buyruqlariga taalluqli. `nest new` va `nest generate` buyruqlari build/execute pipeline'ining bir qismi emas, shuning uchun ular boshqa kontekstda ishlaydi va built-in `package.json` skriptlariga ega emas.

Ko'pchilik developerlar/jamoalar uchun Nest loyihalarini build va execute qilishda package skriptlaridan foydalanish tavsiya etiladi. Siz bu skriptlarning xatti-harakatini ularning opsiyalari (`--path`, `--webpack`, `--webpackPath`) orqali va/yoki `tsc` yoki webpack kompilyator opsiya fayllarini (masalan, `tsconfig.json`) moslashtirish orqali to'liq sozlashingiz mumkin. Shuningdek, TypeScriptni kompilyatsiya qilish uchun (hatto `ts-node` bilan TypeScriptni bevosita bajarish uchun) butunlay custom build jarayonini ham ishga tushirishingiz mumkin.

#### Orqaga moslik

Nest ilovalari toza TypeScript ilovalari bo'lgani uchun, Nest build/execute skriptlarining oldingi versiyalari ishlashda davom etadi. Ularni yangilash shart emas. Siz yangi `nest build` va `nest start` buyruqlaridan foydalanishni xohlagan vaqtingizda boshlashingiz mumkin yoki oldingi yoki moslashtirilgan skriptlarni davom ettirishingiz mumkin.

#### Migratsiya

Hech qanday o'zgarish qilish shart bo'lmasa-da, `tsc-watch` yoki `ts-node` kabi vositalardan foydalanish o'rniga yangi CLI buyruqlaridan foydalanishga migratsiya qilishni xohlashingiz mumkin. Bunday holda, `@nestjs/cli`ning eng so'nggi versiyasini ham global, ham lokal o'rnating:

```bash
$ npm install -g @nestjs/cli
$ cd  /some/project/root/folder
$ npm install -D @nestjs/cli
```

So'ng `package.json`dagi `scripts`ni quyidagi buyruqlar bilan almashtirishingiz mumkin:

```typescript
"build": "nest build",
"start": "nest start",
"start:dev": "nest start --watch",
"start:debug": "nest start --debug --watch",
```
