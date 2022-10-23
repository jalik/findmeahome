import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import fs from 'fs';
// import { S3 } from '@aws-sdk/client-s3';
// import { SES } from '@aws-sdk/client-ses';
import jQuery from 'jquery';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import mailer from 'nodemailer';

// Load parameters.
dotenv.config();
//
// const buffer = fs.readFileSync('.env');
// const env = dotenv.parse(buffer);
// Object.keys(env).forEach((key) => {
//   process.env[key] = env[key];
// });

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID_;
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET = process.env.S3_BUCKET;
const S3_OBJECT_KEY = process.env.S3_OBJECT_KEY || 'posts.json';
const MAIL_FROM = process.env.MAIL_FROM;
const MAIL_TO = process.env.MAIL_TO;
const MAIL_CC = process.env.MAIL_CC;
const MAIL_BCC = process.env.MAIL_BCC;

// Check parameters.

if (!AWS_ACCESS_KEY || AWS_ACCESS_KEY.length === 0) {
  throw new Error('AWS_ACCESS_KEY is not defined');
}
if (!AWS_ACCESS_KEY_ID || AWS_ACCESS_KEY_ID.length === 0) {
  throw new Error('AWS_ACCESS_KEY_ID is not defined');
}
if (!AWS_REGION || AWS_REGION.length === 0) {
  throw new Error('AWS_REGION is not defined');
}
if (!S3_BUCKET || S3_BUCKET.length === 0) {
  throw new Error('S3_BUCKET is not defined');
}
if (!S3_OBJECT_KEY || S3_OBJECT_KEY.length === 0) {
  throw new Error('S3_OBJECT_KEY is not defined');
}
if (!MAIL_FROM || MAIL_FROM.length === 0) {
  throw new Error('MAIL_FROM is not defined');
}

/**
 * AWS S3 client.
 * @type {S3}
 */
const s3 = new AWS.S3({
  region: AWS_REGION,
  apiVersion: '2010-12-01',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY,
  },
});

/**
 * AWS SES client.
 * @type {SES}
 */
const ses = new AWS.SES({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY,
  },
});

/**
 * Mailer.
 */
const transporter = mailer.createTransport({
  SES: { ses, aws: AWS },
});

/**
 * Loads posts.
 * @returns {Promise<any|*[]>}
 */
async function loadPosts() {
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
function savePosts(posts) {
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
async function scanUrls(urls, label = null) {
  const { posts } = await loadPosts();
  const postIds = posts.map((el) => el.postId);
  const newPosts = [];

  // Scan URLs.
  for (let i = 0; i < urls.length; i += 1) {
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
      from: MAIL_FROM,
      to: MAIL_TO,
      cc: MAIL_CC,
      bcc: MAIL_BCC,
      subject: `${newPosts.length} nouvelles annonces ${label ? `[${label}]` : ''}`,
      text: newPosts.map((el) => {
        const element = [el.title, el.price, el.date, el.link];
        return element.join('\r\n');
      }).join('\r\n\r\n'),
    };
    const info = await transporter.sendMail(options);
    console.info(`Email sent: ${info.response}`);

    // Save posts.
    await savePosts([...posts, ...newPosts]);
  }
}

export async function main() {
  await scanUrls([
    'https://www.petites-annonces.pf/annonces.php?c=5',
    // 'https://www.petites-annonces.pf/annonces.php?c=5&p=2',
  ], 'maisons');

  await scanUrls([
    'https://www.petites-annonces.pf/annonces.php?c=4',
    // 'https://www.petites-annonces.pf/annonces.php?c=4&p=2',
  ], 'appartements');

  await scanUrls([
    'https://www.petites-annonces.pf/annonces.php?c=7',
    // 'https://www.petites-annonces.pf/annonces.php?c=7&p=2',
  ], 'autres');
}
