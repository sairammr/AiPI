import { ActionProvider,  CreateAction, Network, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { decodeXPaymentResponse } from "x402-axios";
import { withPaymentInterceptor } from "x402-axios";
import { CdpClient } from "@coinbase/cdp-sdk";
import axios from "axios";
import { config } from "dotenv";
import { LocalAccount } from "viem";
import { toAccount } from "viem/accounts";

// Load environment variables
config();

/**
 * Marketplace Action Provider for API calls with x402 payment integration
 * 
 * This class provides actions for interacting with APIs in the marketplace
 * through the x402 payment system. It handles CDP wallet integration and
 * manages API calls with automatic payment processing.
 */
class MarketplaceActionProvider extends ActionProvider<WalletProvider> {
    /** CDP client for blockchain interactions */
    private cdpClient?: CdpClient;
    
    /** Server account for making API calls */
    private serverAccount?: LocalAccount;

    /**
     * Constructor initializes the action provider and sets up CDP client
     */
    constructor() {
      super("marketplace-provider", []);
      // Initialize CDP client asynchronously
      this.initializeCdpClient().catch(error => {
        console.error("Failed to initialize CDP client:", error);
      });
    }

    /**
     * Initializes the CDP client and server account
     * This method sets up the necessary credentials and creates a server account
     * for making API calls with x402 payment integration
     * 
     * @throws {Error} If required environment variables are missing
     */
    private async initializeCdpClient() {
      const apiKeyId = process.env.CDP_API_KEY_ID as string;
      const apiKeySecret = process.env.CDP_API_KEY_SECRET as string;
      const walletSecret = process.env.CDP_WALLET_SECRET as string;

      if (!apiKeyId || !apiKeySecret || !walletSecret) {
        console.error("Missing required CDP environment variables");
        throw new Error("Missing required CDP environment variables");
      }

      // Initialize CDP client with credentials
      this.cdpClient = new CdpClient({
        apiKeyId,
        apiKeySecret,
        walletSecret,
      });

      // Create or get existing account for API calls
      const account = await this.cdpClient.evm.getOrCreateAccount({
        name: "x402",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.serverAccount = toAccount<LocalAccount>(account as any);
    }

    /**
     * Requests faucet funds for testing purposes
     * This method allows requesting test tokens on supported networks
     * 
     * @param args - Object containing address, network, and token information
     * @param args.address - The wallet address to receive funds
     * @param args.network - The network to request funds on (base-sepolia, ethereum-sepolia)
     * @param args.token - The token type to request (eth, usdc, eurc, cbbtc)
     * @returns Promise<string> - The transaction hash of the faucet request
     * @throws {Error} If CDP client is not initialized
     */
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
  
    /**
     * Action to fetch data from a specific API in the marketplace
     * This action makes API calls with automatic x402 payment processing
     * 
     * @param walletProvider - The wallet provider for payment processing
     * @param args - Object containing API call parameters
     * @param args.apiCid - The CID of the API to call (from IPFS)
     * @param args.data - Optional JSON data to send with POST request
     * @param args.method - HTTP method to use (GET or POST)
     * @returns Promise<string> - JSON string containing API response and payment details
     */
    @CreateAction({
      name: "fetch-api-data",
      description: "Fetch data from a specific API in the marketplace using its CID",
      schema: z.object({
        apiCid: z.string().describe("The CID of the API to call"),
        data: z.string().optional().describe("Optional JSON data to send with POST request"),
        method: z.enum(["GET", "POST"]).optional().default("GET").describe("HTTP method to use")
      })
    })
    async fetchApiData(walletProvider: WalletProvider, args: { apiCid: string, data?: string, method?: "GET" | "POST" }): Promise<string> {
      try {
        // Ensure CDP client is initialized before making API calls
        if (!this.serverAccount) {
          await this.initializeCdpClient();
        }
        
        // Get the base URL for the resource server
        const baseURL = process.env.RESOURCE_SERVER_URL || "http://localhost:4021";
        
        // Create axios instance with x402 payment interceptor
        // This automatically handles payment processing for API calls
        const api = withPaymentInterceptor(
          axios.create({
            baseURL: `${baseURL}`,
          }),
          this.serverAccount
        );

        // Make the API request using the provided CID as query parameter
        // The x402-handler expects the CID as ?id=<cid> parameter
        const response = await api.get(`/aipi/?id=${args.apiCid}`);
        
        // Decode the payment response from x402 headers
        const paymentResponse = decodeXPaymentResponse(response.headers["x-payment-response"]);
        console.log("Payment response:")
        console.log(paymentResponse);
        
        // Return only the essential information: API response and transaction hash
        return JSON.stringify({
          success: true,
          apiCid: args.apiCid,
          data: response?.data,
          payment: paymentResponse,
          method: "GET"
        });

      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("API Error:", error.response?.data || error);
        
        // Handle specific error cases with appropriate error messages
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

        // Return generic error for other cases
        return JSON.stringify({
          error: "Failed to fetch API data",
          apiCid: args.apiCid,
          details: error.response?.data?.error || error.message || 'Unknown error'
        });
      }
    }
  
    /**
     * Determines if this action provider supports a given network
     * Currently supports all networks
     * 
     * @param network - The network to check support for
     * @returns boolean - Always returns true (supports all networks)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    supportsNetwork = (network: Network) => true;
  }

/**
 * Factory function to create a new MarketplaceActionProvider instance
 * 
 * @returns MarketplaceActionProvider - A new instance of the marketplace action provider
 */
export const marketplaceActionProvider = () => new MarketplaceActionProvider();