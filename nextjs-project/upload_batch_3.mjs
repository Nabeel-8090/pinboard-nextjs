import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
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
const ADMIN_USER_ID = '831cc380-51d2-40d3-9ffe-df85e2cfd2bf';

// Mapping folder names to tags (handling multiple tags as requested)
const FOLDER_TAGS = {
  'Yachts': ['yachts', 'boats'],
  'baots': ['boats', 'yachts'],
  'jets': ['jets', 'planes'],
  'planes': ['planes', 'jets'],
  'nature': ['nature'],
  'Paintings': ['paintings'],
  'hypercars': ['hypercars', 'cars']
};

const TITLES = {
  'Yachts': [
    "Sunseeker Predator Luxury Yacht", "Azimut Grande Masterpiece", "Lürssen Custom Superyacht",
    "Princess Yachts Y85 Sport", "Heesen Steel Class Yacht", "Benetti Classic Motoryacht",
    "Feadship Custom Build", "Oceanco Megayacht Design"
  ],
  'baots': [
    "Classic Mahogany Sailboat", "Modern High-Speed Powerboat", "Traditional Fishing Trawler",
    "Luxury Day Cruiser", "Vintage River Boat", "Coastal Explorer Vessel",
    "Catamaran Performance Hull", "Venetian Canal Gondola"
  ],
  'jets': [
    "Gulfstream G700 Business Jet", "Bombardier Global 7500", "Cessna Citation Longitude",
    "Dassault Falcon 8X Luxury", "Embraer Lineage 1000E", "Boeing Business Jet BBJ",
    "Airbus Corporate Jet ACJ", "Learjet 75 Liberty"
  ],
  'planes': [
    "Boeing 787 Dreamliner Skyline", "Airbus A350-1000 Widebody", "Vintage Spitfire Fighter",
    "Private Charter Turboprop", "Concorde Supersonic Legend", "Cessna 172 Skyhawk",
    "Lockheed Martin F-35", "Solar Powered Prototype Plane"
  ],
  'nature': [
    "Pristine Alpine Lake", "Ancient Redwood Forest Path", "Sahara Desert Sunset Dunes",
    "Tropical Waterfall Hidden Gem", "Misty Morning Valley", "Rocky Mountain Peak",
    "Amazon Rainforest Canopy", "Arctic Glacial Landscape", "Wildflower Meadow in Spring"
  ]
};

async function uploadImages() {
  try {
    const folders = fs.readdirSync(PUBLIC_DIR).filter(f => fs.lstatSync(path.join(PUBLIC_DIR, f)).isDirectory());
    
    for (const folder of folders) {
      // Only process folders we have tags for (the new ones)
      if (!FOLDER_TAGS[folder]) continue;

      const folderPath = path.join(PUBLIC_DIR, folder);
      const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f));
      
      console.log(`\n--- Processing Folder: ${folder} (${files.length} files) ---`);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(folderPath, file);
        
        let title = TITLES[folder] && TITLES[folder][i] 
          ? TITLES[folder][i] 
          : `${folder} Showcase #${i + 1}`;

        console.log(`Uploading: ${file} -> "${title}" with tags [${FOLDER_TAGS[folder]}]`);

        try {
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(filePath, {
              folder: `pinboard_v3/${folder.toLowerCase()}`,
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
              description: `A premium selection from our ${folder.toLowerCase()} collection.`,
              tags: FOLDER_TAGS[folder],
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
