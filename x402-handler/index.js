import express from "express";
import { paymentMiddleware } from 'x402-express';
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

import fs from 'fs';
import crypto from 'crypto';
import { getJsonFromIpfs } from './lib/ipfs.js';
import { generateApiKeyFromUuid } from './lib/keygen.js';
import { listApis, storeApi, logUsage, getUsageLogsByApiId } from './lib/mongodb.js';

const UUID_SEQ_FILE = process.cwd() + '/uuid-seq.json';

app.post('/store-listing', async (req, res) => {
  const { cid, ownerId } = req.body;
  if (!cid) {
    return res.status(400).json({ error: 'CID is required' });
  }
  try {
    const insertedId = await storeApi({ cid, ownerId });
    res.json({ success: true, id: insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to store API' });
  }
});

app.get('/listings', async (req, res) => {
  try {
    const apis = await listApis();
    res.json({ listings: apis });
  } catch (err) {
    res.status(500).json({ error: 'Could not read APIs from database' });
  }
});

app.get("/test-api", async (req, res) => {
  console.log("logger")
 res.send({
   report: {
     status: "success",
     data:"hello world"
   },
 });
});
app.get("/aipi/", async (req, res) => {
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
    process.env.SERVER_FUND_ADDRESS,
    {
      "GET /aipi/": {
        price: `$${api.costPerRequest}`,
        network: "base-sepolia",
      },
    },
    {
      url: "https://x402.org/facilitator",
    }
  );
  let apiKey = generateApiKeyFromUuid(api.id);
  dynamicMiddleware(req, res, async () => {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["x-aipi-access-code"] = apiKey;
    let responseStatus = 200;
    let responseTimeMs = 0;
    let start = Date.now();
    try {
      let response;
      if (dataParam) {
        response = await fetch(api.endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(JSON.parse(dataParam)),
        });
      } else {
        response = await fetch(api.endpoint, { headers: apiKey ? { "x-api-key": apiKey } : undefined });
      }
      responseStatus = response.status;
      responseTimeMs = Date.now() - start;
      res.send(await response.json());
      if (api._id) {
        await logUsage({ apiId: api._id.$oid || api._id, responseStatus, responseTimeMs });
      }
    } catch (err) {
      responseStatus = 500;
      responseTimeMs = Date.now() - start;
      res.status(500).json({ error: 'API call failed' });
      if (api._id) {
        await logUsage({ apiId: api._id.$oid || api._id, responseStatus, responseTimeMs });
      }
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
  let apiKey = generateApiKeyFromUuid(api.id);
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
  });  
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
  let apiKey = generateApiKeyFromUuid(uuid);
  res.json({ apiKey, uuid });
});

app.get('/usage/:apiId', async (req, res) => {
  const { apiId } = req.params;
  if (!apiId) {
    return res.status(400).json({ error: 'apiId is required' });
  }
  try {
    const logs = await getUsageLogsByApiId(apiId, 1000);
    const formatted = logs.map(log => ({
      timestamp: log.timestamp,
      responseStatus: log.responseStatus,
      responseTimeMs: log.responseTimeMs
    }));
    res.json({ apiId, usage: formatted ,usageCount: logs.length});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch usage logs' });
  }
});

// Function to add mock usage stats for a given API
async function addMockUsageStats(apiId, count = 50) {
  for (let i = 0; i < count; i++) {
    const responseStatus = [200, 201, 400, 401, 403, 404, 500][Math.floor(Math.random() * 7)];
    const responseTimeMs = Math.floor(Math.random() * 800) + 100; // 100-900ms
    await logUsage(apiId, responseStatus, responseTimeMs);
  }
  return count;
}

// Endpoint to trigger mock usage stat insertion
app.get('/mock-usage/:apiId', async (req, res) => {
  const { apiId } = req.params;
  if (!apiId) return res.status(400).json({ error: 'apiId is required' });
  const inserted = await addMockUsageStats(apiId);
  res.json({ message: `Inserted ${inserted} mock usage logs for ${apiId}` });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
});
