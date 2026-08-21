# PayGuard AI — Revenue Recovery & Failure Analysis Platform for Razorpay Merchants

> **Detect → Classify → Prioritize → Recover**

PayGuard AI is an enterprise-grade payment failure intelligence and revenue recovery platform built for Razorpay merchants. It ingests failed transaction streams, classifies payment failures into 9 deterministic categories, calculates recovery probability scores, automates multi-channel recovery campaigns (Razorpay Payment Links + Brevo Email Engine), handles merchant bank gateway failover routes, and tracks recovered revenue via idempotent webhooks.

---

## 🎯 Problem Solved

Every day, online merchants lose **10% to 25% of potential revenue** due to payment failures. Most payment drop-offs are not actual rejections—they are transient failures:
- **Bank / UPI Server Peak Load Timeouts** (e.g., 7 PM - 9 PM NPCI PSP load spikes).
- **Merchant Gateway Route Failures** (Merchant bank account downtime or API rate limits).
- **Customer Window Drop-Offs & OTP Timeouts** (Customer abandoned transaction without attempt).
- **Transient Insufficient Funds / Card Limit Drop-Offs**.

**PayGuard AI solves this by transforming uncollected revenue into automated, high-converting recovery campaigns without spamming customers or relying on manual intervention.**

---

## 🏗️ Architecture & Component Flow

```
                  ┌────────────────────────────────────────┐
                  │       Razorpay Transaction Stream      │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │    Failure Classification Engine       │
                  │   (9 Categories + AI Reasoning)       │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │   Customer Recovery Scoring Model      │
                  │   (0 - 100% Probability Algorithm)     │
                  └───────────────────┬────────────────────┘
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
┌──────────────────────────────┐                       ┌──────────────────────────────┐
│  Failure Analysis Center     │                       │  Merchant Bank Failover      │
│  - Category Intelligence     │                       │  - Primary Gateway Route     │
│  - Segmented Customer Lists  │                       │  - Secondary HDFC Route      │
│  - Custom Recovery Links     │                       │  - Alternate UPI Link        │
└──────────────┬───────────────┘                       └──────────────┬───────────────┘
               │                                                      │
               └──────────────────────────┬───────────────────────────┘
                                          │
                                          ▼
                  ┌────────────────────────────────────────┐
                  │  Bulk Campaign & Background Scheduler  │
                  │  - 1-Hour Failure Retry Rule           │
                  │  - Brevo Email Service Integration    │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │    Razorpay Webhook Auto-Reconciler    │
                  │  - payment_link.paid / payment.captured│
                  │  - Idempotent Database Reconciliation │
                  └────────────────────────────────────────┘
```

---

## ⚡ Key Features

### 1. 📊 9-Category Failure Classification Engine
Automated, deterministic grouping of all payment failures:
1. `MERCHANT_SIDE`: Merchant bank account downtime / gateway route issue.
2. `CUSTOMER_SIDE`: Customer cancelled or abandoned payment window.
3. `BANK_OR_UPI`: NPCI / Bank PSP server timeout (7 PM - 9 PM peak hours).
4. `PAYMENT_METHOD`: Expired card, disabled netbanking channel.
5. `AUTHENTICATION`: 3D Secure / OTP verification failed.
6. `INSUFFICIENT_FUNDS`: Account balance or credit limit exceeded.
7. `NETWORK_OR_TIMEOUT`: Connection timeout / network dropped.
8. `PAYMENT_ABANDONED`: Checkout window closed before attempt.
9. `UNKNOWN`: Unclassified / generic failure.

---

### 2. 🏦 Merchant Bank Account Failover Route
When merchant gateway downtime is detected (`MERCHANT_SIDE` failure):
- **Primary Gateway Account**: Standard merchant account.
- **Secondary Backup Route**: Automatically routes payment recovery links through merchant's secondary account (e.g. HDFC Secondary Merchant Account) or custom UPI payment link for the **exact customer payment amount**.

---

### 3. ⏱️ Strict 1-Hour Failure Retry Rule & Background Scheduler
- For customer-side failures, retries are scheduled **strictly from the original payment failure timestamp**:
  $$\text{scheduledFor} = \text{failureOccurredAt} + 1\text{ hour}$$
- Background polling service monitors the `ScheduledRecovery` queue and triggers transactional emails automatically when due.
- Accelerated delay (+2 Mins) supported in `DEMO_MODE=true`.

---

### 4. ✉️ Brevo Email Engine & Custom Merchant Links
- Integrated transactional email system (via Brevo REST API).
- Supports merchant-provided **Custom Recovery Links** (`https://yourstore.com/checkout/retry`) or per-customer auto-generated Razorpay links (`https://rzp.io/i/...`).
- Safe simulation mode when `BREVO_API_KEY` is not provided.

---

### 5. 🤖 Google Gemini AI Copilot (`gemini-2.5-flash`)
- Interactive AI chat assistant with **strict analytics tool allowlist**:
  - `getPaymentSummary()`
  - `getFailureBreakdown()`
  - `getRevenueAtRisk()`
  - `getTopRecoverablePayments()`
  - `getPaymentTrend()`
  - `getCustomerHistory()`
- Gemini cannot execute raw database queries, ensuring deterministic and safe execution.

---

### 6. 📈 Time-Bucketed Recovery Analytics (`/recovery`)
- Filter recovery performance by time ranges:
  - **Today (Last 24 Hours)**
  - **Last 7 Days**
  - **Last 30 Days**
  - **All Time History**
- Real-time recovered revenue calculations and webhook reconciliation log.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React Icons, Axios, React Router v6.
- **Backend**: Node.js, Express.js, Mongoose ODM, Razorpay SDK, Brevo API, `@google/genai` (Gemini 2.5 Flash).
- **Database**: MongoDB (Mongoose Schema) with `mongodb-memory-server` in `DEMO_MODE=true`.

---

## 🚀 Quick Setup & Run Instructions

### 1. Install Dependencies

```bash
# Install root, client, and server dependencies
cd server && npm install
cd ../client && npm install
```

### 2. Environment Configuration

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/payguard
DEMO_MODE=true
JWT_SECRET=payguard_ai_secret_key_2026_super_secure
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=payguard_webhook_secret_99
BREVO_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Seed Demo Dataset (~750 Payments / 300 Failures)

```bash
cd server
npm run seed
```

### 4. Run Development Servers

Backend (Port 5000):
```bash
cd server
npm run dev
```

Frontend (Port 5173):
```bash
cd client
npm run dev
```

Open application: `http://localhost:5173`

---

## 📡 Key API Routes

- `GET /api/analysis/overview` - Aggregated 9-category failure cards
- `GET /api/analysis/category/:category/customers` - Category customer list
- `POST /api/recovery-campaigns/create` - Trigger bulk email recovery campaign
- `POST /api/recovery/payment-link` - Generate Razorpay Payment Link
- `POST /api/webhooks/razorpay` - Idempotent webhook receiver
- `POST /api/ai/copilot` - Gemini AI Copilot with tool allowlist

---

## 🔒 License & Ownership

Developed for **Razorpay Merchant Revenue Recovery**.
All rights reserved © 2026 PayGuard AI.
