from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

if 'data-main-v2="1"' not in s:
    raise SystemExit('V2 marker not found')

# Make both calculators discoverable from the sticky navigation.
s = s.replace('<a href="#shares">الأسهم</a><a href="#transition">الانتقال</a><a href="#calculator">الحاسبة</a>', '<a href="#shares">الأسهم</a><a href="#share-calculator">حاسبة الأسهم</a><a href="#transition">الانتقال</a><a href="#calculator">حاسبة رأس المال</a>', 1)

# Give the share calculator a direct anchor.
s = s.replace('<div class="shareCalc"><div class="card shareControls">', '<div class="shareCalc" id="share-calculator"><div class="card shareControls">', 1)

# Add a detailed comparison table before the regulatory cap and calculator.
if 'class="shareTypeCompare"' not in s:
    table = '''<div class="shareTypeCompare"><div class="shareTypeCompareHead"><span class="ey">مقارنة أنواع الأسهم</span><h3>ثلاثة أسئلة تفرق بينها: من يصوت؟ من له أولوية مالية؟ وهل للشركة حق استرداد السهم؟</h3><p>يمكن إنشاء فئات داخل النوع الواحد، وتفاصيل الحقوق تثبت في النظام الأساس وشروط الإصدار.</p></div><div class="table shareTypeTable"><table><thead><tr><th>المحور</th><th>الأسهم العادية</th><th>الأسهم الممتازة</th><th>الأسهم القابلة للاسترداد</th></tr></thead><tbody><tr><td>الاستخدام الأقرب</td><td>ملكية وتصويت وحوكمة، مع إمكان اختلاف قوة التصويت بين الفئات.</td><td>منح أولوية مالية لفئة من المستثمرين.</td><td>منح حقوق مالية مع وجود مسار استرداد تملكه الشركة وفق الشروط المكتوبة.</td></tr><tr><td>التصويت في الجمعية العامة</td><td><b class="yes">نعم</b> وفق الحقوق المحددة للفئة في النظام الأساس، وقد تختلف القوة التصويتية بين فئة وأخرى.</td><td><b class="no">لا كأصل</b> وتوجد حالة استثنائية في المادة 53 إذا لم توزع النسبة المقررة لمدة 3 سنوات متتالية؛ عندها يمكن لأصحاب الفئة تقرير الحضور والتصويت بصوت واحد لكل سهم حتى دفع الأرباح السابقة.</td><td><b class="no">لا كأصل</b> وتسري عليها حالة المادة 53 نفسها عند تحقق شروطها.</td></tr><tr><td>الحقوق في الأرباح</td><td>بحسب الأرباح القابلة للتوزيع وقرار التوزيع والحقوق المرتبطة بالفئة.</td><td>يجوز منحها أولوية على العادية، ومنها نسبة ثابتة سنوية من الأرباح أو نسبة أعلى إذا كانت الأرباح السنوية كافية وفق شروط الإصدار.</td><td>يجوز أن تمنح حقوقا تفضيلية على العادية بالشروط نفسها التي تجيزها المادة 53.</td></tr><tr><td>الخروج أو الاسترداد</td><td>لا يحمل بذاته آلية الاسترداد الخاصة بالأسهم القابلة للاسترداد؛ الخروج يكون عادة بنقل السهم أو بيعه وفق القيود والترتيبات المعتمدة.</td><td>لا تحمل بذاتها آلية استرداد لمجرد كونها ممتازة، ما لم توجد ترتيبات أخرى نظامية في النظام الأساس.</td><td><b class="yes">نعم</b> للشركة خيار استردادها وفقا لشروط وأحكام الاسترداد المكتوبة عند الإصدار، وتلغى الأسهم المستردة وتستكمل إجراءات تخفيض رأس المال.</td></tr><tr><td>حماية حقوق الفئة</td><td>إذا كان تعديل الحقوق أو إصدار فئة أخرى يضر بها، تطبق موافقات الجمعية الخاصة والجمعية العامة غير العادية بحسب المادة 110.</td><td>لها حماية حقوق الفئة نفسها عند المساس بحقوقها.</td><td>لها حماية حقوق الفئة نفسها عند المساس بحقوقها.</td></tr><tr><td>القيد الكمي</td><td>المادة 51 لا تضع عليها سقف 50% المقرر للنوعين الآخرين.</td><td><b>ضمن سقف مشترك</b> مع القابلة للاسترداد لا يتجاوز 50% من رأس المال في أي وقت.</td><td><b>ضمن سقف مشترك</b> مع الممتازة لا يتجاوز 50% من رأس المال في أي وقت.</td></tr><tr><td>أهم نقطة انتباه</td><td>قوة التصويت قد تختلف عن نسبة الملكية إذا صممت الفئات بأوزان تصويت مختلفة.</td><td>الأولوية المالية لا تعني عائدا مضمونا؛ الاستحقاق مرتبط بالأرباح وشروط الإصدار.</td><td>الاسترداد يحتاج شروطا مكتوبة وسيولة عند التنفيذ وإجراءات نظامية لتخفيض رأس المال.</td></tr></tbody></table></div><div class="shareTypeSource">المرجع المباشر للمقارنة: نظام الشركات المواد 108 و110، واللائحة التنفيذية المادتان 51 و53.</div></div>'''
    marker = '<div class="limit"><b>قيد نظامي</b>'
    if marker not in s:
        raise SystemExit('share limit marker not found')
    s = s.replace(marker, table + marker, 1)

# Add visual styles and make both calculators stay visible even in the quick view.
if '/* calculator-restore-v2 */' not in s:
    css = '''
/* calculator-restore-v2 */
#share-calculator,#calculator{scroll-margin-top:100px}.shareTypeCompare{margin-top:22px;padding:24px;border:1px solid #DDD5CB;border-radius:26px;background:#FFFEFC;box-shadow:0 12px 34px rgba(13,54,86,.05)}.shareTypeCompareHead{max-width:900px;margin-bottom:16px}.shareTypeCompareHead h3{margin:5px 0 6px;color:var(--n);font-size:24px;line-height:1.45}.shareTypeCompareHead p{margin:0;color:var(--muted);font-size:13px}.shareTypeTable table{min-width:1050px}.shareTypeTable td{font-size:12px;line-height:1.75}.shareTypeTable th:not(:first-child){min-width:250px}.shareTypeTable .yes{color:var(--green)}.shareTypeTable .no{color:#9A5D20}.shareTypeSource{margin-top:10px;color:var(--muted);font-size:10px}.shareCalc{margin-top:28px}.shareCalc:before{content:'حاسبة فئات الأسهم';display:block;grid-column:1/-1;color:var(--n);font-size:26px;font-weight:900;margin-bottom:-2px}.shareCalc:after{content:'تجربة الفئات هنا لا تغير النص النظامي؛ هي أداة لفهم أثر الملكية والتصويت.';display:block;grid-column:1/-1;grid-row:2;color:var(--muted);font-size:12px;margin-top:-10px;margin-bottom:4px}.shareCalc>.shareControls,.shareCalc>div:last-child{grid-row:3}#calculator>.c>.head:after{content:'حاسبة رأس المال والعائد موجودة أدناه بكامل حقولها ونتائجها.';display:block;margin-top:8px;color:var(--green);font-size:12px;font-weight:700}body.quickMode .shareCalc{display:grid!important}body.quickMode #calculator .controls{display:block!important}.links a[href="#share-calculator"],.links a[href="#calculator"]{font-weight:800}
@media(max-width:980px){.shareCalc:before{font-size:23px}.shareCalc:after{grid-row:auto}.shareCalc>.shareControls,.shareCalc>div:last-child{grid-row:auto}}
'''
    s = s.replace('</style><script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js">', css + '</style><script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js">', 1)

p.write_text(s, encoding='utf-8')
print('restored both calculators and added share-type comparison table')
