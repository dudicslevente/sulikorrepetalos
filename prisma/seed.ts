import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // User 1
  const user1 = await prisma.user.upsert({
    where: { email: "kovacs.anna@example.com" },
    update: {},
    create: {
      email: "kovacs.anna@example.com",
      passwordHash,
      name: "Kovács Anna",
      description: "Sziasztok! Anna vagyok, 11. osztályos tanuló. Szívesen segítek matematikából és fizikából alsóbb éveseknek.",
      tutoringPosts: {
        create: [
          {
            title: "Korrepetálás matematikából (5-8. osztály)",
            subject: "Matematika",
            description: "Általános iskolásoknak vállalok matematika korrepetálást. Türelmes vagyok és szeretem elmagyarázni a dolgokat érthetően.",
            gradeLevel: "5-8. osztály",
            priceNote: "Ingyenes",
          },
          {
            title: "Fizika alapok",
            subject: "Fizika",
            description: "Segítek megérteni az alapvető fizikai koncepciókat 7-8. osztályosoknak.",
            gradeLevel: "7-8. osztály",
            priceNote: "Jelképes 500 Ft/óra",
          },
        ],
      },
      availabilitySlots: {
        create: [
          { dayOfWeek: 1, startTime: "15:00", endTime: "16:30", isRecurring: true },
          { dayOfWeek: 3, startTime: "16:00", endTime: "18:00", isRecurring: true },
        ],
      },
    },
  });

  // User 2
  const user2 = await prisma.user.upsert({
    where: { email: "toth.bence@example.com" },
    update: {},
    create: {
      email: "toth.bence@example.com",
      passwordHash,
      name: "Tóth Bence",
      description: "Angol és történelem a kedvenc tantárgyaim. C1-es nyelvvizsgám van angolból.",
      tutoringPosts: {
        create: [
          {
            title: "Angol beszélgetés és nyelvtan",
            subject: "Angol",
            description: "Ha szeretnéd gyakorolni az angol beszédet vagy elakadtál a nyelvtanban, keress bátran!",
            gradeLevel: "9-12. osztály",
            priceNote: "Ingyenes",
          },
        ],
      },
      availabilitySlots: {
        create: [
          { dayOfWeek: 2, startTime: "14:00", endTime: "16:00", isRecurring: true },
          { dayOfWeek: 4, startTime: "15:00", endTime: "17:00", isRecurring: true },
        ],
      },
    },
  });

  // User 3
  const user3 = await prisma.user.upsert({
    where: { email: "nagy.peter@example.com" },
    update: {},
    create: {
      email: "nagy.peter@example.com",
      passwordHash,
      name: "Nagy Péter",
      description: "Digitális kultúra érettségire készülésben tudok segíteni, főleg programozás (Python, C++) témakörben.",
      tutoringPosts: {
        create: [
          {
            title: "Digitális kultúra érettségi felkészítés",
            subject: "Digitális kultúra",
            description: "Programozási feladatok megoldása lépésről lépésre. Főleg Python és C++ érdekel.",
            gradeLevel: "11-12. osztály",
            priceNote: "1000 Ft/óra",
          },
        ],
      },
      availabilitySlots: {
        create: [
          { dayOfWeek: 5, startTime: "15:00", endTime: "18:00", isRecurring: true },
          { dayOfWeek: 6, startTime: "10:00", endTime: "12:00", isRecurring: true },
        ],
      },
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });