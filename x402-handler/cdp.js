import axios from "axios";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config();

const cdp = new CdpClient();
const account = await cdp.evm.createAccount();
const eth = await cdp.evm.requestFaucet({
  address: account.address,
  network: "base-sepolia",
  token: "eth"
});
// const usdc = await cdp.evm.requestFaucet({
//   address: account.address,
//   network: "base-sepolia",
//   token: "usdc"
// });
// console.log(eth)
// console.log(usdc)
// console.log(account.address)

// const privateKey = "//";

// const account = privateKeyToAccount(privateKey);

const api = withPaymentInterceptor(
  axios.create({
    baseURL: "http://localhost:4021",
  }),
  account,
);

api
  .get("/weather")
  .then(response => {
    console.log(response.data);

    const paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
    console.log(paymentResponse);
  })
  .catch(error => {
    console.error(error.response?.data);
  });
