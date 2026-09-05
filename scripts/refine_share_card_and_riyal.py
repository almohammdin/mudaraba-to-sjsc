from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# 1) Stock cards: two cards on the first row, redeemable card full width beneath them.
css = r'''
/* share-card-layout-20260905 */
.shareGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
.shareGrid>.stype:nth-child(3){grid-column:1/-1}
@media(max-width:760px){.shareGrid{grid-template-columns:1fr}.shareGrid>.stype:nth-child(3){grid-column:auto}}
'''
if '/* share-card-layout-20260905 */' not in s:
    s = s.replace('</style>', css + '\n</style>', 1)

# 2) Keep the Saudi Riyal symbol and its amount together wherever the money component is used.
nowrap_css = r'''
/* money-nowrap-fix-20260905 */
.money{display:inline-flex!important;direction:ltr!important;align-items:baseline!important;gap:.28em!important;white-space:nowrap!important;flex-wrap:nowrap!important;word-break:keep-all!important}
.money>span{display:inline!important;white-space:nowrap!important;word-break:keep-all!important;flex:none!important}
'''
if '/* money-nowrap-fix-20260905 */' not in s:
    s = s.replace('</style>', nowrap_css + '\n</style>', 1)

# 3) Replace visible Arabic currency word with the Saudi Riyal symbol.
# Work only on text outside tags and outside script/style blocks to avoid changing JS/CSS source.
parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>)', s, flags=re.S|re.I)

def money_markup(num):
    return f'<span class="money"><span class="sar">&#xea;</span><span>{num}</span></span>'

def replace_text_segment(segment):
    chunks = re.split(r'(<[^>]+>)', segment)
    for i in range(0, len(chunks), 2):
        t = chunks[i]
        t = re.sub(r'(?<![\w>])([0-9][0-9,]*(?:\.[0-9]+)?)\s+(?:ريالات|ريال(?:\s+سعودي)?)', lambda m: money_markup(m.group(1)), t)
        t = t.replace('ريالات', '<span class="sar">&#xea;</span>')
        t = t.replace('ريال سعودي', '<span class="sar">&#xea;</span>')
        t = t.replace('ريال', '<span class="sar">&#xea;</span>')
        chunks[i] = t
    return ''.join(chunks)

for i in range(0, len(parts), 2):
    parts[i] = replace_text_segment(parts[i])
s = ''.join(parts)

# 4) Rebuild the interactive structure as a two-row flow on desktop and a vertical flow on mobile.
if 'data-layout="two-row"' not in s:
    start = s.find('<div class="structureJourney" aria-label="تسلسل الهيكل المقترح">')
    end_marker = '</div><div class="structureDetail"'
    end = s.find(end_marker, start)
    if start == -1 or end == -1:
        raise SystemExit('structure journey block not found')
    new_structure = '''<div class="structureJourney" data-layout="two-row" aria-label="تسلسل الهيكل المقترح"><div class="journeyRow journeyRowTop"><button class="journeyNode active" data-structure-step="money" type="button"><i>1</i><b>أصحاب الأموال</b><span>مؤسسون وأصحاب عقود قائمة</span></button><div class="journeyArrow topArrow">←</div><button class="journeyNode" data-structure-step="subscribe" type="button"><i>2</i><b>الاكتتاب</b><span>تحديد عدد وفئة الأسهم</span></button><div class="journeyArrow topArrow">←</div><button class="journeyNode primary" data-structure-step="project" type="button"><i>3</i><b>شركة المشروع</b><span>تملك الأموال وتثبت حقوق المساهمين</span></button></div><div class="journeyBridge" aria-hidden="true"><span>↓</span></div><div class="journeyRow journeyRowBottom"><button class="journeyNode gold" data-structure-step="contract" type="button"><i>4</i><b>عقد مضاربة</b><span>رأس المال ونسبة الربح والضوابط</span></button><div class="journeyArrow bottomArrow">→</div><button class="journeyNode" data-structure-step="operator" type="button"><i>5</i><b>الشركة المضاربة</b><span>تعمل بالمال في النشاط</span></button><div class="journeyArrow bottomArrow">→</div><button class="journeyNode gold" data-structure-step="profit" type="button"><i>6</i><b>حصة شركة المشروع من الربح</b><span>تثبت في قوائم الشركة</span></button><div class="journeyArrow bottomArrow">→</div><button class="journeyNode" data-structure-step="distribution" type="button"><i>7</i><b>التوزيع على المساهمين</b><span>وفق حقوق الأسهم وقرار التوزيع</span></button></div></div>'''
    s = s[:start] + new_structure + s[end + len('</div>'):]

# 5) Remove horizontal scrolling from the structure and keep Arabic phrases on the site font.
flow_font_css = r'''
/* structure-two-row-font-fix-20260906 */
.structureJourney[data-layout="two-row"]{display:grid!important;gap:8px!important;overflow:visible!important;padding:8px 2px 12px!important;scroll-snap-type:none!important}
.journeyRow{display:grid;align-items:stretch;gap:8px;direction:rtl}
.journeyRowTop{grid-template-columns:minmax(0,1fr) 28px minmax(0,1fr) 28px minmax(0,1fr)}
.journeyRowBottom{grid-template-columns:minmax(0,1fr) 28px minmax(0,1fr) 28px minmax(0,1fr) 28px minmax(0,1fr);direction:ltr}
.journeyRowBottom .journeyNode{direction:rtl}
.structureJourney[data-layout="two-row"] .journeyNode{min-width:0!important;width:100%!important;scroll-snap-align:none!important}
.structureJourney[data-layout="two-row"] .journeyArrow{min-width:0!important;width:28px!important}
.journeyBridge{display:flex;justify-content:flex-end;align-items:center;padding-left:15%;height:28px;color:var(--g);font:900 22px Craft,Tahoma,Arial,sans-serif}
.votingExample strong,.taybaGrid b{font-family:Craft,Tahoma,Arial,sans-serif!important}
@media(max-width:760px){
  .journeyRowTop,.journeyRowBottom{grid-template-columns:1fr!important;direction:rtl!important}
  .journeyRowBottom .journeyNode{direction:rtl}
  .structureJourney[data-layout="two-row"] .journeyArrow{width:auto!important;min-height:22px!important;transform-origin:center}
  .structureJourney[data-layout="two-row"] .topArrow{transform:rotate(-90deg)}
  .structureJourney[data-layout="two-row"] .bottomArrow{transform:rotate(90deg)}
  .journeyBridge{justify-content:center;padding-left:0;height:22px}
}
'''
if '/* structure-two-row-font-fix-20260906 */' not in s:
    s = s.replace('</style>', flow_font_css + '\n</style>', 1)

p.write_text(s, encoding='utf-8')
print('share cards, Riyal symbol, structure flow, and mixed Arabic font handling refined')
