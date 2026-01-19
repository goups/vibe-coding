import { addDays, format, subDays } from 'date-fns';
import type { DailyMetrics, Filters, AggregatedMetrics, ChartDataPoint, PlatformBreakdown, PlanBreakdown } from '../types';

// Seeded random number generator for consistent data
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Generate base trend with seasonal patterns
function generateTrend(dayIndex: number, baseValue: number, growthRate: number): number {
  const trend = baseValue * Math.pow(1 + growthRate / 365, dayIndex);
  const seasonality = Math.sin((dayIndex / 365) * 2 * Math.PI) * baseValue * 0.1;
  const weeklyPattern = Math.sin((dayIndex / 7) * 2 * Math.PI) * baseValue * 0.05;
  return trend + seasonality + weeklyPattern;
}

// Add random spikes
function addSpikes(value: number, random: () => number, dayIndex: number): number {
  // Campaign spikes (every ~45 days)
  if (dayIndex % 45 < 3 && random() > 0.5) {
    return value * (1.3 + random() * 0.4);
  }
  // Random smaller spikes
  if (random() > 0.92) {
    return value * (1.15 + random() * 0.2);
  }
  return value;
}

// Generate all mock data
function generateMockData(): DailyMetrics[] {
  const random = seededRandom(42);
  const data: DailyMetrics[] = [];
  const startDate = new Date('2024-01-01');
  const days = 400; // ~13 months of data

  const platforms: ('ios' | 'android')[] = ['ios', 'android'];
  const planTypes: ('monthly' | 'yearly')[] = ['monthly', 'yearly'];

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const date = format(addDays(startDate, dayIndex), 'yyyy-MM-dd');

    for (const platform of platforms) {
      for (const planType of planTypes) {
        const platformMultiplier = platform === 'ios' ? 1.4 : 1.0;
        const planMultiplier = planType === 'monthly' ? 1.0 : 0.35;
        const baseMultiplier = platformMultiplier * planMultiplier;

        // Base active subscriptions with growth
        const baseActive = 8000 * baseMultiplier;
        let activeSubscriptions = generateTrend(dayIndex, baseActive, 0.25);
        activeSubscriptions = addSpikes(activeSubscriptions, random, dayIndex);
        activeSubscriptions = Math.round(activeSubscriptions * (0.95 + random() * 0.1));

        // New subscriptions
        const baseNew = 120 * baseMultiplier;
        let newSubscriptions = generateTrend(dayIndex, baseNew, 0.2);
        newSubscriptions = addSpikes(newSubscriptions, random, dayIndex);
        newSubscriptions = Math.round(newSubscriptions * (0.8 + random() * 0.4));

        // Churns (lower is better, slight downward trend as retention improves)
        const baseChurn = 45 * baseMultiplier;
        let churns = generateTrend(dayIndex, baseChurn, -0.1);
        churns = Math.round(churns * (0.7 + random() * 0.6));
        churns = Math.max(0, churns);

        // MRR calculation
        const priceMonthly = platform === 'ios' ? 980 : 880;
        const priceYearly = platform === 'ios' ? 9800 : 8800;
        const price = planType === 'monthly' ? priceMonthly : priceYearly / 12;
        const mrr = Math.round(activeSubscriptions * price);

        // Trial conversions
        const baseTrialStarts = 80 * baseMultiplier;
        let trialStarts = generateTrend(dayIndex, baseTrialStarts, 0.15);
        trialStarts = Math.round(trialStarts * (0.8 + random() * 0.4));

        // Conversion rate varies between 25-45%
        const baseConversionRate = 0.32 + (dayIndex / days) * 0.08; // Improving over time
        const conversionRate = baseConversionRate * (0.85 + random() * 0.3);
        const trialConversions = Math.round(trialStarts * Math.min(0.55, conversionRate));

        data.push({
          date,
          activeSubscriptions,
          newSubscriptions,
          churns,
          mrr,
          trialConversions,
          trialStarts,
          platform,
          planType,
        });
      }
    }
  }

  return data;
}

const allMockData = generateMockData();

export function filterData(filters: Filters): DailyMetrics[] {
  return allMockData.filter((item) => {
    const itemDate = new Date(item.date);
    const matchesDateRange = itemDate >= filters.startDate && itemDate <= filters.endDate;
    const matchesPlatform = filters.platform === 'all' || item.platform === filters.platform;
    const matchesPlan = filters.planType === 'all' || item.planType === filters.planType;
    return matchesDateRange && matchesPlatform && matchesPlan;
  });
}

export function aggregateByDate(data: DailyMetrics[]): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>();

  for (const item of data) {
    const existing = dateMap.get(item.date);
    if (existing) {
      existing.activeSubscriptions += item.activeSubscriptions;
      existing.newSubscriptions += item.newSubscriptions;
      existing.churns += item.churns;
      existing.mrr += item.mrr;
    } else {
      dateMap.set(item.date, {
        date: item.date,
        activeSubscriptions: item.activeSubscriptions,
        newSubscriptions: item.newSubscriptions,
        churns: item.churns,
        mrr: item.mrr,
        trialConversionRate: 0,
      });
    }
  }

  // Calculate trial conversion rate per date
  const trialData = new Map<string, { conversions: number; starts: number }>();
  for (const item of data) {
    const existing = trialData.get(item.date);
    if (existing) {
      existing.conversions += item.trialConversions;
      existing.starts += item.trialStarts;
    } else {
      trialData.set(item.date, {
        conversions: item.trialConversions,
        starts: item.trialStarts,
      });
    }
  }

  for (const [date, trial] of trialData) {
    const point = dateMap.get(date);
    if (point && trial.starts > 0) {
      point.trialConversionRate = Math.round((trial.conversions / trial.starts) * 100);
    }
  }

  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateMetrics(data: DailyMetrics[], filters: Filters): AggregatedMetrics {
  const chartData = aggregateByDate(data);

  // Get latest values
  const latestData = chartData[chartData.length - 1] || {
    activeSubscriptions: 0,
    newSubscriptions: 0,
    churns: 0,
    mrr: 0,
    trialConversionRate: 0,
  };

  // Sum up period totals
  const totalNew = chartData.reduce((sum, d) => sum + d.newSubscriptions, 0);
  const totalChurns = chartData.reduce((sum, d) => sum + d.churns, 0);

  // Calculate trial conversion rate for the period
  let totalTrialConversions = 0;
  let totalTrialStarts = 0;
  for (const item of data) {
    totalTrialConversions += item.trialConversions;
    totalTrialStarts += item.trialStarts;
  }
  const trialConversionRate = totalTrialStarts > 0
    ? Math.round((totalTrialConversions / totalTrialStarts) * 100)
    : 0;

  // Calculate previous period for comparison
  const periodDays = Math.ceil((filters.endDate.getTime() - filters.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const prevStartDate = subDays(filters.startDate, periodDays);
  const prevEndDate = subDays(filters.startDate, 1);

  const prevFilters: Filters = {
    ...filters,
    startDate: prevStartDate,
    endDate: prevEndDate,
  };

  const prevData = filterData(prevFilters);
  const prevChartData = aggregateByDate(prevData);

  const prevLatest = prevChartData[prevChartData.length - 1] || {
    activeSubscriptions: 0,
    mrr: 0,
  };

  const prevTotalNew = prevChartData.reduce((sum, d) => sum + d.newSubscriptions, 0);
  const prevTotalChurns = prevChartData.reduce((sum, d) => sum + d.churns, 0);

  let prevTrialConversions = 0;
  let prevTrialStarts = 0;
  for (const item of prevData) {
    prevTrialConversions += item.trialConversions;
    prevTrialStarts += item.trialStarts;
  }
  const prevTrialConversionRate = prevTrialStarts > 0
    ? Math.round((prevTrialConversions / prevTrialStarts) * 100)
    : 0;

  // Calculate percentage changes
  const calcChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    totalActiveSubscriptions: latestData.activeSubscriptions,
    totalNewSubscriptions: totalNew,
    totalChurns: totalChurns,
    totalMRR: latestData.mrr,
    trialConversionRate,
    activeSubscriptionsChange: calcChange(latestData.activeSubscriptions, prevLatest.activeSubscriptions),
    newSubscriptionsChange: calcChange(totalNew, prevTotalNew),
    churnsChange: calcChange(totalChurns, prevTotalChurns),
    mrrChange: calcChange(latestData.mrr, prevLatest.mrr),
    trialConversionRateChange: trialConversionRate - prevTrialConversionRate,
  };
}

export function getPlatformBreakdown(data: DailyMetrics[]): PlatformBreakdown[] {
  const iosTotal = data.filter(d => d.platform === 'ios').reduce((sum, d) => sum + d.activeSubscriptions, 0);
  const androidTotal = data.filter(d => d.platform === 'android').reduce((sum, d) => sum + d.activeSubscriptions, 0);

  const latestDate = data.length > 0 ? data[data.length - 1].date : '';
  const latestData = data.filter(d => d.date === latestDate);

  const iosLatest = latestData.filter(d => d.platform === 'ios').reduce((sum, d) => sum + d.activeSubscriptions, 0);
  const androidLatest = latestData.filter(d => d.platform === 'android').reduce((sum, d) => sum + d.activeSubscriptions, 0);

  return [
    { name: 'iOS', value: iosLatest || iosTotal, color: '#007aff' },
    { name: 'Android', value: androidLatest || androidTotal, color: '#3ddc84' },
  ];
}

export function getPlanBreakdown(data: DailyMetrics[]): PlanBreakdown[] {
  const latestDate = data.length > 0 ? data[data.length - 1].date : '';
  const latestData = data.filter(d => d.date === latestDate);

  const monthlyLatest = latestData.filter(d => d.planType === 'monthly').reduce((sum, d) => sum + d.activeSubscriptions, 0);
  const yearlyLatest = latestData.filter(d => d.planType === 'yearly').reduce((sum, d) => sum + d.activeSubscriptions, 0);

  return [
    { name: '月額プラン', value: monthlyLatest, color: '#6366f1' },
    { name: '年額プラン', value: yearlyLatest, color: '#8b5cf6' },
  ];
}

export function getAvailableDateRange(): { min: Date; max: Date } {
  const dates = allMockData.map(d => new Date(d.date));
  return {
    min: new Date(Math.min(...dates.map(d => d.getTime()))),
    max: new Date(Math.max(...dates.map(d => d.getTime()))),
  };
}
