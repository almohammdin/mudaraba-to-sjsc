from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

if 'data-main-v2="1"' in s:
    print('main v2 already applied')
    raise SystemExit(0)

# 1) Reading progress + quick view control.
s = s.replace(
    '<nav class="nav"><div class="c navin">',
    '<nav class="nav" data-main-v2="1"><div class="readProgress" aria-hidden="true"><i id="readProgressBar"></i></div><div class="c navin">',
    1,
)
nav_pat = re.compile(r'(<div class="links">.*?</div>)(</div></nav>)', re.S)
m = nav_pat.search(s)
if not m:
    raise SystemExit('navigation marker not found')
s = s[:m.start()] + m.group(1) + '<button class="quickViewBtn" id="quickViewBtn" type="button" aria-pressed="false">عرض سريع · 3 دقائق</button>' + m.group(2) + s[m.end():]

# 2) Interactive structure diagram.
structure = '''<section class="sec soft water" id="structure"><div class="c"><div class="head"><span class="ey">الهيكل المقترح</span><h2>المساهم يتعامل مع شركة المشروع، وشركة المشروع تتعامل مع المشغل</h2><p>اضغط على أي عقدة في الرسم لقراءة وظيفتها داخل الهيكل.</p></div><div class="panel structurePanel"><div class="structureCanvas" aria-label="مخطط الهيكل المقترح"><svg class="structureSvg" viewBox="0 0 1000 560" role="group" aria-labelledby="structureTitle"><title id="structureTitle">مسار الملكية والتشغيل والأرباح</title><defs><marker id="arrowGold" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#C9853C"/></marker></defs><path class="flowLine" d="M835 105 H660"/><path class="flowLine" d="M565 105 H390"/><path class="flowLine" d="M295 105 H120 V280 H295"/><path class="flowLine" d="M390 280 H565"/><path class="flowLine" d="M660 280 H835 V455 H660"/><g class="svgNode active" tabindex="0" role="button" aria-label="أصحاب الأموال" data-structure-step="money" transform="translate(790,55)"><rect width="180" height="100" rx="20"/><foreignObject width="180" height="100"><div class="svgNodeText"><b>أصحاب الأموال</b><span>مؤسسون وأصحاب عقود قائمة</span></div></foreignObject></g><g class="svgNode gold" tabindex="0" role="button" aria-label="الاكتتاب في الأسهم" data-structure-step="subscribe" transform="translate(520,55)"><rect width="180" height="100" rx="20"/><foreignObject width="180" height="100"><div class="svgNodeText"><b>الاكتتاب في الأسهم</b><span>تحديد الفئة والعدد والحقوق</span></div></foreignObject></g><g class="svgNode primary" tabindex="0" role="button" aria-label="شركة المشروع" data-structure-step="project" transform="translate(250,55)"><rect width="180" height="100" rx="20"/><foreignObject width="180" height="100"><div class="svgNodeText"><b>شركة المشروع</b><span>الملكية والقرار والقوائم</span></div></foreignObject></g><g class="svgNode" tabindex="0" role="button" aria-label="العقد مع المشغل" data-structure-step="contract" transform="translate(250,230)"><rect width="180" height="100" rx="20"/><foreignObject width="180" height="100"><div class="svgNodeText"><b>العقد مع المشغل</b><span>نطاق وصلاحيات وتقارير ومقابل</span></div></foreignObject></g><g class="svgNode" tabindex="0" role="button" aria-label="الشركة المشغلة" data-structure-step="operator" transform="translate(520,230)"><rect width="180" height="100" rx="20"/><foreignObject width="180" height="100"><div class="svgNodeText"><b>الشركة المشغلة</b><span>تنفذ النشاط وفق العقد</span></div></foreignObject></g><g class="svgNode gold" tabindex="0" role="button" aria-label="الأرباح والتوزيع" data-structure-step="profit" transform="translate(520,405)"><rect width="180" height="100" rx="20"/><foreignObject width="180" height="100"><div class="svgNodeText"><b>الأرباح والتوزيع</b><span>تعود للشركة ثم توزع</span></div></foreignObject></g></svg></div><div class="structureDetail" id="structureDetail" aria-live="polite"><small>أصحاب الأموال</small><b>تبدأ العلاقة من أصحاب الحقوق الذين سيدخلون في شركة المشروع.</b><span>يحدد لكل طرف رصيده الذي سيخصص مقابله أسهم بعد تسوية العلاقة القائمة وفق المستندات والقرارات المعتمدة.</span></div></div></div></section>'''
s, n = re.subn(r'<section class="sec soft water" id="structure">.*?</section>(?=<section class="sec white" id="models">)', structure, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('structure section replacement failed')

# 3) Operating-model toggle with one redrawable diagram.
models = '''<section class="sec white" id="models"><div class="c"><div class="head"><span class="ey">العلاقة مع الشركة المشغلة</span><h2>اختيار العقد يحدد موقع الأصول ومصدر الربح</h2><p>بدّل بين النموذجين، وسيظهر موقع المال ودور المشغل ومصدر دخل كل طرف.</p></div><div class="modelSwitcher"><div class="modelToggle" role="group" aria-label="اختيار نموذج العلاقة مع المشغل"><button type="button" class="modelToggleBtn active" data-model="management" aria-pressed="true">إدارة وتشغيل</button><button type="button" class="modelToggleBtn" data-model="mudaraba" aria-pressed="false">مضاربة مؤسسية</button></div><div class="card modelStage"><div class="modelStageHead"><div><span class="badge" id="modelBadge">الأصول داخل شركة المشروع</span><h3 id="modelTitle">الإدارة والتشغيل</h3><p id="modelIntro">شركة المشروع تملك الأموال والأصول، والمشغل ينفذ النشاط بموجب عقد إدارة وتشغيل.</p></div></div><div class="modelViz" id="modelViz" aria-live="polite"></div><div class="modelFacts"><div><small>ملكية الأموال والأصول</small><b id="modelAssets">شركة المشروع</b></div><div><small>مقابل المشغل</small><b id="modelOperatorIncome">أجر إدارة وحافز أداء</b></div><div><small>مصدر ربح شركة المشروع</small><b id="modelProjectProfit">نتيجة النشاط بعد التكاليف</b></div></div></div></div><div class="panel deepCompare"><h3>أثر التحول على صاحب المال</h3><p style="color:var(--muted);margin-top:0">الجدول يقارن حق المستثمر الحالي بملكيته وإدارته وتقاريره بعد التحول.</p><div class="table"><table><thead><tr><th>المحور</th><th>عقود مضاربة متعددة</th><th>شركة مساهمة مبسطة</th></tr></thead><tbody><tr><td>العلاقة مع المستثمر</td><td>عقد مستقل بين المضارب وكل مستثمر</td><td>المستثمر يدخل كمساهم في كيان واحد</td></tr><tr><td>ملكية الاستثمار</td><td>حقوق تعاقدية ناشئة عن عقد المضاربة</td><td>ملكية أسهم في الشركة</td></tr><tr><td>تجميع رأس المال</td><td>مجموعة عقود منفصلة</td><td>رأس مال مجمع داخل الشركة</td></tr><tr><td>إدارة الأموال</td><td>متابعة كل عقد والتزاماته بشكل مستقل</td><td>إدارة مركزية تحت كيان وحسابات الشركة</td></tr><tr><td>دخول طرف جديد</td><td>إعداد عقد جديد وإدارة علاقة جديدة</td><td>إصدار أو نقل أسهم وفق النظام الأساس والقرارات</td></tr><tr><td>الخروج</td><td>إنهاء العقد وتسوية الحقوق</td><td>بيع أو استرداد الأسهم بحسب الهيكلة المعتمدة</td></tr><tr><td>استمرارية النشاط</td><td>مرتبطة بمدة كل عقد</td><td>الشركة تستمر مع دخول وخروج المساهمين</td></tr><tr><td>توزيع الأرباح</td><td>بحسب شروط كل عقد مضاربة</td><td>بحسب الحقوق المرتبطة بالأسهم وقرار التوزيع</td></tr><tr><td>إثبات الحصة</td><td>العقد والمستندات المالية</td><td>سجل المساهمين وعدد وفئة الأسهم</td></tr><tr><td>الحوكمة والتقارير</td><td>تدار عبر العقود وعلاقة المضارب بكل طرف</td><td>نظام أساس وقرارات وقوائم مالية على مستوى الكيان</td></tr><tr class="final"><td>الصورة النهائية</td><td>مستثمر ← عقد ← مضارب</td><td>مساهمون ← شركة مشروع ← عقد واحد مع المشغل ← أرباح</td></tr></tbody></table></div></div></div></section>'''
s, n = re.subn(r'<section class="sec white" id="models">.*?</section>(?=<section class="sec soft" id="shares">)', models, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('models section replacement failed')

# 4) Share-calculator presets and live Article 51 warning.
share_presets = '''<div class="sharePresetRow"><button class="sharePreset active" data-share-preset="proposal">تصور 15 مليون</button><button class="sharePreset" data-share-preset="basic">مؤسسون + مستثمرون</button><button class="sharePreset" data-share-preset="weighted">تصويت مرجح</button><button class="sharePreset" data-share-preset="preferredMix">فئة ممتازة</button><button class="sharePreset" data-share-preset="tayba">مثال أرباح طيبة</button></div><div id="shareClasses">'''
s, n = re.subn(r'<div class="sharePresetRow">.*?</div><div id="shareClasses">', share_presets, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('share preset row replacement failed')

s, n = re.subn(
    r'(<div class="shareSummary"><b id="shareSummaryTitle">.*?</div>)(<table class="shareResultsTable">)',
    r'\1<div class="shareCapWarning" id="shareCapWarning" role="status" aria-live="polite"></div>\2',
    s,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit('share warning insertion failed')

# 5) Side-by-side scenario comparison.
scenario_compare = '''<div class="scenarioCompare" aria-label="مقارنة السيناريوهات"><div class="scenarioCompareHead"><span class="ey">مقارنة مباشرة</span><h3>الثلاثة في جدول واحد</h3></div><div class="table scenarioTable"><table><thead><tr><th>المؤشر</th><th data-scenario-col="conservative">تحفظ</th><th data-scenario-col="base" class="active">المقترح</th><th data-scenario-col="growth">توسع</th></tr></thead><tbody><tr><td>رأس المال</td><td>12,000,000</td><td>15,000,000</td><td>25,000,000</td></tr><tr><td>عائد النشاط</td><td>17%</td><td>20%</td><td>22%</td></tr><tr><td>المصروفات السنوية</td><td>439,000</td><td>439,000</td><td>575,000</td></tr><tr><td>المصروفات من رأس المال</td><td>3.66%</td><td>2.93%</td><td>2.30%</td></tr><tr><td>الربح بعد المصروفات</td><td>1,601,000</td><td>2,561,000</td><td>4,925,000</td></tr><tr><td>العائد بعد المصروفات</td><td>13.34%</td><td>17.07%</td><td>19.70%</td></tr></tbody></table></div><div class="scenarioCompareActions"><button type="button" data-compare-scenario="conservative">استخدم التحفظ</button><button type="button" data-compare-scenario="base" class="active">استخدم المقترح</button><button type="button" data-compare-scenario="growth">استخدم التوسع</button></div></div>'''
s, n = re.subn(r'(<div class="scenarioDeck".*?</div>)(<div class="calcModeLine">)', r'\1' + scenario_compare + r'\2', s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('scenario comparison insertion failed')

# 6) Sensitivity slider linked to the main return input.
sens = '''<div class="card sensitivityControl"><div><span class="ey">اختبار الحساسية</span><h3>حرّك عائد النشاط وشاهد النتيجة في الرسم والحاسبة</h3><p>المنزلق مرتبط بعائد النشاط نفسه، لذلك تتغير الأرباح والعائد الصافي وجميع الرسوم في اللحظة نفسها.</p></div><div class="sensitivityInput"><input id="sensR" type="range" min="10" max="30" step="0.5" value="20" aria-label="عائد النشاط لاختبار الحساسية"><output id="sensLabel">20%</output></div></div>'''
needle = '<div class="card costBreak">'
if needle not in s:
    raise SystemExit('cost breakdown marker not found')
s = s.replace(needle, sens + needle, 1)

# 7) One-page PDF export button.
pdf_button = '''<button class="exportBtn summaryPdfBtn" id="exportSummary" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 12h6M9 16h6"/></svg>تصدير ملخص PDF</button>'''
s, n = re.subn(r'(<div class="exportActions"><button class="exportBtn" id="exportCalc".*?</button>)(</div>)', r'\1' + pdf_button + r'\2', s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('PDF export button insertion failed')

# jsPDF dependency for the one-page summary.
html2 = '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>'
if html2 not in s:
    raise SystemExit('html2canvas script marker not found')
s = s.replace(html2, html2 + '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>', 1)

# V2 styles: native SVG, accessibility, comparison, quick view and PDF sheet.
v2_css = r'''
/* main-v2 */
.readProgress{position:absolute;top:0;right:0;left:0;height:3px;background:rgba(13,54,86,.06);overflow:hidden}.readProgress i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--g),var(--green));transform-origin:right center}.nav{position:sticky}.links a.active{background:#EDF3F6;color:var(--n);box-shadow:inset 0 -2px 0 var(--g)}.quickViewBtn{border:1px solid #DDD5CB;background:#fff;color:var(--n);border-radius:11px;padding:7px 10px;font-weight:800;white-space:nowrap;cursor:pointer}.quickViewBtn[aria-pressed="true"]{background:var(--n);color:#fff;border-color:var(--n)}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,[tabindex]:focus-visible{outline:3px solid rgba(201,133,60,.42);outline-offset:3px}
.structurePanel{padding:22px}.structureCanvas{overflow:auto;padding:4px}.structureSvg{width:100%;min-width:780px;height:auto;display:block}.flowLine{fill:none;stroke:#C9853C;stroke-width:4;stroke-linecap:round;marker-end:url(#arrowGold)}.svgNode{cursor:pointer}.svgNode rect{fill:#fff;stroke:#DED7CE;stroke-width:2;filter:drop-shadow(0 8px 16px rgba(13,54,86,.07));transition:.18s ease}.svgNode.gold rect{fill:#FFF6EA;stroke:#E2B57F}.svgNode.primary rect{fill:#0D3656;stroke:#0D3656}.svgNode.active rect,.svgNode:focus rect{stroke:#C9853C;stroke-width:4}.svgNodeText{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10px;direction:rtl;color:#0D3656}.svgNodeText b{font-size:16px}.svgNodeText span{font-size:10px;color:#65727D;margin-top:4px}.svgNode.primary .svgNodeText{color:#fff}.svgNode.primary .svgNodeText span{color:rgba(255,255,255,.72)}.structureDetail{margin-top:16px;border-radius:18px;padding:16px 18px;background:#F8F4EE;border:1px solid #E6DED4}.structureDetail small,.structureDetail b,.structureDetail span{display:block}.structureDetail small{color:#8A6640;font-weight:800}.structureDetail b{color:var(--n);font-size:17px;margin-top:2px}.structureDetail span{color:var(--muted);font-size:12px;margin-top:3px}
.modelSwitcher{display:grid;gap:12px}.modelToggle{display:inline-flex;justify-self:start;padding:4px;background:#EEE8E0;border-radius:14px}.modelToggleBtn{border:0;background:transparent;color:#52616B;padding:9px 16px;border-radius:10px;font-weight:900;cursor:pointer}.modelToggleBtn.active{background:#fff;color:var(--n);box-shadow:0 4px 14px rgba(13,54,86,.08)}.modelStage{padding:25px}.modelStageHead h3{font-size:27px;margin:7px 0 3px}.modelStageHead p{margin:0;color:var(--muted)}.modelViz{display:grid;grid-template-columns:1fr 54px 1fr 54px 1fr 54px 1fr;align-items:stretch;margin:20px 0}.modelNode{padding:15px;border:1px solid var(--line);border-radius:17px;background:#FBFAF7;text-align:center;display:flex;flex-direction:column;justify-content:center;min-height:100px}.modelNode.primary{background:var(--n);color:#fff;border-color:var(--n)}.modelNode.gold{background:#FFF6EA;border-color:#E8C69E}.modelNode b,.modelNode span{display:block}.modelNode b{color:inherit}.modelNode span{color:var(--muted);font-size:10px;margin-top:3px}.modelNode.primary span{color:rgba(255,255,255,.72)}.modelArrow{display:grid;place-items:center;color:var(--g);font:900 23px Arial!important}.modelFacts{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.modelFacts div{padding:13px;border-radius:14px;background:#F8F4EE}.modelFacts small,.modelFacts b{display:block}.modelFacts small{font-size:9px;color:var(--muted)}.modelFacts b{color:var(--n);font-size:12px;margin-top:2px}.deepCompare{margin-top:16px}
.sharePresetRow{display:flex;flex-wrap:wrap}.shareCapWarning{margin:12px 0 14px;padding:12px 14px;border-radius:14px;background:#EEF6F1;border:1px solid rgba(22,90,61,.17);color:#315544;font-size:11px}.shareCapWarning.warn{background:#FFF8EF;border-color:#E6C8A5;color:#7B562D}.shareCapWarning.danger{background:#F8EEEE;border-color:#DFB8B2;color:#7E3F37}.shareCapWarning b{color:inherit}
.scenarioCompare{margin:16px 0 12px;padding:18px;border:1px solid var(--line);background:#fff;border-radius:22px}.scenarioCompareHead h3{margin:2px 0 10px;color:var(--n)}.scenarioTable table{min-width:680px}.scenarioTable th.active{background:#EAF4EF;color:var(--green)}.scenarioCompareActions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.scenarioCompareActions button{border:1px solid #DDD5CB;background:#fff;color:var(--n);border-radius:10px;padding:7px 10px;font-weight:800;cursor:pointer}.scenarioCompareActions button.active{background:var(--n);color:#fff;border-color:var(--n)}
.sensitivityControl{padding:18px 20px;display:grid;grid-template-columns:1fr 230px;gap:18px;align-items:center}.sensitivityControl h3{margin:2px 0 3px}.sensitivityControl p{margin:0;color:var(--muted);font-size:11px}.sensitivityInput{display:flex;align-items:center;gap:10px}.sensitivityInput input{width:100%}.sensitivityInput output{min-width:54px;font:800 15px Arial!important;color:var(--green);direction:ltr}.summaryPdfBtn{background:#FFF8EF!important;border-color:#E6C8A5!important;color:#80582D!important}
.pdfSheet{width:794px;height:1123px;background:#FFFEFC;color:#18232D;padding:42px;direction:rtl;overflow:hidden;position:fixed;left:-12000px;top:0;z-index:-1}.pdfTop{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #C9853C;padding-bottom:16px}.pdfTop .id{display:flex;align-items:center;gap:12px}.pdfTop img{width:48px;height:48px}.pdfTop h1{font-size:25px;color:#0D3656;margin:0;line-height:1.25}.pdfTop p{margin:2px 0 0;color:#65727D;font-size:11px}.pdfTag{padding:6px 10px;border-radius:999px;background:#F2E7D8;color:#8A5A27;font-size:10px;font-weight:800}.pdfGrid2{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-top:16px}.pdfBox{border:1px solid #E3DED6;border-radius:17px;padding:14px}.pdfBox h2{font-size:15px;color:#0D3656;margin:0 0 8px}.pdfFlow{display:grid;grid-template-columns:1fr 24px 1fr 24px 1fr;align-items:center}.pdfFlow span{padding:10px;border-radius:12px;background:#F8F4EE;text-align:center;font-size:10px;font-weight:800;color:#0D3656}.pdfFlow i{text-align:center;color:#C9853C;font:900 16px Arial;font-style:normal}.pdfKpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.pdfKpis div{background:#F8F4EE;border-radius:12px;padding:10px}.pdfKpis small,.pdfKpis b{display:block}.pdfKpis small{font-size:8px;color:#65727D}.pdfKpis b{font:800 14px Arial!important;color:#0D3656;margin-top:2px}.pdfShares{width:100%;border-collapse:collapse;font-size:9px}.pdfShares th,.pdfShares td{padding:7px;border-bottom:1px solid #EAE3DA;text-align:right}.pdfShares th{color:#0D3656;background:#F8F4EE}.pdfNote{margin-top:12px;padding:10px 12px;border-radius:12px;background:#FFF8EF;color:#715739;font-size:9px}.pdfFoot{position:absolute;right:42px;left:42px;bottom:32px;border-top:1px solid #E3DED6;padding-top:9px;display:flex;justify-content:space-between;color:#65727D;font-size:8px}
body.quickMode .deepCompare,body.quickMode .redeemExplain,body.quickMode .exampleFrame,body.quickMode .shareCalc,body.quickMode .scenarioCompare,body.quickMode #calculator .controls,body.quickMode #calculator .costBreak,body.quickMode #sources{display:none!important}body.quickMode #calculator .calc{grid-template-columns:1fr}body.quickMode #calculator .results{max-width:900px;margin:auto}
@media(max-width:980px){.navin{align-items:flex-start;padding:10px 0}.links{overflow:auto;max-width:100%;padding-bottom:3px}.quickViewBtn{display:none}.modelViz{grid-template-columns:1fr}.modelArrow{height:36px;transform:rotate(-90deg)}.modelFacts{grid-template-columns:1fr}.sensitivityControl{grid-template-columns:1fr}.structureSvg{min-width:720px}}
@media(max-width:620px){.modelToggle{width:100%}.modelToggleBtn{flex:1}.scenarioCompareActions button{flex:1}.sensitivityInput{width:100%}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}*,*:before,*:after{animation:none!important;transition:none!important}}
'''
s = s.replace('</style>', v2_css + '</style>', 1)

# V2 behavior is injected before the existing initial calculator calls so wrappers are active on first render.
v2_js = r'''
// main-v2 behavior
const structureCopy={
money:{k:'أصحاب الأموال',t:'تبدأ العلاقة من أصحاب الحقوق الذين سيدخلون في شركة المشروع.',d:'يحدد لكل طرف رصيده الذي سيخصص مقابله أسهم بعد تسوية العلاقة القائمة وفق المستندات والقرارات المعتمدة.'},
subscribe:{k:'الاكتتاب في الأسهم',t:'تتحول القيمة المحددة إلى عدد من الأسهم داخل الشركة.',d:'يحدد النوع والفئة وقيمة السهم وعدد الأسهم، وتثبت الحقوق المرتبطة بكل فئة في النظام الأساس وقرارات الإصدار.'},
project:{k:'شركة المشروع',t:'هذا الكيان يحمل الملكية والقرار والقوائم المالية.',d:'تسجل الأسهم باسم المساهمين، وتظهر الأموال والنتائج على مستوى الشركة، ثم تتخذ قرارات التوزيع وفق الحقوق النظامية.'},
contract:{k:'العقد مع المشغل',t:'عقد واحد يضبط العلاقة التشغيلية بدلا من تعدد العلاقات مع المستثمرين.',d:'يحدد نطاق العمل والصلاحيات والتقارير ومؤشرات الأداء والمقابل المستحق للمشغل.'},
operator:{k:'الشركة المشغلة',t:'المشغل ينفذ النشاط بخبرته وعلاقاته وفق النموذج المختار.',d:'في نموذج الإدارة والتشغيل تكون الملكية داخل شركة المشروع. وفي المضاربة المؤسسية تكون الشركة المشغلة مضاربا بعقد واحد مع شركة المشروع.'},
profit:{k:'الأرباح والتوزيع',t:'تعود نتيجة النشاط إلى شركة المشروع ثم يقرر توزيع الربح القابل للتوزيع.',d:'نصيب كل مساهم يتبع الحقوق المرتبطة بفئة أسهمه وقرار التوزيع والقوائم المالية الفعلية.'}
};
function activateStructure(key){let x=structureCopy[key];if(!x)return;document.querySelectorAll('[data-structure-step]').forEach(n=>n.classList.toggle('active',n.dataset.structureStep===key));$('structureDetail').innerHTML=`<small>${x.k}</small><b>${x.t}</b><span>${x.d}</span>`}
document.querySelectorAll('[data-structure-step]').forEach(n=>{n.addEventListener('click',()=>activateStructure(n.dataset.structureStep));n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activateStructure(n.dataset.structureStep)}})});

let v2Model='management';
const modelViews={
management:{badge:'الأصول داخل شركة المشروع',title:'الإدارة والتشغيل',intro:'شركة المشروع تملك الأموال والأصول، والمشغل ينفذ النشاط بموجب عقد إدارة وتشغيل.',assets:'شركة المشروع',operator:'أجر إدارة وحافز أداء',profit:'نتيجة النشاط بعد التكاليف',nodes:[['شركة المشروع','تملك المال والأصول','primary'],['عقد إدارة وتشغيل','صلاحيات وتقارير ومقابل','gold'],['الشركة المشغلة','تنفذ النشاط',''],['النتيجة','تعود إلى شركة المشروع','']]},
mudaraba:{badge:'عقد مضاربة واحد بين الكيانين',title:'المضاربة المؤسسية',intro:'شركة المشروع تكون رب المال، والشركة المشغلة تكون المضارب وتعمل بالمال وفق عقد المضاربة.',assets:'شركة المشروع بصفتها رب المال',operator:'حصة المضارب من الربح وفق العقد',profit:'نصيب رب المال من ربح المضاربة',nodes:[['شركة المشروع','رب المال','primary'],['عقد مضاربة','جزء شائع من الربح','gold'],['الشركة المشغلة','المضارب',''],['النتيجة','تقسم وفق نسبة الربح','']]}
};
function setModel(key){let v=modelViews[key];if(!v)return;v2Model=key;$('modelBadge').textContent=v.badge;$('modelTitle').textContent=v.title;$('modelIntro').textContent=v.intro;$('modelAssets').textContent=v.assets;$('modelOperatorIncome').textContent=v.operator;$('modelProjectProfit').textContent=v.profit;$('modelViz').innerHTML=v.nodes.map((n,i)=>`${i?'<div class="modelArrow">←</div>':''}<div class="modelNode ${n[2]}"><b>${n[0]}</b><span>${n[1]}</span></div>`).join('');document.querySelectorAll('[data-model]').forEach(b=>{let on=b.dataset.model===key;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')})}
document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>setModel(b.dataset.model)));setModel('management');

// Additional share presets requested for learning by example.
sharePresets.basic=[
{name:'المؤسسون',type:'ordinary',capital:3000000,value:10,votes:1},
{name:'المستثمرون',type:'ordinary',capital:12000000,value:10,votes:1},
{name:'فئة إضافية',type:'ordinary',capital:0,value:10,votes:1}
];
sharePresets.weighted=[
{name:'المؤسسون',type:'ordinary',capital:1500000,value:10,votes:10},
{name:'المستثمرون',type:'ordinary',capital:13500000,value:10,votes:1},
{name:'فئة إضافية',type:'ordinary',capital:0,value:10,votes:1}
];
sharePresets.preferredMix=[
{name:'المؤسسون',type:'ordinary',capital:3000000,value:10,votes:10},
{name:'المستثمرون العاديون',type:'ordinary',capital:4500000,value:10,votes:1},
{name:'الأسهم الممتازة',type:'preferred',capital:7500000,value:10,votes:0}
];
const sharePresetLabels={proposal:'تصور 15 مليون',basic:'مؤسسون + مستثمرون',weighted:'تصويت مرجح',preferredMix:'فئة ممتازة',tayba:'مثال أرباح طيبة'};
applySharePreset=function(key){if(!sharePresets[key])return;shareMode=key;renderShareClasses(sharePresets[key]);document.querySelectorAll('[data-share-preset]').forEach(b=>b.classList.toggle('active',b.dataset.sharePreset===key));$('shareMode').textContent=sharePresetLabels[key]||'تعديل يدوي'};

const v2ShareUpdate=shareUpdate;
shareUpdate=function(){v2ShareUpdate();let d=shareData(),special=d.rows.filter(r=>r.type==='preferred'||r.type==='redeemable').reduce((z,r)=>z+r.capital,0),ratio=d.totalCapital?100*special/d.totalCapital:0,w=$('shareCapWarning');if(!w)return;w.className='shareCapWarning';if(ratio>50){w.classList.add('danger');w.innerHTML=`<b>تجاوز سقف المادة 51: ${pct(ratio)}</b> من رأس المال في أسهم ممتازة أو قابلة للاسترداد. عدّل الفئات حتى تصبح النسبة 50% أو أقل قبل اعتماد التصور.`}else if(ratio>=49.999){w.classList.add('warn');w.innerHTML=`<b>عند الحد الأعلى: ${pct(ratio)}</b> من رأس المال. المادة 51 تضع الحد المجمع للأسهم الممتازة والقابلة للاسترداد وفئاتها عند 50%.`}else{w.innerHTML=`الأسهم الممتازة والقابلة للاسترداد تمثل <b>${pct(ratio)}</b> من رأس المال. الحد المجمع في المادة 51 هو 50%.`}};

// Scenario table controls and linked sensitivity slider.
document.querySelectorAll('[data-compare-scenario]').forEach(b=>b.addEventListener('click',()=>applyScenario(b.dataset.compareScenario)));
const v2CalcUpdate=calcUpdate;
calcUpdate=function(){v2CalcUpdate();let v=vals(),sr=$('sensR');if(sr&&document.activeElement!==sr)sr.value=Math.max(10,Math.min(30,v.r));if($('sensLabel'))$('sensLabel').textContent=pct(v.r);document.querySelectorAll('[data-scenario-col]').forEach(x=>x.classList.toggle('active',x.dataset.scenarioCol===calcMode));document.querySelectorAll('[data-compare-scenario]').forEach(x=>x.classList.toggle('active',x.dataset.compareScenario===calcMode))};
if($('sensR'))$('sensR').addEventListener('input',e=>{let r=num(e.target.value);$('retR').value=r;$('retN').value=String(r);$('retLabel').textContent=r+'%';markManual();calcUpdate()});

// Reading progress and active section in the sticky navigation.
const navLinks=[...document.querySelectorAll('.links a[href^="#"]')];
function updateReading(){let h=document.documentElement,den=Math.max(1,h.scrollHeight-innerHeight),progress=Math.max(0,Math.min(1,scrollY/den));$('readProgressBar').style.width=(progress*100)+'%';let marker=scrollY+120,current='';navLinks.forEach(a=>{let el=document.querySelector(a.getAttribute('href'));if(el&&el.offsetTop<=marker)current=a.getAttribute('href').slice(1)});navLinks.forEach(a=>{let on=a.getAttribute('href')==='#'+current;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
addEventListener('scroll',updateReading,{passive:true});addEventListener('resize',updateReading,{passive:true});updateReading();

// Quick 3-minute view: keep the main logic, diagrams and results; hide deep detail.
if($('quickViewBtn'))$('quickViewBtn').addEventListener('click',()=>{let on=!document.body.classList.contains('quickMode');document.body.classList.toggle('quickMode',on);$('quickViewBtn').setAttribute('aria-pressed',on?'true':'false');$('quickViewBtn').textContent=on?'عرض كامل':'عرض سريع · 3 دقائق';scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});

function escHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function summarySheet(){let v=vals(),d=shareData(),model=modelViews[v2Model],special=d.rows.filter(r=>r.type==='preferred'||r.type==='redeemable').reduce((z,r)=>z+r.capital,0),specialRatio=d.totalCapital?100*special/d.totalCapital:0,rows=d.rows.map(r=>`<tr><td>${escHtml(r.name)}</td><td>${typeLabels[r.type]}</td><td>${pct(r.ownership)}</td><td>${pct(r.voteShare)}</td></tr>`).join('');let sheet=document.createElement('div');sheet.className='pdfSheet';sheet.innerHTML=`<div class="pdfTop"><div class="id"><img src="assets/site-icon.svg" alt=""><div><h1>من المضاربة إلى المساهمة المبسطة</h1><p>ملخص الهيكل ونتيجة الحاسبتين</p></div></div><span class="pdfTag">${escHtml($('calcMode').textContent)}</span></div><div class="pdfGrid2"><div class="pdfBox"><h2>الهيكل</h2><div class="pdfFlow"><span>المساهمون</span><i>←</i><span>شركة المشروع</span><i>←</i><span>المشغل</span></div><div class="pdfNote">شركة المشروع تجمع الملكية في كيان واحد، وتربط التشغيل بعقد واحد مع الجهة المشغلة.</div></div><div class="pdfBox"><h2>النموذج المختار</h2><div class="pdfTag" style="display:inline-block">${model.title}</div><p style="font-size:10px;color:#65727D;margin:9px 0 0">${model.intro}</p><div class="pdfNote">ملكية الأموال: ${model.assets}<br>مقابل المشغل: ${model.operator}</div></div></div><div class="pdfBox" style="margin-top:13px"><h2>رأس المال والعائد</h2><div class="pdfKpis"><div><small>رأس المال</small><b>${fmt(v.c)}</b></div><div><small>المصروفات</small><b>${fmt(v.cost)}</b></div><div><small>الربح بعد المصروفات</small><b>${fmt(v.net)}</b></div><div><small>العائد الصافي</small><b>${pct(v.nr)}</b></div></div></div><div class="pdfBox" style="margin-top:13px"><h2>الأسهم والقدرة التصويتية</h2><table class="pdfShares"><thead><tr><th>الفئة</th><th>النوع</th><th>الملكية</th><th>قوة التصويت</th></tr></thead><tbody>${rows}</tbody></table><div class="pdfNote">الأسهم الممتازة والقابلة للاسترداد: ${pct(specialRatio)} من رأس المال. حد المادة 51 المجمع: 50%.</div></div><div class="pdfBox" style="margin-top:13px"><h2>مسار الانتقال</h2><div class="pdfFlow"><span>تحديد الرصيد</span><i>←</i><span>تسوية العقد</span><i>←</i><span>تسجيل الأسهم</span></div></div><div class="pdfFoot"><span>إعداد: نايف المحمدي · مستشار الحوكمة وتطوير الأعمال</span><span>${new Intl.DateTimeFormat('en-GB').format(new Date())}</span></div>`;return sheet}
async function exportSummaryPdf(){let btn=$('exportSummary');if(!btn||typeof html2canvas==='undefined'||!window.jspdf)return;let old=btn.innerHTML;btn.disabled=true;btn.textContent='جاري تجهيز PDF';let sheet=summarySheet();document.body.appendChild(sheet);try{await document.fonts.ready;let canvas=await html2canvas(sheet,{backgroundColor:'#FFFEFC',scale:2,useCORS:true,logging:false,width:794,height:1123,windowWidth:900});let pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,210,297,undefined,'FAST');pdf.save('mudaraba-to-sjsc-summary.pdf')}finally{sheet.remove();btn.disabled=false;btn.innerHTML=old}}
if($('exportSummary'))$('exportSummary').addEventListener('click',exportSummaryPdf);
'''
init_marker = "applyScenario('base');applySharePreset('proposal')})();"
if init_marker not in s:
    raise SystemExit('initialization marker not found')
s = s.replace(init_marker, v2_js + "\n" + init_marker, 1)

p.write_text(s, encoding='utf-8')
print('main V2 interactive UX applied')
