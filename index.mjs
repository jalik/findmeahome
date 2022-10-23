import { main } from './lib.mjs';

export async function handler(event) {
  const response = {
    statusCode: 200,
    body: 'OK',
  };

  try {
    await main();
  } catch (err) {
    response.response = 500;
    response.body = 'Server error';
  }
  return response;
}
