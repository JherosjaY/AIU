const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Groq = require('groq-sdk');
const sgMail = require('@sendgrid/mail');
const Tesseract = require('tesseract.js');
const { 
  getApplicationReceivedTemplate, 
  getAdmissionAuthorizedTemplate, 
  getAdmissionDeclinedTemplate, 
  getPasswordResetTemplate 
} = require('./utils/emailTemplates');

const app = express();
const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 🛡️ PRODUCTION CORS CONFIGURATION: Allow local development and deployed frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Violation: Origin not authorized by Aura Security.'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🛡️ INSTITUTIONAL AUTO-SEED & CLEANUP: Ensure only 6 Core Programs exist
async function initializeQuotas() {
  const COURSES = ['BSIT', 'BSCRIM', 'BSENTREP', 'BSED', 'BSHM', 'BPA'];
  try {
    // 1. Remove mock/obsolete programs
    await prisma.courseQuota.deleteMany({
      where: { courseAbbr: { notIn: COURSES } }
    });

    // 2. Ensure core programs exist
    for (const abbr of COURSES) {
      await prisma.courseQuota.upsert({
        where: { courseAbbr: abbr },
        update: {},
        create: { courseAbbr: abbr, maxSlots: 50 }
      });
    }
    console.log("🏛️ Institutional Registry Hardened: Mock programs purged. 6 Core Programs active.");
  } catch (error) {
    console.error("Critical Registry Initialization Failure:", error);
  }
}
initializeQuotas();

// Root test
app.get('/', (req, res) => {
  res.send('Aura AI Institutional Backend is Online 🏛️');
});

// ══════════════════════════════════════════════════════════
//  REGISTRATION ENDPOINT
// ══════════════════════════════════════════════════════════
app.post('/api/register', async (req, res) => {
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
//  AURA AI CHAT ENDPOINT (GROQ POWERED)
// ══════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { message, image, history, formData } = req.body;

  const systemPrompt = `
    You are Aura, the AI Enrollment Guide for Aura Integrated University (AIU).
    Your goal is to collect student information for enrollment in a friendly, professional, and conversational way.

    CURRENT FORM DATA:
    ${JSON.stringify(formData)}

    AVAILABLE FIELDS:
    firstName, lastName, middleName, birthday, civilStatus, citizenship, gender, 
    birthProvince, birthCity, birthBarangay, 
    homeProvince, homeCity, homeBarangay, postalCode, 
    phone, email, 
    fatherName, fatherOccupation, fatherContact,
    motherName, motherOccupation, motherContact,
    emergencyName, emergencyContact, emergencyRelation,
    primarySchool, primaryYear, secondarySchool, secondaryYear, course.

    CORE ACADEMIC PROGRAMS:
    - BSIT (Information Technology)
    - BSCRIM (Criminology & Justice)
    - BSENTREP (Entrepreneurship)
    - BSED (Teacher Education)
    - BSHM (Hospitality Management)
    - BPA (Public Administration)

    1. You are Aura, the official AI Enrollment Guide for Aura Integrated University (AIU). 
    2. IDENTITY PROTOCOL: Always refer to yourself as "Aura". Even if users give you nicknames or call you something else, remain respectful and gently remind them that your name is Aura.
    3. Extract new information from the user's message. Focus on grabbing as much info as possible into the available fields.
    4. If you find new data, wrap it in [UPDATE_FORM] { "field": "value" } [/UPDATE_FORM].
    5. Respond in a helpful, academic, but warm tone (Cebuano/Taglish/English mixed if appropriate).
    6. GENTLE FOCUS: If the user asks clearly unrelated chitchat (like "what is a dog", "hi", "how are you today"), politely steer them back by stating: "Let's get back to your registration first." However, if they ask about their registration progress (e.g. "what do you have so far?" or "what's next?"), DO NOT scold them. Just answer their question normally based on CURRENT FORM DATA.
    7. When core institutional fields (firstName, lastName, homeCity, phone, email, course, emergencyContact, emergencyRelation) are filled, use [ACTION]REVIEW[/ACTION] to proceed to final validation. You do not need to ask for every single field if the core fields are filled, as the student will fill the rest in the Verification Phase.
    8. Be concise. Don't be too repetitive. ALWAYS output some conversational text along with your [UPDATE_FORM] tags.
    9. If the user presents an image of an academic record or grade transcript, analyze their highest grades and strongest subjects. Suggest the best AIU course based on their strengths, and output it in [UPDATE_FORM] { "course": "Recommended Course ID (e.g. BSIT)" } [/UPDATE_FORM].
  `;

  try {
    let apiMessages = [
      { role: "system", content: systemPrompt },
      ...(history || [])
    ];

    let queryText = message || "Please evaluate my academic record.";

    // 📸 MULTI-IMAGE OCR SYNC: Process up to 5 images simultaneously
    const imageList = Array.isArray(image) ? image : (image ? [image] : []);
    
    if (imageList.length > 0) {
      try {
        console.log(`[AURA VISION] Synchronized processing initiated for ${imageList.length} documents...`);
        
        // Parallel OCR processing for maximum efficiency
        const ocrResults = await Promise.all(imageList.map(async (img, idx) => {
          if (typeof img !== 'string') return `--- [DOCUMENT #${idx + 1} ERROR: Invalid Format] ---`;
          
          console.log(`[OCR] Analyzing Institutional Document #${idx + 1}...`);
          try {
            const { data: { text } } = await Tesseract.recognize(img, 'eng');
            return `--- [DOCUMENT #${idx + 1} EXTRACTED TEXT] ---\n${text}`;
          } catch (err) {
            console.error(`[OCR] Error processing Document #${idx + 1}:`, err.message);
            return `--- [DOCUMENT #${idx + 1} ERROR: Processing Failed] ---`;
          }
        }));

        const aggregatedText = ocrResults.join('\n\n');
        console.log("[AURA VISION] Holistic Document Analysis Successful.");

        queryText = `User Message: ${queryText}\n\n[AGGREGATED DOCUMENT DATA]:\n${aggregatedText}\n\nReview the multiple documents above. Harmonize all the extracted data to determine the student's overall academic strengths and recommend a course.`;
      } catch (ocrError) {
        console.error("[AURA VISION] Critical OCR Pipeline Failure:", ocrError);
        queryText = `User Message: ${queryText}\n\n(Note to AI: The user uploaded ${imageList.length} documents but our vision scanner encountered a processing error. Kindly inform them and ask what the documents contain.)`;
      }
    }

    apiMessages.push({
      role: "user",
      content: queryText
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const reply = chatCompletion.choices[0].message.content;

    res.json({
      success: true,
      reply: reply
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ success: false, message: 'Aura is temporarily resting.', debug_error: error.message || error.toString() });
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
//  ADMIN ENDPOINTS: STUDENT MANAGEMENT
// ══════════════════════════════════════════════════════════

// GET ALL ENROLLMENTS (Admin View)
app.get('/api/enrollments', async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// APPROVE ENROLLMENT & SEND FINAL EMAIL WITH CREDENTIALS
app.post('/api/enrollments/:id/approve', async (req, res) => {
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
    const tempPassword = `AURA@${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

    const enrollment = await prisma.enrollment.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'APPROVED',
        instEmail: instEmail,
        password: tempPassword
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
app.post('/api/enrollments/:id/reject', async (req, res) => {
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
app.get('/api/admin/evaluate/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.enrollment.findUnique({ where: { id: parseInt(id) } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    let ocrContext = "";
    let isDocumentMissing = true;

    if (student.reportCard && student.reportCard.startsWith('[')) {
      try {
        const images = JSON.parse(student.reportCard);
        if (images.length > 0) {
          isDocumentMissing = false;
          const ocrResults = await Promise.all(images.map(async (img) => {
            if (typeof img !== 'string') return '';
            try {
              const { data: { text } } = await Tesseract.recognize(img, 'eng');
              return text;
            } catch (err) { return ''; }
          }));
          ocrContext = ocrResults.join('\n\n');
        }
      } catch (e) { console.error("OCR Parse Error:", e); }
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
      Analyze the student's ACADEMIC TRANSCRIPT / REPORT CARD below.
      
      STRICT OUTPUT FORMAT (JSON ONLY):
      {
        "decision": "AUTHORIZE" | "DENY",
        "fitnessScore": number (0-100),
        "strengths": ["string", "string", "string"],
        "justification": "Clear, professional 2-sentence explanation based specifically on their grades and performance.",
        "suggestedCourse": "One of: BSIT, BSCRIM, BSENTREP, BSED, BSHM, BPA (or null if current is perfect)"
      }

      TARGET PROGRAM: ${student.course}
      IDENTITY: ${student.firstName} ${student.lastName}
      
      TRANSCRIPT CONTENT (OCR):
      ${ocrContext}
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
app.delete('/api/enrollments/:id', async (req, res) => {
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

// GET QUOTA STATISTICS
app.get('/api/quotas', async (req, res) => {
  try {
    const quotas = await prisma.courseQuota.findMany();

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
app.post('/api/quotas/sync', async (req, res) => {
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

// UPDATE QUOTA
app.post('/api/quotas/update', async (req, res) => {
  const { abbr, maxSlots } = req.body;
  try {
    await prisma.courseQuota.update({
      where: { courseAbbr: abbr },
      data: { maxSlots: parseInt(maxSlots) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// FORGOT PASSWORD - SEND RESET LINK
app.post('/api/forgot-password', async (req, res) => {
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
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

    await prisma.enrollment.update({
      where: { id: student.id },
      data: {
        password: password,
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

// INSTITUTIONAL LOGIN GATEWAY
app.post('/api/login', async (req, res) => {
  const { authId, password } = req.body;
  const rawId = authId.trim().toUpperCase();

  try {
    // 1. ADMIN OVERRIDE (Hardcoded for Demo Security)
    if (rawId === 'ADMIN' || rawId === 'ADMIN@AURA.EDU.PH') {
      if (password === 'admin123' || password === '@Jherosjay0125!') {
        return res.json({ success: true, role: 'ADMIN', user: { authId: 'ADMIN' } });
      }
      return res.status(401).json({ success: false, message: "Invalid Admin Token." });
    }

    // 2. STUDENT DYNAMIC VERIFICATION (Supports Institutional Email and Personal Email)
    const matchingStudent = await prisma.enrollment.findFirst({
      where: {
        OR: [
          { instEmail: { equals: rawId, mode: 'insensitive' } },
          { email: { equals: authId.toLowerCase(), mode: 'insensitive' } }
        ]
      }
    });

    if (matchingStudent) {
      // Check status first
      if (matchingStudent.status === 'PENDING') {
        return res.status(403).json({ success: false, message: "ACCESS DENIED: Your enrollment is still under Institutional Review. Please wait for authorization." });
      }

      if (matchingStudent.status === 'REJECTED') {
        return res.status(401).json({ success: false, message: "ACCESS DENIED: Your application was not accepted." });
      }
      
      // ── PASSWORD VERIFICATION ──
      let isAuthorized = false;
      
      if (matchingStudent.password) {
        // Use custom password if set
        isAuthorized = (password === matchingStudent.password);
      } else {
        // Fallback to legacy AURA@ protocol for new accounts
        isAuthorized = password.toUpperCase().startsWith('AURA@');
      }
      
      if (isAuthorized) {
        return res.json({
          success: true,
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

app.listen(PORT, () => {
  console.log(`🏛️ Institutional Server Operational at http://localhost:5000`);
});
