import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const FALLBACK_TITLES = {
  architecture: [
    "Ethereal Glass Reflection", "Symmetry in Concrete", "The Curve of Tomorrow", 
    "Shadows of the Past", "Urban Geometry", "Minimalist Structural Detail"
  ],
  bikes: [
    "Chrome & Steel", "Open Road Freedom", "The Midnight Rider", 
    "Pure Performance", "Vintage Soul", "Two-Wheeled Masterpiece"
  ],
  photography: [
    "Breathtaking Perspective", "Timeless Moment Captured", "The Heart of Nature", 
    "Urban Storytelling", "Light & Shadow Play", "Macro Nature Detail"
  ],
  cars: [
    "Precision Engineering", "Speed in Motion", "The Pinnacle of Performance", 
    "Classic Grand Tourer", "Aerodynamic Masterpiece", "Soul of the Machine", 
    "Luxury Redefined", "Street Presence", "Racing Heritage", "The Modern Legend", 
    "Elegance on Wheels", "Untamed Power", "Sculpted for Speed", "Exotic Allure", 
    "The Driver's Choice", "Iconic Silhouette", "Cutting Edge Design", "The Art of the Drive"
  ],
  'rolls royce': [
    "The Spirit of Perfection", "Elegance Unmatched", "A Legacy of Luxury"
  ],
  cafe: [
    "A Moment of Peace", "The Daily Ritual", "Warm & Inviting", 
    "Art in a Cup", "The Perfect Brew"
  ],
  calligraphy: [
    "The Flow of Ink", "Timeless Wisdom", "Script of the Soul", 
    "Art of the Written Word", "Ink & Parchment"
  ]
};

async function fixTitles() {
  try {
    const pins = await prisma.pin.findMany({
      where: {
        title: {
          contains: 'Study #'
        }
      }
    });

    console.log(`Found ${pins.length} pins with robotic titles.`);

    // Track usage per category to keep titles unique if possible
    const counters = {};

    for (const pin of pins) {
      const category = pin.tags[0] ? pin.tags[0].toLowerCase() : 'unknown';
      if (!counters[category]) counters[category] = 0;

      const pool = FALLBACK_TITLES[category] || ["Untitled Premium Masterpiece"];
      const newTitle = pool[counters[category] % pool.length];
      counters[category]++;

      console.log(`Updating: "${pin.title}" -> "${newTitle}"`);

      await prisma.pin.update({
        where: { id: pin.id },
        data: { title: newTitle }
      });
    }

    console.log('\nAll robotic titles have been updated.');
  } catch (error) {
    console.error('Error updating titles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTitles();
