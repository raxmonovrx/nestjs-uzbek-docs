---
title: "Discovery service"
navTitle: "Discovery service"
description: "@nestjs/core paketidan taqdim etiladigan DiscoveryService - bu NestJS ilovasida provayderlar, kontrollerlar va boshqa metadatalarni dinamik tarzda ko'rib chiqish va olish imkonini "
order: 4
group: fundamentals
groupTitle: "Fundamentals"
---
`@nestjs/core` paketidan taqdim etiladigan `DiscoveryService` - bu NestJS ilovasida provayderlar, kontrollerlar va boshqa metadatalarni dinamik tarzda ko'rib chiqish va olish imkonini beruvchi kuchli yordamchi vosita. Bu ayniqsa runtime introspeksiyasiga tayanadigan plaginlar, dekoratorlar yoki ilg'or funksiyalarni yaratishda foydali. `DiscoveryService` dan foydalanish orqali dasturchilar yanada moslashuvchan va modulli arxitekturalarni yaratishi, ilovalarda avtomatlashtirish va dinamik xatti-harakatlarni yoqishi mumkin.

#### Boshlash

`DiscoveryService` dan foydalanishdan oldin, uni ishlatmoqchi bo'lgan modulga `DiscoveryModule` ni import qilishingiz kerak. Bu servis dependency injection orqali mavjud bo'lishini ta'minlaydi. Quyida NestJS modulida uni qanday sozlash ko'rsatilgan:

```typescript
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ExampleService } from './example.service';

@Module({
  imports: [DiscoveryModule],
  providers: [ExampleService],
})
export class ExampleModule {}
```

Modul sozlangandan so'ng, `DiscoveryService` ni dinamik discovery kerak bo'lgan istalgan provayder yoki servisga in'eksiya qilish mumkin.

```typescript
@@filename(example.service)
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}
@@switch
@Injectable()
@Dependencies(DiscoveryService)
export class ExampleService {
  constructor(discoveryService) {
    this.discoveryService = discoveryService;
  }
}
```

#### Provayderlar va kontrollerlarni topish

`DiscoveryService` ning asosiy imkoniyatlaridan biri - ilovadagi barcha ro'yxatdan o'tgan provayderlarni olish. Bu provayderlarni muayyan shartlarga ko'ra dinamik qayta ishlashda foydali. Quyidagi parcha barcha provayderlarga qanday kirishni ko'rsatadi:

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);
```

Har bir provayder obyektida uning instansiyasi, tokeni va metadatasi kabi ma'lumotlar bo'ladi. Xuddi shuningdek, ilovadagi barcha ro'yxatdan o'tgan kontrollerlarni olish kerak bo'lsa, buni quyidagicha qilishingiz mumkin:

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);
```

Bu imkoniyat kontrollerlarni dinamik qayta ishlash kerak bo'lgan holatlarda, masalan, analitika kuzatuvi yoki avtomatik ro'yxatdan o'tkazish mexanizmlarida ayniqsa foydali.

#### Metadatalarni ajratib olish

Provayderlar va kontrollerlarni topishdan tashqari, `DiscoveryService` ushbu komponentlarga biriktirilgan metadatalarni olish imkonini ham beradi. Bu ayniqsa runtime paytida metadata saqlaydigan maxsus dekoratorlar bilan ishlaganda qimmatli.

Masalan, maxsus dekorator provayderlarni muayyan metadata bilan belgilaydigan holatni ko'rib chiqaylik:

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();
```

Ushbu dekoratorni servisga qo'llash keyinchalik so'ralishi mumkin bo'lgan metadatalarni saqlash imkonini beradi:

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}
```

Shu tarzda metadata provayderlarga biriktirilgach, `DiscoveryService` belgilangan metadata bo'yicha provayderlarni filtrlashni osonlashtiradi. Quyidagi kod parchasida muayyan metadata qiymati bilan belgilangan provayderlarni qanday olish ko'rsatilgan:

```typescript
const providers = this.discoveryService.getProviders();

const [provider] = providers.filter(
  (item) =>
    this.discoveryService.getMetadataByDecorator(FeatureFlag, item) ===
    'experimental',
);

console.log(
  'Providers with the "experimental" feature flag metadata:',
  provider,
);
```

#### Xulosa

`DiscoveryService` - NestJS ilovalarida runtime introspeksiyasini yoqadigan ko'p qirrali va kuchli vosita. Provayderlar, kontrollerlar va metadatalarni dinamik tarzda topish imkonini bergani uchun, u kengaytiriladigan freymvorklar, plaginlar va avtomatlashtirishga yo'naltirilgan funksiyalarni qurishda muhim rol o'ynaydi. Provayderlarni skan qilish va qayta ishlash, ilg'or qayta ishlash uchun metadatalarni ajratib olish yoki modulli va masshtablanadigan arxitekturalarni yaratish kerak bo'lsa, `DiscoveryService` bu maqsadlarga erishish uchun samarali va tartibli yondashuvni taqdim etadi.
