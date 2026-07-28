# L1S — Advanced URL Shortener & Link Management Platform

A modern, high-performance, and scalable URL shortening platform built with a clean separated architecture using **FastAPI** and **Next.js**.

L1S is designed for speed, scalability, and extensibility. It provides enterprise-grade URL shortening, real-time analytics, monetization, custom domains, SMS authentication, and online payment integration.

---

# ✨ Features

## 🔗 URL Management

- Ultra-fast URL shortening
- Custom aliases
- Password-protected links
- Link expiration
- Private notes
- QR Code support
- Custom domains
- Bulk link management

---

## 📊 Analytics

Track every click with detailed analytics including:

- Country
- Region
- City
- IP (hashed)
- Browser
- Operating System
- Device
- Referrer
- Crawler/Bot detection

Powered by **MaxMind GeoIP2**.

---

## 💰 Monetization

- Optional advertisement skip pages
- Revenue generation
- Queue-based click processing
- Redis Streams powered processing

---

## 🔐 Authentication & Security

- SMS OTP Authentication (SMS.ir)
- JWT Authentication
- Cloudflare Turnstile Captcha
- Password protected links
- Secret Notes encryption
- Secure IP hashing

---

## 💳 Payments

Integrated with **Zarinpal** for:

- Wallet charging
- Premium plans
- Payment verification

---

## ⚡ Performance

- Redis cache
- Redis Streams
- Async FastAPI
- Optimized redirects
- Sub-millisecond response time
- Dockerized infrastructure

---

# 🛠 Tech Stack

| Category | Technologies |
|-----------|--------------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Alembic |
| Frontend | Next.js 14 (App Router), Material UI, Framer Motion |
| Database | PostgreSQL 16 |
| Cache | Redis + Redis Streams |
| Server | Gunicorn, Uvicorn |
| Infrastructure | Docker, Docker Compose, Nginx |

---

# 📋 Prerequisites

Before running the project, make sure you have:

- Docker
- Docker Compose
- Node.js 20+
- npm
- SMS.ir account
- Zarinpal merchant account
- MaxMind GeoLite2-City.mmdb database

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/amirhd4/sh1_link_shorter.git

cd sh1_link_shorter
```

---

## 2. Configure Backend Environment

Create a `.env` file in the project root.

```env
# =========================
# Database
# =========================

POSTGRES_DB=link_shortener_db
POSTGRES_USER=amir-1sl
POSTGRES_PASSWORD=your_secure_db_password

DATABASE_URL=postgresql+asyncpg://amir-1sl:your_secure_db_password@db:5432/link_shortener_db

# =========================
# Redis
# =========================

REDIS_URL=redis://cache

# =========================
# SMS.ir
# =========================

SMS_IR_API_KEY=your_sms_ir_api_key_here
SMS_IR_VERIFY_TEMPLATE_ID=your_otp_template_id
SMS_IR_LINE_NUMBER=your_sms_line_number_here

# =========================
# Zarinpal
# =========================

ZARINPAL_MERCHANT_ID=your_zarinpal_merchant_id_here
ZARINPAL_SANDBOX_MODE=False

# =========================
# Security
# =========================

SECRET_KEY=your_secure_random_secret
ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=15

SECRET_NOTE_KEY=your_note_key

IP_HASH_SECRET=your_ip_hash_secret

# =========================
# Cloudflare Turnstile
# =========================

CT_SITE_KEY=your_site_key
CT_SECRET_KEY=your_secret_key

# =========================
# URLs
# =========================

FRONTEND_URL=http://localhost:3000

ORIGIN_BACKEND_URL=http://localhost:8000

BACKEND_URL=http://localhost:8000/api
```

---

## 3. Configure Frontend

Create:

```text
link-shortener-next/.env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000/api

NEXT_PUBLIC_BACKEND_BASE_URL_ORIGIN=http://localhost:8000

NEXT_PUBLIC_FRONT_BASE_URL_ORIGIN=http://localhost:3000

NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key

NEXT_PUBLIC_DEBUG=true

NEXT_PUBLIC_CAPTCHA=false

NEXT_PUBLIC_EITAA_SUPPORT=poshtiban1i
NEXT_PUBLIC_RUBICA_SUPPORT=poshtiiban1i
NEXT_PUBLIC_INSTAGRAM_PAGE=lis.link_shortener
NEXT_PUBLIC_TELEGRAM_PAGE=l1s_link_shortener
```

---

# 🐳 Development

## Start Infrastructure

```bash
docker-compose up --build -d
```

---

## Run Database Migrations

```bash
docker-compose exec app alembic revision --autogenerate -m "Initial migration"

docker-compose exec app alembic upgrade head
```

---

## Start Frontend

```bash
cd link-shortener-next

npm install

npm run dev
```

---

# 🌐 Local Services

| Service | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| pgAdmin | http://localhost:5050 |

---

# 🚀 Production Deployment

Build the production stack:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

The production environment includes:

- Optimized Docker images
- Reverse Proxy (Nginx)
- Automatic Let's Encrypt SSL
- Production builds
- Security hardening

---

# ⚙ Required Configuration

Before deploying to production, customize the following files.

---

## 1. Nginx Configuration

Inside:

```
nginx/
```

Update:

- Domain names
- Server blocks
- SSL certificate paths
- Reverse proxy targets

Replace every placeholder domain such as:

```
l1s.ir

a.l1s.ir
```

with your own fully qualified domain names.

---

## 2. SEO Files

Update the following files:

```
public/robots.txt

public/sitemap.xml
```

Replace all placeholder URLs with your production domain.

---

## 3. Support & Social Links

Locate the frontend components responsible for support widgets (for example `HomeClient.tsx`) and update:

- Telegram
- Instagram
- Rubika
- Eitaa

with your own official accounts.

---

# 🤝 Contributing

Contributions are always welcome.

1. Fork the repository

2. Create your feature branch

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes

```bash
git commit -m "Add AmazingFeature"
```

4. Push your branch

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

Feel free to use, modify, and distribute it according to the license terms.
