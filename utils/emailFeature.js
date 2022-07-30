const Email = require('nodemailer');

const mail = async (options) => {
  //create transporter
  const transporter = Email.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //set options
  const mailOptions = {
    from: process.env.SENDERS_MAIL,
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  //send mail
  await transporter.sendMail(mailOptions);
};

module.exports = mail;
