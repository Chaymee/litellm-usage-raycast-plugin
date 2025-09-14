/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** LiteLLM API Key - Your LiteLLM API key for accessing usage statistics */
  "litellmApiKey": string,
  /** LiteLLM Endpoint - Your LiteLLM server endpoint URL (e.g., https://example.litellm.com) */
  "litellmEndpoint": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `usage-dashboard` command */
  export type UsageDashboard = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `usage-dashboard` command */
  export type UsageDashboard = {}
}

