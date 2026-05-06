// tests/basic.test.js

const fs = require('fs');
const path = require('path');

describe('Pinboard Application Tests', () => {

  // 🌐 ENVIRONMENT CHECKS
  test('NEXTAUTH_URL is defined', () => {
    expect(process.env.NEXTAUTH_URL).toBeDefined();
  });

  test('DATABASE_URL is defined and valid', () => {
    const dbUrl = process.env.DATABASE_URL;
    expect(dbUrl).toBeDefined();
    expect(dbUrl.startsWith('postgres')).toBe(true);
  });

  test('Authentication secret is strong', () => {
    const secret = process.env.NEXTAUTH_SECRET;
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThan(10);
  });

  test('Cloudinary config exists', () => {
    expect(process.env.CLOUDINARY_CLOUD_NAME).toBeDefined();
  });

  // 📁 FILE STRUCTURE CHECK
  test('Public folder exists', () => {
    const publicPath = path.join(process.cwd(), 'public');
    expect(fs.existsSync(publicPath)).toBe(true);
  });

  // 🚀 BASIC APP CHECK (VERY IMPORTANT)
  test('App is reachable', async () => {
    const url = process.env.NEXTAUTH_URL;

    const res = await fetch(url);
    expect(res.status).toBe(200);
  });

});