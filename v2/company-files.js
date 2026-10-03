(function (root) {
  'use strict';
  const cleanName = value => String(value || '').normalize('NFC').trim().replace(/\s+/gu, ' ');
  const nameKey = value => cleanName(value).toLocaleLowerCase('en-US');
  const recordName = record => record.companyName ?? record.company_name ?? '';
  function conflict(records, name, exceptId) {
    return records.find(record => record.id !== exceptId && nameKey(recordName(record)) === nameKey(name));
  }
  function uniqueName(records, base = 'شركة جديدة') {
    base = cleanName(base).slice(0, 110) || 'شركة جديدة';
    let name = base, number = 2;
    while (conflict(records, name)) name = `${base} ${number++}`;
    return name;
  }
  function prepare(data, records, options = {}) {
    const copy = JSON.parse(JSON.stringify(data));
    copy.companyName = cleanName(options.name ?? copy.companyName) || uniqueName(records);
    if (copy.companyName.length > 120) throw new Error('اكتب اسما من 120 حرفا كحد أقصى.');
    if (conflict(records, copy.companyName, options.asNew ? undefined : copy.id)) {
      const error = new Error('يوجد ملف شركة بهذا الاسم. اختر اسما آخر، أو افتح الشركة المحفوظة ثم اضغط حفظ.');
      error.code = 'company/name-exists';
      throw error;
    }
    if (options.asNew) {
      copy.id = options.id;
      copy.versions = [];
    }
    // Existing history remains readable; saving never appends a version.
    return copy;
  }
  const api = { cleanName, nameKey, conflict, uniqueName, prepare };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SJSCCompanyFiles = Object.freeze(api);
})(typeof window === 'object' ? window : globalThis);
