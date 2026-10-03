const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const files = require('./v2/company-files');
const name = 'شركة اختبار JV';
const data = { id: 'main', companyName: name, capital: { issued: 5000000, paid: 0 }, stocks: [{ rights: 'حقوق محفوظة', extra: 'التزامات محفوظة' }], versions: [{ at: '2026-10-01', data: { companyName: name } }] };
test('repeated saves update the same identity and preserve rights and existing history', () => {
  let current = structuredClone(data);
  for (let i = 0; i < 20; i++) current = files.prepare(current, [{ id: 'main', companyName: name }]);
  assert.deepEqual(current, data);
});
test('save as creates only the requested identity and keeps source intact', () => {
  const copy = files.prepare(data, [{ id: 'main', companyName: name }], { asNew: true, name: 'مشروع آخر', id: 'copy' });
  assert.equal(copy.id, 'copy'); assert.equal(copy.companyName, 'مشروع آخر'); assert.deepEqual(copy.versions, []);
  assert.deepEqual(copy.stocks, data.stocks); assert.equal(data.id, 'main'); assert.equal(data.versions.length, 1);
});
test('duplicate name checks cover local/cloud names, whitespace and Latin case', () => {
  for (const company of [{ id: 'other', companyName: name }, { id: 'other', company_name: name }]) {
    assert.throws(() => files.prepare(data, [company], { name: ' شركة  اختبار jv ' }), { code: 'company/name-exists' });
    assert.throws(() => files.prepare(data, [{ ...company, id: 'main' }], { asNew: true, name }), { code: 'company/name-exists' });
  }
});
test('empty names get a unique automatic name', () => {
  const records = [{ id: 'a', companyName: 'شركة جديدة' }, { id: 'b', company_name: 'شركة جديدة 2' }];
  assert.equal(files.prepare(data, records, { name: '   ' }).companyName, 'شركة جديدة 3');
  assert.equal(files.uniqueName(records), 'شركة جديدة 3');
});
test('cloud transaction rejects a concurrent duplicate and leaves the original untouched', async () => {
  let stored = [{ id: 'existing', companyName: name, updatedAt: '2026-01-01', data: { marker: 'original' } }];
  let writes = 0;
  const window = { SJSCCompanyFiles: files, SJSC_FIREBASE_CONFIG: { apiKey: 'test', authDomain: 'test', projectId: 'test', appId: 'test' } };
  window.SJSCFirebase = {
    doc: () => 'user-document', serverTimestamp: () => 'now',
    runTransaction: async (db, action) => action({
      get: async () => ({ data: () => ({ sjscCapitalDesigner: { companies: stored } }) }),
      set: (ref, value) => { writes++; stored = value.sjscCapitalDesigner.companies; }
    })
  };
  const code = fs.readFileSync('./v2/cloud-storage.js', 'utf8').replace('  window.SJSCCloud = {', "  currentUser = {uid:'test'}; readyPromise = Promise.resolve(true);\n  window.SJSCCloud = {");
  vm.runInNewContext(code, { window, console, Date, Set, Map });
  await assert.rejects(window.SJSCCloud.saveCompany(data), { code: 'company/name-exists' });
  assert.equal(writes, 0); assert.equal(stored[0].data.marker, 'original');
  await window.SJSCCloud.saveCompany({ ...data, id: 'existing' });
  assert.equal(writes, 1); assert.equal(stored.length, 1);
});
