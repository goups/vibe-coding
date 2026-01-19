import { Calendar, Smartphone, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import type { Platform, PlanType, Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  dateRange: { min: Date; max: Date };
}

export function FilterBar({ filters, onFiltersChange, dateRange }: FilterBarProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onFiltersChange({ ...filters, startDate: newDate });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onFiltersChange({ ...filters, endDate: newDate });
    }
  };

  const handlePlatformChange = (platform: Platform) => {
    onFiltersChange({ ...filters, platform });
  };

  const handlePlanChange = (planType: PlanType) => {
    onFiltersChange({ ...filters, planType });
  };

  const setQuickRange = (days: number) => {
    const end = dateRange.max;
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    onFiltersChange({ ...filters, startDate: start, endDate: end });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-6">
        {/* Date Range */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={18} />
            <span className="text-sm font-medium">期間</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={format(filters.startDate, 'yyyy-MM-dd')}
              min={format(dateRange.min, 'yyyy-MM-dd')}
              max={format(filters.endDate, 'yyyy-MM-dd')}
              onChange={handleStartDateChange}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-gray-400">〜</span>
            <input
              type="date"
              value={format(filters.endDate, 'yyyy-MM-dd')}
              min={format(filters.startDate, 'yyyy-MM-dd')}
              max={format(dateRange.max, 'yyyy-MM-dd')}
              onChange={handleEndDateChange}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-1 ml-2">
            {[
              { label: '7日', days: 7 },
              { label: '30日', days: 30 },
              { label: '90日', days: 90 },
              { label: '1年', days: 365 },
            ].map(({ label, days }) => (
              <button
                key={days}
                onClick={() => setQuickRange(days)}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-8 w-px bg-gray-200" />

        {/* Platform Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-500">
            <Smartphone size={18} />
            <span className="text-sm font-medium">OS</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              { value: 'all', label: 'すべて' },
              { value: 'ios', label: 'iOS' },
              { value: 'android', label: 'Android' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handlePlatformChange(value as Platform)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filters.platform === value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-8 w-px bg-gray-200" />

        {/* Plan Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-500">
            <CreditCard size={18} />
            <span className="text-sm font-medium">プラン</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[
              { value: 'all', label: 'すべて' },
              { value: 'monthly', label: '月額' },
              { value: 'yearly', label: '年額' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handlePlanChange(value as PlanType)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filters.planType === value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
