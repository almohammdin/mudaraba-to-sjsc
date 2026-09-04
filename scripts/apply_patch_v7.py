from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

def replace_once(old, new, label):
    global s
    if old in s:
        s = s.replace(old, new, 1)
        return
    if new in s:
        return
    raise SystemExit(f'missing target: {label}')

replace_once(
    ".heroGrid{position:relative;z-index:2;display:grid;grid-template-columns:1.1fr .9fr;gap:42px;align-items:center}",
    ".heroGrid{position:relative;z-index:2;display:block;max-width:980px}.heroGrid>div:first-child{max-width:980px}",
    "hero layout",
)

replace_once(
    '<div class="heroLogo"><div><img src="assets/site-icon.svg" alt="هوية المشروع"></div></div>',
    '',
    "large hero logo",
)

old_strong = 'سهم تملك الشركة خيار استرداده لاحقا وفق شروط تكتب منذ يوم الإصدار'
new_strong = 'معنى الاسترداد هنا: الشركة تسترد هذه الأسهم من المساهم مقابل دفع قيمة الاسترداد له'
replace_once(old_strong, new_strong, 'redeemable headline')

old_p = 'المستثمر يشتري السهم ويصبح مساهما. الفرق أن وثائق الإصدار تحدد من البداية متى تستطيع الشركة استرداد السهم وكيف تحسب قيمة الاسترداد. عند تنفيذ الاسترداد تدفع الشركة القيمة لصاحب السهم، تنتهي ملكيته في هذا السهم، ويلغى السهم وتستكمل الشركة إجراءات تخفيض رأس المال.'
new_p = 'عند إصدار هذه الفئة تكتب الشروط التي تحدد وقت ممارسة الشركة لخيار الاسترداد وطريقة حساب قيمته. عندما تمارس الشركة الخيار، تدفع للمساهم قيمة الاسترداد عن الأسهم المحددة، ثم تلغى الأسهم المستردة وفق الإجراءات النظامية.'
replace_once(old_p, new_p, 'redeemable paragraph')

pattern = re.compile(r'<div class="redeemExplain"><b>الفرق في جملة واحدة</b>.*?</div></article>', re.S)
replacement = '''<div class="redeemExplain"><b>من يسترد؟ ماذا يسترد؟ وممن؟</b><div class="redeemCompare"><div><small>من يسترد؟</small><strong>الشركة نفسها تمارس خيار الاسترداد.</strong></div><div><small>ماذا تسترد؟</small><strong>الأسهم القابلة للاسترداد التي سبق أن أصدرتها.</strong></div><div><small>ممن تسترد؟</small><strong>من المساهم الذي يملك تلك الأسهم.</strong></div><div><small>ما المقابل؟</small><strong>تدفع للمساهم قيمة الاسترداد وفق السعر أو المعادلة المكتوبة في شروط الإصدار.</strong></div></div><span>مثال افتراضي: يملك مساهم <span class="money"><span>10,000</span></span> سهم قابل للاسترداد. تنص شروط الإصدار على أن للشركة خيار استرداد السهم بعد مدة محددة بسعر <span class="money"><span class="sar">&#xea;</span><span>10</span></span> للسهم. عند ممارسة الخيار تدفع الشركة للمساهم <span class="money"><span class="sar">&#xea;</span><span>100,000</span></span> عن هذه الأسهم، ثم تلغى الأسهم المستردة وفق الإجراءات النظامية.</span></div></article>'''
if pattern.search(s):
    s = pattern.sub(replacement, s, count=1)
elif 'من يسترد؟ ماذا يسترد؟ وممن؟' not in s:
    raise SystemExit('missing target: redeemable detail block')

p.write_text(s, encoding='utf-8')
print('patched')
