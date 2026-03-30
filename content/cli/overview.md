---
title: "Umumiy ko'rinish"
navTitle: "Umumiy ko'rinish"
description: "Nest CLI - bu buyruq qatori interfeysi vositasi bo'lib, Nest ilovalaringizni ishga tushirish, rivojlantirish va qo'llab-quvvatlashda yordam beradi. U bir nechta yo'llar bilan yorda"
order: 2
group: cli
groupTitle: "CLI"
---
Nest CLI - bu buyruq qatori interfeysi vositasi bo'lib, Nest ilovalaringizni ishga tushirish, rivojlantirish va qo'llab-quvvatlashda yordam beradi. U bir nechta yo'llar bilan yordam beradi, jumladan loyihani scaffold qilish, development rejimida ishga tushirish, hamda production distributsiyasi uchun ilovani build va bundling qilish. U yaxshi tuzilgan ilovalarni rag'batlantirish uchun eng yaxshi amaliy arxitektura patternlarini mujassam etadi.

#### O'rnatish

**Eslatma**: Ushbu qo'llanmada paketlarni o'rnatish uchun npmdan foydalanishni tasvirlaymiz, jumladan Nest CLI'ni ham. Boshqa package managerlardan ham xohishingizga ko'ra foydalanishingiz mumkin. npm bilan OS command line `nest` CLI binary faylining joylashuvini qanday topishini boshqarishning bir nechta usullari bor. Bu yerda biz `-g` opsiyasi bilan `nest` binary'ni global o'rnatishni tasvirlaymiz. Bu ma'lum qulaylik beradi va biz hujjatlar davomida shuni nazarda tutamiz. Shuni yodda tuting: **har qanday** `npm` paketini global o'rnatish foydalanuvchiga ularning to'g'ri versiyada ishlayotganini ta'minlash mas'uliyatini yuklaydi. Bu, shuningdek, turli loyihalaringiz bo'lsa, ularning barchasi CLI'ning **bir xil** versiyasini ishlatishini anglatadi. Yaxshi alternativ - npx dasturidan (yoki boshqa package managerlardagi shunga o'xshash imkoniyatlardan) foydalanish bo'lib, bu Nest CLI'ning **boshqariladigan versiya**sini ishlatishingizni ta'minlaydi. Qo'shimcha ma'lumot uchun npx documentation va/yoki DevOps qo'llab-quvvatlash jamoangizga murojaat qilishingizni tavsiya qilamiz.

CLI'ni `npm install -g` buyrug'i bilan global o'rnating (global o'rnatish haqida tafsilotlar uchun yuqoridagi **Eslatma**ga qarang).

```bash
$ npm install -g @nestjs/cli
```

> info **Hint** Muqobil ravishda, CLI'ni global o'rnatmasdan `npx @nestjs/cli@latest` buyrug'idan foydalanishingiz mumkin.

#### Asosiy ish jarayoni

O'rnatilgandan so'ng, CLI buyruqlarini OS command line orqali `nest` bajariladigan fayli bilan bevosita chaqirishingiz mumkin. Quyidagini kiritib, mavjud `nest` buyruqlarini ko'ring:

```bash
$ nest --help
```

Quyidagi konstruktsiya yordamida alohida buyruq bo'yicha yordam oling. Quyidagi misolda `generate` o'rnida `new`, `add` va h.k. kabi istalgan buyruqni qo'ying, shunda o'sha buyruq bo'yicha batafsil yordam olasiz:

```bash
$ nest generate --help
```

Development rejimida yangi oddiy Nest loyihasini yaratish, build qilish va ishga tushirish uchun, yangi loyiha bo'ladigan papkaning parent papkasiga o'ting va quyidagi buyruqlarni ishga tushiring:

```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev
```

Brauzeringizda http://localhost:3000 manzilini ochib, yangi ilovaning ishlayotganini ko'ring. App source fayllarini o'zgartirganingizda avtomatik qayta kompilyatsiya va reload qilinadi.

> info **Hint** Tezroq buildlar uchun [SWC builder](/docs/recipes/swc)dan foydalanishni tavsiya qilamiz (default TypeScript kompilyatoriga qaraganda 10x samaraliroq).

#### Loyiha tuzilmasi

`nest new` buyrug'ini ishga tushirganda, Nest yangi papka yaratib va boshlang'ich fayllar to'plamini to'ldirib, boilerplate ilova tuzilmasini generatsiya qiladi. Siz shu default tuzilmada ishlashda davom etishingiz va hujjatlarning boshqa bo'limlarida tasvirlanganidek yangi komponentlar qo'shishingiz mumkin. `nest new` generatsiya qilgan tuzilmani biz **standart rejim** deb ataymiz. Nest bir nechta loyiha va kutubxonalarni boshqarish uchun **monorepo rejimi** deb ataladigan alternativ tuzilmani ham qo'llab-quvvatlaydi.

**build** jarayonining ishlashiga oid bir nechta aniq masalalar (aslida, monorepo rejimi monorepo uslubidagi tuzilmalardan kelib chiqadigan murakkabliklarni soddalashtiradi) va built-in [library](/docs/cli/libraries) qo'llab-quvvatlashdan tashqari, Nestning boshqa barcha imkoniyatlari va ushbu hujjatlar standart va monorepo rejimlarida bir xil qo'llanadi. Aslida, standart rejimdan monorepo rejimiga istalgan vaqtda oson o'tishingiz mumkin, shuning uchun Nestni endi o'rganayotganda bu qarorni keyinga qoldirsangiz ham xavfsiz.

Bir nechta loyihani boshqarish uchun har ikkala rejimdan foydalanishingiz mumkin. Farqlarining qisqacha xulosasi:

| Xususiyat                                                  | Standart rejim                                                     | Monorepo rejimi                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Bir nechta loyiha                                          | Alohida fayl tizimi tuzilmasi                                      | Yagona fayl tizimi tuzilmasi                               |
| `node_modules` & `package.json`                            | Alohida instansiyalar                                              | Monorepo bo'ylab umumiy                                   |
| Default kompilyator                                       | `tsc`                                                              | webpack                                                    |
| Kompilyator sozlamalari                                    | Alohida ko'rsatiladi                                               | Monorepo defaultlari (loyiha bo'yicha override qilinadi)   |
| `eslint.config.mjs`, `.prettierrc` va h.k. kabi config fayllar | Alohida ko'rsatiladi                                            | Monorepo bo'ylab umumiy                                   |
| `nest build` va `nest start` buyruqlari                    | Kontekstdagi (yagona) loyihani default nishonga oladi              | Monorepodagi **default project**ni default nishonga oladi |
| Kutubxonalar                                               | Qo'lda boshqariladi, odatda npm packaging orqali                   | Built-in qo'llab-quvvatlash, jumladan path boshqaruvi va bundling |

Qaysi rejim sizga mosligini aniqlash uchun Workspace'lar va [Kutubxonalar](/docs/cli/libraries) bo'limlarini batafsil o'qing.

#### CLI buyruq sintaksisi

Barcha `nest` buyruqlari bir xil formatga ega:

```bash
nest commandOrAlias requiredArg [optionalArg] [options]
```

Masalan:

```bash
$ nest new my-nest-project --dry-run
```

Bu yerda `new` - _commandOrAlias_. `new` buyrug'ining `n` nomli aliasi bor. `my-nest-project` - _requiredArg_. Agar _requiredArg_ command line'da berilmagan bo'lsa, `nest` uni so'raydi. Shuningdek, `--dry-run`ning qisqa shakli `-d`. Shuni hisobga olsak, quyidagi buyruq yuqoridagiga ekvivalent:

```bash
$ nest n my-nest-project -d
```

Ko'pgina buyruqlar va ayrim opsiyalarning aliaslari bor. `nest new --help` buyrug'ini ishga tushirib, opsiyalar va aliaslarni ko'ring hamda yuqoridagi konstruktsiyani tushunganingizni tekshiring.

#### Buyruqlar umumiy ko'rinishi

Quyidagi buyruqlardan istalgan biri uchun `nest <command> --help`ni ishga tushirib, buyruqqa xos opsiyalarni ko'ring.

Har bir buyruq bo'yicha batafsil tavsiflar uchun [usage](/docs/cli/usages) bo'limiga qarang.

| Buyruq     | Alias | Tavsif                                                                                         |
| ---------- | ----- | ---------------------------------------------------------------------------------------------- |
| `new`      | `n`   | Ishga tushirish uchun zarur bo'lgan barcha boilerplate fayllari bilan yangi _standart rejim_ ilova yaratadi. |
| `generate` | `g`   | Schematic asosida fayllarni generatsiya qiladi va/yoki o'zgartiradi.                           |
| `build`    |       | Ilova yoki workspace'ni chiqish papkasiga kompilyatsiya qiladi.                               |
| `start`    |       | Ilovani (yoki workspace'dagi default loyihani) kompilyatsiya qiladi va ishga tushiradi.       |
| `add`      |       | **nest library** sifatida paketlangan kutubxonani import qiladi va uning install schematicini ishga tushiradi. |
| `info`     | `i`   | O'rnatilgan nest paketlari va boshqa foydali tizim ma'lumotlarini ko'rsatadi.                 |

#### Talablar

Nest CLI internationalization support (ICU) bilan build qilingan Node.js binary'sini talab qiladi, masalan Node.js project pagedagi rasmiy binarylar. Agar ICU bilan bog'liq xatolarga duch kelsangiz, binary'ingiz ushbu talabga mos kelishini tekshiring.

```bash
node -p process.versions.icu
```

Agar buyruq `undefined`ni chiqarsa, Node.js binary'ingizda internationalization support yo'q.
