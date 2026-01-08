import type { StoredSalesData, SalesInput, DualMonth } from '../types';

const STORAGE_KEY = 'bonus_calculator_sales_data';

// 从本地存储读取销售数据
export function loadSalesData(userName: string): Record<DualMonth, Record<string, number>> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { D1: {}, D2: {}, D3: {}, D4: {}, D5: {}, D6: {} };

  try {
    const data: StoredSalesData = JSON.parse(stored);
    return (data[userName] || { D1: {}, D2: {}, D3: {}, D4: {}, D5: {}, D6: {} }) as Record<
      DualMonth,
      Record<string, number>
    >;
  } catch {
    return { D1: {}, D2: {}, D3: {}, D4: {}, D5: {}, D6: {} };
  }
}

// 保存销售数据到本地存储
export function saveSalesData(
  userName: string,
  dualMonth: DualMonth,
  data: Record<string, number>
): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  const allData: StoredSalesData = stored ? JSON.parse(stored) : {};

  if (!allData[userName]) {
    allData[userName] = { D1: {}, D2: {}, D3: {}, D4: {}, D5: {}, D6: {} };
  }

  allData[userName][dualMonth] = data;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

// 获取用户所有双月的销售数据
export function getAllSalesData(userName: string): SalesInput[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const allData: StoredSalesData = JSON.parse(stored);
    const userData = allData[userName];

    if (!userData) return [];

    const inputs: SalesInput[] = [];

    for (const [dualMonth, data] of Object.entries(userData)) {
      for (const [product, amount] of Object.entries(data)) {
        if (amount > 0) {  // 只返回有销售额的记录
          inputs.push({
            product,
            dual_month: dualMonth as DualMonth,
            amount,
          });
        }
      }
    }

    return inputs;
  } catch {
    return [];
  }
}

// 清除用户数据
export function clearUserData(userName: string): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  try {
    const allData: StoredSalesData = JSON.parse(stored);
    delete allData[userName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch {
    // Ignore errors
  }
}

// 检查某个双月是否有数据
export function hasDataForDualMonth(userName: string, dualMonth: DualMonth): boolean {
  const data = loadSalesData(userName);
  return Object.keys(data[dualMonth] || {}).length > 0;
}

// 获取已输入数据的双月列表
export function getFilledDualMonths(userName: string): DualMonth[] {
  const data = loadSalesData(userName);
  const filled: DualMonth[] = [];

  for (const dm of ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'] as DualMonth[]) {
    if (Object.keys(data[dm] || {}).length > 0) {
      filled.push(dm);
    }
  }

  return filled;
}
