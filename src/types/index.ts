export type Platform = 'ios' | 'android' | 'all';
export type PlanType = 'monthly' | 'yearly' | 'all';

export interface Filters {
  startDate: Date;
  endDate: Date;
  platform: Platform;
  planType: PlanType;
}

export interface DailyMetrics {
  date: string;
  activeSubscriptions: number;
  newSubscriptions: number;
  churns: number;
  mrr: number;
  trialConversions: number;
  trialStarts: number;
  platform: 'ios' | 'android';
  planType: 'monthly' | 'yearly';
}

export interface AggregatedMetrics {
  totalActiveSubscriptions: number;
  totalNewSubscriptions: number;
  totalChurns: number;
  totalMRR: number;
  trialConversionRate: number;
  activeSubscriptionsChange: number;
  newSubscriptionsChange: number;
  churnsChange: number;
  mrrChange: number;
  trialConversionRateChange: number;
}

export interface ChartDataPoint {
  date: string;
  activeSubscriptions: number;
  newSubscriptions: number;
  churns: number;
  mrr: number;
  trialConversionRate: number;
}

export interface PlatformBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface PlanBreakdown {
  name: string;
  value: number;
  color: string;
}
