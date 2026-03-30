---
title: "Boshqa imkoniyatlar"
navTitle: "Boshqa imkoniyatlar"
description: "GraphQL dunyosida autentifikatsiya yoki operatsiyalarning side-effectlarini qanday boshqarish haqida ko'p bahslar bor. Buni biznes mantiq ichida qilamizmi? Query va mutationlarni a"
order: 7
group: graphql
groupTitle: "GraphQL"
---
GraphQL dunyosida **autentifikatsiya** yoki operatsiyalarning **side-effect**larini qanday boshqarish haqida ko'p bahslar bor. Buni biznes mantiq ichida qilamizmi? Query va mutationlarni avtorizatsiya mantiqi bilan kuchaytirish uchun yuqori darajali funksiyadan foydalanamizmi? Yoki schema directivesdan foydalanamizmi? Bu savollarga yagona, hamma uchun mos javob yo'q.

Nest bu masalalarni [guards](/docs/core/guards) va [interceptors](/docs/core/interceptors) kabi kross-platforma imkoniyatlari bilan hal qilishga yordam beradi. Falsafa - ortiqcha takrorlanishni kamaytirish va tuzilgan, o'qilishi oson hamda izchil ilovalarni yaratishga yordam beradigan vositalarni taqdim etishdir.

#### Umumiy ko'rinish

GraphQL bilan RESTful ilovalar kabi standart [guards](/docs/core/guards), [interceptors](/docs/core/interceptors), [filters](/docs/core/exception-filters) va [pipes](/docs/core/pipes)dan foydalanishingiz mumkin. Bundan tashqari, [custom decorators](/docs/core/custom-decorators) imkoniyatidan foydalanib o'zingizning dekoratorlaringizni yaratishingiz mumkin. Keling, GraphQL query handler misoliga qaraymiz.

```typescript
@Query('author')
@UseGuards(AuthGuard)
async getAuthor(@Args('id', ParseIntPipe) id: number) {
  return this.authorsService.findOneById(id);
}
```

Ko'rib turganingizdek, GraphQL ham guards va pipes bilan HTTP REST handlerlari kabi ishlaydi. Shu sababli, autentifikatsiya mantiqini guardga ko'chirishingiz mumkin; hatto xuddi shu guard klassini REST va GraphQL API interfeyslarida qayta ishlatishingiz mumkin. Xuddi shuningdek, interceptorlar ham ikki xil ilova turida bir xil ishlaydi:

```typescript
@Mutation()
@UseInterceptors(EventsInterceptor)
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

#### Execution context

GraphQL kiruvchi so'rovda boshqa turdagi ma'lumotlarni qabul qilgani uchun, guards va interceptorlar oladigan [execution context](/docs/fundamentals/execution-context) GraphQLda RESTdan biroz farq qiladi. GraphQL resolverlarda argumentlar to'plami: `root`, `args`, `context`, va `info`. Shuning uchun guard va interceptorlar umumiy `ExecutionContext`ni `GqlExecutionContext`ga aylantirishi kerak. Bu juda oson:

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    return true;
  }
}
```

`GqlExecutionContext.create()` qaytargan GraphQL context obyektida har bir GraphQL resolver argumenti uchun **get** metodi mavjud (masalan, `getArgs()`, `getContext()`, va h.k.). Shunday qilib, transformatsiyadan so'ng joriy so'rov uchun istalgan GraphQL argumentni oson ajratib olamiz.

#### Exception filterlar

Nestning standart [exception filter](/docs/core/exception-filters)lari GraphQL ilovalari bilan ham mos keladi. `ExecutionContext`da bo'lgani kabi, GraphQL ilovalari `ArgumentsHost` obyektini `GqlArgumentsHost` obyektiga aylantirishi kerak.

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    return exception;
  }
}
```

> info **Hint** `GqlExceptionFilter` va `GqlArgumentsHost` `@nestjs/graphql` paketidan import qilinadi.

RESTdan farqli ravishda, javob yaratish uchun native `response` obyektidan foydalanilmasligini unutmang.

#### Custom dekoratorlar

Aytilganidek, [custom decorators](/docs/core/custom-decorators) funksiyasi GraphQL resolverlarda ham kutilganidek ishlaydi.

```typescript
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().user,
);
```

`@User()` custom dekoratoridan quyidagicha foydalaning:

```typescript
@Mutation()
async upvotePost(
  @User() user: UserEntity,
  @Args('postId') postId: number,
) {}
```

> info **Hint** Yuqoridagi misolda `user` obyektini GraphQL ilovangiz contextiga biriktirilgan deb faraz qilganmiz.

#### Field resolver darajasida enhancersni ishga tushirish

GraphQL kontekstida Nest field darajasida **enhancers**ni (interceptorlar, guards va filterlar uchun umumiy nom) ishlatmaydi ushbu issuega qarang: ular faqat yuqori darajadagi `@Query()`/`@Mutation()` metodlari uchun ishlaydi. `@ResolveField()` bilan belgilangan metodlar uchun interceptor, guard yoki filterlar ishlashini xohlasangiz, `GqlModuleOptions`dagi `fieldResolverEnhancers` opsiyasini o'rnating. Unga mos ravishda `'interceptors'`, `'guards'` va/yoki `'filters'` ro'yxatini bering:

```typescript
GraphQLModule.forRoot({
  fieldResolverEnhancers: ['interceptors']
}),
```

> **Warning** Field resolverlar uchun enhancersni yoqish ko'p yozuvlar qaytarilganda va field resolver minglab marta bajarilganda unumdorlik muammolariga olib kelishi mumkin. Shuning uchun `fieldResolverEnhancers`ni yoqqaningizda, field resolverlar uchun qat'iy zarur bo'lmagan enhancersni bajarishni o'tkazib yuborishni tavsiya qilamiz. Buni quyidagi yordamchi funksiya orqali qilishingiz mumkin:

```typescript
export function isResolvingGraphQLField(context: ExecutionContext): boolean {
  if (context.getType<GqlContextType>() === 'graphql') {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const parentType = info.parentType.name;
    return parentType !== 'Query' && parentType !== 'Mutation';
  }
  return false;
}
```

#### Custom driver yaratish

Nest ikkita rasmiy driverni taqdim etadi: `@nestjs/apollo` va `@nestjs/mercurius`, shuningdek yangi **custom driver**lar yaratish imkonini beradigan API ham mavjud. Custom driver yordamida istalgan GraphQL kutubxonasini integratsiya qilishingiz yoki mavjud integratsiyani kengaytirib, ustiga qo'shimcha imkoniyatlar qo'shishingiz mumkin.

Masalan, `express-graphql` paketini integratsiya qilish uchun quyidagi driver klassini yaratishingiz mumkin:

```typescript
import { AbstractGraphQLDriver, GqlModuleOptions } from '@nestjs/graphql';
import { graphqlHTTP } from 'express-graphql';

class ExpressGraphQLDriver extends AbstractGraphQLDriver {
  async start(options: GqlModuleOptions<any>): Promise<void> {
    options = await this.graphQlFactory.mergeWithSchema(options);

    const { httpAdapter } = this.httpAdapterHost;
    httpAdapter.use(
      '/graphql',
      graphqlHTTP({
        schema: options.schema,
        graphiql: true,
      }),
    );
  }

  async stop() {}
}
```

So'ng uni quyidagicha ishlating:

```typescript
GraphQLModule.forRoot({
  driver: ExpressGraphQLDriver,
});
```
