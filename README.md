# 🚀 AuraEnroll: AI-Driven Intelligent Student Lifecycle & Enrollment System

> **Aura Integrated University (AIU)**

AuraEnroll is a modern, responsive web application designed to streamline the university enrollment process. It introduces an **"AI-First"** approach to university administration. By integrating a conversational AI assistant (**Aura**), the system removes the friction of manual data entry. Students interact with the AI to provide their details, which are automatically parsed and validated against the school's regulations before final review and submission.

---

> ** Key Features & Innovations

###  Aura: Conversational AI Onboarding
- Replaces traditional forms with an intuitive chat interface.
- Extracts personal information (Name, Age, Academic History) from natural language.
- Intelligently maps structured data to the enrollment form.
- **Troll Protection / Sanity Check:** Automatically flags applications using gibberish or suspicious inputs.

###  Dedicated Portals & Dashboards
- **Student Portal:** Smart registration wizard with a dynamic landing page and client-side validation. (Mockup Design)
- **Admin Portal:** Centralized dashboard to view applicants, manage course quotas, and perform automated AI document reviews.

###  Automated Utilities
- **OCR Document Analysis:** Tesseract.js integration to analyze and parse uploaded academic records (e.g., Student Report Cards) for automated evaluation.
- **Automated Communications:** SendGrid integration handles lifecycle emails (Application Received, Admission Authorized/Declined).

---

> ** Technology Stack

- **Frontend:** React.js (Vite) + Tailwind CSS + Framer Motion
- **Backend:** Node.js (Express framework)
- **Database:** PostgreSQL (Cloud-hosted via Supabase)
- **ORM:** Prisma
- **AI / Integrations:** 
  - Google Gemini API / Groq API (LLaMA) for conversational entity extraction
  - Tesseract.js for Optical Character Recognition (OCR)
  - SendGrid API for transactional emails

---

> **System Architecture Flowchart

```mermaid
graph TD
    %% User Interactions
    Start((Applicant)) --> Visit[Visit AIU Portal]
    Visit --> Chat[Interact with Aura AI Consultant]
    Visit --> Form[Fill out Registration Form]
    
    %% Submission & Backend
    Form -->|Submit Data| API[Node.js Backend /api/register]
    
    %% AI Security Shield
    API --> SanityCheck{Aura AI Sanity Check}
    SanityCheck -->|Suspicious/Troll| Flagged[Flag as AT_RISK]
    SanityCheck -->|Valid| Clean[Proceed Normally]
    
    %% Database Transaction
    Flagged --> DB[(PostgreSQL Database)]
    Clean --> DB
    DB --> Welcome[SendGrid: Send Reception Email]
    
    %% Admin Workflow
    Admin((Administrator)) --> Dashboard[View Admin Dashboard]
    Dashboard --> FetchDB[Fetch Data via Prisma ORM]
    FetchDB --> Eval{Admin Review & OCR Evaluation}
    
    %% Outcomes
    Eval -->|Approve| ApproveRec[Update Status to APPROVED]
    Eval -->|Decline| RejectRec[Update Status to REJECTED]
    
    ApproveRec --> Quota[Check Course Quota]
    Quota -->|Capacity Available| Accept[SendGrid: Send Credentials Email]
    Quota -->|Capacity Full| Decline[SendGrid: Send Rejection Email]
    RejectRec --> Decline
```

---

## 🗄️ Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    ENROLLMENT {
        Int id PK
        String firstName
        String lastName
        String email UK
        String instEmail UK "Institutional Email"
        String phone
        String gender
        String course "Target Academic Program"
        String status "PENDING, APPROVED, REJECTED"
        String aiStatus "READY, QUALIFIED, AT_RISK, INCOMPLETE"
        Int aiScore "Fitness Score 0-100"
        String aiVerdict "AI Evaluation Justification"
        String password
        DateTime createdAt
    }

    COURSE_QUOTA {
        Int id PK
        String courseAbbr UK "e.g., BSIT, BSCRIM"
        Int maxSlots "Max capacity for the course"
        DateTime updatedAt
    }
```
*Note: The system enforces quota logic at the application level using the CourseQuota table against approved Enrollments.*

---
