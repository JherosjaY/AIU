# 🏛️ Aura Integrated University: Institutional Enrollment Ecosystem
## Technical Architecture & Intelligence Documentation (v1.0)

Mao kini ang selyado nga documentation para sa AIU Enrollment System. Kini nga system gi-design para sa **High-Fidelity Registration**, **AI-Driven Decision Support**, ug **Automated Institutional Fulfillment**.

---

## 1. 📂 Core System Architecture
Ang system nag-operate sa usa ka Modern Full-Stack Architecture:
- **Frontend**: Vite + React (High-Performance UI/UX)
- **Backend**: Express + Node.js (Scalable API Logic)
- **Database**: PostgreSQL with Prisma ORM (Relational Data Integrity)
- **Styling**: Vanilla CSS + Tailwind (Aura Blue Identity)

---

## 2. 🧠 Intelligence Layer (The Groq Engine)
Nganong naggamit kita og **Groq AI (Llama 3.3)**?
- **Real-Time Consultation**: Ang atong AI Agent nga si **"Aura"** naggamit sa Groq para sa paspas kaayo (milisecond latency) nga tubag sa mga inquiries sa mga estudyante.
- **Decision Support System (DSS)**: Sa Admin side, ang Groq maoy nag-evaluate sa mga transcript pinaagi sa Google Vision OCR context. Iyang tabangan ang Admin sa pag-decide kung "Qualified" ba o "At Risk" ang usa ka applicant.
- **Reasoning Capabilities**: Dili lang kini usa ka chatbot; iyang nasabtan ang "Institutional Logic" sa AIU.

---

## 3. 📧 Automated Fulfillment (The SendGrid Engine)
Nganong naggamit kita og **SendGrid**?
- **Institutional Reliability**: Gigamit ang SendGrid para selyado nga mo-abot gyud ang credentials sa student inbox (No Spams).
- **Dynamic Templating**: Ang system mo-deliver og specialized templates base sa student classification:
    - **New Students**: Admission Authorization & Gateway Access.
    - **Old Students**: Residency Renewal & Continued Access.
    - **Transferees**: Academic Migration & Credit Evaluation Notice.
- **Security**: Gigamit usab kini para sa Secure Password Resets (Institutional Overrides).

---

## 4. 🛰️ Adaptive Registration Funnel
Ang atong registration gi-design isip usa ka "Hybrid Funnel":
- **Identity-First Branching**: Ang system mo-adjust sa form fields base sa student classification (New, Old, o Transferee).
- **Hybrid Scroll Logic**: 
    - **Fast-Track (Old Students)**: Solid ug fixed ang verification step para mapaspas ang re-entry.
    - **Comprehensive Fill-up (New/Transferee)**: Nag-provide og scrollable internal layout para sa dako nga data entries.
- **Institutional Compliance**: Gi-integrate ang **R.A. 10173 (Data Privacy Act of 2012)** selyado sa tibuok registration process.

---

## 5. 🏗️ Administrative Command Center
- **AI OCR Integration**: Naggamit og Google Vision API para basahon ang mga uploaded report cards.
- **Quota Management**: Ang system naay "Institutional Registry Sync" para ma-monitor kung puno na ba ang mga courses (BSIT, BSCRIM, etc.).
- **Credential Lifecycle**: Ang pag-generate sa **Institutional Email (e.g., J.DOE@AIU.EDU.PH)** ug temporary passwords direkta nga naka-integrate sa approval workflow.

---

## 6. 💎 Technical Aesthetics
Ang "Aura Blue" (`#1e40af`) mao ang atong primary institutional color. Gi-design kini para maghatag og **Prestige, Trust, ug Intelligent Identity** sa matag pixel sa system.

---
*Documentation Secured by: Aura AI Core | AIU Office of the Registrar &copy; 2026*
