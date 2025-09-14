# Changelog

All notable changes to the LiteLLM Usage Tracker extension will be documented in this file.

## [1.0.0] - 2024-09-13

### Added
- Initial release of LiteLLM Usage Tracker
- Real-time usage monitoring with current spend display
- Daily and weekly spending trend tracking
- Secure API key storage using Raycast preferences
- Local usage history storage and visualization
- Text-based usage graphs showing spending patterns
- Budget information display (when available from LiteLLM)
- Keyboard shortcuts (⌘R for refresh, ⌘G for graphs)
- Comprehensive error handling and user guidance
- Empty state handling with helpful setup instructions

### Features
- **Usage Dashboard**: Monitor current spending and usage metrics
- **Historical Tracking**: View usage trends over time
- **Secure Configuration**: API keys stored safely in system keychain
- **Local Data Storage**: Usage history kept locally for privacy
- **Budget Monitoring**: Track spending limits and reset dates

### Technical
- Built with React and TypeScript
- Uses Raycast API for native integration
- Implements LiteLLM `/key/info` endpoint for usage data
- Local storage for usage history (max 1,000 data points)
- Automatic data refresh capabilities