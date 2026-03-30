---
title: "Shifrlash va hashing"
navTitle: "Shifrlash va hashing"
description: "Shifrlash - bu ma'lumotni kodlash jarayoni. Bu jarayon ma'lumotning asl ko'rinishi (ya'ni oddiy matn - plaintext) ni shifrlangan matn (ciphertext) deb ataladigan boshqa ko'rinishga"
order: 5
group: security
groupTitle: "Security"
---
**Shifrlash** - bu ma'lumotni kodlash jarayoni. Bu jarayon ma'lumotning asl ko'rinishi (ya'ni oddiy matn - plaintext) ni shifrlangan matn (ciphertext) deb ataladigan boshqa ko'rinishga aylantiradi. Ideal holatda, faqat vakolatli tomonlar shifrlangan matnni yana plaintextga qaytarib, asl ma'lumotga kira olishi kerak. Shifrlashning o'zi aralashuvni oldini olmaydi, ammo ehtimoliy ushlab oluvchidan mazmunni tushunish imkonini olib qo'yadi. Shifrlash ikki yo'nalishli funksiya; shifrlangan ma'lumotni to'g'ri kalit bilan qayta yechish mumkin.

**Hashing** - bu berilgan kalitni boshqa qiymatga aylantirish jarayoni. Yangi qiymat matematik algoritm asosida hash funksiyasi orqali hosil qilinadi. Hashing bajarilgach, natijadan kirish qiymatiga qaytish imkonsiz bo'lishi kerak.

#### Shifrlash

Node.js `crypto` deb nomlangan ichki modulni taqdim etadi; u satrlar, sonlar, bufferlar, streamlar va boshqalarni shifrlash hamda yechishda ishlatiladi. Nest keraksiz abstraksiyalarni kiritmaslik uchun bu modul ustidan qo'shimcha paket taqdim etmaydi.

Masalan, AES (Advanced Encryption System) ning `'aes-256-ctr'` algoritmi CTR shifrlash rejimidan foydalanamiz.

```typescript
import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const iv = randomBytes(16);
const password = 'Password used to generate key';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
const cipher = createCipheriv('aes-256-ctr', key, iv);

const textToEncrypt = 'Nest';
const encryptedText = Buffer.concat([
  cipher.update(textToEncrypt),
  cipher.final(),
]);
```

Endi `encryptedText` qiymatini yechamiz:

```typescript
import { createDecipheriv } from 'node:crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);
```

#### Hashing

Hashing uchun bcrypt yoki argon2 paketlaridan foydalanishni tavsiya qilamiz. Nest keraksiz abstraksiyalar kiritmaslik uchun bu modullar ustidan qo'shimcha o'ramlar taqdim etmaydi (o'rganish egri chizig'ini qisqartirish uchun).

Masalan, tasodifiy parolni hash qilish uchun `bcrypt`dan foydalanamiz.

Avval kerakli paketlarni o'rnating:

```shell
$ npm i bcrypt
$ npm i -D @types/bcrypt
```

O'rnatish tugagach, `hash` funksiyasidan quyidagicha foydalanishingiz mumkin:

```typescript
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);
```

Salt yaratish uchun `genSalt` funksiyasidan foydalaning:

```typescript
const salt = await bcrypt.genSalt();
```

Parolni solishtirish/tekshirish uchun `compare` funksiyasidan foydalaning:

```typescript
const isMatch = await bcrypt.compare(password, hash);
```

Mavjud funksiyalar haqida batafsil bu yerda o'qing.
