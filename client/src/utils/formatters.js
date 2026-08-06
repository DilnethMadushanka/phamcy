/**
 * Format amounts into Sri Lankan Rupees (LKR / Rs.)
 */
export const formatPrice = (amount) => {
  const val = parseFloat(amount || 0);
  return `Rs. ${val.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default formatPrice;
