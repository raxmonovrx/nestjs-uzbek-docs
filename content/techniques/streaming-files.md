---
title: "Fayllarni stream qilish"
navTitle: "Fayllarni stream qilish"
description: "Ba'zida REST APIingizdan klientga fayl qaytarishni xohlashingiz mumkin. Nestda buni odatda quyidagicha qilasiz:"
order: 17
group: techniques
groupTitle: "Techniques"
---
> info **Note** Bu bob **HTTP ilovangiz**dan fayllarni stream qilishni ko'rsatadi. Quyida keltirilgan misollar GraphQL yoki Microservice ilovalariga tegishli emas.

Ba'zida REST APIingizdan klientga fayl qaytarishni xohlashingiz mumkin. Nestda buni odatda quyidagicha qilasiz:

```ts
@Controller('file')
export class FileController {
  @Get()
  getFile(@Res() res: Response) {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    file.pipe(res);
  }
}
```

Lekin buni qilganingizda, post-controller interceptor mantiqiga kirish imkonini yo'qotasiz. Buni hal qilish uchun `StreamableFile` instansiyasini qaytarishingiz mumkin va framework ichkarida javobni pipe qilishni o'zi bajaradi.

#### StreamableFile klassi

`StreamableFile` qaytarilishi kerak bo'lgan streamni ushlab turadigan klassdir. Yangi `StreamableFile` yaratish uchun `StreamableFile` konstruktoriga `Buffer` yoki `Stream` uzatishingiz mumkin.

> info **hint** `StreamableFile` klassi `@nestjs/common` dan import qilinadi.

#### Kross-platforma qo'llab-quvvatlash

Fastify default holatda `stream.pipe(res)` ni chaqirmasdan ham fayl yuborishni qo'llab-quvvatlaydi, shuning uchun `StreamableFile` klassidan umuman foydalanishingiz shart emas. Biroq Nest `StreamableFile` dan ikkala platforma turida ham foydalanishni qo'llab-quvvatlaydi, shuning uchun Express va Fastify o'rtasida almashsangiz ham bu ikki dvigatel orasidagi moslik haqida qayg'urishingiz shart emas.

#### Misol

Quyida `package.json` faylini JSON o'rniga fayl sifatida qaytarishning oddiy misoli keltirilgan, ammo g'oya tabiiy ravishda rasm, hujjat va boshqa turdagi fayllarga ham tatbiq etiladi.

```ts
import { Controller, Get, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }
}
```

Default content type (`Content-Type` HTTP response header qiymati) `application/octet-stream`. Agar bu qiymatni sozlash kerak bo'lsa, `StreamableFile` dagi `type` opsiyasidan foydalanishingiz yoki `res.set` metodidan yoxud [`@Header()`](/docs/core/controllers#response-headers) dekoratoridan foydalanishingiz mumkin, masalan:

```ts
import { Controller, Get, StreamableFile, Res } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express'; // Assuming that we are using the ExpressJS HTTP Adapter

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file, {
      type: 'application/json',
      disposition: 'attachment; filename="package.json"',
      // If you want to define the Content-Length value to another value instead of file's length:
      // length: 123,
    });
  }

  // Or even:
  @Get()
  getFileChangingResponseObjDirectly(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });
    return new StreamableFile(file);
  }

  // Or even:
  @Get()
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getFileUsingStaticValues(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }  
}
```
