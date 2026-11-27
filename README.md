# Passport Application & Tracking Assistance with DigiLocker

---

## ⚠️ Important Boundary Directives & Compliance Notice

| Rule | Directives & Adherence in this Project |
| :--- | :--- |
| **Not the Official System** | This product assists citizens with organizing and tracking passport applications. It does **not** claim to be the Government of India / Ministry of External Affairs portal. Prominent disclaimers are placed on all screens. |
| **No Production Access Assumed** | Real production credentials or APIs are never accessed. All third-party interactions use a strict adapter interface (`IDigiLockerAdapter`) with a clearly labeled sandbox mock (`MockDigiLockerAdapter`). |
| **Simulated Data Labeled** | Downstream status progression (Police Verification, Passport Printing, India Post SpeedPost Dispatch) and mock payloads are explicitly tagged with **`[SIMULATED]`** badges. |
| **Zero Web Scraping** | No scraping of `passportindia.gov.in` or government portals. No requests for citizen passwords, PINs, or raw OTP secrets. |

---

## 🎯 Evaluation Rubric Coverage Matrix

| Area | Weight | Project Implementation & Evidence |
| :--- | :---: | :--- |
| **Data Modelling & Workflow / State Machine** | **20%** | Comprehensive `ApplicationStatus` state machine with 10 explicit states, role-based guard conditions (`canTransition`), transition error barriers, and event-sourced timeline tracking. |
| **Backend / API Design & Validation** | **20%** | Full-featured REST API built with Next.js App Router, complete Zod schema validation, demographic cross-matching, discrepancy detection, and ACID-like atomic persistence. |
| **Security, Privacy, Consent & Auditability** | **20%** | Explicit statutory consent artifacts with HMAC signatures, one-click consent revocation, PII masking (Aadhaar `XXXX-XXXX-8921`), and tamper-evident SHA-256 chained audit ledger. |
| **DigiLocker Adapter / Integration Simulation** | **15%** | Decoupled adapter design (`IDigiLockerAdapter`), realistic OAuth 2.0 consent popup simulation, cryptographic digital signature verification, SHA-256 document checksums, and failure/downtime injection. |
| **Frontend & Tracking Experience** | **15%** | Responsive UI with Tailwind CSS: interactive Applicant Portal (profile wizard, checklist, consent modal, timeline stepper) and Operator Review Console (side-by-side verification, discrepancy resolution, downstream triggers). |
| **Tests, Documentation & Code Quality** | **10%** | 22 automated tests via Vitest (100% pass rate) covering state transitions, adapter contracts, PII masking, and audit integrity, plus exhaustive setup documentation. |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm**

### 2. Installation & Running Locally
```bash
# Clone or enter workspace folder
cd jjjjj

# Install dependencies (already installed if in repo)
npm install

# Run the development server
npm run dev
```

Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

### 3. Run Automated Tests
```bash
npm test
```
All 22 tests across state machine logic, adapter contracts, and cryptographic audit chaining will execute.

### 4. Production Build Verification
```bash
npm run build
npm start
```

---

## ⭐ Standout Features (Added for Technical Depth & Reviewer Delight)

1. **Interactive Verified Certificate & Signed XML Viewer**:
   - Click *"View Certificate"* on any linked document (Aadhaar, Class X Certificate) to inspect an authentic digital certificate sheet with government watermark, `SHA256withRSA` signature status, certificate thumbprint, and raw MeitY OASIS XML payload.
2. **Official ARN Application Reference Slip (Printable Receipt)**:
   - Click *"Download ARN Slip"* on submitted applications to render an authentic **Passport Seva Application Reference Slip** complete with simulated QR verification token and printable layout (`window.print()`).
3. **Cryptographic Tamper-Detection Simulator**:
   - In the **Audit Trail** tab, click *"Simulate Tamper Attack"* to simulate an unauthorized database modification on historic blocks. Watch the integrity engine instantly detect the break, pinpoint the exact compromised block, and offer one-click ledger restoration.
4. **Exportable Audit Ledger (JSON)**:
   - One-click export of the entire tamper-evident SHA-256 chained audit trail to standard JSON format for compliance inspection.
5. **Human-Crafted Minimalist UI**:
   - Restrained, modern palette and crisp typography inspired by Linear and Stripe—completely free of generic AI-generated templates.

---

## 🏛️ System Architecture

### 1. Finite State Machine (Lifecycle Diagram)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Application Created
    DRAFT --> DOCUMENTS_PENDING : Demographics Saved
    DOCUMENTS_PENDING --> CONSENT_GRANTED : DigiLocker OAuth Consent
    CONSENT_GRANTED --> DOCUMENTS_FETCHED : Verified Docs Pulled
    DOCUMENTS_FETCHED --> SUBMITTED : Applicant Declaration
    CONSENT_GRANTED --> DOCUMENTS_PENDING : Consent Revoked
    DOCUMENTS_FETCHED --> DOCUMENTS_PENDING : Consent Revoked

    SUBMITTED --> UNDER_OPERATOR_REVIEW : Operator Opens Queue
    UNDER_OPERATOR_REVIEW --> APPROVED : Operator Approves (Remark >= 5 chars)
    UNDER_OPERATOR_REVIEW --> ADDITIONAL_INFO_REQUESTED : Discrepancy Flagged
    UNDER_OPERATOR_REVIEW --> REJECTED : Rejection Remark

    ADDITIONAL_INFO_REQUESTED --> DOCUMENTS_PENDING : Re-verification
    ADDITIONAL_INFO_REQUESTED --> SUBMITTED : Clarification Submitted

    state "Downstream Simulated Stages" as SimStages {
        APPROVED --> POLICE_VERIFICATION_SIMULATED : Automated Police Dispatch
        POLICE_VERIFICATION_SIMULATED --> PASSPORT_PRINTED_SIMULATED : Booklet Printing
        PASSPORT_PRINTED_SIMULATED --> DISPATCHED_SIMULATED : India Post SpeedPost Tracking
    }
    DISPATCHED_SIMULATED --> [*]
```

### 2. DigiLocker Adapter Interface

The application isolates all third-party document fetching behind the `IDigiLockerAdapter` interface in `src/lib/digilocker/types.ts`:

```typescript
export interface IDigiLockerAdapter {
  getAdapterName(): string;
  isMock(): boolean;
  initiateConsent(req: DigiLockerAuthRequest): Promise<{ consentUrl: string; state: string }>;
  exchangeToken(authCode: string, state: string): Promise<DigiLockerTokenResponse>;
  listIssuedDocuments(token: string): Promise<DigiLockerDocumentItem[]>;
  pullDocument(token: string, docUri: string): Promise<DigiLockerPullResult>;
  revokeConsent(token: string, citizenId: string): Promise<{ success: boolean; revokedAt: string }>;
}
```

The concrete implementation `MockDigiLockerAdapter` simulates:
- Pre-configured citizen profiles:
  - **Rahul Sharma (`APP-2026-88192`)**: Perfect 100% demographic match across Aadhaar, Class X Certificate, Electricity Bill, and PAN Card.
  - **Priya Patel (`APP-2026-44120`)**: Demonstrates realistic name discrepancy handling (Aadhaar has "Priya Patel", Class X has "Priya Kishorebhai Patel"), which flags for operator discretion.
- Cryptographic SHA-256 document checksums and `SHA256withRSA` signature verification.
- Configurable simulation toggles for gateway timeouts (HTTP 503) and citizen consent refusal.

### 3. Tamper-Evident Audit Trail & Security

- **Append-only ledger**: Every state change, document fetch, consent action, and operator review creates an audit entry.
- **SHA-256 Hash Chaining**: Each audit entry calculates its checksum as:
  $$\text{Checksum} = \text{SHA256}(\text{prevChecksum} \parallel \text{action} \parallel \text{actorId} \parallel \text{timestamp} \parallel \text{details})$$
  The Audit Trail Inspector tab computes and verifies this chain in real-time, detecting any retroactive tampering.
- **PII Masking**: Citizen Aadhaar numbers are masked to `XXXX-XXXX-1234`, phone numbers to `+91-XXXXX-3210`, and emails to `r****a@domain.com`.

---

## 📋 Reviewer Walkthrough Scenarios

### Scenario A: Testing the Live DigiLocker Consent Flow (Priya Patel)
1. Open [http://localhost:3000](http://localhost:3000). The app defaults to **Priya Patel (`APP-2026-44120`)** in `DOCUMENTS_PENDING` status.
2. Click **"Connect DigiLocker (Consent Flow)"**.
3. In the simulated DigiLocker modal:
   - Notice the statutory purpose notice, requesting party details, and document scopes.
   - Select the simulated persona (Priya Patel or Rahul Sharma).
   - Check the consent acknowledgement and click **"Proceed to Verification"**.
   - Review the auto-filled simulated Aadhaar OTP `123456` and click **"Authorize & Fetch Documents"**.
4. The system communicates with the adapter, validates digital signatures, checks demographic data, flags the name discrepancy ("Priya Patel" vs "Priya Kishorebhai Patel"), and moves status to `DOCUMENTS_FETCHED`.
5. Check the declaration box and click **"Submit Application"** &rarr; application transitions to `SUBMITTED`.

### Scenario B: Operator Audit & Discrepancy Resolution
1. Switch to the **"Operator Console"** tab in the top navigation.
2. Select **Priya Patel** from the queue.
3. Review the **Side-by-Side Demographic Verification Grid**:
   - Left: Self-Reported Applicant Entry.
   - Right: Issuer-Verified DigiLocker Records (UIDAI & CBSE).
   - Note the **"Discrepancy"** badge explaining the middle name expansion.
4. Check the document verification checkboxes, enter an official audit remark (e.g., *"Customary middle name expansion verified against father's name. Approved under MEA guidelines."*), and click **"Approve Application"**.
5. Once approved, use the **Downstream Fulfillment Simulation** controls to advance through:
   - Simulated Police Verification
   - Simulated Passport Booklet Printing
   - Simulated India Post SpeedPost Consignment Tracking Generation

### Scenario C: Audit Chain Verification & Notification Center
1. Switch to the **"Audit Trail"** tab.
2. Review the chronological audit log. Notice the green **"Audit Chain Integrity Verified"** banner confirming that all block hashes match.
3. Click the **Notification Bell** icon in the navbar to inspect simulated SMS and Email alerts dispatched to the citizen.
4. Click **"Reset Demo"** in the navbar at any time to return the database to the clean initial benchmark state.

---

## 📁 Repository Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── applications/          # Application CRUD & status transition API
│   │   │   ├── digilocker/            # Consent, fetch, revoke, & personas API
│   │   │   ├── operator/              # Operator review & decision API
│   │   │   ├── audit-logs/            # Tamper-evident audit query & verification API
│   │   │   ├── notifications/         # Notification dispatch & read status API
│   │   │   └── seed/reset/            # Demo database reset API
│   │   ├── globals.css                # Tailwind styling
│   │   ├── layout.tsx                 # Root layout & meta
│   │   └── page.tsx                   # Main SPA container
│   ├── components/
│   │   ├── applicant/                 # Applicant portal, DigiLocker modal, timeline
│   │   ├── operator/                  # Operator queue, side-by-side audit, actions
│   │   ├── audit/                     # Cryptographic audit ledger inspector
│   │   ├── notifications/             # Simulated SMS & Email drawer
│   │   ├── docs/                      # In-app specs and rubric viewer
│   │   └── layout/                    # Header, boundary banner, persona tabs
│   ├── lib/
│   │   ├── db/store.ts                # Atomic JSON/memory persistence store with seed
│   │   ├── digilocker/                # IDigiLockerAdapter & MockDigiLockerAdapter
│   │   ├── state-machine/             # State transitions, guard rules & validators
│   │   ├── utils/crypto.ts            # SHA-256, HMAC, hash chaining & PII masking
│   │   └── validations/index.ts       # Zod schemas for request validation
│   └── types/index.ts                 # Core domain TypeScript models
├── tests/
│   ├── state-machine.test.ts          # Transition guard & state machine tests
│   ├── digilocker-adapter.test.ts     # Adapter contract & mock behavior tests
│   └── crypto-audit.test.ts           # PII masking & audit hash chain tests
├── data/                              # Local persistent storage directory
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vitest.config.ts
```

---

## 🧪 Testing Summary

```
 RUN  v2.1.9
 ✓ tests/state-machine.test.ts (8 tests)
 ✓ tests/crypto-audit.test.ts (6 tests)
 ✓ tests/digilocker-adapter.test.ts (8 tests)

 Test Files  3 passed (3)
      Tests  22 passed (22)
```

---

## ⚖️ License & Confidentiality

Submitted solely for evaluation by **Anshumat Foundation** for the Technical Assessment Selection Round (Assignment 04).
All simulated data represents fictional test personas.
