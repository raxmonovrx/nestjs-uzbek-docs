---
title: "Asinxron provayderlar"
navTitle: "Asinxron provayderlar"
description: "Ba'zan ilova ishga tushishi bir yoki bir nechta asinxron vazifalar bajarilmaguncha kechiktirilishi kerak bo'ladi. Masalan, ma'lumotlar bazasi bilan ulanish o'rnatilmaguncha so'rovl"
order: 1
group: fundamentals
groupTitle: "Fundamentals"
---
Ba'zan ilova ishga tushishi bir yoki bir nechta **asinxron vazifalar** bajarilmaguncha kechiktirilishi kerak bo'ladi. Masalan, ma'lumotlar bazasi bilan ulanish o'rnatilmaguncha so'rovlarni qabul qilishni boshlashni xohlamasligingiz mumkin. Buni asinxron provayderlar yordamida amalga oshirishingiz mumkin.

Buning sintaksisi `useFactory` sintaksisi bilan `async/await` dan foydalanishdir. Factory `Promise` qaytaradi va factory funksiyasi asinxron vazifalarni `await` qilishi mumkin. Nest bunday provayderga bog'liq (uni in'eksiya qiladigan) har qanday sinfni instansiyalashdan oldin promise'ning yechilishini kutadi.

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
```

> info **Hint** Maxsus provayder sintaksisi haqida batafsil bu yerda.

#### In'eksiya

Asinxron provayderlar boshqa komponentlarga, boshqa har qanday provayder kabi, o'z tokenlari orqali in'eksiya qilinadi. Yuqoridagi misolda siz `@Inject('ASYNC_CONNECTION')` konstruktsiyasidan foydalanasiz.

#### Misol

[The TypeORM recipe](/docs/recipes/sql-typeorm) asinxron provayderning yanada to'liqroq misoliga ega.
