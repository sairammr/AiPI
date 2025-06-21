# AiPI - AI Platform Interface

A brutalist-styled AI agent powered by AgentKit that provides intelligent API marketplace interactions with x402 payment integration. This system allows users to discover, access, and pay for APIs through natural language conversations.

## 🚀 Features

- **Intelligent API Discovery**: AI agent automatically finds the best API for user requests
- **x402 Payment Integration**: Automatic payment processing for API calls
- **Brutalist UI Design**: Clean, geometric interface with high contrast styling
- **IPFS Integration**: API metadata stored on IPFS for decentralized access
- **CDP Wallet Support**: Secure blockchain wallet integration
- **Double Confirmation Protocol**: User confirmation before API calls
- **Real-time Chat Interface**: Interactive conversation with the AI agent

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** package manager
- **Coinbase Developer Platform (CDP)** account
- **OpenAI API** key
- **x402-handler** server running (for API marketplace)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd onchain-agent
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# CDP Configuration
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret
CDP_WALLET_SECRET=your_cdp_wallet_secret

# Network Configuration
NETWORK_ID=base-sepolia

# Resource Server Configuration
RESOURCE_SERVER_URL=http://localhost:4021
```

### 4. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Agent Configuration

The agent is configured in two main files:

#### 1. `/api/agent/prepare-agentkit.ts`
- Configures CDP wallet provider
- Sets up action providers
- Manages wallet data persistence

#### 2. `/api/agent/create-agent.ts`
- Initializes the AI model (GPT-4o-mini)
- Fetches available APIs from marketplace
- Configures system prompt and behavior
- Sets up API context for intelligent matching

### Customizing the Agent

#### Change the AI Model
In `create-agent.ts`, modify the model instantiation:

```typescript
const model = openai("gpt-4o"); // or any other OpenAI model
```

#### Modify System Behavior
Update the system prompt in `create-agent.ts` to change agent behavior:

```typescript
const system = `
  // Your custom system prompt here
`;
```

#### Add New Action Providers
In `prepare-agentkit.ts`, add new action providers:

```typescript
actionProviders: [
  // Existing providers...
  yourCustomActionProvider(),
]
```

## 🎯 Usage

### Starting a Conversation

1. **Open the Interface**: Navigate to the application in your browser
2. **Type Your Request**: Describe what data or service you need
3. **Review API Details**: The agent will show you the matching API and cost
4. **Confirm the Call**: Explicitly confirm before the API call is made
5. **Receive Results**: Get the API response and transaction hash

### Example Interactions

#### Weather Data Request
```
User: "I need weather data for New York"
Agent: "I found a Weather API that can provide this data. It costs $0.01 per request. Should I proceed with this API call?"
User: "Yes"
Agent: [Returns weather data + transaction hash]
```

#### Crypto Price Request
```
User: "Show me current Bitcoin prices"
Agent: "I have access to a Crypto Price API. It costs $0.02 per request. Should I proceed with this API call?"
User: "Yes"
Agent: [Returns crypto prices + transaction hash]
```

### API Marketplace Integration

The system automatically:
- Fetches available APIs from the marketplace
- Matches user requests to appropriate APIs
- Handles x402 payment processing
- Returns formatted responses

## 🏗️ Architecture

### Core Components

1. **Frontend Interface** (`/app/page.tsx`)
   - Brutalist-styled chat interface
   - Real-time message handling
   - Responsive design

2. **Agent System** (`/api/agent/`)
   - AI agent with marketplace context
   - CDP wallet integration
   - Action provider management

3. **API Marketplace Provider** (`/api/agent/apiMarketplaceActionProvider.ts`)
   - Handles API discovery and calls
   - x402 payment integration
   - Error handling and response formatting

4. **Styling System** (`/app/globals.css`)
   - Brutalist design system
   - Responsive typography
   - Geometric layout components

### Data Flow

1. **User Input** → Frontend Interface
2. **Request Processing** → AI Agent Analysis
3. **API Matching** → Marketplace Context Search
4. **User Confirmation** → Double Confirmation Protocol
5. **API Call** → x402 Payment + API Request
6. **Response** → Formatted Data + Transaction Hash

## 🔒 Security Features

- **Double Confirmation**: Users must explicitly confirm API calls
- **CDP Wallet Security**: Secure blockchain wallet integration
- **Environment Variables**: Sensitive data stored in environment variables
- **Error Handling**: Comprehensive error handling and user feedback

## 🎨 Design System

### Brutalist Principles
- **High Contrast**: Pure black and white color scheme
- **Geometric Shapes**: Sharp edges, no rounded corners
- **Bold Typography**: Heavy fonts with uppercase styling
- **Sharp Shadows**: Aggressive shadow offsets for depth
- **Monospace Fonts**: Technical, code-like appearance

### Responsive Design
- Mobile-optimized layouts
- Flexible container sizing
- Adaptive typography scaling
- Touch-friendly interactions

## 🐛 Troubleshooting

### Common Issues

#### "CDP client not initialized"
- Ensure all CDP environment variables are set
- Check CDP API key permissions
- Verify network configuration

#### "No APIs available"
- Ensure x402-handler server is running
- Check RESOURCE_SERVER_URL configuration
- Verify marketplace has available APIs

#### "Payment failed"
- Check CDP wallet balance
- Verify network connectivity
- Ensure proper x402 configuration

#### "OpenAI API key missing"
- Set OPENAI_API_KEY in environment variables
- Verify API key is valid and has credits

### Debug Mode

Enable debug logging by adding to `.env.local`:

```bash
DEBUG=true
NODE_ENV=development
```

## 📚 API Reference

### Agent Actions

#### `fetch-api-data`
Fetches data from marketplace APIs with x402 payment.

**Parameters:**
- `apiCid` (string): The CID of the API to call
- `data` (string, optional): JSON data for POST requests
- `method` (string, optional): HTTP method (GET/POST)

**Returns:**
- API response data
- Transaction hash
- Payment confirmation

#### `requestFaucet`
Requests test tokens for development.

**Parameters:**
- `address` (string): Wallet address
- `network` (string): Target network
- `token` (string): Token type

**Returns:**
- Transaction hash

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow the brutalist design principles
- Maintain comprehensive error handling
- Add proper TypeScript types
- Include JSDoc comments
- Test with various API scenarios

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Links

- [AgentKit Documentation](https://github.com/coinbase/agentkit)
- [CDP Documentation](https://docs.cdp.coinbase.com/)
- [x402 Protocol](https://x402.org/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the AgentKit documentation
- Join the CDP Discord community

---

**Built with ❤️ using AgentKit and Next.js**
