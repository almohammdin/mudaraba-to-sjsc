from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

def replace_once(old, new, label):
    global s
    if old in s:
        s = s.replace(old, new, 1)
        return
    if new in s:
        return
    raise SystemExit(f'missing target: {label}')

replace_once(
".heroLogo div{width:265px;height:265px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 28px 80px rgba(0,0,0,.22)}.heroLogo img{width:170px}",
".heroLogo div{width:300px;height:300px;display:grid;place-items:center;background:transparent}.heroLogo img{width:245px;height:245px;object-fit:contain;filter:drop-shadow(0 18px 35px rgba(0,0,0,.18))}",
"transparent hero logo")

replace_once(
".realGrid strong{font:900 28px Arial!important;color:var(--green)}",
".realGrid strong{font-family:Craft,Tahoma,Arial,sans-serif!important;font-size:28px;font-weight:900;color:var(--green);font-variant-numeric:tabular-nums}",
"example number font")

css_insert = ".shareFields input,.ninput input,.costInputs input{direction:ltr!important;text-align:left!important;unicode-bidi:plaintext;font-family:Arial,sans-serif!important;font-variant-numeric:tabular-nums}.shareFields input::placeholder,.ninput input::placeholder,.costInputs input::placeholder{font-family:Arial,sans-serif!important}.redeemExplain{margin-top:12px;padding:13px 14px;border-radius:15px;background:#EEF6F1;border:1px solid rgba(22,90,61,.16)}.redeemExplain b,.redeemExplain span{display:block}.redeemExplain b{color:var(--green);font-size:12px}.redeemExplain span{margin-top:3px;color:#4E6258;font-size:11px;line-height:1.8}.redeemCompare{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.redeemCompare div{padding:10px 11px;border-radius:12px;background:#fff;border:1px solid #DFE9E2}.redeemCompare small,.redeemCompare strong{display:block}.redeemCompare small{font-size:9px;color:var(--muted)}.redeemCompare strong{font-size:11px;color:var(--n)}@media(max-width:620px){.redeemCompare{grid-template-columns:1fr}}"
if '.redeemExplain{' not in s:
    marker='@media(max-width:980px){'
    if marker not in s: raise SystemExit('missing CSS media marker')
    s=s.replace(marker, css_insert+marker, 1)

old_card = '<article class="card stype"><div class="num">3</div><span class="law">المادة 108، والمادتان 51 و53 من اللائحة التنفيذية</span><h3>الأسهم القابلة للاسترداد</h3><strong>سهم له شروط استرداد مكتوبة</strong><p>يحدد قرار الإصدار شروط الاسترداد وآليته. هذا النوع يفيد عندما ترغب الشركة في بناء مسار خروج محدد داخل هيكل رأس المال.</p><div class="when"><b>مثال استخدام</b><span>فئة لها شروط استرداد تكتب منذ إصدارها وتطبق وفق الإجراءات النظامية.</span></div></article>'
new_card = '<article class="card stype"><div class="num">3</div><span class="law">نظام الشركات، المادة 108 · اللائحة التنفيذية، المادتان 51 و53</span><h3>الأسهم القابلة للاسترداد</h3><strong>سهم تملك الشركة خيار استرداده لاحقا وفق شروط تكتب منذ يوم الإصدار</strong><p>المستثمر يشتري السهم ويصبح مساهما. الفرق أن وثائق الإصدار تحدد من البداية متى تستطيع الشركة استرداد السهم وكيف تحسب قيمة الاسترداد. عند تنفيذ الاسترداد تدفع الشركة القيمة لصاحب السهم، تنتهي ملكيته في هذا السهم، ويلغى السهم وتستكمل الشركة إجراءات تخفيض رأس المال.</p><div class="redeemExplain"><b>الفرق في جملة واحدة</b><div class="redeemCompare"><div><small>السهم العادي</small><strong>الخروج يكون عادة بنقل أو بيع السهم وفق القيود المعتمدة.</strong></div><div><small>القابل للاسترداد</small><strong>السهم نفسه يحمل مسار استرداد مكتوبا مسبقا تمارسه الشركة وفق شروط الإصدار.</strong></div></div><span>مثال: تصدر الشركة فئة قابلة للاسترداد وتنص الوثائق على أن للشركة خيار استردادها بعد مدة محددة أو عند تحقق شرط معين، وبقيمة أو معادلة حساب مكتوبة مسبقا.</span></div></article>'
replace_once(old_card,new_card,'redeemable explanation')

static_repls = {
'<input id="capN" type="number" value="15000000" step="100000">':'<input id="capN" type="text" inputmode="numeric" dir="ltr" lang="en" value="15,000,000">',
'<input id="retN" type="number" value="20" step="0.1">':'<input id="retN" type="text" inputmode="decimal" dir="ltr" lang="en" value="20">',
'<input id="m" type="number" value="20000">':'<input id="m" type="text" inputmode="numeric" dir="ltr" lang="en" value="20,000">',
'<input id="a" type="number" value="5000">':'<input id="a" type="text" inputmode="numeric" dir="ltr" lang="en" value="5,000">',
'<input id="s" type="number" value="4000">':'<input id="s" type="text" inputmode="numeric" dir="ltr" lang="en" value="4,000">',
'<input id="o" type="number" value="2000">':'<input id="o" type="text" inputmode="numeric" dir="ltr" lang="en" value="2,000">',
'<input id="l" type="number" value="30000">':'<input id="l" type="text" inputmode="numeric" dir="ltr" lang="en" value="30,000">',
'<input id="u" type="number" value="25000">':'<input id="u" type="text" inputmode="numeric" dir="ltr" lang="en" value="25,000">',
'<input id="x" type="number" value="12000">':'<input id="x" type="text" inputmode="numeric" dir="ltr" lang="en" value="12,000">',
}
for old,new in static_repls.items():
    if old in s: s=s.replace(old,new,1)
    elif new not in s: raise SystemExit('missing static input '+old[:30])

old_helpers = "const $=id=>document.getElementById(id),fmt=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.round(+n||0)),fmt2=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(+n||0),pct=n=>(+n||0).toFixed(2).replace(/\\.00$/,'')+'%',colors="
new_helpers = "const $=id=>document.getElementById(id),latin=v=>String(v??'').replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/٫/g,'.').replace(/٬/g,','),num=v=>{const q=latin(v).replace(/[,\\s]/g,'');const n=parseFloat(q);return Number.isFinite(n)?n:0},fmt=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.round(num(n))),fmt2=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(num(n)),pct=n=>num(n).toFixed(2).replace(/\\.00$/,'')+'%',formatField=(el,dec=0)=>{if(!el)return;const n=num(el.value);el.value=dec?new Intl.NumberFormat('en-US',{maximumFractionDigits:dec}).format(n):fmt(n)},colors="
replace_once(old_helpers,new_helpers,'number helpers')

old_vals = "function vals(){let c=+$('capN').value||0,r=+$('retN').value||0,p=[['المدير',12*(+$('m').value||0)],['المحاسب',12*(+$('a').value||0)],['السكرتير',12*(+$('s').value||0)],['المقر',12*(+$('o').value||0)],['المحامي',+$('l').value||0],['التدقيق',+$('u').value||0],['أخرى',+$('x').value||0]],cost=p.reduce((z,v)=>z+v[1],0),gross=c*r/100,net=gross-cost,rate=c?100*cost/c:0,nr=c?100*net/c:0;return{c,r,p,cost,gross,net,rate,nr}}"
new_vals = "function vals(){let c=num($('capN').value),r=num($('retN').value),p=[['المدير',12*num($('m').value)],['المحاسب',12*num($('a').value)],['السكرتير',12*num($('s').value)],['المقر',12*num($('o').value)],['المحامي',num($('l').value)],['التدقيق',num($('u').value)],['أخرى',num($('x').value)]],cost=p.reduce((z,v)=>z+v[1],0),gross=c*r/100,net=gross-cost,rate=c?100*cost/c:0,nr=c?100*net/c:0;return{c,r,p,cost,gross,net,rate,nr}}"
replace_once(old_vals,new_vals,'financial parser')

old_pair = "function pair(r,n,l,s=''){let R=$(r),N=$(n);R.oninput=()=>{N.value=R.value;$(l).textContent=s?R.value+s:fmt(R.value);markManual();calcUpdate()};N.oninput=()=>{R.value=N.value;$(l).textContent=s?N.value+s:fmt(N.value);markManual();calcUpdate()}}\npair('capR','capN','capLabel');pair('retR','retN','retLabel','%');['m','a','s','o','l','u','x'].forEach(id=>$(id).oninput=()=>{markManual();calcUpdate()});"
new_pair = "function pair(r,n,l,s=''){let R=$(r),N=$(n);R.oninput=()=>{N.value=s?R.value:fmt(R.value);$(l).textContent=s?R.value+s:fmt(R.value);markManual();calcUpdate()};N.oninput=()=>{let v=num(N.value);R.value=v;$(l).textContent=s?v+s:fmt(v);markManual();calcUpdate()};N.onblur=()=>{if(!s)formatField(N);else N.value=latin(N.value)}}\npair('capR','capN','capLabel');pair('retR','retN','retLabel','%');['m','a','s','o','l','u','x'].forEach(id=>{let el=$(id);el.oninput=()=>{markManual();calcUpdate()};el.onblur=()=>formatField(el)});"
replace_once(old_pair,new_pair,'input synchronization')

old_scenario = "$('capR').value=$('capN').value=v.cap;$('capLabel').textContent=fmt(v.cap);$('retR').value=$('retN').value=v.ret;$('retLabel').textContent=v.ret+'%';['m','a','s','o','l','u','x'].forEach(id=>$(id).value=v[id]);"
new_scenario = "$('capR').value=v.cap;$('capN').value=fmt(v.cap);$('capLabel').textContent=fmt(v.cap);$('retR').value=v.ret;$('retN').value=String(v.ret);$('retLabel').textContent=v.ret+'%';['m','a','s','o','l','u','x'].forEach(id=>$(id).value=fmt(v[id]));"
replace_once(old_scenario,new_scenario,'scenario formatting')

render_pattern = re.compile(r"function renderShareClasses\(data\)\{.*?\nshareUpdate\(\)\}", re.S)
render_new = r'''function renderShareClasses(data){$('shareClasses').innerHTML=data.map((d,i)=>`<div class="shareClass" data-share-class="${i}"><div class="shareClassTop"><b>الفئة ${i+1}</b><span>${i===0?'مثال مؤسسين':i===1?'مثال مستثمرين':'فئة إضافية'}</span></div><div class="shareFields"><label>اسم الفئة<input id="scName${i}" type="text" value="${d.name}"></label><label>نوع السهم<select id="scType${i}"><option value="ordinary"${d.type==='ordinary'?' selected':''}>عادية</option><option value="preferred"${d.type==='preferred'?' selected':''}>ممتازة</option><option value="redeemable"${d.type==='redeemable'?' selected':''}>قابلة للاسترداد</option></select></label><label>قيمة الاكتتاب<input id="scCap${i}" type="text" inputmode="numeric" dir="ltr" lang="en" value="${fmt(d.capital)}"></label><label>قيمة السهم<input id="scVal${i}" type="text" inputmode="decimal" dir="ltr" lang="en" value="${fmt2(d.value)}"></label><label>أصوات لكل سهم<input id="scVotes${i}" type="text" inputmode="numeric" dir="ltr" lang="en" value="${fmt(d.votes)}"></label></div></div>`).join('');
for(let i=0;i<data.length;i++){['scName','scCap','scVal','scVotes'].forEach(k=>{let el=$(k+i);el.oninput=()=>{shareMode='manual';document.querySelectorAll('[data-share-preset]').forEach(b=>b.classList.remove('active'));$('shareMode').textContent='تعديل يدوي';shareUpdate()};if(k!=='scName')el.onblur=()=>formatField(el,k==='scVal'?2:0)});$('scType'+i).onchange=()=>{let t=$('scType'+i).value,v=$('scVotes'+i);if(t!=='ordinary'){v.value='0';v.disabled=true}else{v.disabled=false;if(num(v.value)===0)v.value='1'}shareMode='manual';document.querySelectorAll('[data-share-preset]').forEach(b=>b.classList.remove('active'));$('shareMode').textContent='تعديل يدوي';shareUpdate()};if(data[i].type!=='ordinary')$('scVotes'+i).disabled=true}
shareUpdate()}'''
m=render_pattern.search(s)
if m:
    if 'inputmode="numeric"' not in m.group(0): s=s[:m.start()]+render_new+s[m.end():]
elif render_new not in s:
    raise SystemExit('missing share renderer')

old_share_data = "function shareData(){let rows=[];for(let i=0;i<3;i++){let name=$('scName'+i)?.value||`الفئة ${i+1}`,type=$('scType'+i)?.value||'ordinary',capital=+$('scCap'+i)?.value||0,value=Math.max(0.000001,+$('scVal'+i)?.value||0),votesPer=type==='ordinary'?(+$('scVotes'+i)?.value||0):0,shares=capital/value,votes=shares*votesPer;rows.push({name,type,capital,value,votesPer,shares,votes})}"
new_share_data = "function shareData(){let rows=[];for(let i=0;i<3;i++){let name=$('scName'+i)?.value||`الفئة ${i+1}`,type=$('scType'+i)?.value||'ordinary',capital=num($('scCap'+i)?.value),value=Math.max(0.000001,num($('scVal'+i)?.value)),votesPer=type==='ordinary'?num($('scVotes'+i)?.value):0,shares=capital/value,votes=shares*votesPer;rows.push({name,type,capital,value,votesPer,shares,votes})}"
replace_once(old_share_data,new_share_data,'share numeric parser')

p.write_text(s, encoding='utf-8')
print('patched', len(s))
