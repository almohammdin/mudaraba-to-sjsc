const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { units, calculate } = require('./v2/deal-impact-model.js');
const base = { price:'10000000',fee:'200000',success:'100000',expenses:'100000',reserve:'0',available:'10000000',payer:'company',comp:'fee',credit:false,currentPct:'0',finalPct:'5',donorPct:'40',source:'donor' };
assert.equal(units('١٠٬٠٠٠٫٥٠'),1000050);
assert.equal(units('0.29'),29);
for(const value of ['', '-1','1e3','Infinity','NaN','1,00','1.234','1000000000000.01']) assert.equal(units(value),null,value);
assert.equal(units('1,000,000,000,000'),100000000000000);
const result = calculate(base);
assert.equal(result.total,1030000000);
assert.equal(result.gap,30000000);
assert.equal(result.cancelled,30000000);
const external=calculate({...base,payer:'shareholders'});
assert.equal(external.required,1000000000);
assert.equal(external.external,30000000);
assert.equal(external.cancelledCompany,0);
const credited=calculate({...base,comp:'mixed',credit:true});
assert.equal(credited.successDue,0);
assert.equal(credited.serviceCost,30000000);
assert.deepEqual(credited.equity.rows.map(x=>x.after),[3500,6000,500]);
const existing=calculate({...base,comp:'equity',currentPct:'2'});
assert.deepEqual(existing.equity.rows.map(x=>x.after),[3700,5800,500]);
assert.ok(calculate({...base,comp:'equity',currentPct:'6'}).errors.includes('finalPct'));
assert.ok(calculate({...base,comp:'equity',finalPct:'50'}).errors.includes('donorPct'));
assert.ok(calculate({...base,comp:'equity',source:'issue',finalPct:'100'}).errors.includes('finalPct'));
assert.equal(calculate({...base,comp:'equity',source:'issue'}).equity.issueRatio,500/9500);
assert.equal(calculate({...base,comp:'equity',fee:'bad',success:'bad'}).errors.length,0);
let cases=0;
for(const comp of ['fee','success','equity','mixed']) for(const payer of ['company','target','shareholders']) for(const credit of [false,true]) for(const source of ['holders','donor','issue']) for(const currentPct of ['0','2','5','30']) for(const finalPct of ['0','5','35','100']) {
  const r=calculate({...base,comp,payer,credit,source,currentPct,finalPct});
  if(!r.errors.length){
    assert.equal(r.total,r.required+r.external);
    assert.ok(Number.isSafeInteger(r.total));
    assert.equal(r.gap*r.surplus,0);
    if(r.equity){assert.equal(r.equity.rows.reduce((s,x)=>s+x.before,0),10000);assert.equal(r.equity.rows.reduce((s,x)=>s+x.after,0),10000);assert.ok(r.equity.rows.every(x=>x.after>=0));}
  }
  cases++;
}
for(const file of ['deal-impact.js','deal-impact-model.js','deal-impact.css']){
  const text=fs.readFileSync(path.join(__dirname,'v2',file),'utf8');
  assert.ok(!/[\u202a-\u202e\u2066-\u2069\u200e\u200f\u061c\ufb50-\ufdff\ufe70-\ufeff\u2014]/u.test(text),file);
}
console.log(`PASS: ${cases} scenario combinations, money parsing, exact minor units, dilution, validation, Arabic Unicode`);
