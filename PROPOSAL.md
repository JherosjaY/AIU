# PROJECT PROPOSAL: AuraEnroll AI 🏛️✨
**System Name:** Aura Integrated University (AIU) Enrollment Portal
**Development Team:** Aura Integrated Software Solutions
**Group Members:**
- Rodney Carlobos
- Jheros Jay Rañola
- Justine Embudo
- John Francis Jone
- Neil Salvan

---

## 1. Executive Summary
AuraEnroll AI is a state-of-the-art academic enrollment portal designed for Aura Integrated University (AIU). The system leverages Autonomous Artificial Intelligence (Aura AI) to streamline the student onboarding process, providing a cinematic, "locked-viewport" user experience that bridges the gap between traditional manual forms and intelligent conversational data intake.

## 2. Project Objectives
- **Autonomous Data Extraction:** Implement Aura AI (via Groq Llama 3) to extract student entities from natural language chat.
- **Robust Data Integrity:** Ensure zero-loss data synchronization between the frontend and a managed PostgreSQL database.
- **Premium UX/UX:** Deliver a high-fidelity, responsive interface with cinematic animations and real-time state feedback.
- **Backend Scalability:** Utilize an Express.js & Prisma architecture for high-performance data operations.

## 3. Technology Stack (The Core) 🛠️
To ensure stability and performance, the system is built on industry-standard technologies:

- **Frontend:** React.js (Vite) + Tailwind CSS + Framer Motion (for cinematic UI).
- **Backend:** Node.js (Express.js) - Providing the high-speed API bridge.
- **Database (ORM):** Prisma 6.x - Optimized for stability and type-safe migrations.
- **Database (Managed):** Supabase (PostgreSQL) - Cloud-hosted data storage with direct SSL connection.
- **AI Engine:** Groq Cloud API (Llama-3-8b) - Delivering sub-second conversational responses and entity extraction.

## 4. Multi-Role AI Ecosystem 🚀
### 🪐 Aura AI: Student Onboarding (Candidate Sync)
A conversational interface where students chat to enroll. Aura AI detects names, courses, and contact details, automatically populating the institutional form in real-time.

### 👑 Aura Admin: Intelligence Hub (Data Analytics)
A dedicated portal for Administrators powered by Groq. Admins can perform **Conversational Analytics** to generate instant institutional reports.
- *Example:* "Aura, provide a demographic breakdown of all BSIT applicants."
- *Function:* Autonomous SQL generation and visualization via Groq Llama-3.

### 🎓 Aura Faculty: Academic Assistant (Class Core)
A specialized workspace for Faculty members to manage student progress and academic workloads.
- *Example:* "Aura, summarize the application trends for the upcoming semester."
- *Function:* AI-assisted student profiling and administrative task automation.

## 5. System Architecture
```mermaid
graph TD
    subgraph Frontend Ecosystem
    A[Student Portal] 
    F[Faculty Workspace]
    G[Admin Hub]
    end

    A & F & G -->|REST API| B[Express.js Server]
    B -->|Groq SDK| C[Aura AI Intelligence Hub]
    B -->|Prisma ORM| D[Supabase PostgreSQL]
    D -->|Persistent Data| E[Centralized Institutional Data]
```

## 6. User Workflows (Flowchart)
```mermaid
flowchart TD
    %% Base Flow
    Start([User Access]) --> Identity{User Role?}
    Identity -->|Student| StudPortal[Aura Student Portal]
    Identity -->|Admin| AdminHub[Aura Admin Hub]
    Identity -->|Faculty| FacultyApp[Aura Faculty App]

    %% Student Path
    StudPortal --> AIChat[Chat with Aura AI]
    AIChat --> Extraction[Groq extracts entities]
    Extraction --> Validation[Real-time Data Sync to UI]
    Validation --> Confirmation{User Confirms?}
    Confirmation -->|Yes| Submit[Submit Application]
    Confirmation -->|No| Modify[Modify Data via Modal] --> Submit
    Submit --> DbStore[(Supabase PostgreSQL)]

    %% Admin Path
    AdminHub --> Analytics[Query Analytics via Chat]
    Analytics --> GroqQuery[Aura generates SQL/Report]
    GroqQuery --> FetchData[(Fetch Records)]
    FetchData --> Visualize[Display Live Charts]

    %% Faculty Path
    FacultyApp --> ClassMgmt[Manage Class/Students via Chat]
    ClassMgmt --> FacultyAssist[Aura Organizes Profiles]
    FacultyAssist --> Schedule[(Db Updates)]
```

## 7. Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    ADMIN ||--o{ SYSTEM_LOGS : generates
    FACULTY ||--o{ CLASS_SECTION : manages
    CLASS_SECTION ||--o{ ENROLLMENT : contains
    
    ENROLLMENT {
        string id PK "UUID"
        string firstName
        string lastName
        string middleName
        string suffix
        string email UK
        string phone
        string birthDate
        string course
        string addressPurok
        string addressBarangay
        string addressCity
        string document
        datetime createdAt
        string cpFirstName "Emergency First Name"
        string cpLastName "Emergency Last Name"
        string cpPhone "Emergency Phone"
    }

    ADMIN {
        string id PK "UUID"
        string username UK
        string passHash
        string role
        datetime lastLogin
    }

    FACULTY {
        string id PK "UUID"
        string name
        string department
        string role
        string email UK
    }

    CLASS_SECTION {
        string id PK
        string courseCode
        string sectionName
        string schedule
        string facultyId FK
    }
```

## 8. Implementation Roadmap
1.  **Phase 1: UI Foundation** - Cinematic landing page and Registration Portal setup (Completed).
2.  **Phase 2: Brain Integration** - Groq API & Aura AI conversational logic (Completed).
3.  **Phase 3: Data Persistence** - Prisma/Supabase sync and Schema push (Completed).
4.  **Phase 4: Final Validation** - End-to-end testing and deployment (In Progress).

## 9. Data Dictionary (ERD Table)
| Entity Name | Attribute Name | Data Type | Key | Description |
| :--- | :--- | :--- | :--- | :--- |
| **ENROLLMENT** | id | string / UUID | PK | Unique identifier for the enrollment record. |
| | firstName | string | | Student's first name. |
| | lastName | string | | Student's last name. |
| | email | string | UK | Student's active email address (Unique). |
| | phone | string | | Student's contact number. |
| | course | string | | Selected academic track/course. |
| | addressBarangay | string | | Student's registered barangay. |
| | cpFirstName | string | | Emergency contact's first name. |
| | createdAt | datetime| | Timestamp of the application submission. |
| **ADMIN** | id | string / UUID | PK | Unique identifier for the admin. |
| | username | string | UK | Admin login credential. |
| | role | string | | System permissions (e.g., SuperAdmin). |
| **FACULTY** | id | string / UUID | PK | Unique identifier for the faculty member. |
| | name | string | | Faculty's full name. |
| | department | string | | Assigned department. |
| **CLASS_SECTION** | id | string | PK | Unique identifier for the section. |
| | courseCode | string | | Associated academic course code. |
| | facultyId | string / UUID | FK | Reference to the assigned Faculty. |

## 10. Process Flow Table
| Process Step | Actor/Role | Action Description | System Output / Response |
| :--- | :--- | :--- | :--- |
| **1. System Access** | Any User | Navigates to the AuraEnroll Portal. | System presents role selection (Student, Admin, Faculty). |
| **2. Conversational Intake** | Student | Chats with Aura AI providing personal and course details. | Groq AI extracts entities and auto-fills the registration form on-screen. |
| **3. Final Validation** | Student | Reviews the extracted data. Modifies details via modal if necessary. | Presents a 'Ready for Submission' state. |
| **4. Data Commitment** | Student | Clicks the "Submit Application" button. | Data is securely pushed and stored in the Supabase PostgreSQL database. |
| **5. Query Delivery** | Admin | Asks Aura AI for specific enrollment analytics or trends. | System generates underlying SQL queries mapped to the admin's prompt. |
| **6. Visualization** | Admin | Admin views the newly requested insights. | System renders cinematic live charts based on Supabase records. |
| **7. Class Profiling**| Faculty | Commands Aura to organize student profiles for a specific class. | System automatically groups and updates schedules based on AI extraction. |

---
**Status:** Institutional Server Operational at `http://localhost:5000`
**Database:** Supabase/PostgreSQL 🏛️
