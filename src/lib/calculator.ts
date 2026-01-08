import type {
  UserInfo,
  DualMonth,
  CalculationResult,
  YearlySummary,
  SalesInput,
} from '../types';
import { usersData } from '../data/users';

// 达成系数计算
export function getAchievementCoefficient(rate: number): number {
  if (rate < 0.8) return 0;
  if (rate < 1.0) return rate;
  return 1;
}

// 双月基础奖金计算
export function calculateDualMonthBonus(
  sales: number,
  target: number
): { bonus: number; coefficient: number; rate: number } {
  const rate = target > 0 ? sales / target : 0;
  const coefficient = getAchievementCoefficient(rate);
  const bonus = sales * 0.05 * coefficient;
  return { bonus, coefficient, rate };
}

// 增量奖计算
export function calculateIncrementBonus(
  pimecrolimusSales: number,
  userAvg25Total: number,
  months: number,
  stockAchievementRate: number
): number {
  if (stockAchievementRate < 1.0) return 0;
  const baseline = userAvg25Total * months;
  const increment = pimecrolimusSales - baseline;
  return Math.max(0, increment) * 0.05;
}

// 返还奖金计算（D1-D6未全额发放部分）
export function calculateRefund(
  dualMonthResults: CalculationResult[],
  yearlyRate: number
): number {
  if (yearlyRate < 1.0) return 0;

  let refund = 0;
  for (const dm of dualMonthResults) {
    const fullBonus = dm.sales * 0.05 * 1;
    const actualBonus = dm.bonus;
    refund += (fullBonus - actualBonus);
  }
  return refund;
}

// 特殊规则：检查是否应该排除该数据
export function shouldExcludeProduct(
  userName: string,
  region: string,
  nameT: string
): boolean {
  // 陈凤勤不参与计算
  if (userName === '陈凤勤') return true;

  // 河北&江苏片区的他克莫司不计算
  if ((region === '河北' || region === '江苏') && nameT === '他克莫司') {
    return true;
  }

  return false;
}

// 处理安爽的特殊情况（重庆+四川合并）
export function processAnShuangUser(userInfo: UserInfo): UserInfo {
  if (userInfo.name !== '安爽') return userInfo;

  // 安爽按重庆和四川片区汇总考核
  return {
    ...userInfo,
    region: '重庆+四川',
  };
}

// 获取某产品在某个双月的总指标（合并所有医院）
function getProductTarget(userInfo: UserInfo, productName: string, dualMonth: DualMonth): number {
  const product = userInfo.products[productName];
  if (!product) return 0;

  let totalTarget = 0;
  for (const hospital of Object.values(product.hospitals)) {
    // 指标key格式为 26D1, 26D2 等
    const targetKey = `26${dualMonth}`;
    totalTarget += hospital.targets[targetKey] || 0;
  }

  return totalTarget;
}

// 主计算函数
export function calculateBonus(
  userName: string,
  salesInputs: SalesInput[]
): {
  results: CalculationResult[];
  summary: YearlySummary;
  error?: string;
} {
  const user = usersData[userName];

  if (!user) {
    return { results: [], summary: {} as YearlySummary, error: '用户不存在' };
  }

  // 检查陈凤勤
  if (userName === '陈凤勤') {
    return { results: [], summary: {} as YearlySummary, error: '陈凤勤不参与奖金计算' };
  }

  const processedUser = processAnShuangUser(user);

  // 按双月和产品类型分组计算
  const dualMonths: DualMonth[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];
  const results: CalculationResult[] = [];

  // 按双月分组销售数据
  const salesByDualMonth: Record<DualMonth, SalesInput[]> = {
    D1: [],
    D2: [],
    D3: [],
    D4: [],
    D5: [],
    D6: [],
  };

  for (const input of salesInputs) {
    salesByDualMonth[input.dual_month].push(input);
  }

  // 计算每个双月的奖金
  for (const dm of dualMonths) {
    const inputs = salesByDualMonth[dm];

    // 按产品类型分组（存量/新产品）
    let stockSales = 0;
    let stockTarget = 0;
    let newProductSales = 0;
    let newProductTarget = 0;

    // 吡美莫司增量相关
    let pimecrolimusSales = 0;

    for (const input of inputs) {
      const product = processedUser.products[input.product];
      if (!product) continue;

      // 检查是否需要排除
      if (shouldExcludeProduct(userName, processedUser.region, product.nameT)) {
        continue;
      }

      const productTarget = getProductTarget(processedUser, input.product, dm);
      const salesAmount = input.amount;

      if (product.type === '存量产品') {
        stockSales += salesAmount;
        stockTarget += productTarget;

        // 统计吡美莫司销售额
        if (product.nameT === '吡美莫司') {
          pimecrolimusSales += salesAmount;
        }
      } else {
        newProductSales += salesAmount;
        newProductTarget += productTarget;
      }
    }

    // 计算存量产品奖金
    if (stockSales > 0 || stockTarget > 0) {
      const stockResult = calculateDualMonthBonus(stockSales, stockTarget);

      // 计算吡美莫司增量（按双月）
      const months = { D1: 2, D2: 4, D3: 6, D4: 8, D5: 10, D6: 12 }[dm];
      const baseline = processedUser.pimecrolimus_avg_total * months;
      const incrementAmount = Math.max(0, pimecrolimusSales - baseline);
      const incrementBonus = incrementAmount * 0.05;

      // 增量奖只有该双月存量达成率>=100%时才发放
      const actualIncrementBonus = stockResult.rate >= 1.0 ? incrementBonus : 0;

      results.push({
        dual_month: dm,
        product_type: '存量产品',
        sales: stockSales,
        target: stockTarget,
        rate: stockResult.rate,
        coefficient: stockResult.coefficient,
        bonus: stockResult.bonus,
        increment_amount: incrementAmount,
        increment_bonus: actualIncrementBonus,
      });
    }

    // 计算新产品奖金
    if (newProductSales > 0 || newProductTarget > 0) {
      const newResult = calculateDualMonthBonus(newProductSales, newProductTarget);
      results.push({
        dual_month: dm,
        product_type: '新产品',
        sales: newProductSales,
        target: newProductTarget,
        rate: newResult.rate,
        coefficient: newResult.coefficient,
        bonus: newResult.bonus,
      });
    }
  }

  // 计算年度汇总
  const stockResults = results.filter(r => r.product_type === '存量产品');
  const newProductResults = results.filter(r => r.product_type === '新产品');

  const totalStockSales = stockResults.reduce((sum, r) => sum + r.sales, 0);
  const totalNewProductSales = newProductResults.reduce((sum, r) => sum + r.sales, 0);

  // 计算全年指标（D1-D6全部相加，不管是否有输入）
  let fullYearStockTarget = 0;
  let fullYearNewProductTarget = 0;

  for (const dm of dualMonths) {
    // 遍历所有产品，计算该双月的指标
    for (const [productName, product] of Object.entries(processedUser.products)) {
      // 检查是否需要排除
      if (shouldExcludeProduct(userName, processedUser.region, product.nameT)) {
        continue;
      }

      const productTarget = getProductTarget(processedUser, productName, dm);

      if (product.type === '存量产品') {
        fullYearStockTarget += productTarget;
      } else {
        fullYearNewProductTarget += productTarget;
      }
    }
  }

  const stockRate = fullYearStockTarget > 0 ? totalStockSales / fullYearStockTarget : 0;
  const newProductRate = fullYearNewProductTarget > 0 ? totalNewProductSales / fullYearNewProductTarget : 0;

  // 分别计算存量和新产品奖金（增量奖已包含在结果中）
  const stockBonus = stockResults.reduce((sum, r) => sum + r.bonus + (r.increment_bonus || 0), 0);
  const newProductBonus = newProductResults.reduce((sum, r) => sum + r.bonus, 0);

  // 汇总各双月的增量奖
  const totalIncrementBonus = stockResults.reduce((sum, r) => sum + (r.increment_bonus || 0), 0);

  // 实际发放的奖金
  const actualTotalBonus = stockBonus + newProductBonus;

  // 计算返还奖金
  const stockRefund = calculateRefund(stockResults, stockRate);
  const newProductRefund = calculateRefund(newProductResults, newProductRate);
  const totalRefund = stockRefund + newProductRefund;

  const summary: YearlySummary = {
    stock_sales: totalStockSales,
    new_product_sales: totalNewProductSales,
    stock_rate: stockRate,
    new_product_rate: newProductRate,
    stock_bonus: stockBonus,
    new_product_bonus: newProductBonus,
    total_bonus: actualTotalBonus,
    total_bonus_with_increment: actualTotalBonus,
    increment_bonus: totalIncrementBonus,
    refund_bonus: totalRefund,
    grand_total: actualTotalBonus + totalRefund,
  };

  return { results, summary };
}

// 获取用户列表
export function getUserList(): string[] {
  return Object.keys(usersData).filter(name => name !== '陈凤勤');
}

// 获取用户信息
export function getUserInfo(userName: string): UserInfo | null {
  const user = usersData[userName];
  if (!user) return null;
  return processAnShuangUser(user);
}

// 检查用户是否存在
export function userExists(userName: string): boolean {
  return userName in usersData;
}
