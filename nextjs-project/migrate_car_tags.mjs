import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrate() {
  try {
    const pins = await prisma.pin.findMany({
      where: {
        OR: [
          { tags: { has: 'cars' } },
          { tags: { has: '4x4' } },
          { tags: { has: 'rolls royce' } }
        ]
      }
    });

    console.log(`Found ${pins.length} pins to check for re-tagging.`);

    const hypercarKeywords = [
      'Ferrari', 'Lamborghini', 'Bugatti', 'McLaren', 'Pagani', 'Koenigsegg', 
      'Aventador', 'Huracan', 'Chiron', '720S', 'P1', 'LaFerrari', '911 Turbo', 
      '911 GT3', 'AMG GT', 'R8', 'Ford GT', 'Rimac', 'Jesko', 'Huayra'
    ];

    for (const pin of pins) {
      let updatedTags = [...pin.tags];
      let changed = false;

      // 1. All 4x4 and Rolls Royce are also Cars
      if (pin.tags.includes('4x4') && !updatedTags.includes('cars')) {
        updatedTags.push('cars');
        changed = true;
      }
      if (pin.tags.includes('rolls royce') && !updatedTags.includes('cars')) {
        updatedTags.push('cars');
        changed = true;
      }

      // 2. Identify Hypercars among Cars
      if (updatedTags.includes('cars') && !updatedTags.includes('hypercars')) {
        const isHypercar = hypercarKeywords.some(keyword => 
          pin.title.toLowerCase().includes(keyword.toLowerCase())
        );
        if (isHypercar) {
          updatedTags.push('hypercars');
          changed = true;
        }
      }

      if (changed) {
        console.log(`Updating tags for "${pin.title}": [${pin.tags}] -> [${updatedTags}]`);
        await prisma.pin.update({
          where: { id: pin.id },
          data: { tags: updatedTags }
        });
      }
    }

    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
