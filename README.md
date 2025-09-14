# LiteLLM Usage Tracker

Monitor and visualize your LiteLLM token usage and spending directly in Raycast.

## Features

- 📊 **Real-time Monitoring** - View current token usage and spending
- 📈 **Usage Trends** - Track daily and weekly spending patterns
- 🔒 **Secure Storage** - API keys stored safely in Raycast preferences
- 📱 **Native Interface** - Clean, integrated Raycast experience
- 📉 **Usage Graphs** - Simple text-based visualization of spending trends
- 💰 **Budget Tracking** - Monitor spending limits and reset dates

## Setup

### Prerequisites
- A running LiteLLM server with API access
- Valid API key with usage monitoring permissions

### Configuration
1. Install the extension in Raycast
2. Open Raycast preferences (⌘,)
3. Navigate to "LiteLLM Usage Tracker" extension
4. Configure:
   - **LiteLLM API Key**: Your API key for usage statistics access
   - **LiteLLM Endpoint**: Your server URL (e.g., `https://your-server.litellm.com`)

## Usage

### View Dashboard
1. Open Raycast (⌘Space)
2. Search for "View Usage Dashboard"
3. See current spending, daily usage, and weekly trends

### Keyboard Shortcuts
- **⌘R** - Refresh usage data
- **⌘G** - View usage graphs and history

### Features Available
- Current total spending
- Today's usage increment
- Weekly spending summary
- Budget information (if configured)
- Historical usage visualization

## Data & Privacy

- **Local Storage**: Usage history stored locally in Raycast
- **Secure Credentials**: API keys encrypted in system keychain
- **Direct Communication**: No third-party services involved
- **Data Retention**: Keeps last 1,000 usage data points

## API Integration

Uses LiteLLM's standard monitoring endpoint:
```http
GET /key/info?key={api-key}
Headers:
  accept: application/json
  x-litellm-api-key: {api-key}
```

## Troubleshooting

- **No data showing**: Verify API key and endpoint URL
- **Connection errors**: Check LiteLLM server accessibility
- **Permission denied**: Ensure API key has monitoring permissions

## Development

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for distribution
npm run build
```