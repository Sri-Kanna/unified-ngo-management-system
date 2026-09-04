# Installation Guide - Unified NGO Management System (UNMS)

Follow these instructions to configure, initialize, and run the UNMS application on your local machine.

## Prerequisites
Before installation, ensure you have the following installed:
- **Node.js** (v18.x or higher)
- **pnpm** (Package manager, `npm install -g pnpm`)
- **PostgreSQL** database server running locally

---

## 1. Database Setup
1. Open your PostgreSQL terminal (or pgAdmin) and create a database named `unms`:
   ```sql
   CREATE DATABASE unms;
   ```
2. Note down your database port (default `5432`), user (`postgres`), and password.

---

## 2. Configuration (.env)
1. In the root directory, copy the template `.env.example` file to `/server/.env`:
   ```bash
   cp .env.example server/.env
   ```
2. Edit `/server/.env` and insert your actual database credentials:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/unms
   JWT_SECRET=your_secret_key_here
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

---

## 3. Package Installation
Install dependencies for all workspaces at once from the root folder:
```bash
pnpm install
```

If pnpm warns about ignored postinstall scripts (like `bcrypt`), run:
```bash
pnpm approve-builds
```
Select the packages and enter `y` to confirm compilation.

---

## 4. Database Seeding & Setup
Generate tables and inject mock data into PostgreSQL:
1. **Push Schema**: Creates all tables directly in the database.
   ```bash
   pnpm run db:push
   ```
2. **Seed Data**: Populates users, beneficiaries, events, inventory, and audit logs.
   ```bash
   pnpm run db:seed
   ```

---

## 5. Running the Application
You can run both dev servers simultaneously using separate terminals or using root script commands:

- **Run Server Dev (Port 5000)**:
  ```bash
  pnpm dev:server
  ```
- **Run Client Dev (Port 5173)**:
  ```bash
  pnpm dev:client
  ```

Open your browser and navigate to `http://localhost:5173` to access the application.

### Default Seed Users:
- **Admin**: `admin@unms.org` / Password: `Admin@123`
- **Staff**: `staff@unms.org` / Password: `Staff@123`
- **Volunteer**: `volunteer@unms.org` / Password: `Volunteer@123`
