import { openai } from "@ai-sdk/openai";
import { getVercelAITools } from "@coinbase/agentkit-vercel-ai-sdk";
import { prepareAgentkitAndWalletProvider } from "./prepare-agentkit";
import axios from "axios";

/**
 * Interface defining the structure of an API listing in the marketplace
 */
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

/**
 * Fetches available APIs from the marketplace with IPFS data
 * This function retrieves the basic listing information and then fetches
 * the complete API metadata from IPFS for each listing
 * 
 * @returns Promise<ApiListing[]> Array of API listings with complete metadata
 */
async function fetchAvailableApis(): Promise<ApiListing[]> {
  try {
    const baseURL = process.env.RESOURCE_SERVER_URL || "http://localhost:4021";
    const response = await axios.get(`${baseURL}/listings`);
    console.log("Raw listings response:", response.data);
    
    if (!response.data.listings) {
      console.log("No listings found in response");
      return [];
    }

    // Fetch IPFS data for each listing to get complete API metadata
    const apisWithIpfsData = await Promise.all(
      response.data.listings.map(async (item: { cid: string; timestamp: number }) => {
        try {
          const ipfsRes = await axios.get(`https://gateway.pinata.cloud/ipfs/${item.cid}`);
          if (!ipfsRes.data) {
            console.log(`No IPFS data found for CID: ${item.cid}`);
            return { 
              cid: item.cid, 
              timestamp: item.timestamp, 
              error: "Could not fetch from IPFS",
              name: `Unknown API (${item.cid})`,
              description: "API data not available",
              category: "unknown",
              endpoint: "",
              costPerRequest: 0
            };
          }
          
          const ipfsData = ipfsRes.data;
          console.log(`IPFS data for ${item.cid}:`, ipfsData);
          
          return { 
            ...ipfsData, 
            cid: item.cid, 
            timestamp: item.timestamp 
          };
        } catch (error) {
          console.error(`Error fetching IPFS data for ${item.cid}:`, error);
          return { 
            cid: item.cid, 
            timestamp: item.timestamp, 
            error: "Could not fetch from IPFS",
            name: `Unknown API (${item.cid})`,
            description: "API data not available",
            category: "unknown",
            endpoint: "",
            costPerRequest: 0
          };
        }
      })
    );

    console.log(`Successfully fetched ${apisWithIpfsData.length} APIs with IPFS data`);
    return apisWithIpfsData;
  } catch (error) {
    console.error("Failed to fetch API listings:", error);
    return [];
  }
}

/**
 * Agent Configuration Guide
 *
 * This file handles the core configuration of your AI agent's behavior and capabilities.
 *
 * Key Steps to Customize Your Agent:
 *
 * 1. Select your LLM:
 *    - Modify the `openai` instantiation to choose your preferred LLM
 *    - Configure model parameters like temperature and max tokens
 *
 * 2. Instantiate your Agent:
 *    - Pass the LLM, tools, and memory into `createReactAgent()`
 *    - Configure agent-specific parameters
 */

/**
 * Type definition for the AI agent configuration
 */
type Agent = {
  tools: ReturnType<typeof getVercelAITools>;
  system: string;
  model: ReturnType<typeof openai>;
  maxSteps?: number;
  availableApis: ApiListing[];
};

// Global agent instance for singleton pattern
let agent: Agent;

/**
 * Initializes and returns an instance of the AI agent.
 * If an agent instance already exists, it returns the existing one.
 * This function sets up the agent with marketplace API context and
 * configures the system prompt for API call confirmations.
 *
 * @function createAgent
 * @returns {Promise<Agent>} The initialized AI agent with marketplace context
 *
 * @description Handles complete agent setup including:
 * - LLM initialization
 * - Marketplace API fetching
 * - System prompt configuration
 * - Tool integration
 *
 * @throws {Error} If the agent initialization fails or required env vars are missing
 */
export async function createAgent(): Promise<Agent> {
  // If agent has already been initialized, return it (singleton pattern)
  if (agent) {
    return agent;
  }

  // Validate required environment variables
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("I need an OPENAI_API_KEY in your .env file to power my intelligence.");
  }

  // Initialize AgentKit and WalletProvider
  const { agentkit, walletProvider } = await prepareAgentkitAndWalletProvider();

  try {
    // Initialize LLM: https://platform.openai.com/docs/models#gpt-4o
    const model = openai("gpt-4o-mini");

    // Fetch available APIs from marketplace with IPFS data
    console.log("Fetching available APIs for agent context...");
    const availableApis = await fetchAvailableApis();
    console.log(`Found ${availableApis.length} APIs in marketplace`);

    // Create API listings context for the agent
    const apiListingsContext = availableApis.length > 0 
      ? `\n\nAVAILABLE APIs IN MARKETPLACE:\n${availableApis.map(api => 
          `- ${api.name} (${api.category}): ${api.description} - Cost: $${api.costPerRequest} per request - CID: ${api.cid}`
        ).join('\n')}`
      : "\n\nNo APIs currently available in the marketplace.";

    // Initialize Agent with faucet capability check
    const canUseFaucet = walletProvider.getNetwork().networkId == "base-sepolia";
    const faucetMessage = `If you ever need funds, you can request them from the faucet.`;
    const cantUseFaucetMessage = `If you need funds, you can provide your wallet details and request funds from the user.`;
    
    /**
     * System prompt configuration for the AI agent
     * This defines the agent's behavior, capabilities, and interaction patterns
     */
    const system = `
        You are an API marketplace agent that helps users access various API services through x402 payment integration.
        Your main purpose is to help users find and access API endpoints stored in the IPFS registry.
        
        CRITICAL: API CALL CONFIRMATION PROTOCOL
        Before making ANY API call, you MUST follow this double confirmation process:
        1. First, identify the appropriate API and inform the user about:
           - The specific API you plan to use
           - The cost per request
           - What data will be returned
        2. Ask for explicit confirmation: "Should I proceed with this API call?"
        3. Wait for user confirmation before proceeding
        4. Only after user confirms, make the API call using the fetch-api-data tool
        
        RESPONSE FORMAT:
        After successful API calls, ONLY return:
        - The API response data
        - The transaction hash from the payment
        
        Do NOT include any other information, explanations, or commentary in the final response.
        
        When a user requests data or services, you will:
        1. Analyze their request and identify what type of API they need
        2. Search through the available APIs in your context to find the best match
        3. Present the API details and cost to the user for confirmation
        4. Wait for explicit user confirmation
        5. Use the fetch-api-data tool with the appropriate API CID to make the request
        6. Return only the API response and transaction hash
        
        IMPORTANT: You have access to the current marketplace APIs in your context. Use this information to:
        - Match user requests to available APIs
        - Provide information about available services and their costs
        - Suggest alternatives if the exact API isn't available
        - Use the exact CID when calling the fetch-api-data tool
        - Always confirm before making any API calls
        
        If the requested API is not found in your available APIs list, inform the user and suggest they add it to the marketplace.
        
        For any API calls, payment will be automatically handled through x402 integration.
        If there are any payment-related errors, I will inform the user about the required payment details.
        
        I can help with:
        - Finding appropriate APIs in the marketplace
        - Making authenticated API calls with x402 payment (after confirmation)
        - Handling API responses and payment confirmations
        - Suggesting new APIs to be added to the marketplace
        - Providing information about available services and their costs
        ${apiListingsContext}
        `;
    
    // Initialize tools from AgentKit
    const tools = getVercelAITools(agentkit);

    // Create and return the agent instance
    agent = {
      tools,
      system,
      model,
      maxSteps: 10,
      availableApis,
    };

    return agent;
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
}


