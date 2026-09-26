import dotenv from 'dotenv'

dotenv.config()

// AWS config.
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_REGION = process.env.AWS_REGION

// Email config.
export const MAIL_FROM = process.env.MAIL_FROM
export const MAIL_TO = process.env.MAIL_TO
export const MAIL_CC = process.env.MAIL_CC
export const MAIL_BCC = process.env.MAIL_BCC

// SMTP config.
export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_USE_TLS = /^1|y|true$/i.test(process.env.SMTP_USE_TLS)
export const SMTP_PORT = process.env.SMTP_PORT || 25

// S3 config.
export const S3_BUCKET = process.env.S3_BUCKET
export const S3_OBJECT_KEY = process.env.S3_OBJECT_KEY || 'posts'
