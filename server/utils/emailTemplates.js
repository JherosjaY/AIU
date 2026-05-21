/**
 * 🏛️ AURA INSTITUTIONAL EMAIL ENGINE
 * Provides a unified, high-fidelity design system for all academic communications.
 * Forced Light Theme, Compact Spacing, and Responsive Architecture.
 */

const getBaseTemplate = (title, subtitle, bannerHtml, contentHtml, footerText = "Office of the Registrar &copy; 2026") => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          
          /* Forced Light Mode for predictable branding */
          :root { color-scheme: light; }
          
          @media screen and (max-width: 480px) {
            .container { width: 100% !important; border-radius: 24px !important; }
            .header-title { font-size: 32px !important; }
            .content-area { padding: 30px 20px !important; }
            .banner-area { padding: 40px 20px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 40px 15px;">
              <!-- Main Institutional Container -->
              <table class="container" border="0" cellpadding="0" cellspacing="0" width="580" style="background-color: #ffffff; border-radius: 35px; overflow: hidden; box-shadow: 0 25px 60px -15px rgba(30,64,175,0.1); border: 1px solid #e2e8f0;">
                
                <!-- 1. Institutional Branding Header -->
                <tr>
                  <td style="padding: 30px 40px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td style="background-color: #1e40af; padding: 10px; border-radius: 12px;">
                          <img src="https://img.icons8.com/ios-filled/50/facc15/open-book.png" width="22" height="22" style="display: block;" alt="AIU Logo"/>
                        </td>
                        <td style="padding-left: 12px; text-align: left;">
                          <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 900; text-transform: uppercase; font-style: italic; letter-spacing: -0.5px; line-height: 1;">Aura Integrated University</p>
                          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 7px; font-weight: 900; text-transform: uppercase; letter-spacing: 2.5px; line-height: 1;">Institutional Registry Portal</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 2. Academic Banner -->
                <tr>
                  <td class="banner-area" style="padding: 45px 40px; text-align: center; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);">
                    ${bannerHtml}
                    <p style="margin: 15px 0 0 0; color: #1e40af; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px;">${subtitle}</p>
                  </td>
                </tr>

                <!-- 3. Primary Communication Area -->
                <tr>
                  <td class="content-area" style="padding: 45px 40px; text-align: center; color: #475569; font-size: 15px; line-height: 1.7;">
                    ${contentHtml}
                  </td>
                </tr>

                <!-- 4. Footer & Credentials -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0; color: #94a3b8; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px;">${footerText}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

/**
 * 📨 TEMPLATE: Application Received (Status: Pending)
 */
const getApplicationReceivedTemplate = (firstName, courseName) => {
  const banner = `<h1 class="header-title" style="margin: 0; color: #1e293b; font-size: 38px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -2px; line-height: 1;">REGISTRATION<br/><span style="color: #1e40af;">RECEIVED.</span></h1>`;
  const content = `
    <p style="color: #111827; font-size: 18px; font-weight: 800; margin-top: 0; font-style: italic; text-transform: uppercase;">Dear ${firstName.toUpperCase()},</p>
    <p>Your institutional application for the <strong>${courseName}</strong> program has been successfully secured in our registry.</p>
    
    <div style="margin: 30px auto; padding: 25px; background-color: #f8fafc; border-radius: 24px; border: 1px solid #e2e8f0; max-width: 400px;">
      <p style="margin: 0; color: #1e40af; font-style: italic; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">"Instructional Review in progress. Your documents are being processed by the Admissions Committee."</p>
    </div>

    <p style="font-size: 12px; color: #94a3b8; font-weight: 500;">No further action is required. We will verify your credentials and dispatch your authorization token via email once cleared.</p>
  `;
  return getBaseTemplate("Received", "Registry Status: IN REVIEW", banner, content);
};

/**
 * 📨 TEMPLATE: Admission Authorized (Status: Approved)
 */
const getAdmissionAuthorizedTemplate = (firstName, courseName, instEmail, tempPassword) => {
  const banner = `<h1 class="header-title" style="margin: 0; color: #1e40af; font-size: 38px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -2px; line-height: 1;">ADMISSION<br/><span style="color: #111827;">AUTHORIZED.</span></h1>`;
  const content = `
    <p style="color: #111827; font-size: 18px; font-weight: 800; margin-top: 0; font-style: italic;">WELCOME TO THE FOLD, ${firstName.toUpperCase()}!</p>
    <p>Your application for <strong>${courseName}</strong> has been cleared. Access your institutional environment using the credentials below:</p>
    
    <div style="margin: 30px auto; padding: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 28px; max-width: 400px;">
      <div style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;">
        <p style="margin: 0; color: #94a3b8; font-size: 9px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">INSTITUTIONAL ID (USER)</p>
        <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 16px; font-weight: 900; font-family: monospace;">${instEmail}</p>
      </div>
      
      <div>
        <p style="margin: 0; color: #94a3b8; font-size: 9px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">SECURITY PASSWORD</p>
        <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 900; font-family: monospace;">${tempPassword}</p>
      </div>
    </div>

    <p style="font-size: 12px; color: #94a3b8; font-weight: 500; margin: 0;">Update your password upon your first successful login to the Student Portal.</p>
  `;
  return getBaseTemplate("Approved", "Institutional Access Granted", banner, content);
};

/**
 * 📨 TEMPLATE: Admission Declined (Status: Rejected)
 */
const getAdmissionDeclinedTemplate = (firstName, courseName, rejectionMessage, rejectionQuote) => {
  const banner = `<h1 class="header-title" style="margin: 0; color: #1e293b; font-size: 38px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -2px; line-height: 1;">ADMISSION<br/><span style="color: #ef4444;">DECLINED.</span></h1>`;
  const content = `
    <h2 style="color: #111827; font-size: 20px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 20px;">Review Notice, <span style="color: #1e40af;">${firstName.toUpperCase()}.</span></h2>
    <div style="background-color: #fef2f2; border-radius: 20px; padding: 25px; border: 1px solid #fee2e2; margin-bottom: 25px; color: #991b1b; font-size: 14px;">
      <p style="margin: 0;">${rejectionMessage}</p>
    </div>
    <div style="margin-bottom: 25px; border-left: 3px solid #cbd5e1; padding-left: 15px; text-align: left;">
      <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 700; font-style: italic; line-height: 1.5;">"${rejectionQuote}"</p>
    </div>
    <p style="font-size: 12px; color: #94a3b8;">We appreciate your interest in AIU and wish you success in your future academic pursuits.</p>
  `;
  return getBaseTemplate("Rejected", "Institutional Record Finalized", banner, content);
};

/**
 * 📨 TEMPLATE: Security Reset (Password Reset)
 */
const getPasswordResetTemplate = (firstName, resetLink) => {
  const banner = `<h1 class="header-title" style="margin: 0; color: #1e40af; font-size: 38px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -2px; line-height: 1;">SECURITY<br/><span style="color: #111827;">OVERRIDE.</span></h1>`;
  const content = `
    <p style="color: #111827; font-size: 18px; font-weight: 800; margin-top: 0; font-style: italic;">AUTHENTICATION REQUEST</p>
    <p>We received a request to access your institutional account. Click the secure gateway below to reset your password:</p>
    
    <div style="margin: 35px 0;">
      <a href="${resetLink}" style="display: inline-block; padding: 16px 36px; background-color: #1e40af; color: #ffffff; border-radius: 12px; font-size: 13px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);">Reset My Password</a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; font-weight: 500; margin: 0;">If you didn't request this, kindly ignore this mail. Link expires in 60 minutes.</p>
  `;
  return getBaseTemplate("Reset", "Security Authorization Center", banner, content, "Institutional Security &copy; 2026");
};

/**
 * 📨 TEMPLATE: Aura Reminder (Status: Incomplete/Pending after 3 days)
 */
const getAuraReminderTemplate = (firstName, courseName) => {
  const banner = `<h1 class="header-title" style="margin: 0; color: #1e293b; font-size: 38px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -2px; line-height: 1;">ACTION<br/><span style="color: #1e40af;">REQUIRED.</span></h1>`;
  const content = `
    <p style="color: #111827; font-size: 18px; font-weight: 800; margin-top: 0; font-style: italic; text-transform: uppercase;">Attention, ${firstName.toUpperCase()}!</p>
    <p>Our institutional audit indicates that your enrollment for the <strong>${courseName}</strong> program is currently <strong>STALLED</strong> due to missing documentation or unverified physical records.</p>
    
    <div style="margin: 30px auto; padding: 25px; background-color: #fffbeb; border-radius: 24px; border: 1px solid #fef3c7; max-width: 400px; color: #92400e;">
      <p style="margin: 0; font-style: italic; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">"Institutional Alert: 3 days of inactivity detected. Your high-potential status requires urgent document liquidation to secure your slot."</p>
    </div>

    <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 25px;">KINDLY COORDINATE WITH THE REGISTRAR OR UPLOAD THE NECESSARY DOCUMENTS TO AVOID APPLICATION EXPIRATION.</p>
    <p style="font-size: 12px; color: #94a3b8; font-weight: 500;">Failure to comply within the next academic cycle may result in your slot being reallocated to other qualified applicants.</p>
  `;
  return getBaseTemplate("Reminder", "Final Documentation Notice", banner, content);
};


/**
 * 📨 TEMPLATE: Old Student Return (Status: Approved)
 */
const getOldStudentAdmissionTemplate = (firstName, courseName, instEmail, tempPassword, idNumber) => {
  const banner = `<h1 class="header-title" style="margin: 0; color: #1e40af; font-size: 38px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -2px; line-height: 1;">RESIDENCY<br/><span style="color: #111827;">CONTINUED.</span></h1>`;
  const content = `
    <p style="color: #111827; font-size: 18px; font-weight: 800; margin-top: 0; font-style: italic;">WELCOME BACK, ${firstName.toUpperCase()}!</p>
    <p>Your institutional residency for <strong>${courseName}</strong> has been officially renewed. Your portal access is now ACTIVE:</p>
    
    <div style="margin: 30px auto; padding: 30px; background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 28px; max-width: 400px;">
      <div style="margin-bottom: 20px; border-bottom: 1px solid #dcfce7; padding-bottom: 20px;">
        <p style="margin: 0; color: #166534; font-size: 9px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">STUDENT ID (UNCHANGED)</p>
        <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 16px; font-weight: 900; font-family: monospace;">${idNumber}</p>
      </div>

      <div style="margin-bottom: 20px; border-bottom: 1px solid #dcfce7; padding-bottom: 20px;">
        <p style="margin: 0; color: #166534; font-size: 9px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">RE-ENTRY USER</p>
        <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 16px; font-weight: 900; font-family: monospace;">${instEmail}</p>
      </div>
      
      <div>
        <p style="margin: 0; color: #166534; font-size: 9px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">SECURE PASSWORD</p>
        <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 900; font-family: monospace;">${tempPassword}</p>
      </div>
    </div>

    <p style="font-size: 12px; color: #94a3b8; font-weight: 500; margin: 0;">Login to select your permanent academic load and finalize your schedule.</p>
  `;
  return getBaseTemplate("Re-entry", "Legacy Student Return", banner, content);
};

/**
 * 📨 TEMPLATE: Transferee Admission (Status: Approved)
 */
const getTransfereeAdmissionTemplate = (firstName, courseName, instEmail, tempPassword, idNumber) => {
  const banner = `<h1 class="header-title" style="margin: 0; color: #1e40af; font-size: 38px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -2px; line-height: 1;">ACADEMIC<br/><span style="color: #111827;">MIGRATION.</span></h1>`;
  const content = `
    <p style="color: #111827; font-size: 18px; font-weight: 800; margin-top: 0; font-style: italic;">GLAD YOU'RE HERE, ${firstName.toUpperCase()}!</p>
    <p>Your academic credit evaluation for the <strong>${courseName}</strong> program is complete. You are now authorized to enroll at AIU:</p>
    
    <div style="margin: 30px auto; padding: 30px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 28px; max-width: 400px;">
       <div style="margin-bottom: 20px; border-bottom: 1px solid #fef08a; padding-bottom: 20px;">
        <p style="margin: 0; color: #854d0e; font-size: 9px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">NEW INSTITUTIONAL ID</p>
        <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 16px; font-weight: 900; font-family: monospace;">${idNumber}</p>
      </div>

      <div style="margin-bottom: 20px; border-bottom: 1px solid #fef08a; padding-bottom: 20px;">
        <p style="margin: 0; color: #854d0e; font-size: 9px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">MIGRATION USERNAME</p>
        <p style="margin: 8px 0 0 0; color: #1e40af; font-size: 16px; font-weight: 900; font-family: monospace;">${instEmail}</p>
      </div>
      
      <div>
        <p style="margin: 0; color: #854d0e; font-size: 9px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">SECURITY CODE</p>
        <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 900; font-family: monospace;">${tempPassword}</p>
      </div>
    </div>

    <p style="font-size: 12px; color: #94a3b8; font-weight: 500; margin: 0;">Your previous institutional credits are being encoded. Access the portal to view the evaluation.</p>
  `;
  return getBaseTemplate("Migration", "Academic Credit Authorized", banner, content);
};

module.exports = {
  getApplicationReceivedTemplate,
  getAdmissionAuthorizedTemplate,
  getAdmissionDeclinedTemplate,
  getPasswordResetTemplate,
  getAuraReminderTemplate,
  getOldStudentAdmissionTemplate,
  getTransfereeAdmissionTemplate
};
