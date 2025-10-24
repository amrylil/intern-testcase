# 🧠 Intern Test Case — NestJS API

Project ini merupakan implementasi Backend Test Case menggunakan NestJS, dengan fokus pada arsitektur modular dan clean untuk menjaga skalabilitas dan kemudahan maintenance.

---

## 🧱 Arsitektur & Design Pattern

Saya menggunakan kombinasi **Layered Architecture** dan **Clean Architecture principles**, yang sudah menjadi pendekatan yang saya pahami dan biasa saya gunakan dalam proyek backend. NestJS secara default sudah memiliki struktur **Modular Architecture**, yang sejalan dengan konsep layered pattern karena setiap module memiliki layer yang jelas seperti Controller (presentation layer), Service (business logic layer), dan Repository/Entity (data access layer).

### Dengan struktur ini:

- Setiap module terpisah dan dapat dikembangkan secara independen (misalnya `auth`, `users`, `posts`)
- Business logic tidak bercampur dengan controller
- Dependensi diatur melalui Dependency Injection, membuat kode lebih modular dan mudah diuji
- DTO (Data Transfer Object) digunakan untuk validasi dan keamanan data yang masuk/keluar API

### Saya memilih pattern ini karena:

✅ Sudah terbiasa menggunakan layered & clean architecture di berbagai project  
✅ Struktur bawaan NestJS yang modular dan clean sangat cocok dengan pola tersebut  
✅ Memudahkan pengembangan, testing, serta ekspansi ke skala besar atau microservice di masa depan

---

## ⚙️ Fitur Utama

- Autentikasi menggunakan JWT (Login, Profile)
- CRUD `User` dan `Post` yang saling berelasi
- Middleware & Guard untuk proteksi endpoint
- E2E Testing menggunakan Jest + Supertest

---

## 🗄️ Database Schema

Project ini menggunakan PostgreSQL dengan 3 tabel utama:

- **users** - Menyimpan data pengguna
- **user_sessions** - Menyimpan sesi login dan refresh token
- **posts** - Menyimpan data postingan yang berelasi dengan users

---

## 🚀 Cara Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/username/intern-test-case.git
cd intern-test-case
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Kemudian sesuaikan konfigurasi database dan JWT secret di file `.env`:

```properties
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=intern_testcase

PORT=3000
BASE_URL=http://localhost:3000

JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

JWT_EXPIRATION_TIME="15m"
JWT_REFRESH_EXPIRATION_TIME="7d"
```

### 4. Setup Database

Pastikan PostgreSQL sudah terinstall dan running, kemudian buat database:

```sql
CREATE DATABASE intern_testcase;
```

### 5. Run Development Server

```bash
npm run start:dev
```

Server akan berjalan di `http://localhost:3000`

---

## 🧪 Testing Token API

Untuk menjalankan End-to-End Testing (termasuk pengujian token JWT):

```bash
npm run test:e2e
```

---

## 🧩 Stack

**NestJS** • **TypeORM** • **PostgreSQL** • **JWT** • **Jest** • **Supertest**
