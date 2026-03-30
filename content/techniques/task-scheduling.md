---
title: "Task scheduling"
navTitle: "Task scheduling"
description: "Task scheduling sizga istalgan kodni (metod/funksiyalarni) belgilangan sana/vaqtda, qayta takrorlanuvchi intervalda yoki ko'rsatilgan intervaldan so'ng bir marta bajarishni rejalas"
order: 18
group: techniques
groupTitle: "Techniques"
---
Task scheduling sizga istalgan kodni (metod/funksiyalarni) belgilangan sana/vaqtda, qayta takrorlanuvchi intervalda yoki ko'rsatilgan intervaldan so'ng bir marta bajarishni rejalashtirish imkonini beradi. Linux olamida bu odatda OS darajasida cron kabi paketlar bilan bajariladi. Node.js ilovalari uchun cron ga o'xshash funksionallikni emulyatsiya qiladigan bir nechta paketlar mavjud. Nest `@nestjs/schedule` paketini taqdim etadi, u mashhur Node.js cron paketi bilan integratsiya qiladi. Ushbu bobda aynan shu paketni ko'rib chiqamiz.

#### O'rnatish

Uni ishlatishni boshlash uchun avvalo kerakli bog'liqliklarni o'rnatamiz.

```bash
$ npm install --save @nestjs/schedule
```

Job schedulingni yoqish uchun `ScheduleModule` ni root `AppModule` ga import qiling va quyida ko'rsatilgandek `forRoot()` statik metodini ishga tushiring:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
})
export class AppModule {}
```

`.forRoot()` chaqiruvi scheduler'ni inicializatsiya qiladi va ilovangizda mavjud bo'lgan deklarativ <a href="/docs/techniques/task-scheduling#declarative-cron-jobs">cron job</a>lar, <a href="/docs/techniques/task-scheduling#declarative-timeouts">timeout</a>lar va <a href="/docs/techniques/task-scheduling#declarative-intervals">interval</a>larni ro'yxatdan o'tkazadi. Ro'yxatdan o'tkazish `onApplicationBootstrap` lifecycle hook sodir bo'lganda amalga oshadi, bu esa barcha modullar yuklanganini va rejalashtirilgan ishlarni e'lon qilganini ta'minlaydi.

#### Deklarativ cron job'lar

Cron job istalgan funksiyani (metod chaqiruvini) avtomatik bajarishga rejalashtiradi. Cron job'lar quyidagicha ishlashi mumkin:

- Bir marta, belgilangan sana/vaqtda.
- Qayta takrorlanuvchi asosda; takrorlanuvchi ishlar belgilangan interval ichida ma'lum bir vaqtda ishlashi mumkin (masalan, soatiga bir marta, haftasiga bir marta, har 5 daqiqada bir marta)

Cron job'ni `@Cron()` dekoratorini bajariladigan kod joylashgan metoddan oldin qo'yish orqali e'lon qiling, quyidagicha:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }
}
```

Ushbu misolda `handleCron()` metodi joriy soniya `45` bo'lganda chaqiriladi. Boshqacha aytganda, metod har daqiqada bir marta, 45-soniyada ishga tushadi.

`@Cron()` dekoratori quyidagi standart cron patternlarni qo'llab-quvvatlaydi:

- Asterisk (masalan, `*`)
- Ranges (masalan, `1-3,5`)
- Steps (masalan, `*/2`)

Yuqoridagi misolda dekoratorga `45 * * * * *` ni uzatdik. Quyidagi kalit cron pattern satridagi har bir pozitsiya qanday talqin qilinishini ko'rsatadi:

<pre class="language-javascript"><code class="language-javascript">
* * * * * *
| | | | | |
| | | | | day of week
| | | | months
| | | day of month
| | hours
| minutes
seconds (optional)
</code></pre>

Ba'zi cron pattern namunalari:

<table>
  <tbody>
    <tr>
      <td><code>* * * * * *</code></td>
      <td>har soniyada</td>
    </tr>
    <tr>
      <td><code>45 * * * * *</code></td>
      <td>har daqiqada, 45-soniyada</td>
    </tr>
    <tr>
      <td><code>0 10 * * * *</code></td>
      <td>har soatda, 10-daqiqa boshida</td>
    </tr>
    <tr>
      <td><code>0 */30 9-17 * * *</code></td>
      <td>09:00 dan 17:00 gacha har 30 daqiqada</td>
    </tr>
   <tr>
      <td><code>0 30 11 * * 1-5</code></td>
      <td>Monday to Friday at 11:30am</td>
    </tr>
  </tbody>
</table>

`@nestjs/schedule` paketi ko'p ishlatiladigan cron patternlar uchun qulay enum taqdim etadi. Bu enumdan quyidagicha foydalanishingiz mumkin:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    this.logger.debug('Called every 30 seconds');
  }
}
```

Ushbu misolda `handleCron()` metodi har `30` soniyada chaqiriladi. Agar istisno yuzaga kelsa, u konsolga loglanadi, chunki `@Cron()` bilan belgilangan har bir metod avtomatik ravishda `try-catch` blokiga o'raladi.

Muqobil ravishda, `@Cron()` dekoratoriga JavaScript `Date` obyektini uzatishingiz mumkin. Bunda job ko'rsatilgan sanada aniq bir marta ishlaydi.

> info **Hint** Joriy sanaga nisbatan job rejalashtirish uchun JavaScript date arithmetic'dan foydalaning. Masalan, `@Cron(new Date(Date.now() + 10 * 1000))` ilova ishga tushganidan 10 soniya o'tib ishga tushadigan jobni rejalashtiradi.

Shuningdek, `@Cron()` dekoratoriga ikkinchi parametr sifatida qo'shimcha opsiyalarni uzatishingiz mumkin.

<table>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td>
        E'lon qilingandan so'ng cron jobga kirish va uni boshqarish uchun foydali.
      </td>
    </tr>
    <tr>
      <td><code>timeZone</code></td>
      <td>
        Bajarilish uchun vaqt zonasini ko'rsating. Bu haqiqiy vaqtni sizning time zone'ingizga nisbatan o'zgartiradi. Agar time zone noto'g'ri bo'lsa, xato tashlanadi. Mavjud barcha time zonalarni Moment Timezone saytida tekshirishingiz mumkin.
      </td>
    </tr>
    <tr>
      <td><code>utcOffset</code></td>
      <td>
        Bu `timeZone` parametri o'rniga time zone offsetini ko'rsatish imkonini beradi.
      </td>
    </tr>
    <tr>
      <td><code>waitForCompletion</code></td>
      <td>
        Agar <code>true</code> bo'lsa, joriy onTick callback tugamaguncha cron jobning qo'shimcha instansiyalari ishga tushmaydi. Joriy cron job ishlayotganda rejalashtirilgan yangi bajarilishlar butunlay o'tkazib yuboriladi.
      </td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>
       Bu job umuman bajariladimi-yo'qligini bildiradi.
      </td>
    </tr>
  </tbody>
</table>

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  @Cron('* * 0 * * *', {
    name: 'notifications',
    timeZone: 'Europe/Paris',
  })
  triggerNotifications() {}
}
```

E'lon qilingandan so'ng cron jobga kirish va uni boshqarish yoki cron patterni runtime paytida aniqlanadigan dinamik cron job yaratish uchun <a href="/docs/techniques/task-scheduling#dynamic-schedule-module-api">Dynamic API</a> dan foydalanishingiz mumkin. API orqali deklarativ cron jobga kirish uchun dekoratorning ikkinchi argumenti sifatidagi ixtiyoriy opsiyalar obyektida `name` xossasini berib, jobga nom biriktirishingiz kerak.

#### Deklarativ interval'lar

Metod belgilangan (takrorlanuvchi) intervalda ishlashi kerakligini e'lon qilish uchun metod ta'rifidan oldin `@Interval()` dekoratorini qo'ying. Decoratorga millisekundlarda interval qiymatini uzating, quyidagicha:

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}
```

> info **Hint** Bu mexanizm ichkarida JavaScript `setInterval()` funksiyasidan foydalanadi. Shuningdek, takrorlanuvchi ishlarni rejalashtirish uchun cron job'ni ham ishlatishingiz mumkin.

Agar deklarativ interval'ni e'lon qilgan sinfdan tashqarida <a href="/docs/techniques/task-scheduling#dynamic-schedule-module-api">Dynamic API</a> orqali boshqarishni xohlasangiz, intervalni quyidagi konstruktsiya bilan nomga bog'lang:

```typescript
@Interval('notifications', 2500)
handleInterval() {}
```

Agar istisno yuzaga kelsa, u konsolga loglanadi, chunki `@Interval()` bilan belgilangan har bir metod avtomatik ravishda `try-catch` blokiga o'raladi.

<a href="/docs/techniques/task-scheduling#dynamic-intervals">Dynamic API</a> shuningdek runtime paytida interval xossalari aniqlanadigan dinamik interval'larni **yaratish**, hamda ularni **ro'yxatlash va o'chirish** imkonini beradi.

#### Deklarativ timeout'lar

Metod belgilangan timeoutdan keyin bir marta ishlashi kerakligini e'lon qilish uchun metod ta'rifidan oldin `@Timeout()` dekoratorini qo'ying. Decoratorga ilova ishga tushganidan boshlab millisekundlarda nisbiy vaqt ofsetini uzating, quyidagicha:

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}
```

> info **Hint** Bu mexanizm ichkarida JavaScript `setTimeout()` funksiyasidan foydalanadi.

Agar istisno yuzaga kelsa, u konsolga loglanadi, chunki `@Timeout()` bilan belgilangan har bir metod avtomatik ravishda `try-catch` blokiga o'raladi.

Agar deklarativ timeout'ni e'lon qilgan sinfdan tashqarida <a href="/docs/techniques/task-scheduling#dynamic-schedule-module-api">Dynamic API</a> orqali boshqarishni xohlasangiz, timeoutni quyidagi konstruktsiya bilan nomga bog'lang:

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}
```

<a href="/docs/techniques/task-scheduling#dynamic-timeouts">Dynamic API</a> shuningdek runtime paytida timeout xossalari aniqlanadigan dinamik timeout'larni **yaratish**, hamda ularni **ro'yxatlash va o'chirish** imkonini beradi.

#### Dynamic schedule module API

`@nestjs/schedule` moduli deklarativ <a href="/docs/techniques/task-scheduling#declarative-cron-jobs">cron job</a>lar, <a href="/docs/techniques/task-scheduling#declarative-timeouts">timeout</a>lar va <a href="/docs/techniques/task-scheduling#declarative-intervals">interval</a>larni boshqarishga imkon beradigan dinamik API taqdim etadi. API shuningdek runtime paytida xossalari aniqlanadigan **dinamik** cron job'lar, timeout'lar va interval'larni yaratish va boshqarish imkonini beradi.

#### Dinamik cron job'lar

`SchedulerRegistry` API yordamida kodingizning istalgan joyidan nomi bo'yicha `CronJob` instansiyasiga havola oling. Avval `SchedulerRegistry` ni odatiy konstruktor in'eksiyasi orqali kiriting:

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

> info **Hint** `SchedulerRegistry` ni `@nestjs/schedule` paketidan import qiling.

So'ng uni sinfda quyidagicha ishlating. Faraz qilaylik, quyidagi deklaratsiya bilan cron job yaratilgan:

```typescript
@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}
```

Ushbu jobga quyidagicha kiring:

```typescript
const job = this.schedulerRegistry.getCronJob('notifications');

job.stop();
console.log(job.lastDate());
```

`getCronJob()` metodi nomlangan cron jobni qaytaradi. Qaytgan `CronJob` obyektida quyidagi metodlar mavjud:

- `stop()` - rejalashtirilgan jobni to'xtatadi.
- `start()` - to'xtatilgan jobni qayta ishga tushiradi.
- `setTime(time: CronTime)` - jobni to'xtatadi, yangi vaqt belgilaydi va keyin jobni qayta ishga tushiradi.
- `lastDate()` - job oxirgi marta bajarilgan sana `DateTime` ko'rinishini qaytaradi.
- `nextDate()` - job keyingi marta bajarilishi rejalashtirilgan sananing `DateTime` ko'rinishini qaytaradi.
- `nextDates(count: number)` - job bajarilishini boshlatadigan keyingi sanalar uchun `DateTime` ko'rinishlaridan iborat massivni (o'lchami `count`) qaytaradi. `count` default holatda 0 bo'lib, bo'sh massiv qaytaradi.

> info **Hint** `DateTime` obyektlarini JavaScript `Date` ekvivalentiga aylantirish uchun `toJSDate()` dan foydalaning.

`SchedulerRegistry#addCronJob` metodi yordamida yangi cron jobni dinamik **yarating**, quyidagicha:

```typescript
addCronJob(name: string, seconds: string) {
  const job = new CronJob(`${seconds} * * * * *`, () => {
    this.logger.warn(`time (${seconds}) for job ${name} to run!`);
  });

  this.schedulerRegistry.addCronJob(name, job);
  job.start();

  this.logger.warn(
    `job ${name} added for each minute at ${seconds} seconds!`,
  );
}
```

Bu kodda biz `cron` paketidagi `CronJob` obyektidan foydalanib cron job yaratamiz. `CronJob` konstruktori birinchi argument sifatida cron patternni (`@Cron()` <a href="/docs/techniques/task-scheduling#declarative-cron-jobs">dekoratori</a> kabi) va ikkinchi argument sifatida cron taymeri ishga tushganda bajariladigan callbackni oladi. `SchedulerRegistry#addCronJob` metodi ikki argument qabul qiladi: `CronJob` uchun nom va `CronJob` obyektining o'zi.

> warning **Warning** `SchedulerRegistry` ga kirishdan oldin uni in'eksiya qilishni unutmang. `CronJob` ni `cron` paketidan import qiling.

`SchedulerRegistry#deleteCronJob` metodi yordamida nomlangan cron jobni **o'chiring**, quyidagicha:

```typescript
deleteCron(name: string) {
  this.schedulerRegistry.deleteCronJob(name);
  this.logger.warn(`job ${name} deleted!`);
}
```

`SchedulerRegistry#getCronJobs` metodi yordamida barcha cron joblarni **ro'yxatlang**, quyidagicha:

```typescript
getCrons() {
  const jobs = this.schedulerRegistry.getCronJobs();
  jobs.forEach((value, key, map) => {
    let next;
    try {
      next = value.nextDate().toJSDate();
    } catch (e) {
      next = 'error: next fire date is in the past!';
    }
    this.logger.log(`job: ${key} -> next: ${next}`);
  });
}
```

`getCronJobs()` metodi `map` qaytaradi. Bu kodda biz map bo'ylab iteratsiya qilib, har bir `CronJob` ning `nextDate()` metodiga kirishga harakat qilamiz. `CronJob` APIda agar job allaqachon ishga tushgan bo'lsa va kelajakdagi ishga tushish sanasi bo'lmasa, u istisno tashlaydi.

#### Dinamik interval'lar

`SchedulerRegistry#getInterval` metodi yordamida intervalga havola oling. Yuqoridagi kabi, `SchedulerRegistry` ni odatiy konstruktor in'eksiyasi orqali kiriting:

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

Va quyidagicha foydalaning:

```typescript
const interval = this.schedulerRegistry.getInterval('notifications');
clearInterval(interval);
```

`SchedulerRegistry#addInterval` metodi yordamida yangi intervalni dinamik **yarating**, quyidagicha:

```typescript
addInterval(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Interval ${name} executing at time (${milliseconds})!`);
  };

  const interval = setInterval(callback, milliseconds);
  this.schedulerRegistry.addInterval(name, interval);
}
```

Bu kodda biz standart JavaScript interval yaratamiz, so'ng uni `SchedulerRegistry#addInterval` metodiga uzatamiz.
Ushbu metod ikki argument qabul qiladi: interval uchun nom va intervalning o'zi.

`SchedulerRegistry#deleteInterval` metodi yordamida nomlangan intervalni **o'chiring**, quyidagicha:

```typescript
deleteInterval(name: string) {
  this.schedulerRegistry.deleteInterval(name);
  this.logger.warn(`Interval ${name} deleted!`);
}
```

`SchedulerRegistry#getIntervals` metodi yordamida barcha interval'larni **ro'yxatlang**, quyidagicha:

```typescript
getIntervals() {
  const intervals = this.schedulerRegistry.getIntervals();
  intervals.forEach(key => this.logger.log(`Interval: ${key}`));
}
```

#### Dinamik timeout'lar

`SchedulerRegistry#getTimeout` metodi yordamida timeoutga havola oling. Yuqoridagi kabi, `SchedulerRegistry` ni odatiy konstruktor in'eksiyasi orqali kiriting:

```typescript
constructor(private readonly schedulerRegistry: SchedulerRegistry) {}
```

Va quyidagicha foydalaning:

```typescript
const timeout = this.schedulerRegistry.getTimeout('notifications');
clearTimeout(timeout);
```

`SchedulerRegistry#addTimeout` metodi yordamida yangi timeoutni dinamik **yarating**, quyidagicha:

```typescript
addTimeout(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Timeout ${name} executing after (${milliseconds})!`);
  };

  const timeout = setTimeout(callback, milliseconds);
  this.schedulerRegistry.addTimeout(name, timeout);
}
```

Bu kodda biz standart JavaScript timeout yaratamiz, so'ng uni `SchedulerRegistry#addTimeout` metodiga uzatamiz.
Ushbu metod ikki argument qabul qiladi: timeout uchun nom va timeoutning o'zi.

`SchedulerRegistry#deleteTimeout` metodi yordamida nomlangan timeoutni **o'chiring**, quyidagicha:

```typescript
deleteTimeout(name: string) {
  this.schedulerRegistry.deleteTimeout(name);
  this.logger.warn(`Timeout ${name} deleted!`);
}
```

`SchedulerRegistry#getTimeouts` metodi yordamida barcha timeout'larni **ro'yxatlang**, quyidagicha:

```typescript
getTimeouts() {
  const timeouts = this.schedulerRegistry.getTimeouts();
  timeouts.forEach(key => this.logger.log(`Timeout: ${key}`));
}
```

#### Misol

Ishlaydigan misol bu yerda mavjud.
