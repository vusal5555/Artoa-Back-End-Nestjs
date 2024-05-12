import * as nodemailer from 'nodemailer';
const createMailTransporter = () => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vusal.novruzov.1@iliauni.edu.ge',
      pass: 'vusal5555',
    },
  });

  return transporter;
};

export default createMailTransporter;
