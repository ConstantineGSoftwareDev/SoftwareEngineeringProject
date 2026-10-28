# OpenFest - Outdoor Event Planning & Management Platform

OpenFest is a full-stack outdoor event planning, discovery, registration, and management application.

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, pnpm
- **Backend**: Spring Boot, Spring Data JPA, Spring Security, PostgreSQL
- **Testing**: JUnit, Mockito

---

## Getting Started: Build & Run Instructions

### Prerequisites
- **Java**: JDK 21+
- **Node.js**: v18.18+ & **pnpm**: v8+ ([Installation Guide](https://pnpm.io/installation))
- **PostgreSQL**: Running locally on port `5432` with a database named `openfest`

---

### 1. Database Setup

Create the database in PostgreSQL:
```sql
CREATE DATABASE openfest;
```

Set your database password environment variable:

- **Windows (PowerShell):**
  ```powershell
  $env:DB_PASSWORD = "your-postgres-password"
  ```
- **macOS / Linux (Bash):**
  ```bash
  export DB_PASSWORD="your-postgres-password"
  ```

---

### 2. Backend Setup (Spring Boot)

From the root directory, navigate to `Openfest`:
```bash
cd Openfest
```

- **Compile:**
  ```bash
  # Windows
  .\mvnw.cmd compile

  # macOS / Linux
  ./mvnw compile
  ```

- **Run Tests:**
  ```bash
  # Windows
  .\mvnw.cmd test

  # macOS / Linux
  ./mvnw test
  ```

- **Run Application:**
  ```bash
  # Windows
  .\mvnw.cmd spring-boot:run

  # macOS / Linux
  ./mvnw spring-boot:run
  ```
The backend server runs at `http://localhost:8080`.

---

### 3. Frontend Setup (Next.js)

In a separate terminal, navigate to `frontend`:
```bash
cd frontend
```

- **Configure Environment:**
  Create `.env.local` (or copy from `.env.example`):
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8080
  INTERNAL_API_URL=http://localhost:8080
  ```

- **Install Dependencies:**
  ```bash
  pnpm install
  ```

- **Run Development Server:**
  ```bash
  pnpm dev
  ```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Build for Production:**
  ```bash
  pnpm build
  ```

---

## Features Implemented

- **User Authentication & Access Restriction (US-09)**: Registration (`/register`), login (`/login`) with BCrypt password hashing, session cookies (`JSESSIONID`), CSRF tokens, and dashboard route protection.
- **Event Creation (US-04)**: Form (`/events/create`) to configure title, venue, capacity, age restriction, ticket pricing, and save as draft or publish.
- **Creator Dashboard (US-04)**: Dashboard (`/dashboard`) with event counters, search and filter tabs, in-place edit modal, and quick status actions ("Close Sign-ups", "Reopen", "Publish").

---
