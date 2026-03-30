---
title: "Hujjatlashtirish"
navTitle: "Hujjatlashtirish"
description: "Compodoc Angular ilovalari uchun hujjat generatsiya qilish vositasi. Nest va Angular loyihalari hamda kod tuzilmalari o'xshash bo'lgani uchun, Compodoc Nest ilovalari bilan ham ish"
order: 4
group: recipes
groupTitle: "Recipes"
---
**Compodoc** Angular ilovalari uchun hujjat generatsiya qilish vositasi. Nest va Angular loyihalari hamda kod tuzilmalari o'xshash bo'lgani uchun, **Compodoc** Nest ilovalari bilan ham ishlaydi.

#### Sozlash

Mavjud Nest loyihasida Compodoc ni sozlash juda oson. Operatsion tizimingiz terminalida quyidagi buyruq bilan dev-qaramlikni qo'shishdan boshlang:

```bash
$ npm i -D @compodoc/compodoc
```

#### Generatsiya

Loyiha hujjatlarini quyidagi buyruq yordamida yarating (`npx` qo'llab-quvvatlashi uchun npm 6 kerak). Qo'shimcha variantlar uchun rasmiy hujjat ga qarang.

```bash
$ npx @compodoc/compodoc -p tsconfig.json -s
```

Brauzerni ochib, http://localhost:8080 manziliga o'ting. Dastlabki Nest CLI loyihasini ko'rasiz:

#### Hissa qo'shish

Compodoc loyihasida qatnashib hissa qo'shishingiz mumkin: bu yerda.
