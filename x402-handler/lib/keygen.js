import crypto from 'crypto';

export function generateApiKeyFromUuid(uuid) {
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not set in environment');
  }
  return crypto.createHash('sha256').update(uuid + PRIVATE_KEY).digest('hex');
}
