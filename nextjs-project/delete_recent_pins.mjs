import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.pin.deleteMany({
    where: {
      description: {
        contains: 'from our live collection'
      }
    }
  });
  console.log(`Deleted ${result.count} pins.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
