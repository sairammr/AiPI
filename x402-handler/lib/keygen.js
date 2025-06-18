const crypto = require('crypto');

async function getCidAndApiKey(cid) {
  const secret = crypto.randomBytes(32);
  const hmac = crypto.createHmac('sha512', secret).update(cid).digest('base64url');
  const apiKey = hmac.length >= 64 ? hmac.slice(0, 64) : (hmac + crypto.randomBytes(64 - hmac.length).toString('base64url')).slice(0, 64);
  return { apiKey };
}

module.exports = { getCidAndApiKey };
