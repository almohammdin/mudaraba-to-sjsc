/* Shared numeric parsing and class resolution. No DOM or storage side effects. */
((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SJSCNumbers = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  'use strict';
  const western = value => String(value ?? '').replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x660))
    .replace(/[\u06f0-\u06f9]/g, c => String(c.charCodeAt(0) - 0x6f0)).replace(/\u066b/g, '.').replace(/\u066c/g, ',');
  function parse(value) {
    if (typeof value === 'number') return Number.isFinite(value) && Math.abs(value) <= 1e12 ? value : NaN;
    const text = western(value).trim();
    if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return NaN;
    const result = Number(text.replaceAll(',', ''));
    return Number.isFinite(result) && Math.abs(result) <= 1e12 ? result : NaN;
  }
  const format = value => Number.isFinite(parse(value)) ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parse(value)) : '—';
  const money = value => Number.isFinite(value) ? Math.round(value * 100) / 100 : NaN;
  function resolveClasses(stocks) {
    const definitions = new Map(stocks.filter(r => r.categoryMode === 'new').map(r => [r.id, r]));
    return stocks.map(row => {
      if (row.categoryMode !== 'existing') return { ...row };
      const source = definitions.get(row.categoryId) || (!row.categoryId && stocks.find(r => r.categoryMode === 'new' && r.categoryName === row.existingCategory));
      return source ? { ...row, missingCategory: false, categoryId: source.id, existingCategory: source.categoryName, rights: source.rights, extra: source.extra, votesPerShare: source.votesPerShare } : { ...row, missingCategory: true };
    });
  }
  function stocksCalc(stocks) {
    const rows = resolveClasses(stocks).map(row => {
      const count = parse(row.count), value = parse(row.value), voteRate = parse(row.votesPerShare);
      const amount = Number.isSafeInteger(count) && count > 0 && value > 0 ? money(count * value) : NaN;
      const votes = Number.isSafeInteger(count) && count > 0 && Number.isSafeInteger(voteRate) && voteRate >= 0 ? count * voteRate : NaN;
      return { ...row, count, value, amount: Number.isSafeInteger(Math.round(amount * 100)) ? amount : NaN, votes: Number.isSafeInteger(votes) ? votes : NaN };
    });
    const totalValue = money(rows.reduce((s, r) => s + r.amount, 0));
    const totalCount = rows.reduce((s, r) => s + r.count, 0), totalVotes = rows.reduce((s, r) => s + r.votes, 0);
    rows.forEach(row => {
      row.ownership = totalValue > 0 ? row.amount / totalValue * 100 : NaN;
      row.voteShare = totalVotes > 0 ? row.votes / totalVotes * 100 : totalVotes === 0 ? 0 : NaN;
    });
    const names = rows.filter(r => r.categoryMode === 'new').map(r => r.categoryName?.trim()).filter(Boolean);
    const duplicateNames = new Set(names).size !== names.length;
    const invalid = rows.some(r => !Number.isFinite(r.amount) || !Number.isFinite(r.votes) || r.missingCategory || (r.categoryMode === 'new' && (!r.categoryName?.trim() || !r.rights?.trim()))) || duplicateNames;
    return { rows, totalValue, totalCount, totalVotes, invalid, duplicateNames };
  }
  function shareSnapshot(snapshot, scope) {
    const copy = JSON.parse(JSON.stringify(snapshot));
    delete copy.versions;
    if (scope === 'capital') { delete copy.dealEngineering; delete copy.partnership; copy.capital.bank = ''; }
    copy.shareScope = scope;
    return copy;
  }
  return Object.freeze({ western, parse, format, money, resolveClasses, stocksCalc, shareSnapshot });
});
