(() => {
  'use strict';
  const api = window.SJSCDesigner, math = window.SJSCNumbers;
  if (!api) return;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stateDefaults = () => ({ valuation:'', price:'', costs:'0', reserve:'0', decision:'بيع أصل مهم', threshold:'75', supporters:[], exit:'', valuationMethod:'', deadlock:'', workStops:'' });
  let draft = stateDefaults(), restoring = false;
  const toolbar = document.createElement('div'); toolbar.className='workActions';
  toolbar.innerHTML='<button class="ghostBtn" id="duplicateDesign" type="button">نسخ التصميم</button><button class="ghostBtn" id="baselineDesign" type="button">تثبيت نسخة للمقارنة</button><button class="ghostBtn" id="exportDesignText" type="button">تنزيل الملخص النصي</button><button class="ghostBtn" id="exportDesignHtml" type="button">ملخص قابل للطباعة</button><select id="designVersions" aria-label="النسخ السابقة"><option value="">النسخ السابقة</option></select><button class="ghostBtn" id="restoreDesignVersion" type="button">فتح الإصدار كنسخة جديدة</button>';
  $('shareDesigner').querySelector('.cloudPanel').append(toolbar);
  const dirty = document.createElement('p'); dirty.id='designDirty'; dirty.className='workDirty'; dirty.setAttribute('role','status'); dirty.textContent='مساحة العمل جاهزة'; toolbar.after(dirty);
  const panel = document.createElement('section'); panel.className='workPanel'; panel.id='partnershipWorkspace';
  panel.innerHTML=`<h3>قرارات الشراكة</h3><p>مساحة اختيارية لتجربة التمويل والقرار والتخارج. الملاحظات لا تمنع الحفظ أو المشاركة.</p>
    <div id="decisionSummary" class="workSummary"></div>
    <details><summary>التمويل وتقييم الشركة</summary><p>رأس المال هو القيمة الاسمية للأسهم. التقييم وثمن الصفقة والسيولة المطلوبة مبالغ مستقلة.</p><div class="workGrid">
      <label>تقييم الشركة قبل الاستثمار (اختياري)<input id="workValuation" data-work="valuation" inputmode="decimal" type="text" placeholder="مثال: 5000000"></label>
      <label>ثمن الاستحواذ أو الاستثمار المخطط<input id="workPrice" data-work="price" inputmode="decimal" type="text" placeholder="مثال: 1000000"></label>
      <label>المصاريف والأتعاب النقدية<input id="workCosts" data-work="costs" inputmode="decimal" type="text" value="0"><small>أدخل الإجمالي مرة واحدة، بما فيه أتعاب الصفقة إذا كانت ضمن الميزانية.</small></label>
      <label>السيولة التشغيلية والاحتياطي<input id="workReserve" data-work="reserve" inputmode="decimal" type="text" value="0"></label>
    </div><div class="workResult" id="fundingResult" role="status"></div></details>
    <details><summary>جرب التصويت على قرار</summary><p>تجربة على أساس إجمالي أصوات الصفوف الحالية. اختر المؤيدين ونسبة الموافقة التي تريد اختبارها؛ هذه النسبة افتراض تختاره أنت.</p>
      <div class="workGrid"><label>القرار<select id="workDecision" data-work="decision"><option>بيع أصل مهم</option><option>اقتراض</option><option>زيادة رأس المال</option><option>توزيع أرباح</option><option>تعديل حقوق فئة</option></select></label><label>الموافقة لا تقل عن (%)<input id="workThreshold" data-work="threshold" inputmode="decimal" type="text" value="75"></label></div>
      <div id="decisionSupporters"></div><div class="workResult" id="voteResult" role="status"></div></details>
    <details><summary>التخارج والتعامل مع الخلاف</summary><div class="workGrid">
      <label>كيف يمكن للشريك بيع أسهمه؟<textarea id="workExit" data-work="exit" placeholder="الموافقة، الأولوية، مدة الإشعار..."></textarea></label>
      <label>كيف تحدد قيمة التخارج وطريقة السداد؟<textarea id="workValuationMethod" data-work="valuationMethod" placeholder="تقييم متفق عليه، دفعة أو أقساط..."></textarea></label>
      <label>ماذا يحدث عند تعادل الأصوات أو تعطل القرار؟<textarea id="workDeadlock" data-work="deadlock" placeholder="تفاوض، وسيط، آلية متفق عليها..."></textarea></label>
      <label>ماذا لو توقف الشريك العامل أو تعثرت الصفقة؟<textarea id="workStops" data-work="workStops" placeholder="المقابل المستحق، الأعمال المنجزة، الأسهم المشروطة..."></textarea></label>
    </div></details><div id="scenarioComparison"></div>`;
  $('shareDesigner').querySelector('.designerShell').after(panel);
  function stash() { api.setPartnership(JSON.parse(JSON.stringify(draft))); }
  function markDirty() { if (!restoring) dirty.textContent='تغييرات غير محفوظة'; }
  function financeText() {
    const cap=api.capital(), currency=api.context().currency;
    if(draft.price==='') return 'أدخل ثمن الاستثمار لعرض احتياج التمويل.';
    const amounts=[draft.price,draft.costs,draft.reserve].map(math.parse), available=cap.paid-cap.inKind;
    if(amounts.some(n=>!Number.isFinite(n)||n<0)||!Number.isFinite(available)) return 'راجع كتابة المبالغ. يمكنك متابعة بقية التصميم وحفظه.';
    const required=math.money(amounts.reduce((a,b)=>a+b,0)), difference=math.money(available-required);
    return `إجمالي المطلوب: ${math.format(required)} ${currency}. المدفوع النقدي في المصمم: ${math.format(available)} ${currency}. ${difference<0?'فجوة التمويل':'الفائض'}: ${math.format(Math.abs(difference))} ${currency}. يفترض الحساب أن المدفوع النقدي متاح؛ راجع ما صرف منه.`;
  }
  function votingText() {
    const model=api.analysis(), threshold=math.parse(draft.threshold);
    if(!Number.isFinite(model.totalVotes)||model.totalVotes<=0||!Number.isFinite(threshold)||threshold<0||threshold>100) return 'راجع عدد الأصوات ونسبة الموافقة لعرض النتيجة. يمكنك المتابعة والحفظ.';
    const votes=model.rows.filter(r=>draft.supporters.includes(r.id)).reduce((s,r)=>s+r.votes,0), share=votes/model.totalVotes*100;
    return `المؤيدون: ${math.format(votes)} من ${math.format(model.totalVotes)} صوت (${math.format(share)}%). ${share>=threshold?'تتحقق النسبة المختارة':'لا تتحقق النسبة المختارة'} لقرار «${draft.decision}». النصاب وحقوق الموافقة الخاصة تراجع في الاتفاق.`;
  }
  function renderComparison() {
    if(!draft.baseline) { $('scenarioComparison').innerHTML=''; return; }
    const previous=draft.baseline, current=api.snapshot(), same=previous.capital.currency===current.capital.currency;
    const before=math.stocksCalc(previous.stocks), after=api.analysis();
    const labels=[['رأس المال المصدر',math.parse(previous.capital.issued),math.parse(current.capital.issued)],['عدد الأسهم',before.totalCount,after.totalCount],['إجمالي الأصوات',before.totalVotes,after.totalVotes]];
    $('scenarioComparison').innerHTML=`<h4>مقارنة مع النسخة المثبتة</h4>${!same?'<p class="advisory warn">العملتان مختلفتان. القيم المالية معروضة بعملتها ولا تمثل مقارنة سعر صرف.</p>':''}<div class="tableScroll"><table class="workTable"><thead><tr><th>البند</th><th>النسخة المثبتة</th><th>التصميم الحالي</th></tr></thead><tbody>${labels.map(([label,a,b],i)=>`<tr><td>${label}</td><td>${math.format(a)} ${i===0?esc(previous.capital.currency):''}</td><td>${math.format(b)} ${i===0?esc(current.capital.currency):''}</td></tr>`).join('')}</tbody></table></div><div class="tableScroll"><table class="workTable"><thead><tr><th>الصف</th><th>الملكية قبل / بعد</th><th>التصويت قبل / بعد</th></tr></thead><tbody>${[...new Set([...before.rows,...after.rows].map(r=>r.id))].map(id=>{const a=before.rows.find(r=>r.id===id),b=after.rows.find(r=>r.id===id),r=b||a;return `<tr><td>${esc(r.holder||r.categoryName||r.existingCategory||'صف أسهم')}</td><td>${a?math.format(a.ownership):'0'}% / ${b?math.format(b.ownership):'0'}%</td><td>${a?math.format(a.voteShare):'0'}% / ${b?math.format(b.voteShare):'0'}%</td></tr>`;}).join('')}</tbody></table></div>`;
  }
  function render() {
    const model=api.analysis();
    $('fundingResult').textContent=financeText(); $('voteResult').textContent=votingText();
    $('decisionSummary').innerHTML=`<span>رأس المال: <bdi>${math.format(api.capital().issued)} ${esc(api.context().currency)}</bdi></span><span>الأسهم: <bdi>${math.format(model.totalCount)}</bdi></span><span>الأصوات: <bdi>${math.format(model.totalVotes)}</bdi></span>`;
    $('decisionSupporters').innerHTML=model.rows.map((row,i)=>`<label class="decisionChoice"><input type="checkbox" data-supporter="${esc(row.id)}" ${draft.supporters.includes(row.id)?'checked':''}><span>${esc(row.holder||row.categoryName||row.existingCategory||'صف '+(i+1))}: <bdi>${math.format(row.ownership)}%</bdi> من رأس المال، <bdi>${math.format(row.voteShare)}%</bdi> من التصويت</span></label>`).join('');
    renderComparison();
  }
  function versions() {
    const data=api.snapshot(); $('designVersions').innerHTML='<option value="">النسخ السابقة</option>'+(data.versions||[]).map((v,i)=>`<option value="${i}">${esc(new Date(v.at).toLocaleString('en-GB'))}</option>`).reverse().join('');
  }
  function restore() {
    restoring=true; draft={...stateDefaults(),...(api.snapshot().partnership||{})};
    if(!Array.isArray(draft.supporters)) draft.supporters=[];
    panel.querySelectorAll('[data-work]').forEach(node=>{node.value=math.western(draft[node.dataset.work]??'');draft[node.dataset.work]=node.value;});
    stash(); render(); versions(); dirty.textContent='التصميم مفتوح في مساحة العمل'; restoring=false;
  }
  panel.addEventListener('input',event=>{
    const node=event.target; if(!node.dataset.work)return;
    draft[node.dataset.work]=node.value; stash(); markDirty();
    $('fundingResult').textContent=financeText(); $('voteResult').textContent=votingText();
  });
  panel.addEventListener('change',event=>{
    const id=event.target.dataset.supporter;if(!id)return;
    draft.supporters=event.target.checked?[...new Set([...draft.supporters,id])]:draft.supporters.filter(x=>x!==id);stash();markDirty();$('voteResult').textContent=votingText();
  });
  $('shareDesigner').addEventListener('input',markDirty);
  $('shareDesigner').addEventListener('change',event=>{if(event.target.id !== 'savedCompanies' && event.target.id !== 'designVersions')markDirty();});
  $('shareDesigner').addEventListener('click',event=>{if(event.target.closest('[data-template], [data-remove-row], [data-detach-class], #addStockRow'))markDirty();});
  $('structureLearning')?.addEventListener('input',markDirty);
  document.addEventListener('sjsc:designer-changed',()=>{render();});
  document.addEventListener('sjsc:design-loaded',restore);
  document.addEventListener('sjsc:design-saved',()=>{dirty.textContent='حفظت النسخة الحالية؛ حالة المزامنة موضحة أعلى الملف';versions();});
  $('duplicateDesign').addEventListener('click',()=>{
    const copy=api.snapshot(); copy.id=crypto.randomUUID();copy.companyName=(copy.companyName||'تصميم الشركة')+' - نسخة';copy.versions=[];
    api.load(copy);markDirty();api.notify('فتحت نسخة مستقلة. احفظها للاحتفاظ بها.');
  });
  $('baselineDesign').addEventListener('click',()=>{
    const data=api.snapshot();draft.baseline={capital:data.capital,stocks:data.stocks,at:new Date().toISOString()};stash();markDirty();render();api.notify('ثبتت نسخة للمقارنة. يمكنك تجربة التعديلات الآن.');
  });
  $('restoreDesignVersion').addEventListener('click',()=>{
    const index=$('designVersions').value;if(index===''){api.notify('اختر إصدارا سابقا من القائمة.');return;}
    const version=api.snapshot().versions?.[Number(index)];if(!version)return;
    const copy=JSON.parse(JSON.stringify(version.data));copy.id=crypto.randomUUID();copy.companyName=(copy.companyName||'تصميم')+' - إصدار سابق';copy.versions=[];api.load(copy);markDirty();
  });
  function report() {
    const lines=[api.text(),'','قرارات الشراكة',financeText(),votingText(),`تقييم الشركة قبل الاستثمار: ${draft.valuation||'غير محدد'} ${api.context().currency}`];
    for(const [key,label] of [['exit','انتقال الأسهم'],['valuationMethod','تقييم التخارج وسداده'],['deadlock','تعطل القرار'],['workStops','توقف العمل أو تعثر الصفقة']]) lines.push(label+': '+(draft[key]||'لم يحدد'));
    const deal=window.SJSCDealImpact?.capture()?.draft;
    if(deal){lines.push('','تكليف مهندسي الصفقة');for(const id of ['eduEngineersName','eduEngineerWork','eduEngineerTerms']){const node=$(id);if(node?.value)lines.push(node.value);}lines.push($('impactPreview')?.innerText||'');}
    return math.western(lines.join('\n'));
  }
  function download(content,extension,type) { const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download='sjsc-design.'+extension;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000); }
  $('exportDesignText').addEventListener('click',()=>download(report(),'txt','text/plain;charset=utf-8'));
  $('exportDesignHtml').addEventListener('click',()=>download(`<!doctype html><html lang="ar-SA" dir="rtl"><meta charset="utf-8"><title>ملخص تصميم الشركة</title><style>body{font:16px/1.9 Tahoma,Arial,sans-serif;margin:30px;color:#16364b}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}@page{size:A4;margin:18mm}</style><h1>ملخص تصميم الشركة</h1><pre>${esc(report())}</pre></html>`,'html','text/html;charset=utf-8'));
  // Roving focus preserves RTL keyboard navigation without blocking a step.
  const tabs=[...document.querySelectorAll('[data-step]')];
  tabs.forEach((tab,i)=>tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowLeft'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();}));
  restore();
})();
