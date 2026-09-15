import { List, ActionPanel, Action, Detail, showToast, Toast, Icon, Color } from "@raycast/api";
import { useEffect, useState } from "react";
import { litellmClient, KeyInfoResponse } from "./litellm-client";

export default function UsageDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyInfo, setKeyInfo] = useState<KeyInfoResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const keyInfoResponse = await litellmClient.getKeyInfo();
      setKeyInfo(keyInfoResponse);
      setLastUpdated(new Date());

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

  if (loading && !keyInfo) {
    return <Detail isLoading={true} markdown="# Loading Usage Data\n\nConnecting to your LiteLLM server..." />;
  }

  if (error && !keyInfo) {
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
        </ActionPanel>
      }
    >
      {keyInfo && lastUpdated && (
        <>
          <List.Section title="Current Usage">
            <List.Item
              title="Total Spend"
              subtitle={formatCurrency(keyInfo.info.spend)}
              icon={{ source: Icon.CreditCard, tintColor: Color.Blue }}
              accessories={[{ text: `Updated: ${formatDate(lastUpdated)}` }]}
            />
          </List.Section>

          {keyInfo.info.max_budget && (
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
