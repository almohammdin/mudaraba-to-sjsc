/* Educational examples only. Isolated from company files and capital designer state. */
(() => {
  'use strict';
  const decision = document.querySelector('#decision .decision');
  if (!decision) return;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = value => new Intl.NumberFormat('en-US', {maximumFractionDigits:2}).format(value);
  const bdi = value => '<bdi dir="ltr">' + esc(value) + '</bdi>';
  const state = {scene:'single',mode:'ownership',payment:'purchase',exitType:'company',distribution:false,investor:25,stake:60,name:'',selected:'A'};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let movement = !reduced.matches;
  let frame = 0, resizeFrame = 0, paths = [], dots = [];
  const icon = kind => kind === 'asset'
    ? '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M7 21 24 7l17 14v21H7Z M17 42V26h14v16 M19 18h10"/></svg>'
    : '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="24" cy="15" r="8"/><path d="M8 43c0-20 32-20 32 0"/></svg>';
  const scenes = {
    single:{name:'استحواذ واحد',sub:'A تملك حصة في B',title:'شركة مشروع لصفقة محددة',text:'يجتمع المساهمون في شركة A، وتملك A حصة في الشركة المستهدفة B. اختر كل طرف لتتعرف على دوره.',insight:'ابدأ بسؤال: ما الذي سنشتريه؟',why:'في هذا المشهد تشتري A ملكية في B. حدد النسبة والحقوق والإدارة وآلية التخارج قبل تنفيذ الصفقة.',targets:[['B','شركة المطاعم',70]]},
    portfolio:{name:'عدة استحواذات',sub:'A تملك حصصًا في B وC وD',title:'شركة واحدة تجمع عدة استثمارات',text:'تملك A حصصًا في شركات مختلفة. يتابع مساهمو A استثماراتهم من خلال الشركة الجامعة، وتبقى لكل شركة مستهدفة ملكيتها المحددة.',insight:'اختبر توافق المساهمين على المحفظة',why:'قارن سياسة إعادة الاستثمار والتوزيعات وحدود صلاحيات الإدارة. خسارة استثمار أو نجاحه يؤثران في قيمة محفظة A ونتائجها.',targets:[['B','شركة المطاعم',60],['C','شركة المقاهي',80],['D','شركة الخدمات',100]]},
    separate:{name:'شركة لكل فرصة',sub:'A1 وA2 لمجموعتين مستقلتين',title:'كل فرصة بهيكل ملكية مستقل',text:'تشارك المجموعة الأولى في A1 للاستحواذ على B، وتشارك المجموعة الثانية في A2 للاستحواذ على C. يمكن أن تختلف المجموعتان أو يشترك بعض أفرادهما.',insight:'حدد المشاركة والالتزامات لكل فرصة',why:'استقلال الشركات يساعد على تنظيم ملكية كل صفقة وحساباتها. راجع الضمانات والتمويل والعقود المشتركة عند تقييم مدى فصل المخاطر.',targets:[['B','شركة المطاعم',70],['C','شركة المقاهي',80]]},
    assets:{name:'أصول داخل شركة',sub:'A تملك الأصول مباشرة',title:'كيان واحد يملك عدة أصول',text:'تملك A أصول النشاط مباشرة، مثل موقع مطعم وتجهيزات مقهى ومستودع. الأيقونات المربعة تمثل أصولًا في هذا المثال.',insight:'ميز بين الأصل والشركة المالكة له',why:'يعرض هذا المثال الأصول والالتزامات المرتبطة بالنشاط داخل A. افحص ملكية كل أصل والتراخيص والعقود وشروط نقلها عند الشراء.',targets:[['P1','أصل المطعم',100],['P2','تجهيزات المقهى',100],['P3','المستودع',100]]}
  };
  const root = document.createElement('section');
  root.className = 'edu'; root.id = 'structureLearning'; root.lang='ar-SA'; root.dir='rtl';
  root.setAttribute('aria-label','استكشف هيكل الصفقة');
  root.innerHTML = `
    <div class="edu-header"><div><span class="edu-kicker">افهم الهيكل قبل اختيار الشركة</span><h3>شاهد من يملك، وأين يتحرك المال</h3><p>اختر مشهدًا، ثم اضغط على أحد أطراف الرسم لقراءة دوره. الأمثلة افتراضية للتعلم.</p></div></div>
    <div class="edu-choices" role="group" aria-label="مشاهد الهيكل">${Object.entries(scenes).map(([id,s])=>`<button type="button" class="edu-choice" data-edu-scene="${id}" aria-pressed="${id===state.scene}"><b>${s.name}</b><small>${s.sub}</small></button>`).join('')}</div>
    <div class="edu-tools" role="group" aria-label="المسار المعروض"><strong>ماذا تريد أن تتبع؟</strong>${[['ownership','الملكية'],['payment','دفع الثمن'],['returns','التوزيعات'],['exit','التخارج']].map(([id,label])=>`<button type="button" class="edu-toggle" data-edu-mode="${id}" aria-pressed="${id===state.mode}">${label}</button>`).join('')}
      <button type="button" class="edu-replay" id="eduReplay">إعادة الحركة</button><label><input type="checkbox" id="eduMotion" ${movement?'checked':''}> الحركة التوضيحية</label>
    </div>
    <div class="edu-payment" id="eduPayment" hidden><label for="eduPaymentType">كيف تدخل شركة الاستثمار إلى الشركة المستهدفة؟</label><select id="eduPaymentType"><option value="purchase">شراء ملكية من مساهمين قائمين</option><option value="subscription">اكتتاب بأسهم جديدة</option></select></div>
    <div class="edu-payment" id="eduExit" hidden><label for="eduExitType">من الذي يتخارج؟</label><select id="eduExitType"><option value="company">شركة الاستثمار تبيع استثمارها</option><option value="shareholder">المساهمون يبيعون أسهمهم في شركة الاستثمار</option></select></div>
    <label class="edu-assumption" id="eduDistribution" hidden><input type="checkbox" id="eduDistributionCheck"> افتراض تعليمي: توافر أرباح قابلة للتوزيع وصدور قرار توزيع من شركة الاستثمار</label>
    <p class="edu-sequence" id="eduSequence" role="status"></p>
    <div class="edu-layout">
      <div class="edu-canvas"><div class="edu-legend"><span><i class="edu-dot"></i>شركة</span><span><i class="edu-dot asset"></i>أصل</span><span id="eduRouteKind">الأسهم تبين اتجاه الملكية</span></div>
        <div class="edu-network" id="eduNetwork" aria-label="أطراف الهيكل وعلاقاتها"></div>
        <p class="edu-caption" id="eduCaption"></p>
      </div>
      <aside class="edu-detail" id="eduDetail" aria-live="polite" aria-atomic="true"></aside>
    </div>
    <div class="edu-insight" id="eduInsight" aria-live="polite"></div>
    <p class="edu-caveat">الحروف أسماء تعليمية ثابتة: A لشركة الاستثمار، وB وC وD للشركات المستهدفة. في المشهد المستقل تظهر A1 وA2. «مساهمة مبسطة» شكل قانوني، و«شركة استحواذ» دور في الصفقة. الأشكال القانونية للشركات المستهدفة تحدد بحسب الحالة. نسب الملكية في شركات مختلفة تقرأ كل منها مستقلة.</p>
    <div class="edu-sim" id="eduSim">
      <h4>مدخلات مثال الملكية</h4><p>القيم الأولية مثال قابل للتعديل. تمثل هذه الحقول مجموعة مساهمين في شركة الاستثمار A وحصة A في الشركة المستهدفة B، وتحدّث الرسم مباشرة. تبقى مدخلات التجربة داخل هذه الصفحة ومستقلة عن ملفات الشركات المحفوظة.</p>
      <label class="edu-name" for="eduInvestorName">أسماء المساهمين أو اسم مجموعتهم (اختياري)<input id="eduInvestorName" type="text" maxlength="60" dir="auto" placeholder="مثال: مجموعة المؤسسين"></label>
      <div class="edu-sim-grid"><div class="edu-percent-field"><label for="eduInvestorNumber">إجمالي نسبة ملكية المساهمين المذكورين في شركة A (%)</label><input id="eduInvestorNumber" type="text" lang="en" dir="ltr" inputmode="decimal" value="25" aria-describedby="eduInputHint eduInputError"><input id="eduInvestor" type="range" aria-label="تعديل إجمالي نسبة ملكية المساهمين المذكورين في A" min="0" max="100" value="25" step="0.01"></div>
      <div class="edu-percent-field"><label for="eduStakeNumber">نسبة ملكية A في B (%)</label><input id="eduStakeNumber" type="text" lang="en" dir="ltr" inputmode="decimal" value="60" aria-describedby="eduInputHint eduInputError"><input id="eduStake" type="range" aria-label="تعديل نسبة ملكية A في B" min="0" max="100" value="60" step="0.01"></div>
      <div class="edu-result" role="status"><strong id="eduIndirect" dir="ltr">15%</strong><small>إجمالي الملكية غير المباشرة للمساهمين المذكورين في B عبر A</small><div class="edu-equation" id="eduEquation">25% × 60% = 15%</div></div></div>
      <p id="eduInputHint">النسبة هي مجموع ملكية المساهمين المذكورين في A. إذا شملت المجموعة جميع مساهمي A، تدخل النسبة 100%. يمكن كتابة نسبة من 0 إلى 100 بمنزلتين عشريتين، أو استخدام شريط التعديل. تحسب نسبة بقية المساهمين تلقائيًا.</p><p id="eduInputError" class="edu-input-error" role="status" hidden></p>
      <p style="margin-top:14px">هذه نسبة حسابية عبر مسار واحد، بافتراض تناسب الملكية مع رأس المال. حقوق التصويت واستحقاقات الأرباح والتخارج تقرأ وفق الحقوق والاتفاقات. بقية ملكية A وB تعود إلى مساهمين آخرين بحسب النسب الظاهرة.</p>
      <button type="button" class="edu-next" id="eduAddAcquisition">ماذا يتغير عند إضافة استحواذات أخرى؟</button>
    </div>
    <p class="edu-caveat">المسارات أمثلة مستقلة على الهيكل المفترض؛ اختيار التخارج يعرض اتجاه الثمن، وتبقى نسب مشهد الملكية كما حددتها. الحركة توضح الاتجاه والترتيب التعليمي؛ حجم العلامات وسرعتها ثابتان بصرف النظر عن المبالغ أو مدة التنفيذ. تتطلب الصفقة فحص القيود والموافقات والقيد النظامي بحسب شكل الشركة. <a href="https://www.uqn.gov.sa/details?p=19697" target="_blank" rel="noopener">نظام الشركات: المواد 22 و25 و138 و140 و145 و151</a>، <a href="https://www.uqn.gov.sa/details?p=21325" target="_blank" rel="noopener">اللائحة التنفيذية: ضوابط الأرباح القابلة للتوزيع</a>.</p>`;
  decision.before(root);
  const q = selector => root.querySelector(selector);
  q('.edu-layout').before(q('#eduSim'));
  const network = q('#eduNetwork');
  let nodes = [], edges = [];
  function model() {
    const s = scenes[state.scene], independent = state.scene==='separate', assets = state.scene==='assets';
    const shareholder=(state.name||'').trim()||'مجموعة المساهمين';
    nodes=[];edges=[];
    const makeNode = (id,label,sub,kind,col,row,mobile,description) => {
      nodes.push({id,label,sub,kind,col,row,mobile,description});
    };
    const groups = independent ? 2 : 1;
    const shareholderExit=state.mode==='exit'&&state.exitType==='shareholder';
    if(shareholderExit){
      for(let g=0;g<groups;g++){
        const aid=independent?'A'+(g+1):'A',sid='I'+g,bid='buyerA'+g,row=g+1;
        const active=independent||state.investor>0;
        makeNode(sid,independent?'المساهمون البائعون في '+aid:shareholder,independent?'بيع أسهم يملكونها في '+aid:'المساهمون البائعون: مجموع ملكيتهم '+num(state.investor)+'% من A','person',1,row,g*3+1,
          active?'يبيع المساهمون أسهمًا يملكونها ويتلقون الثمن مباشرة من المشتري، كل بحسب الأسهم التي يبيعها، وفق القيود والموافقات والقيد اللازم. المثال بيع لطرف آخر؛ إعادة شراء الشركة لأسهمها لها أحكام مستقلة.':'إجمالي نسبة المساهمين المذكورين 0% في A. يمكن تعديل النسبة في مشهد الملكية لتجربة تخارجهم.');
        makeNode(bid,'مشتري أسهم المساهمين','يسدد الثمن للمساهمين البائعين','person',2,row,g*3+2,'يدفع المشتري إلى المساهمين البائعين مقابل الأسهم المنقولة إليه. تتغير هوية مالك هذه الأسهم وفق إجراءات نقلها.');
        makeNode(aid,'شركة الاستثمار '+aid,'تستمر في تملك استثماراتها','company',3,row,g*3+3,
          'تظل استثمارات '+aid+' مملوكة لها في هذا المثال. ثمن البيع يستحقه المساهمون البائعون، وتقتصر العملية المعروضة على انتقال أسهمهم إلى المشتري.');
        edges.push({from:bid,to:sid,label:active?'ثمن الأسهم':'نسبة المجموعة 0%',active,phase:0});
      }
      return s;
    }
    for(let g=0;g<groups;g++){
      const aid=independent?'A'+(g+1):'A', iid='I'+g;
      const row = independent ? g+1 : s.targets.length===1?1:2;
      const mobile=independent?g*3+1:1;
      makeNode(iid,independent?'مستثمرو الفرصة '+(g+1):'المساهمون في A',independent?'مساهمون في '+aid:shareholder+': '+num(state.investor)+'%، وبقية المساهمين: '+num(100-state.investor)+'%','person',1,row,mobile,
        'المساهمون يملكون أسهم شركة المشروع. تحدد وثائقها حقوقهم في المعلومات والقرارات والعوائد والتصرف بأسهمهم.');
      makeNode(aid,'شركة الاستثمار '+aid,'شركة المساهمة المبسطة','company',2,row,mobile+1,
        independent?'تجمع هذه الشركة مساهمي فرصتها وتملك الحصة المستهدفة. تحدد لها إدارة وحسابات والتزامات بحسب هيكلها.':'A هي شركة المشروع التي يملكها المساهمون. تتولى الشراء باسمها، وتدار بصلاحيات يحددها نظامها الأساس.');
      const hasInvestment=assets||independent||s.targets.some(([id,,percent])=>(id==='B'?state.stake:percent)>0);
      const ownershipLabel='100% إجمالي الملكية';
      if(state.mode==='ownership')edges.push({from:iid,to:aid,label:ownershipLabel,active:true,phase:0});
      else if(state.mode==='payment')edges.push({from:iid,to:aid,label:'تمويل مفترض',active:hasInvestment,phase:0});
      else edges.push({from:aid,to:iid,label:state.distribution&&hasInvestment?'توزيع مفترض':'توزيع مشروط',active:state.distribution&&hasInvestment,phase:1});
    }
    s.targets.forEach(([id,label,percent],i)=>{
      const aid=independent?'A'+(i+1):'A', row=independent?i+1:s.targets.length===1?1:i+1;
      const mobile=independent?i*3+3:i+3;
      const stake = id==='B'&&!independent?state.stake:percent;
      const active=assets||stake>0;
      let nodeId=id, title=assets?label:label+' '+id, sub=assets?'أصل مملوك مباشرة':'شركة مستهدفة',kind=assets?'asset':'company';
      let description=assets?'يمثل هذا العنصر أصلًا تملكه A مباشرة. تحدد حقوق الملكية والتشغيل والتراخيص لكل أصل بحسب مستنداته.':
        aid+' تملك '+num(stake)+'% من '+id+' في المثال. '+(stake<100?'النسبة المتبقية '+num(100-stake)+'% لمساهمين آخرين. ':'')+'ترتبط حقوق القرار والتوزيعات بنوع الملكية ووثائق الشركة.';
      let from=aid,to=id,edgeLabel=assets?'ملكية الأصل':num(stake)+'%';
      if(state.mode==='payment'){
        if(assets||state.payment==='purchase'){
          nodeId='seller'+id;title=assets?'بائع '+label:'المساهمون البائعون في '+id;sub=assets?'ينقل الأصل إلى '+aid:'ينقلون الملكية إلى '+aid;kind='person';
          description='يتلقى البائع ثمن الشراء مقابل نقل '+(assets?'الأصل':'الملكية')+' إلى '+aid+' وفق عقد الصفقة وإجراءاتها. يوضح هذا المسار وجهة الثمن.';to=nodeId;edgeLabel='ثمن الشراء';
        } else {sub='تصدر أسهمًا جديدة';description='تتلقى '+id+' مبلغ الاكتتاب من '+aid+' مقابل إصدار أسهم جديدة وفق الإجراءات اللازمة. يتجه التمويل هنا إلى الشركة، وتتحدد نسب المساهمين بعد الإصدار.';edgeLabel='مبلغ الاكتتاب';}
      }
      if(state.mode==='returns'){from=id;to=aid;edgeLabel=assets?'صافي تدفق مفترض':'توزيعات مفترضة';description+=assets?' التدفق المعروض تعليمي بعد افتراض المصروفات المرتبطة بالنشاط.':' يفترض المسار تحقق أرباح قابلة للتوزيع وصدور القرار اللازم.';}
      if(state.mode==='exit'){
        nodeId='buyer'+id;title=assets?'مشتري '+label:'مشتري حصة '+aid+' في '+id;sub='مثال: بيع الاستثمار';kind='person';from=nodeId;to=aid;edgeLabel='حصيلة البيع';
        description='هذا مثال لتخارج '+aid+' ببيع '+(assets?'الأصل':'حصتها في '+id)+'. تصل حصيلة البيع إليها، وتحدد الالتزامات والقرارات ما يمكن توزيعه لاحقًا على مساهميها.';
      }
      if(!active){
        nodeId=id;title=label+' '+id;sub='حصة '+aid+' تساوي 0%';kind='company';
        description='النسبة المختارة 0%. يبقى هذا الطرف ظاهرًا للمقارنة، وتتوقف حركة المال والملكية بينه وبين '+aid+' في المثال. غيّر النسبة في مشهد الملكية لتجربة مشاركة فعلية.';
        from=aid;to=id;edgeLabel='0%';
      }
      makeNode(nodeId,title,sub,kind,3,row,mobile,description);
      edges.push({from,to,label:edgeLabel,active,phase:state.mode==='payment'?1:0});
    });
    return s;
  }
  function explain(id){
    const s=scenes[state.scene],node=nodes.find(n=>n.id===id);
    state.selected=node?node.id:'';
    network.querySelectorAll('.edu-node').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.eduNode===state.selected)));
    q('#eduDetail').innerHTML='<span class="edu-kicker">'+(node?'دور هذا الطرف':'اقرأ المشهد')+'</span><h4>'+(node?esc(node.label):s.title)+'</h4><p>'+(node?esc(node.description):s.text)+'</p><dl><div><dt>المشهد</dt><dd>'+s.name+'</dd></div><div><dt>المسار الحالي</dt><dd>'+({ownership:'تتبع من يملك',payment:'تتبع وجهة المال',returns:'توزيعات افتراضية مشروطة',exit:state.exitType==='shareholder'?'بيع المساهمين لأسهمهم إلى طرف آخر':'بيع الاستثمار ثم فحص المتاح للتوزيع'}[state.mode])+'</dd></div></dl>';
  }
  function stop(){cancelAnimationFrame(frame);frame=0;dots.forEach(d=>d.setAttribute('visibility','hidden'));}
  function sequenceText(phase){
    if(state.mode==='ownership')return 'تتبع الملكية: من المالك إلى ما يملكه. النسب تعبر عن رأس المال، وتفحص السيطرة والحقوق بصورة مستقلة.';
    if(state.mode==='exit'&&state.exitType==='shareholder')return 'تخارج المساهمين: المشتري يسدد الثمن إلى المساهمين البائعين مباشرة، كل بحسب الأسهم التي يبيعها.';
    if(state.mode==='payment')return phase===0?'1. تمويل رأسمالي مفترض لشركة الاستثمار. يمكن في صفقة فعلية استخدام سيولة قائمة أو تمويل آخر.':'2. شركة الاستثمار تسدد إلى البائع أو الشركة المصدرة بحسب المسار المختار.';
    return phase===0?'1. متحصلات مفترضة تصل إلى شركة الاستثمار.':'2. توزيع تعليمي مفترض بعد تحقق شروط الأرباح القابلة للتوزيع والقرار اللازم.';
  }
  function play(){
    stop();
    if(!movement||reduced.matches)return;
    const activePhases=[...new Set(edges.filter(e=>e.active).map(e=>e.phase))].sort();
    if(!activePhases.length){q('#eduSequence').textContent='الحركة متوقفة: النسب أو شروط التوزيع المختارة لا تنتج تدفقًا في هذا المثال.';return;}
    const start=performance.now(),duration=1700;
    let previous=-1;
    function tick(now){
      const elapsed=(now-start)/duration,index=Math.min(activePhases.length-1,Math.floor(elapsed)),phase=activePhases[index];
      const progress=Math.min(1,elapsed-index);
      if(previous!==phase){q('#eduSequence').textContent=sequenceText(phase);previous=phase;}
      paths.forEach((path,i)=>{
        const on=edges[i].active&&edges[i].phase===phase;
        dots[i].setAttribute('visibility',on?'visible':'hidden');
        if(on){const point=path.getPointAtLength(path.getTotalLength()*progress);dots[i].setAttribute('cx',point.x);dots[i].setAttribute('cy',point.y);}
      });
      if(elapsed<activePhases.length)frame=requestAnimationFrame(tick);else{stop();q('#eduSequence').textContent='اكتمل المسار التعليمي. '+(state.distribution?'التوزيع في الرسم افتراض تعليمي يخضع لشروطه.':'اقرأ التعليق أسفل الرسم لتفسير التدفقات.');}
    }
    frame=requestAnimationFrame(tick);
  }
  function draw(){
    stop(); paths=[];dots=[];
    const svg=network.querySelector('.edu-lines'),labels=network.querySelector('.edu-edge-labels');
    if(!svg)return;
    const rect=network.getBoundingClientRect(),mobile=window.matchMedia('(max-width:600px)').matches;
    svg.setAttribute('viewBox','0 0 '+rect.width+' '+rect.height);
    svg.innerHTML='<defs><marker id="eduArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10" fill="'+(state.mode==='ownership'?'#b8752e':'#165a3d')+'"/></marker></defs>';
    labels.innerHTML='';
    edges.forEach(edge=>{
      const from=network.querySelector('[data-edu-node="'+edge.from+'"] .edu-orb').getBoundingClientRect();
      const to=network.querySelector('[data-edu-node="'+edge.to+'"] .edu-orb').getBoundingClientRect();
      let x1,y1,x2,y2,lx,ly;
      if(mobile){
        const forward=to.top>from.top;
        const lower=forward?to:from;
        x1=lower.left+lower.width/2-rect.left;x2=x1;
        y1=lower.top-rect.top-65;y2=lower.top-rect.top-9;
        lx=x1;ly=y1+19;
        if(!forward){const temp=y1;y1=y2;y2=temp;}
      }else{
        const forward=to.left<from.left;
        x1=(forward?from.left:from.right)-rect.left+(forward?-5:5);
        x2=(forward?to.right:to.left)-rect.left+(forward?5:-5);
        y1=from.top+from.height/2-rect.top;y2=to.top+to.height/2-rect.top;
        lx=(x1+x2)/2;ly=(y1+y2)/2;
      }
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      const mid=(x1+x2)/2;
      path.setAttribute('d',mobile?'M'+x1+','+y1+' L'+x2+','+y2:'M'+x1+','+y1+' C'+mid+','+y1+' '+mid+','+y2+' '+x2+','+y2);
      path.setAttribute('class','edu-line'+(state.mode==='ownership'?'':' edu-money')+(edge.active?'':' edu-inactive'));
      path.dataset.from=edge.from;path.dataset.to=edge.to;path.dataset.phase=String(edge.phase);path.dataset.active=String(edge.active);
      if(edge.active)path.setAttribute('marker-end','url(#eduArrow)');svg.append(path);paths.push(path);
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','4');dot.setAttribute('class','edu-flow-dot');dot.style.fill=state.mode==='ownership'?'#b8752e':'#165a3d';dot.setAttribute('visibility','hidden');svg.append(dot);dots.push(dot);
      const label=document.createElement('span');label.className='edu-edge-label';label.style.left=lx+'px';label.style.top=ly+'px';
      const source=nodes.find(n=>n.id===edge.from),target=nodes.find(n=>n.id===edge.to);
      const short = n => n.id.startsWith('I')?'المساهمون':n.id.startsWith('seller')?'البائع':n.id.startsWith('buyer')?'المشتري':n.kind==='asset'?n.label:n.id;
      label.innerHTML=(mobile?'من <bdi>'+esc(short(source))+'</bdi> إلى <bdi>'+esc(short(target))+'</bdi><br>':'')+(/^\d+%$/.test(edge.label)?bdi(edge.label):esc(edge.label));
      labels.append(label);
    });
  }
  function render(animate=true){
    const s=model(),assets=state.scene==='assets';
    q('#eduPayment').hidden=state.mode!=='payment'||assets;
    q('#eduExit').hidden=state.mode!=='exit';
    q('#eduDistribution').hidden=!(state.mode==='returns'||(state.mode==='exit'&&state.exitType==='company'));
    q('#eduSim').hidden=state.mode!=='ownership'||state.scene==='separate'||assets;
    q('#eduMotion').disabled=reduced.matches;
    q('#eduReplay').disabled=!movement||reduced.matches||!edges.some(e=>e.active);
    q('#eduSequence').textContent=sequenceText(0);
    q('#eduAddAcquisition').hidden=state.scene==='portfolio';
    root.querySelectorAll('[data-edu-scene]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.eduScene===state.scene)));
    root.querySelectorAll('[data-edu-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.eduMode===state.mode)));
    network.innerHTML='<svg class="edu-lines" aria-hidden="true"></svg><div class="edu-edge-labels" aria-hidden="true"></div>'+nodes.map(n=>'<button type="button" class="edu-node '+n.kind+'" data-edu-node="'+n.id+'" style="--col:'+n.col+';--row:'+n.row+';--mobile:'+n.mobile+'" aria-label="'+esc(n.label)+'" aria-pressed="false"><span class="edu-orb">'+(n.kind==='company'?bdi(n.id):icon(n.kind))+'</span><b>'+esc(n.label)+'</b><small'+(n.sub==='شركة المساهمة المبسطة'?' class="edu-company-type"':'')+'>'+esc(n.sub)+'</small><span class="edu-inline">'+esc(n.description)+'</span></button>').join('');
    const captions={
      ownership:assets?'A تملك الأصول مباشرة. اختر الأصل لقراءة دوره.':state.scene==='separate'?'المجموعة الأولى تملك A1 التي تملك 70% من B؛ والمجموعة الثانية تملك A2 التي تملك 80% من C.':'نسبة '+(state.name.trim()||'المساهمين المذكورين')+' في A تساوي '+num(state.investor)+'%، وتملك A '+num(state.stake)+'% من B.'+(state.scene==='portfolio'?' وتملك A أيضًا 80% من C و100% من D.':''),
      payment:assets?'يتجه الثمن من A إلى بائعي الأصول مقابل نقلها إليها.':state.payment==='purchase'?'يتجه ثمن شراء الملكية إلى المساهمين البائعين. الشركة المستهدفة تحتفظ بأصولها داخلها.':'يتجه مبلغ الاكتتاب إلى الشركة المستهدفة مقابل أسهم جديدة. النسب النهائية تحسب بعد الإصدار.',
      returns:assets?'المسار من الأصل إلى A تعبير عن تدفقات نشاطه داخل الشركة، والأصل جزء منها. الرصيد النقدي والأرباح القابلة للتوزيع مفهومان مستقلان.':'يفترض المسار الأول صدور قرارات توزيع جائزة في الشركات المستهدفة وتلقي شركة الاستثمار نصيبها. توزيع شركة الاستثمار على مساهميها قرار مستقل بشروطه.',
      exit:state.exitType==='shareholder'?'المثال بيع المساهمين لأسهمهم إلى طرف آخر. يستحق المساهمون البائعون الثمن مباشرة، كل بحسب الأسهم التي يبيعها، وتستمر شركة الاستثمار في تملك أصولها وحصصها. تراجع قيود التصرف والموافقات وقيد نقل الأسهم.':'المثال بيع شركة الاستثمار لحصتها أو أصلها، فتستحق هي حصيلة البيع. تتضمن الحصيلة قيمة الاستثمار وربحًا أو خسارة بحسب الصفقة. توزيع الأرباح يتطلب أرباحًا قابلة للتوزيع وقرارًا جائزًا؛ ورد رأس المال أو التصفية مساران بإجراءات مستقلة.'
    };
    const zeroB=!assets&&state.scene!=='separate'&&state.stake===0&&!(state.mode==='exit'&&state.exitType==='shareholder');
    q('#eduCaption').textContent=captions[state.mode]+(zeroB?' حصة A في B تساوي 0%؛ مسار B متوقف في المثال.':'')+(state.mode==='exit'&&state.exitType==='shareholder'&&state.scene!=='separate'&&state.investor===0?' إجمالي نسبة المساهمين المذكورين في A تساوي 0%؛ مسار بيع أسهمهم متوقف.':'')+((state.mode==='returns'||(state.mode==='exit'&&state.exitType==='company'))&&!state.distribution?' مسار التوزيع للمساهمين متوقف حتى اختيار الافتراض التعليمي أعلاه.':'');
    q('#eduRouteKind').textContent=state.mode==='ownership'?'اتجاه السهم الإرشادي: من المالك إلى المملوك':'اتجاه السهم الإرشادي: من الدافع إلى المستلم';
    const modeInsight={
      payment:['افحص وجهة المقابل ووثائق الدخول','في شراء ملكية قائمة يستحق البائع الثمن، وفي إصدار أسهم جديدة تتلقى الشركة مبلغ الاكتتاب. المثال يعرض تمويلًا رأسماليًا مفترضًا قبل الدفع؛ وقد تستخدم الصفقة الفعلية سيولة قائمة أو تمويلًا آخر.'],
      returns:['افصل الرصيد النقدي عن الأرباح القابلة للتوزيع','تفحص القوائم والحقوق والالتزامات، ثم تتخذ قرارات التوزيع اللازمة لكل شركة على حدة. الحركة افتراض تعليمي، وتحديد مستحقات المساهمين يرجع إلى حقوق أسهمهم.'],
      exit:state.exitType==='shareholder'?['التخارج يغير حامل الأسهم','حدد الأسهم المباعة والثمن والشروط وآلية التسوية. افحص قيود التصرف والموافقات وسجل المساهمين. الشكل القانوني للشركة المستهدفة يؤثر في إجراءات نقل ملكيتها.']:['التصرف في الاستثمار مستقل عن استمرار الشركة','حدد الاستثمار المباع كليًا أو جزئيًا، ومن يستحق المقابل. افحص الالتزامات والموافقات والمصروفات والضرائب، ثم حدد معالجة الحصيلة وأي توزيع جائز.']
    };
    const insight=modeInsight[state.mode]||[s.insight,s.why];
    q('#eduInsight').innerHTML='<b>'+insight[0]+'</b>'+insight[1];
    explain(nodes.some(n=>n.id===state.selected)?state.selected:nodes.find(n=>n.kind==='company').id);
    draw(); if(animate)play();
  }
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.eduScene){state.scene=button.dataset.eduScene;state.selected=state.scene==='separate'?'A1':'A';render();}
    else if(button.dataset.eduMode){state.mode=button.dataset.eduMode;render();}
    else if(button.dataset.eduNode){explain(button.dataset.eduNode);draw();}
    else if(button.id==='eduReplay')play();
    else if(button.id==='eduAddAcquisition'){state.scene='portfolio';state.mode='ownership';render(false);root.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}
  });
  q('#eduPaymentType').addEventListener('change',event=>{state.payment=event.target.value;render();});
  q('#eduExitType').addEventListener('change',event=>{state.exitType=event.target.value;state.selected='';render();});
  q('#eduDistributionCheck').addEventListener('change',event=>{state.distribution=event.target.checked;render();});
  q('#eduMotion').addEventListener('change',event=>{movement=event.target.checked&&!reduced.matches;q('#eduReplay').disabled=!movement||!edges.some(e=>e.active);if(movement)play();else{stop();q('#eduSequence').textContent='الحركة متوقفة. تبقى العلاقات والشروحات متاحة للقراءة.';}});
  function syncNumbers(source){
    const result=state.investor*state.stake/100;
    [['investor','#eduInvestor','#eduInvestorNumber'],['stake','#eduStake','#eduStakeNumber']].forEach(([key,range,number])=>{q(range).value=state[key];if(source!==q(number))q(number).value=state[key];});
    q('#eduIndirect').textContent=num(result)+'%';q('#eduEquation').textContent=num(state.investor)+'% × '+num(state.stake)+'% = '+num(result)+'%';
    render(false);
  }
  const validPercent = field => /^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(field.value)&&Number(field.value)>=0&&Number(field.value)<=100;
  function validateNumbers(){
    const fields=[q('#eduInvestorNumber'),q('#eduStakeNumber')];
    const invalid=fields.filter(field=>!validPercent(field));
    fields.forEach(field=>field.setAttribute('aria-invalid',String(invalid.includes(field))));
    q('#eduInputError').hidden=invalid.length===0;
    q('#eduInputError').textContent=invalid.length?'تقبل النسبة قيمة من 0 إلى 100 بمنزلتين عشريتين. يحتفظ الرسم بآخر قيمة صحيحة للحقل حتى تصحيح الإدخال.':'';
  }
  [['investor','#eduInvestor','#eduInvestorNumber'],['stake','#eduStake','#eduStakeNumber']].forEach(([key,range,number])=>{
    q(range).addEventListener('input',event=>{state[key]=Number(event.target.value);syncNumbers();validateNumbers();});
    q(number).addEventListener('input',event=>{const field=event.target;const normalized=field.value.replace(/[\u0660-\u0669]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[\u06f0-\u06f9]/g,c=>String(c.charCodeAt(0)-0x6f0)).replace(/\u066b/g,'.');if(normalized!==field.value)field.value=normalized;if(validPercent(field)){state[key]=Number(field.value);syncNumbers(field);}validateNumbers();});
  });
  q('#eduInvestorName').addEventListener('input',event=>{state.name=event.target.value;render(false);});
  reduced.addEventListener('change',()=>{if(reduced.matches){movement=false;q('#eduMotion').checked=false;stop();}q('#eduMotion').disabled=reduced.matches;q('#eduReplay').disabled=!movement||reduced.matches;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{const resume=Boolean(frame);draw();if(resume)play();});}).observe(network);
  document.fonts.ready.then(draw);
  render(false);

  const intro=document.createElement('div');intro.className='edu';
  intro.innerHTML='<div class="edu-intro" aria-label="من المساهمين إلى الاستثمار"><div class="edu-intro-item"><span class="edu-intro-icon">'+icon('person')+'</span><b>المساهمون</b><small>يملكون أسهم شركة المشروع</small></div><div class="edu-intro-item"><span class="edu-intro-icon">A</span><b>شركة المشروع</b><small class="edu-company-type">شركة المساهمة المبسطة</small></div><div class="edu-intro-item"><span class="edu-intro-icon">B</span><b>الشركة المستهدفة B</b><small>A تملك حصة في هذه الشركة</small></div></div><p class="edu-intro-note">ابدأ بالتمييز بين المساهمين، والشركة، والاستثمار الذي تملكه الشركة. <a href="#structureLearning">استكشف العلاقات في الرسم التفاعلي</a>.</p>';
  document.querySelector('#about .grid2').after(intro);

  const journey=document.createElement('section');journey.className='edu edu-journey';journey.setAttribute('aria-label','تتبع رحلة الاستحواذ');
  const steps=[
    ['تحديد محل الصفقة','ما الذي ستملكه A؟','ابدأ بتحديد ما إذا كانت الصفقة شراء ملكية في B أو شراء أصول محددة. وثق النسبة أو الأصول والحقوق والعقود المشمولة، ثم افحصها قبل الالتزام.'],
    ['تجهيز شركة المشروع','من يشارك في A؟','حدد المساهمين ومساهماتهم وحقوقهم والإدارة وحدود الصلاحيات. راجع مسار جمع رأس المال والتراخيص والمتطلبات المنطبقة على الصفقة.'],
    ['تنفيذ الشراء أو الاكتتاب','إلى من يصل المبلغ؟','عند شراء ملكية قائمة يتلقى البائع الثمن. عند الاكتتاب بأسهم جديدة تتلقى الشركة مبلغ الاكتتاب. يرتبط التنفيذ بالعقود والموافقات وإجراءات نقل الملكية أو إصدار الأسهم.'],
    ['الإدارة والعائد والتخارج','كيف تتابع الاستثمار؟','حدد التقارير والقرارات والتوزيعات وآلية التخارج. بيع A لاستثمارها يعيد الحصيلة إلى A؛ وبيع المساهمين لأسهمهم في A يمثل مسار تخارج مختلفًا.']
  ];
  journey.innerHTML='<div class="edu-header"><div><span class="edu-kicker">تتبع الصفقة خطوة بخطوة</span><h3>من قرار الاستثمار إلى التخارج</h3></div></div><div class="edu-journey-steps" role="group" aria-label="خطوات رحلة الصفقة">'+steps.map((s,i)=>'<button type="button" data-edu-step="'+i+'" aria-pressed="'+(i===0)+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+s[0]+'</button>').join('')+'</div><div class="edu-journey-copy" aria-live="polite" aria-atomic="true"><h4>'+steps[0][1]+'</h4><p>'+steps[0][2]+'</p></div><p class="edu-caveat"><a href="#structureLearning">ارجع إلى الرسم لتجربة مسارات الملكية والمال</a></p>';
  journey.addEventListener('click',event=>{const button=event.target.closest('[data-edu-step]');if(!button)return;const index=Number(button.dataset.eduStep);journey.querySelectorAll('[data-edu-step]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));journey.querySelector('.edu-journey-copy').innerHTML='<h4>'+steps[index][1]+'</h4><p>'+steps[index][2]+'</p>';});
  document.querySelector('#structure .flow').after(journey);
})();
