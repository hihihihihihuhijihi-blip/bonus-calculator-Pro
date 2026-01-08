"""侦察页面结构"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')

    # 截图
    page.screenshot(path='/tmp/recon_01.png', full_page=True)

    # 获取页面内容
    content = page.content()
    print("=== 页面HTML结构 ===")
    print(content[:5000])

    # 查找所有输入框
    print("\n=== 所有输入框 ===")
    inputs = page.locator('input').all()
    for i, inp in enumerate(inputs):
        try:
            placeholder = inp.get_attribute('placeholder') or ''
            input_type = inp.get_attribute('type') or ''
            print(f"Input {i}: type={input_type}, placeholder={placeholder}")
        except:
            pass

    # 查找所有按钮
    print("\n=== 所有按钮 ===")
    buttons = page.locator('button').all()
    for i, btn in enumerate(buttons):
        try:
            text = btn.text_content() or ''
            print(f"Button {i}: {text[:50]}")
        except:
            pass

    print("\n截图已保存: /tmp/recon_01.png")

    page.wait_for_timeout(5000)
    browser.close()
