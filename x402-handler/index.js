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

const CIDS_FILE = path.join(process.cwd(), 'cids.json');

app.post('/store-listing', (req, res) => {
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
  console.log("Stored CID:", cid);
  res.json({ success: true });
});

app.get("/x402", async (req, res) => {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);

  const dynamicMiddleware = paymentMiddleware(
    receiver,
    {
      "GET /x402": {
        price: `$${price}`,
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
        charged: `$${price}`,
      },
    });
  });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
});
