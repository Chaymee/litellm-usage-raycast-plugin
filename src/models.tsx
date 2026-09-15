import { List, ActionPanel, Action, Detail, showToast, Toast, Icon, Color } from "@raycast/api";
import { useEffect, useState } from "react";
import { litellmClient, ModelInfo } from "./litellm-client";

export default function Models() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await litellmClient.getModelInfo();
      setModels(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch models",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  if (loading && models.length === 0 && !error) {
    return (
      <Detail isLoading={true} markdown="# Loading Models\n\nFetching available models from your LiteLLM server..." />
    );
  }

  if (error && models.length === 0) {
    return (
      <Detail
        markdown={`# Connection Error\n\n**${error}**\n\n## Troubleshooting Steps\n\n1. Verify your LiteLLM endpoint URL is correct\n2. Check that your API key has access to \`/v1/model/info\`\n3. Ensure your LiteLLM server is accessible\n4. Try refreshing\n\n---\n\n*Configure your settings in Raycast Preferences → Extensions → LiteLLM Usage Tracker*`}
        actions={
          <ActionPanel>
            <Action title="Retry" onAction={fetchModels} icon={Icon.ArrowClockwise} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List
      isLoading={loading}
      searchBarPlaceholder="Search models..."
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            onAction={fetchModels}
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    >
      {models.map((model) => {
        const mode = model.model_info?.mode;
        return (
          <List.Item
            key={model.model_info?.id || model.model_name}
            title={model.model_name}
            subtitle={model.litellm_params?.model as string | undefined}
            icon={{ source: Icon.ComputerChip, tintColor: Color.Blue }}
            accessories={mode ? [{ tag: mode }] : []}
            actions={
              <ActionPanel>
                <Action.Push title="View Details" target={<ModelDetail model={model} />} icon={Icon.Sidebar} />
                <Action
                  title="Refresh"
                  onAction={fetchModels}
                  icon={Icon.ArrowClockwise}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

function ModelDetail({ model }: { model: ModelInfo }) {
  const info = model.model_info || {};
  const params = model.litellm_params || {};
  const baseUrl = litellmClient.getOpenAiBaseUrl();

  const formatCost = (costPerToken?: number) =>
    costPerToken !== undefined ? `$${(costPerToken * 1_000_000).toFixed(4)} / 1M tokens` : "Not specified";

  const capabilities: string[] = [];
  if (info.supports_vision) capabilities.push("Vision");
  if (info.supports_function_calling) capabilities.push("Function Calling");
  if (info.supports_parallel_function_calling) capabilities.push("Parallel Function Calling");
  if (info.supports_response_schema) capabilities.push("Response Schema");

  const markdown = `# ${model.model_name}

## OpenAI-Compatible Usage

Use this model with any OpenAI SDK/client by pointing it at your LiteLLM proxy:

\`\`\`
Base URL: ${baseUrl}
Endpoint: ${baseUrl}/chat/completions
Model:    ${model.model_name}
\`\`\`

\`\`\`bash
curl ${baseUrl}/chat/completions \\
  -H "Authorization: Bearer $LITELLM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.model_name}",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
\`\`\`

## Details

| Property | Value |
|---|---|
| Underlying Model | ${params.model || "Not specified"} |
| Mode | ${info.mode || "Not specified"} |
| Max Tokens | ${info.max_tokens ?? "Not specified"} |
| Max Input Tokens | ${info.max_input_tokens ?? "Not specified"} |
| Max Output Tokens | ${info.max_output_tokens ?? "Not specified"} |
| Input Cost | ${formatCost(info.input_cost_per_token)} |
| Output Cost | ${formatCost(info.output_cost_per_token)} |

${capabilities.length > 0 ? `## Capabilities\n\n${capabilities.map((c) => `- ${c}`).join("\n")}` : ""}
`;

  return (
    <Detail
      markdown={markdown}
      navigationTitle={model.model_name}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Model Name" content={model.model_name} icon={Icon.CopyClipboard} />
          <Action.CopyToClipboard title="Copy Endpoint URL" content={`${baseUrl}/chat/completions`} icon={Icon.Link} />
          <Action.CopyToClipboard
            title="Copy Curl Command"
            content={`curl ${baseUrl}/chat/completions \\\n  -H "Authorization: Bearer $LITELLM_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "${model.model_name}",\n    "messages": [{"role": "user", "content": "Hello"}]\n  }'`}
            icon={Icon.Terminal}
          />
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Model Name" text={model.model_name} />
          <Detail.Metadata.Label title="Underlying Model" text={(params.model as string) || "Not specified"} />
          {info.mode && <Detail.Metadata.Label title="Mode" text={info.mode} />}
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Base URL" text={baseUrl} />
          <Detail.Metadata.Label title="Endpoint" text={`${baseUrl}/chat/completions`} />
        </Detail.Metadata>
      }
    />
  );
}
