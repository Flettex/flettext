import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PERMISSIONS:
// *permissions is bitshift
// Regular Member can send messages, post media and etc
// 0x0
// MANAGE_GUILDS
//  0x1
//  1 << 0
// ADMINISTRATOR
//  0x2
//  1 << 1
// MANAGE_CHANNELS
//  0x4
//  1 << 2
// MANAGE_MESSAGES
//  0x8
//  1 << 3
// Kick and ban coming soon

async function main() {
    console.log(`Start seeding ...`)
    await prisma.$executeRaw`
      SELECT 'TEST';
    `;
    console.log(`Seeding finished.`);
}

main()
  .catch((e: any) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })