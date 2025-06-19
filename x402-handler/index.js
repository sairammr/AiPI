import express from "express";
import { paymentMiddleware } from 'x402-express';
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getJsonFromIpfs } from './lib/ipfs.js';
import { generateApiKeyFromUuid } from './lib/keygen.js';
const UUID_SEQ_FILE = path.join(process.cwd(), 'uuid-seq.json');

const CIDS_FILE = path.join(process.cwd(), 'cids.json');

app.post('/store-listing', async (req, res) => {
  const { cid } = req.body;
  if (!cid) {
    return res.status(400).json({ error: 'CID is required' });
  }
  let cids = [];
  if (fs.existsSync(CIDS_FILE)) {
    try {
      cids = JSON.parse(fs.readFileSync(CIDS_FILE, 'utf8'));
    } catch {
      cids = [];
    }
  }
  cids.push({ cid, timestamp: Date.now() });
  fs.writeFileSync(CIDS_FILE, JSON.stringify(cids, null, 2));
  res.json({ success: true });
});

app.get('/listings', async (req, res) => {
  let cids = [];
  try {
    if (fs.existsSync(CIDS_FILE)) {
      cids = JSON.parse(fs.readFileSync(CIDS_FILE, 'utf8'));
    }
  } catch (err) {
    return res.status(500).json({ error: 'Could not read cids.json' });
  }
  const unique = [];
  const seen = new Set();
  for (const entry of cids) {
    if (!seen.has(entry.cid)) {
      seen.add(entry.cid);
      unique.push(entry);

    }
  }
  res.json({ listings: unique });
});

app.get("/test-api", async (req, res) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);

  const dynamicMiddleware = paymentMiddleware(
    "0x38b09fF7F662D02402397653766ed795F9FD8f25",
    {
      "GET /test-api": {
        price: `$0.01`,
        network: "base-sepolia",
      },
    },
    {
      url: "https://x402.org/facilitator",
    }
  );

  dynamicMiddleware(req, res, () => {
    res.send({
      report: {
        status: "success",
        charged: `$0.01`,
      },
    });
  });
});
app.get("/api/:id", async (req, res) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const cid = searchParams.get("id");
  const dataParam = searchParams.get("data");

  const api = await getJsonFromIpfs(cid);
  if (!cid) {
    return res.status(400).json({ error: "Missing CID" });
  }
  if (!api) {
    return res.status(404).json({ error: "Cannot find API" });
  }
  const dynamicMiddleware = paymentMiddleware(
    receiver,
    {
      "GET /api/:id": {
        price: `$${api.price}`,
        network: "base-sepolia",
      },
    },
    {
      url: "https://x402.org/facilitator",
    }
  );
  let apiKey;
  generateApiKeyFromUuid(api.id).then(data => {
    apiKey = data.apiKey;
  });
  dynamicMiddleware(req, res, async () => {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["x-aipi-access-code"] = apiKey;
    if (dataParam) {
      fetch(api.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(JSON.parse(dataParam)),
      }).then(response => {
        res.send(response);
      })
    } else {
      fetch(api.endpoint, { headers: apiKey ? { "x-api-key": apiKey } : undefined }).then(response => {
        res.send(response);
      })
    }
  });
});
app.get("/api/health/:id", async (req, res) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const cid = searchParams.get("id");
  console.log(cid);
  const api = await getJsonFromIpfs(cid);
  if (!cid) {
    return res.status(400).json({ error: "Missing CID" });
  }
  if (!api) {
    return res.status(404).json({ error: "Cannot find API" });
  }
  let apiKey;
  generateApiKeyFromUuid(api.id).then(data => {
    apiKey = data.apiKey;
    const headers = apiKey ? { "x-api-key": apiKey } : undefined;
    fetch(api.endpoint + '/health', { headers }).then(response => {
      if (response.ok) {
        res.send({
          report: {
            status: "online",
        },
      });
    } else {
      res.send({
        report: {
          status: "offline",
        },
      });
    }
  })  
})
});

app.post('/keygen', async (req, res) => {
  const { cid } = req.body;
  if (!cid) {
    return res.status(400).json({ error: 'CID is required' });
  }
  let seq = 1;
  if (fs.existsSync(UUID_SEQ_FILE)) {
    try {
      seq = JSON.parse(fs.readFileSync(UUID_SEQ_FILE, 'utf8'));
      if (typeof seq !== 'number' || !Number.isFinite(seq)) seq = 1;
    } catch {
      seq = 1;
    }
  }
  const randomStr = Math.random().toString(36).slice(2, 10) + crypto.randomBytes(4).toString('hex');
  const uuid = `aipi-${seq}-${randomStr}`;
  fs.writeFileSync(UUID_SEQ_FILE, String(seq + 1));
  let apiKey;
  generateApiKeyFromUuid(uuid).then((data) => {
    apiKey = data.apiKey;
    res.json({ apiKey, uuid });
  });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
});
