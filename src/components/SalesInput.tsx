import { useState, useEffect } from 'react';
import type { UserInfo, DualMonth } from '../types';
import { saveSalesData, loadSalesData, hasDataForDualMonth, getLastDualMonth, setLastDualMonth } from '../utils/storage';

interface SalesInputProps {
  userInfo: UserInfo;
  onDataSaved?: () => void;
}

const DUAL_MONTHS: DualMonth[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];

// D段月份映射
const DUAL_MONTH_LABELS: Record<DualMonth, string> = {
  D1: '1-2月',
  D2: '3-4月',
  D3: '5-6月',
  D4: '7-8月',
  D5: '9-10月',
  D6: '11-12月',
};

// 存量产品排列顺序
const STOCK_PRODUCT_ORDER = ['吡美莫司', '金纽尔', '火把花根', '丽芙', '卡泊三醇', '他克莫司', '其它'];

interface ProductGroup {
  displayName: string;
  fullName: string;
  type: string;
}

export function SalesInput({ userInfo, onDataSaved }: SalesInputProps) {
  // 从 localStorage 读取上次选择的 D 段
  const [selectedDualMonth, setSelectedDualMonth] = useState<DualMonth>(() => {
    return getLastDualMonth(userInfo.name);
  });
  const [salesData, setSalesData] = useState<Record<string, number>>({});
  const [filledMonths, setFilledMonths] = useState<Set<DualMonth>>(new Set());

  useEffect(() => {
    loadFilledMonths();
    loadMonthData(selectedDualMonth);
  }, [userInfo.name]);

  const loadFilledMonths = () => {
    const filled = new Set<DualMonth>();
    for (const dm of DUAL_MONTHS) {
      if (hasDataForDualMonth(userInfo.name, dm)) {
        filled.add(dm);
      }
    }
    setFilledMonths(filled);
  };

  const loadMonthData = (dm: DualMonth) => {
    const data = loadSalesData(userInfo.name);
    setSalesData(data[dm] || {});
  };

  const handleDualMonthChange = (dm: DualMonth) => {
    // 自动保存当前双月数据
    saveSalesData(userInfo.name, selectedDualMonth, salesData);
    loadFilledMonths();

    setSelectedDualMonth(dm);
    loadMonthData(dm);
    // 保存用户选择的双月
    setLastDualMonth(userInfo.name, dm);
    if (onDataSaved) onDataSaved();
  };

  const handleInputChange = (productKey: string, value: string) => {
    const productNames = productKey.split(',');
    const numValue = value === '' ? 0 : parseFloat(value);

    setSalesData(prev => {
      const updated = { ...prev };
      // 用户输入多少就是多少，只存储在第一个产品上
      // 这样可以避免多个产品导致数值翻倍的问题
      const firstName = productNames[0];
      updated[firstName] = isNaN(numValue) ? 0 : numValue;

      // 清空同组的其他产品
      for (let i = 1; i < productNames.length; i++) {
        updated[productNames[i]] = 0;
      }
      return updated;
    });

    // 自动保存
    const updatedData = { ...salesData };
    const firstName = productNames[0];
    updatedData[firstName] = isNaN(numValue) ? 0 : numValue;
    for (let i = 1; i < productNames.length; i++) {
      updatedData[productNames[i]] = 0;
    }
    saveSalesData(userInfo.name, selectedDualMonth, updatedData);
    loadFilledMonths();
    if (onDataSaved) onDataSaved();
  };

  const getInputValue = (productKey: string): string => {
    const productNames = productKey.split(',');
    // 只取第一个产品的值
    const value = salesData[productNames[0]];
    if (value !== undefined && value !== 0) {
      return value.toString();
    }
    return '';
  };

  // 按商名T分组
  const nameTToProducts = new Map<string, string[]>();

  for (const [productName, productInfo] of Object.entries(userInfo.products)) {
    const nameT = productInfo.nameT || productName;
    if (!nameTToProducts.has(nameT)) {
      nameTToProducts.set(nameT, []);
    }
    nameTToProducts.get(nameT)!.push(productName);
  }

  const stockProducts: ProductGroup[] = [];
  const newProducts: ProductGroup[] = [];

  for (const [nameT, productNames] of nameTToProducts) {
    const firstProduct = userInfo.products[productNames[0]];
    if (!firstProduct) continue;

    const productGroup: ProductGroup = {
      displayName: nameT,
      fullName: productNames.join(','),
      type: firstProduct.type,
    };

    if (firstProduct.type === '存量产品') {
      stockProducts.push(productGroup);
    } else {
      newProducts.push(productGroup);
    }
  }

  // 对存量产品按指定顺序排序
  stockProducts.sort((a, b) => {
    const getSortIndex = (name: string) => {
      for (let i = 0; i < STOCK_PRODUCT_ORDER.length; i++) {
        if (name.includes(STOCK_PRODUCT_ORDER[i])) {
          return i;
        }
      }
      return STOCK_PRODUCT_ORDER.length; // '其它'排在最后
    };
    return getSortIndex(a.displayName) - getSortIndex(b.displayName);
  });

  const totalFilled = filledMonths.size;
  const progress = (totalFilled / DUAL_MONTHS.length) * 100;

  return (
    <div className="bg-white rounded-xl border border-teal-100 shadow-sm">
      {/* 置顶固定区域：头部 + D段标题 */}
      <div className="sticky top-0 z-20 bg-white rounded-t-xl">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">销售数据录入</h2>
                <p className="text-teal-100 text-xs mt-0.5">输入后自动保存</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xl sm:text-2xl font-bold text-white">{totalFilled}/{DUAL_MONTHS.length}</div>
              <div className="text-teal-100 text-[10px]">已完成</div>
            </div>
          </div>
          {/* 进度条 */}
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* 当前D段标题 */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 sm:px-6 py-3 border-b border-teal-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-teal-700">
                {selectedDualMonth} 数据录入
              </h3>
              <p className="text-sm text-teal-500 mt-0.5">{DUAL_MONTH_LABELS[selectedDualMonth]}</p>
            </div>
          </div>
        </div>

        {/* 双月选择器 */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              切换双月
            </label>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {DUAL_MONTHS.map(dm => (
              <button
                key={dm}
                onClick={() => handleDualMonthChange(dm)}
                className={`relative px-2 py-2 sm:px-3 sm:py-2.5 rounded-lg font-medium text-sm transition-all border ${
                  selectedDualMonth === dm
                    ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/25'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                {dm}
                {filledMonths.has(dm) && (
                  <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] ${
                    selectedDualMonth === dm ? 'bg-emerald-300 text-teal-700' : 'bg-teal-500 text-white'
                  }`}>
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* 输入表单 */}
        <div className="space-y-4">
          {/* 存量产品 */}
          {stockProducts.length > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                <h3 className="text-sm font-semibold text-gray-700">存量产品</h3>
                <span className="text-xs text-gray-400">({stockProducts.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stockProducts.map(product => (
                  <div key={product.fullName} className="bg-white rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-600 mb-2 truncate" title={product.displayName}>
                      {product.displayName}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={getInputValue(product.fullName)}
                        onChange={e => handleInputChange(product.fullName, e.target.value)}
                        className="w-full px-3 py-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-right font-medium transition-all text-sm"
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">元</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 新产品 */}
          {newProducts.length > 0 && (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                <h3 className="text-sm font-semibold text-gray-700">新产品</h3>
                <span className="text-xs text-gray-400">({newProducts.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {newProducts.map(product => (
                  <div key={product.fullName} className="bg-white rounded-lg p-3 border border-teal-100">
                    <label className="block text-xs font-medium text-gray-600 mb-2 truncate" title={product.displayName}>
                      {product.displayName}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={getInputValue(product.fullName)}
                        onChange={e => handleInputChange(product.fullName, e.target.value)}
                        className="w-full px-3 py-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-right font-medium transition-all text-sm"
                        placeholder="0.00"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">元</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
