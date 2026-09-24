/* Educational examples only. Isolated from company files and capital designer state. */
(() => {
  'use strict';
  const decision = document.querySelector('#decision .decision');
  if (!decision) return;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = value => new Intl.NumberFormat('en-US', {maximumFractionDigits:2}).format(value);
  const bdi = value => '<bdi dir="ltr">' + esc(value) + '</bdi>';
  const state = {scene:'single',mode:'ownership',payment:'purchase',investor:25,stake:60,selected:'A'};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let movement = !reduced.matches;
  let frame = 0, resizeFrame = 0, paths = [], dots = [];
  const icon = kind => kind === 'asset'
    ? '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M7 21 24 7l17 14v21H7Z M17 42V26h14v16 M19 18h10"/></svg>'
    : '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="24" cy="15" r="8"/><path d="M8 43c0-20 32-20 32 0"/></svg>';
  const scenes = {
    single:{name:'استحواذ واحد',sub:'A تملك حصة في B',title:'شركة مشروع لصفقة محددة',text:'يجتمع المساهمون في شركة A، وتملك A حصة في الشركة المستهدفة B. اختر كل طرف لتتعرف على دوره.',insight:'ابدأ بسؤال: ما الذي سنشتريه؟',why:'في هذا المشهد تشتري A ملكية في B. حدد النسبة والحقوق والإدارة وآلية الخروج قبل تنفيذ الصفقة.',targets:[['B','شركة المطاعم',70]]},
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
    <div class="edu-tools" role="group" aria-label="المسار المعروض"><strong>ماذا تريد أن تتتبع؟</strong>${[['ownership','الملكية'],['payment','دفع الثمن'],['returns','التوزيعات'],['exit','الخروج']].map(([id,label])=>`<button type="button" class="edu-toggle" data-edu-mode="${id}" aria-pressed="${id===state.mode}">${label}</button>`).join('')}
      <button type="button" class="edu-replay" id="eduReplay">إعادة الحركة</button><label><input type="checkbox" id="eduMotion" ${movement?'checked':''}> الحركة التوضيحية</label>
    </div>
    <div class="edu-payment" id="eduPayment" hidden><label for="eduPaymentType">كيف تدخل A إلى الشركة المستهدفة؟</label><select id="eduPaymentType"><option value="purchase">شراء ملكية من مساهمين قائمين</option><option value="subscription">اكتتاب بأسهم جديدة</option></select></div>
    <div class="edu-layout">
      <div class="edu-canvas"><div class="edu-legend"><span><i class="edu-dot"></i>شركة</span><span><i class="edu-dot asset"></i>أصل</span><span id="eduRouteKind">الأسهم تبين اتجاه الملكية</span></div>
        <div class="edu-network" id="eduNetwork" aria-label="أطراف الهيكل وعلاقاتها"></div>
        <p class="edu-caption" id="eduCaption"></p>
      </div>
      <aside class="edu-detail" id="eduDetail" aria-live="polite" aria-atomic="true"></aside>
    </div>
    <div class="edu-insight" id="eduInsight" aria-live="polite"></div>
    <p class="edu-caveat">الحروف أسماء تعليمية ثابتة: A لشركة الاستثمار، وB وC وD للشركات المستهدفة. في المشهد المستقل تظهر A1 وA2. «مساهمة مبسطة» شكل قانوني، و«شركة استحواذ» دور في الصفقة. الأشكال القانونية للشركات المستهدفة تحدد بحسب الحالة.</p>
    <div class="edu-sim" id="eduSim">
      <h4>جرب أثر طبقات الملكية</h4><p>تملك نسبة في A، وتملك A نسبة في B. غيّر النسب وشاهد مسارك في الرسم.</p>
      <div class="edu-sim-grid"><label for="eduInvestor">ملكيتك في A <output id="eduInvestorOut" for="eduInvestor" dir="ltr">25%</output><input id="eduInvestor" type="range" min="0" max="100" value="25" step="1"></label>
      <label for="eduStake">ملكية A في B <output id="eduStakeOut" for="eduStake" dir="ltr">60%</output><input id="eduStake" type="range" min="0" max="100" value="60" step="1"></label>
      <div class="edu-result" role="status"><strong id="eduIndirect" dir="ltr">15%</strong><small>ملكيتك غير المباشرة عبر A في B</small><div class="edu-equation" id="eduEquation">25% × 60% = 15%</div></div></div>
      <p style="margin-top:14px">هذه نسبة حسابية عبر مسار واحد، بافتراض تناسب الملكية مع رأس المال. حقوق التصويت واستحقاقات الأرباح والخروج تقرأ وفق الحقوق والاتفاقات. بقية ملكية A وB تعود إلى مساهمين آخرين بحسب النسب الظاهرة.</p>
      <button type="button" class="edu-next" id="eduAddAcquisition">ماذا يتغير عند إضافة استحواذات أخرى؟</button>
    </div>
    <p class="edu-caveat">تحديد الإدارة والحقوق والقرارات يرجع إلى وثائق الشركة والأحكام المنطبقة عليها. <a href="https://www.uqn.gov.sa/details?p=19697" target="_blank" rel="noopener">نظام الشركات: المواد 138 و140 و142 و145</a>. توضح الأمثلة العلاقات، ويخضع تنفيذ كل صفقة لفحصها النظامي والمالي.</p>`;
  decision.before(root);
  const q = selector => root.querySelector(selector);
  const network = q('#eduNetwork');
  let nodes = [], edges = [];
  function model() {
    const s = scenes[state.scene], independent = state.scene==='separate', assets = state.scene==='assets';
    nodes=[];edges=[];
    const makeNode = (id,label,sub,kind,col,row,mobile,description) => {
      nodes.push({id,label,sub,kind,col,row,mobile,description});
    };
    const groups = independent ? 2 : 1;
    for(let g=0;g<groups;g++){
      const aid=independent?'A'+(g+1):'A', iid='I'+g;
      const row = independent ? g+1 : s.targets.length===1?1:2;
      const mobile=independent?g*3+1:1;
      makeNode(iid,independent?'مستثمرو الفرصة '+(g+1):'أنت وبقية المساهمين',independent?'مساهمون في '+aid:'ملكية مباشرة في A','person',1,row,mobile,
        'المساهم يملك أسهم شركة المشروع. تحدد وثائقها حقوقه في المعلومات والقرارات والعوائد والتصرف بأسهمه.');
      makeNode(aid,'شركة الاستثمار '+aid,'مساهمة مبسطة في المثال','company',2,row,mobile+1,
        independent?'تجمع هذه الشركة مساهمي فرصتها وتملك الحصة المستهدفة. تحدد لها إدارة وحسابات والتزامات بحسب هيكلها.':'A هي شركة المشروع التي يملكها المساهمون. تتولى الشراء باسمها، وتدار بصلاحيات يحددها نظامها الأساس.');
      const ownershipLabel=independent?'ملكية مباشرة':num(state.investor)+'% لك في A';
      if(state.mode==='ownership')edges.push({from:iid,to:aid,label:ownershipLabel});
      else if(state.mode==='payment')edges.push({from:iid,to:aid,label:'مساهمة رأسمالية'});
      else edges.push({from:aid,to:iid,label:'توزيع محتمل'});
    }
    s.targets.forEach(([id,label,percent],i)=>{
      const aid=independent?'A'+(i+1):'A', row=independent?i+1:s.targets.length===1?1:i+1;
      const mobile=independent?i*3+3:i+3;
      const stake = id==='B'&&!independent?state.stake:percent;
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
        description='هذا مثال لخروج '+aid+' ببيع '+(assets?'الأصل':'حصتها في '+id)+'. تصل حصيلة البيع إليها، وتحدد الالتزامات والقرارات ما يمكن توزيعه لاحقًا على مساهميها.';
      }
      makeNode(nodeId,title,sub,kind,3,row,mobile,description);
      edges.push({from,to,label:edgeLabel});
    });
    return s;
  }
  function explain(id){
    const s=scenes[state.scene],node=nodes.find(n=>n.id===id);
    state.selected=node?node.id:'';
    network.querySelectorAll('.edu-node').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.eduNode===state.selected)));
    q('#eduDetail').innerHTML='<span class="edu-kicker">'+(node?'دور هذا الطرف':'اقرأ المشهد')+'</span><h4>'+(node?esc(node.label):s.title)+'</h4><p>'+(node?esc(node.description):s.text)+'</p><dl><div><dt>المشهد</dt><dd>'+s.name+'</dd></div><div><dt>المسار الحالي</dt><dd>'+({ownership:'تتبع من يملك',payment:'تتبع وجهة المال',returns:'توزيعات افتراضية مشروطة',exit:'بيع الاستثمار ثم فحص المتاح للتوزيع'}[state.mode])+'</dd></div></dl>';
  }
  function stop(){cancelAnimationFrame(frame);frame=0;dots.forEach(d=>d.setAttribute('visibility','hidden'));}
  function play(){
    stop();
    if(!movement||reduced.matches)return;
    const start=performance.now(),duration=2200;
    function tick(now){
      const progress=Math.min(1,(now-start)/duration);
      paths.forEach((path,i)=>{const point=path.getPointAtLength(path.getTotalLength()*progress);dots[i].setAttribute('cx',point.x);dots[i].setAttribute('cy',point.y);dots[i].setAttribute('visibility','visible');});
      if(progress<1)frame=requestAnimationFrame(tick);else stop();
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
      path.setAttribute('class','edu-line'+(state.mode==='ownership'?'':' edu-money'));path.setAttribute('marker-end','url(#eduArrow)');svg.append(path);paths.push(path);
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
    q('#eduSim').hidden=state.scene==='separate'||assets;
    q('#eduAddAcquisition').hidden=state.scene==='portfolio';
    root.querySelectorAll('[data-edu-scene]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.eduScene===state.scene)));
    root.querySelectorAll('[data-edu-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.eduMode===state.mode)));
    network.innerHTML='<svg class="edu-lines" aria-hidden="true"></svg><div class="edu-edge-labels" aria-hidden="true"></div>'+nodes.map(n=>'<button type="button" class="edu-node '+n.kind+'" data-edu-node="'+n.id+'" style="--col:'+n.col+';--row:'+n.row+';--mobile:'+n.mobile+'" aria-label="'+esc(n.label)+'" aria-pressed="false"><span class="edu-orb">'+(n.kind==='company'?bdi(n.id):icon(n.kind))+'</span><b>'+esc(n.label)+'</b><small>'+esc(n.sub)+'</small><span class="edu-inline">'+esc(n.description)+'</span></button>').join('');
    const captions={
      ownership:assets?'A تملك الأصول مباشرة. اختر الأصل لقراءة دوره.':state.scene==='separate'?'المجموعة الأولى تملك A1 التي تملك 70% من B؛ والمجموعة الثانية تملك A2 التي تملك 80% من C.':'تملك '+num(state.investor)+'% من A، وتملك A '+num(state.stake)+'% من B.'+(state.scene==='portfolio'?' وتملك A أيضًا 80% من C و100% من D.':''),
      payment:assets?'يتجه الثمن من A إلى بائعي الأصول مقابل نقلها إليها.':state.payment==='purchase'?'يتجه ثمن شراء الملكية إلى المساهمين البائعين. الشركة المستهدفة تحتفظ بأصولها داخلها.':'يتجه مبلغ الاكتتاب إلى الشركة المستهدفة مقابل أسهم جديدة. النسب النهائية تحسب بعد الإصدار.',
      returns:assets?'تتجمع تدفقات الأصول في A. أي توزيع للمساهمين مرتبط بالنتائج والالتزامات والقرارات اللازمة.':'تصل التوزيعات المفترضة من الشركات المستهدفة إلى شركة الاستثمار المالكة. ثم تدرس الشركة ما يمكن توزيعه على مساهميها.',
      exit:'المسار يمثل بيع شركة الاستثمار لما تملكه. حصيلة البيع تصل إليها أولًا؛ ثم تفحص الالتزامات والمصروفات والضرائب والقرارات قبل أي توزيع.'
    };
    q('#eduCaption').textContent=captions[state.mode];
    q('#eduRouteKind').textContent=state.mode==='ownership'?'الأسهم تبين اتجاه الملكية':'الأسهم تبين اتجاه المال في المثال';
    q('#eduInsight').innerHTML='<b>'+s.insight+'</b>'+s.why;
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
  q('#eduMotion').addEventListener('change',event=>{movement=event.target.checked;if(movement)play();else stop();});
  function syncNumbers(){
    const result=state.investor*state.stake/100;
    q('#eduInvestorOut').value=num(state.investor)+'%';q('#eduStakeOut').value=num(state.stake)+'%';
    q('#eduIndirect').textContent=num(result)+'%';q('#eduEquation').textContent=num(state.investor)+'% × '+num(state.stake)+'% = '+num(result)+'%';
    if(state.mode==='ownership')render(false);
  }
  q('#eduInvestor').addEventListener('input',event=>{state.investor=Number(event.target.value);syncNumbers();});
  q('#eduStake').addEventListener('input',event=>{state.stake=Number(event.target.value);syncNumbers();});
  reduced.addEventListener('change',()=>{if(reduced.matches){movement=false;q('#eduMotion').checked=false;stop();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(draw);}).observe(network);
  document.fonts.ready.then(draw);
  render(false);

  const intro=document.createElement('div');intro.className='edu';
  intro.innerHTML='<div class="edu-intro" aria-label="من المساهم إلى الاستثمار"><div class="edu-intro-item"><span class="edu-intro-icon">'+icon('person')+'</span><b>المساهمون</b><small>يملكون أسهم شركة المشروع</small></div><div class="edu-intro-item"><span class="edu-intro-icon">A</span><b>شركة المشروع</b><small>مساهمة مبسطة في هذا المثال</small></div><div class="edu-intro-item"><span class="edu-intro-icon">B</span><b>الشركة المستهدفة B</b><small>A تملك حصة في هذه الشركة</small></div></div><p class="edu-intro-note">ابدأ بالتمييز بين المساهم، والشركة، والاستثمار الذي تملكه. <a href="#structureLearning">استكشف العلاقات في الرسم التفاعلي</a>.</p>';
  document.querySelector('#about .grid2').after(intro);

  const journey=document.createElement('section');journey.className='edu edu-journey';journey.setAttribute('aria-label','تتبع رحلة الاستحواذ');
  const steps=[
    ['تحديد محل الصفقة','ما الذي ستملكه A؟','ابدأ بتحديد ما إذا كانت الصفقة شراء ملكية في B أو شراء أصول محددة. وثق النسبة أو الأصول والحقوق والعقود المشمولة، ثم افحصها قبل الالتزام.'],
    ['تجهيز شركة المشروع','من يشارك في A؟','حدد المساهمين ومساهماتهم وحقوقهم والإدارة وحدود الصلاحيات. راجع مسار جمع رأس المال والتراخيص والمتطلبات المنطبقة على الصفقة.'],
    ['تنفيذ الشراء أو الاكتتاب','إلى من يصل المبلغ؟','عند شراء ملكية قائمة يتلقى البائع الثمن. عند الاكتتاب بأسهم جديدة تتلقى الشركة مبلغ الاكتتاب. يرتبط التنفيذ بالعقود والموافقات وإجراءات نقل الملكية أو إصدار الأسهم.'],
    ['الإدارة والعائد والخروج','كيف تتابع الاستثمار؟','حدد التقارير والقرارات والتوزيعات وآلية الخروج. بيع A لاستثمارها يعيد الحصيلة إلى A؛ وبيع المساهم لأسهمه في A يمثل مسار خروج مختلفًا.']
  ];
  journey.innerHTML='<div class="edu-header"><div><span class="edu-kicker">تتبع الصفقة خطوة بخطوة</span><h3>من قرار الاستثمار إلى الخروج</h3></div></div><div class="edu-journey-steps" role="group" aria-label="خطوات رحلة الصفقة">'+steps.map((s,i)=>'<button type="button" data-edu-step="'+i+'" aria-pressed="'+(i===0)+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+s[0]+'</button>').join('')+'</div><div class="edu-journey-copy" aria-live="polite" aria-atomic="true"><h4>'+steps[0][1]+'</h4><p>'+steps[0][2]+'</p></div><p class="edu-caveat"><a href="#structureLearning">ارجع إلى الرسم لتجربة مسارات الملكية والمال</a></p>';
  journey.addEventListener('click',event=>{const button=event.target.closest('[data-edu-step]');if(!button)return;const index=Number(button.dataset.eduStep);journey.querySelectorAll('[data-edu-step]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));journey.querySelector('.edu-journey-copy').innerHTML='<h4>'+steps[index][1]+'</h4><p>'+steps[index][2]+'</p>';});
  document.querySelector('#structure .flow').after(journey);
})();
