---
title: "Keng tarqalgan xatolar"
navTitle: "Keng tarqalgan xatolar"
description: "NestJS bilan ishlash jarayonida, freymvorkni o'rganayotganingizda turli xatolarga duch kelishingiz mumkin."
order: 1
group: faq
groupTitle: "FAQ"
---
NestJS bilan ishlash jarayonida, freymvorkni o'rganayotganingizda turli xatolarga duch kelishingiz mumkin.

#### "Cannot resolve dependency" xatosi

> info **Hint** "Cannot resolve dependency" xatosini osonroq hal qilishga yordam beradigan [NestJS Devtools](/docs/devtools/overview#investigating-the-cannot-resolve-dependency-error) ni ham ko'rib chiqing.

Eng ko'p uchraydigan xatolardan biri - Nest provider dependency'larini resolve qila olmasligi bilan bog'liq. Xatolik xabari odatda quyidagicha ko'rinadi:

```bash
Nest can't resolve dependencies of the <provider> (?). Please make sure that the argument <unknown_token> at index [<index>] is available in the <module> context.

Potential solutions:
- Is <module> a valid NestJS module?
- If <unknown_token> is a provider, is it part of the current <module>?
- If <unknown_token> is exported from a separate @Module, is that module imported within <module>?
  @Module({
    imports: [ /* the Module containing <unknown_token> */ ]
  })
```

Bu xatoning eng ko'p uchraydigan sababi - `<provider>` modulning `providers` massivida yo'qligidir. Provider haqiqatan ham `providers` massivida borligiga va standart NestJS provider amaliyotlari ga amal qilayotganiga ishonch hosil qiling.

Tez-tez uchraydigan yana bir nechta nozik holatlar ham bor. Ulardan biri - provider'ni `imports` massiviga qo'yish. Agar shunday bo'lsa, xatoda `<module>` o'rnida provider nomi chiqadi.

Development vaqtida bu xatoga duch kelsangiz, xatolik xabarida tilga olingan modulni ochib, uning `providers` qismini tekshiring. `providers` massivida turgan har bir provider uchun modul barcha dependency'larga kira olishiga ishonch hosil qiling. Ko'p hollarda provider'lar "Feature Module" va "Root Module" ichida takrorlanib qoladi, natijada Nest provider'ni ikki marta instansiyalashga urinadi. Odatda takrorlanayotgan `<provider>` ni o'z ichiga olgan modul "Root Module" ning `imports` massiviga qo'shilishi kerak bo'ladi.

Yuqoridagi `<unknown_token>` `dependency` bo'lsa, sizda circular file import bo'lishi mumkin. Bu quyidagi circular dependency holatidan farq qiladi, chunki bunda provider'lar constructor ichida bir-biriga bog'liq bo'lmaydi, balki ikki fayl o'zaro bir-birini import qilib qoladi. Odatdagi misol: modul fayli token e'lon qiladi va provider'ni import qiladi, provider esa o'sha token konstantasini modul faylidan import qiladi. Agar barrel file'lardan foydalansangiz, ular ham bunday circular import'larni keltirib chiqarmayotganiga ishonch hosil qiling.

Yuqoridagi `<unknown_token>` `Object` bo'lsa, siz type/interface orqali inject qilyapsiz, lekin to'g'ri provider token ko'rsatilmagan bo'ladi. Buni tuzatish uchun quyidagilarga ishonch hosil qiling:

1. class reference'ni import qiling yoki `@Inject()` dekoratori bilan custom token'dan foydalaning. Custom providers sahifasini o'qing.
2. Class-based provider'larda faqat type'ni emas, balki konkret class'larni import qiling; masalan `import type ...` sintaksisi bilan cheklanib qolmang.

Shuningdek, provider'ni o'ziga inject qilib qo'ymaganingizga ishonch hosil qiling, chunki NestJS'da self-injection ruxsat etilmaydi. Bunday holatda `<unknown_token>` ko'pincha `<provider>` ga teng bo'ladi.

Agar siz **monorepo setup** da ishlayotgan bo'lsangiz, yuqoridagi xuddi shu xatoga duch kelishingiz mumkin, faqat `<unknown_token>` sifatida `ModuleRef` nomli core provider ko'rinadi:

```bash
Nest can't resolve dependencies of the <provider> (?).
Please make sure that the argument ModuleRef at index [<index>] is available in the <module> context.
...
```

Bu odatda loyihangiz `@nestjs/core` paketining ikkita Node module nusxasini yuklab qo'yganda yuz beradi. Masalan:

```text
.
├── package.json
├── apps
│   └── api
│       └── node_modules
│           └── @nestjs/bull
│               └── node_modules
│                   └── @nestjs/core
└── node_modules
    ├── (other packages)
    └── @nestjs/core
```

Yechimlar:

- **Yarn** Workspaces uchun `@nestjs/core` paketining hoist qilinishini oldini olish maqsadida nohoist feature dan foydalaning.
- **pnpm** Workspaces uchun boshqa modulingizda `@nestjs/core` ni peerDependencies sifatida belgilang va modul import qilingan app package.json ichida `"dependenciesMeta": {{ '{' }}"other-module-name": {{ '{' }}"injected": true &#125;&#125;` ni sozlang. Qarang: dependenciesmetainjected

#### "Circular dependency" xatosi

Ba'zan ilovangizda [circular dependency](/docs/fundamentals/circular-dependency) dan qochish qiyin bo'ladi. Bunday holatda Nest ulardan chiqib ketishi uchun qo'shimcha choralar ko'rishingiz kerak. Circular dependency bilan bog'liq xatolar odatda quyidagicha ko'rinadi:

```bash
Nest cannot create the <module> instance.
The module at index [<index>] of the <module> "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Use forwardRef() to avoid it. Read more: https://docs.nestjs.com/fundamentals/circular-dependency
- The module at index [<index>] is of type "undefined". Check your import statements and the type of the module.

Scope [<module_import_chain>]
# example chain AppModule -> FooModule
```

Circular dependency ham provider'larning o'zaro bir-biriga bog'liq bo'lishidan, ham TypeScript fayllarning konstantalar sababli o'zaro bog'lanib qolishidan paydo bo'lishi mumkin. Masalan, modul faylidan constant export qilinadi va service fayli o'sha constant'ni import qiladi. Ikkinchi holatda constant'lar uchun alohida fayl yaratish tavsiya etiladi. Birinchi holatda esa circular dependency bo'yicha qo'llanmaga amal qiling va ham modullar, ham provider'lar `forwardRef` bilan belgilanganiga ishonch hosil qiling.

#### Dependency xatolarini debug qilish

Dependency'larni qo'lda tekshirish bilan birga, Nest 8.1.0 dan boshlab `NEST_DEBUG` environment variable'iga truthy qiymat berishingiz va Nest ilova dependency'larini resolve qilayotganda qo'shimcha log ma'lumotlarini olishingiz mumkin.

Yuqoridagi rasmda sariq rangdagi satr inject qilinayotgan dependency'ning host class'ini, ko'k rangdagisi inject qilinayotgan dependency nomini yoki uning injection token'ini, binafsha rangdagisi esa dependency qaysi modul ichida qidirilayotganini bildiradi. Shu ma'lumot yordamida dependency resolution qanday ketayotganini va nega dependency injection muammosi yuz berayotganini odatda kuzatib chiqish mumkin.

#### "File change detected" cheksiz aylanib qoladi

TypeScript 4.9 va undan yuqori versiyadan foydalanayotgan Windows foydalanuvchilari bu muammoga duch kelishi mumkin.
Bu, odatda, ilovangizni watch mode'da ishga tushirayotganingizda, masalan `npm run start:dev` buyrug'ida va quyidagi loglar cheksiz takrorlanayotganida yuz beradi:

```bash
XX:XX:XX AM - File change detected. Starting incremental compilation...
XX:XX:XX AM - Found 0 errors. Watching for file changes.
```

NestJS CLI ilovani watch mode'da ishga tushirganda aslida `tsc --watch` chaqiriladi va TypeScript 4.9 dan boshlab fayl o'zgarishlarini aniqlash uchun yangi strategiya ishlatiladi. Muammo ko'pincha shundan kelib chiqadi.
Buni tuzatish uchun `tsconfig.json` faylida `"compilerOptions"` dan keyin quyidagi sozlamani qo'shing:

```bash
  "watchOptions": {
    "watchFile": "fixedPollingInterval"
  }
```

Bu TypeScript'ga fayl tizimi event'lari o'rniga polling usulidan foydalanishni buyuradi. Ba'zi mashinalarda yangi default usul muammo keltirib chiqarishi mumkin.
`"watchFile"` opsiyasi haqida batafsil ma'lumotni TypeScript hujjatlarida o'qishingiz mumkin.
