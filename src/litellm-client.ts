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
}

export const litellmClient = new LiteLLMClient();
