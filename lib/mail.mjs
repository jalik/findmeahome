import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import { createTransport } from 'nodemailer'
import {
  AWS_ACCESS_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  MAIL_BCC,
  MAIL_CC,
  MAIL_FROM,
  MAIL_TO,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USE_TLS,
  SMTP_USER
} from './env.mjs'

let transporter = null

if (SMTP_USER && SMTP_PASS) {
  transporter = createTransport({
    secure: SMTP_USE_TLS,
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  })
} else {
  transporter = createTransport({
    SES: {
      sesClient: new SESv2Client({
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_ACCESS_KEY
        },
        region: AWS_REGION
      }),
      SendEmailCommand
    },
    rateLimit: 1,
    rateDelta: 60000
  })
}

/**
 * Sends an email.
 * @param options
 */
export async function sendMail (options) {
  if (!MAIL_FROM || MAIL_FROM.length === 0) {
    throw new Error('MAIL_FROM is not defined')
  }
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    cc: MAIL_CC,
    bcc: MAIL_BCC,
    ...options
  })
  console.info(`Email sent: ${info.response}`)
  return info
}
