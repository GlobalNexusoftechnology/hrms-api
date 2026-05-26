export function formatCurrency(value: number) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
  })}`;
}

export function getMonthName(month: number) {
  return new Date(2026, month - 1).toLocaleString('default', {
    month: 'long',
  });
}
