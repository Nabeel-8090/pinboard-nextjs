# Deployment Document — Pinboard Next.js App

## 1. Application Overview

Pinboard is a full-stack web application where users can discover, save, and share image pins organised by categories. It supports Google and GitHub OAuth login, image uploads via Cloudinary, and a PostgreSQL database hosted on Neon.

### API Endpoints

| Method | URL | Description | Example Response |
|--------|-----|-------------|-----------------|
| GET | / | Home page with pins feed | HTML page |
| GET | /api/auth/session | Returns current auth session | {"user": {...}} |
| POST | /api/auth/signin | Sign in with OAuth provider | Redirect |
| GET | /api/pins | Fetch all pins | [{"id": 1, "title": "..."}] |
| POST | /api/pins | Create a new pin | {"id": 2, "title": "..."} |
| GET | /api/health | Health check | {"status": "ok"} |

---

## 2. Architecture Diagram

Browser (User)  
↓  
AWS EC2 (13.62.242.137)  
↓  
Docker Container (pinboard-app)  
↓  
Next.js App (port 3000)  
↓  
Neon PostgreSQL + Cloudinary + NextAuth  

---

## 3. Tools and Technologies

| Tool | Purpose |
|------|--------|
| Ubuntu | EC2 operating system |
| Node.js 20 | Runtime |
| Next.js | Full-stack framework |
| Prisma | Database ORM |
| NextAuth | Authentication |
| Cloudinary | Image storage |
| Git & GitHub | Version control |
| Docker | Containerisation |
| GitHub Actions | CI/CD automation |
| AWS EC2 | Deployment server |
| Neon | PostgreSQL database |

---

## 4. Local Setup Instructions

```bash
git clone https://github.com/Nabeel-8090/pinboard-nextjs.git
cd pinboard-nextjs/nextjs-project

# create env file
nano .env.local
```

Add your environment variables, then:

```bash
docker build -t pinboard-app .
docker run -d -p 3000:3000 --env-file .env.local pinboard-app
```

Open: http://localhost:3000

---

## 5. CI/CD Pipeline

Defined in `.github/workflows/ci.yml`

### Job 1 — Test
- install dependencies
- run lint
- validate build

### Job 2 — Deploy
- connects to EC2 via SSH
- pulls latest code
- rebuilds Docker image
- restarts container

If test fails → deploy does NOT run.

---

## 6. Deployment Steps

```bash
ssh -i ~/.ssh/pinboard_deployment.pem ubuntu@13.62.242.137

sudo apt update
sudo apt install docker.io git -y

# optional swap (important)
sudo fallocate -l 1G /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

git clone https://github.com/Nabeel-8090/pinboard-nextjs.git
cd pinboard-nextjs/nextjs-project

docker build -t pinboard-app .
docker run -d --restart=always -p 80:3000 --env-file .env.local pinboard-app
```

---

## 7. Testing Evidence

- GitHub Actions: PASS
- Docker container: RUNNING
- App accessible at: http://13.62.242.137

---

## 8. Challenges

### Disk Full
Solved using:
```bash
docker system prune -af
```

### Low RAM
Solved by adding swap memory.

### Prisma Error
Solved by adding:
```bash
RUN npx prisma generate
```
in Dockerfile.

---

## 9. Lessons Learned

- Swap memory is required on small EC2
- Docker cleanup is important
- CI/CD automates everything
- Environment variables must not be committed
- Always use restart policy in production
