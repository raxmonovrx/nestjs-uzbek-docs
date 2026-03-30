---
title: "Extensions"
navTitle: "Extensions"
description: "Extensions - bu types konfiguratsiyasida ixtiyoriy ma'lumotlarni belgilash imkonini beradigan ilg'or, past darajadagi xususiyat. Muayyan fieldlarga custom metadatani biriktirish si"
order: 4
group: graphql
groupTitle: "GraphQL"
---
> warning **Warning** Bu bob faqat code first yondashuviga tegishli.

Extensions - bu types konfiguratsiyasida ixtiyoriy ma'lumotlarni belgilash imkonini beradigan **ilg'or, past darajadagi xususiyat**. Muayyan fieldlarga custom metadatani biriktirish sizga yanada murakkab, umumiy yechimlar yaratish imkonini beradi. Masalan, extensions yordamida muayyan fieldlarga kirish uchun talab qilinadigan rollarni belgilashingiz mumkin. Bu rollar runtime da aks ettirilib, chaqiruvchi muayyan fieldni olish uchun yetarli ruxsatga ega-emasligini aniqlashga yordam beradi.

#### Custom metadata qo'shish

Field uchun custom metadatani biriktirish uchun `@nestjs/graphql` paketidan eksport qilinadigan `@Extensions()` dekoratoridan foydalaning.

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;
```

Yuqoridagi misolda `role` metadata xossasiga `Role.ADMIN` qiymatini berdik. `Role` - bu tizimimizdagi barcha foydalanuvchi rollarini guruhlaydigan oddiy TypeScript enum.

Eslatma: fieldlarga metadata o'rnatishdan tashqari, `@Extensions()` dekoratorini klass va metod darajasida ham qo'llashingiz mumkin (masalan, query handlerda).

#### Custom metadatadan foydalanish

Custom metadatadan foydalanadigan mantiq kerak bo'lsa, u istalgan darajada murakkab bo'lishi mumkin. Masalan, har bir metod chaqirig'i uchun hodisalarni saqlaydigan/loglaydigan oddiy interceptor yoki fieldga kirish uchun talab qilingan rollarni chaqiruvchining ruxsatlari bilan solishtiradigan [field middleware](/docs/graphql/field-middleware) yaratishingiz mumkin (field darajasidagi ruxsat tizimi).

Ko'rsatish uchun `checkRoleMiddleware` yaratamiz; u foydalanuvchi rolini (bu yerda qattiq kodlangan) maqsad fieldga kirish uchun talab qilinadigan rol bilan solishtiradi:

```typescript
export const checkRoleMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { info } = ctx;
  const { extensions } = info.parentType.getFields()[info.fieldName];

  /**
   * In a real-world application, the "userRole" variable
   * should represent the caller's (user) role (for example, "ctx.user.role").
   */
  const userRole = Role.USER;
  if (userRole === extensions.role) {
    // or just "return null" to ignore
    throw new ForbiddenException(
      `User does not have sufficient permissions to access "${info.fieldName}" field.`,
    );
  }
  return next();
};
```

Shu bilan, `password` fieldi uchun middleware ni quyidagicha ro'yxatdan o'tkazishimiz mumkin:

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;
```
