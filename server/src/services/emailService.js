const nodemailer = require('nodemailer');

// Configure transporter
// Reads from GMAIL_USER / GMAIL_APP_PASSWORD or EMAIL_HOST / EMAIL_USER / EMAIL_PASS
const getTransporter = () => {
  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      service: process.env.GMAIL_USER ? 'gmail' : undefined,
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user, pass },
    });
  }
  return null;
};

const sendOTPEmail = async (email, otp, type = 'registration') => {
  const isRegistration = type === 'registration';
  const subject = isRegistration
    ? `🔑 ${otp} - Verification Code for Fouad Pharmacies`
    : `🔐 ${otp} - Password Reset Code for Fouad Pharmacies`;

  const formattedOtp = otp.split('').join('  ');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f0f7ff;
          margin: 0;
          padding: 30px 15px;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          max-width: 560px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #dbeafe;
          overflow: hidden;
          box-shadow: 0 20px 40px -15px rgba(30, 58, 138, 0.12);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%);
          padding: 40px 30px 35px 30px;
          text-align: center;
          color: #ffffff;
          position: relative;
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54 h-54;
          width: 54px;
          height: 54px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 18px;
          font-size: 26px;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        .brand-name {
          font-family: Georgia, serif;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin: 0;
          color: #ffffff;
        }
        .brand-tagline {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #93c5fd;
          margin-top: 4px;
        }
        .security-pill {
          display: inline-block;
          margin-top: 14px;
          padding: 5px 14px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 50px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #e0e7ff;
        }
        .content {
          padding: 36px 32px 32px 32px;
          text-align: center;
          color: #1e293b;
        }
        .badge-type {
          display: inline-block;
          padding: 6px 16px;
          background: ${isRegistration ? '#eff6ff' : '#fff1f2'};
          border: 1px solid ${isRegistration ? '#bfdbfe' : '#fecdd3'};
          color: ${isRegistration ? '#1d4ed8' : '#be123c'};
          border-radius: 50px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .heading {
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 10px 0;
          letter-spacing: -0.5px;
        }
        .description {
          font-size: 14px;
          line-height: 1.6;
          color: #64748b;
          margin: 0 0 28px 0;
          font-weight: 500;
        }
        .otp-container {
          background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
          border: 2px dashed #60a5fa;
          border-radius: 24px;
          padding: 24px 20px;
          margin: 10px 0 28px 0;
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8);
        }
        .otp-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 38px;
          font-weight: 900;
          letter-spacing: 6px;
          color: #1e3a8a;
          margin: 0;
          user-select: all;
        }
        .otp-timer {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          margin-top: 10px;
        }
        .security-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px 20px;
          text-align: left;
          margin-bottom: 24px;
        }
        .security-card-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #334155;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .security-list {
          margin: 0;
          padding-left: 18px;
          font-size: 12px;
          color: #64748b;
          line-height: 1.6;
        }
        .footer {
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          padding: 24px 30px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.6;
        }
        .footer strong {
          color: #475569;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <!-- Header -->
        <div class="header">
          <div class="brand-badge">F</div>
          <h1 class="brand-name">FOUAD</h1>
          <div class="brand-tagline">PHARMACIES</div>
          <div class="security-pill">🛡 LICENSED DIGITAL PHARMACY PORTAL</div>
        </div>

        <!-- Body Content -->
        <div class="content">
          <div class="badge-type">
            ${isRegistration ? '🔑 EMAIL VERIFICATION CODE' : '🔐 PASSWORD RESET CODE'}
          </div>

          <h2 class="heading">
            ${isRegistration ? 'Verify Your Email Address' : 'Reset Your Account Password'}
          </h2>

          <p class="description">
            ${isRegistration
              ? `Welcome to <strong>Fouad Pharmacies</strong>! Please enter the 6-digit verification code below to verify your email <strong>(${email})</strong> and activate your patient account.`
              : `We received a request to reset the password for your account <strong>(${email})</strong>. Use the 6-digit code below to set up your new password.`}
          </p>

          <!-- OTP Box -->
          <div class="otp-container">
            <div class="otp-label">YOUR 6-DIGIT VERIFICATION CODE</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-timer">⏱ Valid for 10 minutes</div>
          </div>

          <!-- Security Tips -->
          <div class="security-card">
            <div class="security-card-title">🛡 Security Notice &amp; Tips:</div>
            <ul class="security-list">
              <li>Do not share this code with anyone, including pharmacy staff.</li>
              <li>If you did not request this code, please ignore this email.</li>
              <li>Your health records and order details remain 100% encrypted &amp; secure.</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <strong>Fouad Pharmacies Pvt Ltd</strong> • Official Licensed Digital Pharmacy<br/>
          License No: SL-PHARM-2026-889 • Colombo, Sri Lanka<br/>
          <span style="font-size: 10px; color: #cbd5e1; margin-top: 6px; display: block;">This is an automated system email. Please do not reply directly to this message.</span>
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = getTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Fouad Pharmacies Security" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      });
      console.log(`[EMAIL SERVICE] Beautiful OTP email sent successfully to ${email}`);
      return true;
    } catch (err) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send email via SMTP:`, err.message);
    }
  }

  // Console Fallback for local development
  console.log(`\n==================================================`);
  console.log(`✉ [EMAIL SIMULATION] OTP FOR ${email.toUpperCase()}`);
  console.log(`Type: ${type.toUpperCase()}`);
  console.log(`OTP Verification Code: ====>  [ ${otp} ]  <====`);
  console.log(`Valid for 10 minutes`);
  console.log(`==================================================\n`);

  return true;
};

const sendNewsletterWelcomeEmail = async (email, discountCode = 'FOUADVIP10') => {
  const subject = `🎁 Welcome to Fouad Pharmacies VIP Club! Here is your 10% OFF Code`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f0f7ff;
          margin: 0;
          padding: 30px 15px;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          max-width: 560px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #dbeafe;
          overflow: hidden;
          box-shadow: 0 20px 40px -15px rgba(30, 58, 138, 0.12);
        }
        .header {
          background: linear-gradient(135deg, #059669 0%, #10b981 50%, #2563eb 100%);
          padding: 40px 30px 35px 30px;
          text-align: center;
          color: #ffffff;
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 18px;
          font-size: 26px;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        .brand-name {
          font-family: Georgia, serif;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin: 0;
          color: #ffffff;
        }
        .brand-tagline {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #a7f3d0;
          margin-top: 4px;
        }
        .content {
          padding: 36px 32px 32px 32px;
          text-align: center;
          color: #1e293b;
        }
        .coupon-box {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px dashed #10b981;
          border-radius: 24px;
          padding: 24px 20px;
          margin: 20px 0 28px 0;
        }
        .coupon-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #047857;
          margin-bottom: 8px;
        }
        .coupon-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 36px;
          font-weight: 900;
          letter-spacing: 6px;
          color: #065f46;
          margin: 0;
        }
        .footer {
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          padding: 24px 30px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="brand-badge">F</div>
          <h1 class="brand-name">FOUAD PHARMACIES</h1>
          <div class="brand-tagline">VIP WELLNESS CLUB</div>
        </div>

        <div class="content">
          <h2 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">
            🎉 Welcome to the VIP Club!
          </h2>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px;">
            Thank you for subscribing to <strong>Fouad Pharmacies</strong>. You will now receive exclusive discounts, Korean skincare arrivals, and health tips right in your inbox!
          </p>

          <div class="coupon-box">
            <div class="coupon-title">YOUR EXCLUSIVE 10% OFF DISCOUNT VOUCHER</div>
            <div class="coupon-code">${discountCode}</div>
            <div style="font-size: 11px; color: #047857; font-weight: 700; margin-top: 8px;">
              Use code at checkout to get 10% off your entire order!
            </div>
          </div>
        </div>

        <div class="footer">
          <strong>Fouad Pharmacies Pvt Ltd</strong> • Official Licensed Digital Pharmacy<br/>
          License No: SL-PHARM-2026-889 • Colombo, Sri Lanka
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Fouad Pharmacies VIP Club" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      });
      console.log(`[EMAIL SERVICE] VIP Welcome email sent successfully to ${email}`);
      return true;
    } catch (err) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send welcome email:`, err.message);
    }
  }

  console.log(`\n==================================================`);
  console.log(`✉ [NEWSLETTER SIMULATION] WELCOME EMAIL TO ${email.toUpperCase()}`);
  console.log(`VIP Discount Code: [ ${discountCode} ]`);
  console.log(`==================================================\n`);

  return true;
};

const sendOrderReceiptEmail = async (email, orderDetails) => {
  const { id, total_amount, order_status, items, delivery_address, notes, payment_method, createdAt } = orderDetails;
  
  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const orderNum = `ORD-${String(id).padStart(5, '0')}`;
  const subject = `🧾 Official Pharmacy Receipt #${orderNum} - Fouad Pharmacies`;

  const itemsHtml = (items && Array.isArray(items) && items.length > 0)
    ? items.map(item => {
        const pName = item.product?.product_name || item.product_name || 'Pharmacy Product';
        const qty = item.quantity || 1;
        const price = parseFloat(item.price || item.product?.selling_price || 0);
        const subtotal = (qty * price).toFixed(2);
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 700; color: #1e293b;">${pName}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: center; color: #475569;">x${qty}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; color: #475569;">$${price.toFixed(2)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-weight: 800; color: #0f172a;">$${subtotal}</td>
          </tr>
        `;
      }).join('')
    : `
      <tr>
        <td colspan="4" style="padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
          📋 Prescription Verification Uploaded (Medicines to be added after pharmacist review)
        </td>
      </tr>
    `;

  const totalFormatted = parseFloat(total_amount || 0).toFixed(2);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f0f7ff;
          margin: 0;
          padding: 30px 15px;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid #dbeafe;
          overflow: hidden;
          box-shadow: 0 20px 40px -15px rgba(30, 58, 138, 0.12);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%);
          padding: 35px 30px;
          text-align: center;
          color: #ffffff;
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 16px;
          font-size: 24px;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 10px;
        }
        .brand-name {
          font-family: Georgia, serif;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin: 0;
          color: #ffffff;
        }
        .content {
          padding: 32px;
          color: #1e293b;
        }
        .receipt-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .receipt-table th {
          background: #e2e8f0;
          padding: 10px 12px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #475569;
          text-align: left;
        }
        .total-row {
          background: #eff6ff;
          font-size: 16px;
          font-weight: 900;
          color: #1e3a8a;
        }
        .status-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: #dbeafe;
          color: #1e40af;
        }
        .footer {
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          padding: 24px 30px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="brand-badge">F</div>
          <h1 class="brand-name">FOUAD PHARMACIES</h1>
          <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; opacity: 0.9; font-weight: 800;">
            OFFICIAL DIGITAL PHARMACY RECEIPT
          </div>
        </div>

        <div class="content">
          <div style="text-align: center; margin-bottom: 24px;">
            <span class="status-pill">ORDER STATUS: ${String(order_status).toUpperCase()}</span>
            <h2 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 12px 0 4px 0;">
              Thank You for Your Order!
            </h2>
            <p style="font-size: 13px; color: #64748b; margin: 0;">
              Receipt #${orderNum} • Date: ${formattedDate}
            </p>
          </div>

          <!-- Order Summary Details -->
          <div class="receipt-card">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
              <span>Payment Method:</span>
              <span>${payment_method || 'Cash on Delivery'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
              <span>Delivery Address:</span>
              <span style="max-width: 60%; text-align: right;">${delivery_address || 'Customer Delivery Address'}</span>
            </div>
            ${notes ? `<div style="font-size: 11px; color: #64748b; margin-top: 8px; pt-2; border-top: 1px dashed #cbd5e1;">Notes: ${notes}</div>` : ''}
          </div>

          <!-- Items Table -->
          <table class="receipt-table">
            <thead>
              <tr>
                <th style="border-radius: 10px 0 0 10px;">Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right; border-radius: 0 10px 10px 0;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" style="padding: 16px 12px; text-align: right; font-weight: 900; font-size: 14px; text-transform: uppercase;">Total Paid / Due:</td>
                <td style="padding: 16px 12px; text-align: right; font-weight: 900; font-size: 18px; color: #1e3a8a;">$${totalFormatted}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 24px; padding: 14px 18px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; text-align: center; font-size: 12px; color: #047857; font-weight: 600;">
            🛡 Pharmacist Verified • Licensed Prescription Care &amp; Express Delivery
          </div>
        </div>

        <div class="footer">
          <strong>Fouad Pharmacies Pvt Ltd</strong> • Official Licensed Digital Pharmacy<br/>
          License No: SL-PHARM-2026-889 • Colombo, Sri Lanka
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Fouad Pharmacies Orders" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      });
      console.log(`[EMAIL SERVICE] Order receipt email #${orderNum} sent successfully to ${email}`);
      return true;
    } catch (err) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send receipt email:`, err.message);
    }
  }

  console.log(`\n==================================================`);
  console.log(`✉ [RECEIPT SIMULATION] ORDER #${orderNum} RECEIPT TO ${email.toUpperCase()}`);
  console.log(`Total Amount: $${totalFormatted}`);
  console.log(`==================================================\n`);

  return true;
};

module.exports = {
  sendOTPEmail,
  sendNewsletterWelcomeEmail,
  sendOrderReceiptEmail,
};


