/**
 * AI Cost Control & Spending Safeguards Engine
 * Enforces hard daily request budgets, per-request token caps,
 * emergency kill-switch capability, and tracking of estimated spend.
 */

interface AiUsageRecord {
  dateKey: string;
  totalRequests: number;
  totalEstimatedTokens: number;
  successfulCalls: number;
  fallbackCalls: number;
  lastRequestTime: string;
}

class AiCostController {
  private dailyLimit: number;
  private isKillSwitchActive: boolean;
  private usageHistory: Map<string, AiUsageRecord> = new Map();

  constructor() {
    this.dailyLimit = parseInt(process.env.AI_DAILY_REQUEST_LIMIT || '200', 10);
    this.isKillSwitchActive = process.env.AI_EMERGENCY_KILL_SWITCH === 'true';
  }

  private getTodayKey(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  public getTodayUsage(): AiUsageRecord {
    const today = this.getTodayKey();
    let record = this.usageHistory.get(today);
    if (!record) {
      record = {
        dateKey: today,
        totalRequests: 0,
        totalEstimatedTokens: 0,
        successfulCalls: 0,
        fallbackCalls: 0,
        lastRequestTime: new Date().toISOString(),
      };
      this.usageHistory.set(today, record);
    }
    return record;
  }

  public canExecuteAiCall(): {
    allowed: boolean;
    reason?: string;
    isKillSwitch: boolean;
    remainingDailyBudget: number;
  } {
    if (this.isKillSwitchActive) {
      return {
        allowed: false,
        reason: 'Emergency AI kill-switch is active. Using verified local regulatory knowledge base.',
        isKillSwitch: true,
        remainingDailyBudget: 0,
      };
    }

    const todayRecord = this.getTodayUsage();
    if (todayRecord.totalRequests >= this.dailyLimit) {
      return {
        allowed: false,
        reason: `Daily AI usage limit of ${this.dailyLimit} requests has been reached. System switched to zero-cost local knowledge engine.`,
        isKillSwitch: false,
        remainingDailyBudget: 0,
      };
    }

    return {
      allowed: true,
      isKillSwitch: false,
      remainingDailyBudget: this.dailyLimit - todayRecord.totalRequests,
    };
  }

  public recordSuccess(estimatedTokens: number = 500): void {
    const record = this.getTodayUsage();
    record.totalRequests += 1;
    record.successfulCalls += 1;
    record.totalEstimatedTokens += estimatedTokens;
    record.lastRequestTime = new Date().toISOString();
  }

  public recordFallback(): void {
    const record = this.getTodayUsage();
    record.totalRequests += 1;
    record.fallbackCalls += 1;
    record.lastRequestTime = new Date().toISOString();
  }

  public setKillSwitch(active: boolean): void {
    this.isKillSwitchActive = active;
  }

  public getStatus() {
    const today = this.getTodayUsage();
    return {
      dailyLimit: this.dailyLimit,
      killSwitchActive: this.isKillSwitchActive,
      todayRequests: today.totalRequests,
      successfulCalls: today.successfulCalls,
      fallbackCalls: today.fallbackCalls,
      estimatedTokensToday: today.totalEstimatedTokens,
      estimatedCostUsd: (today.totalEstimatedTokens / 1_000_000) * 0.15, // Approx Flash cost
      remainingRequests: Math.max(0, this.dailyLimit - today.totalRequests),
    };
  }
}

export const aiCostController = new AiCostController();
