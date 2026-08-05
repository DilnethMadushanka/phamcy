# 💊 PharmaCare - Production-Ready Pharmacy Management System

A full-stack Pharmacy Management System designed for campus health centers and retail pharmacies. Built using **Node.js, Express, PostgreSQL / SQLite (via Sequelize)** on the backend, and **React (Vite), Tailwind CSS, Lucide Icons, Chart.js** on the frontend.

---

## 🌟 Key Features

1. **Clean Light-Blue & White UI Theme**: Light blue primary branding (`#0284C7`), responsive navigation sidebar/navbar, glassmorphism cards, and subtle micro-animations.
2. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full access including User Role Management, Inventory, Categories, Suppliers, POS, and Analytics.
   - **Pharmacist**: Inventory & Category CRUD, Expiry/Stock management, POS Billing, Supplier orders, Reports.
   - **Cashier**: POS Billing Terminal & Transaction History.
3. **Inventory & Medicine Management**:
   - Mandatory **Batch Number** and **Expiry Date** tracking.
   - Visual alerts/indicators for **Low Stock** (`quantity <= threshold`) and **Near-Expiry items** (within 3 months).
   - Search by brand name, generic name, batch number, or barcode.
4. **POS & Billing Terminal**:
   - Barcode scanning & quick search grid.
   - **Category Tabs/Filters** at the top (`All`, `General Medicines`, `Skin Care`, `Dental Care`, `Beauty & Cosmetics`, `Baby Care`, `Surgical`).
   - Cart auto-calculation with discount input and payment method selection (Cash, Card, Online).
   - **Automatic Stock Deduction** upon transaction checkout.
   - **Printable / Downloadable Invoice Receipt Modal**.
5. **Suppliers & Purchase Orders**:
   - Manage supplier contacts and company details.
   - **Automated Purchase Order Generator** for medicines at or below minimum threshold.
6. **Analytics & Reports Dashboard**:
   - Interactive charts for **Daily/Monthly Revenue**.
   - **Waste & Expiry Loss Financial Audit Report**.
   - **Fast & Slow-Moving Product Velocity Analysis**.

---

## 🚀 Quick Start (Local Development)

### 1. Install & Seed Backend

```bash
cd server
npm install
npm run seed     # Automatically syncs DB tables and seeds sample data & accounts
npm run dev      # Starts Express server on http://localhost:5000
```

### 2. Install & Launch Frontend

```bash
cd client
npm install
npm run dev      # Starts React Vite dev server on http://localhost:3000
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@pharmacy.com` | `admin123` |
| **Pharmacist** | `pharmacist@pharmacy.com` | `pharm123` |
| **Cashier** | `cashier@pharmacy.com` | `cashier123` |

---

## 🐳 Docker Deployment

To run all services (PostgreSQL, Express API, Nginx React UI) in Docker:

```bash
docker-compose up --build
```

Access the UI at `http://localhost:3000` and API at `http://localhost:5000`.
