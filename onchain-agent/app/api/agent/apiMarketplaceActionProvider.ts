import { ActionProvider, CdpWalletActionProvider, cdpWalletActionProvider, CreateAction, Network, walletActionProvider, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { decodeXPaymentResponse } from "x402-axios";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";
import { CdpClient } from "@coinbase/cdp-sdk";

  
class MarketplaceActionProvider extends ActionProvider<WalletProvider> {
    constructor() {
      super("marketplace-provider", []);
    }
  
    @CreateAction({
      name: "fetch-api-data",
      description: "Fetch data from an API in the marketplace",
      schema: z.object({
        apiType: z.string(),
        endpoint: z.string().optional()
      })
    })
    async fetchApiData(walletProvider: WalletProvider, args: { apiType: string, endpoint?: string }): Promise<string> {
      try {
        

        const api = withPaymentInterceptor(
          axios.create({
            baseURL: "http://localhost:4021",
          }),
          walletProvider
        )
      
        const response = await api.get("/test-api");
        const paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
        return JSON.stringify({
          data: response.data,
          payment: paymentResponse
        });
      } catch (error: any) {
        console.error("API Error:", error.response?.data || error);
        return `Error fetching data: ${error.response?.data?.error || error.message || 'Unknown error'}`;
      }
    }
  
    supportsNetwork = (network: Network) => true;
  }
  export const marketplaceActionProvider = () => new MarketplaceActionProvider();