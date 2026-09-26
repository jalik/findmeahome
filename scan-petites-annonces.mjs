import jQuery from 'jquery'
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import { sendMail } from './lib/mail.mjs'
import { loadPosts, savePosts } from './lib/posts.mjs'
import { S3_OBJECT_KEY } from './lib/env.mjs'

/**
 * Scans a URL.
 * @param url
 */
export async function scanUrl (url) {
  const resp = await fetch(url)
  const html = await resp.text()

  const dom = new JSDOM(html)
  const $ = jQuery(dom.window)
  const posts = []

  $('.lda').each(async (i, el) => {
    const link = 'https://www.petites-annonces.pf/' + el.href
    const postId = link.replace(/^[^=]+=/g, '')
    const title = $('.pa p:eq(0)', el).text()
    const price = $('.pa .ap', el).text()
    const date = $('.da span', el)
      .text()
      .replace(/[> ]/g, '')
      .replace(/^\(PRO\)/g, '')

    if (postId != null) {
      posts.push({ postId, title, price, date, link })
    }
  })
  return posts
}

/**
 * Scan URLs and send new posts by email.
 * @param urls
 * @param label
 */
export async function scanUrls (urls, label = S3_OBJECT_KEY) {
  const filename = label + '.json'
  const data = await loadPosts(filename)
  const posts = data.posts || []
  const postIds = posts.map((el) => el.postId)
  const newPosts = []

  // Scan URLs.
  for (let i = 0; i < urls.length; i += 1) {
    // console.info(`Scanning ${urls[i]}`);
    const results = await scanUrl(urls[i])

    for (let j = 0; j < results.length; j += 1) {
      const post = results[j]
      const { postId, date, title, price, link } = post

      if (!postIds.includes(postId)) {
        console.info(`New post: #${postId} - ${date} - ${title} (${price}) ${link}`)
        newPosts.push(post)
      }
    }
  }

  // Send new posts by email.
  if (newPosts.length > 0) {
    const options = {
      subject: `${newPosts.length} nouvelles annonces ${label
        ? `[${label}]`
        : ''}`,
      text: newPosts.map((el) => {
        const element = [el.title, el.price, el.date, el.link]
        return element.join('\r\n')
      }).join('\r\n\r\n')
    }
    await sendMail(options)

    // Save posts.
    await savePosts([...posts, ...newPosts], filename)
  }
}

export async function main () {
  const [node, script, url, label] = process.argv
  await scanUrls([url], label)
}

main().then(() => {
  console.info('DONE')
})
