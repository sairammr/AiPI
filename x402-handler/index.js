import express from "express";
import { paymentMiddleware } from 'x402-express';
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
//cors
app.use(cors());
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
