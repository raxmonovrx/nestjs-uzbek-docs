---
title: "Platformadan mustaqillik"
navTitle: "Platformadan mustaqillik"
description: "Nest platformadan mustaqil freymvork. Bu shuni anglatadiki, turli turdagi ilovalarda foydalanish mumkin bo'lgan qayta ishlatiladigan mantiqiy qismlarni ishlab chiqishingiz mumkin. "
order: 10
group: fundamentals
groupTitle: "Fundamentals"
---
Nest platformadan mustaqil freymvork. Bu shuni anglatadiki, turli turdagi ilovalarda foydalanish mumkin bo'lgan **qayta ishlatiladigan mantiqiy qismlar**ni ishlab chiqishingiz mumkin. Masalan, aksariyat komponentlar turli underlying HTTP server freymvorklari (masalan, Express va Fastify) bo'ylab, shuningdek turli _turdagi_ ilovalar (masalan, HTTP server freymvorklari, turli transport qatlamlariga ega Microservices va Web Sockets) bo'ylab o'zgartirishsiz qayta ishlatilishi mumkin.

#### Bir marta yarating, hamma joyda ishlating

Hujjatlarning **Overview** bo'limi asosan HTTP server freymvorklaridan foydalanadigan kodlash texnikalarini ko'rsatadi (masalan, REST API taqdim etadigan yoki MVC uslubidagi server-side rendered ilovalar). Biroq, bu qurilish bloklarining barchasi turli transport qatlamlari ([microservices](/docs/microservices/basics) yoki [websockets](/docs/websockets/gateways)) ustida ham ishlatilishi mumkin.

Bundan tashqari, Nest maxsus [GraphQL](/docs/graphql/quick-start) modulini taqdim etadi. API qatlamingiz sifatida GraphQLni REST API taqdim etish bilan bir xil tarzda ishlatishingiz mumkin.

Shuningdek, [application context](/docs/core/application-context) imkoniyati Nest ustida CRON joblar va CLI ilovalar kabi har qanday Node.js ilovasini yaratishga yordam beradi.

Nest Node.js ilovalari uchun to'liq platforma bo'lishni maqsad qiladi; bu ilovalaringizga yuqori darajadagi modullik va qayta foydalanish imkoniyatini olib keladi. Bir marta yarating, hamma joyda ishlating!
