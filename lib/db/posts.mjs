import { loadPostsFromS3, savePostsToS3 } from '../s3.mjs'
import { loadPostsFromFile, savePostsToFile } from '../io.mjs'
import { S3_BUCKET } from '../env.mjs'

const USE_S3 = S3_BUCKET != null && S3_BUCKET.length > 0

export function loadPosts (filename) {
  if (USE_S3) {
    return loadPostsFromS3(filename)
  }
  return loadPostsFromFile(filename)
}

export async function savePosts (posts, filename) {
  if (USE_S3) {
    await savePostsToS3(filename, posts)
  } else {
    await savePostsToFile(filename, posts)
  }
}
