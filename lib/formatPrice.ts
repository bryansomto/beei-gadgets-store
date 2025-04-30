/**
 * Formats a number as a currency string with reliable symbol display
 * @param {unknown} price - The price to format (number, string, or other)
 * @param {string} [currency='NGN'] - ISO 4217 currency code (default: 'NGN')
 * @param {string} [locale] - BCP 47 language tag (auto-detected if not provided)
 * @param {Intl.NumberFormatOptions} [options] - Additional formatting options
 * @returns {string} Formatted currency string with correct symbol
 * @example
 * formatPrice(1500) // returns "₦1,500.00"
 * formatPrice(2500.99, 'USD') // returns "$2,500.99"
 * formatPrice("1500.50") // returns "₦1,500.50"
 */
export function formatPrice(
  price: unknown,
  currency: string = 'NGN',
  locale?: string,
  options: Intl.NumberFormatOptions = {}
): string {
  // Default options with overrides
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };

  // Convert and validate input
  const numericPrice = convertToNumber(price);
  if (numericPrice === null) {
    console.warn('Invalid price value:', price);
    return getFallbackFormat(0, currency);
  }

  // Handle negative zero
  const normalizedPrice = Object.is(numericPrice, -0) ? 0 : numericPrice;

  // Auto-detect locale if not provided
  const detectedLocale = locale || getDefaultLocale(currency);

  try {
    // First attempt with proper locale
    let formatted = new Intl.NumberFormat(detectedLocale, defaultOptions).format(normalizedPrice);

    // Special handling for NGN if symbol isn't displayed correctly
    if (currency === 'NGN' && !formatted.includes('₦')) {
      formatted = formatted.replace(/NGN/g, '₦');
    }

    return formatted;
  } catch (error) {
    console.error('Currency formatting error:', error);
    return getFallbackFormat(normalizedPrice, currency);
  }
}

// Helper functions

function convertToNumber(price: unknown): number | null {
  if (typeof price === 'number') {
    return Number.isFinite(price) ? price : null;
  }
  
  if (typeof price === 'string') {
    // Remove currency symbols and thousands separators
    const cleaned = price.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getDefaultLocale(currency: string): string {
  const localeMap: Record<string, string> = {
    NGN: 'en-NG',
    USD: 'en-US',
    EUR: 'de-DE', // Germany uses comma as decimal separator
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CNY: 'zh-CN'
  };
  
  return localeMap[currency] || 'en-US';
}

function getFallbackFormat(price: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const formattedValue = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol}${formattedValue}`;
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    KRW: '₩',
    BRL: 'R$',
    RUB: '₽'
  };
  
  // Return symbol or currency code if not found
  return symbols[currency] || currency;
}