# Clinic Management & Pharmacy ERP System

A modern single-clinic operations and pharmacy billing ERP.

## Stack Overview
* **Frontend**: React 19, JavaScript, Vite, Tailwind CSS, React Router DOM, Axios, Lucide Icons.
* **Backend**: Node.js, Express.js, JavaScript, Sequelize ORM.
* **Database**: Microsoft SQL Server.
* **Security & Logs**: JWT sessions, bcrypt credentials, Winston rotated files.

---

## Installation & Setup

### 1. Prerequisites
* Install [Node.js](https://nodejs.org/) (version 18 or 20 LTS recommended).
* Set up a [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server) instance.
* Create a database named `ClinicERP`.

### 2. Environment Configurations
Create a `.env` file at the root directory of the project (refer to `.env.example` as a template):
```env
PORT=5000
NODE_ENV=development

# Database Settings
DB_HOST=localhost
DB_USER=sa
DB_PASS=YourStrongPassword123
DB_NAME=ClinicERP
DB_PORT=1433

# JWT Security
JWT_SECRET=super-secret-clinic-key-2026
JWT_EXPIRY=15m
```

### 3. Dependencies Installation
Install dependencies for both the backend and frontend separately:
```bash
# Install Backend dependencies
cd BackEnd
npm install

# Install Frontend dependencies
cd ../FrontEnd
npm install --legacy-peer-deps
```

### 4. Running the Application
Run the backend and frontend servers in separate terminal windows:

* **Backend Server**:
  ```bash
  cd BackEnd
  npm run dev
  ```
  * Express API Engine runs at `http://localhost:5000`

* **Frontend Client**:
  ```bash
  cd FrontEnd
  npm run dev
  ```
  * Vite Web Client runs at `http://localhost:5173` (or the configured Vite port)

---

## Default User Account (Development Seeding)
The system automatically creates a default administrative profile upon backend boot if the database is empty:
* **Username**: `admin`
* **Password**: `admin123`
* **Role**: `ADMIN`
