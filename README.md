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

## Future Enhancements

### Enhanced API Integration

The current implementation uses the basic `/key/info` endpoint, but LiteLLM provides more comprehensive cost tracking endpoints that could significantly improve the extension:

#### Improved Endpoints to Implement:

1. **`/user/info`** - More accurate current spend data
   - Better alternative to `/key/info` for spend tracking
   - Returns user-specific spending totals

2. **`/user/daily/activity`** - Historical usage analytics
   - **Parameters**: `start_date`, `end_date`
   - **Returns**: Daily breakdowns with:
     - `total_spend` per day
     - `total_tokens` per day
     - `total_requests` per day
     - Spend breakdown by models and providers
   - **Benefits**: Real server-side data instead of local calculations

3. **`/global/spend/report`** - Team/organization analytics
   - Group spending by team, customer, or API key
   - Useful for multi-user dashboard views

4. **`/spend/logs`** - Detailed transaction logs
   - Individual request-level spending data
   - `summarize` parameter for aggregated vs detailed views
   - Perfect for detailed usage analysis

#### Enhanced Features Possible:

- **Rich Metrics**: Token counts, request counts, not just spending
- **Accurate Historical Data**: 30-day server-side rolling window
- **Model/Provider Breakdowns**: See which models cost the most
- **Real-time Analytics**: Server-calculated daily/weekly/monthly totals
- **Cost Per Token Analysis**: Efficiency metrics across different models
- **Advanced Graphing**: More sophisticated usage trend visualizations

#### Implementation Notes:

- Replace local spend calculations with server-side analytics
- Maintain backward compatibility with current `/key/info` for budget data
- Add new interface types for enhanced API responses
- Improve graphing with token and request metrics
- Consider using proper charting libraries (react-vis, chart.js) for better visualizations

These improvements would transform the extension from basic spend tracking to comprehensive LiteLLM usage analytics.