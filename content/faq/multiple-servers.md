---
title: "HTTPS"
navTitle: "HTTPS"
description: "HTTPS protokolidan foydalanadigan ilova yaratish uchun NestFactory class'ining create() metodiga uzatiladigan options obyektida httpsOptions property'sini belgilang:"
order: 6
group: faq
groupTitle: "FAQ"
---
HTTPS protokolidan foydalanadigan ilova yaratish uchun `NestFactory` class'ining `create()` metodiga uzatiladigan options obyektida `httpsOptions` property'sini belgilang:

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};
const app = await NestFactory.create(AppModule, {
  httpsOptions,
});
await app.listen(process.env.PORT ?? 3000);
```

Agar `FastifyAdapter` ishlatsangiz, ilovani quyidagicha yarating:

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ https: httpsOptions }),
);
```

#### Bir vaqtda ishlaydigan bir nechta server

Quyidagi recipe bir vaqtning o'zida bir nechta port'ni tinglaydigan Nest ilovani qanday instantiate qilishni ko'rsatadi. Masalan, bitta oddiy HTTP port va bitta HTTPS port.

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};

const server = express();
const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
await app.init();

const httpServer = http.createServer(server).listen(3000);
const httpsServer = https.createServer(httpsOptions, server).listen(443);
```

`http.createServer` / `https.createServer` ni o'zimiz chaqirganimiz sababli, `app.close` chaqirilganda yoki termination signal kelganda NestJS ularni avtomatik yopmaydi. Shu ishni o'zimiz bajarishimiz kerak:

```typescript
@Injectable()
export class ShutdownObserver implements OnApplicationShutdown {
  private httpServers: http.Server[] = [];

  public addHttpServer(server: http.Server): void {
    this.httpServers.push(server);
  }

  public async onApplicationShutdown(): Promise<void> {
    await Promise.all(
      this.httpServers.map(
        (server) =>
          new Promise((resolve, reject) => {
            server.close((error) => {
              if (error) {
                reject(error);
              } else {
                resolve(null);
              }
            });
          }),
      ),
    );
  }
}

const shutdownObserver = app.get(ShutdownObserver);
shutdownObserver.addHttpServer(httpServer);
shutdownObserver.addHttpServer(httpsServer);
```

> info **Hint** `ExpressAdapter` `@nestjs/platform-express` package'idan import qilinadi. `http` va `https` package'lari esa Node.js'ning native package'lari hisoblanadi.

> **Warning** Bu recipe [GraphQL Subscriptions](/docs/graphql/subscriptions) bilan ishlamaydi.
