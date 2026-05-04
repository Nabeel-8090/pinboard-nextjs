import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      const k = key.trim();
      const v = rest.join("=").trim().replace(/^["']|["']$/g, ''); // Remove quotes
      process.env[k] = v;
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
const DEFAULT_USER_ID = '10083986-9622-439b-ae0a-5d1b4c0fc896'; // User 'robin'

async function uploadImages() {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
    if (!user) {
      console.error(`User with ID ${DEFAULT_USER_ID} not found. Please check existing users.`);
      return;
    }

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

        // Simple check for image files
        if (!/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file)) {
          console.log(`Skipping non-image file: ${file}`);
          continue;
        }

        // Generate a friendly title
        const title = file.split('.')[0]
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        const fullTitle = `${category.charAt(0).toUpperCase() + category.slice(1)}: ${title}`;

        // Check if this image (by title and category) already exists to avoid duplicates
        const existingPin = await prisma.pin.findFirst({
          where: {
            title: fullTitle,
            tags: { has: category }
          }
        });

        if (existingPin) {
          console.log(`Skipping ${file} - Pin already exists.`);
          continue;
        }

        console.log(`Uploading ${file}...`);
        
        try {
          // Upload to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(filePath, {
              folder: `pinboard/${category}`,
              use_filename: true,
              unique_filename: true,
            }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
          });

          // Create Pin in Database
          await prisma.pin.create({
            data: {
              userId: DEFAULT_USER_ID,
              title: fullTitle,
              description: `A stunning image of ${category} uploaded from the public folder.`,
              tags: [category],
              imageUrl: result.secure_url,
            },
          });
          console.log(`✅ Success: ${file} -> ${result.secure_url}`);
        } catch (uploadError) {
          console.error(`❌ Error uploading ${file}:`, uploadError.message || uploadError);
        }
      }
    }
  } catch (error) {
    console.error('Fatal error during upload process:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nUpload process completed.');
  }
}

uploadImages();
