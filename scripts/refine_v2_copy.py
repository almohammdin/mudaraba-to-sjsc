from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')


def rep(old, new, label):
    global s
    if old in s:
        s = s.replace(old, new)
        return
    if new in s:
        return
    raise SystemExit(f'missing target: {label}')

# 1) Simplify the operator relationship section.
model_prefix_pattern = re.compile(
    r'<section class="sec white" id="models"><div class="c"><div class="head">.*?</div><div class="modelSwitcher">.*?</div></div><div class="panel deepCompare">',
    re.S,
)
new_model_prefix = '''<section class="sec white" id="models"><div class="c"><div class="head"><span class="ey">العلاقة مع الشركة المشغلة</span><h2>إما أن يبقى المال داخل شركة المشروع، أو يسلم للمشغل بعقد مضاربة</h2><p>في نموذج الإدارة والتشغيل تبقى الأموال والأصول في شركة المشروع، وتدير الشركة المشغلة النشاط لحسابها مقابل أتعاب وحافز أداء. في نموذج المضاربة المؤسسية تسلم شركة المشروع المال للشركة المشغلة بصفتها المضارب، وتأخذ شركة المشروع حصتها من الربح وفق العقد.</p></div><div class="modelSwitcher"><div class="modelToggle" role="group" aria-label="اختيار نموذج العلاقة مع المشغل"><button type="button" class="modelToggleBtn active" data-model="management" aria-pressed="true">إدارة وتشغيل داخل شركة المشروع</button><button type="button" class="modelToggleBtn" data-model="mudaraba" aria-pressed="false">مضاربة مع الشركة المشغلة</button></div><div class="card modelStage"><div class="modelStageHead"><div><span class="badge" id="modelBadge">المال والأصول داخل شركة المشروع</span><h3 id="modelTitle">الإدارة والتشغيل داخل شركة المشروع</h3><p id="modelIntro">شركة المشروع تملك المال والأصول، والشركة المشغلة تدير التنفيذ لحسابها مقابل أتعاب وحافز أداء.</p></div></div><div class="modelViz" id="modelViz" aria-live="polite"></div><div class="modelFacts"><div><small>مسار المال</small><b id="modelAssets">داخل شركة المشروع</b></div><div><small>دور الشركة المشغلة</small><b id="modelOperatorIncome">إدارة وتنفيذ النشاط لحساب شركة المشروع</b></div><div><small>الربح والمقابل</small><b id="modelProjectProfit">شركة المشروع تستحق نتيجة النشاط، والمشغل يستحق الأتعاب والحافز</b></div></div></div></div><div class="panel deepCompare">'''
if model_prefix_pattern.search(s):
    s = model_prefix_pattern.sub(new_model_prefix, s, count=1)
elif 'إما أن يبقى المال داخل شركة المشروع، أو يسلم للمشغل بعقد مضاربة' not in s:
    raise SystemExit('missing target: models section')

old_model_views = """management:{badge:'الأصول داخل شركة المشروع',title:'الإدارة والتشغيل',intro:'شركة المشروع تملك الأموال والأصول، والمشغل ينفذ النشاط بموجب عقد إدارة وتشغيل.',assets:'شركة المشروع',operator:'أجر إدارة وحافز أداء',profit:'نتيجة النشاط بعد التكاليف',nodes:[['شركة المشروع','تملك المال والأصول','primary'],['عقد إدارة وتشغيل','صلاحيات وتقارير ومقابل','gold'],['الشركة المشغلة','تنفذ النشاط',''],['النتيجة','تعود إلى شركة المشروع','']]},
mudaraba:{badge:'عقد مضاربة واحد بين الكيانين',title:'المضاربة المؤسسية',intro:'شركة المشروع تكون رب المال، والشركة المشغلة تكون المضارب وتعمل بالمال وفق عقد المضاربة.',assets:'شركة المشروع بصفتها رب المال',operator:'حصة المضارب من الربح وفق العقد',profit:'نصيب رب المال من ربح المضاربة',nodes:[['شركة المشروع','رب المال','primary'],['عقد مضاربة','جزء شائع من الربح','gold'],['الشركة المشغلة','المضارب',''],['النتيجة','تقسم وفق نسبة الربح','']]}"""
new_model_views = """management:{badge:'المال والأصول داخل شركة المشروع',title:'الإدارة والتشغيل داخل شركة المشروع',intro:'شركة المشروع تملك المال والأصول، والشركة المشغلة تدير التنفيذ لحسابها مقابل أتعاب وحافز أداء.',assets:'داخل شركة المشروع',operator:'إدارة وتنفيذ النشاط لحساب شركة المشروع',profit:'شركة المشروع تستحق نتيجة النشاط، والمشغل يستحق الأتعاب والحافز',nodes:[['شركة المشروع','تملك المال والأصول','primary'],['عقد إدارة وتشغيل','المشغل يدير لحساب الشركة','gold'],['الشركة المشغلة','تنفذ النشاط',''],['النتيجة','لشركة المشروع بعد أتعاب المشغل','']]},
mudaraba:{badge:'المال يسلم للمشغل بعقد مضاربة',title:'مضاربة مع الشركة المشغلة',intro:'شركة المشروع تسلم المال للشركة المشغلة بصفتها المضارب، ويقسم الربح بينهما بالنسبة المتفق عليها في العقد.',assets:'تسلمه الشركة المشغلة للعمل به بصفتها المضارب',operator:'مضارب يدير المال وفق عقد المضاربة',profit:'يقسم الربح بين شركة المشروع والمشغل بالنسبة المتفق عليها',nodes:[['شركة المشروع','رب المال','primary'],['عقد مضاربة','تسليم المال للمشغل','gold'],['الشركة المشغلة','المضارب',''],['الربح','يقسم بالنسبة المتفق عليها','']]}"""
rep(old_model_views, new_model_views, 'model views')

# 2) Remove negative phrasing from the share comparison and make voting status explicit.
replacements = [
    ('ثلاثة أسئلة تفرق بينها: من يصوت؟ من له أولوية مالية؟ وهل للشركة حق استرداد السهم؟', 'الفرق بينها يظهر في التصويت، أولوية الأرباح، والاسترداد.'),
    ('<b class="no">لا كأصل</b> وتوجد حالة استثنائية في المادة 53 إذا لم توزع النسبة المقررة لمدة 3 سنوات متتالية؛ عندها يمكن لأصحاب الفئة تقرير الحضور والتصويت بصوت واحد لكل سهم حتى دفع الأرباح السابقة.', 'حق التصويت يظهر في الحالة الواردة بالمادة 53 عند بقاء النسبة المقررة من الأرباح مستحقة لمدة 3 سنوات متتالية؛ وعندها يمكن لأصحاب الفئة تقرير الحضور والتصويت بصوت واحد لكل سهم حتى دفع الأرباح السابقة.'),
    ('<b class="no">لا كأصل</b> وتسري عليها حالة المادة 53 نفسها عند تحقق شروطها.', 'حق التصويت يخضع للحالة نفسها الواردة في المادة 53 عند بقاء النسبة المقررة من الأرباح مستحقة لمدة 3 سنوات متتالية.'),
    ('لا يحمل بذاته آلية الاسترداد الخاصة بالأسهم القابلة للاسترداد؛ الخروج يكون عادة بنقل السهم أو بيعه وفق القيود والترتيبات المعتمدة.', 'مسار الخروج المعتاد يكون بنقل السهم أو بيعه وفق القيود والترتيبات المعتمدة.'),
    ('لا تحمل بذاتها آلية استرداد لمجرد كونها ممتازة، ما لم توجد ترتيبات أخرى نظامية في النظام الأساس.', 'مسار الخروج يرتبط بنقل السهم أو الترتيبات النظامية الواردة في النظام الأساس وشروط الإصدار.'),
    ('المادة 51 لا تضع عليها سقف 50% المقرر للنوعين الآخرين.', 'سقف 50% في المادة 51 يختص بالأسهم الممتازة والقابلة للاسترداد وفئاتها مجتمعة.'),
    ('<b>ضمن سقف مشترك</b> مع القابلة للاسترداد لا يتجاوز 50% من رأس المال في أي وقت.', '<b>سقف مشترك</b> مع القابلة للاسترداد مقداره 50% من رأس المال في أي وقت.'),
    ('<b>ضمن سقف مشترك</b> مع الممتازة لا يتجاوز 50% من رأس المال في أي وقت.', '<b>سقف مشترك</b> مع الممتازة مقداره 50% من رأس المال في أي وقت.'),
    ('الأولوية المالية لا تعني عائدا مضمونا؛ الاستحقاق مرتبط بالأرباح وشروط الإصدار.', 'الأولوية المالية تستند إلى الأرباح القابلة للتوزيع وشروط الإصدار، وقيمة العائد ترتبط بما يتحقق فعليا.'),
    ("content:'تجربة الفئات هنا لا تغير النص النظامي؛ هي أداة لفهم أثر الملكية والتصويت.'", "content:'الحاسبة أداة لفهم أثر الفئات على الملكية والتصويت، بينما تثبت الحقوق النهائية في النظام الأساس وقرار الإصدار.'"),
]
for old, new in replacements:
    rep(old, new, old[:40])

# 3) Rename the financial scenarios.
scenario_replacements = [
    ("conservative:{label:'سيناريو التحفظ'", "conservative:{label:'السيناريو المتحفظ'"),
    ("growth:{label:'سيناريو التوسع'", "growth:{label:'السيناريو المتفائل'"),
    ('<b>تحفظ</b>', '<b>المتحفظ</b>'),
    ('<b>توسع</b>', '<b>المتفائل</b>'),
    ('data-scenario-col="conservative">تحفظ</th>', 'data-scenario-col="conservative">المتحفظ</th>'),
    ('data-scenario-col="growth">توسع</th>', 'data-scenario-col="growth">المتفائل</th>'),
    ('data-compare-scenario="conservative">استخدم التحفظ</button>', 'data-compare-scenario="conservative">المتحفظ</button>'),
    ('data-compare-scenario="base" class="active">استخدم المقترح</button>', 'data-compare-scenario="base" class="active">المقترح</button>'),
    ('data-compare-scenario="growth">استخدم التوسع</button>', 'data-compare-scenario="growth">المتفائل</button>'),
]
for old, new in scenario_replacements:
    rep(old, new, old[:40])

# Keep the default visible label aligned with the scenario names.
rep('السيناريو المقترح', 'السيناريو المقترح', 'base scenario label')

p.write_text(s, encoding='utf-8')
print('refined wording, scenarios, and operator models')
