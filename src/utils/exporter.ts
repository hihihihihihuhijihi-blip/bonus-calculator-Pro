import * as XLSX from 'xlsx';
import type { CalculationResult, YearlySummary, UserInfo } from '../types';

interface ExportData {
  userInfo: UserInfo;
  results: CalculationResult[];
  summary: YearlySummary;
}

// 导出为Excel
export function exportToExcel(data: ExportData) {
  const { userInfo, results, summary } = data;

  // 创建工作簿
  const wb = XLSX.utils.book_new();

  // 1. 双月明细表
  const detailData = results.map(r => ({
    '双月': r.dual_month,
    '产品类型': r.product_type,
    '销售额': r.sales,
    '指标': r.target,
    '达成率': `${(r.rate * 100).toFixed(1)}%`,
    '达成系数': r.coefficient,
    '奖金': r.bonus,
  }));

  const detailWs = XLSX.utils.json_to_sheet(detailData);
  XLSX.utils.book_append_sheet(wb, detailWs, '双月明细');

  // 2. 年度汇总表
  const summaryData = [
    { '项目': '存量销售额', '金额': summary.stock_sales },
    { '项目': '新产品销售额', '金额': summary.new_product_sales },
    { '项目': '存量达成率', '金额': `${(summary.stock_rate * 100).toFixed(1)}%` },
    { '项目': '新产品达成率', '金额': `${(summary.new_product_rate * 100).toFixed(1)}%` },
    { '项目': '基础奖金合计', '金额': summary.total_bonus },
    { '项目': '增量奖', '金额': summary.increment_bonus },
    { '项目': '返还奖金', '金额': summary.refund_bonus },
    { '项目': '总奖金', '金额': summary.grand_total },
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, '年度汇总');

  // 3. 用户信息表
  const userInfoData = [
    { '项目': '姓名', '值': userInfo.name },
    { '项目': '片区', '值': userInfo.region },
    { '项目': '省份', '值': userInfo.province },
    { '项目': '负责医院数', '值': userInfo.hospitals.length },
    { '项目': '吡美莫司25年均值汇总', '值': userInfo.pimecrolimus_avg_total },
  ];

  const userInfoWs = XLSX.utils.json_to_sheet(userInfoData);
  XLSX.utils.book_append_sheet(wb, userInfoWs, '用户信息');

  // 生成文件名
  const fileName = `${userInfo.name}_奖金计算_${new Date().toLocaleDateString()}.xlsx`;

  // 下载文件
  XLSX.writeFile(wb, fileName);
}

// 导出为CSV（备用）
export function exportToCSV(data: ExportData) {
  const { results, summary } = data;

  const csvData = results.map(r => ({
    dual_month: r.dual_month,
    product_type: r.product_type,
    sales: r.sales,
    target: r.target,
    rate: `${(r.rate * 100).toFixed(1)}%`,
    coefficient: r.coefficient,
    bonus: r.bonus,
  }));

  // 添加汇总行 - 使用 any 类型来绕过类型检查
  csvData.push(
    { dual_month: '汇总' as any, product_type: '基础奖金' as any, sales: summary.total_bonus, target: '' as any, rate: '' as any, coefficient: '' as any, bonus: '' as any },
    { dual_month: '汇总' as any, product_type: '增量奖' as any, sales: summary.increment_bonus, target: '' as any, rate: '' as any, coefficient: '' as any, bonus: '' as any },
    { dual_month: '汇总' as any, product_type: '返还奖金' as any, sales: summary.refund_bonus, target: '' as any, rate: '' as any, coefficient: '' as any, bonus: '' as any },
    { dual_month: '汇总' as any, product_type: '总奖金' as any, sales: summary.grand_total, target: '' as any, rate: '' as any, coefficient: '' as any, bonus: '' as any }
  );

  const ws = XLSX.utils.json_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `奖金计算_${new Date().toLocaleDateString()}.csv`;
  link.click();
}
