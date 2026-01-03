const sgmail = require("@sendgrid/mail");

sgmail.setApiKey(process.env.SENDGRID_API_KEY);

const EmailVerify = async (Firstname, Lastname, email, verificationLink) => {
  const Fullname = `${Firstname} ${Lastname}`;
  const htmltemplate = `<div style="
      font-family: Arial, sans-serif;
      background: #ffffff;
      padding: 0;
      margin: 0;
      width: 100%;
    ">
    <div style="
        max-width: 520px;
        margin: auto;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #eee;
    ">

      <!-- Header -->
      <div style="
          background: #ff7a00;
          padding: 22px;
          text-align: center;
          color: white;
          font-size: 20px;
          font-weight: bold;
      ">
        BookMyHall – Email Verification
      </div>

      <!-- Body -->
      <div style="padding: 28px;">
        <h2 style="color:#333; margin: 0 0 10px;">
          Hey ${Fullname} 👋
        </h2>

        <p style="color:#444; font-size: 15px; line-height: 1.6;">
          Thanks for signing up!  
          You're almost ready to use your BookMyHall account.
        </p>

        <p style="color:#444; font-size: 15px; line-height: 1.6;">
          Tap the button below to verify your email and activate your account.
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
            style="
              background: #ff7a00;
              color: white;
              padding: 14px 28px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              font-size: 15px;
              display: inline-block;
            ">
            Verify Email
          </a>
        </div>

        <p style="color:#777; font-size: 13px; line-height: 1.6;">
          If the button doesn’t work, use the link below:
        </p>

        <p style="word-wrap: break-word; font-size: 13px;">
          <a href="${verificationLink}" style="color:#ff7a00;">
            ${verificationLink}
          </a>
        </p>

        <p style="color:#aaa; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours.
        </p>
      </div>

      <!-- Footer -->
      <div style="
          background: #f7f7f7;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
      ">
        © ${new Date().getFullYear()} BookMyHall. All rights reserved.
      </div>

    </div>
  </div>
  `;
  try {
    await sgmail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Email Verification",
      html: htmltemplate,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Failed to send verification email" });
  }
};

const PassReset = async (email, reseturl) => {
  try {
    await sgmail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Password Reset",
      html: `
  <div style="
    font-family: Arial, sans-serif; 
    background-color: #ffffff;
    padding: 0;
    margin: 0;
    width: 100%;
  ">

    <div style="
      max-width: 550px;
      margin: auto;
      background: #ffffff;
      border: 1px solid #f3f3f3;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    ">

      <!-- Logo -->
      <h2 style="
        text-align: center;
        color: #ff7a00;
        font-size: 26px;
        letter-spacing: 1px;
        margin-bottom: 10px;
      ">BookMyHall</h2>

      <!-- Title -->
      <h3 style="
        color: #333;
        font-size: 22px;
        margin-top: 0;
        text-align: center;
      ">Reset Your Password</h3>

      <!-- Message -->
      <p style="
        color: #555;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 20px;
        text-align: center;
      ">
        You recently requested to reset your password.  
        Click the button below to choose a new password.  
        This link is valid for the next <b>10 minutes</b>.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reseturl}" 
          style="
            background-color: #ff7a00;
            padding: 14px 26px;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
            border-radius: 8px;
            font-weight: bold;
            display: inline-block;
            box-shadow: 0 4px 14px rgba(255,122,0,0.3);
          "
        >
          Reset Password
        </a>
      </div>

      <!-- If button doesn't work -->
      <p style="
        color: #888;
        font-size: 13px;
        margin-top: 20px;
      ">
        If the button above does not work, copy and paste this link into your browser:
      </p>

      <p style="
        font-size: 13px;
        color: #ff7a00;
        word-break: break-all;
      ">
        ${reseturl}
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

      <p style="
        color: #999;
        font-size: 12px;
        text-align: center;
      ">
        If you did not request a password reset, please ignore this email.
      </p>

    </div>
  </div>
`,
    });

    console.log("Password Reset email sent successfully");
  } catch (error) {
    console.log("Password Reset Email error", error);
  }
};

const BookingRequest = async (
  Firstname,
  Lastname,
  AdminEmail,
  UserEmail,
  BookingDateStr,
  Time,
  BookingTitle,
  bookingId
) => {
  const Fullname = `${Firstname} ${Lastname}`;

  const htmltemplate = `
  <div style="margin:0; padding:0; background:#f9fafb; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">

          <!-- Main Card -->
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.06); overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:#ff7a00; padding:24px; text-align:center;">
                <h1 style="margin:0; font-size:22px; color:#ffffff;">
                  New Booking Request
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <h2 style="margin:0 0 10px; color:#111;">Hello Admin 👋</h2>

                <p style="color:#444; font-size:15px; line-height:1.6;">
                  A new booking request has been submitted by
                  <strong>${Fullname}</strong>.
                </p>

                <!-- Booking Details -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="margin:20px 0; background:#fff7f0; border:1px solid #ffd8b8; border-radius:8px;">
                  <tr>
                    <td style="padding:16px; font-size:14px; color:#333;">
                      <p><strong>📌 Booking Title:</strong> ${BookingTitle}</p>
                      <p><strong>📅 Date:</strong> ${BookingDateStr}</p>
                      <p><strong>⏰ Time:</strong> ${Time}</p>
                      <p><strong>📧 User Email:</strong> ${UserEmail}</p>
                    </td>
                  </tr>
                </table>

                <!-- Booking ID Box -->
                <div style="
                  margin-top:20px;
                  background:#ffffff;
                  border:2px dashed #ff7a00;
                  padding:16px;
                  border-radius:8px;
                  text-align:center;
                ">
                  <p style="margin:0; font-size:14px; color:#444;">
                    Booking ID
                  </p>
                  <p style="
                    margin:6px 0 0;
                    font-size:18px;
                    font-weight:bold;
                    color:#ff7a00;
                    letter-spacing:1px;
                  ">
                    ${bookingId}
                  </p>
                  <p style="margin-top:8px; font-size:13px; color:#666;">
                    Open the admin dashboard and search this Booking ID to take action.
                  </p>
                </div>

                <p style="margin-top:20px; color:#444; font-size:15px;">
                  Please review the booking and update its status accordingly.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f5f5f5; padding:16px; text-align:center; font-size:12px; color:#777;">
                © ${new Date().getFullYear()} BookMyHall. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `;

  try {
    await sgmail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "New Booking Request Received",
      html: htmltemplate,
    });

    console.log("✅ Booking Request email sent successfully");
  } catch (error) {
    console.error("❌ Booking Request Email Error:", error);
  }
};

const BookingApproved = async (
  Firstname,
  Lastname,
  UserEmail,
  BookingDateStr,
  Time,
  BookingTitle,
  bookingId
) => {
  const Fullname = `${Firstname} ${Lastname}`;

  const htmltemplate = `
  <div style="margin:0; padding:0; background:#f9fafb; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">

          <!-- Main Card -->
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.06); overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:#ff7a00; padding:24px; text-align:center;">
                <h1 style="margin:0; font-size:22px; color:#ffffff;">
                  Booking Approved 🎉
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <h2 style="margin:0 0 10px; color:#111;">Hello ${Fullname},</h2>

                <p style="color:#444; font-size:15px; line-height:1.6;">
                  Your booking request has been <strong style="color:#ff7a00;">approved</strong>! Here are the details:
                </p>

                <!-- Booking Details -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="margin:20px 0; background:#fff7ed; border:1px solid #ffd8b8; border-radius:8px;">
                  <tr>
                    <td style="padding:16px; font-size:14px; color:#333;">
                      <p><strong>📌 Event Name:</strong> ${BookingTitle}</p>
                      <p><strong>📅 Date:</strong> ${BookingDateStr}</p>
                      <p><strong>⏰ Time:</strong> ${Time}</p>
                      <p><strong>📧 User Email:</strong> ${UserEmail}</p>
                    </td>
                  </tr>
                </table>

                <!-- Booking ID Box -->
                <div style="
                  margin-top:20px;
                  background:#ffffff;
                  border:2px dashed #ff7a00;
                  padding:16px;
                  border-radius:8px;
                  text-align:center;
                ">
                  <p style="margin:0; font-size:14px; color:#444;">
                    Booking ID
                  </p>
                  <p style="
                    margin:6px 0 0;
                    font-size:18px;
                    font-weight:bold;
                    color:#ff7a00;
                    letter-spacing:1px;
                  ">
                    ${bookingId}
                  </p>
                  <p style="margin-top:8px; font-size:13px; color:#666;">
                    Keep this ID for your reference.
                  </p>
                </div>

                <p style="margin-top:20px; color:#444; font-size:15px;">
                  We look forward to seeing you at your event!
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f5f5f5; padding:16px; text-align:center; font-size:12px; color:#777;">
                © ${new Date().getFullYear()} BookMyHall. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `;

  try {
    await sgmail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Your Booking Has Been Approved! 🎉",
      html: htmltemplate,
    });

    console.log("✅ Approved Booking email sent successfully");
  } catch (error) {
    console.error("❌ Approved Booking Email Error:", error);
  }
};

const BookingRejected = async (
  Firstname,
  Lastname,
  UserEmail,
  BookingDateStr,
  Time,
  BookingTitle,
  bookingId
) => {
  const Fullname = `${Firstname} ${Lastname}`;

  const htmltemplate = `
  <div style="margin:0; padding:0; background:#f9fafb; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">

          <!-- Main Card -->
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.06); overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:#ff7a00; padding:24px; text-align:center;">
                <h1 style="margin:0; font-size:22px; color:#ffffff;">
                  Booking Rejected ❌
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <h2 style="margin:0 0 10px; color:#111;">Hello ${Fullname},</h2>

                <p style="color:#444; font-size:15px; line-height:1.6;">
                  We’re sorry to inform you that your booking request has been 
                  <strong style="color:#ff7a00;">rejected</strong>.
                </p>

                <!-- Booking Details -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="margin:20px 0; background:#fff7ed; border:1px solid #ffd8b8; border-radius:8px;">
                  <tr>
                    <td style="padding:16px; font-size:14px; color:#333;">
                      <p><strong>📌 Event Name:</strong> ${BookingTitle}</p>
                      <p><strong>📅 Date:</strong> ${BookingDateStr}</p>
                      <p><strong>⏰ Time:</strong> ${Time}</p>
                      <p><strong>📧 User Email:</strong> ${UserEmail}</p>
                    </td>
                  </tr>
                </table>

                <!-- Booking ID Box -->
                <div style="
                  margin-top:20px;
                  background:#ffffff;
                  border:2px dashed #ff7a00;
                  padding:16px;
                  border-radius:8px;
                  text-align:center;
                ">
                  <p style="margin:0; font-size:14px; color:#444;">
                    Booking ID
                  </p>
                  <p style="
                    margin:6px 0 0;
                    font-size:18px;
                    font-weight:bold;
                    color:#ff7a00;
                    letter-spacing:1px;
                  ">
                    ${bookingId}
                  </p>
                  <p style="margin-top:8px; font-size:13px; color:#666;">
                    Keep this ID for your reference.
                  </p>
                </div>

                <p style="margin-top:20px; color:#444; font-size:15px;">
                  If you have any questions, feel free to contact support.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f5f5f5; padding:16px; text-align:center; font-size:12px; color:#777;">
                © ${new Date().getFullYear()} BookMyHall. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `;

  try {
    await sgmail.send({
      to: UserEmail,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Your Booking Has Been Rejected ❌",
      html: htmltemplate,
    });

    console.log("✅ Rejected Booking email sent successfully");
  } catch (error) {
    console.error("❌ Rejected Booking Email Error:", error);
  }
};

module.exports = {
  EmailVerify,
  PassReset,
  BookingRequest,
  BookingApproved,
  BookingRejected,
};
