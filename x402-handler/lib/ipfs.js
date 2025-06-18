const fetch = require('node-fetch');

async function getJsonFromIpfs(cid) {
  if (!cid) throw new Error('CID is required');
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch from IPFS: ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error(`IPFS fetch error: ${err.message}`);
  }
}

module.exports = { getJsonFromIpfs };
