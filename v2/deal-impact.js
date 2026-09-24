/* Deal mandate scenarios. Explicit attachment only; capital and stock rows stay unchanged. */
(() => {
  'use strict';
  const root = document.querySelector('#structureLearning');
  const roles = document.querySelector('#dealRoles');
  const math = window.SJSCDealMath;
  const designer = window.SJSCDesigner;
  if (!root || !roles || !math || !designer) return;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  const percent = value => `<bdi dir="ltr">${fmt(value)}%</bdi>`;
  const cash = (cents, currency) => `<span class="money">${currency === 'SAR' ? '<span class="sar" role="img" aria-label="ريال سعودي"></span>' : '<span aria-label="دولار أمريكي">$</span>'}<span>${fmt(cents / 100)}</span></span>`;
  const field = (key, label, initial = '0', hint = '') => `<label>${label}<input id="impact${key}" type="text" inputmode="decimal" dir="ltr" lang="en" value="${initial}" aria-describedby="impactError">${hint ? `<small>${hint}</small>` : ''}</label>`;
  const panel = document.createElement('section');
  panel.id = 'dealImpact'; panel.className = 'deal-impact'; panel.lang = 'ar-SA'; panel.dir = 'rtl';
  panel.setAttribute('aria-labelledby', 'impactTitle');
  panel.innerHTML = `
    <h4 id="impactTitle">أثر مهندسي الصفقة على الهيكل والحاسبة</h4>
    <p>حدد نطاق هذا التكليف ومقابله، ثم قارن أثره. المبالغ تخص الشركة المختارة والعملة المعروضة. تحفظ المدخلات مع ملف الشركة عند الضغط على «حفظ الشركة» في المصمم.</p>
    <h5>1. نطاق العمل والجهة التي تتحمل المقابل</h5>
    <div class="edu-role-fields">
      <label>ما نطاق عمل مهندسي الصفقة؟<select id="impactScope"><option value="one">فرصة محددة</option><option value="all">جميع الفرص في الهيكل</option></select></label>
      <label>الشركة التي نعد ميزانيتها<select id="impactCompany"></select><small>اربط ملف المصمم بهذه الشركة عند إرفاق السيناريو.</small></label>
      <label id="impactOpportunityField">الفرصة المحددة<select id="impactOpportunity"></select></label>
      <label>من يتحمل الأتعاب والمصروفات؟<select id="impactPayer"><option value="company">الشركة التي نعد ميزانيتها</option><option value="target">شركة الفرصة المحددة</option><option value="shareholders">مساهمون محددون خارج ميزانية الشركة</option></select></label>
      <label>العملة<span class="currencySelectWrap"><select id="impactCurrency"><option value="SAR">ريال سعودي</option><option value="USD">دولار أمريكي</option></select><span class="currencyChoiceMark" id="impactCurrencyMark"></span></span><small>جميع مبالغ المعاينة بهذه العملة. تغييرها يتطلب مراجعة المبالغ؛ تحويل الصرف يتم خارج المعاينة.</small></label>
    </div>
    <div id="impactScopeNote" class="edu-role-guidance"></div>
    <label id="impactAllocationField" class="impact-check" hidden><input id="impactAllocation" type="checkbox"> حددت نصيب الشركة المختارة من التكليف المشترك، والمبالغ أدناه تخصها وحدها.</label>
    <details><summary>كيف يختلف الأثر بين شركة واحدة وشركة لكل فرصة؟</summary>
      <div class="impact-comparison"><article><h5>شركة واحدة لعدة فرص</h5><p>يوثق العمل الخاص بكل فرصة وتوزيع المصروفات المشتركة. المشاركة بأسهم A تتصل بالشركة الجامعة واستثماراتها بحسب حقوق الأسهم.</p></article><article><h5>شركة مستقلة لكل فرصة</h5><p>يحدد عقد كل شركة ومقابلها وموافقاتها، مع تخصيص نصيبها من الأعمال المشتركة. تعاد هذه المعاينة لكل ملف شركة، وتراجع الضمانات والعقود المشتركة.</p></article></div>
    </details>
    <h5>2. ميزانية الصفقة والمقابل النقدي</h5>
    <p>الأتعاب ثابتة في هذه المعاينة. يظهر نوع المقابل المختار أعلاه. أدخل ثمن الاستثمار المقصود دون إضافة الأتعاب إليه مرتين.</p>
    <div class="edu-role-fields">
      ${field('Price', 'ثمن الاستثمار أو الاستحواذ', '0')}
      ${field('Available', 'تمويل متاح ومخصص لهذه الميزانية', '0', 'سيولة مخصصة يحددها المستخدم؛ تختلف عن القيمة الاسمية لرأس المال.')}
      ${field('Fee', 'أتعاب الأعمال المستحقة وفق الاتفاق', '0')}
      ${field('Success', 'مكافأة الإتمام المتفق عليها', '0')}
      ${field('Expenses', 'المصروفات المعتمدة', '0', 'تشمل المصروفات الخارجية المخصصة لهذه الشركة، وتفصل عن أتعاب المهندسين.')}
      ${field('Reserve', 'احتياطي نقدي ضمن ميزانية الشركة', '0')}
    </div>
    <label id="impactCreditField" class="impact-check"><input id="impactCredit" type="checkbox"> تخصم أتعاب الأعمال من مكافأة الإتمام، حتى قيمة المكافأة.</label>
    <button type="button" id="impactUseCash" class="ghostBtn">استخدام المدفوع النقدي كمصدر تمويل مفترض</button>
    <p class="edu-caveat">هذا الزر ينسخ المدفوع النقدي بعد استبعاد العيني. تحقق من توافره وعدم تخصيصه لالتزامات أخرى. لن تتغير قيمة رأس المال أو المدفوع.</p>
    <div id="impactEquityFields" hidden>
      <h5>3. الأسهم المتوقعة ومصدرها</h5>
      <p>نسبة المهندسين المستهدفة تشمل ملكيتهم الحالية في الكيان المختار. هذه معاينة اقتصادية قبل توثيق المصدر والفئة والحقوق والعدد الصحيح للأسهم والموافقات.</p>
      <div class="edu-role-fields">
        <label>أين يملكون الأسهم؟<select id="impactEntity"></select></label>
        <label>كيف تقدم الأسهم؟<select id="impactSource"><option value="holders">نقل من بقية المساهمين بالتناسب</option><option value="donor">نقل من مساهمين محددين</option><option value="issue">محاكاة إصدار أسهم جديدة</option></select></label>
        ${field('CurrentPct', 'ملكية المهندسين الحالية في هذا الكيان (%)', '0')}
        ${field('FinalPct', 'إجمالي ملكية المهندسين المستهدفة بعد التنفيذ (%)', '0')}
        ${field('DonorPct', 'ملكية المساهمين مقدمي الأسهم قبل النقل (%)', '0', 'تُدخل ملكيتهم مجتمعين، وتستبعد منها ملكية المهندسين المحتسبة في الحقل السابق.')}
      </div>
      <p id="impactEquityNote" class="edu-caveat"></p>
    </div>
    <p id="impactError" class="edu-input-error" role="status"></p>
    <div id="impactPreview" aria-live="polite" aria-atomic="true"></div>
    <div class="impact-actions"><button type="button" id="impactAttach" class="primaryBtn">إرفاق السيناريو بالمصمم</button><button type="button" id="impactCopy" class="ghostBtn">نسخ ملخص الأثر</button></div>
    <p id="impactStatus" role="status"></p>
    <p class="edu-caveat">الإرفاق يضيف معاينة إلى ميزانية الصفقة وتحليل الملكية في المصمم. تظل بيانات رأس المال وصفوف الأسهم ومخرجات منصة التأسيس كما هي، حتى إعداد التعديل القانوني المناسب. تصدير A4 الحالي مخصص لرأس المال؛ يمكن نسخ هذا الملخص بصورة مستقلة.</p>`;
  roles.querySelector('.edu-role-workspace > details').before(panel);
  roles.querySelector('.edu-role-workspace > summary').textContent = 'تصميم تكليف مهندسي الصفقة وحساب أثره';
  $('eduEngineerOwner').parentElement.firstChild.textContent = 'هل يملكون أسهمًا حاليًا في الكيان محل معاينة الأسهم؟';
  const caption = roles.querySelector('.edu-header p');
  caption.textContent = 'قد يجمع شخص أو شركة أكثر من دور. تُسجل ملكيته مرة واحدة، وتوضح خدماته وصلاحياته في اتفاق مستقل. تحفظ مدخلات التكليف ومعاينة أثره مع ملف الشركة عند استخدام زر حفظ الشركة في المصمم.';
  const oldHint = roles.querySelector('.edu-role-fields + p.edu-caveat');
  if (oldHint) oldHint.textContent = 'راجع مصدر الأسهم وشروطها في المعاينة أدناه. نسب الرسم الأساسي تعليمية، ويعرض جدول المعاينة أثر المقابل المتوقع مستقلًا عن الملكية المسجلة.';

  const connection = document.createElement('div'); connection.id = 'impactConnection'; connection.className = 'impact-connection';
  root.querySelector('.edu-canvas').append(connection);
  const budget = document.createElement('section'); budget.id = 'impactDesignerBudget'; budget.className = 'impact-attached'; budget.hidden = true;
  $('capitalPanel').append(budget);
  const ownership = document.createElement('section'); ownership.id = 'impactDesignerOwnership'; ownership.className = 'impact-attached'; ownership.hidden = true;
  $('analysisPanel').append(ownership);
  const names = ['Scope', 'Company', 'Opportunity', 'Payer', 'Currency', 'Price', 'Available', 'Fee', 'Success', 'Expenses', 'Reserve', 'Entity', 'Source', 'CurrentPct', 'FinalPct', 'DonorPct'];
  const checks = ['Credit', 'Allocation'];
  const roleIds = ['eduEngineersName', 'eduContractClient', 'eduEngineerComp', 'eduEngineerOwner', 'eduEngineerWork', 'eduEngineerTerms'];
  let applied = null;
  let restoring = false;
  let lastScene = 'single';
  const scene = () => root.querySelector('[data-edu-scene][aria-pressed="true"]')?.dataset.eduScene || 'single';
  const defaults = () => ({ Scope: 'one', Company: 'A', Opportunity: 'B', Payer: 'company', Currency: designer.context().currency || 'SAR', Price: '0', Available: '0', Fee: '0', Success: '0', Expenses: '0', Reserve: '0', Entity: 'A', Source: 'holders', CurrentPct: '0', FinalPct: '0', DonorPct: '0', Credit: false, Allocation: false });
  const roleDefaults = { eduEngineersName: '', eduContractClient: 'founders', eduEngineerComp: 'fee', eduEngineerOwner: 'unknown', eduEngineerWork: '', eduEngineerTerms: '' };
  function options(id, entries) {
    const node = $(id), previous = node.value;
    node.replaceChildren(...entries.map(([value, text]) => new Option(text, value)));
    if (entries.some(([value]) => value === previous)) node.value = previous;
  }
  function syncOptions() {
    const s = scene();
    options('impactCompany', s === 'separate' ? [['A1', 'شركة A1'], ['A2', 'شركة A2']] : [['A', 'شركة A']]);
    const opportunities = s === 'assets' ? [['P1', 'أصل المطعم'], ['P2', 'تجهيزات المقهى'], ['P3', 'المستودع']]
      : s === 'portfolio' ? [['B', 'شركة B'], ['C', 'شركة C'], ['D', 'شركة D']]
      : s === 'separate' ? [[$('impactCompany').value === 'A1' ? 'B' : 'C', $('impactCompany').value === 'A1' ? 'شركة B' : 'شركة C']] : [['B', 'شركة B']];
    options('impactOpportunity', opportunities);
    options('impactEntity', [[$('impactCompany').value, 'شركة ' + $('impactCompany').value], ...(s === 'assets' ? [] : opportunities)]);
    $('impactOpportunityField').hidden = $('impactScope').value === 'all' && $('impactPayer').value !== 'target';
    $('impactAllocationField').hidden = !(s === 'separate' && $('impactScope').value === 'all');
    $('impactPayer').querySelector('[value="target"]').disabled = s === 'assets';
    if (s === 'assets' && $('impactPayer').value === 'target') $('impactPayer').value = 'company';
  }
  function read() {
    const values = Object.fromEntries(names.map(name => [name, $('impact' + name).value]));
    for (const name of checks) values[name] = $('impact' + name).checked;
    return { version: 1, scene: scene(), values, roles: Object.fromEntries(roleIds.map(id => [id, $(id).value])) };
  }
  function input(draft) {
    const v = draft.values;
    return { price: v.Price, available: v.Available, fee: v.Fee, success: v.Success, expenses: v.Expenses, reserve: v.Reserve,
      payer: v.Payer, comp: draft.roles.eduEngineerComp, credit: v.Credit, currentPct: v.CurrentPct, finalPct: v.FinalPct, donorPct: v.DonorPct, source: v.Source };
  }
  function errorsFor(draft, result) {
    const v = draft.values, errors = [...result.errors];
    if (!['SAR', 'USD'].includes(v.Currency)) errors.push('Currency');
    if (draft.scene === 'separate' && v.Scope === 'all' && !v.Allocation) errors.push('Allocation');
    if (draft.roles.eduEngineerOwner === 'no' && result.equity && math.units(v.CurrentPct, 100) !== 0) errors.push('CurrentPct');
    if (draft.roles.eduEngineerOwner === 'yes' && result.equity && math.units(v.CurrentPct, 100) === 0) errors.push('CurrentPct');
    return errors;
  }
  function ownershipHtml(draft, result) {
    if (!result.equity) return '<p>المقابل النقدي في هذا السيناريو لا يضيف ملكية. تبقى أي أسهم حالية وفق سجل الشركة.</p>';
    return `<h5>ملكية متوقعة في <bdi>${esc(draft.values.Entity)}</bdi></h5><div class="impact-table-wrap"><table class="impact-table"><thead><tr><th scope="col">الطرف</th><th scope="col">قبل التنفيذ</th><th scope="col">بعد التنفيذ المتوقع</th></tr></thead><tbody>${result.equity.rows.map(row => `<tr><th scope="row">${row.name}</th><td>${percent(row.before / 100)}</td><td>${percent(row.after / 100)}</td></tr>`).join('')}</tbody></table></div><p class="edu-caveat">الحقوق والتصويت تتبع فئات الأسهم ووثائقها. يعرض الجدول نسب الملكية الاقتصادية المتوقعة فقط.</p>`;
  }
  function budgetHtml(draft, result) {
    const currency = draft.values.Currency;
    const cards = [['إجمالي الاستخدامات لجميع الدافعين', result.total], ['المطلوب من الشركة المختارة', result.required], ['على أطراف أخرى', result.external], ['التمويل المخصص للشركة', result.money.available], ['فجوة تمويل الشركة', result.gap], ['فائض التمويل المخصص', result.surplus]];
    return `<div class="impact-totals">${cards.map(([label, value]) => `<div><small>${label}</small><b>${cash(value, currency)}</b></div>`).join('')}</div><p>المتبقي من مكافأة الإتمام بعد الخصم: ${cash(result.successDue, currency)}.</p><details><summary>ماذا لو تعثرت الصفقة؟</summary><p>بافتراض استحقاق أتعاب الأعمال وإكمال صرف المصروفات المدخلة، مع عدم تحقق شرط مكافأة الإتمام: إجمالي المقابل والمصروفات ${cash(result.cancelled, currency)}، ومنه على الشركة ${cash(result.cancelledCompany, currency)}. هذا افتراض للمقارنة؛ يحدد الاتفاق المنجز فعليًا والقابل للاسترداد والالتزامات غير القابلة للإلغاء. الأسهم المشروطة تحتاج معالجة مستقلة وفق ما تحقق من شروطها.</p></details>`;
  }
  function brief(draft, result) {
    const v = draft.values, money = amount => fmt(amount / 100) + (v.Currency === 'SAR' ? ' ريال سعودي' : ' $');
    return ['معاينة أثر مهندسي الصفقة', 'الفريق: ' + (draft.roles.eduEngineersName || 'يحدد لاحقًا'),
      'الشركة المختارة: ' + v.Company, 'نطاق العمل: ' + (v.Scope === 'all' ? 'جميع الفرص' : 'فرصة ' + v.Opportunity),
      'الجهة المتحملة للمقابل: ' + ({ company: v.Company, target: v.Opportunity, shareholders: 'مساهمون محددون' }[v.Payer]),
      'إجمالي الاستخدامات: ' + money(result.total), 'المطلوب من الشركة: ' + money(result.required),
      'فجوة التمويل: ' + money(result.gap), 'فائض التمويل: ' + money(result.surplus),
      ...(result.equity ? ['الكيان محل الأسهم: ' + v.Entity, ...result.equity.rows.map(row => row.name + ': ' + fmt(row.before / 100) + '% قبل التنفيذ، ' + fmt(row.after / 100) + '% بعد التنفيذ المتوقع')] : []),
      'الأعمال: ' + (draft.roles.eduEngineerWork || 'تحدد لاحقًا'), 'الشروط: ' + (draft.roles.eduEngineerTerms || 'تحدد لاحقًا'),
      'معاينة تحضيرية. رأس المال وصفوف الأسهم المسجلة مستقلة عنها. تراجع المصادر والموافقات والتراخيص قبل التنفيذ.'].join('\n');
  }
  function attached() {
    budget.hidden = ownership.hidden = !applied;
    if (!applied) return;
    const result = math.calculate(input(applied.draft));
    if (errorsFor(applied.draft, result).length) { applied = null; budget.hidden = ownership.hidden = true; return; }
    const stale = JSON.stringify(read()) !== JSON.stringify(applied.draft);
    const mismatch = applied.draft.values.Currency !== designer.context().currency;
    const note = `<h4>سيناريو مهندسي الصفقة المرفق</h4><p>الشركة المقصودة: <bdi>${esc(applied.draft.values.Company)}</bdi>. نسخة معاينة بتاريخ <bdi dir="ltr">${esc(new Date(applied.at).toLocaleString('en-GB'))}</bdi>.</p>${stale ? '<p class="impact-alert">تغيرت المدخلات أو الهيكل بعد الإرفاق. النتائج التالية تخص النسخة السابقة. راجع المعاينة وأرفقها مجددًا لتحديثها.</p>' : ''}${mismatch ? '<p class="impact-alert">عملة السيناريو تختلف عن عملة رأس المال الحالية. لا تجمع القيم قبل توحيد العملة وإعادة الإرفاق.</p>' : ''}`;
    const actions = '<a href="#dealImpact">مراجعة التكليف والمعاينة</a> <button type="button" class="ghostBtn" data-impact-remove>إزالة المعاينة المرفقة</button>';
    budget.innerHTML = note + budgetHtml(applied.draft, result) + actions;
    ownership.innerHTML = note + ownershipHtml(applied.draft, result) + '<p>هذه المعاينة مستقلة عن فئات الأسهم المسجلة أعلاه ومخرجات منصة التأسيس.</p>' + actions;
  }
  function render() {
    if (restoring) return;
    syncOptions();
    const draft = read(), v = draft.values, comp = draft.roles.eduEngineerComp;
    const equity = ['equity', 'mixed'].includes(comp);
    $('impactFee').disabled = !['fee', 'mixed'].includes(comp);
    $('impactSuccess').disabled = !['success', 'mixed'].includes(comp);
    $('impactCreditField').hidden = comp !== 'mixed';
    $('impactEquityFields').hidden = !equity;
    $('impactDonorPct').parentElement.hidden = v.Source !== 'donor';
    $('impactCurrencyMark').innerHTML = v.Currency === 'SAR' ? '<span class="sar" role="img" aria-label="ريال سعودي"></span>' : '<span aria-label="دولار أمريكي">$</span>';
    $('impactScopeNote').textContent = scene() === 'separate'
      ? 'لكل شركة تكليف ومقابل مستقلان. عند شمول جميع الفرص، خصص نصيب الشركة المختارة من الأتعاب والمصروفات المشتركة قبل إرفاق السيناريو بملفها.'
      : v.Scope === 'all' ? 'يشمل التكليف جميع الفرص في هذا الهيكل. وثق توزيع الأعمال والمصروفات المشتركة، وحدد أي مهام لاحقة في الاتفاق.'
      : 'يخص التكليف الفرصة المحددة. راجع مدى اتساع المقابل إذا كانت الأسهم المقترحة في الشركة الجامعة التي تملك فرصًا أخرى.';
    $('impactEquityNote').textContent = (v.Source === 'issue' ? 'الإصدار يحتاج تحديد عدد الأسهم الصحيح وقيمتها وطريقة الوفاء والموافقات. النسبة وحدها لا تسدد رأس المال. ' : 'نقل الأسهم يغير أصحاب الملكية؛ يراجع مقدمو الأسهم وشروط النقل والموافقات. ') + (v.Entity === 'A' && scene() === 'portfolio' ? 'المشاركة في A تمتد اقتصاديًا إلى استثمارات الشركة بحسب حقوق الأسهم، حتى عندما يخص العمل فرصة واحدة.' : 'تعرض النسب في الكيان المختار وحده؛ تبقى نسب الكيانات الأخرى مستقلة.');
    const result = math.calculate(input(draft)), errors = errorsFor(draft, result);
    panel.querySelectorAll('input[inputmode]').forEach(node => node.setAttribute('aria-invalid', String(errors.some(key => key.toLowerCase() === node.id.slice(6).toLowerCase()))));
    $('impactError').textContent = errors.length ? 'راجع المدخلات: مبالغ من 0 إلى 1,000,000,000,000 بمنزلتين عشريتين، ونسب من 0 إلى 100. الملكية المستهدفة تشمل الحالية، والنقل ضمن ملكية مقدمي الأسهم. راجع صفة الملكية وتأكيد تخصيص التكليف المشترك عند الحاجة.' : '';
    $('impactAttach').disabled = $('impactCopy').disabled = errors.length > 0;
    $('impactPreview').innerHTML = errors.length ? '<p>تظهر النتائج بعد تصحيح الحقول، حتى تبقى المعاينة متسقة.</p>' : budgetHtml(draft, result) + ownershipHtml(draft, result);
    const payer = v.Payer === 'company' ? 'شركة ' + v.Company : v.Payer === 'target' ? 'شركة ' + v.Opportunity : 'مساهمون محددون';
    connection.innerHTML = `<b>العلاقة التعاقدية المقترحة</b><p>الجهة المتحملة للمقابل: <bdi>${esc(payer)}</bdi></p><small>${equity ? 'معاينة الأسهم المقترحة في ' + esc(v.Entity) + ' تظهر في جدول الأثر؛ الملكية المسجلة مستقلة.' : 'المقابل النقدي مستقل عن خطوط الملكية.'}</small><a href="#dealImpact">عرض الأثر على التمويل والملكية</a>`;
    attached();
  }
  function restore(saved) {
    restoring = true;
    const valid = saved?.version === 1 && saved.draft?.values && saved.draft?.roles;
    const draft = valid ? saved.draft : null;
    const values = { ...defaults(), ...(draft?.values || {}) };
    const s = ['single', 'portfolio', 'separate', 'assets'].includes(draft?.scene) ? draft.scene : 'single';
    root.querySelector(`[data-edu-scene="${s}"]`).click();
    syncOptions();
    for (const name of names) {
      const node = $('impact' + name), value = values[name];
      if (node.tagName === 'SELECT') {
        if ([...node.options].some(option => option.value === value)) node.value = value;
      } else node.value = typeof value === 'string' || typeof value === 'number' ? String(value).slice(0, 40) : '0';
      if (name === 'Company') syncOptions();
    }
    for (const name of checks) $('impact' + name).checked = values[name] === true;
    for (const id of roleIds) {
      const node = $(id), value = draft?.roles[id] ?? roleDefaults[id];
      if (node.tagName === 'SELECT') node.value = [...node.options].some(option => option.value === value) ? value : roleDefaults[id];
      else node.value = String(value).slice(0, node.maxLength > 0 ? node.maxLength : 3000);
    }
    applied = valid && saved.applied?.draft?.values && saved.applied?.draft?.roles && Number.isFinite(Date.parse(saved.applied.at))
      ? JSON.parse(JSON.stringify(saved.applied)) : null;
    $('eduEngineerComp').dispatchEvent(new Event('change', { bubbles: true }));
    $('impactStatus').textContent = '';
    restoring = false;
    render();
  }
  roles.addEventListener('input', event => {
    if (event.target.closest('#dealImpact') && event.target.inputMode === 'decimal') event.target.value = math.normalize(event.target.value);
    render();
  });
  roles.addEventListener('change', event => {
    if (['impactCompany', 'impactScope'].includes(event.target.id)) $('impactAllocation').checked = false;
    $('impactStatus').textContent = ''; render();
  });
  panel.addEventListener('focusout', event => {
    const node = event.target;
    if (node.inputMode === 'decimal' && math.units(node.value) !== null) { node.value = fmt(math.units(node.value) / 100); render(); }
  });
  root.addEventListener('sjsc:structure-changed', () => {
    if (scene() !== lastScene) $('impactAllocation').checked = false;
    lastScene = scene(); render();
  });
  document.addEventListener('click', event => {
    if (event.target.closest('a[href="#dealImpact"]')) roles.querySelector('.edu-role-workspace').open = true;
  });
  document.addEventListener('sjsc:designer-changed', attached);
  $('impactUseCash').addEventListener('click', () => {
    if (!designer.context().capitalValid) { $('impactStatus').textContent = 'صحح بيانات رأس المال والمدفوع في المصمم قبل نسخ مصدر التمويل.'; return; }
    if ($('impactCurrency').value !== designer.context().currency) { $('impactStatus').textContent = 'وحّد عملة المعاينة وعملة المصمم قبل نسخ التمويل. تحويل العملات يحتاج مبلغًا مراجعًا.'; return; }
    $('impactAvailable').value = fmt(designer.context().cashPaid); render();
    $('impactStatus').textContent = 'نُسخ المدفوع النقدي كافتراض تمويل. راجع توافره قبل اعتماد الميزانية.';
  });
  $('impactAttach').addEventListener('click', () => {
    const draft = read(), result = math.calculate(input(draft));
    if (errorsFor(draft, result).length) return;
    if (draft.values.Currency !== designer.context().currency) { $('impactStatus').textContent = 'عملة المعاينة تختلف عن عملة المصمم. راجع العملة والمبالغ ووحدها قبل الإرفاق.'; return; }
    applied = { draft, at: new Date().toISOString() }; attached();
    $('impactStatus').textContent = 'أُرفقت المعاينة بالمصمم دون تعديل رأس المال أو صفوف الأسهم. استخدم حفظ الشركة للاحتفاظ بها.';
    designer.showAnalysis();
  });
  $('impactCopy').addEventListener('click', async () => {
    const draft = read(), result = math.calculate(input(draft));
    if (errorsFor(draft, result).length) return;
    try { await navigator.clipboard.writeText(brief(draft, result)); $('impactStatus').textContent = 'نُسخ ملخص الأثر.'; }
    catch { $('impactStatus').textContent = 'تعذر النسخ التلقائي. يمكن تحديد النتائج الظاهرة ونسخها يدويًا.'; }
  });
  for (const node of [budget, ownership]) node.addEventListener('click', event => {
    if (event.target.closest('[data-impact-remove]')) { applied = null; attached(); $('impactStatus').textContent = 'أزيلت المعاينة المرفقة. بقيت مدخلات التكليف ورأس المال والأسهم محفوظة في مساحة العمل.'; }
  });
  window.SJSCDealImpact = Object.freeze({ capture: () => ({ version: 1, draft: read(), applied: applied ? JSON.parse(JSON.stringify(applied)) : null }), restore });
  const sources = document.createElement('details');
  sources.innerHTML = '<summary>مصادر المنهج وحدود المعاينة</summary><p>استفدنا من فصل مكونات المقابل في <a href="https://media.mcguirewoods.com/publications/flipbooks/is-deal-survey/" target="_blank" rel="noopener">دراسة McGuireWoods للرعاة المستقلين لعام 2021</a>، ومن مبادئ الإفصاح والحوكمة ومواءمة المصالح لدى <a href="https://ilpa.org/industry-guidance/principles-best-practices/ilpa-principles/" target="_blank" rel="noopener">ILPA</a>. هذه مراجع مهنية أجنبية للاستئناس؛ تراجع آلية المقابل والحقوق وفق النظام السعودي ونطاق التكليف. النسب والمبالغ يحددها المستخدم، وتعالج الضرائب والرسوم والالتزامات الخاصة بالصفقة ضمن دراسة مستقلة ثم تدخل المبالغ المعتمدة في الميزانية.</p>';
  panel.append(sources);
  restore(designer.dealEngineering());
  if (location.hash === '#dealImpact') roles.querySelector('.edu-role-workspace').open = true;
})();
