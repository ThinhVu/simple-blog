import nodemailer from 'nodemailer';

let mailSender;
try {
   const mailConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASSWORD
      },
      secureConnection: false,
      secure: false, // process.env.NODE_ENV === 'production',
      tls: { ciphers: 'SSLv3' },
   }
   console.log('init mail config', JSON.stringify(mailConfig))
   mailSender = nodemailer.createTransport(mailConfig)
} catch (e) {
   console.error('failed to initialize mail sender', e)
}

export const sendEmail = ({ to, subject, html }) => {
  return new Promise((resolve, reject) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('You need to provide EMAIL_USER and EMAIL_PASSWORD environment variables for sending emails.');
      return resolve('An error occurred while sending an email: (Credentials missing).');
    }

     mailSender.sendMail(
      {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      },
      function (err, info) {
        if (err) {
          console.log('An error occurred while sending an email: ', err);
          return reject(err);
        } else {
          return resolve(info);
        }
      }
    );
  });
};
