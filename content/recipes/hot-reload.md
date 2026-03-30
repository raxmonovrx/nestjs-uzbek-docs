---
title: "Hot Reload"
navTitle: "Hot Reload"
description: "Ilovangizni ishga tushirish jarayoniga eng katta ta'sir TypeScript kompilyatsiyasi qiladi. Yaxshiyamki, webpack HMR (Hot-Module Replacement) bilan har safar o'zgarish bo'lganda but"
order: 5
group: recipes
groupTitle: "Recipes"
---
Ilovangizni ishga tushirish jarayoniga eng katta ta'sir **TypeScript kompilyatsiyasi** qiladi. Yaxshiyamki, webpack HMR (Hot-Module Replacement) bilan har safar o'zgarish bo'lganda butun loyihani qayta kompilyatsiya qilishimiz shart emas. Bu ilovani ishga tushirish uchun kerakli vaqtni sezilarli darajada kamaytiradi va iterativ ishlab chiqishni ancha osonlashtiradi.

> warning **Warning** `webpack` aktivlaringizni (masalan, `graphql` fayllarini) avtomatik `dist` papkasiga nusxalamasligini unutmang. Xuddi shunday, `webpack` glob statik yo'llar (masalan, `TypeOrmModule` dagi `entities` xususiyati) bilan mos emas.

### CLI bilan

Agar [Nest CLI](/docs/cli/overview) dan foydalansangiz, konfiguratsiya jarayoni ancha sodda. CLI `webpack` ni o'rab turadi va `HotModuleReplacementPlugin` dan foydalanish imkonini beradi.

#### O'rnatish

Avval kerakli paketlarni o'rnating:

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack
```

> info **Hint** Agar **Yarn Berry** (klassik Yarn emas) ishlatsangiz, `webpack-node-externals` o'rniga `webpack-pnp-externals` paketini o'rnating.

#### Konfiguratsiya

O'rnatish tugagach, ilovangiz ildiz katalogida `webpack-hmr.config.js` faylini yarating.

```typescript
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({ name: options.output.filename, autoRestart: false }),
    ],
  };
};
```

> info **Hint** **Yarn Berry** (klassik Yarn emas) bilan `externals` konfiguratsiya xususiyatida `nodeExternals` o'rniga `webpack-pnp-externals` paketidagi `WebpackPnpExternals` dan foydalaning: `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})`.

Bu funksiya birinchi argument sifatida standart webpack konfiguratsiyasi bo'lgan obyektni, ikkinchi argument sifatida esa Nest CLI foydalanadigan `webpack` paketiga havolani qabul qiladi. Shuningdek, u `HotModuleReplacementPlugin`, `WatchIgnorePlugin` va `RunScriptWebpackPlugin` plaginlari qo'shilgan o'zgartirilgan webpack konfiguratsiyasini qaytaradi.

#### Hot-Module Replacement

**HMR** ni yoqish uchun ilovaning entry fayli (`main.ts`) ni oching va quyidagi webpack bilan bog'liq ko'rsatmalarni qo'shing:

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

Ishga tushirish jarayonini soddalashtirish uchun `package.json` faylingizga skript qo'shing.

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"
```

Endi terminalni ochib, quyidagi buyruqni bajaring:

```bash
$ npm run start:dev
```

### CLIsiz

Agar [Nest CLI](/docs/cli/overview) dan foydalanmasangiz, konfiguratsiya biroz murakkabroq bo'ladi (ko'proq qo'lda qadamlar kerak bo'ladi).

#### O'rnatish

Avval kerakli paketlarni o'rnating:

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin
```

> info **Hint** Agar **Yarn Berry** (klassik Yarn emas) ishlatsangiz, `webpack-node-externals` o'rniga `webpack-pnp-externals` paketini o'rnating.

#### Konfiguratsiya

O'rnatish tugagach, ilovangiz ildiz katalogida `webpack.config.js` faylini yarating.

```typescript
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new RunScriptWebpackPlugin({ name: 'server.js', autoRestart: false })],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
};
```

> info **Hint** **Yarn Berry** (klassik Yarn emas) bilan `externals` konfiguratsiya xususiyatida `nodeExternals` o'rniga `webpack-pnp-externals` paketidagi `WebpackPnpExternals` dan foydalaning: `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})`.

Bu konfiguratsiya webpack ga ilovangiz haqida bir nechta muhim ma'lumotlarni beradi: entry faylning joylashuvi, **kompilyatsiya qilingan** fayllar qaysi katalogda saqlanishi va manba fayllarni kompilyatsiya qilish uchun qanday loader ishlatilishi. Umuman olganda, barcha variantlarni to'liq tushunmasangiz ham, fayldan shundayligicha foydalana olishingiz kerak.

#### Hot-Module Replacement

**HMR** ni yoqish uchun ilovaning entry fayli (`main.ts`) ni oching va quyidagi webpack bilan bog'liq ko'rsatmalarni qo'shing:

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

Ishga tushirish jarayonini soddalashtirish uchun `package.json` faylingizga skript qo'shing.

```json
"start:dev": "webpack --config webpack.config.js --watch"
```

Endi terminalni ochib, quyidagi buyruqni bajaring:

```bash
$ npm run start:dev
```

#### Misol

Ishlaydigan misol bu yerda mavjud.
