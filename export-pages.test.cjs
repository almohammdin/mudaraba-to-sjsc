const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const copies=[];
const context={window:{},document:{createElement(){return {getContext(){return {fillRect(){},drawImage(...args){copies.push(args);}}}};}}};
vm.runInNewContext(fs.readFileSync('./v2/export-pages.js','utf8'),context);
const source=height=>({width:1240,height,getContext(){return {getImageData(){return {data:new Uint8ClampedArray(1240*180*4).fill(255)}}}}});
assert.equal(context.window.SJSCExport.sliceCanvas(source(1700)).length,1,'Short export must not add an empty page');
copies.length=0;
const canvas=source(5200),pages=context.window.SJSCExport.sliceCanvas(canvas);
assert.ok(pages.length>1);
let end=0;
for(const args of copies){assert.equal(args[2],end,'No skipped source rows');end+=args[4];assert.ok(args[6]>0,'Top margin');assert.ok(args[6]+args[8]<pages[0].height,'Bottom margin');}
assert.equal(end,5200,'Every source row must be exported');
console.log('PDF pagination passed: one-page summary, multi-page coverage, margins, no skipped rows.');
