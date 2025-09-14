import { LocalStorage } from "@raycast/api";

export interface UsageDataPoint {
  timestamp: number;
  spend: number;
  dailySpend?: number;
}

export class UsageTracker {
  private static readonly STORAGE_KEY = "litellm_usage_history";
  private static readonly MAX_DATA_POINTS = 1000; // Keep last 1000 data points

  static async addUsagePoint(spend: number): Promise<void> {
    const history = await this.getUsageHistory();
    const now = Date.now();

    // Calculate daily spend (difference from last entry of the same day)
    const today = new Date(now).toDateString();
    const todayEntries = history.filter((point) => new Date(point.timestamp).toDateString() === today);

    const dailySpend = todayEntries.length > 0 ? spend - todayEntries[0].spend : spend;

    const newPoint: UsageDataPoint = {
      timestamp: now,
      spend,
      dailySpend: Math.max(0, dailySpend),
    };

    history.push(newPoint);

    // Keep only the most recent data points
    if (history.length > this.MAX_DATA_POINTS) {
      history.splice(0, history.length - this.MAX_DATA_POINTS);
    }

    await LocalStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  static async getUsageHistory(): Promise<UsageDataPoint[]> {
    try {
      const stored = await LocalStorage.getItem<string>(this.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse usage history:", error);
      return [];
    }
  }

  static async getTodaysUsage(): Promise<UsageDataPoint[]> {
    const history = await this.getUsageHistory();
    const today = new Date().toDateString();

    return history.filter((point) => new Date(point.timestamp).toDateString() === today);
  }

  static async getWeeklyUsage(): Promise<UsageDataPoint[]> {
    const history = await this.getUsageHistory();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return history.filter((point) => point.timestamp >= oneWeekAgo);
  }

  static async clearHistory(): Promise<void> {
    await LocalStorage.removeItem(this.STORAGE_KEY);
  }
}
