import { ActionProvider, AgentKit, CdpWalletActionProvider, cdpWalletActionProvider, CreateAction, Network, walletActionProvider, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { decodeXPaymentResponse } from "x402-axios";
import { withPaymentInterceptor } from "x402-axios";
import { CdpClient } from "@coinbase/cdp-sdk";
import axios from "axios";
import { config } from "dotenv";
import { LocalAccount } from "viem";
import { toAccount } from "viem/accounts";

config();

interface ApiListing {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  costPerRequest: number;
  cid: string;
  _id?: string | { $oid: string };
}

class MarketplaceActionProvider extends ActionProvider<WalletProvider> {
    private cdpClient?: CdpClient;
    private serverAccount?: LocalAccount;

    constructor() {
      super("marketplace-provider", []);
      // Initialize CDP client asynchronously
      this.initializeCdpClient().catch(error => {
        console.error("Failed to initialize CDP client:", error);
      });
    }

    private async initializeCdpClient() {
      const apiKeyId = process.env.CDP_API_KEY_ID as string;
      const apiKeySecret = process.env.CDP_API_KEY_SECRET as string;
      const walletSecret = process.env.CDP_WALLET_SECRET as string;

      if (!apiKeyId || !apiKeySecret || !walletSecret) {
        console.error("Missing required CDP environment variables");
        throw new Error("Missing required CDP environment variables");
      }

      this.cdpClient = new CdpClient({
        apiKeyId,
        apiKeySecret,
        walletSecret,
      });

      const account = await this.cdpClient.evm.getOrCreateAccount({
        name: "x402",
      });

      this.serverAccount = toAccount<LocalAccount>(account as any);
    }

    // Helper method to find the best matching API based on user needs
    private findBestMatchingApi(apis: ApiListing[], userNeed: string): ApiListing | null {
      const userNeedLower = userNeed.toLowerCase();
      
      // First, try exact category match
      const categoryMatch = apis.find(api => 
        api.category.toLowerCase().includes(userNeedLower) ||
        userNeedLower.includes(api.category.toLowerCase())
      );
      if (categoryMatch) return categoryMatch;

      // Then, try name match
      const nameMatch = apis.find(api => 
        api.name.toLowerCase().includes(userNeedLower) ||
        userNeedLower.includes(api.name.toLowerCase())
      );
      if (nameMatch) return nameMatch;

      // Finally, try description match
      const descriptionMatch = apis.find(api => 
        api.description.toLowerCase().includes(userNeedLower) ||
        userNeedLower.includes(api.description.toLowerCase())
      );
      if (descriptionMatch) return descriptionMatch;

      return null;
    }

    //request faucet for usdc on base-sepolia and return the transaction hash
    //args: { address: string, network: string, token: string }
    //return: transaction hash
    async requestFaucet(args: { address: string, network: string, token: string }): Promise<string> {
      if (!this.cdpClient) {
        throw new Error("CDP client not initialized");
      }
      const network = args.network as "base-sepolia" | "ethereum-sepolia";
      const token = args.token as "eth" | "usdc" | "eurc" | "cbbtc";
      const eth = await this.cdpClient.evm.requestFaucet({
        address: args.address,
        network,
        token: token
      });
      return eth.transactionHash;
    }
  
    @CreateAction({
      name: "fetch-api-data",
      description: "Fetch data from a specific API in the marketplace using its CID",
      schema: z.object({
        apiCid: z.string().describe("The CID of the API to call"),
        data: z.string().optional().describe("Optional JSON data to send with POST request"),
        method: z.enum(["GET", "POST"]).optional().default("GET").describe("HTTP method to use")
      })
    })
    //AGENT DOES X402 PAYMENT FOR API CALLS
    //args: { apiCid: string, data?: string, method?: "GET" | "POST" }
    //return: string

    async fetchApiData(walletProvider: WalletProvider, args: { apiCid: string, data?: string, method?: "GET" | "POST" }): Promise<string> {
      try {
        // Ensure CDP client is initialized
        if (!this.serverAccount) {
          await this.initializeCdpClient();
        }
        
        const baseURL = process.env.RESOURCE_SERVER_URL || "http://localhost:4021";
        
        
        
        // Make the API request using the provided CID as query parameter
        const api = withPaymentInterceptor(
          axios.create({
            baseURL: `${baseURL}`,
          }),
          this.serverAccount
        );  

        const response = await api.get(`/aipi/${args.apiCid}?id=${args.apiCid}`);
        console.log(response);
        const paymentResponse = decodeXPaymentResponse(response?.headers["x-payment-response"]);
        console.log(paymentResponse);
        
        return JSON.stringify({
          success: true,
          apiCid: args.apiCid,
          data: response?.data,
          payment: paymentResponse,
          method: "GET"
        });

      } catch (error: any) {
        console.error("API Error:", error.response?.data || error);
        
        // Handle specific error cases
        if (error.response?.status === 404) {
          return JSON.stringify({
            error: "API not found or no longer available",
            apiCid: args.apiCid
          });
        }
        
        if (error.response?.status === 402) {
          return JSON.stringify({
            error: "Payment required but failed",
            apiCid: args.apiCid,
            details: error.response?.data
          });
        }

        return JSON.stringify({
          error: "Failed to fetch API data",
          apiCid: args.apiCid,
          details: error.response?.data?.error || error.message || 'Unknown error'
        });
      }
    }
  
    supportsNetwork = (network: Network) => true;
  }
  export const marketplaceActionProvider = () => new MarketplaceActionProvider();