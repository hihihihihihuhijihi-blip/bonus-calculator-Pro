// 双月类型
export type DualMonth = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6';

// 双月对应的月数
export const DUAL_MONTH_MONTHS: Record<DualMonth, number> = {
  D1: 2,
  D2: 4,
  D3: 6,
  D4: 8,
  D5: 10,
  D6: 12,
};

// 产品类型
export type ProductType = '新产品' | '存量产品';

// 医院指标
export interface HospitalTarget {
  name: string;
  targets: Record<string, number>;  // key格式: 26D1, 26D2, 26D3等
}

// 产品信息
export interface ProductInfo {
  type: ProductType;
  nameS: string;
  nameJ: string;
  nameT: string;
  hospitals: Record<string, HospitalTarget>;
}

// 用户信息
export interface UserInfo {
  name: string;
  region: string;
  province: string;
  products: Record<string, ProductInfo>;
  hospitals: string[];
  pimecrolimus_avg_total: number;
}

// 销售输入 - 按产品总额输入
export interface SalesInput {
  product: string;        // 完整产品名称
  dual_month: DualMonth;
  amount: number;
}

// 计算结果
export interface CalculationResult {
  dual_month: DualMonth;
  product_type: ProductType;
  sales: number;
  target: number;
  rate: number;
  coefficient: number;
  bonus: number;
  // 增量相关（仅存量产品-吡美莫司）
  increment_amount?: number;  // 增量金额
  increment_bonus?: number;   // 增量奖金
}

// 年度汇总
export interface YearlySummary {
  stock_sales: number;
  new_product_sales: number;
  stock_rate: number;
  new_product_rate: number;
  stock_bonus: number;           // 存量产品D1-D6奖金
  new_product_bonus: number;     // 新产品D1-D6奖金
  total_bonus: number;           // D1-D6基础奖金合计
  total_bonus_with_increment: number;  // D1-D6基础奖金+增量奖
  increment_bonus: number;
  refund_bonus: number;
  grand_total: number;
}

// 用户数据
export interface UsersData {
  [key: string]: UserInfo;
}

// 指标数据
export interface IndicatorData {
  user: string;
  hospital_code: string;
  hospital_name: string;
  product: string;
  product_type: ProductType;
  nameT: string;
  region: string;
  dual_month: DualMonth;
  target: number;
}

// 吡美莫司均值
export type PimecrolimusAvg = Record<string, number>;

// 本地存储的销售数据 - 按产品存储
export interface StoredSalesData {
  [userName: string]: {
    [dualMonth: string]: {
      [product: string]: number;
    };
  };
}
