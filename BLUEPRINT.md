# System Blueprint - Unified NGO Management System (UNMS)

This blueprint outlines the engineering specification, architecture, and deployment strategy for the UNMS software project.

## 1. Problem Statement
Non-Governmental Organizations (NGOs) often struggle with scattered administration across separate tools:
- Beneficiary lists kept on paper or local Excel spreadsheets.
- Financial contributions tracked in manual accounting books.
- Inventory systems lack low-stock indicators, causing material shortages.
- Volunteer coordination handled via chaotic chat groups without event logs.

This results in administrative latency, security gaps, and audit complexity.

---

## 2. Objectives
- **Centralized Dashboard**: A unified control deck featuring immediate metrics (beneficiaries, donations, inventory counts, event capacities).
- **Digital Beneficiary Cards**: Automatic QR Code generation for beneficiary profiling.
- **Stock Tracking**: Barcode integrations with low-stock alerts.
- **Role-Based Access Control**: RBAC settings ensuring staff, admins, and volunteers perform within their bounds.
- **Local Language Support**: Tamil (தமிழ்) and English translation layers.
- **System Backups & Reports**: Single-click Excel/CSV compile and save functions.

---

## 3. Existing vs Proposed System

| Component | Legacy System | Proposed UNMS Monorepo |
| :--- | :--- | :--- |
| **Data Silos** | Separated spreadsheets, paper logs | Integrated relational PostgreSQL |
| **Authentication** | Shared user accounts, no audit logs | Secure JWT with role-based auth (RBAC) + Audit Trails |
| **Resource Tracking** | Manual checkouts, no stock tracking | Barcode scans + dynamic low-stock statuses |
| **Beneficiary Check** | Manual verification, prone to duplication | Digital card lookup via unique QR codes |
| **Localization** | Restricted to English interfaces | Multilingual UI (English & Tamil) |

---

## 4. System Architecture
```text
               +--------------------------------------+
               |             Client (SPA)             |
               |     Vite / React / Tailwind CSS      |
               +------------------+-------------------+
                                  |
                                  | HTTP REST (JSON / Cookies)
                                  v
               +--------------------------------------+
               |            Backend (API)             |
               |      Node.js / Express / Helmet      |
               +------------------+-------------------+
                                  |
                                  | Drizzle ORM
                                  v
               +--------------------------------------+
               |           Database Server            |
               |            PostgreSQL 18             |
               +--------------------------------------+
```

---

## 5. Development Roadmap
- **Phase 1: Foundation (Days 1-5)**: Setup Monorepo workspace, declare database schemas, configure Drizzle ORM.
- **Phase 2: Core API (Days 6-12)**: Implement authentication middleware, controllers (Beneficiaries, Donors, Donations, Events), and seed scripts.
- **Phase 3: Client Interface (Days 13-20)**: Configure glassmorphic styles, routing, i18n Tamil contexts, and graphs/charts.
- **Phase 4: Integrations (Days 21-23)**: Connect QR Codes for Beneficiaries, Barcodes for Inventory, CSV compilation, and audit logging.
- **Phase 5: Deploy & Review (Days 24-25)**: Verification compiles, testing, and generating blueprints.
