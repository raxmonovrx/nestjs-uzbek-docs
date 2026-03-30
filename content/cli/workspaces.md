---
title: "Workspace'lar"
navTitle: "Workspace'lar"
description: "Nest kodni tashkil qilishning ikki rejimini qo'llab-quvvatlaydi:"
order: 5
group: cli
groupTitle: "CLI"
---
Nest kodni tashkil qilishning ikki rejimini qo'llab-quvvatlaydi:

- **standart rejim**: o'z dependency'lari va sozlamalari bo'lgan, modul ulashishni yoki murakkab buildlarni optimallashtirishni talab qilmaydigan alohida, loyiha markazli ilovalarni qurish uchun foydali. Bu default rejim.
- **monorepo rejimi**: bu rejim kod artefaktlarini yengil **monorepo**ning bir qismi sifatida ko'radi va developer jamoalari va/yoki ko'p loyiha muhitlari uchun ko'proq mos bo'lishi mumkin. U build jarayonining ayrim qismlarini avtomatlashtirib, modulli komponentlarni yaratish va kompozitsiya qilishni osonlashtiradi, koddan qayta foydalanishni rag'batlantiradi, integratsion testlarni yengillashtiradi, `eslint` qoidalari va boshqa konfiguratsiya siyosatlari kabi loyiha darajasidagi artefaktlarni ulashishni oson qiladi va Git submodullari kabi alternativalarga qaraganda foydalanishga oson. Monorepo rejimi `nest-cli.json` faylida ko'rsatilgan **workspace** tushunchasidan foydalanib, monorepo komponentlari o'rtasidagi munosabatlarni muvofiqlashtiradi.

Shuni ta'kidlash kerakki, Nestning deyarli barcha imkoniyatlari kodni tashkil qilish rejimidan mustaqil. Bu tanlovning **yagona** ta'siri - loyihalaringiz qanday kompozitsiya qilinishi va build artefaktlari qanday generatsiya qilinishidir. CLI dan tortib core modullargacha va add-on modullargacha bo'lgan boshqa barcha funksionalliklar har ikki rejimda ham bir xil ishlaydi.

Shuningdek, siz istalgan vaqtda **standart rejim**dan **monorepo rejimi**ga oson o'tishingiz mumkin, shuning uchun qaysi yondashuvning foydasi ko'proq ekanligi aniq bo'lguncha bu qarorni kechiktirishingiz mumkin.

#### Standart rejim

`nest new`ni ishga tushirganda, built-in schematic yordamida yangi **project** yaratiladi. Nest quyidagilarni bajaradi:

1. `nest new`ga bergan `name` argumentiga mos yangi papka yaratadi
2. Shu papkani minimal darajadagi Nest ilovaga mos default fayllar bilan to'ldiradi. Bu fayllarni typescript-starter repozitoriyasida ko'rishingiz mumkin.
3. Ilovangizni kompilyatsiya qilish, test qilish va servis qilish uchun turli vositalarni sozlaydigan `nest-cli.json`, `package.json` va `tsconfig.json` kabi qo'shimcha fayllarni taqdim etadi.

Shundan so'ng siz starter fayllarini o'zgartirishingiz, yangi komponentlar qo'shishingiz, dependency'larni qo'shishingiz (masalan, `npm install`) va ilovangizni ushbu hujjatlarning qolgan qismida tasvirlanganidek rivojlantirishingiz mumkin.

#### Monorepo rejimi

Monorepo rejimini yoqish uchun _standart rejim_ tuzilmasidan boshlaysiz va **projects** qo'shasiz. Loyiha to'liq **application** bo'lishi mumkin ( `nest generate app` buyrug'i bilan workspace'ga qo'shiladi) yoki **library** bo'lishi mumkin ( `nest generate library` buyrug'i bilan workspace'ga qo'shiladi). Bu turdagi loyiha komponentlari tafsilotlarini quyida muhokama qilamiz. Hozir e'tibor qaratiladigan asosiy nuqta shuki, mavjud standart rejim tuzilmasiga **loyiha qo'shishning o'zi** uni monorepo rejimiga **aylantiradi**. Keling, misol ko'raylik.

Agar biz quyidagini ishga tushirsak:

```bash
$ nest new my-project
```

Biz _standart rejim_ tuzilmasini yaratamiz, u quyidagicha ko'rinadi:

<div class="file-tree">
  <div class="item">node_modules</div>
  <div class="item">src</div>
  <div class="children">
    <div class="item">app.controller.ts</div>
    <div class="item">app.module.ts</div>
    <div class="item">app.service.ts</div>
    <div class="item">main.ts</div>
  </div>
  <div class="item">nest-cli.json</div>
  <div class="item">package.json</div>
  <div class="item">tsconfig.json</div>
  <div class="item">eslint.config.mjs</div>
</div>

Buni quyidagicha monorepo rejimiga o'tkazishimiz mumkin:

```bash
$ cd my-project
$ nest generate app my-app
```

Shu paytda `nest` mavjud tuzilmani **monorepo rejimi** tuzilmasiga aylantiradi. Bu bir nechta muhim o'zgarishlarga olib keladi. Papkalar tuzilmasi endi quyidagicha bo'ladi:

<div class="file-tree">
  <div class="item">apps</div>
    <div class="children">
      <div class="item">my-app</div>
      <div class="children">
        <div class="item">src</div>
        <div class="children">
          <div class="item">app.controller.ts</div>
          <div class="item">app.module.ts</div>
          <div class="item">app.service.ts</div>
          <div class="item">main.ts</div>
        </div>
        <div class="item">tsconfig.app.json</div>
      </div>
      <div class="item">my-project</div>
      <div class="children">
        <div class="item">src</div>
        <div class="children">
          <div class="item">app.controller.ts</div>
          <div class="item">app.module.ts</div>
          <div class="item">app.service.ts</div>
          <div class="item">main.ts</div>
        </div>
        <div class="item">tsconfig.app.json</div>
      </div>
    </div>
  <div class="item">nest-cli.json</div>
  <div class="item">package.json</div>
  <div class="item">tsconfig.json</div>
  <div class="item">eslint.config.mjs</div>
</div>

`generate app` schematic kodingizni qayta tashkil qiladi - har bir **application** loyihasini `apps` papkasi ostiga ko'chiradi va har bir loyihaning root papkasiga loyiha uchun maxsus `tsconfig.app.json` faylini qo'shadi. Bizning original `my-project` ilovamiz monoreponing **default loyiha**siga aylanadi va endi `apps` papkasi ostida joylashgan yangi `my-app` bilan tengdosh bo'ladi. Default loyihalar haqida quyida to'xtalamiz.

> error **Warning** Standart rejim tuzilmasini monorepoga aylantirish faqat kanonik Nest loyiha tuzilmasiga rioya qilgan loyihalarda ishlaydi. Xususan, konvertatsiya paytida schematic `src` va `test` papkalarini loyiha papkasidan rootdagi `apps` papkasi ostiga ko'chirishga urinadi. Agar loyiha bu tuzilmani ishlatmasa, konvertatsiya muvaffaqiyatsiz bo'lishi yoki ishonchsiz natija berishi mumkin.

#### Workspace loyihalari

Monorepo o'z a'zolarini boshqarish uchun workspace tushunchasidan foydalanadi. Workspace'lar **projects**dan tashkil topadi. Loyiha quyidagilardan biri bo'lishi mumkin:

- **application**: `main.ts` fayli orqali ilovani bootstrap qiladigan to'liq Nest ilova. Kompilyatsiya va build masalalaridan tashqari, workspace ichidagi application turidagi loyiha _standart rejim_ tuzilmasidagi ilova bilan funksional jihatdan bir xil.
- **library**: umumiy maqsadli funksiyalar to'plamini (modullar, providerlar, controllerlar va h.k.) paketlash usuli bo'lib, boshqa loyihalarda foydalaniladi. Kutubxona o'zicha ishlay olmaydi va `main.ts` fayliga ega emas. Batafsil [here](/docs/cli/libraries)da o'qing.

Barcha workspace'larda **default loyiha** bo'ladi (bu application turidagi loyiha bo'lishi kerak). Bu `nest-cli.json` faylidagi yuqori darajadagi "root" propertysi bilan aniqlanadi va u default loyiha rootiga ishora qiladi (batafsil ma'lumot uchun CLI properties bo'limiga qarang). Odatda bu siz boshlagan **standart rejim** ilovasi bo'ladi va keyin `nest generate app` yordamida monorepoga aylantiriladi. Bu qadamlarni bajarganingizda, ushbu property avtomatik to'ldiriladi.

Default loyihalar `nest build` va `nest start` kabi `nest` buyruqlarida loyiha nomi berilmaganda ishlatiladi.

Masalan, yuqoridagi monorepo tuzilmasida

```bash
$ nest start
```

`my-project` ilovasini ishga tushiradi. `my-app`ni ishga tushirish uchun quyidagini ishlatamiz:

```bash
$ nest start my-app
```

#### Ilovalar

Application turidagi loyihalar, yoki oddiy qilib "ilovalar", ishga tushirish va deploy qilish mumkin bo'lgan to'liq Nest ilovalardir. Application turidagi loyiha `nest generate app` bilan generatsiya qilinadi.

Bu buyruq `typescript starter`dagi standart `src` va `test` papkalarini o'z ichiga olgan loyiha skeletini avtomatik generatsiya qiladi. Standart rejimdan farqli ravishda, monorepodagi application loyihasida `package.json` kabi package dependency artefaktlari yoki `.prettierrc` va `eslint.config.mjs` kabi loyiha konfiguratsiya fayllari bo'lmaydi. Ularning o'rniga monorepo darajasidagi dependency va config fayllari ishlatiladi.

Biroq schematic loyiha root papkasida loyiha uchun maxsus `tsconfig.app.json` faylini generatsiya qiladi. Bu config fayl avtomatik ravishda mos build opsiyalarini o'rnatadi, jumladan kompilyatsiya output papkasini to'g'ri belgilaydi. Fayl yuqori darajadagi (monorepo) `tsconfig.json` faylini kengaytiradi, shuning uchun global sozlamalarni monorepo bo'ylab boshqarib, zarur bo'lsa ularni loyiha darajasida override qilishingiz mumkin.

#### Kutubxonalar

Aytilganidek, kutubxona turidagi loyihalar yoki oddiy qilib "kutubxonalar" - bu ilovalarga kompozitsiya qilib ishlatiladigan Nest komponentlari paketlari. Kutubxona turidagi loyiha `nest generate library` bilan generatsiya qilinadi. Nimalar kutubxonaga kirishini aniqlash - arxitektura dizayni qarori. Kutubxonalarni [libraries](/docs/cli/libraries) bobida batafsil muhokama qilamiz.

#### CLI properties

Nest standard va monorepo tuzilmasidagi loyihalarni tashkil qilish, build va deploy qilish uchun kerakli metadatani `nest-cli.json` faylida saqlaydi. Siz loyihalar qo'shganingizda Nest bu faylga avtomatik qo'shadi va yangilaydi, shuning uchun odatda siz uni o'zgartirish yoki tahrirlash haqida o'ylamasangiz ham bo'ladi. Biroq, qo'lda o'zgartirmoqchi bo'lgan ayrim sozlamalar bo'lishi mumkin, shuning uchun faylni umumiy darajada tushunish foydali.

Yuqoridagi qadamlar orqali monorepo yaratganimizdan so'ng `nest-cli.json` quyidagicha ko'rinadi:

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "apps/my-project/src",
  "monorepo": true,
  "root": "apps/my-project",
  "compilerOptions": {
    "webpack": true,
    "tsConfigPath": "apps/my-project/tsconfig.app.json"
  },
  "projects": {
    "my-project": {
      "type": "application",
      "root": "apps/my-project",
      "entryFile": "main",
      "sourceRoot": "apps/my-project/src",
      "compilerOptions": {
        "tsConfigPath": "apps/my-project/tsconfig.app.json"
      }
    },
    "my-app": {
      "type": "application",
      "root": "apps/my-app",
      "entryFile": "main",
      "sourceRoot": "apps/my-app/src",
      "compilerOptions": {
        "tsConfigPath": "apps/my-app/tsconfig.app.json"
      }
    }
  }
}
```

Fayl quyidagi bo'limlardan iborat:

- standard va monorepo darajasidagi sozlamalarni boshqaruvchi yuqori darajadagi global bo'lim
- har bir loyiha haqida metadataga ega bo'lgan yuqori darajadagi `"projects"` propertysi. Bu bo'lim faqat monorepo rejimdagi tuzilmada mavjud.

Yuqori darajadagi propertylar quyidagilar:

- `"collection"`: komponentlarni generatsiya qilish uchun ishlatiladigan schematics collectionga ishora qiladi; odatda bu qiymatni o'zgartirmasligingiz kerak
- `"sourceRoot"`: standart rejimdagi yagona loyiha source code rootiga yoki monorepo rejimdagi _default loyiha_ rootiga ishora qiladi
- `"compilerOptions"`: kompilyator opsiyalarini ko'rsatadigan key-value map; tafsilotlar quyida
- `"generateOptions"`: global generate opsiyalarini ko'rsatadigan key-value map; tafsilotlar quyida
- `"monorepo"`: (faqat monorepo) monorepo rejim tuzilmasi uchun bu qiymat doimo `true`
- `"root"`: (faqat monorepo) _default loyiha_ project rootiga ishora qiladi

#### Global kompilyator opsiyalari

Bu propertylar `nest build` yoki `nest start`ning bir qismi bo'lgan **istalgan** kompilyatsiya bosqichiga ta'sir qiladigan kompilyator va turli opsiyalarni belgilaydi, va `tsc` yoki webpack kabi kompilyatorga bog'liq bo'lmaydi.

| Property nomi       | Property qiymati turi | Tavsif                                                                                                                                                                                                                                                                  |
| ------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `webpack`           | boolean             | `true` bo'lsa webpack compiler ishlatiladi. `false` bo'lsa yoki yo'q bo'lsa `tsc` ishlatiladi. Monorepo rejimida default `true` (webpack), standart rejimda default `false` (tsc). Batafsil ma'lumot quyida. (deprecated: o'rniga `builder`dan foydalaning) |
| `tsConfigPath`      | string              | (**faqat monorepo**) `nest build` yoki `nest start` `project` opsiyasisiz chaqirilganda foydalaniladigan `tsconfig.json` sozlamalari fayliga ishora qiladi (masalan, default loyiha build yoki start qilinganda).                                                       |
| `webpackConfigPath` | string              | Webpack opsiya fayliga ishora qiladi. Ko'rsatilmagan bo'lsa, Nest `webpack.config.js` faylini qidiradi. Batafsil ma'lumot uchun quyiga qarang.                                                                                                                            |
| `deleteOutDir`      | boolean             | `true` bo'lsa, kompilyator chaqirilganida avval kompilyatsiya output direktoriyasini o'chiradi (`tsconfig.json`da sozlangan, default `./dist`).                                                                                                                           |
| `assets`            | array               | Har bir kompilyatsiya bosqichi boshlanganda non-TypeScript assetsni avtomatik tarqatishni yoqadi (asset tarqatish `--watch` rejimidagi incremental compile'larda **bo'lib o'tmaydi**). Batafsil ma'lumot uchun quyiga qarang.                                          |
| `watchAssets`       | boolean             | `true` bo'lsa, **barcha** non-TypeScript assetslarni kuzatgan holda watch rejimida ishlaydi. (Assetsni yanada nozik boshqarish uchun quyidagi Assets bo'limiga qarang).                                                                           |
| `manualRestart`     | boolean             | `true` bo'lsa, serverni qo'lda qayta ishga tushirish uchun `rs` shortcutini yoqadi. Default qiymat `false`.                                                                                                                          |
| `builder`           | string/object       | Loyiha kompilyatsiyasi uchun qaysi `builder` ishlatilishini ko'rsatadi (`tsc`, `swc`, yoki `webpack`). Builder xatti-harakatini moslashtirish uchun `type` (`tsc`, `swc`, yoki `webpack`) va `options`dan iborat obyekt berishingiz mumkin.                            |
| `typeCheck`         | boolean             | `true` bo'lsa, SWC ishlatiladigan loyihalarda type checkingni yoqadi (`builder` `swc` bo'lganda). Default qiymat `false`.                                                                                                           |

#### Global generate opsiyalari

Bu propertylar `nest generate` buyrug'i uchun default generate opsiyalarini belgilaydi.

| Property nomi | Property qiymati turi | Tavsif                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec`        | boolean _or_ object | Agar qiymat boolean bo'lsa, `true` bo'lganda spec generatsiyasi default yoqiladi, `false` bo'lganda o'chiriladi. CLI buyruq qatorida berilgan flag bu sozlamani override qiladi, xuddi loyiha darajasidagi `generateOptions` ham (quyida). Agar qiymat obyekt bo'lsa, har bir key schematic nomini bildiradi va boolean qiymat o'sha schematic uchun spec generatsiyasi yoqilgan/yo'qligini belgilaydi. |
| `flat`        | boolean             | True bo'lsa, barcha generate buyruqlari flat tuzilma generatsiya qiladi                                                                                                                                                                                                                                                                                                                                                                       |

Quyidagi misolda spec fayllarini generatsiya qilish default bo'yicha barcha loyihalar uchun o'chirilgan bo'ladi:

```javascript
{
  "generateOptions": {
    "spec": false
  },
  ...
}
```

Quyidagi misolda flat fayl generatsiyasi default bo'ladi:

```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}
```

Quyidagi misolda `spec` fayl generatsiyasi faqat `service` schematicsi uchun o'chirilgan (masalan, `nest generate service...`):

```javascript
{
  "generateOptions": {
    "spec": {
      "service": false
    }
  },
  ...
}
```

> warning **Warning** `spec` obyekt sifatida berilganda, generation schematics uchun key hozircha avtomatik alias handlingni qo'llab-quvvatlamaydi. Bu `service: false` deb yozib, `s` aliasi orqali service generatsiya qilsangiz ham spec generatsiya qilinishini anglatadi. Oddiy schematic nomi ham, alias ham to'g'ri ishlashi uchun quyidagi kabi ikkisini ham ko'rsating.
>
> ```javascript
> {
>   "generateOptions": {
>     "spec": {
>       "service": false,
>       "s": false
>     }
>   },
>   ...
> }
> ```

#### Loyiha darajasidagi generate opsiyalari

Global generate opsiyalariga qo'shimcha ravishda, loyiha darajasidagi generate opsiyalarini ham ko'rsatishingiz mumkin. Loyiha darajasidagi generate opsiyalari global generate opsiyalaridagi formatning aynan o'zidir, ammo har bir loyiha ichida ko'rsatiladi.

Loyiha darajasidagi generate opsiyalari global generate opsiyalarini override qiladi.

```javascript
{
  "projects": {
    "cats-project": {
      "generateOptions": {
        "spec": {
          "service": false
        }
      },
      ...
    }
  },
  ...
}
```

> warning **Warning** Generate opsiyalari uchun ustuvorlik tartibi quyidagicha: CLI buyruq qatorida ko'rsatilgan opsiyalar loyiha darajasidagi opsiyalardan ustun. Loyiha darajasidagi opsiyalar global opsiyalarni override qiladi.

#### Belgilangan kompilyator

Turli default kompilyatorlarning sababi shundaki, kattaroq loyihalarda (masalan, monorepolarda) webpack build vaqtlarida va barcha loyiha komponentlarini bitta faylga yig'ishda sezilarli ustunlikka ega bo'lishi mumkin. Agar alohida fayllarni generatsiya qilishni xohlasangiz, `"webpack"`ni `false`ga o'rnating, bu build jarayonini `tsc` (yoki `swc`)dan foydalanishga majbur qiladi.

#### Webpack opsiyalari

Webpack opsiya fayli standart webpack configuration optionsni o'z ichiga olishi mumkin. Masalan, `node_modules`ni bundlega qo'shish uchun (default bo'yicha ular tashqarida) `webpack.config.js`ga quyidagini qo'shing:

```javascript
module.exports = {
  externals: [],
};
```

Webpack config fayli JavaScript fayl bo'lgani uchun, default opsiyalarni qabul qilib, o'zgartirilgan obyektni qaytaradigan funksiya ham taqdim etishingiz mumkin:

```javascript
module.exports = function (options) {
  return {
    ...options,
    externals: [],
  };
};
```

#### Assets

TypeScript kompilyatsiyasi kompilyator outputini (`.js` va `.d.ts` fayllari) ko'rsatilgan output direktoriyasiga avtomatik tarqatadi. Shuningdek, `.graphql` fayllar, `images`, `.html` fayllar va boshqa assetlar kabi non-TypeScript fayllarni tarqatish ham qulay bo'lishi mumkin. Bu `nest build`ni (va istalgan initial compilation bosqichini) yengil **development build** bosqichi sifatida ko'rishga imkon beradi, bunda siz non-TypeScript fayllarni tahrirlab, iterativ ravishda kompilyatsiya va test qilishingiz mumkin.
Assets `src` papkasida joylashgan bo'lishi kerak, aks holda ular ko'chirilmaydi.

`assets` kalitining qiymati tarqatiladigan fayllarni ko'rsatuvchi elementlar massividir. Elementlar `glob`-ga o'xshash fayl spetsifikatsiyalari bo'lgan oddiy stringlar bo'lishi mumkin, masalan:

```typescript
"assets": ["**/*.graphql"],
"watchAssets": true,
```

Yanada nozik nazorat uchun elementlar quyidagi kalitlarga ega obyekt bo'lishi mumkin:

- `"include"`: tarqatiladigan assetlar uchun `glob`-ga o'xshash fayl spetsifikatsiyalari
- `"exclude"`: `include` ro'yxatidan **chiqarib tashlanadigan** assetlar uchun `glob`-ga o'xshash fayl spetsifikatsiyalari
- `"outDir"`: assetlar tarqatiladigan path (root papkaga nisbatan)ni ko'rsatuvchi string. Default bo'yicha kompilyator outputi sozlangan direktoriyaga teng.
- `"watchAssets"`: boolean; `true` bo'lsa, ko'rsatilgan assetlarni watch rejimida kuzatadi

Masalan:

```typescript
"assets": [
  { "include": "**/*.graphql", "exclude": "**/omitted.graphql", "watchAssets": true },
]
```

> warning **Warning** Yuqori darajadagi `compilerOptions` propertysida `watchAssets`ni o'rnatish `assets` propertysi ichidagi `watchAssets` sozlamalarini override qiladi.

#### Loyiha propertylari

Bu element faqat monorepo rejimidagi tuzilmalar uchun mavjud. Odatda bu propertylarni tahrirlashingiz kerak emas, chunki Nest monorepo ichida loyihalarni va ularning konfiguratsiya opsiyalarini topish uchun ulardan foydalanadi.
