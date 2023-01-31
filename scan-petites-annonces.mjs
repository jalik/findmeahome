import dotenv from 'dotenv';
import jQuery from 'jquery';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import {
  loadPosts,
  savePosts,
} from './lib/data.mjs';
import { sendMail } from './lib/mail.mjs';

dotenv.config();

/**
 * Scans a URL.
 * @param {string} url
 * @returns {Promise<[*[], *[]]>}
 */
export async function scanUrl(url) {
  const resp = await fetch(url);
  const html = await resp.text();

  const dom = new JSDOM(html);
  const $ = jQuery(dom.window);
  const posts = [];

  $('#c1 a.lda').each(async (i, el) => {
    const link = 'https://www.petites-annonces.pf/' + el.href;
    const postId = link.replace(/^[^=]+=/g, '');
    const title = $('.pa p:eq(0)', el).text();
    const price = $('.pa .ap', el).text();
    const date = $('.da span', el).text().replace(/[> ]/g, '').replace(/^\(PRO\)/g, '');

    if (postId != null) {
      posts.push({ postId, title, price, date, link });
    }
  });
  return posts;
}

/**
 * Scan URLs and send new posts by email.
 * @param {string[]} urls
 * @param {null|string} label
 * @returns {Promise<void>}
 */
export async function scanUrls(urls, label = null) {
  const { posts } = await loadPosts();
  const postIds = posts.map((el) => el.postId);
  const newPosts = [];

  // Scan URLs.
  for (let i = 0; i < urls.length; i += 1) {
    // console.info(`Scanning ${urls[i]}`);
    const results = await scanUrl(urls[i]);

    for (let j = 0; j < results.length; j += 1) {
      const post = results[j];
      const { postId, date, title, price, link } = post;

      if (!postIds.includes(postId)) {
        console.info(`Found new post: ${date} - ${title} (${price}) ${link}`);
        newPosts.push(post);
      }
    }
  }

  // Send new posts by email.
  if (newPosts.length > 0) {
    const options = {
      subject: `${newPosts.length} nouvelles annonces ${label ? `[${label}]` : ''}`,
      text: newPosts.map((el) => {
        const element = [el.title, el.price, el.date, el.link];
        return element.join('\r\n');
      }).join('\r\n\r\n'),
    };
    await sendMail(options);

    // Save posts.
    await savePosts([...posts, ...newPosts]);
  }
}

export async function main() {
  const [node, script, url, label] = process.argv;
  await scanUrls([url], label);
}

main().then(() => {

});
