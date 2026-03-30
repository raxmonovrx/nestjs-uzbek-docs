---
title: "CI/CD integratsiyasi"
navTitle: "CI/CD integratsiyasi"
description: "CI/CD integratsiyasi Enterprise rejasidagi foydalanuvchilar uchun mavjud."
order: 1
group: devtools
groupTitle: "Devtools"
---
> info **Hint** Ushbu bob Nest Devtools'ning Nest freymvorki bilan integratsiyasini qamrab oladi. Agar siz Devtools ilovasining o'zini izlayotgan bo'lsangiz, Devtools saytiga o'ting.

CI/CD integratsiyasi **Enterprise** rejasidagi foydalanuvchilar uchun mavjud.

CI/CD integratsiyasi nima uchun va qanday yordam berishini bilish uchun ushbu videoni ko'rishingiz mumkin:

#### Graph'larni publish qilish

Avval ilovaning bootstrap fayli (`main.ts`) ni `GraphPublisher` class'idan foydalanadigan qilib sozlaymiz (`@nestjs/devtools-integration` paketidan export qilinadi - batafsil ma'lumot uchun oldingi bobga qarang):

```typescript
async function bootstrap() {
  const shouldPublishGraph = process.env.PUBLISH_GRAPH === "true";

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    preview: shouldPublishGraph,
  });

  if (shouldPublishGraph) {
    await app.init();

    const publishOptions = { ... } // NOTE: this options object will vary depending on the CI/CD provider you're using
    const graphPublisher = new GraphPublisher(app);
    await graphPublisher.publish(publishOptions);

    await app.close();
  } else {
    await app.listen(process.env.PORT ?? 3000);
  }
}
```

Ko'rib turganingizdek, bu yerda `GraphPublisher` serialized graph'ni markaziy registry'ga publish qilish uchun ishlatilmoqda. `PUBLISH_GRAPH` - graph publish qilinsinmi (CI/CD workflow), yoki yo'qmi (oddiy application bootstrap) degan qarorni boshqaruvchi custom environment variable. Bundan tashqari, bu yerda `preview` atributi ham `true` qilingan. Bu flag yoqilganda ilova preview mode'da bootstrap bo'ladi, ya'ni controller, enhancer va provider'larning constructor'lari hamda lifecycle hook'lari bajarilmaydi. Eslatma: bu **majburiy emas**, lekin jarayonni soddalashtiradi, chunki bunday holatda CI/CD pipeline ichida ilovani ishga tushirganda real database va boshqa tashqi tizimlarga ulanishingiz shart bo'lmaydi.

`publishOptions` obyekti qaysi CI/CD provider'dan foydalanayotganingizga qarab farq qiladi. Quyidagi bo'limlarda eng ommabop CI/CD provider'lar uchun yo'riqnomalarni ko'rsatamiz.

Graph muvaffaqiyatli publish qilingach, workflow oynasida quyidagiga o'xshash chiqishni ko'rasiz:

Graph har safar publish qilinganda, loyiha sahifasida yangi yozuv paydo bo'lishi kerak:

#### Hisobotlar

Devtools har bir build uchun hisobot yaratadi, ammo buning uchun markaziy registry'da mos snapshot allaqachon saqlangan bo'lishi kerak. Masalan, graph avvaldan publish qilingan `master` branch'ga qarshi PR ochsangiz, ilova farqlarni aniqlab hisobot yaratadi. Aks holda hisobot yaratilmaydi.

Hisobotlarni ko'rish uchun loyiha sahifasiga o'ting (organizations bo'limiga qarang).

Bu, ayniqsa, code review vaqtida ko'zdan chetda qolib ketishi mumkin bo'lgan o'zgarishlarni aniqlashda foydali. Masalan, kimdir **chuqur joylashgan provider** ning scope'ini o'zgartirdi deylik. Bunday o'zgarish reviewer'ga darhol sezilmasligi mumkin, ammo Devtools yordamida uni osongina ko'rib, bu ataylab qilinganini tekshirish mumkin. Yoki ma'lum bir endpoint'dan guard olib tashlansa, hisobotda bu affected sifatida ko'rinadi. Agar o'sha route uchun integration yoki e2e testlar bo'lmasa, endpoint himoyasiz qolganini o'z vaqtida sezmay qolishimiz mumkin.

Shuningdek, agar **katta codebase** ustida ishlayotgan bo'lsak va biror modulni global qilib yuborsak, graph'ga qancha edge qo'shilganini ko'ramiz. Ko'p holatlarda bu noto'g'ri yo'nalishda ketayotganimizni bildiradi.

#### Build preview

Har bir publish qilingan graph uchun vaqt bo'yicha orqaga qaytib, **Preview** tugmasi orqali uning oldingi holatini ko'rishimiz mumkin. Bundan tashqari, hisobot yaratilgan bo'lsa, graph ustidagi farqlar highlight qilingan bo'ladi:

- yashil node'lar qo'shilgan elementlarni bildiradi
- och oq node'lar yangilangan elementlarni bildiradi
- qizil node'lar o'chirilgan elementlarni bildiradi

Quyidagi skrinshotga qarang:

Orqaga qaytish imkoniyati joriy graph'ni oldingisi bilan solishtirib, muammoni tekshirish va troubleshooting qilishga yordam beradi. Sozlamalaringizga qarab, har bir pull request (hatto har bir commit ham) registry'da o'z snapshot'iga ega bo'lishi mumkin. Shu sabab orqaga qaytib, nimalar o'zgarganini osongina ko'rishingiz mumkin. Devtools'ni Git'ga o'xshatish mumkin, lekin u Nest ilovangiz graph'ini qanday qurishini tushunadi va uni **vizualizatsiya** ham qila oladi.

#### Integratsiyalar: GitHub Actions

Avval loyihangizdagi `.github/workflows` katalogida yangi GitHub workflow yarating va uni, masalan, `publish-graph.yml` deb nomlang. Fayl ichida quyidagi ta'rifdan foydalaning:

```yaml
name: Devtools

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - '*'

jobs:
  publish:
    if: github.actor!= 'dependabot[bot]'
    name: Publish graph
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Setup Environment (PR)
        if: {{ '${{' }} github.event_name == 'pull_request' {{ '}}' }}
        shell: bash
        run: |
          echo "COMMIT_SHA={{ '${{' }} github.event.pull_request.head.sha {{ '}}' }}" >>\${GITHUB_ENV}
      - name: Setup Environment (Push)
        if: {{ '${{' }} github.event_name == 'push' {{ '}}' }}
        shell: bash
        run: |
          echo "COMMIT_SHA=\${GITHUB_SHA}" >> \${GITHUB_ENV}
      - name: Publish
        run: PUBLISH_GRAPH=true npm run start
        env:
          DEVTOOLS_API_KEY: CHANGE_THIS_TO_YOUR_API_KEY
          REPOSITORY_NAME: {{ '${{' }} github.event.repository.name {{ '}}' }}
          BRANCH_NAME: {{ '${{' }} github.head_ref || github.ref_name {{ '}}' }}
          TARGET_SHA: {{ '${{' }} github.event.pull_request.base.sha {{ '}}' }}
```

Ideal holatda `DEVTOOLS_API_KEY` environment variable'i GitHub Secrets'dan olinishi kerak. Batafsil ma'lumot bu yerda.

Ushbu workflow `master` branch'ga qaragan har bir pull request uchun yoki `master` branch'ga to'g'ridan-to'g'ri commit bo'lganda ishga tushadi. Bu konfiguratsiyani loyiha ehtiyojiga qarab bemalol moslashingiz mumkin. Muhimi, `GraphPublisher` ishlashi uchun zarur environment variable'larni berishimiz kerak.

Biroq ushbu workflow'dan foydalanishni boshlashdan oldin bitta variable'ni yangilash kerak - `DEVTOOLS_API_KEY`. Loyihangiz uchun maxsus API key'ni ushbu sahifa orqali yaratishingiz mumkin.

Oxirida yana `main.ts` fayliga qaytib, oldin bo'sh qoldirgan `publishOptions` obyektini yangilang.

```typescript
const publishOptions = {
  apiKey: process.env.DEVTOOLS_API_KEY,
  repository: process.env.REPOSITORY_NAME,
  owner: process.env.GITHUB_REPOSITORY_OWNER,
  sha: process.env.COMMIT_SHA,
  target: process.env.TARGET_SHA,
  trigger: process.env.GITHUB_BASE_REF ? 'pull' : 'push',
  branch: process.env.BRANCH_NAME,
};
```

Eng yaxshi developer experience uchun loyihangizga **GitHub application** ni integratsiya qiling. Buning uchun "Integrate GitHub app" tugmasini bosing (quyidagi skrinshotga qarang). Eslatma: bu majburiy emas.

Ushbu integratsiya bilan preview/report yaratish jarayonining holatini bevosita pull request ichida ko'rasiz:

#### Integratsiyalar: GitLab Pipelines

Avval loyihangiz root katalogida yangi GitLab CI konfiguratsiya fayli yarating va uni, masalan, `.gitlab-ci.yml` deb nomlang. Fayl ichida quyidagi ta'rifdan foydalaning:

```typescript
const publishOptions = {
  apiKey: process.env.DEVTOOLS_API_KEY,
  repository: process.env.REPOSITORY_NAME,
  owner: process.env.GITHUB_REPOSITORY_OWNER,
  sha: process.env.COMMIT_SHA,
  target: process.env.TARGET_SHA,
  trigger: process.env.GITHUB_BASE_REF ? 'pull' : 'push',
  branch: process.env.BRANCH_NAME,
};
```

> info **Hint** Ideal holatda `DEVTOOLS_API_KEY` environment variable'i secrets'dan olinishi kerak.

Ushbu workflow `master` branch'ga qaragan har bir pull request uchun yoki `master` branch'ga to'g'ridan-to'g'ri commit bo'lganda ishga tushadi. Uni loyiha ehtiyojiga qarab moslashtirishingiz mumkin. Muhimi, `GraphPublisher` ishlashi uchun zarur environment variable'larni uzatishdir.

Biroq ushbu workflow ta'rifida foydalanishni boshlashdan oldin yangilanishi kerak bo'lgan bitta variable bor - `DEVTOOLS_API_KEY`. Loyihangiz uchun maxsus API key'ni mos sahifadan yaratishingiz mumkin.

Oxirida yana `main.ts` fayliga qaytib, oldin bo'sh qoldirgan `publishOptions` obyektini yangilang.

```yaml
image: node:16

stages:
  - build

cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/

workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: always
    - if: $CI_COMMIT_BRANCH == "master" && $CI_PIPELINE_SOURCE == "push"
      when: always
    - when: never

install_dependencies:
  stage: build
  script:
    - npm ci

publish_graph:
  stage: build
  needs:
    - install_dependencies
  script: npm run start
  variables:
    PUBLISH_GRAPH: 'true'
    DEVTOOLS_API_KEY: 'CHANGE_THIS_TO_YOUR_API_KEY'
```

#### Boshqa CI/CD vositalari

Nest Devtools'ning CI/CD integratsiyasidan xohlagan CI/CD vositangiz bilan foydalanishingiz mumkin (masalan, Bitbucket Pipelines, CircleCI va boshqalar). Shu sabab yuqorida ko'rsatilgan provider'lar bilan cheklanib qolmang.

Muayyan commit/build/PR uchun graph publish qilishda qanday ma'lumot kerakligini tushunish uchun quyidagi `publishOptions` konfiguratsiyasiga qarang.

```typescript
const publishOptions = {
  apiKey: process.env.DEVTOOLS_API_KEY,
  repository: process.env.CI_PROJECT_NAME,
  owner: process.env.CI_PROJECT_ROOT_NAMESPACE,
  sha: process.env.CI_COMMIT_SHA,
  target: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA,
  trigger: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA ? 'pull' : 'push',
  branch: process.env.CI_COMMIT_BRANCH ?? process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME,
};
```

Bu ma'lumotlarning ko'p qismi CI/CD'ning built-in environment variable'lari orqali beriladi (qarang: CircleCI built-in environment list va Bitbucket variables).

Graph publish qiluvchi pipeline konfiguratsiyasi uchun quyidagi trigger'lardan foydalanishni tavsiya qilamiz:

- `push` eventi - faqat joriy branch deployment muhitini ifodalasa, masalan `master`, `main`, `staging`, `production` va hokazo.
- `pull request` eventi - har doim yoki **target branch** deployment muhitini ifodalaganda (yuqoriga qarang)
