import { useState, useMemo } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DailyMetrics } from '../types';

interface RawDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DailyMetrics[];
}

const PAGE_SIZE = 50;

export function RawDataModal({ isOpen, onClose, data }: RawDataModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof DailyMetrics>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const paginatedData = sortedData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (field: keyof DailyMetrics) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['date', 'platform', 'planType', 'activeSubscriptions', 'newSubscriptions', 'churns', 'mrr', 'trialConversions', 'trialStarts'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row =>
        headers.map(h => row[h as keyof DailyMetrics]).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscription_data_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(sortedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscription_data_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  if (!isOpen) return null;

  const SortIndicator = ({ field }: { field: keyof DailyMetrics }) => {
    if (field !== sortField) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-[95vw] max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">生データ表示</h2>
            <p className="text-sm text-gray-500 mt-1">
              全 {data.length.toLocaleString()} 件のレコード
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download size={16} />
              JSON
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th
                  onClick={() => handleSort('date')}
                  className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  日付<SortIndicator field="date" />
                </th>
                <th
                  onClick={() => handleSort('platform')}
                  className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  プラットフォーム<SortIndicator field="platform" />
                </th>
                <th
                  onClick={() => handleSort('planType')}
                  className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  プラン<SortIndicator field="planType" />
                </th>
                <th
                  onClick={() => handleSort('activeSubscriptions')}
                  className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  有効サブスク<SortIndicator field="activeSubscriptions" />
                </th>
                <th
                  onClick={() => handleSort('newSubscriptions')}
                  className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  新規<SortIndicator field="newSubscriptions" />
                </th>
                <th
                  onClick={() => handleSort('churns')}
                  className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  解約<SortIndicator field="churns" />
                </th>
                <th
                  onClick={() => handleSort('mrr')}
                  className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  MRR<SortIndicator field="mrr" />
                </th>
                <th
                  onClick={() => handleSort('trialStarts')}
                  className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  トライアル開始<SortIndicator field="trialStarts" />
                </th>
                <th
                  onClick={() => handleSort('trialConversions')}
                  className="px-4 py-3 text-right font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  トライアル転換<SortIndicator field="trialConversions" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((row, index) => (
                <tr key={`${row.date}-${row.platform}-${row.planType}-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-900">{row.date}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.platform === 'ios'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {row.platform === 'ios' ? 'iOS' : 'Android'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.planType === 'monthly'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {row.planType === 'monthly' ? '月額' : '年額'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-900">
                    {row.activeSubscriptions.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-600">
                    +{row.newSubscriptions.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-red-500">
                    -{row.churns.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-900">
                    ¥{row.mrr.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-600">
                    {row.trialStarts.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-600">
                    {row.trialConversions.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {((currentPage - 1) * PAGE_SIZE + 1).toLocaleString()} - {Math.min(currentPage * PAGE_SIZE, sortedData.length).toLocaleString()} / {sortedData.length.toLocaleString()} 件
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
