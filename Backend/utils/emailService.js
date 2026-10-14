const nodemailer = require("nodemailer");

/**
 * Creates nodemailer transporter using env variables or fallback.
 */
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback testing transporter (log mode if credentials not provided)
  return nodemailer.createTransport({
    jsonTransport: true
  });
};

/**
 * Send email helper
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"Satya Physiotherapy Center" <contact@satyaphyseo.com>';

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully to ${to}. MessageId: ${info.messageId || 'LOGGED'}`);
    return { success: true, info };
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Physio Registration Approval Email
 */
const sendPhysioApprovalEmail = async (physioUser) => {
  if (!physioUser || !physioUser.email) return;

  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
  const physioName = physioUser.name.startsWith("Dr.") ? physioUser.name : `Dr. ${physioUser.name}`;

  const subject = `🎉 Congratulations! Your Physiotherapist Registration is Approved — Satya Physiotherapy Center`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Physiotherapist Account Approved</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fb; margin: 0; padding: 0; color: #0f172a; }
        .email-container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }
        .email-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
        .email-header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .email-header p { margin: 8px 0 0 0; color: #0d9488; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .email-body { padding: 32px 24px; }
        .approval-badge { display: inline-block; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; margin-bottom: 20px; }
        .details-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .details-row:last-child { margin-bottom: 0; }
        .details-label { color: #64748b; font-weight: 500; }
        .details-val { color: #0f172a; font-weight: 700; }
        .cta-btn { display: inline-block; background: #0d9488; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin-top: 24px; text-align: center; font-size: 15px; }
        .email-footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Satya Physiotherapy Center</h1>
          <p>Evidence-Based Non-Surgical Rehabilitation</p>
        </div>
        
        <div class="email-body">
          <div class="approval-badge">✓ ACCOUNT VERIFIED & APPROVED</div>
          
          <h2 style="font-size: 20px; margin-top: 0;">Welcome to the Specialist Panel, ${physioName}!</h2>
          
          <p style="line-height: 1.6; color: #334155;">
            We are pleased to inform you that your professional registration and clinical credentials have been thoroughly reviewed and <strong>APPROVED</strong> by our Administrative Board.
          </p>

          <p style="line-height: 1.6; color: #334155;">
            Your official <strong>Physiotherapist Specialist Workspace</strong> is now unlocked. You can now manage patient appointment requests, conduct online report reviews, update your availability, and track patient recovery milestones.
          </p>

          <div class="details-box">
            <div class="details-row">
              <span class="details-label">Registered Name:</span>
              <span class="details-val">${physioName}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Registered Email:</span>
              <span class="details-val">${physioUser.email}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Qualification:</span>
              <span class="details-val">${physioUser.qualification || 'MPT (Orthopedics)'}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Specialization:</span>
              <span class="details-val">${physioUser.specialization || 'Spine & Joint Rehabilitation'}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Approval Date:</span>
              <span class="details-val">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="cta-btn">Sign In to Physio Dashboard →</a>
          </div>
        </div>

        <div class="email-footer">
          <p>Satya Physiotherapy Center | Plot 12, Main Ring Road, Lajpat Nagar, New Delhi - 110024</p>
          <p>Clinic Desk: +91 93106 60524 | Email: contact@satyaphyseo.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: physioUser.email, subject, html });
};

/**
 * Send Physio Registration Rejection Email
 */
const sendPhysioRejectionEmail = async (physioUser, reason) => {
  if (!physioUser || !physioUser.email) return;

  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
  const physioName = physioUser.name.startsWith("Dr.") ? physioUser.name : `Dr. ${physioUser.name}`;
  const subject = `Physiotherapist Registration Update — Satya Physiotherapy Center`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Registration Review Update</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fb; margin: 0; padding: 0; color: #0f172a; }
        .email-container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; }
        .email-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
        .email-header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .email-body { padding: 32px 24px; }
        .rejection-badge { display: inline-block; background-color: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; margin-bottom: 20px; }
        .reason-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px; font-size: 14px; color: #991b1b; }
        .cta-btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 20px; text-align: center; font-size: 14px; }
        .email-footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Satya Physiotherapy Center</h1>
        </div>
        
        <div class="email-body">
          <div class="rejection-badge">ACTION REQUIRED — REGISTRATION UPDATE</div>
          
          <h2>Hello, ${physioName}</h2>
          
          <p style="line-height: 1.6; color: #334155;">
            Thank you for applying to join Satya Physiotherapy Center. Our administrative team has reviewed your application details and certificates.
          </p>

          <p style="line-height: 1.6; color: #334155;">
            Regrettably, your application cannot be approved in its current form due to the following administrative observation:
          </p>

          <div class="reason-box">
            <strong>Reason for Review/Rejection:</strong><br/>
            ${reason || 'The provided registration documents require clearer copies or updated registration details.'}
          </div>

          <p style="line-height: 1.6; color: #334155;">
            You can sign in to your account to review the rejection feedback and update your registration details.
          </p>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="cta-btn">Sign In to Update Registration →</a>
          </div>
        </div>

        <div class="email-footer">
          <p>Satya Physiotherapy Center | Help Desk: +91 93106 60524</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: physioUser.email, subject, html });
};

module.exports = {
  sendEmail,
  sendPhysioApprovalEmail,
  sendPhysioRejectionEmail
};
