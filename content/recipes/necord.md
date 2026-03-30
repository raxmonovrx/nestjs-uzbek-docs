---
title: "Necord"
navTitle: "Necord"
description: "Necord Discord botlarini yaratishni soddalashtiradigan qulay modul bo'lib, NestJS ilovangizga bevosita integratsiya qilish imkonini beradi."
order: 8
group: recipes
groupTitle: "Recipes"
---
Necord Discord botlarini yaratishni soddalashtiradigan qulay modul bo'lib, NestJS ilovangizga bevosita integratsiya qilish imkonini beradi.

> info **Note** Necord uchinchi tomon paketi bo'lib, NestJS core jamoasi tomonidan rasmiy qo'llab-quvvatlanmaydi. Muammo uchratsa, iltimos, rasmiy repoda xabar bering.

#### O'rnatish

Boshlash uchun Necord ni va uning qaramligi `Discord.js` ni o'rnating.

```bash
$ npm install necord discord.js
```

#### Foydalanish

Necord dan loyihangizda foydalanish uchun `NecordModule` ni import qiling va kerakli parametrlarga sozlang.

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { AppService } from './app.service';

@Module({
  imports: [
    NecordModule.forRoot({
      token: process.env.DISCORD_TOKEN,
      intents: [IntentsBitField.Flags.Guilds],
      development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID],
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
```

> info **Hint** Mavjud intentlar to'liq ro'yxatini bu yerda topishingiz mumkin.

Shu sozlama bilan providerlaringizga `AppService` ni inject qilib, commandlar, eventlar va boshqalarni oson ro'yxatdan o'tkazishingiz mumkin.

```typescript
@@filename(app.service)
import { Injectable, Logger } from '@nestjs/common';
import { Context, On, Once, ContextOf } from 'necord';
import { Client } from 'discord.js';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  @Once('ready')
  public onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }
}
```

##### Kontekstni tushunish

Yuqoridagi misollarda `@Context` dekoratorini payqagandirsiz. Bu dekorator metodga event kontekstini inject qiladi, shuning uchun eventga xos ma'lumotlarga kira olasiz. Turli event turlari mavjud bo'lganidan, kontekst turi `ContextOf<type: string>` orqali aniqlanadi. `@Context()` dekoratori yordamida kontekst o'zgaruvchilariga oson kirish mumkin, u o'zgaruvchini eventga tegishli argumentlar massiviga to'ldiradi.

#### Matn commandlari

> warning **Caution** Matn commandlari xabar tarkibiga tayanadi, bu esa tekshirilgan botlar va 100 dan ortiq serverga ega ilovalar uchun bekor qilinadi. Demak, bot xabar tarkibiga kira olmasa, matn commandlari ishlamaydi. Bu o'zgarish haqida ko'proq bu yerda o'qing.

Quyida `@TextCommand` dekoratori yordamida xabarlar uchun oddiy command handler yaratish ko'rsatilgan.

```typescript
@@filename(app.commands)
import { Injectable } from '@nestjs/common';
import { Context, TextCommand, TextCommandContext, Arguments } from 'necord';

@Injectable()
export class AppCommands {
  @TextCommand({
    name: 'ping',
    description: 'Responds with pong!',
  })
  public onPing(
    @Context() [message]: TextCommandContext,
    @Arguments() args: string[],
  ) {
    return message.reply('pong!');
  }
}
```

#### Ilova commandlari

Ilova commandlari foydalanuvchilarga Discord klienti ichida ilovangiz bilan o'zaro ishlashning native usulini beradi. Ularni turli interfeyslar orqali chaqirish mumkin bo'lgan uch tur mavjud: chat input, message kontekst menyusi (xabarga o'ng tugma), va user kontekst menyusi (foydalanuvchiga o'ng tugma).

#### Slash commandlar

Slash commandlar foydalanuvchilar bilan tuzilgan tarzda muloqot qilishning ajoyib usuli. Ular aniq argument va parametrlarga ega commandlar yaratishga imkon beradi va foydalanuvchi tajribasini sezilarli darajada yaxshilaydi.

Necord bilan slash command aniqlash uchun `SlashCommand` dekoratoridan foydalanishingiz mumkin.

```typescript
@@filename(app.commands)
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class AppCommands {
  @SlashCommand({
    name: 'ping',
    description: 'Responds with pong!',
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply({ content: 'Pong!' });
  }
}
```

> info **Hint** Bot klientingiz login qilganda barcha aniqlangan commandlarni avtomatik ro'yxatdan o'tkazadi. Global commandlar bir soatgacha keshda qolishini unutmang. Global kesh bilan bog'liq muammolardan qochish uchun Necord modulidagi `development` argumentidan foydalaning, u command ko'rinishini bitta guild bilan cheklaydi.

##### Parametrlar

Slash commandlar uchun parametrlarni option dekoratorlari yordamida belgilashingiz mumkin. Buning uchun `TextDto` klassini yarataylik:

```typescript
@@filename(text.dto)
import { StringOption } from 'necord';

export class TextDto {
  @StringOption({
    name: 'text',
    description: 'Input your text here',
    required: true,
  })
  text: string;
}
```

Keyin bu DTO ni `AppCommands` klassida ishlatishingiz mumkin:

```typescript
@@filename(app.commands)
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, Options, SlashCommandContext } from 'necord';
import { TextDto } from './length.dto';

@Injectable()
export class AppCommands {
  @SlashCommand({
    name: 'length',
    description: 'Calculate the length of your text',
  })
  public async onLength(
    @Context() [interaction]: SlashCommandContext,
    @Options() { text }: TextDto,
  ) {
    return interaction.reply({
      content: `The length of your text is: ${text.length}`,
    });
  }
}
```

O'rnatilgan option dekoratorlarining to'liq ro'yxati uchun shu hujjatga qarang.

##### Avto-to'ldirish

Slash commandlar uchun avto-to'ldirish funksiyasini joriy qilish uchun interceptor yaratishingiz kerak bo'ladi. Bu interceptor foydalanuvchi avto-to'ldirish maydonida yozayotganda so'rovlarni ko'rib chiqadi.

```typescript
@@filename(cats-autocomplete.interceptor)
import { Injectable } from '@nestjs/common';
import { AutocompleteInteraction } from 'discord.js';
import { AutocompleteInterceptor } from 'necord';

@Injectable()
class CatsAutocompleteInterceptor extends AutocompleteInterceptor {
  public transformOptions(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    let choices: string[];

    if (focused.name === 'cat') {
      choices = ['Siamese', 'Persian', 'Maine Coon'];
    }

    return interaction.respond(
      choices
        .filter((choice) => choice.startsWith(focused.value.toString()))
        .map((choice) => ({ name: choice, value: choice })),
    );
  }
}
```

Parametrlar klassini `autocomplete: true` bilan belgilashingiz ham kerak bo'ladi:

```typescript
@@filename(cat.dto)
import { StringOption } from 'necord';

export class CatDto {
  @StringOption({
    name: 'cat',
    description: 'Choose a cat breed',
    autocomplete: true,
    required: true,
  })
  cat: string;
}
```

Va nihoyat, interceptorni slash commandga qo'llang:

```typescript
@@filename(cats.commands)
import { Injectable, UseInterceptors } from '@nestjs/common';
import { Context, SlashCommand, Options, SlashCommandContext } from 'necord';
import { CatDto } from '/cat.dto';
import { CatsAutocompleteInterceptor } from './cats-autocomplete.interceptor';

@Injectable()
export class CatsCommands {
  @UseInterceptors(CatsAutocompleteInterceptor)
  @SlashCommand({
    name: 'cat',
    description: 'Retrieve information about a specific cat breed',
  })
  public async onSearch(
    @Context() [interaction]: SlashCommandContext,
    @Options() { cat }: CatDto,
  ) {
    return interaction.reply({
      content: `I found information on the breed of ${cat} cat!`,
    });
  }
}
```

#### User kontekst menyusi

User commandlari foydalanuvchiga o'ng tugma (yoki bosish) qilganda ochiladigan kontekst menyusida ko'rinadi. Bu commandlar foydalanuvchilarga bevosita yo'naltirilgan tezkor harakatlarni taqdim etadi.

```typescript
@@filename(app.commands)
import { Injectable } from '@nestjs/common';
import { Context, UserCommand, UserCommandContext, TargetUser } from 'necord';
import { User } from 'discord.js';

@Injectable()
export class AppCommands {
  @UserCommand({ name: 'Get avatar' })
  public async getUserAvatar(
    @Context() [interaction]: UserCommandContext,
    @TargetUser() user: User,
  ) {
    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Avatar of ${user.username}`)
          .setImage(user.displayAvatarURL({ size: 4096, dynamic: true })),
      ],
    });
  }
}
```

#### Xabar kontekst menyusi

Message commandlari xabarga o'ng tugma bosilganda kontekst menyusida paydo bo'ladi va shu xabarga tegishli tezkor harakatlarni bajarishga imkon beradi.

```typescript
@@filename(app.commands)
import { Injectable } from '@nestjs/common';
import { Context, MessageCommand, MessageCommandContext, TargetMessage } from 'necord';
import { Message } from 'discord.js';

@Injectable()
export class AppCommands {
  @MessageCommand({ name: 'Copy Message' })
  public async copyMessage(
    @Context() [interaction]: MessageCommandContext,
    @TargetMessage() message: Message,
  ) {
    return interaction.reply({ content: message.content });
  }
}
```

#### Tugmalar

Buttons xabarlarga qo'shilishi mumkin bo'lgan interaktiv elementlardir. Ularni bosganda ilovangizga interaction yuboriladi.

```typescript
@@filename(app.components)
import { Injectable } from '@nestjs/common';
import { Context, Button, ButtonContext } from 'necord';

@Injectable()
export class AppComponents {
  @Button('BUTTON')
  public onButtonClick(@Context() [interaction]: ButtonContext) {
    return interaction.reply({ content: 'Button clicked!' });
  }
}
```

#### Select menyular

Select menus xabarlarda paydo bo'ladigan boshqa turdagi interaktiv komponent. U foydalanuvchilarga dropdownga o'xshash UI orqali variantlarni tanlash imkonini beradi.

```typescript
@@filename(app.components)
import { Injectable } from '@nestjs/common';
import { Context, StringSelect, StringSelectContext, SelectedStrings } from 'necord';

@Injectable()
export class AppComponents {
  @StringSelect('SELECT_MENU')
  public onSelectMenu(
    @Context() [interaction]: StringSelectContext,
    @SelectedStrings() values: string[],
  ) {
    return interaction.reply({ content: `You selected: ${values.join(', ')}` });
  }
}
```

O'rnatilgan select menyu komponentlarining to'liq ro'yxati uchun shu havolaga tashrif buyuring.

#### Modallar

Modallar foydalanuvchilarga formatlangan ma'lumot yuborishga imkon beradigan pop-up formalar. Necord yordamida modallarni yaratish va qayta ishlash usuli:

```typescript
@@filename(app.modals)
import { Injectable } from '@nestjs/common';
import { Context, Modal, ModalContext } from 'necord';

@Injectable()
export class AppModals {
  @Modal('pizza')
  public onModal(@Context() [interaction]: ModalContext) {
    return interaction.reply({
      content: `Your fav pizza : ${interaction.fields.getTextInputValue('pizza')}`
    });
  }
}
```

#### Qo'shimcha ma'lumot

Qo'shimcha ma'lumot uchun Necord saytiga tashrif buyuring.
