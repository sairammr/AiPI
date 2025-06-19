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
    async requestFaucet(args: { address: string, network: string, token: string }): Promise<string> {
      if (!this.cdpClient) {
        throw new Error("CDP client not initialized");
      }
      const network = args.network as "base-sepolia" | "ethereum-sepolia";
      const token = args.token as "eth" | "usdc" | "eurc" | "cbbtc";
      const eth = await this.cdpClient.evm.requestFaucet({
        address: args.address,
        network,
        token: "usdc"
      });
      return eth.transactionHash;
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
        // Ensure CDP client is initialized
        if (!this.serverAccount) {
          await this.initializeCdpClient();
        }
        const eth = await this.requestFaucet({
          address: this.serverAccount?.address || "",
          network: "base-sepolia",
          token: "usdc"
        });
        console.log("eth", eth)
        const baseURL = process.env.RESOURCE_SERVER_URL || "http://localhost:4021";
        const endpointPath = args.endpoint || process.env.ENDPOINT_PATH || "/test-api";
        console.log("baseURL", baseURL);
        console.log("endpointPath", endpointPath);
        console.log(this.serverAccount)

        const api = withPaymentInterceptor(
          axios.create({
            baseURL,
          }),
          this.serverAccount
        );
        console.log(api)
      
        const response = await api.get(endpointPath);
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