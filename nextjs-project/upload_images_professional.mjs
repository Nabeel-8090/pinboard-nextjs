import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env and .env.local
const loadEnv = (filePath) => {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) {
        const k = key.trim();
        const v = rest.join("=").trim().replace(/^["']|["']$/g, '');
        process.env[k] = v;
      }
    });
  }
};

loadEnv(path.join(__dirname, '.env'));
loadEnv(path.join(__dirname, '.env.local'));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const PUBLIC_DIR = path.join(__dirname, 'public');
const CATEGORIES = ['architecture', 'bikes', 'buildings', 'cars', 'food', 'photography'];
const ADMIN_USER_ID = '831cc380-51d2-40d3-9ffe-df85e2cfd2bf';

const TITLES = {
  cars: [
    "Classic Red Ferrari", "Silver Mercedes-Benz AMG", "Porsche 911 Turbo S", "Lamborghini Aventador SVJ",
    "Vintage Ford Mustang", "Tesla Model S Plaid", "Audi R8 Performance", "BMW M4 Competition",
    "Chevrolet Corvette C8", "Aston Martin DB11", "Nissan GT-R Nismo", "McLaren 720S",
    "Bugatti Chiron Sport", "Rolls-Royce Phantom", "Bentley Continental GT", "Jaguar F-Type",
    "Maserati MC20", "Lotus Emira", "Dodge Challenger Hellcat", "Toyota Supra GR",
    "Shelby Cobra Classic", "Range Rover Autobiography", "Mercedes G-Wagon", "Cadillac Escalade-V"
  ],
  architecture: [
    "Modern Glass Skyscraper", "Brutalist Concrete Design", "Gothic Cathedral Spire", "Minimalist Luxury Villa",
    "Contemporary Museum Wing", "Historic Town Hall Detail", "Futuristic City Bridge", "Industrial Loft Exterior",
    "Sustainable Eco-Building", "Art Deco Plaza", "Traditional Pagoda Roof", "Scandinavian Home Design",
    "Metropolitan Opera House", "Victorian Terrace House", "Modern Library Atrium", "Geometric Steel Structure"
  ],
  bikes: [
    "Custom Cafe Racer", "Harley-Davidson Fat Boy", "Ducati Panigale V4", "Vintage Triumph Bonneville",
    "Professional Road Cycle", "Mountain Trail Explorer", "Urban Commuter E-Bike", "Classic Vespa Scooter",
    "BMW S1000RR Superbike", "Kawasaki Ninja ZX-10R", "Indian Scout Bobber", "Royal Enfield Interceptor",
    "Fixed Gear City Bike", "Off-Road Enduro Bike", "Adventure Touring Motorcycle"
  ],
  buildings: [
    "Sunset Over the City Skyline", "Downtown Financial District", "Old World European Street", "Modern Residential Complex",
    "Illuminated Night Clock Tower", "Reflective Glass Office Park", "Classic Brick Warehouse", "Waterfront Promenade",
    "Iconic Monument Plaza", "Grand Central Station Detail", "Coastal Lighthouse Tower", "Central Park View Apartment"
  ],
  food: [
    "Gourmet Wagyu Steak", "Artisanal Sourdough Bread", "Fresh Mediterranean Salad", "Handmade Italian Pasta",
    "Decadent Chocolate Soufflé", "Exotic Sushi Platter", "Morning Espresso & Pastry", "Colorful Summer Fruit Bowl",
    "Farm-to-Table Roast Vegetables", "Classic French Macarons", "Signature Craft Cocktail", "Spiced Indian Curry"
  ],
  photography: [
    "Golden Hour Mountain Peaks", "Serene Forest Pathway", "Crashing Ocean Waves", "Milky Way Galaxy View",
    "Macro Dew Drop on Leaf", "Candid Street Portrait", "Minimalist Desert Dunes", "Vibrant Sunset Horizon",
    "Mist-Covered Valley", "Northern Lights Over Tundra", "Abstract Architectural Detail", "Wildlife in the Wild"
  ]
};

async function uploadImages() {
  try {
    const admin = await prisma.user.findUnique({ where: { id: ADMIN_USER_ID } });
    if (!admin) {
      console.error(`Admin user not found. Using the first user instead.`);
      return;
    }
    console.log(`Uploading as: ${admin.username}`);

    for (const category of CATEGORIES) {
      const categoryDir = path.join(PUBLIC_DIR, category);
      if (!fs.existsSync(categoryDir)) continue;

      const files = fs.readdirSync(categoryDir).filter(f => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f));
      console.log(`\n--- ${category.toUpperCase()} (${files.length} files) ---`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(categoryDir, file);
        
        // Pick a title from the list, or generate one if list is shorter
        let title = TITLES[category] && TITLES[category][i] 
          ? TITLES[category][i] 
          : `${category.charAt(0).toUpperCase() + category.slice(1)} Study #${i + 1}`;

        console.log(`Processing: ${file} -> "${title}"`);

        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(filePath, {
              folder: `pinboard_v2/${category}`,
              use_filename: true,
              unique_filename: true,
            }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
          });

          await prisma.pin.create({
            data: {
              userId: ADMIN_USER_ID,
              title: title,
              description: `A professional ${category} showcase. Part of our curated premium collection.`,
              tags: [category],
              imageUrl: result.secure_url,
            },
          });
          console.log(`✅ Success: ${title}`);
        } catch (err) {
          console.error(`❌ Error: ${file}`, err.message || err);
        }
      }
    }
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

uploadImages();
