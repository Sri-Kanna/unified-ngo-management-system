# API Reference - Unified NGO Management System (UNMS)

All REST API endpoints are prefixed with `/api` and expect JSON payloads.

---

## 1. Authentication (`/api/auth`)

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "email": "admin@unms.org",
    "password": "Admin@123"
  }
  ```
- **Response**: Sets HttpOnly `token` cookie and returns:
  ```json
  {
    "token": "JWT_TOKEN_STRING",
    "user": {
      "id": "USER_UUID",
      "name": "Admin User",
      "email": "admin@unms.org",
      "role": "admin"
    }
  }
  ```

### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Headers**: `Cookie: token=JWT_TOKEN` or `Authorization: Bearer JWT_TOKEN`
- **Response**: Clears `token` cookie and returns:
  ```json
  { "message": "Logged out successfully" }
  ```

### Get Session Profile
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "user": {
      "id": "USER_UUID",
      "name": "Admin User",
      "email": "admin@unms.org",
      "role": "admin"
    }
  }
  ```

---

## 2. Dashboard (`/api/dashboard`)

### Get Dashboard Stats
- **URL**: `/api/dashboard/stats`
- **Method**: `GET`
- **Response**: Returns card counts, monthly donation values, resource lists, and upcoming events.

### Get Recent Activity
- **URL**: `/api/dashboard/recent-activity`
- **Method**: `GET`
- **Response**: Array of recent system actions.

---

## 3. Beneficiary Management (`/api/beneficiaries`)
- **GET `/`**: Retrieve all beneficiaries.
- **GET `/:id`**: Retrieve a single beneficiary profile.
- **POST `/`** (Admin/Staff only): Create beneficiary. Generates `qrCodeId` if omitted.
- **PUT `/:id`** (Admin/Staff only): Update beneficiary.
- **DELETE `/:id`** (Admin only): Delete beneficiary.

---

## 4. Donors & Donations (`/api/donors` & `/api/donations`)
- **GET `/api/donors`**: List donors.
- **POST `/api/donors`**: Add donor profile.
- **GET `/api/donations`**: List donation records (includes inner join with donor details).
- **POST `/api/donations`**: Add donation transaction details.

---

## 5. Inventory Management (`/api/inventory`)
- **GET `/`**: List inventory.
- **POST `/`**: Add item. Auto-tags status as `low-stock` or `out-of-stock` based on count levels.
- **PUT `/:id`**: Update quantities.

---

## 6. Events & Attendance (`/api/events`)
- **GET `/`**: List events.
- **POST `/`**: Schedule event.
- **GET `/:id/participants`**: List registered attendees.
- **POST `/:id/register`**: Register a volunteer/beneficiary to the event.
- **POST `/:id/attendance`**: Mark attendance:
  - **Payload**: `{ "participantId": "UUID", "attended": true }`

---

## 7. Reports Generator (`/api/reports`)
- **GET `/`**: List reports.
- **POST `/generate`**: Compile database tables and generate a static CSV file.
  - **Payload**:
    ```json
    {
      "title": "Annual Donor Report",
      "reportType": "donation"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "REPORT_UUID",
      "title": "Annual Donor Report",
      "reportType": "donation",
      "filePath": "/public/reports/donation_report_123456.csv",
      "createdAt": "2026-06-26T14:00:00Z"
    }
    ```
