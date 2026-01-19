import { useState, useMemo } from 'react';
import { subDays } from 'date-fns';
import { Users, UserPlus, UserMinus, DollarSign, RefreshCw, Database } from 'lucide-react';
import { FilterBar } from './FilterBar';
import { KPICard } from './KPICard';
import { RawDataModal } from './RawDataModal';
import {
  SubscriptionsTrendChart,
  NewAndChurnChart,
  MRRChart,
  TrialConversionChart,
  BreakdownPieChart,
} from './Charts';
import {
  filterData,
  aggregateByDate,
  calculateMetrics,
  getPlatformBreakdown,
  getPlanBreakdown,
  getAvailableDateRange,
  getRawData,
} from '../data/mockData';
import type { Filters } from '../types';

export function Dashboard() {
  const dateRange = useMemo(() => getAvailableDateRange(), []);
  const [isRawDataModalOpen, setIsRawDataModalOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    startDate: subDays(dateRange.max, 30),
    endDate: dateRange.max,
    platform: 'all',
    planType: 'all',
  });

  const filteredData = useMemo(() => filterData(filters), [filters]);
  const chartData = useMemo(() => aggregateByDate(filteredData), [filteredData]);
  const metrics = useMemo(() => calculateMetrics(filteredData, filters), [filteredData, filters]);
  const platformBreakdown = useMemo(() => getPlatformBreakdown(filteredData), [filteredData]);
  const planBreakdown = useMemo(() => getPlanBreakdown(filteredData), [filteredData]);
  const rawData = useMemo(() => getRawData(), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                サブスクリプション分析
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                モバイルアプリの契約状況ダッシュボード
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsRawDataModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-colors shadow-sm"
              >
                <Database size={16} />
                生データを表示
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                リアルタイム更新
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          dateRange={dateRange}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KPICard
            title="有効サブスク数"
            value={metrics.totalActiveSubscriptions}
            change={metrics.activeSubscriptionsChange}
            icon={Users}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
          />
          <KPICard
            title="新規契約"
            value={metrics.totalNewSubscriptions}
            change={metrics.newSubscriptionsChange}
            changeLabel="前期比"
            icon={UserPlus}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
          <KPICard
            title="解約数"
            value={metrics.totalChurns}
            change={metrics.churnsChange}
            changeLabel="前期比"
            icon={UserMinus}
            iconColor="text-red-500"
            iconBgColor="bg-red-50"
            invertChange
          />
          <KPICard
            title="MRR"
            value={metrics.totalMRR}
            change={metrics.mrrChange}
            icon={DollarSign}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50"
            format="currency"
          />
          <KPICard
            title="トライアル転換率"
            value={metrics.trialConversionRate}
            change={metrics.trialConversionRateChange}
            changeLabel="ポイント"
            icon={RefreshCw}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            format="percent"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SubscriptionsTrendChart
            data={chartData}
            title="有効サブスクリプション推移"
          />
          <NewAndChurnChart
            data={chartData}
            title="新規契約・解約推移"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MRRChart
            data={chartData}
            title="MRR（月次経常収益）推移"
          />
          <TrialConversionChart
            data={chartData}
            title="トライアル転換率推移"
          />
        </div>

        {/* Breakdown Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BreakdownPieChart
            data={platformBreakdown}
            title="プラットフォーム別内訳"
          />
          <BreakdownPieChart
            data={planBreakdown}
            title="プラン別内訳"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-gray-400">
            データは分析用のサンプルデータです（サーバー起動ごとにランダム生成）
          </p>
        </div>
      </footer>

      {/* Raw Data Modal */}
      <RawDataModal
        isOpen={isRawDataModalOpen}
        onClose={() => setIsRawDataModalOpen(false)}
        data={rawData}
      />
    </div>
  );
}
