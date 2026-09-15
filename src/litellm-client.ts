import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";

interface Preferences {
  litellmApiKey: string;
  litellmEndpoint: string;
}

export interface UsageInfo {
  spend: number;
  max_budget?: number;
  budget_duration?: string;
  budget_reset_at?: string;
  [key: string]: unknown;
}

export interface KeyInfoResponse {
  info: UsageInfo;
  key_name?: string;
  permissions?: string[];
}

export interface ModelInfo {
  model_name: string;
  litellm_params?: {
    model?: string;
    [key: string]: unknown;
  };
  model_info?: {
    id?: string;
    mode?: string;
    input_cost_per_token?: number;
    output_cost_per_token?: number;
    max_tokens?: number;
    max_input_tokens?: number;
    max_output_tokens?: number;
    supports_vision?: boolean;
    supports_function_calling?: boolean;
    supports_parallel_function_calling?: boolean;
    supports_response_schema?: boolean;
    [key: string]: unknown;
  };
}

export interface ModelInfoResponse {
  data: ModelInfo[];
}

export class LiteLLMClient {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    const preferences = getPreferenceValues<Preferences>();
    this.apiKey = preferences.litellmApiKey;
    this.endpoint = preferences.litellmEndpoint.replace(/\/$/, ""); // Remove trailing slash
  }

  async getKeyInfo(): Promise<KeyInfoResponse> {
    const url = `${this.endpoint}/key/info?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-litellm-api-key": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch key info: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<KeyInfoResponse>;
  }

  async getCurrentSpend(): Promise<number> {
    const keyInfo = await this.getKeyInfo();
    return keyInfo.info.spend || 0;
  }

  async getModelInfo(): Promise<ModelInfoResponse> {
    const url = `${this.endpoint}/v1/model/info`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "x-litellm-api-key": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch model info: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<ModelInfoResponse>;
  }

  getOpenAiBaseUrl(): string {
    return `${this.endpoint}/v1`;
  }
}

export const litellmClient = new LiteLLMClient();
