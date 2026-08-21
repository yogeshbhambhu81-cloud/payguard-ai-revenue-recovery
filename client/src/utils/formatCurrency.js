export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};
