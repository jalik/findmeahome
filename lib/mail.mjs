import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import mailer from 'nodemailer';
import {
  AWS_ACCESS_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
} from './aws.mjs';

dotenv.config();

export const MAIL_FROM = process.env.MAIL_FROM;
export const MAIL_TO = process.env.MAIL_TO;
export const MAIL_CC = process.env.MAIL_CC;
export const MAIL_BCC = process.env.MAIL_BCC;

export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_USE_TLS = /^1|y|true$/i.test(process.env.SMTP_USE_TLS);
export const SMTP_PORT = process.env.SMTP_PORT || 25;

if (!MAIL_FROM || MAIL_FROM.length === 0) {
  throw new Error('MAIL_FROM is not defined');
}

const opts = {};

if (SMTP_USER && SMTP_PASS) {
  opts.host = SMTP_HOST;
  opts.port = SMTP_PORT;
  opts.secure = SMTP_USE_TLS;
  opts.auth = { user: SMTP_USER, pass: SMTP_PASS };
} else {
  const ses = new AWS.SES({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_ACCESS_KEY,
    },
  });
  opts.SES = { ses, aws: AWS };
}

export const transporter = mailer.createTransport(opts);

export async function sendMail(options) {
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    cc: MAIL_CC,
    bcc: MAIL_BCC,
    ...options,
  });
  console.info(`Email sent: ${info.response}`);
  return info;
}
