(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  if (!$('capitalPanel')) return;

  const localKey = "sjsc:company-designs:v2";
  const templates = {
    plain: {
      title: "متى أستخدم «بدون فئة»؟",
      body: "عندما تتساوى الحقوق المتصلة بجميع الأسهم ويكفي الوصف العام للأسهم.",
      name: "بدون اسم فئة",
      scope: "حقوق متساوية",
      warning: "أنشئ فئة عند وجود حق مختلف",
      row: { categoryMode: "none", categoryName: "", rights: "", extra: "", votesPerShare: 1 }
    },
    founders: {
      title: "متى أستخدم فئة مؤسسين ذات تصويت مرجح؟",
      body: "عندما يكون استمرار سيطرة المؤسس على قرارات محددة جزءا من الصفقة، مع إظهار الفرق بين الملكية الاقتصادية وقوة التصويت.",
      name: "فئة المؤسسين",
      scope: "عدد الأصوات، المسائل المحجوزة، تعديل الحقوق",
      warning: "حدد القرارات المشمولة ونطاق قوة التصويت بدقة",
      row: {
        categoryMode: "new",
        categoryName: "فئة المؤسسين",
        rights: "لكل سهم 10 أصوات في قرارات المساهمين، وتصوت الفئة مستقلة على أي تعديل يمس حقوقها أو إصدار فئة أعلى منها أولوية.",
        extra: "يضبط نطاق التصويت والمسائل المحجوزة في النظام الأساس.",
        votesPerShare: 10
      }
    },
    investors: {
      title: "متى أستخدم فئة مستثمرين ذات أولوية مالية؟",
      body: "عندما تتطلب الصفقة ترتيبا ماليا واضحا للمستثمرين عند التوزيعات أو التصفية، دون افتراض عائد مضمون.",
      name: "فئة المستثمرين",
      scope: "نوع الأولوية، حدها، المشاركة بعدها، ترتيب التصفية",
      warning: "استبدل الأقواس بقيم فعلية وبين هل الأولوية تراكمية أو مشاركة",
      row: {
        categoryMode: "new",
        categoryName: "فئة المستثمرين",
        rights: "أولوية في التوزيعات المقررة حتى [المبلغ/النسبة] قبل الفئات الأخرى، ثم المشاركة [من عدمها] وفق النظام الأساس.",
        extra: "تراجع شروط التوزيع والتصفية وعدم ضمان العائد قبل الاعتماد.",
        votesPerShare: 1
      }
    },
    redeemable: {
      title: "متى أستخدم فئة قابلة للاسترداد؟",
      body: "عندما يراد بناء مسار تخارج بشروط محددة للشركة أو حملة الفئة وفق حدث أو تاريخ وسعر محدد أو معادلة قابلة للحساب.",
      name: "فئة قابلة للاسترداد",
      scope: "صاحب الخيار، المحفز، الإشعار، السعر، التمويل",
      warning: "ثبت السعر أو معادلته والمحفز بمعيار واضح",
      row: {
        categoryMode: "new",
        categoryName: "فئة قابلة للاسترداد",
        rights: "للشركة خيار استرداد أسهم الفئة ابتداء من [التاريخ] بسعر [ثابت/معادلة] وبعد إشعار مدته [ ] يوما، وفق النظام وشروط الإصدار.",
        extra: "يحدد مصدر تمويل الاسترداد وأثره على رأس المال والحقوق القائمة.",
        votesPerShare: 1
      }
    }
  };

  let state = {
    id: crypto.randomUUID(),
    companyName: "",
    capital: { currency: "SAR", type: "cash", issued: 100000, inKind: 0, paidFull: true, paid: 100000, authorized: null, bank: "" },
    stocks: [{ id: crypto.randomUUID(), categoryMode: "none", existingCategory: "", categoryName: "", rights: "", extra: "", count: 10000, value: 10, votesPerShare: 1 }],
    attachments: { deposit: false, valuation: false }
  };
  let accountUser = null;
  const files = window.SJSCCompanyFiles;
  let cloudRecords = [], fileBusy = false, editRevision = 0;
  const knownRecords = () => [...localRecords(), ...cloudRecords];
  function fillCompanyName() {
    if (files.cleanName($('companyName').value)) return;
    $('companyName').value = state.companyName = files.uniqueName(knownRecords());
  }
  function fileError(error, asNew = false) {
    const message = error.code === 'company/name-exists' ? 'يوجد ملف شركة بهذا الاسم. اختر اسما آخر، أو افتح الشركة المحفوظة ثم اضغط حفظ.' : (error.message || 'تعذر الحفظ. أعد المحاولة.');
    $(asNew ? 'saveAsError' : 'companyNameError').textContent = message;
    $(asNew ? 'saveAsName' : 'companyName').setAttribute('aria-invalid', 'true');
    toast(message);
  }
  function setFileBusy(value) {
    fileBusy = value;
    ['saveCompany', 'saveCompanyAs', 'newCompany', 'savedCompanies', 'accountSignIn', 'confirmSaveAs', 'cancelSaveAs'].forEach(id => $(id).disabled = value);
  }

  const num = window.SJSCNumbers.parse;
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const fmt = window.SJSCNumbers.format;
  const plain = value => Number.isFinite(num(value)) ? String(num(value)) : "—";
  const symbolHtml = () => state.capital.currency === "SAR" ? '<span class="sar" role="img" aria-label="ريال سعودي"></span>' : '<span aria-label="دولار أمريكي">$</span>';
  const moneyHtml = (value) => `<span class="money">${symbolHtml()}<span>${fmt(value)}</span></span>`;
  const moneyText = (value) => `${fmt(value)} ${state.capital.currency === "SAR" ? "ريال سعودي" : "$"}`;
  const categoryLabel = (row) => row.categoryMode === "none" ? "بدون فئة" : row.categoryMode === "existing" ? (row.existingCategory || "فئة سبق تعريفها") : (row.categoryName || "تعريف فئة جديدة");
  const toast = (message) => {
    const node = $('designerToast');
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('show'), 2600);
  };

  function capitalCalc() {
    const c = state.capital;
    const issued = num(c.issued);
    let inKind = c.type === "inkind" ? issued : c.type === "mixed" ? num(c.inKind) : 0;
    const cash = c.type === "cash" ? issued : Math.max(0, issued - inKind);
    const minimum = c.type === "inkind" ? issued : c.type === "mixed" ? inKind + window.SJSCNumbers.money(cash * 0.25) : window.SJSCNumbers.money(issued * 0.25);
    const paid = c.paidFull || c.type === "inkind" ? issued : num(c.paid);
    const authorized = c.authorized === "" || c.authorized == null ? null : num(c.authorized);
    const errors = [];
    if (![issued, inKind, paid].every(Number.isFinite) || (authorized !== null && !Number.isFinite(authorized))) errors.push("راجع كتابة الأرقام. لا يمكن حساب القيمة غير الواضحة.");
    if (issued < 0.01) errors.push("قيمة رأس المال المصدر المدخلة أقل من 0.01.");
    if (c.type === "mixed" && inKind < 0.01) errors.push("الحد الأدنى للحصة العينية في المختلط 0.01.");
    if (c.type === "mixed" && inKind >= issued) errors.push("في المختلط يجب أن تبقى حصة نقدية موجبة.");
    if (!c.paidFull && c.type !== "inkind" && paid < minimum) errors.push("المدفوع أقل من الحد الأدنى المطلوب.");
    if (!c.paidFull && c.type !== "inkind" && paid >= issued) errors.push("عند اختيار «لا» يجب أن يكون المدفوع أقل من المصدر.");
    return { issued, inKind, cash, minimum, paid, unpaid: Math.max(0, issued - paid), authorized, errors };
  }

  function stockCalc() { return window.SJSCNumbers.stocksCalc(state.stocks); }

  function syncCapitalFromInputs() {
    state.companyName = $('companyName').value.trim();
    state.capital.currency = $('cCurrency').value;
    state.capital.type = $('cType').value;
    state.capital.issued = $('cIssued').value;
    state.capital.inKind = $('cInKind').value;
    state.capital.paidFull = $('cPaidFull').value === "yes";
    state.capital.paid = $('cPaid').value;
    state.capital.authorized = $('cAuthorized').value === "" ? null : $('cAuthorized').value;
    state.capital.bank = $('cBank').value.trim();
    if (state.capital.type === "inkind") {
      state.capital.paidFull = true;
      state.capital.paid = state.capital.issued;
    } else if (state.capital.paidFull) {
      state.capital.paid = state.capital.issued;
    }
  }

  function renderCapital() {
    const c = state.capital;
    const calc = capitalCalc();
    $('currencyChoiceMark').innerHTML = symbolHtml();
    $('inKindField').hidden = c.type === "cash";
    $('cInKind').readOnly = c.type === "inkind";
    if (c.type === "inkind") $('cInKind').value = fmt(calc.issued);
    $('cCash').value = fmt(calc.cash);
    $('cashHelp').textContent = c.type === "mixed" ? "يحسب تلقائيا: المصدر ناقص العيني." : c.type === "inkind" ? "يساوي صفرا في رأس المال العيني فقط." : "يساوي رأس المال المصدر في النقدي فقط.";
    $('cPaidFull').disabled = c.type === "inkind";
    $('cPaidFull').value = c.type === "inkind" || c.paidFull ? "yes" : "no";
    $('cPaid').disabled = c.type === "inkind" || c.paidFull;
    if (document.activeElement !== $('cPaid') || $('cPaid').disabled) $('cPaid').value = Number.isFinite(calc.paid) ? fmt(calc.paid) : window.SJSCNumbers.western(c.paid);
    $('paidHelp').textContent = c.type === "mixed" ? "الحد الأدنى = كامل العيني + 25% من النقدي." : c.type === "cash" ? "عند السداد الجزئي: 25% من المصدر على الأقل وأقل من كامل المصدر." : "العيني فقط مدفوع بالكامل.";
    $('sumIssued').innerHTML = moneyHtml(calc.issued);
    $('sumCash').innerHTML = moneyHtml(calc.cash);
    $('sumInKind').innerHTML = moneyHtml(calc.inKind);
    $('sumMinimum').innerHTML = moneyHtml(calc.minimum);
    $('sumPaid').innerHTML = moneyHtml(calc.paid);
    $('sumUnpaid').innerHTML = moneyHtml(calc.unpaid);
    $('sumPaidRate').textContent = Number.isFinite(calc.issued) && calc.issued > 0 ? `${fmt(calc.paid / calc.issued * 100)}%` : "—";
    $('sumAuthorized').innerHTML = calc.authorized == null ? "غير محدد" : moneyHtml(calc.authorized);
    const explain = $('minimumExplain');
    if (calc.errors.length) {
      explain.className = "explainBox warn";
      explain.textContent = calc.errors.join(" ");
    } else if (c.type === "mixed") {
      explain.className = "explainBox";
      explain.innerHTML = `الحد الأدنى ${moneyHtml(calc.minimum)}: كامل الحصة العينية ${moneyHtml(calc.inKind)} إضافة إلى 25% من الحصة النقدية ${moneyHtml(calc.cash)}.`;
    } else {
      explain.className = "explainBox";
      explain.innerHTML = c.type === "inkind" ? `رأس المال العيني مدفوع بالكامل: ${moneyHtml(calc.issued)}.` : `الحد الأدنى عند السداد الجزئي هو 25% من المصدر: ${moneyHtml(calc.minimum)}.`;
    }
    $('valuationCheck').hidden = calc.inKind <= 0;
  }

  const inputText = value => Number.isFinite(num(value)) ? fmt(value) : window.SJSCNumbers.western(value);
  function linkClasses() {
    state.stocks = window.SJSCNumbers.resolveClasses(state.stocks).map(({ missingCategory, ...row }) => row);
  }
  function definedCategories(currentId) {
    return [...new Set(state.stocks.filter((row) => row.id !== currentId && row.categoryMode === "new" && row.categoryName.trim()).map((row) => row.categoryName.trim()))];
  }

  function rowHtml(row, index) {
    const categories = state.stocks.filter(r => r.id !== row.id && r.categoryMode === "new" && r.categoryName.trim());
    const categoryOptions = categories.map((category) => `<option value="${esc(category.id)}"${row.categoryId === category.id ? " selected" : ""}>${esc(category.categoryName)}</option>`).join("");
    return `<article class="stockRow" data-row="${esc(row.id)}">
      <div class="stockRowHead"><b>صف الأسهم ${fmt(index + 1)}</b>${state.stocks.length > 1 ? '<button class="dangerBtn" type="button" data-remove-row>حذف الصف</button>' : ""}</div>
      <div class="stockFields">
        <label class="stockField full"><span>اسم المساهم أو المجموعة (اختياري)</span><input data-field="holder" maxlength="120" value="${esc(row.holder || '')}" placeholder="مثال: المؤسسون"></label>
        <label class="stockField"><span>نوع السهم في المنصة</span><input type="text" value="سهم عادي" readonly></label>
        <label class="stockField"><span>فئة السهم</span><select data-field="categoryMode"><option value="none"${row.categoryMode === "none" ? " selected" : ""}>بدون فئة</option><option value="existing"${row.categoryMode === "existing" ? " selected" : ""}${categories.length ? "" : " disabled"}>فئة سبق تعريفها</option><option value="new"${row.categoryMode === "new" ? " selected" : ""}>تعريف فئة جديدة</option></select><small class="helper">الفئة تحمل الحقوق الخاصة، ونوع السهم في المنصة «سهم عادي».</small></label>
        ${row.categoryMode === "existing" ? `<label class="stockField"><span>اختر الفئة الموجودة</span><select data-field="categoryId"><option value="">اختر…</option>${categoryOptions}</select></label>` : ""}
        ${row.categoryMode === "new" ? `<label class="stockField"><span>مسمى الفئة</span><input data-field="categoryName" maxlength="255" value="${esc(row.categoryName)}"><small class="charCount">${fmt(row.categoryName.length)} من 255</small></label>
        <label class="stockField wide"><span>الحقوق المتصلة بالفئة <small>(تسميها المنصة حاليا «الحقول المتصلة»)</small></span><textarea data-field="rights" maxlength="255" rows="3">${esc(row.rights)}</textarea><small class="charCount">${fmt(row.rights.length)} من 255</small></label>
        <label class="stockField full"><span>بيان إضافي (اختياري)</span><textarea data-field="extra" rows="2">${esc(row.extra)}</textarea></label>` : ""}
        ${row.categoryMode === "existing" ? `<div class="classLinkNote">تتبع الحقوق والأصوات تعريف الفئة المختارة. <button type="button" class="ghostBtn" data-detach-class>إنشاء فئة مستقلة من هذا الصف</button></div>` : ""}
        <label class="stockField"><span>عدد الأسهم</span><input data-field="count" type="text" inputmode="numeric" value="${esc(inputText(row.count))}"><small class="helper">عدد صحيح موجب.</small></label>
        <label class="stockField"><span>قيمة السهم</span><input data-field="value" type="text" inputmode="decimal" value="${esc(inputText(row.value))}"></label>
        <label class="stockField"><span>أصوات لكل سهم: للتحليل فقط</span><input data-field="votesPerShare" type="text" inputmode="numeric" value="${esc(inputText(row.votesPerShare))}" ${row.categoryMode === "existing" && row.categoryId ? "readonly" : ""}><small class="helper">تستخدم لصياغة الحق، بينما تعرض شاشة الأسهم بيانات الصف والفئة.</small></label>
      </div>
      <div class="rowValue"><span>قيمة أسهم الصف = العدد × قيمة السهم</span><strong>${moneyHtml(num(row.count) * num(row.value))}</strong></div>
    </article>`;
  }

  function renderRows() {
    $('stockRows').innerHTML = state.stocks.map(rowHtml).join("");
  }

  function updateTables() {
    const stocks = stockCalc();
    $('analysisRows').innerHTML = stocks.rows.map((row) => `<tr><td>${esc(categoryLabel(row))}</td><td>${moneyHtml(row.amount)}</td><td>${fmt(row.ownership)}%</td><td>${fmt(row.votesPerShare)}</td><td>${fmt(row.votes)}</td><td>${fmt(row.voteShare)}%</td></tr>`).join("");
    $('analysisBars').innerHTML = stocks.rows.map((row) => `<div><div class="analysisBar"><span>${esc(categoryLabel(row))}: الملكية</span><i><em style="width:${(Number.isFinite(row.ownership) ? Math.min(100, row.ownership) : 0)}%"></em></i><b>${fmt(row.ownership)}%</b></div><div class="analysisBar vote"><span>${esc(categoryLabel(row))}: التصويت</span><i><em style="width:${(Number.isFinite(row.voteShare) ? Math.min(100, row.voteShare) : 0)}%"></em></i><b>${fmt(row.voteShare)}%</b></div></div>`).join("");
    $('platformRows').innerHTML = stocks.rows.map((row) => `<tr><td>سهم عادي</td><td>${esc(categoryLabel(row))}</td><td>${fmt(row.count)}</td><td>${moneyHtml(row.value)}</td><td>${moneyHtml(row.amount)}</td></tr>`).join("");
  }

  function updateMatch() {
    const cap = capitalCalc();
    const stocks = stockCalc();
    const difference = cap.issued - stocks.totalValue;
    const matched = stocks.rows.length > 0 && Math.abs(difference) < 0.005;
    const matchNode = $('matchState');
    matchNode.className = `matchState ${matched ? "ok" : "bad"}`;
    matchNode.innerHTML = matched ? "<b>متطابق حسابيا</b><span>إجمالي قيمة الأسهم يساوي رأس المال المصدر.</span>" : `<b>قيد الاستكمال</b><span>${stocks.invalid ? "صحح بيانات صفوف الأسهم." : `الفرق غير الموزع: ${moneyHtml(difference)}`}</span>`;
    $('railIssued').innerHTML = moneyHtml(cap.issued);
    $('railStocks').innerHTML = moneyHtml(stocks.totalValue);
    $('railCount').textContent = fmt(stocks.totalCount);
    $('railDifference').innerHTML = moneyHtml(difference);
    $('railMinimum').innerHTML = moneyHtml(cap.minimum);
    const warnings = [];
    if (stocks.invalid) warnings.push("ملاحظة: راجع أرقام الأسهم والأصوات وتعريف الفئات. يمكنك المتابعة والحفظ.");
    if (stocks.duplicateNames) warnings.push("يوجد أكثر من تعريف بالاسم نفسه. يمكنك اختيار اسم يميز كل فئة.");
    if (cap.authorized != null && cap.authorized < cap.issued) warnings.push("رأس المال المصرح به أقل من المصدر. يمكنك مراجعة القيمة أو متابعة التصميم.");
    if (cap.errors.length) warnings.push(cap.errors.join(" "));
    $('railWarning').textContent = warnings.join(" ");
    $('railWarning').className = warnings.length ? (cap.errors.length || stocks.invalid ? 'advisory danger' : 'advisory warn') : '';
    document.querySelectorAll('#capitalPanel input[inputmode], #stockRows input[inputmode]').forEach(node => {
      const invalid = node.value !== '' && !Number.isFinite(num(node.value));
      node.setAttribute('aria-invalid', String(invalid));
      const helpId = (node.id || node.closest('[data-row]').dataset.row + '-' + node.dataset.field) + '-numberHelp';
      let help = document.getElementById(helpId);
      if (!help) { help = document.createElement('small'); help.id = helpId; help.className = 'numberHelp'; node.insertAdjacentElement('afterend', help); }
      node.setAttribute('aria-describedby', helpId); help.textContent = invalid ? 'راجع كتابة الرقم. يمكنك المتابعة والحفظ.' : '';
    });
  }

  function updateAll() {
    linkClasses();
    renderCapital();
    updateTables();
    updateMatch();
    document.dispatchEvent(new CustomEvent('sjsc:designer-changed'));
  }

  function setStep(step) {
    document.querySelectorAll('[data-step]').forEach((button) => button.setAttribute('aria-selected', button.dataset.step === step ? 'true' : 'false'));
    document.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== step; });
  }

  function applyTemplate(key) {
    const template = templates[key];
    document.querySelectorAll('[data-template]').forEach((button) => button.classList.toggle('active', button.dataset.template === key));
    $('adviceTitle').textContent = template.title;
    $('adviceBody').textContent = template.body;
    $('adviceName').textContent = template.name;
    $('adviceScope').textContent = template.scope;
    $('adviceWarning').textContent = template.warning;
    const target = state.stocks[state.stocks.length - 1];
    Object.assign(target, template.row);
    renderRows();
    updateAll();
  }

  function snapshot() {
    syncCapitalFromInputs();
    if (window.SJSCDealImpact) state.dealEngineering = window.SJSCDealImpact.capture();
    return JSON.parse(JSON.stringify(state));
  }

  function loadSnapshot(data) {
    state = JSON.parse(JSON.stringify(data));
    state.capital = { currency: 'SAR', type: 'cash', issued: 100000, inKind: 0, paidFull: true, paid: 100000, authorized: null, bank: '', ...state.capital };
    state.companyName = window.SJSCNumbers.western(state.companyName || '');
    state.capital.bank = window.SJSCNumbers.western(state.capital.bank || '');
    state.versions ||= [];
    state.attachments ||= { deposit: false };
    if (!state.id) state.id = crypto.randomUUID();
    state.stocks = (Array.isArray(state.stocks) ? state.stocks : []).map((row) => {
      const normalized = { categoryMode: 'none', categoryName: '', existingCategory: '', rights: '', extra: '', count: '', value: '', votesPerShare: 1, ...row, id: row.id || crypto.randomUUID() };
      for (const key of ['holder','categoryName','existingCategory','rights','extra']) normalized[key] = window.SJSCNumbers.western(normalized[key] || '');
      return normalized;
    });
    $('companyName').value = state.companyName || "";
    $('companyNameError').textContent = '';
    $('companyName').removeAttribute('aria-invalid');
    $('cCurrency').value = state.capital.currency || "SAR";
    $('cType').value = state.capital.type || "cash";
    $('cIssued').value = inputText(state.capital.issued ?? 100000);
    $('cInKind').value = inputText(state.capital.inKind ?? 0);
    $('cPaidFull').value = state.capital.paidFull ? "yes" : "no";
    $('cPaid').value = inputText(state.capital.paid ?? state.capital.issued);
    $('cAuthorized').value = state.capital.authorized == null ? "" : inputText(state.capital.authorized);
    $('cBank').value = state.capital.bank || "";
    $('depositReady').checked = !!state.attachments?.deposit;

    linkClasses();
    renderRows();
    updateAll();
    window.SJSCDealImpact?.restore(state.dealEngineering);
    document.dispatchEvent(new CustomEvent("sjsc:design-loaded"));
  }

  function localRecords() {
    try { const records = JSON.parse(localStorage.getItem(accountUser ? `${localKey}:${accountUser.uid}` : localKey) || "[]"); return Array.isArray(records) ? records : []; } catch { return []; }
  }

  function refreshLocalList() {
    const records = localRecords();
    $('savedCompanies').innerHTML = '<option value="">فتح شركة محفوظة…</option>' + records.map((record) => `<option value="${esc(record.id)}">${esc(record.companyName)}: ${new Date(record.updatedAt).toLocaleDateString('en-GB')}</option>`).join("");
  }

  async function saveCurrent(options = {}) {
    if (fileBusy) return false;
    setFileBusy(true);
    const owner = accountUser?.uid;
    const revision = editRevision;
    const source = options.source || snapshot();
    try {
      // Refresh names before creating or renaming a file; the cloud transaction checks again.
      const signedIn = window.SJSCCloud?.isConfigured && await window.SJSCCloud.user();
      if (signedIn) {
        try { cloudRecords = await window.SJSCCloud.listCompanies(); }
        catch { /* Cached names support offline saves; the cloud write checks names atomically. */ }
      }
      if (accountUser?.uid !== owner) throw new Error('تغير الحساب أثناء الحفظ. أعد المحاولة.');
      const data = files.prepare(source, knownRecords(), { ...options, id: options.asNew ? crypto.randomUUID() : source.id });
      let cloudSaved = false, syncError = null;
      if (signedIn) {
        try {
          await window.SJSCCloud.saveCompany({ id: data.id, companyName: data.companyName, data });
          cloudSaved = true;
        } catch (error) {
          if (error.code === 'company/name-exists' || accountUser?.uid !== owner) throw error;
          syncError = error;
        }
      }
      if (accountUser?.uid !== owner) throw new Error('تغير الحساب أثناء الحفظ. أعد المحاولة.');
      const records = localRecords();
      const index = records.findIndex(record => record.id === data.id);
      const record = { id: data.id, companyName: data.companyName, updatedAt: new Date().toISOString(), data };
      if (index >= 0) records[index] = record; else records.unshift(record);
      try { localStorage.setItem(owner ? `${localKey}:${owner}` : localKey, JSON.stringify(records)); }
      catch (error) { if (!cloudSaved) throw new Error('تعذر الحفظ على الجهاز. تحقق من مساحة التخزين ثم أعد الحفظ.'); }
      if (options.source) loadSnapshot(data);
      else {
        state.id = data.id;
        state.versions = data.versions || [];
        if (editRevision === revision || options.asNew) $('companyName').value = state.companyName = data.companyName;
      }
      $('companyNameError').textContent = '';
      $('companyName').removeAttribute('aria-invalid');
      if (cloudSaved) {
        cloudRecords = [{ id: data.id, company_name: data.companyName }, ...cloudRecords.filter(record => record.id !== data.id)];
        renderCompanyList();
        $('savedCompanies').value = `cloud:${data.id}`;
      } else { refreshLocalList(); $('savedCompanies').value = data.id; }
      $('cloudState').textContent = cloudSaved ? 'محفوظ على الحساب' : syncError ? 'محفوظ على الجهاز، تعذرت المزامنة' : 'محفوظ على الجهاز';
      $('cloudState').classList.toggle('online', cloudSaved);
      document.dispatchEvent(new CustomEvent('sjsc:design-saved', { detail: { changedDuringSave: editRevision !== revision } }));
      toast(cloudSaved ? 'حفظت الشركة في حسابك.' : syncError ? 'حفظت الشركة على الجهاز. أعد الحفظ لمزامنتها مع حسابك.' : 'حفظت الشركة على هذا الجهاز.');
      return true;
    } finally { setFileBusy(false); }
  }

  async function refreshCloudList() {
    cloudRecords = await window.SJSCCloud.listCompanies();
    renderCompanyList();
  }

  function renderCompanyList() {
    const records = cloudRecords;
    const cloudIds = new Set(records.map((record) => record.id));
    $('savedCompanies').innerHTML = '<option value="">فتح شركة محفوظة…</option>' + records.map((record) => `<option value="cloud:${esc(record.id)}">${esc(record.company_name)}: سحابي</option>`).join("") + localRecords().filter((record) => !cloudIds.has(record.id)).map((record) => `<option value="${esc(record.id)}">${esc(record.companyName)}: على الجهاز</option>`).join("");
  }

  function openAccount() {
    $('accountError').textContent = "";
    $('accountOverlay').hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $('authEmail').focus(), 0);
  }

  function closeAccount() {
    $('accountOverlay').hidden = true;
    $('authPassword').value = "";
    document.body.style.overflow = "";
    $('accountSignIn').focus();
  }

  function accountCredentials() {
    return { email: $('authEmail').value.trim(), password: $('authPassword').value };
  }

  function setAccountBusy(busy) {
    ['googleSignIn', 'emailSignIn', 'createAccount', 'resetPassword'].forEach((id) => { $(id).disabled = busy; });
  }

  function showAccountError(message = "") {
    $('accountError').textContent = message;
  }

  function renderAccount(user) {
    cloudRecords = [];
    accountUser = user || null;
    if (!user) {
      $('cloudState').textContent = "حفظ محلي على هذا الجهاز";
      $('cloudState').classList.remove('online');
      $('accountAvatar').textContent = "م";
      $('accountName').textContent = "ملفات الشركات على هذا الجهاز";
      $('storageHelp').textContent = "حفظ محلي";
      $('accountSignIn').textContent = "تسجيل الدخول";
      refreshLocalList();
      return;
    }
    const name = user.displayName || user.email || "حسابك";
    $('cloudState').textContent = "جار مزامنة ملفات الشركات";
    $('cloudState').classList.remove('online');
    $('accountAvatar').innerHTML = user.photoURL ? `<img src="${esc(user.photoURL)}" alt="">` : esc(name.charAt(0));
    $('accountName').textContent = name;
    $('storageHelp').textContent = user.email || "حسابك";
    $('accountSignIn').textContent = "تسجيل الخروج";
  }

  async function handleAuthState(user) {
    renderAccount(user);
    if (!user) return;
    try {
      await window.SJSCCloud.mergeLocalCompanies(localRecords());
      await refreshCloudList();
      $('cloudState').textContent = "تمت المزامنة مع الحساب";
      $('cloudState').classList.add('online');
    } catch (error) {
      console.error(error);
      $('cloudState').textContent = "الحساب متصل والحفظ المحلي يعمل";
      refreshLocalList();
      toast(window.SJSCCloud.errorMessage(error));
    }
  }

  async function prepareAccount() {
    refreshLocalList();
    const shareToken = new URLSearchParams(location.hash.split('?')[1] || location.search).get('share');
    if (shareToken) {
      const shared = await window.SJSCCloud.getSharedDesign(shareToken);
      if (shared) {
        shared.id = crypto.randomUUID();
        shared.companyName = `${shared.companyName || "تصميم مشترك"}: نسخة`;
        loadSnapshot(shared);
        toast("فتحت نسخة مشاركة. احفظها باسمك لإنشاء نسخة مستقلة.");
        history.replaceState(null, '', `${location.pathname}#shareDesigner`);
      }
    }
    if (!window.SJSCCloud?.isConfigured) {
      $('cloudState').textContent = "حفظ محلي على هذا الجهاز";
      return;
    }
    try {
      await window.SJSCCloud.ready();
      window.SJSCCloud.subscribeAuth((user) => handleAuthState(user));
    } catch (error) {
      console.error(error);
      $('cloudState').textContent = "تعذر الاتصال بالسحابة: يعمل الحفظ المحلي";
    }
  }

  function preparedText() {
    const cap = capitalCalc();
    const stocks = stockCalc();
    const lines = [
      `اسم الشركة/المشروع: ${state.companyName || "غير محدد"}`,
      `العملة: ${state.capital.currency === "SAR" ? "ريال سعودي (SAR)" : "دولار أمريكي (USD)"}`,
      `طريقة الوفاء: ${{ cash: "نقدي", inkind: "عيني", mixed: "نقدي وعيني" }[state.capital.type]}`,
      `رأس المال المصدر: ${moneyText(cap.issued)}`,
      `رأس المال النقدي: ${moneyText(cap.cash)}`,
      `رأس المال العيني: ${moneyText(cap.inKind)}`,
      `المدفوع: ${moneyText(cap.paid)}`,
      `الحد الأدنى للمدفوع: ${moneyText(cap.minimum)}`,
      `رأس المال المصرح به: ${cap.authorized == null ? "غير محدد" : moneyText(cap.authorized)}`,
      `اسم البنك: ${state.capital.bank || "غير محدد"}`,
      "",
      ...stocks.rows.flatMap((row, index) => [
        `صف الأسهم ${fmt(index + 1)}${row.holder ? " — " + row.holder : ""}: سهم عادي، ${categoryLabel(row)}`,
        `عدد الأسهم: ${fmt(row.count)} | قيمة السهم: ${moneyText(row.value)} | قيمة الأسهم: ${moneyText(row.amount)}`,
        `الملكية: ${fmt(row.ownership)}% | أصوات السهم: ${fmt(row.votesPerShare)} | مجموع الأصوات: ${fmt(row.votes)} | التصويت: ${fmt(row.voteShare)}%`,
        row.categoryMode === "new" ? `مسمى الفئة: ${row.categoryName}\nالحقوق المتصلة: ${row.rights}\nبيان إضافي: ${row.extra || "غير محدد"}` : ""
      ].filter(Boolean)),
      "",
      `إجمالي عدد الأسهم: ${fmt(stocks.totalCount)}`,
      `إجمالي قيمة الأسهم: ${moneyText(stocks.totalValue)}`,
      `الفرق غير الموزع: ${moneyText(cap.issued - stocks.totalValue)}`
    ];
    lines.push("", "ملاحظات التصميم", $("railWarning").textContent || "لا توجد ملاحظات حسابية حالية.");
    return lines.join("\n");
  }

  function renderPrepared() {
    syncCapitalFromInputs();
    updateAll();
    const cap = capitalCalc();
    const stocks = stockCalc();
    const textField = (label, value) => ({ label, copy: value, html: esc(value) });
    const moneyField = (label, value) => ({ label, copy: plain(value), html: moneyHtml(value) });
    const fields = [
      textField("العملة", state.capital.currency === "SAR" ? "ريال سعودي (SAR)" : "دولار أمريكي (USD)"),
      textField("طريقة الوفاء", { cash: "نقدي", inkind: "عيني", mixed: "نقدي وعيني" }[state.capital.type]),
      moneyField("رأس المال المصدر", cap.issued), moneyField("رأس المال النقدي", cap.cash),
      moneyField("رأس المال العيني", cap.inKind), moneyField("المدفوع", cap.paid),
      cap.authorized == null ? textField("رأس المال المصرح به", "غير محدد") : moneyField("رأس المال المصرح به", cap.authorized),
      textField("اسم البنك", state.capital.bank || "غير محدد")
    ];
    $('capitalCopyFields').innerHTML = fields.map((field) => `<div class="copyField"><small>${esc(field.label)}</small><b>${field.html}</b><button type="button" data-copy="${esc(field.copy)}">نسخ</button></div>`).join("");
    $('preparedRows').innerHTML = stocks.rows.map((row, index) => `<tr><td>${fmt(index + 1)}</td><td>سهم عادي</td><td>${esc(row.categoryMode === "none" ? "بدون فئة" : row.categoryMode === "existing" ? "فئة سبق تعريفها" : "تعريف فئة جديدة")}</td><td>${row.categoryMode === "new" ? `<b>${esc(row.categoryName)}</b><br>${esc(row.rights)}${row.extra ? `<br><small>${esc(row.extra)}</small>` : ""}` : esc(categoryLabel(row))}</td><td>${fmt(row.count)} × ${moneyHtml(row.value)} = ${moneyHtml(row.amount)}</td></tr>`).join("");
    $('platformOutput').hidden = false;
  }


  function exportFileBase() {
    const raw = (state.companyName || "شركة-مساهمة-مبسطة").trim();
    return ("تصميم-" + raw).replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-");
  }

  function exportSymbolHtml(size = 18, color = "#0D3656") {
    if (state.capital.currency === "SAR") {
      const height = Math.round(size * 1.12);
      return `<img src="../assets/riyal-symbol.svg?v=20260923-5" alt="ريال سعودي" width="${size}" height="${height}" crossorigin="anonymous" style="display:inline-block;width:${size}px;height:${height}px;object-fit:contain;vertical-align:-.16em;flex:0 0 auto">`;
    }
    return `<span aria-label="دولار أمريكي" style="font-family:Arial,sans-serif;font-weight:900;color:${color}">$</span>`;
  }

  function exportMoneyHtml(value, size = 18, color = "#0D3656") {
    return `<span style="display:inline-flex;direction:ltr;align-items:center;gap:5px;white-space:nowrap;color:${color}">
      ${exportSymbolHtml(size, color)}
      <span style="font-family:Arial,sans-serif;font-weight:800">${fmt(value)}</span>
    </span>`;
  }

  function exportIssueSummary(cap, stocks, difference) {
    const issues = [];
    if (cap.errors.length) issues.push(cap.errors[0]);
    if (Math.abs(difference) >= 0.005) issues.push(`الفرق غير الموزع: ${fmt(difference)}`);
    if (stocks.invalid) {
      const incompleteCategory = stocks.rows.some((row) =>
        (row.categoryMode === "new" && (!row.categoryName.trim() || !row.rights.trim())) ||
        (row.categoryMode === "existing" && !row.existingCategory.trim())
      );
      issues.push(incompleteCategory ? "استكمل اسم الفئة وحقوقها." : "استكمل بيانات صفوف الأسهم.");
    }
    return issues[0] || "رأس المال والأسهم متطابقان.";
  }

  function buildA4Export() {
    syncCapitalFromInputs();
    updateAll();
    const cap = capitalCalc();
    const stocks = stockCalc();
    const difference = cap.issued - stocks.totalValue;
    const matched = Math.abs(difference) < 0.005 && !stocks.invalid && !cap.errors.length;
    const reviewText = exportIssueSummary(cap, stocks, difference);
    const method = { cash: "نقدي", inkind: "عيني", mixed: "نقدي وعيني" }[state.capital.type];
    const date = new Intl.DateTimeFormat("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
    const rightsRows = stocks.rows.filter((row) => row.categoryMode === "new" && (row.rights.trim() || row.extra.trim()));
    const rowFont = stocks.rows.length > 6 ? 17 : 19;
    const rightsFont = rightsRows.length > 4 ? 17 : 19;

    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:fixed;left:-20000px;top:0;width:1240px;min-height:1700px;pointer-events:none;z-index:-1;";

    const page = document.createElement("article");
    page.style.cssText = "width:1240px;min-height:1700px;box-sizing:border-box;padding:62px 68px 52px;background:#FFFEFC;color:#18232D;font-family:Craft,Tahoma,Arial,sans-serif;direction:rtl;display:flex;flex-direction:column;";

    const summaryCards = [
      ["رأس المال المصدر", exportMoneyHtml(cap.issued, 19)],
      ["النقدي", exportMoneyHtml(cap.cash, 19)],
      ["العيني", exportMoneyHtml(cap.inKind, 19)],
      ["المدفوع", exportMoneyHtml(cap.paid, 19)],
      ["الحد الأدنى للمدفوع", exportMoneyHtml(cap.minimum, 19)],
      ["المصرح به", cap.authorized == null ? "غير محدد" : exportMoneyHtml(cap.authorized, 19)]
    ].map(([label, value]) => `
      <div style="border:1px solid #E3DED6;border-radius:16px;padding:14px 16px;background:#fff;min-height:82px">
        <div style="font-size:16px;color:#5E6C76;margin-bottom:4px">${label}</div>
        <div style="font-size:23px;font-weight:900;color:#0D3656">${value}</div>
      </div>`).join("");

    const stockRows = stocks.rows.map((row) => `
      <tr>
        <td>${row.holder ? esc(row.holder) + '<br>' : ''}${esc(categoryLabel(row))}</td>
        <td style="direction:ltr;text-align:left">${fmt(row.count)}</td>
        <td style="direction:ltr;text-align:left">${exportMoneyHtml(row.value, 15)}</td>
        <td style="direction:ltr;text-align:left">${exportMoneyHtml(row.amount, 15)}</td>
        <td style="direction:ltr;text-align:left">${fmt(row.ownership)}%</td>
        <td style="direction:ltr;text-align:left">${fmt(row.voteShare)}%</td>
      </tr>`).join("");

    const rightsHtml = rightsRows.length ? `
      <section style="margin-top:20px">
        <h2 style="margin:0 0 10px;font-size:24px;color:#0D3656">الحقوق والفئات</h2>
        <div style="display:grid;gap:8px">
          ${rightsRows.map((row) => `
            <div style="display:grid;grid-template-columns:190px 1fr;gap:14px;padding:10px 12px;border:1px solid #E7E0D7;border-radius:13px;background:#fff">
              <b style="font-size:${rightsFont}px;color:#0D3656">${esc(row.categoryName || categoryLabel(row))}</b>
              <span style="font-size:${rightsFont}px;line-height:1.55;color:#44525C;white-space:pre-wrap;overflow-wrap:anywhere">${esc(row.rights)}${row.extra ? '\n' + esc(row.extra) : ''}</span>
            </div>`).join("")}
        </div>
      </section>` : "";

    const valuationLine = cap.inKind > 0 ? "<p>الحصص العينية: راجع تعليمات التقييم في منصة التأسيس.</p>" : "";

    const currencyLine = `<span style="display:inline-flex;direction:ltr;align-items:center;gap:5px">${exportSymbolHtml(15)}<b style="font-family:Arial,sans-serif;color:#0D3656">${state.capital.currency}</b></span>`;

    page.innerHTML = `
      <header style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding-bottom:22px;border-bottom:3px solid #C9853C">
        <div>
          <div style="font-size:16px;font-weight:800;color:#C9853C;margin-bottom:5px">شركة مساهمة مبسطة</div>
          <h1 style="font-size:34px;line-height:1.25;color:#0D3656;margin:0">ملخص تصميم رأس المال وفئات الأسهم</h1>
          <div style="font-size:20px;color:#44525C;margin-top:7px">${esc(state.companyName || "شركة غير مسماة")}</div>
        </div>
        <div style="text-align:left;min-width:250px">
          <img src="https://almohammdin.github.io/emtidad/assets/images/naif-logo-gold.png" alt="" crossorigin="anonymous" style="width:122px;height:auto;object-fit:contain">
          <div style="font-size:14px;color:#6B777F;margin-top:7px">${date}</div>
        </div>
      </header>

      <section style="margin-top:22px">
        <div style="display:flex;justify-content:space-between;gap:18px;align-items:end;margin-bottom:11px">
          <h2 style="margin:0;font-size:25px;color:#0D3656">رأس المال</h2>
          <div style="font-size:16px;color:#5E6C76;display:flex;align-items:center;gap:7px">
            <span>العملة:</span>${currencyLine}<span>· الوفاء:</span><b style="color:#0D3656">${method}</b>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${summaryCards}</div>
      </section>

      <section style="margin-top:22px">
        <div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:9px">
          <h2 style="margin:0;font-size:25px;color:#0D3656">هيكل الأسهم</h2>
          <div style="font-size:16px;color:#5E6C76">إجمالي الأسهم: <b style="color:#0D3656">${fmt(stocks.totalCount)}</b></div>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #DED8D0;border-radius:14px;overflow:hidden;font-size:${rowFont}px">
          <thead><tr style="background:#F2EEE8;color:#0D3656">
            <th style="padding:9px 10px;text-align:right">الفئة</th>
            <th style="padding:9px 10px;text-align:left">عدد الأسهم</th>
            <th style="padding:9px 10px;text-align:left">قيمة السهم</th>
            <th style="padding:9px 10px;text-align:left">قيمة الأسهم</th>
            <th style="padding:9px 10px;text-align:left">الملكية</th>
            <th style="padding:9px 10px;text-align:left">التصويت</th>
          </tr></thead>
          <tbody>${stockRows}</tbody>
        </table>
      </section>

      ${rightsHtml}

      <section style="margin-top:20px;display:grid;grid-template-columns:1.25fr .75fr;gap:12px">
        <div style="border:1px solid #D9E3DD;border-radius:15px;background:#F5FAF7;padding:15px 18px">
          <div style="font-size:17px;color:#5E6C76">مطابقة نموذج التأسيس</div>
          <div style="font-size:25px;font-weight:900;color:${matched ? "#165A3D" : "#8A6640"};margin-top:3px">${matched ? "متطابق حسابيا" : "يحتاج مراجعة"}</div>
          <div style="font-size:16px;color:#44525C;margin-top:5px">${matched ? `الفرق غير الموزع: ${exportMoneyHtml(difference, 14)}` : esc(reviewText)}</div>
        </div>
        <div style="border:1px solid #E3DED6;border-radius:15px;background:#fff;padding:12px 16px;font-size:16px;color:#44525C">
          <div style="display:flex;justify-content:space-between;gap:16px;padding:3px 0">
            <span>شهادة إيداع رأس المال</span><b style="color:${state.attachments.deposit ? "#165A3D" : "#8A6640"}">${state.attachments.deposit ? "جاهزة" : "غير محددة كجاهزة"}</b>
          </div>
          ${valuationLine}
        </div>
      </section>

      <footer style="margin-top:auto;padding-top:17px;border-top:1px solid #DED8D0;display:flex;justify-content:space-between;gap:20px;align-items:center;color:#6B777F;font-size:14px">
        <span>مصمم شركة المساهمة المبسطة</span>
        <span style="direction:ltr">almohammdin</span>
      </footer>`;

    page.querySelectorAll("th,td").forEach((cell) => {
      cell.style.borderBottom = "1px solid #E7E0D7";
      if (!cell.style.padding) cell.style.padding = "9px 10px";
    });
    if ($('railWarning').textContent) { const note = document.createElement("p"); note.style.cssText = "padding:14px;background:#fff2d7;color:#754d00"; note.textContent = $('railWarning').textContent; page.append(note); }
    host.appendChild(page);
    document.body.appendChild(host);
    return { host, page, fileBase: exportFileBase() };
  }

  async function renderA4Canvas() {
    if (typeof html2canvas === "undefined") throw new Error("تعذر تحميل أداة تصدير الصورة.");
    const built = buildA4Export();
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const images = [...built.page.querySelectorAll("img")];
      await Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; })));
      const canvas = await html2canvas(built.page, {
        backgroundColor: "#FFFEFC",
        scale: 2,
        useCORS: true,
        logging: false,
        width: 1240,
        height: Math.ceil(built.page.getBoundingClientRect().height),
        windowWidth: 1240,
        windowHeight: 1754
      });
      return { canvas, fileBase: built.fileBase };
    } finally {
      built.host.remove();
    }
  }

  function dataUrlBytes(dataUrl) {
    const base64 = dataUrl.split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function legacyA4PdfBlobFromCanvas(canvas) {
    const jpg = dataUrlBytes(canvas.toDataURL("image/jpeg", 0.96));
    const encoder = new TextEncoder();
    const chunks = [];
    const offsets = [];
    let length = 0;
    const pushBytes = (bytes) => { chunks.push(bytes); length += bytes.length; };
    const pushText = (text) => pushBytes(encoder.encode(text));
    const objectStart = (number) => { offsets[number] = length; pushText(`${number} 0 obj\n`); };
    const objectEnd = () => pushText("endobj\n");

    pushText("%PDF-1.4\n%SJSC\n");

    objectStart(1);
    pushText("<< /Type /Catalog /Pages 2 0 R >>\n");
    objectEnd();

    objectStart(2);
    pushText("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n");
    objectEnd();

    objectStart(3);
    pushText("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\n");
    objectEnd();

    objectStart(4);
    pushText(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);
    pushBytes(jpg);
    pushText("\nendstream\n");
    objectEnd();

    const content = "q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n";
    const contentBytes = encoder.encode(content);
    objectStart(5);
    pushText(`<< /Length ${contentBytes.length} >>\nstream\n`);
    pushBytes(contentBytes);
    pushText("endstream\n");
    objectEnd();

    const xrefOffset = length;
    pushText("xref\n0 6\n");
    pushText("0000000000 65535 f \n");
    for (let i = 1; i <= 5; i += 1) pushText(String(offsets[i]).padStart(10, "0") + " 00000 n \n");
    pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    return new Blob(chunks, { type: "application/pdf" });
  }

  function downloadBlob(blob, filename, previewWindow = null) {
    const url = URL.createObjectURL(blob);
    if (previewWindow && !previewWindow.closed) {
      previewWindow.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 120000);
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  }

  async function exportA4(format, button) {
    const old = button.textContent;
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    let pdfPreview = null;
    if (format === "pdf" && isiOS) {
      pdfPreview = window.open("", "_blank");
      if (pdfPreview) {
        pdfPreview.document.write('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>PDF</title><body style="font-family:Arial,sans-serif;padding:30px;text-align:center">جاري تجهيز PDF…</body>');
        pdfPreview.document.close();
      }
    }
    button.disabled = true;
    button.textContent = "جاري التجهيز";
    try {
      const { canvas, fileBase } = await renderA4Canvas();
      if (format === "png") {
        const link = document.createElement("a");
        link.download = fileBase + ".png";
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast("تم تجهيز صورة الملخص كاملة.");
      } else {
        let blob;
        const JsPDF = window.jspdf?.jsPDF;
        if (JsPDF) {
          const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
          const pages = window.SJSCExport.sliceCanvas(canvas);
          pages.forEach((page, index) => { if (index) doc.addPage(); doc.addImage(page.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, 210, 297, undefined, "FAST"); });
          blob = doc.output("blob");
        } else {
          blob = window.SJSCExport.pdfFromCanvas(canvas);
        }
        downloadBlob(blob, fileBase + ".pdf", pdfPreview);
        toast(isiOS ? "تم فتح PDF ويمكن حفظه أو مشاركته." : "تم تجهيز PDF A4.");
      }
    } catch (error) {
      console.error(error);
      if (pdfPreview && !pdfPreview.closed) {
        pdfPreview.document.body.innerHTML = '<div style="font-family:Arial,sans-serif;padding:30px;text-align:center;direction:rtl"><b>تعذر فتح PDF.</b><br><br><span>ارجع للصفحة وجرب مرة أخرى.</span></div>';
      }
      toast(error.message || "تعذر التصدير.");
    } finally {
      button.disabled = false;
      button.textContent = old;
    }
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const area = document.createElement('textarea');
      area.value = text; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
    }
    toast("تم النسخ.");
  }

  document.querySelectorAll('[data-step]').forEach((button) => button.addEventListener('click', () => setStep(button.dataset.step)));
  document.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => setStep(button.dataset.next)));
  document.querySelectorAll('[data-template]').forEach((button) => button.addEventListener('click', () => applyTemplate(button.dataset.template)));

  ['cCurrency','cType','cIssued','cInKind','cPaidFull','cPaid','cAuthorized','cBank','companyName'].forEach((id) => $(id).addEventListener('input', () => { syncCapitalFromInputs(); updateAll(); }));
  ['cCurrency','cType','cPaidFull'].forEach((id) => $(id).addEventListener('change', () => { syncCapitalFromInputs(); updateAll(); }));
  ['cIssued','cInKind','cPaid','cAuthorized'].forEach((id) => $(id).addEventListener('blur', () => {
    if (id === 'cAuthorized' && $(id).value.trim() === '') return;
    if (Number.isFinite(num($(id).value))) $(id).value = fmt($(id).value);
  }));
  $('stockRows').addEventListener('focusout', (event) => {
    if (['count','value','votesPerShare'].includes(event.target.dataset.field)) if (Number.isFinite(num(event.target.value))) event.target.value = fmt(event.target.value);
  });
  $('depositReady').addEventListener('change', () => { state.attachments.deposit = $('depositReady').checked; });


  $('stockRows').addEventListener('input', (event) => {
    const rowNode = event.target.closest('[data-row]');
    const field = event.target.dataset.field;
    if (!rowNode || !field) return;
    const row = state.stocks.find((item) => item.id === rowNode.dataset.row);
    row[field] = event.target.value;
    const count = event.target.parentElement.querySelector('.charCount');
    if (count) count.textContent = `${fmt(event.target.value.length)} من 255`;
    const valueNode = rowNode.querySelector('.rowValue strong');
    if (valueNode) valueNode.innerHTML = moneyHtml(num(row.count) * num(row.value));
    linkClasses();
    state.stocks.filter(r => r.categoryMode === 'existing').forEach(r => {
      const node = [...$('stockRows').querySelectorAll('[data-row]')].find(n => n.dataset.row === r.id);
      if (node) node.querySelector('[data-field="votesPerShare"]').value = inputText(r.votesPerShare);
    });
    updateTables(); updateMatch();
    document.dispatchEvent(new CustomEvent('sjsc:designer-changed'));
  });
  $('stockRows').addEventListener('change', (event) => {
    const rowNode = event.target.closest('[data-row]');
    const field = event.target.dataset.field;
    if (!rowNode || !field) return;
    const row = state.stocks.find((item) => item.id === rowNode.dataset.row);
    row[field] = event.target.value;
    if (field === 'categoryMode' && row.categoryMode !== 'existing') delete row.categoryId;
    linkClasses();
    if (['categoryMode', 'categoryId', 'categoryName'].includes(field)) renderRows();
    updateAll();
  });
  $('stockRows').addEventListener('click', (event) => {
    const detach = event.target.closest('[data-detach-class]');
    if (detach) {
      const row = state.stocks.find(r => r.id === detach.closest('[data-row]').dataset.row);
      row.categoryMode = 'new'; row.categoryName = (row.existingCategory || 'فئة') + ' مستقلة'; delete row.categoryId;
      renderRows(); updateAll(); return;
    }
    const remove = event.target.closest('[data-remove-row]');
    if (!remove) return;
    const id = remove.closest('[data-row]').dataset.row;
    state.stocks = state.stocks.filter((row) => row.id !== id);
    renderRows(); updateAll();
  });
  $('addStockRow').addEventListener('click', () => {
    state.stocks.push({ id: crypto.randomUUID(), categoryMode: "none", existingCategory: "", categoryName: "", rights: "", extra: "", count: 0, value: 10, votesPerShare: 1 });
    renderRows(); updateAll();
  });

  $('preparePlatform').addEventListener('click', renderPrepared);
  $('copyAllPlatform').addEventListener('click', () => copyText(preparedText()));
  $('capitalCopyFields').addEventListener('click', (event) => { const button = event.target.closest('[data-copy]'); if (button) copyText(button.dataset.copy); });
  let saveAsSource = null;
  function openSaveAs(source = null) {
    if (fileBusy) return;
    saveAsSource = source;
    const name = (source || snapshot()).companyName;
    $('saveAsName').value = files.uniqueName([...knownRecords(), { id: state.id, companyName: name }], name || 'شركة جديدة');
    $('saveAsError').textContent = '';
    $('saveAsName').removeAttribute('aria-invalid');
    $('saveAsDialog').showModal();
    $('saveAsName').focus();
    $('saveAsName').select();
  }
  $('saveCompany').addEventListener('click', () => saveCurrent().catch(error => fileError(error)));
  $('saveCompanyAs').addEventListener('click', () => openSaveAs());
  $('cancelSaveAs').addEventListener('click', () => $('saveAsDialog').close());
  $('saveAsDialog').addEventListener('cancel', event => { if (fileBusy) event.preventDefault(); });
  $('saveAsName').addEventListener('input', () => { $('saveAsError').textContent = ''; $('saveAsName').removeAttribute('aria-invalid'); });
  $('saveAsForm').addEventListener('submit', async event => {
    event.preventDefault();
    try {
      if (await saveCurrent({ asNew: true, name: $('saveAsName').value, source: saveAsSource })) $('saveAsDialog').close();
    } catch (error) { fileError(error, true); }
  });
  $('companyName').addEventListener('blur', fillCompanyName);
  $('shareDesigner').addEventListener('input', event => {
    if (event.target.closest('#saveAsDialog')) return;
    editRevision++;
    if (event.target.id !== 'companyName') fillCompanyName();
    else { $('companyNameError').textContent = ''; $('companyName').removeAttribute('aria-invalid'); }
  });
  $('newCompany').addEventListener('click', () => {
    loadSnapshot({ id: crypto.randomUUID(), companyName: "", capital: { currency: "SAR", type: "cash", issued: 100000, inKind: 0, paidFull: true, paid: 100000, authorized: null, bank: "" }, stocks: [{ id: crypto.randomUUID(), categoryMode: "none", existingCategory: "", categoryName: "", rights: "", extra: "", count: 10000, value: 10, votesPerShare: 1 }], attachments: { deposit: false, valuation: false } });
    $('savedCompanies').value = "";
    fillCompanyName();
    toast("بدأ نموذج شركة جديد مع إبقاء النماذج المحفوظة.");
  });
  $('savedCompanies').addEventListener('change', async () => {
    const value = $('savedCompanies').value;
    if (!value) return;
    setFileBusy(true);
    try {
    if (value.startsWith('cloud:')) {
      const record = await window.SJSCCloud.loadCompany(value.slice(6));
      const records = localRecords().filter((item) => item.id !== record.id);
      records.unshift({ id: record.id, companyName: record.company_name, updatedAt: record.updated_at, data: record.data });
      localStorage.setItem(`${localKey}:${accountUser.uid}`, JSON.stringify(records));
      loadSnapshot(record.data);
    } else {
      const record = localRecords().find((item) => item.id === value);
      if (record) loadSnapshot(record.data);
    }
    toast("فتحت الشركة المحفوظة.");
    } catch (error) { toast(window.SJSCCloud.errorMessage(error)); }
    finally { setFileBusy(false); }
  });
  $('accountSignIn').addEventListener('click', async () => {
    if (!accountUser) return openAccount();
    try { await window.SJSCCloud.signOut(); $('newCompany').click(); toast("تم تسجيل الخروج."); }
    catch (error) { toast(window.SJSCCloud.errorMessage(error)); }
  });
  $('accountClose').addEventListener('click', closeAccount);
  $('accountOverlay').addEventListener('click', (event) => { if (event.target === $('accountOverlay')) closeAccount(); });
  document.addEventListener('keydown', (event) => {
    if ($('accountOverlay').hidden) return;
    if (event.key === 'Escape') closeAccount();
    if (event.key === 'Tab') {
      const nodes = [...$('accountOverlay').querySelectorAll('button:not(:disabled), input')];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  async function runAccountAction(action, reset = false) {
    showAccountError(); setAccountBusy(true);
    try {
      await action();
      if (reset) showAccountError("أرسلنا تعليمات استعادة كلمة المرور إلى البريد إذا كان مرتبطا بحساب.");
      else { closeAccount(); toast("تم تسجيل الدخول إلى حسابك."); }
    } catch (error) { showAccountError(window.SJSCCloud.errorMessage(error)); }
    finally { setAccountBusy(false); }
  }
  $('googleSignIn').addEventListener('click', () => runAccountAction(() => window.SJSCCloud.signInWithGoogle()));
  $('emailAuthForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!$('emailAuthForm').reportValidity()) return;
    const { email, password } = accountCredentials();
    runAccountAction(() => window.SJSCCloud.signInWithEmail(email, password));
  });
  $('createAccount').addEventListener('click', () => {
    if (!$('emailAuthForm').reportValidity()) return;
    const { email, password } = accountCredentials();
    runAccountAction(() => window.SJSCCloud.createAccount(email, password));
  });
  $('resetPassword').addEventListener('click', () => {
    if (!$('authEmail').reportValidity()) return;
    runAccountAction(() => window.SJSCCloud.resetPassword(accountCredentials().email), true);
  });
  $('exportA4Png')?.addEventListener('click', () => exportA4("png", $('exportA4Png')));
  $('exportA4Pdf')?.addEventListener('click', () => exportA4("pdf", $('exportA4Pdf')));

  $('shareCompany').addEventListener('click', async () => {
    if (!window.SJSCCloud) return;
    const data = window.SJSCNumbers.shareSnapshot(snapshot(), $("shareScope").value);
    const url = await window.SJSCCloud.createShare(state.id, data);
    await copyText(url);
    toast("أنشئ رابط مشاركة ونسخ إلى الحافظة.");
  });

  // Scenario data is stored alongside the design, never inserted into legal capital or class totals.
  window.SJSCDesigner = Object.freeze({
    snapshot, load: loadSnapshot, analysis: stockCalc, capital: capitalCalc, save: saveCurrent, saveAs: openSaveAs,
    setPartnership: value => { state.partnership = value; },
    text: preparedText, notify: toast,
    context: () => ({ id: state.id, companyName: state.companyName, currency: state.capital.currency,
      cashPaid: Math.max(0, capitalCalc().paid - capitalCalc().inKind), capitalValid: capitalCalc().errors.length === 0 }),
    dealEngineering: () => state.dealEngineering ? JSON.parse(JSON.stringify(state.dealEngineering)) : null,
    showAnalysis: () => { setStep('analysis'); $('shareDesigner').scrollIntoView({ behavior: 'auto' }); }
  });
  loadSnapshot(state);
  prepareAccount();
})();

