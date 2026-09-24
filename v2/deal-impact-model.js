/* Pure scenario arithmetic. Money uses integer minor units, percentages use basis points. */
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SJSCDealMath = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  'use strict';
  const normalize = value => String(value ?? '').trim()
    .replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x660))
    .replace(/[\u06f0-\u06f9]/g, c => String(c.charCodeAt(0) - 0x6f0))
    .replace(/\u066b/g, '.').replace(/\u066c/g, ',');
  function units(value, max = 1000000000000) {
    const text = normalize(value);
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return null;
    const [whole, fraction = ''] = text.replaceAll(',', '').split('.');
    const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return Number.isSafeInteger(amount) && amount >= 0 && amount <= max * 100 ? amount : null;
  }
  function calculate(input) {
    const errors = [];
    const money = {};
    for (const key of ['price', 'fee', 'success', 'expenses', 'reserve', 'available']) {
      const inactive = (key === 'fee' && !['fee', 'mixed'].includes(input.comp)) || (key === 'success' && !['success', 'mixed'].includes(input.comp));
      money[key] = inactive ? 0 : units(input[key]);
      if (money[key] === null) errors.push(key);
    }
    if (!['fee', 'success', 'equity', 'mixed'].includes(input.comp)) errors.push('comp');
    if (!['company', 'target', 'shareholders'].includes(input.payer)) errors.push('payer');
    const equityEnabled = ['equity', 'mixed'].includes(input.comp);
    let equity = null;
    if (equityEnabled) {
      const current = units(input.currentPct, 100), final = units(input.finalPct, 100);
      const donor = units(input.donorPct, 100);
      if (current === null) errors.push('currentPct');
      if (final === null || final < current) errors.push('finalPct');
      if (!['holders', 'donor', 'issue'].includes(input.source)) errors.push('source');
      if (input.source === 'donor' && (donor === null || donor > 10000 - current || final - current > donor)) errors.push('donorPct');
      if (input.source === 'issue' && final === 10000 && current < 10000) errors.push('finalPct');
      if (!errors.length) {
        const additional = final - current;
        const rows = input.source === 'donor'
          ? [{ name: 'المساهمون مقدمو الأسهم', before: donor, after: donor - additional },
            { name: 'بقية المساهمين', before: 10000 - current - donor, after: 10000 - current - donor }]
          : [{ name: 'بقية المساهمين مجتمعين', before: 10000 - current, after: 10000 - final }];
        rows.push({ name: 'مهندسو الصفقة', before: current, after: final });
        equity = { rows, additional, issueRatio: input.source === 'issue' && additional ? additional / (10000 - final) : 0 };
      }
    }
    if (errors.length) return { errors: [...new Set(errors)] };
    const fee = ['fee', 'mixed'].includes(input.comp) ? money.fee : 0;
    const success = ['success', 'mixed'].includes(input.comp) ? money.success : 0;
    const successDue = Math.max(0, success - (input.credit ? fee : 0));
    const serviceCost = fee + successDue + money.expenses;
    const companyCost = input.payer === 'company' ? serviceCost : 0;
    const total = money.price + serviceCost + money.reserve;
    const required = money.price + companyCost + money.reserve;
    const cancelled = fee + money.expenses;
    return { errors: [], money, fee, successDue, serviceCost, total, required,
      external: serviceCost - companyCost, gap: Math.max(0, required - money.available),
      surplus: Math.max(0, money.available - required), cancelled,
      cancelledCompany: input.payer === 'company' ? cancelled : 0, equity };
  }
  return Object.freeze({ normalize, units, calculate });
});
