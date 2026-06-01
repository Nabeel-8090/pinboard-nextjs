<div align="center">

# 📌 PinBoard

**A Pinterest-inspired visual content sharing platform.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pinboard--nextjs.vercel.app-black?style=flat-square)](https://pinboard-nextjs.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Source%20Code-181717?style=flat-square&logo=github)](https://github.com/Nabeel-8090/pinboard-nextjs)

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel)

</div>

---

## ✨ Features

- Upload and share image pins with title, description, and category
- Organize pins into named boards
- Like and comment on pins
- Search and discover content by category
- Sign in with Google, GitHub, or email/password
- Fully responsive UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL + Prisma ORM (Neon) |
| Auth | NextAuth.js v4 |
| Images | Cloudinary |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

---

## 🚀 Getting Started

```bash
git clone https://github.com/Nabeel-8090/pinboard-nextjs.git
cd pinboard-nextjs
npm install
cp .env.example .env.local   # fill in your keys
npx prisma db push
npm run dev
```

### Environment Variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_ID=
GITHUB_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 👨‍💻 Team

Built as a DBMS course project by:

| Name | GitHub |
|------|--------|
| Nabeel | [@Nabeel-8090](https://github.com/Nabeel-8090) |
| Haad Majeed | [@Haad27](https://github.com/Haad27) |
| Aqib Faisal | [@aqibfaisal006](https://github.com/aqibfaisal006) |
| Aqib Ali | [@AqibElia](https://github.com/AqibElia) |

---

*This project is for academic purposes.*
