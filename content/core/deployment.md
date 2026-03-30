---
title: "Deploy"
navTitle: "Deploy"
description: "NestJS ilovangizni productionga deploy qilishga tayyor bo'lganingizda, uni imkon qadar samarali ishlashi uchun bir nechta muhim qadamlarni bajarishingiz mumkin. Ushbu qo'llanmada N"
order: 5
group: core
groupTitle: "Core"
---
NestJS ilovangizni productionga deploy qilishga tayyor bo'lganingizda, uni imkon qadar samarali ishlashi uchun bir nechta muhim qadamlarni bajarishingiz mumkin. Ushbu qo'llanmada NestJS ilovangizni muvaffaqiyatli deploy qilishga yordam beradigan zarur maslahatlar va eng yaxshi amaliyotlarni ko'rib chiqamiz.

#### Talablar

NestJS ilovangizni deploy qilishdan oldin quyidagilar mavjudligiga ishonch hosil qiling:

- Deploy qilishga tayyor, ishlayotgan NestJS ilovasi.
- Ilovangizni host qilish uchun deployment platforma yoki serverga kirish.
- Ilovangiz uchun zarur bo'lgan barcha environment variable'lar sozlangan.
- Database kabi kerakli servislar sozlangan va tayyor.
- Deploy platformangizda kamida Node.js LTS versiyasi o'rnatilgan.

#### Ilovangizni build qilish

NestJS ilovangizni build qilish uchun TypeScript kodingizni JavaScriptga kompilyatsiya qilishingiz kerak. Bu jarayon kompilyatsiya qilingan fayllarni o'z ichiga olgan `dist` direktoriyasini yaratadi. Ilovangizni quyidagi buyruq bilan build qilishingiz mumkin:

```bash
$ npm run build
```

Bu buyruq odatda `nest build` buyrug'ini ishga tushiradi, u TypeScript kompilyatori ustidagi wrapper bo'lib, qo'shimcha funksiyalarni (assetlarni ko'chirish va h.k.) taqdim etadi. Agar sizda custom build skripti bo'lsa, uni bevosita ishga tushirishingiz mumkin. Shuningdek, NestJS CLI mono-repo'larida build qilish uchun loyihaning nomini argument sifatida berishni unutmang (`npm run build my-app`).

Kompilyatsiya muvaffaqiyatli bo'lsa, loyihangiz rootida `dist` direktoriyasi paydo bo'ladi, kirish nuqtasi `main.js` bo'ladi. Agar loyihangiz rootida `.ts` fayllari bo'lsa (va `tsconfig.json` ularni kompilyatsiya qilishga sozlangan bo'lsa), ular ham `dist` direktoriyasiga ko'chiriladi va direktoriyalar tuzilmasi biroz o'zgaradi (`dist/main.js` o'rniga `dist/src/main.js` bo'ladi, shuni serveringizni sozlashda yodda tuting).

#### Production muhiti

Production muhiti - bu ilovangiz tashqi foydalanuvchilar uchun ochiq bo'ladigan joy. Bu AWS (EC2, ECS va h.k.), Azure, Google Cloud kabi cloud-based platforma yoki siz boshqaradigan dedicated server (masalan, Hetzner) bo'lishi mumkin.

- Scalability: Foydalanuvchilar soni oshgani sari ilovangizni oson kengaytirish.
- Security: Built-in xavfsizlik funksiyalari va compliance sertifikatlaridan foydalanish.
- Monitoring: Ilovangizning ishlashi va holatini real vaqt rejimida kuzatish.
- Reliability: Yuqori uptime kafolatlari bilan ilovangiz doimiy ishlashini ta'minlash.

Boshqa tomondan, cloud-based platformalar odatda self-hostingdan qimmatroq bo'ladi va sizda asosiy infratuzilma ustidan kamroq nazorat bo'ladi. Agar siz arzonroq yechim izlayotgan bo'lsangiz va serverni boshqarish bo'yicha texnik bilimga ega bo'lsangiz, oddiy VPS yaxshi tanlov bo'lishi mumkin, ammo server maintenance, security va backup kabi ishlarni qo'lda bajarishingizga to'g'ri keladi.

#### NODE_ENV=production

Node.js va NestJSda development va production o'rtasida texnik jihatdan farq bo'lmasa-da, production muhitida ilovani ishga tushirganda `NODE_ENV` environment variable'ini `production` ga o'rnatish yaxshi amaliyot hisoblanadi, chunki ekotizimdagi ayrim kutubxonalar bu qiymatga qarab boshqacha ishlashi mumkin (masalan, debugging outputni yoqish yoki o'chirish va h.k.).

Ilovani ishga tushirganda `NODE_ENV` environment variable'ini quyidagicha o'rnating:

```bash
$ NODE_ENV=production node dist/main.js
```

#### Ilovangizni ishga tushirish

NestJS ilovasini productionda ishga tushirish uchun quyidagi buyruqdan foydalaning:

```bash
$ node dist/main.js # Adjust this based on your entry point location
```

Bu buyruq ilovangizni ishga tushiradi va u ko'rsatilgan portni tinglaydi (odatda default `3000`). Bu port ilovangizda sozlagan portga mos kelishini tekshiring.

Muqobil ravishda, `nest start` buyrug'idan foydalanishingiz mumkin. Bu buyruq `node dist/main.js` ustidagi wrapper bo'lib, bitta muhim farqi bor: u ilovani ishga tushirishdan oldin avtomatik `nest build`ni bajaradi, shuning uchun `npm run build`ni qo'lda ishga tushirishingiz shart emas.

#### Sog'liq tekshiruvlari

Sog'liq tekshiruvlari productionda NestJS ilovasining holati va sog'ligini kuzatish uchun juda muhim. Sog'liq tekshiruvi endpointini o'rnatish orqali ilovangiz kutilganidek ishlayotganini muntazam tekshirib turishingiz va muammolar kritiklarga aylanishidan oldin javob qaytarishingiz mumkin.

NestJSda **@nestjs/terminus** paketidan foydalanib health checklarni oson implement qilishingiz mumkin, u database ulanishlari, tashqi servislar va custom checklarni qo'shish uchun qulay imkoniyatlar beradi.

NestJS ilovangizda health checklarni qanday implement qilishni bilish va ilovangiz doimo kuzatilishi hamda responsiv bo'lishini ta'minlash uchun [this guide](/docs/recipes/terminus)ga qarang.

#### Loglash

Loglash har qanday productionga tayyor ilova uchun zarur. U xatolarni kuzatishga, xatti-harakatlarni monitoring qilishga va muammolarni aniqlashga yordam beradi. NestJSda loglashni built-in logger bilan oson boshqarishingiz yoki yanada keng imkoniyatlar uchun tashqi kutubxonalardan foydalanishingiz mumkin.

Loglash bo'yicha eng yaxshi amaliyotlar:

- Xatolarni log qiling, exceptionlarni emas: Debug va muammolarni tez yechish uchun batafsil xato xabarlarini log qiling.
- Maxfiy ma'lumotlardan saqlaning: Xavfsizlikni ta'minlash uchun parollar yoki tokenlar kabi maxfiy ma'lumotlarni log qilmang.
- Correlation ID'larni ishlating: Distribyutlangan tizimlarda so'rovlarni turli servislar bo'ylab kuzatish uchun loglarga noyob identifikatorlarni (masalan, correlation ID) qo'shing.
- Log darajalaridan foydalaning: Loglarni og'irligiga qarab toifalang (masalan, `info`, `warn`, `error`) va productionda debug yoki verbose loglarni o'chirib, shovqinni kamaytiring.

Distribyutlangan ilovalar uchun ElasticSearch, Loggly yoki Datadog kabi markazlashtirilgan logging servislaridan foydalanish juda foydali bo'lishi mumkin. Bu vositalar log aggregation, qidiruv va vizualizatsiya kabi kuchli imkoniyatlarni taklif qiladi, bu ilovangizning ishlashi va xatti-harakatlarini kuzatish hamda tahlil qilishni osonlashtiradi.

#### Yuqoriga yoki tashqariga scale qilish

NestJS ilovasini samarali scale qilish trafik oshishini boshqarish va optimal ishlashni ta'minlash uchun muhim. Scalingning ikki asosiy strategiyasi bor: **vertical scaling** va **horizontal scaling**. Bu yondashuvlarni tushunish ilovangizni yuklamani samarali boshqaradigan qilib loyihalashga yordam beradi.

**Vertical scaling**, ko'pincha "scaling up" deb ataladi, bitta server resurslarini oshirish orqali ishlashni yaxshilashni anglatadi. Bu mavjud mashinangizga ko'proq CPU, RAM yoki storage qo'shishni anglatishi mumkin. Quyidagi jihatlarni hisobga oling:

- Simplicity: Vertical scaling odatda amalga oshirish jihatidan oddiy, chunki siz ko'plab instansiyalarni boshqarish o'rniga mavjud serverni yangilaysiz.
- Limitations: Bitta mashinani scale qilishning fizik cheklovlari bor. Maksimal quvvatga yetgach, boshqa variantlarni ko'rib chiqishingiz kerak.
- Cost-Effectiveness: O'rtacha trafikga ega ilovalar uchun vertical scaling tejamkor bo'lishi mumkin, chunki qo'shimcha infratuzilma talab qilinmaydi.

Misol: Agar NestJS ilovangiz virtual mashinada host qilingan bo'lsa va peak soatlarda sekinlashayotganini sezsangiz, VMni ko'proq resursga ega katta instansiyaga yangilashingiz mumkin. VMni yangilash uchun provider dashboardiga o'ting va kattaroq instance tipini tanlang.

**Horizontal scaling**, yoki "scaling out", yuklamani taqsimlash uchun ko'proq serverlar yoki instansiyalar qo'shishni anglatadi. Bu strategiya cloud muhitlarda keng qo'llaniladi va yuqori trafik kutiladigan ilovalar uchun zarur. Afzalliklar va e'tiborli jihatlar:

- Increased Capacity: Ilovangizning bir nechta instansiyalarini qo'shish orqali ishlashni pasaytirmasdan ko'proq bir vaqtdagi foydalanuvchilarga xizmat ko'rsatishingiz mumkin.
- Redundancy: Horizontal scaling redundancy beradi, chunki bitta server ishdan chiqsa ham butun ilova yiqilmaydi. Trafik qolgan serverlar orasida qayta taqsimlanadi.
- Load Balancing: Ko'plab instansiyalarni samarali boshqarish uchun Nginx yoki AWS Elastic Load Balancing kabi load balancerlardan foydalanib kiruvchi trafikni serverlar bo'ylab teng taqsimlang.

Misol: Yuqori trafikga duch kelayotgan NestJS ilovasi uchun cloud muhitda bir nechta instansiya deploy qilib, load balancer bilan so'rovlarni yo'naltirishingiz mumkin, shunda hech bir instansiya bottleneck bo'lmaydi.

Bu jarayon Docker kabi containerization texnologiyalari va Kubernetes kabi container orkestratsiya platformalari bilan oddiylashadi. Qo'shimcha ravishda, AWS Elastic Load Balancing yoki Azure Load Balancer kabi cloudga xos load balancerlardan foydalanib ilova instansiyalari bo'ylab trafikni taqsimlashingiz mumkin.

#### Yana bir nechta maslahatlar

NestJS ilovangizni deploy qilishda yodda tutishingiz kerak bo'lgan yana bir nechta maslahatlar:

- **Security**: Ilovangiz xavfsiz bo'lishi va SQL injection, XSS va h.k. kabi keng tarqalgan tahdidlardan himoyalangan bo'lishi kerak. Batafsil ma'lumot uchun "Security" kategoriyasiga qarang.
- **Do not hardcode environment variables**: API keylar, parollar yoki tokenlar kabi maxfiy ma'lumotlarni kodingizga hardcode qilmang. Bu qiymatlarni xavfsiz saqlash va ularga kirish uchun environment variable'lar yoki secrets managerdan foydalaning.
- **Backups**: Incident yuz bersa ma'lumot yo'qolmasligi uchun ma'lumotlaringizni muntazam zaxiralang.
- **Automate deployments**: Deploy jarayonini avtomatlashtirish va muhitlar bo'ylab bir xillikni ta'minlash uchun CI/CD pipeline'lardan foydalaning.
- **Rate limiting**: Abuse'ni oldini olish va ilovangizni DDoS hujumlardan himoya qilish uchun rate limitingni joriy qiling. Batafsil ma'lumot uchun [Rate limiting chapter](/docs/security/rate-limiting)ga qarang yoki AWS WAF kabi servisdan foydalaning.

#### Ilovangizni Dockerlashtirish

Docker - bu containerization yordamida ishlab chiquvchilarga ilovalarni ularning dependency'lari bilan birga container deb ataladigan standart birlikka paketlash imkonini beradigan platforma. Containerlar yengil, ko'chma va izolyatsiyalangan bo'lib, lokal developmentdan productiongacha bo'lgan turli muhitlarda ilovalarni deploy qilish uchun ideal.

NestJS ilovangizni Dockerlashtirish afzalliklari:

- Bir xillik: Docker ilovangizning har qanday mashinada bir xil ishlashini ta'minlaydi, \"menda ishlaydi\" muammosini yo'q qiladi.
- Izolyatsiya: Har bir container o'z izolyatsiyalangan muhitida ishlaydi, dependency'lar o'rtasidagi to'qnashuvlarni oldini oladi.
- Masshtablanuvchanlik: Docker bir nechta containerlarni turli mashinalar yoki cloud instansiyalar bo'ylab ishga tushirish orqali ilovangizni oson scale qilish imkonini beradi.
- Ko'chiriluvchanlik: Containerlar muhitlar o'rtasida osongina ko'chiriladi, ilovangizni turli platformalarda deploy qilishni soddalashtiradi.

Dockerni o'rnatish uchun rasmiy veb-saytdagi ko'rsatmalarga amal qiling. Docker o'rnatilgach, NestJS loyihangizda container image qurish qadamlarini belgilash uchun `Dockerfile` yarating.

`Dockerfile` - bu Docker container image'ni build qilish uchun foydalanadigan ko'rsatmalarni o'z ichiga olgan matnli fayl.

Quyida NestJS ilovasi uchun namunaviy Dockerfile:

```bash
# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
```

> info **Hint** Loyihaingizda ishlatayotgan Node.js versiyasiga mos `node:20`ni almashtirishni unutmang. Mavjud Node.js Docker image'larini rasmiy Docker Hub repozitoriyasidan topishingiz mumkin.

Bu basic Dockerfile Node.js muhitini sozlaydi, ilova dependency'larini o'rnatadi, NestJS ilovasini build qiladi va ishga tushiradi. Loyiha talablaringizga ko'ra uni moslashtirishingiz mumkin (masalan, boshqa base image'lar, build jarayonini optimallashtirish, faqat production dependency'larini o'rnatish va h.k.).

Docker image build qilayotganda Docker e'tiborsiz qoldirishi kerak bo'lgan fayl va direktoriyalarni ko'rsatish uchun `.dockerignore` faylini ham yarating. Loyiha rootida `.dockerignore` faylini yarating:

```bash
node_modules
dist
*.log
*.md
.git
```

Bu fayl keraksiz fayllar container image'ga kiritilmasligini ta'minlaydi va uni yengilroq qiladi. Endi Dockerfile tayyor bo'lgach, Docker image'ni build qilishingiz mumkin. Terminalni oching, loyiha direktoriyangizga o'ting va quyidagi buyruqni ishga tushiring:

```bash
docker build -t my-nestjs-app .
```

Ushbu buyruqda:

- `-t my-nestjs-app`: image'ga `my-nestjs-app` nomini beradi.
- `.`: joriy direktoriyani build konteksti sifatida ko'rsatadi.

Image build bo'lgach, uni container sifatida ishga tushirishingiz mumkin. Quyidagi buyruqni bajaring:

```bash
docker run -p 3000:3000 my-nestjs-app
```

Ushbu buyruqda:

- `-p 3000:3000`: host mashinangizdagi 3000 portni container ichidagi 3000 portga map qiladi.
- `my-nestjs-app`: ishga tushiriladigan image.

Endi NestJS ilovangiz Docker container ichida ishlaydi.

Agar Docker image'ni cloud providerga deploy qilish yoki boshqalar bilan bo'lishishni xohlasangiz, uni Docker registry'ga (masalan Docker Hub, AWS ECR yoki Google Container Registry) push qilishingiz kerak bo'ladi.

Registryni tanlaganingizdan so'ng, quyidagi qadamlar orqali image'ni push qilishingiz mumkin:

```bash
docker login # Log in to your Docker registry
docker tag my-nestjs-app your-dockerhub-username/my-nestjs-app # Tag your image
docker push your-dockerhub-username/my-nestjs-app # Push your image
```

`your-dockerhub-username`ni Docker Hub foydalanuvchi nomingiz yoki tegishli registry URL bilan almashtiring. Image'ni push qilgandan so'ng, uni istalgan mashinada pull qilib, container sifatida ishga tushirishingiz mumkin.

AWS, Azure va Google Cloud kabi cloud providerlar konteynerlarni keng miqyosda deploy va boshqarishni soddalashtiradigan managed container servislarini taqdim etadi. Bu servislar auto-scaling, load balancing va monitoring kabi imkoniyatlarni beradi, bu esa NestJS ilovangizni productionda ishlatishni osonlashtiradi.
