import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env manually (Prisma and Cloudinary)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      const k = key.trim();
      const v = rest.join("=").trim().replace(/^["']|["']$/g, '');
      process.env[k] = v;
    }
  });
}

// Ensure other variables from .env.local are also available if needed
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      const k = key.trim();
      if (!process.env[k]) {
        const v = rest.join("=").trim().replace(/^["']|["']$/g, '');
        process.env[k] = v;
      }
    }
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const PUBLIC_DIR = path.join(__dirname, 'public');
// Directories to process
const CATEGORIES = ['architecture', 'bikes', 'buildings', 'cars', 'food', 'photography'];
const DEFAULT_USER_ID = '09388f02-806e-4e51-88a6-ed9668eb13c5'; // User 'Haad' in Neon DB

async function uploadImages() {
  try {
    console.log(`Connecting to database: ${process.env.DATABASE_URL.split('@')[1]}`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
    if (!user) {
      console.error(`User with ID ${DEFAULT_USER_ID} not found in the live database.`);
      return;
    }
    console.log(`Using user: ${user.username} (${user.id})`);

    for (const category of CATEGORIES) {
      const categoryDir = path.join(PUBLIC_DIR, category);
      if (!fs.existsSync(categoryDir)) {
        console.log(`Directory ${categoryDir} does not exist, skipping.`);
        continue;
      }

      const files = fs.readdirSync(categoryDir);
      console.log(`\n--- Processing category: ${category} (${files.length} files) ---`);

      for (const file of files) {
        const filePath = path.join(categoryDir, file);
        if (fs.lstatSync(filePath).isDirectory()) continue;

        // Image check
        if (!/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file)) continue;

        // Title generation
        const title = file.split('.')[0]
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        const fullTitle = `${category.charAt(0).toUpperCase() + category.slice(1)}: ${title}`;

        // Check for existing pin in the NEW database
        const existingPin = await prisma.pin.findFirst({
          where: {
            title: fullTitle,
            tags: { has: category }
          }
        });

        if (existingPin) {
          console.log(`Skipping ${file} - Pin already exists in live database.`);
          continue;
        }

        console.log(`Uploading ${file} to Cloudinary and live DB...`);
        
        try {
          // Upload to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(filePath, {
              folder: `pinboard_live/${category}`,
              use_filename: true,
              unique_filename: true,
            }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
          });

          // Create Pin in live Database
          await prisma.pin.create({
            data: {
              userId: DEFAULT_USER_ID,
              title: fullTitle,
              description: `A stunning image of ${category} from our live collection.`,
              tags: [category],
              imageUrl: result.secure_url,
            },
          });
          console.log(`✅ Success: ${file} -> ${result.secure_url}`);
        } catch (uploadError) {
          console.error(`❌ Error processing ${file}:`, uploadError.message || uploadError);
        }
      }
    }
  } catch (error) {
    console.error('Fatal error during upload process:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nLive database sync completed.');
  }
}

uploadImages();
