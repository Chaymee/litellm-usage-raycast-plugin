import { List, ActionPanel, Action, Detail, showToast, Toast, Icon, Color } from "@raycast/api";
import { useEffect, useState } from "react";
import { litellmClient, KeyInfoResponse } from "./litellm-client";
import { UsageTracker, UsageDataPoint } from "./usage-tracker";

interface UsageStats {
  currentSpend: number;
  todaySpend: number;
  weeklySpend: number;
  lastUpdated: Date;
}

export default function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyInfo, setKeyInfo] = useState<KeyInfoResponse | null>(null);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const keyInfoResponse = await litellmClient.getKeyInfo();
      setKeyInfo(keyInfoResponse);

      await UsageTracker.addUsagePoint(keyInfoResponse.info.spend);

      const todayUsage = await UsageTracker.getTodaysUsage();
      const weeklyUsage = await UsageTracker.getWeeklyUsage();

      const todaySpend = todayUsage.reduce((sum, point) => sum + (point.dailySpend || 0), 0);
      const weeklySpend = weeklyUsage.reduce((sum, point) => sum + (point.dailySpend || 0), 0);

      setStats({
        currentSpend: keyInfoResponse.info.spend,
        todaySpend,
        weeklySpend,
        lastUpdated: new Date(),
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Usage data updated",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch usage data",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  if (loading && !stats) {
    return <Detail isLoading={true} markdown="# Loading Usage Data\n\nConnecting to your LiteLLM server..." />;
  }

  if (error && !stats) {
    return (
      <Detail
        markdown={`# Connection Error\n\n**${error}**\n\n## Troubleshooting Steps\n\n1. Verify your LiteLLM endpoint URL is correct\n2. Check that your API key has monitoring permissions\n3. Ensure your LiteLLM server is accessible\n4. Try refreshing the data\n\n---\n\n*Configure your settings in Raycast Preferences → Extensions → LiteLLM Usage Tracker*`}
        actions={
          <ActionPanel>
            <Action title="Retry Connection" onAction={fetchUsageData} icon={Icon.ArrowClockwise} />
            <Action.Open
              title="Open Extension Preferences"
              target="raycast://extensions/raycast/raycast/confetti"
              icon={Icon.Gear}
            />
          </ActionPanel>
        }
      />
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(4)}`;
  const formatDate = (date: Date) => date.toLocaleString();

  return (
    <List
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action
            title="Refresh Data"
            onAction={fetchUsageData}
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
          <Action.Push
            title="View Usage Graph"
            target={<UsageGraphView />}
            icon={Icon.BarChart}
            shortcut={{ modifiers: ["cmd"], key: "g" }}
          />
        </ActionPanel>
      }
    >
      {stats && (
        <>
          <List.Section title="Current Usage">
            <List.Item
              title="Total Spend"
              subtitle={formatCurrency(stats.currentSpend)}
              icon={{ source: Icon.CreditCard, tintColor: Color.Blue }}
              accessories={[{ text: `Updated: ${formatDate(stats.lastUpdated)}` }]}
            />
          </List.Section>

          <List.Section title="Recent Usage">
            <List.Item
              title="Today's Spend"
              subtitle={formatCurrency(stats.todaySpend)}
              icon={{ source: Icon.Calendar, tintColor: Color.Green }}
            />
            <List.Item
              title="Weekly Spend"
              subtitle={formatCurrency(stats.weeklySpend)}
              icon={{ source: Icon.Calendar, tintColor: Color.Orange }}
            />
          </List.Section>

          {keyInfo?.info.max_budget && (
            <List.Section title="Budget Information">
              <List.Item
                title="Budget Limit"
                subtitle={formatCurrency(keyInfo.info.max_budget)}
                icon={{ source: Icon.BankNote, tintColor: Color.Purple }}
              />
              {keyInfo.info.budget_duration && (
                <List.Item
                  title="Budget Duration"
                  subtitle={keyInfo.info.budget_duration}
                  icon={{ source: Icon.Clock, tintColor: Color.Yellow }}
                />
              )}
              {keyInfo.info.budget_reset_at && (
                <List.Item
                  title="Budget Reset"
                  subtitle={new Date(keyInfo.info.budget_reset_at).toLocaleString()}
                  icon={{ source: Icon.Calendar, tintColor: Color.Red }}
                />
              )}
            </List.Section>
          )}
        </>
      )}
    </List>
  );
}

function UsageGraphView() {
  const [history, setHistory] = useState<UsageDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await UsageTracker.getUsageHistory();
      setHistory(data);
      setLoading(false);
    };

    loadHistory();
  }, []);

  if (loading) {
    return <Detail isLoading={true} markdown="# Loading Usage History\n\nRetrieving your usage data..." />;
  }

  const generateMarkdownGraph = (data: UsageDataPoint[]) => {
    if (data.length === 0) {
      return `# Usage History\n\n## No Data Available\n\nYour usage history will appear here after you:\n\n1. **Configure your API key** in extension preferences\n2. **Refresh the dashboard** to fetch initial data\n3. **Use your LiteLLM API** to generate usage metrics\n\n---\n\n*Usage data is tracked locally and updated each time you refresh the dashboard.*`;
    }

    const recentData = data.slice(-50); // Show last 50 data points

    let markdown = "# Usage History\n\n## Recent Spending Trend\n\n";

    // Create a simple text-based graph
    const maxSpend = Math.max(...recentData.map((d) => d.spend));
    const minSpend = Math.min(...recentData.map((d) => d.spend));
    const range = maxSpend - minSpend || 1;

    markdown += "```\n";
    markdown += `Total Spend Range: $${minSpend.toFixed(4)} - $${maxSpend.toFixed(4)}\n\n`;

    recentData.forEach((point) => {
      const normalizedHeight = Math.round(((point.spend - minSpend) / range) * 20);
      const bar = "█".repeat(normalizedHeight) || "▁";
      const date = new Date(point.timestamp).toLocaleDateString();
      const time = new Date(point.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      markdown += `${date} ${time} │${bar} $${point.spend.toFixed(4)}`;
      if (point.dailySpend !== undefined) {
        markdown += ` (+$${point.dailySpend.toFixed(4)})`;
      }
      markdown += "\n";
    });

    markdown += "```\n\n";

    // Add summary statistics
    const totalDailySpend = recentData.reduce((sum, point) => sum + (point.dailySpend || 0), 0);
    const avgDailySpend = totalDailySpend / Math.max(1, recentData.length);

    markdown += "## Summary\n\n";
    markdown += `- **Data Points**: ${recentData.length}\n`;
    markdown += `- **Total Period Spend**: $${totalDailySpend.toFixed(4)}\n`;
    markdown += `- **Average per Data Point**: $${avgDailySpend.toFixed(4)}\n`;
    markdown += `- **Current Total**: $${recentData[recentData.length - 1]?.spend.toFixed(4) || "0.0000"}\n`;

    return markdown;
  };

  return (
    <Detail
      markdown={generateMarkdownGraph(history)}
      actions={
        <ActionPanel>
          <Action title="Back to Dashboard" onAction={() => console.log("Back action")} icon={Icon.ArrowLeft} />
          <Action
            title="Clear History"
            onAction={async () => {
              await UsageTracker.clearHistory();
              setHistory([]);
              await showToast({
                style: Toast.Style.Success,
                title: "Usage history cleared",
              });
            }}
            icon={Icon.Trash}
            style={Action.Style.Destructive}
          />
        </ActionPanel>
      }
    />
  );
}
