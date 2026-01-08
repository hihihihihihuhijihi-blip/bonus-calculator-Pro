import pandas as pd
import json
import os

# 读取指标表
df_indicator = pd.read_excel('/Users/hbwl/my-tools/奖金计算器项目/自营业务部指标表-一维表.xlsx')

# 读取均值表
df_avg = pd.read_excel('/Users/hbwl/my-tools/奖金计算器项目/2025年吡美莫司均值.xlsx')

# 按经办人建立索引数据结构
def build_user_data(indicator_df, avg_df):
    users = {}

    # 处理指标表
    for _, row in indicator_df.iterrows():
        user = row['经办人']
        if pd.isna(user):
            continue

        if user not in users:
            users[user] = {
                'name': user,
                'region': row['片区'] if pd.notna(row['片区']) else '',
                'province': row['省份'] if pd.notna(row['省份']) else '',
                'products': {},  # {产品: {医院编码: {双月: 指标}}}
                'hospitals': set(),  # 负责的医院
            }

        product = row['产品']
        hospital_code = row['CRM医院编码']
        hospital_name = row['CRM医院名称更新']
        product_type = row['产品类型']
        dual_month = row["双月''"].replace("'", "") if pd.notna(row["双月''"]) else None
        target = row['指标']

        if product not in users[user]['products']:
            users[user]['products'][product] = {
                'type': product_type if pd.notna(product_type) else '',
                'nameS': row['商名S'] if pd.notna(row['商名S']) else '',
                'nameJ': row['商名J'] if pd.notna(row['商名J']) else '',
                'nameT': row['商名T'] if pd.notna(row['商名T']) else '',
                'hospitals': {}
            }

        if hospital_code not in users[user]['products'][product]['hospitals']:
            users[user]['products'][product]['hospitals'][hospital_code] = {
                'name': hospital_name if pd.notna(hospital_name) else '',
                'targets': {}  # {双月: 指标}
            }

        if dual_month and pd.notna(target):
            users[user]['products'][product]['hospitals'][hospital_code]['targets'][dual_month] = float(target)

        users[user]['hospitals'].add(hospital_code)

    # 处理均值表（吡美莫司）
    pimecrolimus_avg = {}
    for _, row in df_avg.iterrows():
        hospital_code = row['CRM医院编码']
        avg25 = row['25年均值']
        if pd.notna(avg25):
            pimecrolimus_avg[str(hospital_code)] = float(avg25)

    # 将均值添加到用户数据中
    for user, data in users.items():
        data['pimecrolimus_avg_total'] = 0
        for hospital in data['hospitals']:
            if hospital in pimecrolimus_avg:
                data['pimecrolimus_avg_total'] += pimecrolimus_avg[hospital]
        data['hospitals'] = list(data['hospitals'])

    # 过滤陈凤勤（但在数据中保留，计算时再过滤）
    return users, pimecrolimus_avg

users_data, pimecrolimus_avg = build_user_data(df_indicator, df_avg)

# 输出目录
output_dir = '/Users/hbwl/my-tools/奖金计算器项目/bonus-calculator/src/data'
os.makedirs(output_dir, exist_ok=True)

# 保存用户数据
with open(os.path.join(output_dir, 'users.json'), 'w', encoding='utf-8') as f:
    json.dump(users_data, f, ensure_ascii=False, indent=2)

# 保存吡美莫司均值
with open(os.path.join(output_dir, 'pimecrolimus_avg.json'), 'w', encoding='utf-8') as f:
    json.dump(pimecrolimus_avg, f, ensure_ascii=False, indent=2)

# 保存原始指标数据（按经办人-医院-产品-双月索引）
indicator_data = {}
for _, row in df_indicator.iterrows():
    user = row['经办人']
    if pd.isna(user):
        continue
    product = row['产品']
    hospital_code = row['CRM医院编码']
    dual_month = row["双月''"].replace("'", "") if pd.notna(row["双月''"]) else None

    key = f'{user}_{hospital_code}_{product}_{dual_month}'
    indicator_data[key] = {
        'user': user,
        'hospital_code': hospital_code,
        'hospital_name': row['CRM医院名称更新'] if pd.notna(row['CRM医院名称更新']) else '',
        'product': product,
        'product_type': row['产品类型'] if pd.notna(row['产品类型']) else '',
        'nameT': row['商名T'] if pd.notna(row['商名T']) else '',
        'region': row['片区'] if pd.notna(row['片区']) else '',
        'dual_month': dual_month,
        'target': float(row['指标']) if pd.notna(row['指标']) else 0
    }

with open(os.path.join(output_dir, 'indicators.json'), 'w', encoding='utf-8') as f:
    json.dump(indicator_data, f, ensure_ascii=False, indent=2)

print(f'用户数: {len(users_data)}')
print(f'指标记录数: {len(indicator_data)}')
print(f'吡美莫司均值医院数: {len(pimecrolimus_avg)}')
print('数据已保存到:', output_dir)
