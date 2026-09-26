import fs from 'node:fs'

export async function loadPostsFromFile (filename) {
  let content
  try {
    console.info(`Loading posts from file: ${filename}`)
    content = await fs.promises.readFile(filename, { encoding: 'utf8' })
    return JSON.parse(String(content)) || { posts: [] }
  } catch {
  }
  return { posts: [] }
}

export async function savePostsToFile (filename, posts) {
  const data = {
    date: new Date(),
    posts
  }
  const text = JSON.stringify(data, null, 2)
  console.info(`Saving posts to S3: ${filename}`)
  await fs.promises.writeFile(filename, text)
}
