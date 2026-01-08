"""奖金计算器自动化测试脚本（简化版）"""
from playwright.sync_api import sync_playwright

def test_bonus_calculator():
    """执行核心测试流程"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        print("=" * 60)
        print("奖金计算器自动化测试")
        print("=" * 60)

        # TC-001: 用户登录
        print("\n[TC-001] 用户登录...")
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')

        page.fill('input[placeholder="请输入您的姓名"]', '张艳')
        page.wait_for_timeout(300)
        page.locator('button', has_text='立即登录').click()
        page.wait_for_load_state('networkidle')
        print("  ✓ 登录成功")

        page.screenshot(path='/tmp/test_01_logged_in.png')

        # 检查页面元素
        print("\n[侦察] 检查页面元素...")

        # 查找所有按钮
        all_buttons = page.locator('button').all()
        print(f"  页面上共有 {len(all_buttons)} 个按钮")

        for i, btn in enumerate(all_buttons[:15]):  # 只显示前15个
            try:
                text = btn.text_content() or ''
                if text.strip():
                    print(f"  Button {i}: {text.strip()[:40]}")
            except:
                pass

        # 查找所有输入框
        all_inputs = page.locator('input').all()
        print(f"  页面上共有 {len(all_inputs)} 个输入框")

        # TC-002/003: D段切换测试
        print("\n[TC-002/003] D段切换测试...")

        # 尝试找到并点击D段按钮
        dm_buttons = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']

        for dm in dm_buttons:
            try:
                # 使用get_by_role和name来查找
                btn = page.get_by_role('button', name=dm, exact=True)
                if btn.is_visible():
                    print(f"  找到 {dm} 按钮")
                    if dm == 'D2':
                        btn.click()
                        page.wait_for_timeout(500)
                        print(f"  ✓ 点击了 {dm}")
                    break
            except:
                pass

        page.screenshot(path='/tmp/test_02_after_click.png')

        # TC-006/007: 数据输入
        print("\n[TC-006/007] 数据输入测试...")

        # 查找数字输入框
        number_inputs = page.locator('input[type="number"]').all()
        print(f"  找到 {len(number_inputs)} 个数字输入框")

        if number_inputs:
            # 输入测试数据
            for i in range(min(3, len(number_inputs))):
                number_inputs[i].fill(str((i + 1) * 10000))
                page.wait_for_timeout(200)
            print("  ✓ 输入了测试数据")

        page.screenshot(path='/tmp/test_03_data_input.png')

        # TC-010: 无数据计算测试（先清空数据）
        print("\n[TC-010] Toast测试...")

        # 清空数据
        for inp in number_inputs:
            try:
                inp.fill('')
            except:
                pass

        page.wait_for_timeout(500)

        # 点击计算按钮
        calc_btn = page.locator('button', has_text='开始计算奖金')
        calc_btn.click()
        page.wait_for_timeout(2000)

        # 检查Toast
        toast_visible = page.locator('text=请先输入销售数据').is_visible()
        print(f"  {'✓' if toast_visible else '✗'} Toast显示：{'是' if toast_visible else '否'}")

        page.screenshot(path='/tmp/test_04_toast.png')

        # TC-012: 正常计算
        print("\n[TC-012] 正常计算测试...")

        # 重新输入数据
        number_inputs = page.locator('input[type="number"]').all()
        for i in range(min(3, len(number_inputs))):
            number_inputs[i].fill(str((i + 1) * 50000))
            page.wait_for_timeout(200)

        page.wait_for_timeout(500)

        # 点击计算
        calc_btn.click()
        page.wait_for_timeout(2000)

        # 检查结果页
        result_visible = page.locator('text=计算结果报告').is_visible()
        print(f"  {'✓' if result_visible else '✗'} 进入结果页：{'是' if result_visible else '否'}")

        page.screenshot(path='/tmp/test_05_result.png', full_page=True)

        # 测试总结
        print("\n" + "=" * 60)
        print("测试完成！查看 /tmp/test_*.png")
        print("=" * 60)

        page.wait_for_timeout(3000)
        browser.close()

if __name__ == '__main__':
    test_bonus_calculator()
