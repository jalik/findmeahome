import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const FILE = process.env.FILE || 'posts.json';

export async function loadPostsFromFs() {
  let content;
  try {
    content = await fs.promises.readFile(FILE, { encoding: 'utf8' });
    return JSON.parse(String(content)) || { posts: [] };
  } catch {
  }
  return { posts: [] };
}

export async function savePostsToFs(posts) {
  const data = {
    date: new Date(),
    posts,
  };
  const text = JSON.stringify(data, null, 2);
  await fs.promises.writeFile(FILE, text);
}
