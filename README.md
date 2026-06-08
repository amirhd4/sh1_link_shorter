# L1S - Advanced URL Shortener & Link Management Platform

L1S is a modern, high-performance, and scalable URL shortening platform built with a robust architecture. It features an isolated backend (FastAPI) and frontend (Next.js), leveraging advanced tools like Redis Streams for lightning-fast asynchronous click processing. It offers specialized features such as detailed geo-analytics, custom user domains, an optional ad-skipping monetization system, SMS authentication, and integrated online payment gateways.

---

## 🚀 Features

* **High-Speed URL Shortening:** Sub-millisecond redirection optimized via Redis caching.
* **In-Depth Geo-Analytics:** Track and log click analytics including country, city, region, browser, device, operating system, and crawler detection using MaxMind GeoIP.
* **SMS-Based Authentication:** Secure user signup and login utilizing one-time passwords (OTP) via SMS.ir.
* **Online Payment Gateway:** Seamless wallet top-ups and plan purchases integrated with Zarinpal.
* **Custom Domains:** Allow users to connect multiple custom domains to brand their shortened links.
* **Monetization System (Ad-Skip):** Earn revenue by showing customizable intermediary advertisement pages with click queue processing.
* **Link Security & Controls:** Support for password-protected links, expiration dates, custom aliases, and Cloudflare Turnstile captcha protection.
* **Database Management Panel:** Embedded pgAdmin interface for visual database administration in development.

---

## 🛠️ Tech Stack

* **Backend:** Python 3.11, FastAPI, SQLAlchemy, Alembic, Gunicorn, Uvicorn
* **Database & Cache:** PostgreSQL 16, Redis (Redis Streams)
* **Frontend:** Next.js 14 (App Router), Material UI (MUI), Framer Motion
* **Infrastructure:** Docker, Docker Compose, Nginx (Reverse Proxy & Let's Encrypt SSL)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed and configured:
1. **Docker** and **Docker Compose**
2. **Node.js** (v20 or higher) & **npm** (Required for local frontend development)
3. **Zarinpal Merchant Account:** To obtain a `MERCHANT_ID` for financial transactions.
4. **SMS.ir Account:** To get an `API_KEY` and `VERIFY_TEMPLATE_ID` for OTP message delivery.
5. **MaxMind GeoIP2 Database:** Download the `GeoLite2-City.mmdb` binary database file from MaxMind and place it in your specified backend directory path for geolocation lookups.

---

## 🔧 Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/amirhd4/sh1_link_shorter.git](https://github.com/amirhd4/sh1_link_shorter.git)
cd sh1_link_shorter
```

### 2. Backend Environment Configuration (.env)
Create a file named .env in the root directory of the project (right next to docker-compose.yml) and fill in your details:

# --- Database Configuration ---
POSTGRES_DB=link_shortener_db
POSTGRES_USER=amir-1sl
POSTGRES_PASSWORD=your_secure_db_password
DATABASE_URL=postgresql+asyncpg://amir-1sl:your_secure_db_password@db:5432/link_shortener_db

# --- Redis Cache Configuration ---
REDIS_URL=redis://cache

# --- SMS Gateway (SMS.ir) ---
SMS_IR_API_KEY=your_sms_ir_api_key_here
SMS_IR_VERIFY_TEMPLATE_ID=your_otp_template_id
SMS_IR_LINE_NUMBER=your_sms_line_number_here

# --- Payment Gateway (Zarinpal) ---
ZARINPAL_MERCHANT_ID=your_zarinpal_merchant_id_here
ZARINPAL_SANDBOX_MODE=False

# --- Security & JWT Config ---
SECRET_KEY=your_secure_random_jwt_secret_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
SECRET_NOTE_KEY=your_secure_note_encryption_key
IP_HASH_SECRET=your_secure_ip_hashing_salt

# --- Cloudflare Turnstile Captcha ---
CT_SITE_KEY=your_cloudflare_turnstile_site_key
CT_SECRET_KEY=your_cloudflare_turnstile_secret_key

# --- Server URLs ---
FRONTEND_URL=http://localhost:3000
ORIGIN_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000/api

### 3. Frontend Environment Configuration (link-shortener-next/.env.local)
Navigate to the link-shortener-next directory and create an .env.local file to handle client-side configurations and reverse proxy mappings:

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_BASE_URL_ORIGIN=http://localhost:8000
NEXT_PUBLIC_FRONT_BASE_URL_ORIGIN=http://localhost:3000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_CAPTCHA=false

# --- Support Handles & Social Media Integration ---
NEXT_PUBLIC_EITAA_SUPPORT=poshtiban1i
NEXT_PUBLIC_RUBICA_SUPPORT=poshtiiban1i
NEXT_PUBLIC_INSTAGRAM_PAGE=lis.link_shortener
NEXT_PUBLIC_TELEGRAM_PAGE=l1s_link_shortener



### 4. Run Core Infrastructure Services (Development)
In the project root directory, spin up your database, cache, backend container, and pgAdmin dashboard via Docker Compose:

```bash
docker-compose up --build -d
```

### 5. Apply Database Migrations (Alembic)
Once the containers are online and healthy, run the Alembic upgrade command inside the backend container to generate your tables and schema architecture:

```bash
docker-compose exec app alembic revision --autogenerate -m "Your description"
docker-compose exec app alembic upgrade head
```

### 6. Run Frontend Locally (Development)
To leverage Next.js Hot-Reloading, the frontend is run directly outside Docker during development. Open a new terminal instance and execute the following commands:

```bash
cd link-shortener-next
npm install
npm run dev
```

Frontend Web Application: Available at http://localhost:3000

Interactive Backend API Docs (Swagger UI): Available at http://localhost:8000/docs

pgAdmin Database Dashboard: Available at http://localhost:5050

### 7. Deployment (Production)
To deploy the entire production stack, including optimized production builds, security hardening, and Nginx reverse-proxies handling automated Let's Encrypt SSL certificates, execute:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```


## 📌 Required Customizations (TODO Tasks)
To make the platform run smoothly on your specific web assets, search the repository and customize the following configurations:

1. Nginx Reverse Proxy & Server Blocks:
Navigate into the nginx/ directory. Open the configuration templates and replace all placeholder instances of the default domains (l1s.ir, a.l1s.ir, etc.) with your own fully qualified domain names (FQDN). Update the Let's Encrypt certificate volume paths (/etc/letsencrypt/live/...) to point to your new domain folders.

2. SEO & Search Engines Optimization Files:
Open the files sitemap.xml and robots.txt inside the frontend public folder. Replace the default placeholder URLs with your production domain address to ensure search engine crawlers index your application perfectly.

4. Frontend Support Links & Communication Widgets:
Inspect client-side page layout components (such as HomeClient.tsx). Locate and update the predefined support widgets and contact buttons (Eitaa, Rubika, Telegram, Instagram accounts) with your own support department links.

🤝 Contributing
Contributions, bug reports, and features are highly welcome! To contribute:

1. Fork the Project repository.

2. Create your Feature Branch (git checkout -b feature/AmazingFeature).

3. Commit your Changes (git commit -m 'Add some AmazingFeature').

4. Push to the Branch (git push origin feature/AmazingFeature).

5. Open a Pull Request.

📝 License
This project is open-source and licensed under the MIT License.