---
title: "Field middleware"
navTitle: "Field middleware"
description: "Field middleware field yechilishidan oldin yoki keyin ixtiyoriy kodni ishga tushirish imkonini beradi. Field middleware field natijasini o'zgartirish, field argumentlarini tekshiri"
order: 6
group: graphql
groupTitle: "GraphQL"
---
> warning **Warning** Bu bob faqat code first yondashuviga tegishli.

Field middleware field yechilishidan **oldin yoki keyin** ixtiyoriy kodni ishga tushirish imkonini beradi. Field middleware field natijasini o'zgartirish, field argumentlarini tekshirish yoki field darajasida rollarni tekshirish (masalan, middleware funksiyasi bajarilayotgan maqsad fieldga kirish uchun talab qilinadigan rollar) uchun ishlatilishi mumkin.

Bir fieldga bir nechta middleware funksiyasini ulashingiz mumkin. Bu holatda ular ketma-ket chaqiriladi va oldingi middleware keyingisini chaqirish yoki chaqirmaslikni hal qiladi. `middleware` massivida middlewarelar tartibi muhim. Birinchi resolver "eng tashqi" qatlam bo'ladi, shuning uchun u birinchi bo'lib ishlaydi va oxirgi bo'lib tugaydi (`graphql-middleware` paketi kabi). Ikkinchi resolver "ikkinchi tashqi" qatlam bo'ladi, shuning uchun u ikkinchi bo'lib ishlaydi va oxiridan ikkinchi bo'lib tugaydi.

#### Boshlash

Avval klientga qaytarilishidan oldin field qiymatini loglaydigan oddiy middleware yaratamiz:

```typescript
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

const loggerMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  console.log(value);
  return value;
};
```

> info **Hint** `MiddlewareContext` bu GraphQL resolver funksiyasi odatda qabul qiladigan argumentlar bilan bir xil argumentlardan iborat obyekt (`{{ '{' }} source, args, context, info {{ '}' }}`), `NextFn` esa stackdagi keyingi middleware yoki haqiqiy field resolverni bajarishga imkon beradigan funksiya.

> warning **Warning** Field middleware funksiyalari dependency injection qilolmaydi va Nest DI konteyneriga kira olmaydi, chunki ular juda yengil bo'lishi va potensial vaqt talab qiladigan operatsiyalarni (masalan, bazadan ma'lumot olish) bajarmasligi kerak. Agar tashqi servislarni chaqirish yoki data source dan so'rov qilish kerak bo'lsa, buni root query/mutation handlerga bog'langan guard/interceptor ichida bajaring va natijani `context` obyektiga joylang; keyin uni field middleware ichida (`MiddlewareContext` obyektidan) olishingiz mumkin.

Field middleware `FieldMiddleware` interfeysiga mos bo'lishi kerakligini unutmang. Yuqoridagi misolda avval `next()` funksiyasini ishga tushiramiz (u haqiqiy field resolverni bajaradi va field qiymatini qaytaradi), so'ng bu qiymatni loglaymiz. Middleware funksiyasi qaytargan qiymat oldingi qiymatni to'liq almashtiradi va biz hech qanday o'zgarish kiritmoqchi bo'lmaganimiz uchun original qiymatni qaytaramiz.

Shu bilan, middleware ni bevosita `@Field()` dekoratorida quyidagicha ro'yxatdan o'tkazamiz:

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}
```

Endi `Recipe` object type ning `title` fieldi so'ralganda, original field qiymati konsolga loglanadi.

> info **Hint** [extensions](/docs/graphql/extensions) funksiyasi yordamida field darajasidagi ruxsat tizimini qanday implementatsiya qilish mumkinligini bilish uchun ushbu [bo'lim](/docs/graphql/extensions#using-custom-metadata)ga qarang.

> warning **Warning** Field middleware faqat `ObjectType` klasslariga qo'llanadi. Batafsil ma'lumot uchun ushbu issuega qarang.

Yuqorida aytilganidek, field qiymatini middleware ichidan boshqarishimiz mumkin. Namoyish uchun retsept sarlavhasini katta harflarga o'tkazamiz (mavjud bo'lsa):

```typescript
const value = await next();
return value?.toUpperCase();
```

Bu holatda so'ralgan har bir sarlavha avtomatik ravishda katta harflarga o'tkaziladi.

Xuddi shuningdek, field middleware ni custom field resolverga (ya'ni `@ResolveField()` dekoratori bilan belgilangan metodga) bog'lashingiz mumkin, quyidagicha:

```typescript
@ResolveField(() => String, { middleware: [loggerMiddleware] })
title() {
  return 'Placeholder';
}
```

> warning **Warning** Agar field resolver darajasida enhancers yoqilgan bo'lsa (batafsil), field middleware funksiyalari **metodga bog'langan** interceptor, guard va h.k. lar ishlashidan oldin (ammo query yoki mutation handlerlari uchun ro'yxatdan o'tkazilgan root-level enhancersdan keyin) bajariladi.

#### Global field middleware

Muayyan fieldga bevosita middleware bog'lashdan tashqari, bir yoki bir nechta middleware funksiyasini global tarzda ro'yxatdan o'tkazishingiz mumkin. Bu holda ular object type laringizning barcha fieldlariga avtomatik ulanadi.

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: 'schema.gql',
  buildSchemaOptions: {
    fieldMiddleware: [loggerMiddleware],
  },
}),
```

> info **Hint** Global ro'yxatdan o'tkazilgan field middleware funksiyalari lokal (muayyan fieldga bevosita bog'langan) middlewarelardan **oldin** bajariladi.
