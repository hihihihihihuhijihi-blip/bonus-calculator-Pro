import { useState } from 'react';
import type { CalculationResult, YearlySummary } from '../types';

interface ResultTableProps {
  results: CalculationResult[];
  summary: YearlySummary;
}

export function ResultTable({ results, summary }: ResultTableProps) {
  const [collapsedDualMonths, setCollapsedDualMonths] = useState<Set<string>>(new Set());
  const [yearlySummaryCollapsed, setYearlySummaryCollapsed] = useState(true);

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const toggleDualMonth = (dm: string) => {
    setCollapsedDualMonths(prev => {
      const next = new Set(prev);
      if (next.has(dm)) {
        next.delete(dm);
      } else {
        next.add(dm);
      }
      return next;
    });
  };

  const toggleYearlySummary = () => {
    setYearlySummaryCollapsed(prev => !prev);
  };

  const resultsByDualMonth = results.reduce((acc, result) => {
    if (!acc[result.dual_month]) {
      acc[result.dual_month] = [];
    }
    acc[result.dual_month].push(result);
    return acc;
  }, {} as Record<string, CalculationResult[]>);

  const dualMonthOrder = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];

  // 进度条组件
  const ProgressBar = ({ rate }: { rate: number }) => {
    const percent = Math.min(rate * 100, 120);
    const color =
      rate >= 1 ? 'bg-emerald-500' :
      rate >= 0.8 ? 'bg-amber-500' :
      'bg-red-400';
    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    );
  };

  // 折叠图标
  const ChevronIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 sm:px-6 py-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">计算结果报告</h2>
            <p className="text-teal-100 text-xs mt-0.5">双月奖金明细</p>
          </div>
        </div>
      </div>

      {/* 双月列表 */}
      <div className="space-y-3">
        {dualMonthOrder.map(dm => {
          const dmResults = resultsByDualMonth[dm];
          if (!dmResults || dmResults.length === 0) return null;

          const stockResult = dmResults.find(r => r.product_type === '存量产品');
          const newProductResult = dmResults.find(r => r.product_type === '新产品');

          // 增量奖（各D段已独立判断是否发放）
          const incrementBonus = stockResult?.increment_bonus || 0;
          const incrementAmount = stockResult?.increment_amount || 0;
          const hasIncrement = incrementBonus > 0;
          const totalBonus = dmResults.reduce((sum, r) => sum + r.bonus + (r.increment_bonus || 0), 0);
          const isCollapsed = collapsedDualMonths.has(dm);

          return (
            <div key={dm} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* 双月标题 - 可点击折叠 */}
              <button
                onClick={() => toggleDualMonth(dm)}
                className="w-full bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-800">{dm}</span>
                  <ChevronIcon isCollapsed={isCollapsed} />
                </div>
                <span className="text-base font-semibold text-teal-600">
                  奖金 {formatCurrency(totalBonus)}
                </span>
              </button>

              {/* 可折叠内容 */}
              <div className={`${isCollapsed ? 'hidden' : 'block'} p-4 space-y-3`}>
                {/* 存量产品 */}
                {stockResult && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                      <span className="text-sm font-medium text-gray-700">存量产品</span>
                    </div>
                    <div className="pl-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">销售额</span>
                          <span className="ml-2 text-gray-900">{formatCurrency(stockResult.sales)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">指标额</span>
                          <span className="ml-2 text-gray-900">{formatCurrency(stockResult.target)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <ProgressBar rate={stockResult.rate} />
                        <span className={`text-xs font-semibold ${stockResult.rate >= 1 ? 'text-emerald-600' : stockResult.rate >= 0.8 ? 'text-amber-600' : 'text-red-500'}`}>
                          {formatPercent(stockResult.rate)}
                        </span>
                      </div>
                      <div className="text-right text-sm font-bold text-teal-600">
                        奖金 {formatCurrency(stockResult.bonus)}
                      </div>
                    </div>
                  </div>
                )}

                {/* 分割线 */}
                {stockResult && newProductResult && <div className="border-t border-gray-100"></div>}

                {/* 新产品 */}
                {newProductResult && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      <span className="text-sm font-medium text-gray-700">新产品</span>
                    </div>
                    <div className="pl-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">销售额</span>
                          <span className="ml-2 text-gray-900">{formatCurrency(newProductResult.sales)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">指标额</span>
                          <span className="ml-2 text-gray-900">{formatCurrency(newProductResult.target)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <ProgressBar rate={newProductResult.rate} />
                        <span className={`text-xs font-semibold ${newProductResult.rate >= 1 ? 'text-emerald-600' : newProductResult.rate >= 0.8 ? 'text-amber-600' : 'text-red-500'}`}>
                          {formatPercent(newProductResult.rate)}
                        </span>
                      </div>
                      <div className="text-right text-sm font-bold text-teal-600">
                        奖金 {formatCurrency(newProductResult.bonus)}
                      </div>
                    </div>
                  </div>
                )}

                {/* 分割线 */}
                {hasIncrement && (stockResult || newProductResult) && <div className="border-t border-gray-100"></div>}

                {/* 增量奖 */}
                {hasIncrement && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      <span className="text-sm font-medium text-gray-700">增量奖</span>
                    </div>
                    <div className="pl-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">增量额 {formatCurrency(incrementAmount)}</span>
                        <span className="font-bold text-teal-600 text-sm">奖金 {formatCurrency(incrementBonus)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 年度汇总 - 可折叠 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={toggleYearlySummary}
          className="w-full bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-800">年度汇总</span>
            <ChevronIcon isCollapsed={yearlySummaryCollapsed} />
          </div>
          <span className="text-base font-semibold text-teal-600">
            奖金 {formatCurrency(summary.grand_total)}
          </span>
        </button>

        <div className={`${yearlySummaryCollapsed ? 'hidden' : 'block'} p-4 space-y-4`}>
          {/* 存量达成率 */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">存量达成</span>
              <span className={`font-semibold ${summary.stock_rate >= 1 ? 'text-emerald-600' : summary.stock_rate >= 0.8 ? 'text-amber-600' : 'text-red-500'}`}>
                {formatPercent(summary.stock_rate)}
              </span>
            </div>
            <ProgressBar rate={summary.stock_rate} />
          </div>

          {/* 新品达成率 */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">新品达成</span>
              <span className={`font-semibold ${summary.new_product_rate >= 1 ? 'text-emerald-600' : summary.new_product_rate >= 0.8 ? 'text-amber-600' : 'text-red-500'}`}>
                {formatPercent(summary.new_product_rate)}
              </span>
            </div>
            <ProgressBar rate={summary.new_product_rate} />
          </div>

          {/* 奖金明细 */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            {/* 存量产品奖金 */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">存量产品奖金</span>
              <span className="font-semibold text-teal-600">{formatCurrency(summary.stock_bonus)}</span>
            </div>
            {/* 新产品奖金 */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">新产品奖金</span>
              <span className="font-semibold text-teal-600">{formatCurrency(summary.new_product_bonus)}</span>
            </div>
            {/* 增量奖 */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">增量奖</span>
              <span className={`font-semibold ${summary.increment_bonus > 0 ? 'text-teal-600' : 'text-gray-400'}`}>
                {summary.increment_bonus > 0 ? '+' : ''}{formatCurrency(summary.increment_bonus)}
              </span>
            </div>
            {/* 年度返还 */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">年度返还</span>
              <span className={`font-semibold ${summary.refund_bonus > 0 ? 'text-teal-600' : 'text-gray-400'}`}>
                {summary.refund_bonus > 0 ? '+' : ''}{formatCurrency(summary.refund_bonus)}
              </span>
            </div>
            {/* 总奖金 */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
              <span className="font-semibold text-gray-700">总奖金</span>
              <span className="font-bold text-teal-600 text-base">{formatCurrency(summary.grand_total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
