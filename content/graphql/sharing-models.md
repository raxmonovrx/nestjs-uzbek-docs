---
title: "Modellarni ulashish"
navTitle: "Modellarni ulashish"
description: "Backend loyihangizda TypeScriptdan foydalanishning eng katta afzalliklaridan biri - umumiy TypeScript paketi orqali TypeScript asosidagi frontend ilovada ham o'sha modellardan qayt"
order: 16
group: graphql
groupTitle: "GraphQL"
---
> warning **Warning** Bu bob faqat code first yondashuviga tegishli.

Backend loyihangizda TypeScriptdan foydalanishning eng katta afzalliklaridan biri - umumiy TypeScript paketi orqali TypeScript asosidagi frontend ilovada ham o'sha modellardan qayta foydalanish imkonidir.

Ammo muammo bor: code first yondashuvda yaratilgan modellar GraphQL dekoratorlari bilan kuchli bezatilgan. Bu dekoratorlar frontend uchun keraksiz va unumdorlikka salbiy ta'sir qiladi.

#### Model shimdan foydalanish

Bu muammoni hal qilish uchun NestJS "shim" taqdim etadi; u `webpack` (yoki shunga o'xshash) konfiguratsiya orqali original dekoratorlarni inert kod bilan almashtirishga imkon beradi.
Bu shimdan foydalanish uchun `@nestjs/graphql` paketi va shim o'rtasida alias sozlang.

Masalan, webpack uchun quyidagicha hal qilinadi:

```typescript
resolve: { // see: https://webpack.js.org/configuration/resolve/
  alias: {
      "@nestjs/graphql": path.resolve(__dirname, "../node_modules/@nestjs/graphql/dist/extra/graphql-model-shim")
  }
}
```

> info **Hint** TypeORM paketida ham shunga o'xshash shim mavjud, uni bu yerda topasiz.
