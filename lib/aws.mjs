import dotenv from 'dotenv';

dotenv.config();

export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID_;
export const AWS_REGION = process.env.AWS_REGION;

// if (!AWS_ACCESS_KEY || AWS_ACCESS_KEY.length === 0) {
//   throw new Error('AWS_ACCESS_KEY is not defined');
// }
// if (!AWS_ACCESS_KEY_ID || AWS_ACCESS_KEY_ID.length === 0) {
//   throw new Error('AWS_ACCESS_KEY_ID is not defined');
// }
// if (!AWS_REGION || AWS_REGION.length === 0) {
//   throw new Error('AWS_REGION is not defined');
// }
