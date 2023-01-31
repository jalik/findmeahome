import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import {
  AWS_ACCESS_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
} from './aws.mjs';

dotenv.config();

export const S3_BUCKET = process.env.S3_BUCKET;
export const S3_OBJECT_KEY = process.env.S3_OBJECT_KEY || 'posts.json';

// if (!S3_BUCKET || S3_BUCKET.length === 0) {
//   throw new Error('S3_BUCKET is not defined');
// }
// if (!S3_OBJECT_KEY || S3_OBJECT_KEY.length === 0) {
//   throw new Error('S3_OBJECT_KEY is not defined');
// }

export const s3 = new AWS.S3({
  region: AWS_REGION,
  apiVersion: '2010-12-01',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY,
  },
});

/**
 * Loads posts.
 * @returns {Promise<any|*[]>}
 */
export async function loadPostsFromS3() {
  try {
    const obj = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: S3_OBJECT_KEY,
    }).promise();
    return JSON.parse(String(obj.Body));
  } catch (err) {
    return { posts: [] };
  }
}

/**
 * Saves posts.
 * @param {*[]} posts
 * @returns {Promise<void>}
 */
export function savePostsToS3(posts) {
  const data = {
    date: new Date(),
    posts,
  };
  const jsonText = JSON.stringify(data, null, 2);
  return s3.putObject({
    Bucket: S3_BUCKET,
    Key: S3_OBJECT_KEY,
    Body: jsonText,
  }).promise();
}
