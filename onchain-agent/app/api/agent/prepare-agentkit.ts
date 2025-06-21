import {
  AgentKit,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  CdpWalletProvider,
  erc20ActionProvider,
  pythActionProvider,
  walletActionProvider,
  WalletProvider,
  wethActionProvider,
} from "@coinbase/agentkit";
import * as fs from "fs";
import { marketplaceActionProvider } from "./apiMarketplaceActionProvider";


// Configure a file to persist the agent's CDP MPC Wallet Data
// This allows the wallet to maintain state across application restarts
const WALLET_DATA_FILE = "wallet_data.txt";

/**
 * Prepares the AgentKit and WalletProvider for the AI agent
 * 
 * This function initializes all necessary components for the agent to function:
 * - CDP Wallet Provider for blockchain interactions
 * - AgentKit with all required action providers
 * - Wallet data persistence for state management
 * 
 * @function prepareAgentkitAndWalletProvider
 * @returns {Promise<{ agentkit: AgentKit, walletProvider: WalletProvider }>} 
 *          The initialized AgentKit and WalletProvider instances
 *
 * @description Handles complete agent setup including:
 * - Environment variable validation
 * - Wallet data persistence
 * - CDP wallet configuration
 * - Action provider registration
 * - AgentKit initialization
 *
 * @throws {Error} If required environment variables are missing or initialization fails
 */
export async function prepareAgentkitAndWalletProvider(): Promise<{
  agentkit: AgentKit;
  walletProvider: WalletProvider;
}> {
  // Validate required environment variables for CDP integration
  if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
    throw new Error(
      "I need both CDP_API_KEY_ID and CDP_API_KEY_SECRET in your .env file to connect to the Coinbase Developer Platform.",
    );
  }

  try {
    let walletDataStr: string | null = null;

    // Read existing wallet data if available for persistence
    // This allows the wallet to maintain state across application restarts
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
        console.log("Found existing wallet data, restoring wallet state...");
      } catch (error) {
        console.error("Error reading wallet data:", error);
        // Continue without wallet data - a new wallet will be created
      }
    }

    // Initialize WalletProvider with CDP integration
    // This provides the agent with blockchain wallet capabilities
    // Learn more: https://docs.cdp.coinbase.com/agentkit/docs/wallet-management
    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
      networkId: process.env.NETWORK_ID || "base-sepolia", // Default to base-sepolia for testing
      cdpWalletData: walletDataStr || undefined, // Use existing wallet data if available
    });

    // Initialize AgentKit with all required action providers
    // This defines what actions the agent can perform
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        // Built-in action providers for common blockchain operations
        wethActionProvider(),        
        pythActionProvider(),       
        walletActionProvider(),      
        erc20ActionProvider(),       
        cdpApiActionProvider({
          apiKeyId: process.env.CDP_API_KEY_ID,
          apiKeySecret: process.env.CDP_API_KEY_SECRET,
        }),
        cdpWalletActionProvider({
          apiKeyId: process.env.CDP_API_KEY_ID,
          apiKeySecret: process.env.CDP_API_KEY_SECRET,
        }),
        
        marketplaceActionProvider(),
      ],
    });

    console.log("AgentKit and WalletProvider initialized successfully");
    return { agentkit, walletProvider };
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
}
