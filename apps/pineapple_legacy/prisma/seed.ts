import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e: any) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
});

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
    const user = await prisma.user.create({
      select: {
        id: true
      },
      data: {
        username: "a",
        email: "bruh@gmail.com",
        password: "1234",
        avatarUrl: "1"
      }
    });
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        username: "b",
        avatarUrl: null,
        password: undefined
      }
    });
    await prisma.user.delete({
      where: {
        id: user.id
      }
    });
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