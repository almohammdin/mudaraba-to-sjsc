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
      body: "عندما يكون استمرار سيطرة المؤسس على قرارات محددة جزءًا من الصفقة، مع إظهار الفرق بين الملكية الاقتصادية وقوة التصويت.",
      name: "فئة المؤسسين",
      scope: "عدد الأصوات، المسائل المحجوزة، تعديل الحقوق",
      warning: "حدّد القرارات المشمولة ونطاق قوة التصويت بدقة",
      row: {
        categoryMode: "new",
        categoryName: "فئة المؤسسين",
        rights: "لكل سهم 10 أصوات في قرارات المساهمين، وتصوّت الفئة مستقلة على أي تعديل يمس حقوقها أو إصدار فئة أعلى منها أولوية.",
        extra: "يضبط نطاق التصويت والمسائل المحجوزة في النظام الأساس.",
        votesPerShare: 10
      }
    },
    investors: {
      title: "متى أستخدم فئة مستثمرين ذات أولوية مالية؟",
      body: "عندما تتطلب الصفقة ترتيبًا ماليًا واضحًا للمستثمرين عند التوزيعات أو التصفية، دون افتراض عائد مضمون.",
      name: "فئة المستثمرين",
      scope: "نوع الأولوية، حدها، المشاركة بعدها، ترتيب التصفية",
      warning: "استبدل الأقواس بقيم فعلية وبيّن هل الأولوية تراكمية أو مشاركة",
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
      body: "عندما يُراد بناء مسار خروج مضبوط للشركة أو حملة الفئة وفق حدث أو تاريخ وسعر محدد أو معادلة قابلة للحساب.",
      name: "فئة قابلة للاسترداد",
      scope: "صاحب الخيار، المحفز، الإشعار، السعر، التمويل",
      warning: "ثبّت السعر أو معادلته والمحفز بمعيار واضح",
      row: {
        categoryMode: "new",
        categoryName: "فئة قابلة للاسترداد",
        rights: "للشركة خيار استرداد أسهم الفئة ابتداءً من [التاريخ] بسعر [ثابت/معادلة] وبعد إشعار مدته [ ] يومًا، وفق النظام وشروط الإصدار.",
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

  const num = (value) => {
    const normalized = String(value ?? "")
      .replace(/[,\s]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const fmt = (value) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num(value));
  const plain = (value) => new Intl.NumberFormat("en-US", { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num(value));
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
    const minimum = c.type === "inkind" ? issued : c.type === "mixed" ? inKind + cash * 0.25 : issued * 0.25;
    const paid = c.paidFull || c.type === "inkind" ? issued : num(c.paid);
    const authorized = c.authorized === "" || c.authorized == null ? null : num(c.authorized);
    const errors = [];
    if (issued < 0.01) errors.push("الحد الأدنى لرأس المال المصدر 0.01.");
    if (c.type === "mixed" && inKind < 0.01) errors.push("الحد الأدنى للحصة العينية في المختلط 0.01.");
    if (c.type === "mixed" && inKind >= issued) errors.push("في المختلط يجب أن تبقى حصة نقدية موجبة.");
    if (!c.paidFull && c.type !== "inkind" && paid < minimum) errors.push("المدفوع أقل من الحد الأدنى المطلوب.");
    if (!c.paidFull && c.type !== "inkind" && paid >= issued) errors.push("عند اختيار «لا» يجب أن يكون المدفوع أقل من المصدر.");
    return { issued, inKind, cash, minimum, paid, unpaid: Math.max(0, issued - paid), authorized, errors };
  }

  function stockCalc() {
    const rows = state.stocks.map((row) => {
      const count = num(row.count);
      const value = num(row.value);
      const amount = count * value;
      const votes = count * Math.max(0, num(row.votesPerShare));
      return { ...row, count, value, amount, votes };
    });
    const totalValue = rows.reduce((sum, row) => sum + row.amount, 0);
    const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
    const totalVotes = rows.reduce((sum, row) => sum + row.votes, 0);
    rows.forEach((row) => {
      row.ownership = totalValue ? row.amount / totalValue * 100 : 0;
      row.voteShare = totalVotes ? row.votes / totalVotes * 100 : 0;
    });
    const invalid = rows.some((row) => row.count <= 0 || !Number.isInteger(row.count) || row.value <= 0 || (row.categoryMode === "existing" && !row.existingCategory.trim()) || (row.categoryMode === "new" && (!row.categoryName.trim() || !row.rights.trim())));
    return { rows, totalValue, totalCount, totalVotes, invalid };
  }

  function syncCapitalFromInputs() {
    state.companyName = $('companyName').value.trim();
    state.capital.currency = $('cCurrency').value;
    state.capital.type = $('cType').value;
    state.capital.issued = num($('cIssued').value);
    state.capital.inKind = num($('cInKind').value);
    state.capital.paidFull = $('cPaidFull').value === "yes";
    state.capital.paid = num($('cPaid').value);
    state.capital.authorized = $('cAuthorized').value === "" ? null : num($('cAuthorized').value);
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
    $('currencyMark').innerHTML = symbolHtml();
    $('currencyChoiceMark').innerHTML = symbolHtml();
    $('currencyMarkLabel').textContent = c.currency === "SAR" ? "رمز الريال السعودي المستخدم في جميع النتائج" : "رمز الدولار المستخدم في جميع النتائج";
    $('inKindField').hidden = c.type === "cash";
    $('cInKind').readOnly = c.type === "inkind";
    if (c.type === "inkind") $('cInKind').value = fmt(calc.issued);
    $('cCash').value = fmt(calc.cash);
    $('cashHelp').textContent = c.type === "mixed" ? "يُحسب تلقائيًا: المصدر ناقص العيني." : c.type === "inkind" ? "يساوي صفرًا في رأس المال العيني فقط." : "يساوي رأس المال المصدر في النقدي فقط.";
    $('cPaidFull').disabled = c.type === "inkind";
    $('cPaidFull').value = c.type === "inkind" || c.paidFull ? "yes" : "no";
    $('cPaid').disabled = c.type === "inkind" || c.paidFull;
    if (document.activeElement !== $('cPaid') || $('cPaid').disabled) $('cPaid').value = fmt(calc.paid);
    $('paidHelp').textContent = c.type === "mixed" ? "الحد الأدنى = كامل العيني + 25% من النقدي." : c.type === "cash" ? "عند السداد الجزئي: 25% من المصدر على الأقل وأقل من كامل المصدر." : "العيني فقط مدفوع بالكامل.";
    $('sumIssued').innerHTML = moneyHtml(calc.issued);
    $('sumCash').innerHTML = moneyHtml(calc.cash);
    $('sumInKind').innerHTML = moneyHtml(calc.inKind);
    $('sumMinimum').innerHTML = moneyHtml(calc.minimum);
    $('sumPaid').innerHTML = moneyHtml(calc.paid);
    $('sumUnpaid').innerHTML = moneyHtml(calc.unpaid);
    $('sumPaidRate').textContent = calc.issued ? `${fmt(calc.paid / calc.issued * 100)}%` : "0%";
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

  function definedCategories(currentId) {
    return [...new Set(state.stocks.filter((row) => row.id !== currentId && row.categoryMode === "new" && row.categoryName.trim()).map((row) => row.categoryName.trim()))];
  }

  function rowHtml(row, index) {
    const categories = definedCategories(row.id);
    const categoryOptions = categories.map((name) => `<option value="${esc(name)}"${row.existingCategory === name ? " selected" : ""}>${esc(name)}</option>`).join("");
    return `<article class="stockRow" data-row="${esc(row.id)}">
      <div class="stockRowHead"><b>صف الأسهم ${fmt(index + 1)}</b>${state.stocks.length > 1 ? '<button class="dangerBtn" type="button" data-remove-row>حذف الصف</button>' : ""}</div>
      <div class="stockFields">
        <label class="stockField"><span>نوع السهم في المنصة</span><input type="text" value="سهم عادي" readonly><small class="helper">القيمة المستخدمة في مسار التأسيس المرجعي للأداة.</small></label>
        <label class="stockField"><span>فئة السهم</span><select data-field="categoryMode"><option value="none"${row.categoryMode === "none" ? " selected" : ""}>بدون فئة</option><option value="existing"${row.categoryMode === "existing" ? " selected" : ""}${categories.length ? "" : " disabled"}>فئة سبق تعريفها</option><option value="new"${row.categoryMode === "new" ? " selected" : ""}>تعريف فئة جديدة</option></select><small class="helper">الفئة تحمل الحقوق الخاصة، ونوع السهم في المنصة «سهم عادي».</small></label>
        ${row.categoryMode === "existing" ? `<label class="stockField"><span>اختر الفئة الموجودة</span><select data-field="existingCategory"><option value="">اختر…</option>${categoryOptions}</select></label>` : ""}
        ${row.categoryMode === "new" ? `<label class="stockField"><span>مسمى الفئة</span><input data-field="categoryName" maxlength="255" value="${esc(row.categoryName)}"><small class="charCount">${fmt(row.categoryName.length)} من 255</small></label>
        <label class="stockField wide"><span>الحقوق المتصلة بالفئة <small>(تسميها المنصة حاليًا «الحقول المتصلة»)</small></span><textarea data-field="rights" maxlength="255" rows="3">${esc(row.rights)}</textarea><small class="charCount">${fmt(row.rights.length)} من 255</small></label>
        <label class="stockField full"><span>بيان إضافي (اختياري)</span><textarea data-field="extra" rows="2">${esc(row.extra)}</textarea></label>` : ""}
        <label class="stockField"><span>عدد الأسهم</span><input data-field="count" type="text" inputmode="numeric" value="${fmt(row.count)}"><small class="helper">عدد صحيح موجب.</small></label>
        <label class="stockField"><span>قيمة السهم</span><input data-field="value" type="text" inputmode="decimal" value="${fmt(row.value)}"></label>
        <label class="stockField"><span>أصوات لكل سهم: للتحليل فقط</span><input data-field="votesPerShare" type="text" inputmode="numeric" value="${fmt(row.votesPerShare)}"><small class="helper">تُستخدم لصياغة الحق، بينما تعرض شاشة الأسهم بيانات الصف والفئة.</small></label>
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
    $('analysisBars').innerHTML = stocks.rows.map((row) => `<div><div class="analysisBar"><span>${esc(categoryLabel(row))}: الملكية</span><i><em style="width:${Math.min(100, row.ownership)}%"></em></i><b>${fmt(row.ownership)}%</b></div><div class="analysisBar vote"><span>${esc(categoryLabel(row))}: التصويت</span><i><em style="width:${Math.min(100, row.voteShare)}%"></em></i><b>${fmt(row.voteShare)}%</b></div></div>`).join("");
    $('platformRows').innerHTML = stocks.rows.map((row) => `<tr><td>سهم عادي</td><td>${esc(categoryLabel(row))}</td><td>${fmt(row.count)}</td><td>${moneyHtml(row.value)}</td><td>${moneyHtml(row.amount)}</td></tr>`).join("");
  }

  function updateMatch() {
    const cap = capitalCalc();
    const stocks = stockCalc();
    const difference = cap.issued - stocks.totalValue;
    const matched = !cap.errors.length && !stocks.invalid && stocks.rows.length > 0 && Math.abs(difference) < 0.005;
    const matchNode = $('matchState');
    matchNode.className = `matchState ${matched ? "ok" : "bad"}`;
    matchNode.innerHTML = matched ? "<b>متطابق حسابيًا</b><span>إجمالي قيمة الأسهم يساوي رأس المال المصدر.</span>" : `<b>قيد الاستكمال</b><span>${stocks.invalid ? "صحح بيانات صفوف الأسهم." : `الفرق غير الموزع: ${moneyHtml(difference)}`}</span>`;
    $('railIssued').innerHTML = moneyHtml(cap.issued);
    $('railStocks').innerHTML = moneyHtml(stocks.totalValue);
    $('railCount').textContent = fmt(stocks.totalCount);
    $('railDifference').innerHTML = moneyHtml(difference);
    $('railMinimum').innerHTML = moneyHtml(cap.minimum);
    const warnings = [];
    if (cap.authorized != null && cap.authorized < cap.issued) warnings.push("تنبيه استرشادي: رأس المال المصرح به أقل من المصدر. راجع القيمة قبل نقلها إلى المنصة.");
    if (cap.errors.length) warnings.push(cap.errors.join(" "));
    $('railWarning').textContent = warnings.join(" ");
  }

  function updateAll() {
    renderCapital();
    updateTables();
    updateMatch();
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
    return JSON.parse(JSON.stringify(state));
  }

  function loadSnapshot(data) {
    state = data;
    if (!state.id) state.id = crypto.randomUUID();
    state.stocks = (state.stocks || []).map((row) => ({ ...row, id: row.id || crypto.randomUUID() }));
    $('companyName').value = state.companyName || "";
    $('cCurrency').value = state.capital.currency || "SAR";
    $('cType').value = state.capital.type || "cash";
    $('cIssued').value = fmt(state.capital.issued ?? 100000);
    $('cInKind').value = fmt(state.capital.inKind ?? 0);
    $('cPaidFull').value = state.capital.paidFull ? "yes" : "no";
    $('cPaid').value = fmt(state.capital.paid ?? state.capital.issued);
    $('cAuthorized').value = state.capital.authorized == null ? "" : fmt(state.capital.authorized);
    $('cBank').value = state.capital.bank || "";
    $('depositReady').checked = !!state.attachments?.deposit;
    $('valuationReady').checked = !!state.attachments?.valuation;
    renderRows();
    updateAll();
  }

  function localRecords() {
    try { const records = JSON.parse(localStorage.getItem(accountUser ? `${localKey}:${accountUser.uid}` : localKey) || "[]"); return Array.isArray(records) ? records : []; } catch { return []; }
  }

  function refreshLocalList() {
    const records = localRecords();
    $('savedCompanies').innerHTML = '<option value="">فتح شركة محفوظة…</option>' + records.map((record) => `<option value="${esc(record.id)}">${esc(record.companyName)}: ${new Date(record.updatedAt).toLocaleDateString('en-GB')}</option>`).join("");
  }

  async function saveCurrent() {
    const data = snapshot();
    if (!data.companyName) return toast("اكتب اسم الشركة أو المشروع قبل الحفظ.");
    const records = localRecords();
    const index = records.findIndex((record) => record.id === data.id);
    const record = { id: data.id, companyName: data.companyName, updatedAt: new Date().toISOString(), data };
    if (index >= 0) records[index] = record; else records.unshift(record);
    localStorage.setItem(accountUser ? `${localKey}:${accountUser.uid}` : localKey, JSON.stringify(records));
    refreshLocalList();
    $('savedCompanies').value = data.id;
    if (window.SJSCCloud?.isConfigured && await window.SJSCCloud.user()) {
      try {
        await window.SJSCCloud.saveCompany({ id: data.id, companyName: data.companyName, data });
        $('cloudState').textContent = "محفوظ على الحساب";
        $('cloudState').classList.add('online');
        toast("حُفظت الشركة محليا وفي حسابك السحابي.");
        await refreshCloudList();
        $('savedCompanies').value = `cloud:${data.id}`;
      } catch (error) {
        console.error(error);
        $('cloudState').textContent = "محفوظ على الجهاز، تعذرت المزامنة";
        $('cloudState').classList.remove('online');
        toast(`حُفظت محليا. ${window.SJSCCloud.errorMessage(error)}`);
      }
      return;
    }
    toast("حُفظت الشركة محليًا على هذا الجهاز فقط.");
  }

  async function refreshCloudList() {
    const records = await window.SJSCCloud.listCompanies();
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
        toast("فُتحت نسخة مشاركة. احفظها باسمك لإنشاء نسخة مستقلة.");
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
        `صف الأسهم ${fmt(index + 1)}: سهم عادي، ${categoryLabel(row)}`,
        `عدد الأسهم: ${fmt(row.count)} | قيمة السهم: ${moneyText(row.value)} | قيمة الأسهم: ${moneyText(row.amount)}`,
        row.categoryMode === "new" ? `مسمى الفئة: ${row.categoryName}\nالحقوق المتصلة: ${row.rights}\nبيان إضافي: ${row.extra || "غير محدد"}` : ""
      ].filter(Boolean)),
      "",
      `إجمالي عدد الأسهم: ${fmt(stocks.totalCount)}`,
      `إجمالي قيمة الأسهم: ${moneyText(stocks.totalValue)}`,
      `الفرق غير الموزع: ${moneyText(cap.issued - stocks.totalValue)}`
    ];
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

  function buildA4Export() {
    syncCapitalFromInputs();
    updateAll();
    const cap = capitalCalc();
    const stocks = stockCalc();
    const difference = cap.issued - stocks.totalValue;
    const matched = Math.abs(difference) < 0.005 && !stocks.invalid && !cap.errors.length;
    const method = { cash: "نقدي", inkind: "عيني", mixed: "نقدي وعيني" }[state.capital.type];
    const date = new Intl.DateTimeFormat("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
    const rightsRows = stocks.rows.filter((row) => row.categoryMode === "new" && row.rights.trim());
    const rowFont = stocks.rows.length > 6 ? 17 : 19;
    const rightsFont = rightsRows.length > 4 ? 17 : 19;

    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:fixed;left:-20000px;top:0;width:1240px;height:1754px;pointer-events:none;z-index:-1;";

    const page = document.createElement("article");
    page.style.cssText = "width:1240px;height:1754px;box-sizing:border-box;padding:62px 68px 52px;background:#FFFEFC;color:#18232D;font-family:Craft,Tahoma,Arial,sans-serif;direction:rtl;display:flex;flex-direction:column;overflow:hidden;";

    const summaryCards = [
      ["رأس المال المصدر", moneyHtml(cap.issued)],
      ["النقدي", moneyHtml(cap.cash)],
      ["العيني", moneyHtml(cap.inKind)],
      ["المدفوع", moneyHtml(cap.paid)],
      ["الحد الأدنى للمدفوع", moneyHtml(cap.minimum)],
      ["المصرح به", cap.authorized == null ? "غير محدد" : moneyHtml(cap.authorized)]
    ].map(([label, value]) => `
      <div style="border:1px solid #E3DED6;border-radius:16px;padding:14px 16px;background:#fff;min-height:82px">
        <div style="font-size:16px;color:#5E6C76;margin-bottom:4px">${label}</div>
        <div style="font-size:23px;font-weight:900;color:#0D3656">${value}</div>
      </div>`).join("");

    const stockRows = stocks.rows.map((row) => `
      <tr>
        <td>${esc(categoryLabel(row))}</td>
        <td style="direction:ltr;text-align:left">${fmt(row.count)}</td>
        <td style="direction:ltr;text-align:left">${moneyHtml(row.value)}</td>
        <td style="direction:ltr;text-align:left">${moneyHtml(row.amount)}</td>
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
              <span style="font-size:${rightsFont}px;line-height:1.55;color:#44525C">${esc(row.rights)}</span>
            </div>`).join("")}
        </div>
      </section>` : "";

    const valuationLine = cap.inKind > 0 ? `
      <div style="display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-top:1px solid #E7E0D7">
        <span>تقرير التقييم المعتمد</span><b style="color:${state.attachments.valuation ? "#165A3D" : "#8A6640"}">${state.attachments.valuation ? "جاهز" : "غير محدد كجاهز"}</b>
      </div>` : "";

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
          <div style="font-size:16px;color:#5E6C76">العملة: <b style="color:#0D3656">${state.capital.currency}</b> · الوفاء: <b style="color:#0D3656">${method}</b></div>
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
          <div style="font-size:16px;color:#44525C;margin-top:5px">الفرق غير الموزع: ${moneyHtml(difference)}</div>
        </div>
        <div style="border:1px solid #E3DED6;border-radius:15px;background:#fff;padding:12px 16px;font-size:16px;color:#44525C">
          <div style="display:flex;justify-content:space-between;gap:16px;padding:3px 0">
            <span>شهادة إيداع رأس المال</span><b style="color:${state.attachments.deposit ? "#165A3D" : "#8A6640"}">${state.attachments.deposit ? "جاهزة" : "غير محددة كجاهزة"}</b>
          </div>
          ${valuationLine}
        </div>
      </section>

      <footer style="margin-top:auto;padding-top:17px;border-top:1px solid #DED8D0;display:flex;justify-content:space-between;gap:20px;align-items:center;color:#6B777F;font-size:14px">
        <span>مخرج من مصمم شركة المساهمة المبسطة</span>
        <span style="direction:ltr">almohammdin</span>
      </footer>`;

    page.querySelectorAll("th,td").forEach((cell) => {
      cell.style.borderBottom = "1px solid #E7E0D7";
      if (!cell.style.padding) cell.style.padding = "9px 10px";
    });
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
        height: 1754,
        windowWidth: 1240,
        windowHeight: 1754
      });
      return { canvas, fileBase: built.fileBase };
    } finally {
      built.host.remove();
    }
  }

  async function exportA4(format, button) {
    const old = button.textContent;
    button.disabled = true;
    button.textContent = "جاري التجهيز";
    try {
      const { canvas, fileBase } = await renderA4Canvas();
      if (format === "png") {
        const link = document.createElement("a");
        link.download = fileBase + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast("تم تجهيز صورة A4.");
      } else {
        const jsPDF = window.jspdf?.jsPDF;
        if (!jsPDF) throw new Error("تعذر تحميل أداة PDF.");
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
        doc.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, 210, 297, undefined, "FAST");
        doc.save(fileBase + ".pdf");
        toast("تم تجهيز PDF A4.");
      }
    } catch (error) {
      console.error(error);
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
    $(id).value = fmt($(id).value);
  }));
  $('stockRows').addEventListener('focusout', (event) => {
    if (['count','value','votesPerShare'].includes(event.target.dataset.field)) event.target.value = fmt(event.target.value);
  });
  $('depositReady').addEventListener('change', () => { state.attachments.deposit = $('depositReady').checked; });
  $('valuationReady').addEventListener('change', () => { state.attachments.valuation = $('valuationReady').checked; });

  $('stockRows').addEventListener('input', (event) => {
    const rowNode = event.target.closest('[data-row]');
    const field = event.target.dataset.field;
    if (!rowNode || !field) return;
    const row = state.stocks.find((item) => item.id === rowNode.dataset.row);
    row[field] = ['count','value','votesPerShare'].includes(field) ? num(event.target.value) : event.target.value;
    const count = event.target.parentElement.querySelector('.charCount');
    if (count) count.textContent = `${fmt(event.target.value.length)} من 255`;
    const valueNode = rowNode.querySelector('.rowValue strong');
    if (valueNode) valueNode.innerHTML = moneyHtml(num(row.count) * num(row.value));
    updateTables(); updateMatch();
  });
  $('stockRows').addEventListener('change', (event) => {
    const rowNode = event.target.closest('[data-row]');
    const field = event.target.dataset.field;
    if (!rowNode || !field) return;
    const row = state.stocks.find((item) => item.id === rowNode.dataset.row);
    row[field] = ['count','value','votesPerShare'].includes(field) ? num(event.target.value) : event.target.value;
    if (field === 'categoryMode') renderRows();
    updateAll();
  });
  $('stockRows').addEventListener('click', (event) => {
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
  $('saveCompany').addEventListener('click', () => saveCurrent().catch((error) => toast(error.message || "تعذر الحفظ.")));
  $('newCompany').addEventListener('click', () => {
    loadSnapshot({ id: crypto.randomUUID(), companyName: "", capital: { currency: "SAR", type: "cash", issued: 100000, inKind: 0, paidFull: true, paid: 100000, authorized: null, bank: "" }, stocks: [{ id: crypto.randomUUID(), categoryMode: "none", existingCategory: "", categoryName: "", rights: "", extra: "", count: 10000, value: 10, votesPerShare: 1 }], attachments: { deposit: false, valuation: false } });
    $('savedCompanies').value = "";
    toast("بدأ نموذج شركة جديد مع إبقاء النماذج المحفوظة.");
  });
  $('savedCompanies').addEventListener('change', async () => {
    const value = $('savedCompanies').value;
    if (!value) return;
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
    toast("فُتحت الشركة المحفوظة.");
    } catch (error) { toast(window.SJSCCloud.errorMessage(error)); }
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
    if (!window.SJSCCloud?.isConfigured) return;
    const url = await window.SJSCCloud.createShare(state.id, snapshot());
    await copyText(url);
    toast("أُنشئ رابط مشاركة ونسخ إلى الحافظة.");
  });

  loadSnapshot(state);
  prepareAccount();
})();
