---
title: "Apollo bilan plaginlar"
navTitle: "Apollo bilan plaginlar"
description: "Plaginlar Apollo Serverning asosiy funksionalligini kengaytirish imkonini beradi; ular ma'lum hodisalarga javoban custom operatsiyalarni bajaradi. Hozirda bu hodisalar GraphQL so'r"
order: 11
group: graphql
groupTitle: "GraphQL"
---
Plaginlar Apollo Serverning asosiy funksionalligini kengaytirish imkonini beradi; ular ma'lum hodisalarga javoban custom operatsiyalarni bajaradi. Hozirda bu hodisalar GraphQL so'rovining hayotiy sikli bosqichlariga va Apollo Serverning ishga tushishiga mos keladi (batafsil bu yerda). Masalan, oddiy logging plagini Apollo Serverga yuborilgan har bir so'rov bilan bog'liq GraphQL query satrini loglashi mumkin.

#### Custom plaginlar

Plagin yaratish uchun `@nestjs/apollo` paketidan eksport qilinadigan `@Plugin` dekoratori bilan belgilangan klassni e'lon qiling. Shuningdek, yaxshiroq kod autocomplete uchun `@apollo/server` paketidan `ApolloServerPlugin` interfeysini implementatsiya qiling.

```typescript
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    console.log('Request started');
    return {
      async willSendResponse() {
        console.log('Will send response');
      },
    };
  }
}
```

Shu bilan, `LoggingPlugin` ni provider sifatida ro'yxatdan o'tkazishimiz mumkin.

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}
```

Nest plaginni avtomatik instansiyalaydi va Apollo Serverga qo'llaydi.

#### Tashqi plaginlardan foydalanish

Bir nechta tayyor plaginlar mavjud. Mavjud plaginni ishlatish uchun uni import qiling va `plugins` massiviga qo'shing:

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),
```

> info **Hint** `ApolloServerOperationRegistry` plagini `@apollo/server-plugin-operation-registry` paketidan eksport qilinadi.

#### Mercurius bilan plaginlar

Meruriusga xos Fastify plaginlarining ayrimlari mercurius plaginidan keyin plugin tree ichida yuklanishi kerak (batafsil bu yerda).

> warning **Warning** mercurius-upload bundan mustasno va main faylda ro'yxatdan o'tkazilishi kerak.

Buning uchun `MercuriusDriver` ixtiyoriy `plugins` konfiguratsiya opsiyasini taqdim etadi. U `plugin` va `options` atributlaridan iborat obyektlar massivini ifodalaydi. Shuning uchun cache pluginni ro'yxatdan o'tkazish quyidagicha ko'rinadi:

```typescript
GraphQLModule.forRoot({
  driver: MercuriusDriver,
  // ...
  plugins: [
    {
      plugin: cache,
      options: {
        ttl: 10,
        policy: {
          Query: {
            add: true
          }
        }
      },
    }
  ]
}),
```
