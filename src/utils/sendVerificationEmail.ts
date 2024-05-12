import createMailTransporter from './createMailTransporter';

const sendVerificationEmail = (user) => {
  let transporter = createMailTransporter();

  const mailOptions = {
    from: '"ArtOa ?" <vusal.novruzov.1@iliauni.edu.ge>', // sender address
    to: user?.email, // list of receivers
    subject: 'Verify your email', // Subject line
    html: `
    <body style="margin: 0; padding: 0; background-color: #333; background-image: linear-gradient(to bottom, #333, #000); color: #fff; border-radius: 10px;">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; padding-top: 30px; padding-bottom:30px;">
        <p style="font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6;">Hello ${user.firstName},</p>
        <p style="font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6;">Thank you for signing up! Please verify your email by clicking the button below:</p>
        <a href="${process.env.CLIENT_URL}/verify-email?emailToken=${user.emailToken}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(to bottom, #ff9f45, #ff784f); color: #fff; text-decoration: none; border-radius: 5px;">Verify your email</a>
      </div>
    </body>

    `, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
};

export default sendVerificationEmail;
