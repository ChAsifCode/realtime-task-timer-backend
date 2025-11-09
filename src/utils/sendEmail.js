import nodemailer from "nodemailer";
import config from "../config/keys.js";

const transporter = nodemailer.createTransport({
  host: config.EMAIL.HOST,
  port: config.EMAIL.PORT,
  secure: false,
  auth: {
    user: config.EMAIL.USER,
    pass: config.EMAIL.PASS,
  },
});
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP Connection Error:", err);
  } else {
    // console.log("SMTP Server is ready to send messages!");
  }
});
const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const mailOptions = {
      from: `${config.EMAIL.NAME}<${config.EMAIL.FROM}>`,
      to,
      subject,
      text,
      html,
      attachments,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.log(error);

    throw error;
  }
};
export { sendEmail };
