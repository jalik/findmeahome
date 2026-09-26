import {
  AWS_ACCESS_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  S3_BUCKET
} from './env.mjs'
import { S3 } from '@aws-sdk/client-s3'

export const s3 = new S3({
  region: AWS_REGION,
  apiVersion: '2010-12-01',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY
  }
})

/**
 * Loads posts.
 * @param filename
 */
export async function loadPostsFromS3 (filename) {
  try {
    console.info(`Loading posts from S3: ${filename}`)
    const obj = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: filename
    })
    const text =  await obj.Body.transformToString()
    return JSON.parse(text)
  } catch (err) {
    return { posts: [] }
  }
}

/**
 * Saves posts.
 * @param posts
 * @param filename
 */
export function savePostsToS3 (filename, posts) {
  const data = {
    date: new Date(),
    posts
  }
  console.info(`Saving posts to S3: ${filename}`)
  return s3.putObject({
    Bucket: S3_BUCKET,
    Key: filename,
    Body: JSON.stringify(data, null, 2)
  })
}
