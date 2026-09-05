from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

if 'data-refine-20260905="1"' in s:
    print('already applied')
    raise SystemExit(0)

# 1) Replace strategy comparison with a compact neutral table only.
strategy = '''<section class="sec soft" id="why-sjsc" data-refine-20260905="1"><div class="c"><div class="head"><span class="ey">مقارنة المسارين</span><h2>عقود المضاربة المتعددة وشركة المساهمة المبسطة</h2><p>كل مسار ينظم علاقة المستثمر بطريقة مختلفة. الفارق الأهم يظهر في طبيعة الحق، الحوكمة، وطريقة التكييف عند اتساع عدد المستثمرين.</p></div><div class="panel strategyCompare"><div class="table strategyTable"><table><thead><tr><th>المحور</th><th>عقود مضاربة متعددة</th><th>شركة مساهمة مبسطة</th></tr></thead><tbody><tr><td>صفة صاحب المال</td><td>رب مال في عقد مضاربة</td><td>مساهم في شركة المشروع</td></tr><tr><td>طبيعة الحق</td><td>حق تعاقدي ناشئ عن عقد المضاربة</td><td>ملكية أسهم وحقوق مرتبطة بالفئة</td></tr><tr><td>تجميع الأموال</td><td>عقود مستقلة أو أموال مجمعة بحسب الممارسة الفعلية</td><td>الأموال تدخل رأس مال الشركة مقابل الأسهم</td></tr><tr><td>العلاقة مع المضارب</td><td>كل رب مال يرتبط بالمضارب بحسب عقده</td><td>شركة المشروع تكون رب المال في عقد مضاربة واحد مع الشركة الأخرى</td></tr><tr><td>الحوكمة</td><td>العقد والتفويض والحسابات والتقارير</td><td>نظام أساس وسجل مساهمين وقرارات وقوائم مالية</td></tr><tr><td>دخول طرف جديد</td><td>عقد مضاربة جديد</td><td>إصدار أو نقل أسهم وفق الإجراءات المعتمدة</td></tr><tr><td>الخروج</td><td>تسوية العقد وفق شروطه</td><td>نقل السهم أو الاسترداد وفق نوع السهم وشروطه</td></tr><tr><td>كثرة المستثمرين</td><td>العدد يرفع أهمية ضبط استقلال العقود والحسابات والتقارير</td><td>العدد والقيمة وطريقة الدعوة تحدد مسار إصدار الأسهم وطرحها</td></tr><tr class="riskRow"><td>التكييف لدى هيئة السوق المالية</td><td><b>عقود مستقلة:</b> يبقى التركيز على عقد المضاربة. <br><b>أموال مجمعة + سياسة واحدة + إدارة موحدة + أرباح جماعية:</b> تزداد أهمية فحص وصف البرنامج الاستثماري المشترك.</td><td><b>الأسهم أوراق مالية.</b> إصدارها وطرحها وتسويقها يخضع للمسار النظامي المقرر للأوراق المالية بحسب الحالة.</td></tr></tbody></table></div></div></div></section>'''
start = s.find('<section class="sec soft" id="why-sjsc">')
end = s.find('<section class="sec soft water" id="structure">', start)
if start < 0 or end < 0:
    raise SystemExit('strategy section bounds not found')
s = s[:start] + strategy + s[end:]

# 2) Replace structure diagram with a clearer numbered interactive sequence.
structure = '''<section class="sec soft water" id="structure"><div class="c"><div class="head"><span class="ey">الهيكل المقترح</span><h2>من المساهم إلى المضاربة ثم عودة الربح إلى شركة المشروع</h2><p>المسار يبدأ بدخول الأموال مقابل الأسهم، ثم تستثمر شركة المشروع المال بعقد مضاربة واحد، وتعود حصتها من الربح إلى الشركة قبل التوزيع على المساهمين.</p></div><div class="panel structurePanel"><div class="structureJourney" aria-label="تسلسل الهيكل المقترح"><button class="journeyNode active" data-structure-step="money" type="button"><i>1</i><b>أصحاب الأموال</b><span>مؤسسون وأصحاب عقود قائمة</span></button><div class="journeyArrow">←</div><button class="journeyNode" data-structure-step="subscribe" type="button"><i>2</i><b>الاكتتاب</b><span>تحديد عدد وفئة الأسهم</span></button><div class="journeyArrow">←</div><button class="journeyNode primary" data-structure-step="project" type="button"><i>3</i><b>شركة المشروع</b><span>تملك الأموال وتثبت حقوق المساهمين</span></button><div class="journeyArrow">←</div><button class="journeyNode gold" data-structure-step="contract" type="button"><i>4</i><b>عقد مضاربة</b><span>رأس المال ونسبة الربح والضوابط</span></button><div class="journeyArrow">←</div><button class="journeyNode" data-structure-step="operator" type="button"><i>5</i><b>الشركة المضاربة</b><span>تعمل بالمال في النشاط</span></button><div class="journeyArrow">←</div><button class="journeyNode gold" data-structure-step="profit" type="button"><i>6</i><b>حصة شركة المشروع من الربح</b><span>تثبت في قوائم الشركة</span></button><div class="journeyArrow">←</div><button class="journeyNode" data-structure-step="distribution" type="button"><i>7</i><b>التوزيع على المساهمين</b><span>وفق حقوق الأسهم وقرار التوزيع</span></button></div><div class="structureDetail" id="structureDetail" aria-live="polite"><small>1 · أصحاب الأموال</small><b>يبدأ المسار من أصحاب الحقوق الذين سيدخلون في شركة المشروع.</b><span>يحدد لكل طرف الرصيد الذي سيخصص مقابله أسهم بعد تسوية العلاقة القائمة.</span></div></div></div></section>'''
start = s.find('<section class="sec soft water" id="structure">')
end = s.find('<section class="sec white" id="models">', start)
if start < 0 or end < 0:
    raise SystemExit('structure section bounds not found')
s = s[:start] + structure + s[end:]

# Add distribution step to the existing interactive copy.
s = s.replace("profit:{k:'حصة شركة المشروع من الربح',t:'تعود حصة شركة المشروع من ربح المضاربة إلى قوائمها المالية.',d:'بعد إثبات النتيجة تتخذ الشركة قرار التوزيع على المساهمين وفق حقوق فئات الأسهم.'}", "profit:{k:'6 · حصة شركة المشروع من الربح',t:'تعود حصة شركة المشروع من ربح المضاربة إلى قوائمها المالية.',d:'تثبت نتيجة المضاربة في حسابات شركة المشروع قبل اتخاذ قرار التوزيع.'},\ndistribution:{k:'7 · التوزيع على المساهمين',t:'تقرر شركة المشروع توزيع الربح القابل للتوزيع.',d:'يتحدد نصيب كل مساهم بحسب عدد أسهمه وفئتها وحقوقها وقرار التوزيع.'}")

# 3) Improve the design hook of the transformation table without changing its substance.
s = s.replace('<div class="panel deepCompare"><h3>أثر التحول على صاحب المال</h3>', '<div class="panel deepCompare transformCompare"><div class="transformTitle"><span class="ey">قبل وبعد</span><h3>أثر التحول على صاحب المال</h3></div>')
s = s.replace('<table><thead><tr><th>المحور</th><th>الوضع الحالي</th><th>بعد التحول</th></tr></thead><tbody>', '<table class="transformTable"><thead><tr><th>المحور</th><th><span class="stateTag current">الوضع الحالي</span></th><th><span class="stateTag target">بعد التحول</span></th></tr></thead><tbody>', 1)

# 4) Replace the stock-class example with a concrete voting example.
share_intro = '''<div class="shareIntro"><div class="introDark"><span class="ey">النوع والفئة</span><h3>السهم حصة في الشركة، والفئة تحدد الحقوق التي تحملها هذه الحصة</h3><p><b>نوع السهم</b> يحدد الإطار العام. <b>فئة السهم</b> تضبط التفاصيل داخل النوع نفسه، مثل عدد الأصوات لكل سهم أو أولوية الأرباح أو شروط الاسترداد.</p></div><div class="card quick votingExample"><small>مثال على اختلاف قوة التصويت</small><h3>نفس عدد الأسهم، وقوة تصويت مختلفة</h3><div><b>مساهم أ</b><span>100 سهم عادي · الفئة الأولى · 10 أصوات للسهم = <strong>1,000 صوت</strong></span></div><div><b>مساهم ب</b><span>100 سهم عادي · الفئة الثانية · صوت واحد للسهم = <strong>100 صوت</strong></span></div><p>كلاهما يملك 100 سهم عادي، بينما الفئة الأولى تمنح قوة تصويت أعلى لأن عدد الأصوات المرتبط بكل سهم مختلف.</p></div></div>'''
s, n = re.subn(r'<div class="shareIntro">.*?</div><div class="shareGrid">', share_intro + '<div class="shareGrid">', s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('share intro replacement failed')

# 5) Replace the redeemable-share hypothetical example with a step-by-step scenario.
redeem_scenario = '''<div class="redeemScenario"><small>مثال تطبيقي افتراضي</small><h4>إصدار 10,000 سهم قابل للاسترداد</h4><div class="redeemSteps"><div><i>1</i><b>الإصدار</b><span>تصدر شركة المشروع 10,000 سهم قابل للاسترداد بقيمة 10 ريالات للسهم، بإجمالي 100,000 ريال.</span></div><div><i>2</i><b>شرط الاسترداد</b><span>يكتب في النظام الأساس وقرار الإصدار أن للشركة خيار استرداد هذه الأسهم بعد 3 سنوات بسعر 10 ريالات للسهم.</span></div><div><i>3</i><b>ممارسة الخيار</b><span>بعد مضي 3 سنوات تقرر الشركة ممارسة خيار الاسترداد وفقا للشرط المكتوب.</span></div><div><i>4</i><b>النتيجة</b><span>تدفع الشركة للمساهم 100,000 ريال، وتلغى الأسهم المستردة، وتستكمل إجراءات تخفيض رأس المال المرتبطة بالاسترداد.</span></div></div></div>'''
s, n = re.subn(r'<span>مثال افتراضي: يملك مساهم.*?ثم تلغى الأسهم المستردة وفق الإجراءات النظامية\.</span>', redeem_scenario, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('redeem scenario replacement failed')

# 6) Rewrite share comparison heading and separate footnote markers visually.
s = s.replace('<span class="ey">مقارنة أنواع الأسهم</span><h3>الحكم الرئيسي لكل نوع في جدول واحد</h3><p>التفاصيل الاستثنائية تظهر في الملاحظات أسفل الجدول.</p>', '<span class="ey">مقارنة أنواع الأسهم</span><h3>ماذا يمنح كل نوع من الأسهم؟</h3><p>التصويت والأولوية المالية والاسترداد تختلف بحسب نوع السهم وشروط الإصدار.</p>')
s = s.replace('<sup>1</sup>', '<sup class="fn">1</sup>')
s = s.replace('<sup>2</sup>', '<sup class="fn">2</sup>')

# Remove duplicated statutory cap card.
s, _ = re.subn(r'<div class="limit"><b>قيد نظامي</b>.*?</div>', '', s, count=1, flags=re.S)

# 7) Replace the Arbah Taybah example with documented facts from its current articles of association.
tayba = '''<div class="exampleFrame taybaDoc"><span class="exampleTag">مثال موثق من النظام الأساس</span><h3>شركة أرباح طيبة: ثلاث فئات داخل رأس مال واحد</h3><p>النظام الأساس المعدل بتاريخ 31 مارس 2026 يحدد رأس مال مصرحا به قدره 300,000,000 ريال، ورأس مال مصدر ومدفوع قدره 177,431,180 ريال، موزعا على فئتين من الأسهم العادية وأسهم قابلة للاسترداد.</p><div class="realGrid taybaGrid"><div><small>عادي · الفئة الأولى</small><b>910,636 سهم</b><strong>10 أصوات</strong><span>لكل سهم · القيمة الاسمية 10 ريالات</span></div><div><small>عادي · الفئة الثانية</small><b>8,173,761 سهم</b><strong>1 صوت</strong><span>لكل سهم · القيمة الاسمية 10 ريالات</span></div><div><small>قابل للاسترداد</small><b>8,658,721 سهم</b><strong>0 صوت</strong><span>ولا يملك حامله حق حضور جمعيات المساهمين بحسب المادة 12</span></div></div><div class="taybaDetails"><div><b>المادة 11 · قيود التداول</b><span>تجيز إضافة قيود على تداول الأسهم، ومن صورها تقرير حق طلب استرداد الأسهم للمساهمين.</span></div><div><b>المادة 12 · التصويت</b><span>الفئة الأولى من العادي تحمل 10 أصوات للسهم، والفئة الثانية صوتا واحدا، والأسهم القابلة للاسترداد دون تصويت أو حضور للجمعيات.</span></div><div><b>تفاصيل الاسترداد التنفيذية</b><span>النظام الأساس المتاح يثبت نوع الأسهم وعددها وحقوق التصويت. سعر الاسترداد وموعده ومعادلته تحتاج إلى قرار الإصدار وشروطه الخاصة عند التطبيق.</span></div></div></div>'''
s, n = re.subn(r'<div class="exampleFrame">.*?</div><div class="shareCalc"', tayba + '<div class="shareCalc"', s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Taybah example replacement failed')

# 8) Append visual refinements.
css = r'''
/* refine-20260905 */
.strategyCompare{padding:18px}.strategyTable table{min-width:760px}.strategyTable th{font-size:13px}.strategyTable td{font-size:12px;line-height:1.7}.strategyTable td:first-child{width:185px}.strategyTable .riskRow td{background:#FFF9F0}.strategyBottom{display:none!important}
.structureJourney{display:flex;align-items:stretch;gap:9px;overflow-x:auto;padding:8px 2px 12px;scroll-snap-type:x proximity}.journeyNode{min-width:150px;flex:1;border:1px solid #DED7CE;background:#fff;border-radius:18px;padding:15px 12px;cursor:pointer;text-align:right;scroll-snap-align:center;transition:.18s ease;color:var(--ink)}.journeyNode i{width:28px;height:28px;border-radius:9px;background:#F1ECE5;color:var(--n);display:grid;place-items:center;font:800 11px Arial!important;font-style:normal;margin-bottom:9px}.journeyNode b,.journeyNode span{display:block}.journeyNode b{color:var(--n);font-size:14px}.journeyNode span{color:var(--muted);font-size:10px;margin-top:3px;line-height:1.55}.journeyNode.primary{background:var(--n);border-color:var(--n)}.journeyNode.primary b{color:#fff}.journeyNode.primary span{color:rgba(255,255,255,.72)}.journeyNode.primary i{background:rgba(255,255,255,.14);color:#fff}.journeyNode.gold{background:#FFF6EA;border-color:#E7C39A}.journeyNode.active{box-shadow:0 0 0 3px rgba(201,133,60,.2);border-color:var(--g)}.journeyArrow{display:grid;place-items:center;color:var(--g);font:900 20px Arial!important;min-width:22px}.structureDetail small{font-size:10px}
.transformCompare{overflow:hidden;padding:0!important}.transformTitle{padding:20px 22px 10px}.transformTitle h3{font-size:24px;margin:3px 0}.transformCompare>p{padding:0 22px 15px!important;margin:0!important}.transformCompare .table{border-radius:0;border-left:0;border-right:0;border-bottom:0}.transformTable th:nth-child(2),.transformTable th:nth-child(3){text-align:center}.stateTag{display:inline-flex;padding:5px 10px;border-radius:999px;font-size:10px}.stateTag.current{background:#F2E7D8;color:#8A5A27}.stateTag.target{background:#EAF4EF;color:var(--green)}.transformTable tr:hover td{background:#FBF8F3}.transformTable .final td{background:#EEF5F1}
.votingExample h3{font-size:19px;margin:5px 0 10px}.votingExample div{grid-template-columns:85px 1fr}.votingExample strong{font-family:Arial!important;color:var(--green)}
.redeemScenario{margin-top:13px;padding:16px;border:1px solid #E5D7C5;border-radius:17px;background:#FFFBF5}.redeemScenario>small{color:#8A6640;font-weight:800}.redeemScenario h4{margin:3px 0 11px;color:var(--n);font-size:17px}.redeemSteps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.redeemSteps div{padding:11px;border-radius:13px;background:#fff;border:1px solid #EBE3D9}.redeemSteps i{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:#F2E4D4;color:#8A5A27;font:800 10px Arial!important;font-style:normal}.redeemSteps b,.redeemSteps span{display:block}.redeemSteps b{color:var(--n);font-size:11px;margin-top:5px}.redeemSteps span{color:var(--muted);font-size:9px;line-height:1.65;margin-top:2px}
.fn{display:inline-grid;place-items:center;min-width:17px;height:17px;padding:0 4px;margin-inline-start:5px;border-radius:999px;background:#F2E4D4;color:#8A5A27!important;font:800 9px Arial!important;vertical-align:super;line-height:1}.shareTypeNotes .fn{vertical-align:middle;margin-inline:0 4px}.shareTypeCompareHead h3{font-size:24px}.shareTypeCompareHead p{font-size:12px}
.taybaDoc p{max-width:930px}.taybaGrid div{background:#fff}.taybaGrid b{font-family:Arial!important;font-size:16px}.taybaGrid strong{font-size:25px}.taybaDetails{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px}.taybaDetails div{padding:13px;border-radius:15px;background:#F8F4EE}.taybaDetails b,.taybaDetails span{display:block}.taybaDetails b{color:var(--n);font-size:11px}.taybaDetails span{color:var(--muted);font-size:10px;margin-top:3px;line-height:1.7}
@media(max-width:980px){.journeyNode{min-width:145px}.redeemSteps,.taybaDetails{grid-template-columns:1fr 1fr}}
@media(max-width:620px){.strategyTable table{min-width:700px}.journeyArrow{min-width:18px}.redeemSteps,.taybaDetails{grid-template-columns:1fr}.votingExample div{grid-template-columns:1fr}.transformTitle h3{font-size:21px}}
'''
s = s.replace('</style><script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js">', css + '</style><script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js">', 1)

p.write_text(s, encoding='utf-8')
print('refine-20260905 applied')
