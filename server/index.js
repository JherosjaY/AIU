const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Groq = require('groq-sdk');
const sgMail = require('@sendgrid/mail');
// Google Vision API is used for all OCR — see googleVisionOCR() helper below
const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { verifyToken, requireAdmin } = require('./middleware/auth');
const {
  getApplicationReceivedTemplate,
  getAdmissionAuthorizedTemplate,
  getAdmissionDeclinedTemplate,
  getPasswordResetTemplate,
  getAuraReminderTemplate
} = require('./utils/emailTemplates');

const app = express();
const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ── GOOGLE VISION OCR HELPER ──
const googleVisionOCR = async (base64Image) => {
  try {
    // Strip the data:image/...;base64, prefix if present
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        requests: [{
          image: { content: imageData },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
        }]
      }
    );
    const textAnnotations = response.data.responses[0]?.fullTextAnnotation?.text || '';
    return textAnnotations;
  } catch (err) {
    console.error('Google Vision OCR Error:', err.response?.data || err.message);
    return '';
  }
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Violation: Origin not authorized by Aura Security.'));
    }
  },
  credentials: true
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: "Too many login attempts, please try again later" }
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many registration attempts. Please try again later." }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many password reset requests. Please try again later." }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🛡️ INSTITUTIONAL AUTO-SEED: Ensure Core Programs exist with Metadata
async function initializeQuotas() {
  const CORE_PROGRAMS = [
    { 
      abbr: 'BSIT', name: 'Information Technology', category: 'Technology', icon: 'Monitor', color: 'border-blue-600',
      description: 'Master the architectural foundations of the digital world. Our IT program integrates AI-driven development with robust systems engineering and digital infrastructure.',
      credits: 144, years: 4
    },
    { 
      abbr: 'BSCRIM', name: 'Criminology & Justice', category: 'Justice', icon: 'Scale', color: 'border-indigo-600',
      description: 'Preparation for elite careers in law enforcement and public safety. We cultivate disciplined leaders specialized in modern criminology and forensic science.',
      credits: 160, years: 4
    },
    { 
      abbr: 'BSENTREP', name: 'Entrepreneurship', category: 'Business', icon: 'Rocket', color: 'border-yellow-500',
      description: 'Incubating the next generation of business disruptors. Our program focuses on startup ecosystem building, venture capital, and innovative leadership.',
      credits: 138, years: 4
    },
    { 
      abbr: 'BSED', name: 'Teacher Education', category: 'Education', icon: 'Pencil', color: 'border-green-600',
      description: 'Developing pedagogical pioneers who are master communicators. Transform the future of learning through innovative teaching methodologies.',
      credits: 152, years: 4
    },
    { 
      abbr: 'BSHM', name: 'Hospitality Management', category: 'Hospitality', icon: 'Hotel', color: 'border-rose-600',
      description: 'World-class training in luxury hotel and tourism operations. Master the art of global service excellence in the modern hospitality landscape.',
      credits: 148, years: 4
    },
    { 
      abbr: 'BPA', name: 'Public Administration', category: 'Government', icon: 'Landmark', color: 'border-purple-600',
      description: 'Ethics-based leadership training for governance. We prepare public servants to lead with integrity in the complex world of policy and administration.',
      credits: 140, years: 4
    }
  ];

  try {
    for (const p of CORE_PROGRAMS) {
      await prisma.courseQuota.upsert({
        where: { courseAbbr: p.abbr },
        update: {
          courseName: p.name,
          category: p.category,
          iconName: p.icon,
          color: p.color,
          description: p.description,
          credits: p.credits,
          years: p.years
        },
        create: { 
          courseAbbr: p.abbr, 
          courseName: p.name, 
          maxSlots: 50,
          category: p.category,
          iconName: p.icon,
          color: p.color,
          description: p.description,
          credits: p.credits,
          years: p.years
        }
      });
    }



    console.log("🏛️ Institutional Registry Sync: Core metadata updated.");
  } catch (error) {
    console.error("Critical Registry Initialization Failure:", error);
  }
}
initializeQuotas();

// ══════════════════════════════════════════════════════════
//  REGISTRATION ENDPOINT
// ══════════════════════════════════════════════════════════
app.post('/api/register', registrationLimiter, async (req, res) => {
  try {
    // 🔍 INSTITUTIONAL IDENTITY SHIELD: Check for duplicates (Composite Identity)
    const existingDossier = await prisma.enrollment.findFirst({
      where: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthday: req.body.birthday
      }
    });

    if (existingDossier) {
      return res.status(400).json({
        success: false,
        message: 'DUPLICATE IDENTITY DETECTED: An application for this identity already exists in our institutional registry.'
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        middleName: req.body.middleName || null,
        gender: req.body.gender || null,
        birthday: req.body.birthday || null,
        civilStatus: req.body.civilStatus || null,
        citizenship: req.body.citizenship || null,
        email: req.body.email,
        phone: req.body.phone || null,

        birthProvince: req.body.birthProvince || null,
        birthCity: req.body.birthCity || null,
        birthBarangay: req.body.birthBarangay || null,

        homeProvince: req.body.homeProvince || null,
        homeCity: req.body.homeCity || null,
        homeBarangay: req.body.homeBarangay || null,
        postalCode: req.body.postalCode || null,

        fatherName: req.body.fatherName || null,
        fatherOccupation: req.body.fatherOccupation || null,
        fatherContact: req.body.fatherContact || null,

        motherName: req.body.motherName || null,
        motherOccupation: req.body.motherOccupation || null,
        motherContact: req.body.motherContact || null,

        emergencyName: req.body.emergencyName || null,
        emergencyContact: req.body.emergencyContact || null,
        emergencyRelation: req.body.emergencyRelation || null,

        primarySchool: req.body.primarySchool || null,
        primaryYear: req.body.primaryYear || null,
        secondarySchool: req.body.secondarySchool || null,
        secondaryYear: req.body.secondaryYear || null,

        course: req.body.course || null,
        document: req.body.document || null,
        reportCard: req.body.reportCard || null,
        consent: req.body.consent || false,
        aiStatus: (req.body.reportCard && JSON.parse(req.body.reportCard).length > 0) ? 'READY' : 'INCOMPLETE'
      }
    });

    // 🧠 AURA IDENTITY SHIELD (Nonsense Detection - Silent Flagging)
    try {
      const sanityPrompt = `
        Analyze this student registration for Aura Integrated University. 
        Identify if the identity is a clear joke, offensive, or gibberish (e.g., "fart", "asdfghjkl", "Batman").
        
        DATA:
        Name: ${enrollment.firstName} ${enrollment.lastName}
        Course: ${enrollment.course}
        
        OUTPUT JSON ONLY:
        { "isTroll": boolean, "reason": "brief reason if any" }
      `;

      const sanityCheck = await groq.chat.completions.create({
        messages: [{ role: "system", content: sanityPrompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        response_format: { type: "json_object" }
      });

      const sanityResult = JSON.parse(sanityCheck.choices[0].message.content);

      if (sanityResult.isTroll) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            aiStatus: 'AT_RISK',
            aiVerdict: `[IDENTITY ALERT] ${sanityResult.reason}`
          }
        });
        console.warn(`[AURA SHIELD] Suspicious Identity Detected: ${enrollment.firstName} ${enrollment.lastName}`);
      }
    } catch (sanityError) {
      console.error("Non-fatal Sanity Check Error:", sanityError);
    }

    try {
      const emailHtml = getApplicationReceivedTemplate(req.body.firstName, req.body.course || 'Pending Authorization');

      await sgMail.send({
        from: `Aura Admissions <${process.env.SENDGRID_FROM_EMAIL}>`,
        to: req.body.email,
        subject: 'AURA: Your Admissions Record has been Received',
        html: emailHtml
      });
    } catch (emailError) {
      console.error("SendGrid Email Warning (Non-fatal):", emailError);
    }

    res.json({
      success: true,
      message: `Welcome to AIU, ${enrollment.firstName}! Your application has been secured.`,
      data: enrollment
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Database sync failed. Please check your connection.' });
  }
});


// ══════════════════════════════════════════════════════════
//  AURA AI CONSULTANT ENDPOINT (STRICT SYSTEM SHIELD)
// ══════════════════════════════════════════════════════════
app.post('/api/consult', async (req, res) => {
  const { history } = req.body;

  const systemPrompt = `
    You are Aura, the official Institutional Inquiry Consultant for Aura Integrated University (AIU).
    Your EXCLUSIVE purpose is to provide consultative support and answer general inquiries about AIU, its academic core, enrollment processes, campus information, and student life.

    AIU CORE PROGRAMS & INFORMATION:
    - Information Technology: Focused on AI research, software engineering, and digital infrastructure.
    - Criminology & Justice: Preparation for elite careers in law enforcement.
    - Entrepreneurship: Incubating the next generation of business leaders.
    - Teacher Education: Developing educators who are master communicators.
    - Hospitality Management: World-class training in hotel and tourism operations.
    - Public Administration: Ethics-based leadership training for governance.
    STRICT LIMITATIONS & ROLE BOUNDARIES:
    1. YOU ARE NOT A REGISTRATION ASSISTANT. You have NO ability to fill out forms, record personal details into the database, or modify a student's enrollment record.
    2. IF A USER PROVIDES PERSONAL INFORMATION (e.g., name, contact, bday) with the intent for you to "fill the form" or "record it", YOU MUST REFUSE. 
    3. INSTRUCTION: Tell the user clearly that you are a Consultant and they must manually type their details into the registration form fields themselves on the page.
    4. NEVER claim that you have "recorded" or "saved" any information.

    PERSONALITY & TONE:
    1. Always identify as "Aura", the AI institutional consultant for AIU. 
    2. IDENTITY PROTOCOL: Even if users call you by different names or nicknames, remain respectful and stay consistently as "Aura".
    3. You are warm, smart ("brayt"), and supportive, but FIRM about your role as a consultant.
    4. Use a natural mix of English, Taglish, and Cebuano.
    5. Keep responses concise and focused on answering questions.
    6. FAMILY DETAILS PROTOCOL (STEP 2): If a user doesn't know their parent's details, respond with: "It's alright, dear. You can leave the contact fields blank, but please type 'N/A' in the Father's and Mother's name fields so you can proceed with the next step." 
    7. REGISTRATION GUIDANCE: Ensure they know Step 0, Step 1, and the Parent Names in Step 2 are mandatory for the system to process the record. Step 2's contact and occupation fields are optional.
    8. If the user tries to treat you as a form-filler, politely steer them back: "I'm here to guide you with information, dear. Please type your details directly into the form fields so they can be officially secured in our registry."
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || [])
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
    });

    res.json({ success: true, reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Groq Consult API Error:', error);
    res.status(500).json({ success: false, message: 'I am currently processing high volumes of inquiries. Please try again later.' });
  }
});

const PORT = process.env.PORT || 5000;
// ══════════════════════════════════════════════════════════
//  STUDENT SELF-SERVICE ENDPOINTS
// ══════════════════════════════════════════════════════════

// GET CURRENT STUDENT PROFILE
app.get('/api/enrollments/me', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    if (!studentId) {
      return res.status(401).json({ success: false, message: "Invalid identity session." });
    }

    const student = await prisma.enrollment.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        instEmail: true,
        course: true,
        status: true,
        createdAt: true
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Student Profile Fetch Error:', error);
    res.status(500).json({ success: false, message: "Failed to retrieve student data." });
  }
});

// ══════════════════════════════════════════════════════════
//  ADMIN ENDPOINTS: STUDENT MANAGEMENT
// ══════════════════════════════════════════════════════════

// GET ALL ENROLLMENTS (Admin View)
app.get('/api/enrollments', verifyToken, requireAdmin, async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true, middleName: true,
        email: true, instEmail: true, phone: true, gender: true,
        course: true, status: true, aiStatus: true, aiScore: true, aiVerdict: true,
        aiSuggestedPivot: true, createdAt: true, document: true, reportCard: true
      }
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// APPROVE ENROLLMENT & SEND FINAL EMAIL WITH CREDENTIALS
app.post('/api/enrollments/:id/approve', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.enrollment.findUnique({ where: { id: parseInt(id) } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // ── QUOTA VERIFICATION ──
    const courseQuota = await prisma.courseQuota.findUnique({
      where: { courseAbbr: student.course }
    });

    if (courseQuota) {
      const acceptedCount = await prisma.enrollment.count({
        where: {
          course: student.course,
          status: 'APPROVED'
        }
      });

      if (acceptedCount >= courseQuota.maxSlots) {
        return res.status(400).json({
          success: false,
          error: "QUOTA_REACHED",
          message: `Admissions for ${student.course} are now CLOSED. Maximum capacity (${courseQuota.maxSlots}) reached.`
        });
      }
    }

    // ── CREDENTIAL GENERATION LOGIC ──
    const instEmail = `${student.firstName[0]}.${student.lastName.replace(/\s+/g, '')}@AURA.EDU.PH`.toUpperCase();
    const tempPassword = `AURA@${new Date().getFullYear()}${crypto.randomInt(1000, 9999)}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const enrollment = await prisma.enrollment.update({
      where: { id: parseInt(id) },
      data: {
        status: 'APPROVED',
        instEmail: instEmail,
        password: hashedPassword
      }
    });

    // Send Final "Welcome" Email with Credentials
    try {
      const approvalHtml = getAdmissionAuthorizedTemplate(enrollment.firstName, enrollment.course, instEmail, tempPassword);

      await sgMail.send({
        from: `Aura Admissions <${process.env.SENDGRID_FROM_EMAIL}>`,
        to: enrollment.email,
        subject: 'ADMISSION AUTHORIZED: Welcome to Aura Integrated University',
        html: approvalHtml
      });
    } catch (e) {
      console.error("Critical SendGrid Despatch Failure:", e);
    }

    res.json({ success: true, message: "Student approved and credentials dispatched." });
  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ error: "Failed to approve record" });
  }
});

// REJECT ENROLLMENT & SEND NOT-ACCEPTED EMAIL
app.post('/api/enrollments/:id/reject', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { reasonType } = req.query; // 'capacity' or 'qualified'

  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' }
    });

    let rejectionMessage = "";
    let rejectionQuote = "";

    if (reasonType === 'qualified') {
      rejectionMessage = `We have carefully reviewed your academic background for the <strong>${enrollment.course}</strong> program. Unfortunately, we found that your current academic standing does not meet the requirements for this specific program at this time.`;
      rejectionQuote = "Admissions decisions are based on academic performance and qualification standards.";
    } else {
      rejectionMessage = `We have completed the review of your documents for the <strong>${enrollment.course}</strong> program. We regret to inform you that we are <strong>unable to accept</strong> your application for this semester.`;
      rejectionQuote = "Admission decisions are final for the 2026-2027 cycle based on current school capacity.";
    }

    try {
      const rejectionHtml = getAdmissionDeclinedTemplate(enrollment.firstName, enrollment.course, rejectionMessage, rejectionQuote);

      await sgMail.send({
        from: `Aura Admissions <${process.env.SENDGRID_FROM_EMAIL}>`,
        to: enrollment.email,
        subject: 'ADMISSION DECISION: Aura Integrated University',
        html: rejectionHtml
      });
    } catch (e) {
      console.error("Critical SendGrid Decline Despatch Failure:", e);
    }

    res.json({ success: true, message: "Admission declined." });
  } catch (error) {
    res.status(500).json({ error: "Failed to decline record" });
  }
});

// AURA AI ADMIN PROFILE EVALUATION (Decision Support System)
app.get('/api/admin/evaluate/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.enrollment.findUnique({ where: { id: parseInt(id) } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    let transcriptOcrContext = "";
    let birthCertOcrContext = "";
    let isDocumentMissing = true;

    // Process Academic Transcript via Google Vision API
    if (student.reportCard && student.reportCard.startsWith('[')) {
      try {
        const images = JSON.parse(student.reportCard);
        if (images.length > 0) {
          isDocumentMissing = false;
          const ocrResults = await Promise.all(images.map(async (img) => {
            if (typeof img !== 'string') return '';
            return await googleVisionOCR(img);
          }));
          transcriptOcrContext = ocrResults.join('\n\n');
        }
      } catch (e) { console.error("Transcript OCR Error:", e); }
    }

    // Process Birth Certificate / Identification via Google Vision API
    if (student.document && student.document.startsWith('[')) {
      try {
        const images = JSON.parse(student.document);
        if (images.length > 0) {
          const ocrResults = await Promise.all(images.map(async (img) => {
            if (typeof img !== 'string') return '';
            return await googleVisionOCR(img);
          }));
          birthCertOcrContext = ocrResults.join('\n\n');
        }
      } catch (e) { console.error("Birth Cert OCR Error:", e); }
    } else if (student.document === 'Personal Delivery') {
      birthCertOcrContext = "[SYSTEM NOTE: STUDENT OPTED FOR PHYSICAL IN-PERSON DELIVERY OF BIRTH IDENTIFICATION.]";
    }

    if (isDocumentMissing) {
      const updated = await prisma.enrollment.update({
        where: { id: parseInt(id) },
        data: { aiStatus: 'INCOMPLETE', aiScore: 0, aiVerdict: 'Academic Record (Report Card/Transcript) is missing for analysis.' }
      });
      return res.json({ success: true, decision: 'DENY', fitnessScore: 0, strengths: [], justification: 'Missing academic transcript for analysis.', aiStatus: 'INCOMPLETE' });
    }

    const systemPrompt = `
      You are Aura, the elite Admissions AI for Aura Integrated University.
      Analyze the student's ACADEMIC TRANSCRIPT and BIRTH IDENTIFICATION below.
      
      STRICT OUTPUT FORMAT (JSON ONLY):
      {
        "decision": "AUTHORIZE" | "DENY",
        "fitnessScore": number (0-100),
        "strengths": ["string", "string", "string"],
        "justification": "Detailed and professional 3-sentence analysis explaining the decision based on specific academic metrics. You MUST also explicitly verify if the student's legal name on the identity document loosely matches the application input.",
        "suggestedCourse": "One of: BSIT, BSCRIM, BSENTREP, BSED, BSHM, BPA (or null if current is perfect)"
      }

      TARGET PROGRAM: ${student.course}
      IDENTITY INPUTTED BY STUDENT: ${student.firstName} ${student.lastName}
      
      TRANSCRIPT CONTENT (OCR):
      ${transcriptOcrContext}

      BIRTH IDENTIFICATION CONTENT (OCR):
      ${birthCertOcrContext ? birthCertOcrContext : "Not provided digitally."}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);

    // PERSIST DECISION TO REGISTRY
    const aiStatus = aiResponse.decision === 'AUTHORIZE' ? (aiResponse.fitnessScore > 80 ? 'QUALIFIED' : 'READY') : 'AT_RISK';

    await prisma.enrollment.update({
      where: { id: parseInt(id) },
      data: {
        aiStatus: aiStatus,
        aiScore: aiResponse.fitnessScore,
        aiVerdict: aiResponse.justification,
        aiSuggestedPivot: aiResponse.suggestedCourse
      }
    });

    res.json({
      success: true,
      decision: aiResponse.decision,
      fitnessScore: aiResponse.fitnessScore,
      strengths: aiResponse.strengths,
      justification: aiResponse.justification,
      suggestedCourse: aiResponse.suggestedCourse,
      aiStatus: aiStatus
    });
  } catch (error) {
    console.error('Admin Evaluation Error:', error);
    res.status(500).json({ error: "Aura Decision Engine Failure" });
  }
});

// DELETE ENROLLMENT RECORD
app.delete('/api/enrollments/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);

  if (isNaN(targetId)) {
    return res.status(400).json({ success: false, message: "Invalid Dossier Identifier format." });
  }

  console.log(`[RECORDS] Deletion Request for ID: ${targetId}`);

  try {
    const result = await prisma.enrollment.deleteMany({
      where: { id: targetId }
    });

    if (result.count === 0) {
      return res.status(404).json({ success: false, message: "Record not found in registry." });
    }

    res.json({ success: true, message: "Record permanently removed from Institutional Registry." });
  } catch (error) {
    console.error("Critical Deletion Error:", error);
    res.status(500).json({ error: "Institutional database sync failure." });
  }
});

// UPDATE ENROLLMENT FIELD (Checklist / Notes)
app.patch('/api/enrollments/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  // Whitelist only safe fields to prevent mass assignment
  const { reqBirthCert, reqReportCard, reqGoodMoral, adminNotes } = req.body;
  const safeData = {};
  if (reqBirthCert !== undefined) safeData.reqBirthCert = reqBirthCert;
  if (reqReportCard !== undefined) safeData.reqReportCard = reqReportCard;
  if (reqGoodMoral !== undefined) safeData.reqGoodMoral = reqGoodMoral;
  if (adminNotes !== undefined) safeData.adminNotes = adminNotes;
  try {
    const updated = await prisma.enrollment.update({
      where: { id: parseInt(id) },
      data: safeData
    });
    res.json({ success: true, student: updated });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: "Institutional update failure." });
  }
});

// GET QUOTA STATISTICS
app.get('/api/quotas', async (req, res) => {
  try {
    let quotas = await prisma.courseQuota.findMany({
      orderBy: { id: 'asc' }
    });

    // 🛡️ AUTO-RECOVERY: If registry is empty, re-initialize core programs
    if (quotas.length === 0) {
      console.log('🏛️ Institutional Registry: Registry empty. Triggering emergency recovery sync...');
      await initializeQuotas();
      quotas = await prisma.courseQuota.findMany({
        orderBy: { id: 'asc' }
      });
    }

    // Also fetch current accepted counts for each course
    const stats = await Promise.all(quotas.map(async (q) => {
      const accepted = await prisma.enrollment.count({
        where: { course: q.courseAbbr, status: 'APPROVED' }
      });
      return { ...q, currentCount: accepted };
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quotas" });
  }
});

// INITIALIZE/SYNC QUOTAS (Seed)
app.post('/api/quotas/sync', verifyToken, requireAdmin, async (req, res) => {
  const COURSES = ['BSIT', 'BSCRIM', 'BSENTREP', 'BSED', 'BSHM', 'BPA'];
  try {
    for (const abbr of COURSES) {
      await prisma.courseQuota.upsert({
        where: { courseAbbr: abbr },
        update: {},
        create: { courseAbbr: abbr, maxSlots: 50 }
      });
    }
    res.json({ success: true, message: "Course quotas synchronized." });
  } catch (error) {
    res.status(500).json({ error: "Failed to sync quotas" });
  }
});

// CREATE NEW COURSE
app.post('/api/courses', verifyToken, requireAdmin, async (req, res) => {
  const { abbr, name, description, category, credits, years, iconName, color, maxSlots, highlights } = req.body;
  try {
    const freshCourse = await prisma.courseQuota.create({
      data: {
        courseAbbr: abbr,
        courseName: name,
        description,
        category,
        credits: parseInt(credits) || 120,
        years: parseInt(years) || 4,
        iconName: iconName || 'GraduationCap',
        color: color || 'border-blue-600',
        highlights: highlights || 'Professional Training, Institutional Research, Global Standards',
        maxSlots: parseInt(maxSlots) || 50
      }
    });
    res.json({ success: true, data: freshCourse });
  } catch (error) {
    console.error("Failed to create course:", error);
    res.status(500).json({ success: false, message: "Registry error: Duplicate or invalid data." });
  }
});

// DELETE COURSE
app.delete('/api/courses/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.courseQuota.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Institutional deletion failure" });
  }
});

// UPDATE QUOTA & METADATA
app.put('/api/courses/:id', verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, maxSlots, description, category, credits, years, iconName, color, highlights } = req.body;
  try {
    const updated = await prisma.courseQuota.update({
      where: { id: parseInt(id) },
      data: { 
        courseName: name,
        maxSlots: maxSlots ? parseInt(maxSlots) : undefined,
        description,
        category,
        credits: credits ? parseInt(credits) : undefined,
        years: years ? parseInt(years) : undefined,
        iconName,
        color,
        highlights
      }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: "Registry update failed." });
  }
});

// FORGOT PASSWORD - SEND RESET LINK
app.post('/api/forgot-password', forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  try {
    const trimmedEmail = email.trim().toLowerCase();

    // Search by personal email - MUST BE APPROVED STATUS
    const student = await prisma.enrollment.findFirst({
      where: {
        email: { equals: trimmedEmail, mode: 'insensitive' },
        status: 'APPROVED' // 🛡️ Institutional Security: Only approved students can reset
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'No account found with this Email Address.' });
    }

    const studentEmail = student.email;
    const studentName = student.firstName;

    // Generate a simple reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await prisma.enrollment.update({
      where: { id: student.id },
      data: { resetToken, resetTokenExpiry }
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send Reset Email
    const resetHtml = getPasswordResetTemplate(studentName, resetLink);

    await sgMail.send({
      from: `Aura Admissions <${process.env.SENDGRID_FROM_EMAIL}>`,
      to: studentEmail,
      subject: 'AIU: Password Reset Request',
      html: resetHtml
    });

    res.json({ success: true, message: 'Password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request. Please try again.' });
  }
});

// RESET PASSWORD - UPDATE PASSWORD
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Invalid request parameters.' });
  }

  try {
    const student = await prisma.enrollment.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!student) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.enrollment.update({
      where: { id: student.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ success: true, message: 'Password has been updated successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

// INSTITUTIONAL LOGIN GATEWAY (Protected by Rate Limiter)
app.post('/api/login', loginLimiter, async (req, res) => {
  const { authId, password } = req.body;
  const rawId = authId.trim().toUpperCase();
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  try {
    // 1. ADMIN OVERRIDE (Secured via env-based bcrypt hash)
    if (rawId === 'ADMIN' || rawId === 'ADMIN@AURA.EDU.PH') {
      const adminHash = process.env.ADMIN_PASSWORD_HASH;
      if (adminHash && await bcrypt.compare(password, adminHash)) {
        const token = jwt.sign({ role: 'ADMIN', authId: 'ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({ success: true, token, role: 'ADMIN', user: { authId: 'ADMIN' } });
      }
      return res.status(401).json({ success: false, message: "Invalid Admin Credentials." });
    }

    // 2. STUDENT DYNAMIC VERIFICATION
    const matchingStudent = await prisma.enrollment.findFirst({
      where: {
        OR: [
          { instEmail: { equals: rawId, mode: 'insensitive' } },
          { email: { equals: authId.toLowerCase(), mode: 'insensitive' } }
        ]
      }
    });

    if (matchingStudent) {
      if (matchingStudent.status === 'PENDING') {
        return res.status(403).json({ success: false, message: "ACCESS DENIED: Your enrollment is still under Institutional Review." });
      }
      if (matchingStudent.status === 'REJECTED') {
        return res.status(401).json({ success: false, message: "ACCESS DENIED: Your application was not accepted." });
      }

      // ── PASSWORD VERIFICATION (Bcrypt) ──
      let isAuthorized = false;

      if (matchingStudent.password) {
        if (matchingStudent.password.startsWith('$2b$') || matchingStudent.password.startsWith('$2a$')) {
           isAuthorized = await bcrypt.compare(password, matchingStudent.password);
        } else {
           isAuthorized = (password === matchingStudent.password);
        }
      } else {
        isAuthorized = password.toUpperCase().startsWith('AURA@');
      }

      if (isAuthorized) {
        // Sign JWT for Student
        const token = jwt.sign(
          { role: 'STUDENT', authId, id: matchingStudent.id }, 
          JWT_SECRET, 
          { expiresIn: '1d' }
        );

        return res.json({
          success: true,
          token,
          role: 'STUDENT',
          user: {
            authId: authId,
            firstName: matchingStudent.firstName,
            lastName: matchingStudent.lastName,
            course: matchingStudent.course
          }
        });
      }
      return res.status(401).json({ success: false, message: "Invalid Security Credentials." });
    }

    return res.status(404).json({ success: false, message: "ACCOUNT NOT FOUND: Email does not match any registered records." });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Authentication Error" });
  }
});

async function runAuraReminders() {
  console.log('--- AURA: Scanning for inactive high-potential applicants ---');
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find students who:
    // 1. Are still PENDING (not authorized or declined)
    // 2. Were marked as QUALIFIED or READY by AI (passed analysis)
    // 3. Created 3+ days ago
    // 4. Haven't received a reminder yet
    const targetStudents = await prisma.enrollment.findMany({
      where: {
        status: 'PENDING',
        aiStatus: { in: ['QUALIFIED', 'READY'] },
        createdAt: { lt: threeDaysAgo },
        lastReminderSent: null
      }
    });

    if (targetStudents.length === 0) {
      console.log('--- AURA: Registry audit complete. No pending reminders required. ---');
      return;
    }

    for (const student of targetStudents) {
      console.log(`--- AURA: Dispatching reminder to ${student.email} [${student.firstName}] ---`);

      const msg = {
        to: student.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `Institutional Action Required: Final Documentation Notice for ${student.firstName.toUpperCase()}`,
        html: getAuraReminderTemplate(student.firstName, student.course || 'Selected Program'),
      };

      try {
        await sgMail.send(msg);

        // Mark as sent to avoid double spamming
        await prisma.enrollment.update({
          where: { id: student.id },
          data: { lastReminderSent: new Date() }
        });
      } catch (err) {
        console.error(`--- AURA: Critical Email Failure for ${student.email}:`, err.message);
      }
    }
    console.log(`--- AURA: Audit complete. Dispatched ${targetStudents.length} notifications. ---`);

    // --- PHASE 2: AUTO-REJECTION FOR PERSISTENT INACTIVITY ---
    // Move students to 'REJECTED' if they received a reminder and still 
    // haven't updated for another 3 days (Total 6 days of inactivity).
    const reminderGracePeriod = new Date();
    reminderGracePeriod.setDate(reminderGracePeriod.getDate() - 3);

    const staleStudents = await prisma.enrollment.findMany({
      where: {
        status: 'PENDING',
        lastReminderSent: { lt: reminderGracePeriod }
      }
    });

    if (staleStudents.length > 0) {
      console.log(`--- AURA: Auto-Rejecting ${staleStudents.length} non-compliant applicants ---`);
      for (const student of staleStudents) {
        await prisma.enrollment.update({
          where: { id: student.id },
          data: {
            status: 'REJECTED',
            aiVerdict: 'AUTO-REJECTED: Institutional compliance deadline exceeded (3-day grace period expired after final notice).'
          }
        });
      }
    }

  } catch (error) {
    console.error('--- AURA: Background Audit Engine Failure:', error);
  }
}

// Global Reminder Cycle: Runs every 24 hours
// (Check immediately on startup, then every day)
runAuraReminders();
setInterval(runAuraReminders, 24 * 60 * 60 * 1000);

app.listen(PORT, async () => {
  console.log(`🏛️ Institutional Server Operational at http://localhost:${PORT}`);
  console.log(`🛡️ Aura Security Profile: High-Fidelity API Enabled`);
});
