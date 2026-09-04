from pathlib import Path
import re

p = Path('mudaraba-controls/index.html')
s = p.read_text(encoding='utf-8')

# Keep the study visually independent from the parent page.
s = s.replace('<a class="back" href="../">الملف الرئيسي</a>', '')

# Style the official Sanam links as part of the example card itself.
if '.snamLinks{' not in s:
    css = '.snamLinks{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.snamLinks a{display:inline-flex;align-items:center;padding:8px 11px;border-radius:11px;background:#fff;border:1px solid #DCCDBA;color:var(--n);font-size:10px;font-weight:800;text-decoration:none}.snamLinks a:hover{border-color:var(--g);background:#FFFBF6}'
    marker = '.compare{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}'
    if marker not in s:
        raise SystemExit('missing CSS marker')
    s = s.replace(marker, css + marker, 1)

links = '''<div class="snamLinks"><a href="https://cma.gov.sa/MediaCenter/NEWS/Pages/CMA_N_3907.aspx" target="_blank" rel="noopener">إعلان قبول طلب تقييد الدعوى · 2025</a><a href="https://cma.gov.sa/MediaCenter/NEWS/Pages/CMA_N_4020.aspx" target="_blank" rel="noopener">الإعلان الإلحاقي باعتماد الدعوى · 2026</a></div>'''
if 'class="snamLinks"' not in s:
    caption = '<div class="caption">الاستشهاد يقتصر على الأثر التنظيمي للتسويق في واقعة أسهم منشورة رسميا. اعتماد الدعوى الجماعية إجراء قضائي جماعي بحسب الإعلانات المنشورة، ويختلف عن صدور حكم نهائي في أصل المسؤولية.</div>'
    if caption not in s:
        raise SystemExit('missing Sanam caption')
    s = s.replace(caption, caption + links, 1)

# Remove the duplicated Sanam item from the general references section.
s = re.sub(
    r'<details class="src"><summary>هيئة السوق المالية · واقعة سنام الأعمال 2025 و2026</summary>.*?</details>',
    '',
    s,
    count=1,
    flags=re.S,
)

p.write_text(s, encoding='utf-8')
print('patched Sanam links into example card')
