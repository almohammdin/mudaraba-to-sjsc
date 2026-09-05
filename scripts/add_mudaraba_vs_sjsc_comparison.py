from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

section_id = 'why-sjsc'
if f'id="{section_id}"' not in s:
    marker = '</section><section class="sec soft water" id="structure">'
    comparison = '''</section><section class="sec soft" id="why-sjsc"><div class="c"><div class="head"><span class="ey">مبررات التحول</span><h2>من عقود مضاربة متعددة إلى ملكية واحدة في شركة المشروع</h2><p>المقارنة التالية توضح الفرق العملي بين استمرار جمع الأموال بعقود مضاربة مستقلة وبين جمعها في شركة مساهمة مبسطة ثم دخول الشركة نفسها في عقد المضاربة.</p></div><div class="panel strategyCompare"><div class="table strategyTable"><table><thead><tr><th>المحور</th><th>عقود مضاربة متعددة</th><th>شركة مساهمة مبسطة</th></tr></thead><tbody><tr><td>صفة صاحب المال</td><td>رب مال في عقد مستقل</td><td>مساهم في شركة المشروع</td></tr><tr><td>طبيعة الحق</td><td>حق تعاقدي في المضاربة</td><td>ملكية أسهم وحقوق مرتبطة بالفئة</td></tr><tr><td>تجميع الأموال</td><td>عقود متعددة لكل ممول</td><td>رأس مال مجمع داخل كيان واحد</td></tr><tr><td>العلاقة مع المضارب</td><td>علاقات متعددة بحسب كل عقد</td><td>عقد مضاربة واحد بين شركة المشروع والشركة الأخرى</td></tr><tr><td>الحوكمة</td><td>تتركز في شروط العقود وإدارة المضارب</td><td>نظام أساس وسجل مساهمين وقرارات إدارة وجمعيات</td></tr><tr><td>التقارير</td><td>متابعة كل عقد وحقوقه</td><td>قوائم وتقارير موحدة على مستوى شركة المشروع</td></tr><tr><td>دخول مستثمر جديد</td><td>عقد مضاربة جديد</td><td>إصدار أو نقل أسهم وفق الإجراءات المعتمدة</td></tr><tr><td>الخروج</td><td>تسوية العقد وفق شروطه</td><td>نقل السهم أو الاسترداد وفق نوع السهم وشروطه</td></tr><tr><td>استمرارية العلاقة</td><td>ترتبط بمدة كل عقد وتجديده</td><td>الكيان يستمر مع تغير المساهمين</td></tr><tr class="riskRow"><td>مخاطر النزاعات</td><td>تتوزع على عدد كبير من العقود والحسابات والتسويات</td><td>تتركز في حقوق الأسهم وقرارات الشركة وعقد المضاربة الرئيسي</td></tr><tr class="riskRow"><td>مخاطر السوق المالية</td><td>اتساع عدد الممولين والتسويق وتوحيد الشروط يرفع حساسية التكييف النظامي، خصوصا إذا اقتربت الممارسة من برنامج استثمار جماعي أو طرح ورقة مالية</td><td>إصدار الأسهم وتسويقها يدخل في مسار طرح الأوراق المالية، ويحدد نوع الطرح وإجراءاته قبل الإصدار أو الترويج</td></tr></tbody></table></div><div class="strategyBottom"><div class="strategyKey"><small>الخلاصة</small><b>عقود المضاربة تنظم علاقة كل رب مال بالمضارب، بينما الشركة تجمع أصحاب الأموال في ملكية واحدة ثم تصبح شركة المشروع هي رب المال في عقد المضاربة.</b></div><div class="strategyRisk"><small>مثال تنظيمي</small><b>قضية سنام الأعمال</b><p>أعلنت هيئة السوق المالية قبول طلب تقييد دعوى جماعية مرتبطة بحملة تسويقية لطرح أسهم شركة تابعة، وأكد الإعلان ارتباط الواقعة بإجراءات قواعد طرح الأوراق المالية. دلالة المثال هنا أن هيكلة الشركة تحتاج معها مسارا صحيحا لإصدار الأسهم وتسويقها.</p><div class="strategyLinks"><a href="https://cma.gov.sa/MediaCenter/NEWS/Pages/CMA_N_3907.aspx" target="_blank" rel="noopener">إعلان هيئة السوق المالية</a><a href="https://www.uqn.gov.sa/decisions-and-regulations/4001355" target="_blank" rel="noopener">قواعد طرح الأوراق المالية</a></div></div></div></div></div>'''
    if marker not in s:
        raise SystemExit('insertion marker not found')
    s = s.replace(marker, comparison + '<section class="sec soft water" id="structure">', 1)

# Add nav item before structure.
nav_old = '<a href="#scene">الوضع الحالي</a><a href="#structure">الهيكل</a>'
nav_new = '<a href="#scene">الوضع الحالي</a><a href="#why-sjsc">المقارنة</a><a href="#structure">الهيكل</a>'
if nav_old in s:
    s = s.replace(nav_old, nav_new, 1)

# Keep wording aligned with the single-Mudarabah model.
s = s.replace('المساهم يتعامل مع شركة المشروع، وشركة المشروع تتعامل مع المشغل', 'شركة المشروع تجمع أموال المساهمين ثم تدخل بها في عقد مضاربة واحد')
s = s.replace('<a href="#models">العلاقة مع المشغل</a>', '<a href="#models">العلاقة مع المضارب</a>')

css = '''\n/* mudaraba-vs-sjsc comparison */\n.strategyCompare{padding:22px}.strategyTable table{min-width:900px}.strategyTable td{font-size:12px;line-height:1.65}.strategyTable .riskRow td{background:#FFF9F0}.strategyTable .riskRow td:first-child{color:#8A5A27}.strategyBottom{display:grid;grid-template-columns:.85fr 1.15fr;gap:14px;margin-top:14px}.strategyKey,.strategyRisk{border-radius:18px;padding:17px 18px}.strategyKey{background:linear-gradient(145deg,var(--n),var(--n2));color:#fff}.strategyKey small,.strategyKey b,.strategyRisk small,.strategyRisk b{display:block}.strategyKey small{color:#E9B979;font-weight:800}.strategyKey b{margin-top:4px;line-height:1.8}.strategyRisk{background:#FFF8EF;border:1px solid #E6C8A5}.strategyRisk small{color:#8A6640;font-weight:800}.strategyRisk b{color:var(--n);font-size:18px;margin-top:2px}.strategyRisk p{margin:5px 0 0;color:#66594D;font-size:11px;line-height:1.8}.strategyLinks{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.strategyLinks a{text-decoration:none;border:1px solid #E0C19D;background:#fff;color:var(--n);border-radius:10px;padding:6px 9px;font-size:10px;font-weight:800}@media(max-width:980px){.strategyBottom{grid-template-columns:1fr}}\n'''
if '/* mudaraba-vs-sjsc comparison */' not in s:
    s = s.replace('</style><script src=', css + '</style><script src=', 1)

p.write_text(s, encoding='utf-8')
print('comparison table added')
