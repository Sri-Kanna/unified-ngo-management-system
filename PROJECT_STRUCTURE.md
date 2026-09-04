# Project Structure - Unified NGO Management System (UNMS)

Here is the directory layout and folder organization of the UNMS monorepo workspace:

```text
unms-monorepo/
├── client/                     # Vite + React Frontend Project
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # Reusable layouts, Sidebar, Navbar
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── contexts/           # State & authentication contexts
│   │   │   ├── AuthContext.tsx
│   │   │   ├── LanguageContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── locales/            # JSON translation dictionary files
│   │   │   ├── en.json
│   │   │   └── ta.json
│   │   ├── pages/              # Module view pages
│   │   │   ├── Beneficiaries.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Donations.tsx
│   │   │   ├── Donors.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Volunteers.tsx
│   │   ├── utils/              # API and client side helpers
│   │   │   └── api.ts
│   │   ├── index.css           # Tailwind base styles and theme tokens
│   │   └── main.tsx            # React bootstrap file
│   ├── index.html              # HTML Shell index page
│   ├── package.json            # Frontend package metadata and dependencies
│   ├── postcss.config.js
│   ├── tailwind.config.js      # Styling design system rules
│   ├── tsconfig.json           # Frontend compiler options
│   └── vite.config.ts          # Build proxy server config
│
├── server/                     # Node.js + Express Backend Project
│   ├── src/
│   │   ├── config/             # DB credentials and app environment configurations
│   │   ├── db/                 # Drizzle schemas, connection client, and seeds
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── seed.ts
│   │   ├── middleware/         # Security guards and rate limiters
│   │   │   ├── auth.ts
│   │   │   └── rateLimiter.ts
│   │   ├── routes/             # REST Route controllers mapping
│   │   │   ├── auth.ts
│   │   │   ├── beneficiaries.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── donations.ts
│   │   │   ├── donors.ts
│   │   │   ├── events.ts
│   │   │   ├── inventory.ts
│   │   │   ├── reports.ts
│   │   │   └── settings.ts
│   │   ├── utils/              # Helper logs and exporters
│   │   │   └── logger.ts
│   │   └── index.ts            # Backend application entry point
│   ├── drizzle.config.ts       # Drizzle CLI connection config
│   ├── package.json            # Server package metadata
│   ├── tsconfig.json           # Server compiler settings
│   └── .env                    # Secret environment file
│
├── package.json                # Root workspaces private monorepo setup
├── pnpm-workspace.yaml         # PNPM monorepo filter scope bindings
└── README.md                   # System documentation files
```
