from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Single-model refinement: the SJSC is Rabb al-Mal and the other company is the Mudarib.
# 1) Make the structure explicitly one model: Company funds enter the SJSC, then the SJSC invests through Mudarabah with the operating company.
s = s.replace(
    'الشركة الجديدة تتعاقد مع المشغل بعقد واحد، وتظهر نتائج النشاط في قوائمها ثم توزع الأرباح وفق حقوق الأسهم.',
    'الأموال تدخل شركة المساهمة المبسطة، ثم تستثمرها الشركة بعقد مضاربة مع الشركة الأخرى. يظهر نصيب شركة المشروع من الربح في قوائمها ثم يوزع وفق حقوق الأسهم.'
)
s = s.replace(
    'الشركة المشغلة تتولى التنفيذ، وشركة المشروع تمسك الملكية والرقابة وقرار التوزيع.',
    'شركة المشروع تملك الأموال وتستثمرها بعقد مضاربة مع الشركة الأخرى، ثم تدير ملكية المساهمين والرقابة وقرار التوزيع.'
)

# Structure diagram labels.
s = s.replace('العقد مع المشغل', 'عقد مضاربة')
s = s.replace('نطاق وصلاحيات وتقارير ومقابل', 'رأس المال ونسبة الربح والتقارير')
s = s.replace('الشركة المشغلة', 'الشركة المضاربة')
s = s.replace('تنفذ النشاط وفق العقد', 'تعمل بالمال وفق عقد المضاربة')
s = s.replace('الأرباح والتوزيع', 'حصة شركة المشروع من الربح')
s = s.replace('تعود للشركة ثم توزع', 'تدخل قوائم الشركة ثم توزع')

# Interactive structure copy.
structure_old = """contract:{k:'عقد مضاربة',t:'عقد واحد يضبط العلاقة التشغيلية بدلا من تعدد العلاقات مع المستثمرين.',d:'يحدد نطاق العمل والصلاحيات والتقارير ومؤشرات الأداء والمقابل المستحق للمشغل.'},
operator:{k:'الشركة المضاربة',t:'المشغل ينفذ النشاط بخبرته وعلاقاته وفق النموذج المختار.',d:'في نموذج الإدارة والتشغيل تكون الملكية داخل شركة المشروع. وفي المضاربة المؤسسية تكون الشركة المشغلة مضاربا بعقد واحد مع شركة المشروع.'},
profit:{k:'حصة شركة المشروع من الربح',t:'تعود نتيجة النشاط إلى شركة المشروع ثم يقرر توزيع الربح القابل للتوزيع.',d:'نصيب كل مساهم يتبع الحقوق المرتبطة بفئة أسهمه وقرار التوزيع والقوائم المالية الفعلية.'}"""
structure_new = """contract:{k:'عقد مضاربة',t:'شركة المشروع تسلم رأس مال المضاربة للشركة الأخرى وفق عقد واحد.',d:'يحدد العقد رأس المال ونسبة الربح ونطاق الاستثمار والتقارير والضوابط المتفق عليها.'},
operator:{k:'الشركة المضاربة',t:'الشركة الأخرى تعمل بالمال بصفتها المضارب.',d:'تدير النشاط بخبرتها وعلاقاتها، ويكون استحقاقها جزءا شائعا من الربح وفق عقد المضاربة.'},
profit:{k:'حصة شركة المشروع من الربح',t:'تعود حصة شركة المشروع من ربح المضاربة إلى قوائمها المالية.',d:'بعد إثبات النتيجة تتخذ الشركة قرار التوزيع على المساهمين وفق حقوق فئات الأسهم.'}"""
if structure_old in s:
    s = s.replace(structure_old, structure_new)

# 2) Replace the operator relationship section with one fixed Mudarabah model.
models = '''<section class="sec white" id="models"><div class="c"><div class="head"><span class="ey">العلاقة مع الشركة المضاربة</span><h2>شركة المشروع تجمع الأموال ثم تستثمرها بعقد مضاربة مع الشركة الأخرى</h2><p>المساهمون يملكون شركة المشروع. الأموال تبقى مملوكة لشركة المشروع، ثم تسلم للشركة الأخرى كرأس مال مضاربة. الشركة الأخرى تعمل بالمال بصفتها المضارب، ويقسم الربح بين الطرفين بالنسبة المتفق عليها في العقد.</p></div><div class="card modelStage"><div class="modelStageHead"><div><span class="badge">النموذج المقترح</span><h3>شركة المشروع رب المال، والشركة الأخرى هي المضارب</h3><p>شركة المشروع تجمع أموال المساهمين وتستثمرها بعقد مضاربة واحد مع الشركة الأخرى.</p></div></div><div class="modelViz"><div class="modelNode primary"><b>شركة المشروع</b><span>تجمع أموال المساهمين وتكون رب المال</span></div><div class="modelArrow">←</div><div class="modelNode gold"><b>عقد مضاربة</b><span>يحدد رأس المال ونسبة الربح والتقارير</span></div><div class="modelArrow">←</div><div class="modelNode"><b>الشركة المضاربة</b><span>تعمل بالمال في النشاط</span></div><div class="modelArrow">←</div><div class="modelNode"><b>الربح</b><span>يقسم بين الطرفين بالنسبة المتفق عليها</span></div></div><div class="modelFacts"><div><small>ملكية المال</small><b>شركة المشروع</b></div><div><small>دور الشركة الأخرى</small><b>مضارب يعمل بالمال</b></div><div><small>مصدر ربح شركة المشروع</small><b>حصتها من ربح المضاربة</b></div></div></div><div class="panel deepCompare"><h3>أثر التحول على صاحب المال</h3><p style="color:var(--muted);margin-top:0">يتحول صاحب عقد المضاربة من علاقة مستقلة مع المضارب إلى مساهم في شركة المشروع، ثم تصبح المضاربة بين شركة المشروع والشركة الأخرى.</p><div class="table"><table><thead><tr><th>المحور</th><th>الوضع الحالي</th><th>بعد التحول</th></tr></thead><tbody><tr><td>صفة صاحب المال</td><td>طرف في عقد مضاربة مستقل</td><td>مساهم في شركة المشروع</td></tr><tr><td>من يبرم عقد المضاربة؟</td><td>كل مستثمر بعلاقته الحالية</td><td>شركة المشروع بعقد واحد مع الشركة الأخرى</td></tr><tr><td>رأس المال</td><td>موزع على عقود متعددة</td><td>مجمع داخل شركة المشروع</td></tr><tr><td>إثبات الحق</td><td>العقد والمستندات المالية</td><td>عدد الأسهم وفئتها في سجل المساهمين</td></tr><tr><td>الربح</td><td>بحسب كل عقد</td><td>حصة شركة المشروع من المضاربة ثم التوزيع على المساهمين</td></tr><tr class="final"><td>الصورة النهائية</td><td>مستثمر ← عقد مضاربة ← مضارب</td><td>مساهمون ← شركة المشروع ← عقد مضاربة ← الشركة الأخرى</td></tr></tbody></table></div></div></div></section>'''
s, n = re.subn(r'<section class="sec white" id="models">.*?</section>(?=<section class="sec soft" id="shares">)', models, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('models section replacement failed')

# Keep PDF export coherent after removing the toggle model.
model_js = """let v2Model='mudaraba';
const modelViews={
mudaraba:{title:'المضاربة مع الشركة الأخرى',intro:'شركة المشروع تكون رب المال، والشركة الأخرى تكون المضارب وتعمل بالمال وفق عقد المضاربة.',assets:'شركة المشروع',operator:'حصة المضارب من الربح وفق العقد'}
};"""
s, n = re.subn(r"let v2Model='management';.*?setModel\('management'\);", model_js, s, count=1, flags=re.S)
if n != 1 and "let v2Model='mudaraba';" not in s:
    raise SystemExit('model JS replacement failed')

s = s.replace(
    'شركة المشروع تجمع الملكية في كيان واحد، وتربط التشغيل بعقد واحد مع الجهة المشغلة.',
    'شركة المشروع تجمع الملكية في كيان واحد، ثم تستثمر أموالها بعقد مضاربة واحد مع الشركة الأخرى.'
)

# 3) Simplify the share-type comparison: main rule in the table, exceptions in a compact footnote.
share_compare = '''<div class="shareTypeCompare"><div class="shareTypeCompareHead"><span class="ey">مقارنة أنواع الأسهم</span><h3>الحكم الرئيسي لكل نوع في جدول واحد</h3><p>التفاصيل الاستثنائية تظهر في الملاحظات أسفل الجدول.</p></div><div class="table shareTypeTable"><table><thead><tr><th>المحور</th><th>الأسهم العادية</th><th>الأسهم الممتازة</th><th>الأسهم القابلة للاسترداد</th></tr></thead><tbody><tr><td>حق التصويت</td><td><b class="yes">نعم</b></td><td><b>لا</b><sup>1</sup></td><td><b>لا</b><sup>1</sup></td></tr><tr><td>أولوية في الأرباح</td><td>اعتيادية</td><td><b class="yes">نعم</b></td><td>بحسب شروط الإصدار</td></tr><tr><td>استرداد السهم من الشركة</td><td>لا</td><td>لا</td><td><b class="yes">نعم</b></td></tr><tr><td>تعدد الفئات</td><td><b class="yes">نعم</b></td><td><b class="yes">نعم</b></td><td><b class="yes">نعم</b></td></tr><tr><td>سقف 50% المشترك</td><td>خارج السقف</td><td><b>ينطبق</b><sup>2</sup></td><td><b>ينطبق</b><sup>2</sup></td></tr><tr><td>الاستخدام الأقرب</td><td>الملكية والتصويت</td><td>الأولوية المالية</td><td>الاسترداد وفق شروط الإصدار</td></tr></tbody></table></div><div class="shareTypeNotes"><p><sup>1</sup> المادة 53 من اللائحة التنفيذية تورد حالة استثنائية للتصويت عند بقاء النسبة المقررة من الأرباح مستحقة لمدة 3 سنوات متتالية، ويكون التصويت بصوت واحد لكل سهم حتى دفع الأرباح السابقة.</p><p><sup>2</sup> المادة 51 تجعل الأسهم الممتازة والقابلة للاسترداد وفئاتها مجتمعة ضمن سقف 50% من رأس المال.</p></div><div class="shareTypeSource">المرجع: نظام الشركات المادتان 108 و110، واللائحة التنفيذية المادتان 51 و53.</div></div>'''
s, n = re.subn(r'<div class="shareTypeCompare">.*?<div class="shareTypeSource">.*?</div></div>', share_compare, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('share comparison replacement failed')

# Compact note style for the new comparison.
style = ".shareTypeNotes{margin-top:10px;padding:11px 13px;border-radius:14px;background:#F8F4EE;color:var(--muted);font-size:10px;line-height:1.75}.shareTypeNotes p{margin:3px 0}.shareTypeNotes sup{color:var(--g);font-weight:900}.shareTypeTable td:not(:first-child){text-align:center;vertical-align:middle;font-size:13px}.shareTypeTable td:first-child{text-align:right}.shareTypeTable b{font-size:14px}"
if style not in s:
    s = s.replace('</style>', style + '</style>', 1)

# Keep calculator note concise.
s = s.replace(
    'للأسهم الممتازة والقابلة للاسترداد يثبت نموذج الحاسبة عدد الأصوات عند 0 في الوضع المعتاد، ويظل التطبيق النهائي مرتبطا بالنظام الأساس وأحكام الإصدار.',
    'الحاسبة تعتمد 0 صوت للأسهم الممتازة والقابلة للاسترداد، وتظهر حالة المادة 53 في الملاحظة أعلاه.'
)

p.write_text(s, encoding='utf-8')
print('single mudarabah model and compact share comparison applied')
