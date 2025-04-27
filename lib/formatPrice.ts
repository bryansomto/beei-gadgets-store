/**
 * Formats a number as a currency string with reliable symbol display
 * @param {number} price - The price to format
 * @param {string} [currency='NGN'] - ISO 4217 currency code (default: 'NGN')
 * @param {string} [locale='en-NG'] - BCP 47 language tag (default: 'en-NG' for NGN)
 * @returns {string} Formatted currency string with correct symbol
 * @throws {Error} If price is not a finite number
 * @example
 * formatPrice(1500) // returns "₦1,500.00"
 * formatPrice(2500.99, 'USD') // returns "$2,500.99"
 */
export function formatPrice(
  price: number,
  currency: string = 'NGN',
  locale: string = currency === 'NGN' ? 'en-NG' : 'en-US'
): string {
  // Validate input
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    throw new Error('Price must be a finite number');
  }

  // Handle negative zero
  const normalizedPrice = Object.is(price, -0) ? 0 : price;

  try {
    // First attempt with proper locale
    let formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(normalizedPrice);

    // Force ₦ symbol for NGN if not displayed correctly
    if (currency === 'NGN' && formatted.includes('NGN')) {
      formatted = formatted.replace('NGN', '₦');
    }
    
    return formatted;
  } catch (error) {
    console.error('Currency formatting error:', error);
    // Fallback to manual formatting with symbol mapping
    const symbol = getCurrencySymbol(currency);
    const formattedValue = normalizedPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${symbol}${formattedValue}`;
  }
}

/**
 * Gets currency symbol with guaranteed symbol for NGN
 * @param {string} currency - ISO 4217 currency code
 * @returns {string} Currency symbol (always ₦ for NGN)
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    NGN: '₦',  // Guaranteed Naira symbol
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: '$',
    AUD: '$',
    CNY: '¥',
    INR: '₹'
  };
  
  // Return symbol or currency code if not found
  return symbols[currency] || currency;
}