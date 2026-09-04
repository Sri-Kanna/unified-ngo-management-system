# Database Schema - Unified NGO Management System (UNMS)

This document describes the design and mapping of the PostgreSQL database schema for the UNMS system.

## Schema Overview Diagram (ER Description)
```mermaid
erDiagram
    users ||--o{ activity_logs : "triggers"
    users ||--o{ event_participants : "registers"
    users ||--o{ volunteers : "has profile"
    donors ||--o{ donations : "contributes"
    events ||--o{ event_participants : "hosts"
    users ||--o{ reports : "generates"
    
    users {
        uuid id PK
        text name
        text email UK
        text password_hash
        text role
        timestamp created_at
        timestamp updated_at
    }
    
    beneficiaries {
        uuid id PK
        text name
        text email
        text phone
        text address
        date date_of_birth
        text gender
        text status
        text qr_code_id UK
        timestamp created_at
        timestamp updated_at
    }

    donors {
        uuid id PK
        text name
        text email UK
        text phone
        text address
        text donor_type
        timestamp created_at
        timestamp updated_at
    }

    donations {
        uuid id PK
        uuid donor_id FK
        numeric amount
        date donation_date
        text donation_type
        text description
        text status
        timestamp created_at
    }

    inventory {
        uuid id PK
        text item_name
        text category
        integer quantity
        text unit
        text barcode UK
        text location
        text status
        timestamp created_at
        timestamp updated_at
    }

    volunteers {
        uuid id PK
        uuid user_id FK
        text name
        text email UK
        text phone
        text[] skills
        text availability
        text status
        timestamp created_at
        timestamp updated_at
    }

    events {
        uuid id PK
        text title
        text description
        timestamp start_time
        timestamp end_time
        text location
        integer capacity
        text status
        timestamp created_at
        timestamp updated_at
    }

    event_participants {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        text role
        boolean attended
        timestamp registered_at
    }

    reports {
        uuid id PK
        text title
        text report_type
        text file_path
        uuid generated_by FK
        timestamp created_at
    }

    activity_logs {
        uuid id PK
        uuid user_id FK
        text action
        text target_table
        uuid target_id
        text details
        timestamp timestamp
    }
```

---

## Tables Description

### 1. `users`
Holds the login records, accounts, and system roles.
- `id` (UUID): Primary key, default `gen_random_uuid()`.
- `name` (TEXT): The display name.
- `email` (TEXT): Unique email address used as login ID.
- `password_hash` (TEXT): Hashed representation of the password using bcrypt.
- `role` (TEXT): System RBAC classification (`admin`, `staff`, `volunteer`).

### 2. `beneficiaries`
Profiles of people receiving welfare support or resources.
- `qr_code_id` (TEXT): Unique identifier embedded in their physical/digital ID cards.

### 3. `donors` & `donations`
Tracks the financial ledger and materials contributed to the NGO.
- `amount` (NUMERIC): Stores currency balances using precision decimal representation.
- `donor_id` (UUID): Foreign key linking the donation to the donor profile with CASCADE delete rules.

### 4. `inventory`
Warehouse stock levels of food, medicine, blankets, etc.
- `barcode` (TEXT): Unique barcode used to identify and audit stock.
- `quantity` (INTEGER): The amount currently in stock. Low stocks trigger system alerts.

### 5. `volunteers` & `events`
A detailed registry of volunteer availability, skills, and welfare program details.
- `event_participants` joins events with users (for volunteer or beneficiary registers) and records actual program attendance.
