import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  format?: 'number' | 'currency' | 'percent';
  invertChange?: boolean;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = '前期比',
  icon: Icon,
  iconColor,
  iconBgColor,
  format = 'number',
  invertChange = false,
}: KPICardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return `¥${val.toLocaleString()}`;
      case 'percent':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getChangeColor = (change: number): string => {
    if (change === 0) return 'text-gray-500';
    const isPositive = invertChange ? change < 0 : change > 0;
    return isPositive ? 'text-emerald-600' : 'text-red-500';
  };

  const getChangeBgColor = (change: number): string => {
    if (change === 0) return 'bg-gray-50';
    const isPositive = invertChange ? change < 0 : change > 0;
    return isPositive ? 'bg-emerald-50' : 'bg-red-50';
  };

  const TrendIcon = change === 0 ? Minus : change > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">
            {formatValue(value)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getChangeBgColor(change)} ${getChangeColor(change)}`}
            >
              <TrendIcon size={12} />
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-400">{changeLabel}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor}`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
