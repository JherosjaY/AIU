# 🚀 Project Proposal: AuraEnroll

**Course:** Integrative Programming 1 (IP1)  
**Instructor:** Sir Gabs  
**Date:** April 30, 2026  

---

## 1. Project Title
### **AuraEnroll: AI-Driven Intelligent Student Lifecycle & Enrollment System**

## 2. Project Team (Group of 5)
1. **[Partner 1 - Project Manager/AI Integration]**
2. **[Partner 2 - Fullstack Lead / Database]**
3. **[Partner 3 - Backend/API Specialist]**
4. **[Partner 4 - Frontend & UI/UX]**
5. **[Partner 5 - Frontend & Quality Assurance]**

## 3. Executive Summary
Most enrollment systems today are labor-intensive, requiring students to fill out long, repetitive forms. **AuraEnroll** introduces an "AI-First" approach to university administration. By integrating a conversational AI assistant (**Aura**), the system removes the friction of manual data entry. Students simply interact with the AI to provide their details, which are then parsed and automatically validated against the school's regulations before the student performs a final review and submission.

## 4. Technical Stack
- **Frontend:** React.js (Vite) + Tailwind CSS + Framer Motion (for animations)
- **Backend:** Node.js (Express framework)
- **Database:** PostgreSQL
- **ORM:** Prisma (for high-level database management)
- **AI Integration:** Google Gemini API (for conversational entity extraction)

---

## 5. Key Features & Innovations

### 🤖 **Aura: Conversational AI Onboarding** (The Twist)
- Instead of traditional forms, new students are greeted by a chat interface.
- Aura extracts personal information (Name, Age, Academic History, etc.) from natural language conversation.
- Structured data is then automatically mapped to the enrollment form for student verification.

### 📅 **Intelligent Section Scheduling**
- Real-time conflict checking: The system automatically detects if a student’s chosen subjects overlap in schedule.
- Smart suggestions: If a section is full, the AI suggests the next available section or room.

### 👤 **Role-Based Advanced Dashboards**
- **Student Portal:** Track enrollment status, view grades, and download the Certificate of Registration (COR).
- **Faculty Portal:** Manage class lists and input grades via a streamlined interface.
- **Admin Portal:** Manage curricula, sections, and system-wide configurations.

### 📊 **Automated Tuition & Assessment**
- Instant computation of tuition fees based on the number of units and laboratory fees, providing a transparent breakdown of costs.

---

## 6. Database Schema Overview (Prisma)
The system will utilize a relational PostgreSQL database managed via Prisma with the following core models:
- **User:** Authentication and role management (Admin, Faculty, Student).
- **Student:** Profiles linked to academic records and enrollment history.
- **Course & Subject:** Definitions of programs and their specific subjects.
- **Section:** The relationship between subjects, instructors, rooms, and schedules.
- **Enrollment:** The transaction record linking students to their selected sections.

## 7. Implementation Timeline
- **Week 1-2:** Database Design & Backend API setup.
- **Week 3-4:** AI Integration & NLP Parsing logic.
- **Week 5-6:** Frontend Dashboard development & UI/UX Polishing.
- **Week 7:** Final Testing and Deployment.

---
**Vision:** *Bringing the power of Artificial Intelligence to campus-level administration.*
