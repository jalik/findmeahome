import {
  loadPostsFromFs,
  savePostsToFs,
} from './data-fs.mjs';
import {
  loadPostsFromS3,
  S3_BUCKET,
  savePostsToS3,
} from './data-s3.mjs';

const USE_S3 = S3_BUCKET != null && S3_BUCKET.length > 0;

export function loadPosts() {
  if (USE_S3) {
    return loadPostsFromS3();
  }
  return loadPostsFromFs();
}

export async function savePosts(posts) {
  if (USE_S3) {
    await savePostsToS3(posts);
  } else {
    await savePostsToFs(posts);
  }
}
