import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pins = await prisma.pin.findMany({
    where: {
      title: {
        contains: 'Study #'
      }
    },
    select: {
      id: true,
      title: true,
      tags: true
    }
  });
  
  const report = pins.reduce((acc, pin) => {
    const category = pin.tags[0] || 'Unknown';
    if (!acc[category]) acc[category] = [];
    acc[category].push(pin);
    return acc;
  }, {});

  for (const [cat, items] of Object.entries(report)) {
    console.log(`${cat}: ${items.length} pins`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
