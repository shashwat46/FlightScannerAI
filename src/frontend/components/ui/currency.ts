export function formatCurrency(amount?: number, currency?: string) {
  if (typeof amount !== 'number' || !isFinite(amount)) return '-';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency === 'USD' ? '$' : currency || ''}${Math.round(amount)}`;
  }
}
