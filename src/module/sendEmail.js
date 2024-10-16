import { createTransport } from "nodemailer";

export const sendEmail = async (options) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const { to, subject, text } = options;

  const mailOptions = { from: process.env.EMAIL_ADDRESS, to, subject, text };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
