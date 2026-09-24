/* Educational role planner. No writes to company files, cloud data, or ownership totals. */
(() => {
  'use strict';
  const root=document.querySelector('#structureLearning');
  if(!root)return;
  const section=document.createElement('section');
  section.id='dealRoles';section.className='edu-roles';section.setAttribute('aria-labelledby','eduRolesTitle');
  section.innerHTML=`
    <div class="edu-header"><div><span class="edu-kicker">قبل الاتفاق على الأسهم والمقابل</span><h3 id="eduRolesTitle">أطراف الصفقة: من يمول، ومن يجهز، ومن يملك؟</h3><p>قد يجمع شخص أو شركة أكثر من دور. تُسجل ملكيته مرة واحدة، وتوضح خدماته وصلاحياته في اتفاق مستقل. هذه مساحة تعليمية للتحضير، ومدخلاتها مؤقتة داخل الصفحة.</p></div></div>
    <div class="edu-role-cards" role="group" aria-label="شرح أدوار أطراف الصفقة">
      <button type="button" data-edu-role="investors" aria-pressed="false"><b>المساهمون</b><small>يقدمون رأس المال ويملكون الأسهم</small></button>
      <button type="button" data-edu-role="leader" aria-pressed="false"><b>المستثمر القائد</b><small>مساهم رئيسي عند اختياره في المثال</small></button>
      <button type="button" data-edu-role="engineers" aria-pressed="true"><b>مهندسو الصفقة</b><small>يجهزون الفرصة وينسقون تنفيذها</small></button>
    </div>
    <div id="eduRoleExplanation" class="edu-role-explanation" aria-live="polite"></div>
    <details class="edu-role-workspace"><summary>تجهيز اتفاق مهندسي الصفقة</summary>
      <p>تحدد المهام والمقابل بالتفاوض. نسبة الأسهم أو الأتعاب تُبنى على نطاق العمل والجهد والمخاطر وشروط الاستحقاق.</p>
      <div class="edu-role-fields">
        <label>اسم الفريق أو الجهة (اختياري)<input id="eduEngineersName" type="text" maxlength="100" dir="auto" placeholder="مثال: فريق تطوير الصفقة"></label>
        <label>من يتعاقد معهم؟<select id="eduContractClient"><option value="founders">المؤسسون قبل التأسيس</option><option value="company">شركة A بعد التأسيس</option></select></label>
        <label>ما المقابل المقترح؟<select id="eduEngineerComp"><option value="fee">أتعاب مقابل أعمال محددة</option><option value="success">أتعاب نجاح عند تحقق شروط محددة</option><option value="equity">أسهم مقابل خدمات وفق آلية موثقة</option><option value="mixed">مقابل مركب: أتعاب وأسهم</option></select></label>
        <label>هل يملكون أسهمًا حاليًا في شركة المشروع؟<select id="eduEngineerOwner"><option value="unknown">لم يحدد بعد</option><option value="no">لا، دورهم تعاقدي</option><option value="yes">نعم، ضمن المساهمين المسجلين</option></select></label>
      </div>
      <div class="edu-role-relationship" aria-label="موقع مهندسي الصفقة التعاقدي"><b id="eduClientLabel">المؤسسون</b><span>اتفاق خدمات ومقابل</span><b>مهندسو الصفقة</b></div>
      <p id="eduRoleSceneNote" class="edu-caveat"></p>
      <div class="edu-role-guidance" id="eduCompGuidance" aria-live="polite"></div>
      <p id="eduOwnerGuidance" class="edu-caveat" aria-live="polite"></p>
      <div class="edu-role-fields">
        <label>الأعمال والمخرجات المطلوبة<textarea id="eduEngineerWork" rows="4" maxlength="3000" placeholder="مثال: إعداد ملف الفرصة، تنسيق الفحص، مقارنة البدائل، متابعة شروط الإقفال"></textarea></label>
        <label>المقابل وشروط استحقاقه<textarea id="eduEngineerTerms" rows="4" maxlength="3000" placeholder="حدد المبلغ أو عدد الأسهم، مصدر الأسهم، المراحل، موعد الاستحقاق، وأثر تعثر الصفقة"></textarea></label>
      </div>
      <p class="edu-caveat">تُدخل أتعاب الخدمات ضمن ميزانية الصفقة. وتُراجع أسهم مهندسي الصفقة في <a href="#shareDesigner">مصمم رأس المال وفئات الأسهم</a> بعد تحديد مصدرها وأثرها في بقية الملكيات. حقول هذا القسم توثق الفكرة، وتبقى نسب الرسم مستقلة حتى اعتماد هيكل الملكية.</p>
      <details><summary>ما الذي ينبغي حسمه في الاتفاق؟</summary><ol class="edu-role-checks">
        <li>نطاق العمل والمخرجات ومواعيد التسليم ومعيار قبول كل مرحلة.</li>
        <li>جهة دفع الأتعاب أو نقل الأسهم، وموافقتها، والمصروفات المعتمدة وحدودها.</li>
        <li>تعريف نجاح الصفقة: توقيع أم إقفال ونقل ملكية أم إنجاز آخر محدد.</li>
        <li>استحقاق المقابل على مراحل، وأثر الإنهاء أو التأخير أو تعثر التمويل.</li>
        <li>الإفصاح عن العلاقات والعمولات والمصالح مع البائع والمستثمرين والأطراف الأخرى.</li>
        <li>السرية وملكية الدراسات والبيانات وتسليم الملفات عند انتهاء التكليف.</li>
        <li>حدود التفويض والتوقيع والمسؤولية عن التقصير وآلية معالجة النزاع.</li>
        <li>تحديد أي عمل بعد الإقفال في تكليف مستقل يشمل المقابل والصلاحيات والتقارير.</li>
      </ol></details>
      <div class="edu-role-warning"><b>مراجعة نظامية قبل التكليف</b><p>يشمل نشاط الترتيب تقديم أشخاص فيما يتعلق بطرح الأوراق المالية أو الترتيب للتعهد بتغطيتها أو استشارات تمويل الشركات. عند إدراج هذه الأعمال أو تقديم المشورة بشأن الاستثمار، تُراجع متطلبات الترخيص والاستثناءات وفق النشاط الفعلي. يحدد نطاق كل مختص وترخيصه في العقد.</p><p>تنص المادة 13 على أن رأس المال يتكون من الحصص النقدية والعينية، وتجيز للمؤسسين أو الشركاء أو المساهمين تقديم أسهم إلى شخص مقابل أعمال أو خدمات نافعة للشركة وفق النظام. لذلك توثق الجهة المقدمة للأسهم وآلية نقلها وشروط الاستحقاق، ويظل مبلغ النقد المطلوب للصفقة محسوبًا بصورة مستقلة.</p><p><a href="https://www.uqn.gov.sa/details?p=19697" target="_blank" rel="noopener">نظام الشركات: المواد 9 و13 و140</a> · <a href="https://thameen.cma.gov.sa/terms/%D8%A7%D9%84%D8%AA%D8%B1%D8%AA%D9%8A%D8%A8/" target="_blank" rel="noopener">هيئة السوق المالية: نشاط الترتيب</a> · <a href="https://cma.gov.sa/RulesRegulations/FAQ/Pages/default.aspx?PageIndex=7" target="_blank" rel="noopener">متطلبات الترخيص والاستثناءات</a></p></div>
      <button type="button" class="edu-next" id="eduCopyRoleBrief">نسخ ملخص الأدوار والاتفاق</button><p id="eduRoleCopyStatus" role="status"></p>
    </details>`;
  root.querySelector('#eduInsight').after(section);
  const q=selector=>section.querySelector(selector);
  const descriptions={
    investors:{title:'المساهمون: التمويل والملكية',rights:'حقوقهم تتصل بأسهمهم، مثل التصويت والمعلومات والأرباح التي يتقرر توزيعها والتخارج وفق وثائق الشركة.',duties:'الوفاء بمساهماتهم والتزاماتهم الموثقة وممارسة القرارات والصلاحيات وفق النظام الأساس والاتفاقات.',place:'موقعهم في الرسم عند طرف الملاك المتصل بشركة A. عند غياب المستثمر القائد يظهرون مجتمعين بملكية 100%.'},
    leader:{title:'المستثمر القائد: مساهم رئيسي',rights:'يملك النسبة المتفق عليها مقابل مساهمته. أي مقعد إداري أو حق موافقة أو أولوية مالية يحدد ويوثق بصورة مستقلة.',duties:'تحديد مبلغ مساهمته وموعد الوفاء بها ودوره المتفق عليه في الفحص والتفاوض والمتابعة، والإفصاح عن مصالحه.',place:'عند اختيار وجوده في مدخلات الملكية، يظهر نصيبه ونصيب بقية المساهمين داخل ملكية A. وصف القائد وحده يمنح تعريفًا للدور؛ الصلاحيات تستند إلى الوثائق.'},
    engineers:{title:'مهندسو الصفقة: إعداد الفرصة وتنسيق تنفيذها',rights:'مقابل متفق عليه عن أعمال محددة: أتعاب، أو أتعاب نجاح بشروط، أو أسهم بآلية موثقة، أو مزيج منها. تحدد حقوق المعلومات والتعاون اللازم لإنجاز التكليف.',duties:'تنسيق الفحص والدراسات والتفاوض والتوثيق ضمن نطاق التكليف والتراخيص، وتسليم المخرجات، والإفصاح عن تعارض المصالح وحفظ السرية. توقعات العائد تعرض مع افتراضاتها ومخاطرها.',place:'موقعهم التعاقدي بجانب المؤسسين أو شركة A بحسب العقد. تظهر ملكيتهم ضمن المساهمين إذا امتلكوا أسهمًا؛ ويظل عملهم الخدمي دورًا مستقلًا. يجري تحديد فريق كل فرصة وعقده عند تعدد الشركات.'}
  };
  function showRole(key){const d=descriptions[key];section.querySelectorAll('[data-edu-role]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eduRole===key)));q('#eduRoleExplanation').innerHTML='<h4>'+d.title+'</h4><div class="edu-role-pair"><div><b>ما لهم؟</b><p>'+d.rights+'</p></div><div><b>ما عليهم؟</b><p>'+d.duties+'</p></div></div><p class="edu-role-place"><b>موقعهم في الهيكل</b> '+d.place+'</p>';}
  const compGuidance={
    fee:'تحدد قيمة الأتعاب، والأعمال المقابلة لكل دفعة، ومعيار قبول المخرجات. يفصل استرداد المصروفات المعتمدة عن الأتعاب، وتحدد معالجة الإنهاء المبكر.',
    success:'تحدد واقعة الاستحقاق بدقة، مثل إقفال الصفقة ونقل الملكية، والمبلغ أو طريقة حسابه وسقفه وجهة دفعه. تراجع حالة التعثر والانسحاب وأي مقابل من أطراف أخرى ومتطلبات الترخيص.',
    equity:'تحدد الجهة التي ستقدم الأسهم، وعددها وفئتها وحقوقها، وتوقيت نقلها أو استحقاقها والموافقات والقيد اللازم. يمكن بحث الاستحقاق المرحلي مقابل مخرجات واضحة. توثق معالجة عدم إكمال الأعمال قبل اعتماد نقل الأسهم.',
    mixed:'يفصل مقابل كل عمل لمنع الازدواج: أتعاب الإعداد، وأتعاب النجاح إن وجدت، والأسهم وشروط استحقاقها. تفحص التكلفة الإجمالية وأثر الأسهم في ملكية كل طرف.'
  };
  function refresh(){
    const client=q('#eduContractClient').value,owner=q('#eduEngineerOwner').value,comp=q('#eduEngineerComp').value;
    q('#eduCompGuidance').textContent=compGuidance[comp];
    const scene=root.querySelector('[data-edu-scene][aria-pressed="true"]').dataset.eduScene;
    q('#eduContractClient').options[1].textContent=scene==='separate'?'شركة A1 أو A2 بعد التأسيس':'شركة A بعد التأسيس';
    q('#eduClientLabel').textContent=client==='company'?(scene==='separate'?'شركة A1 أو A2 بحسب العقد':'شركة A'):'المؤسسون';
    q('#eduRoleSceneNote').textContent=(scene==='separate'?'في مشهد A1 وA2 يحدد عقد كل شركة أو تفويضها على حدة. ':'')+(client==='founders'?'تحدد التزامات المؤسسين قبل التأسيس ومعالجة العقود والنفقات عند اكتماله أو تعذره وفق المادة 9.':'تراجع صلاحية ممثل الشركة والموافقات اللازمة للتعاقد، خاصة عند وجود مصالح مشتركة.');
    q('#eduOwnerGuidance').textContent=owner==='yes'?'تحتسب أسهم مهندسي الصفقة ضمن ملكية الشركة المعنية مرة واحدة، سواء كانوا من بقية المساهمين أو اجتمع دورهم مع المستثمر القائد. المقابل الخدمي يوثق على حدة.':owner==='no'?'دور مهندسي الصفقة الحالي تعاقدي. إذا كان المقابل المقترح يشمل أسهمًا، تبقى ملكية مستقبلية مشروطة إلى حين استكمال آليتها ونقلها.':'تحدد صفة الملكية بعد الاتفاق على مصدر الأسهم وشروطها. تبقى حقوقهم التعاقدية متميزة عن حقوق المساهمين.';
  }
  section.addEventListener('click',event=>{const button=event.target.closest('[data-edu-role]');if(button)showRole(button.dataset.eduRole);});
  ['#eduContractClient','#eduEngineerComp','#eduEngineerOwner'].forEach(id=>q(id).addEventListener('change',refresh));
  root.addEventListener('click',event=>{if(event.target.closest('[data-edu-scene],#eduAddAcquisition'))refresh();});
  q('#eduCopyRoleBrief').addEventListener('click',async()=>{
    const selectedText=id=>q(id).selectedOptions[0].textContent;
    const summary=['ملخص تعليمي لاتفاق مهندسي الصفقة','الفريق: '+(q('#eduEngineersName').value.trim()||'يحدد لاحقًا'),'الجهة المتعاقدة: '+selectedText('#eduContractClient'),'المقابل المقترح: '+selectedText('#eduEngineerComp'),'الملكية الحالية: '+selectedText('#eduEngineerOwner'),'الأعمال والمخرجات: '+(q('#eduEngineerWork').value.trim()||'تحدد لاحقًا'),'المقابل وشروط الاستحقاق: '+(q('#eduEngineerTerms').value.trim()||'تحدد لاحقًا'),q('#eduCompGuidance').textContent,q('#eduOwnerGuidance').textContent,'تراجع التراخيص والموافقات وتعارض المصالح ومصدر الأسهم قبل اعتماد الاتفاق. هذا ملخص تحضيري يحتاج صياغة ومراجعة مختصة.'].join('\n\n');
    try{await navigator.clipboard.writeText(summary);q('#eduRoleCopyStatus').textContent='تم نسخ الملخص التحضيري.';}catch{q('#eduRoleCopyStatus').textContent='تعذر النسخ التلقائي. يمكن تحديد النصوص ونسخها يدويًا.';}
  });
  showRole('engineers');refresh();
})();
