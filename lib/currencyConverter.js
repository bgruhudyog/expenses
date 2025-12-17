// lib/currencyConverter.js
// Utility functions for currency conversion

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/INR';

let cachedRates = null;
let lastFetchTime = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch current exchange rates from API
 * Uses caching to avoid excessive API calls
 */
export async function fetchExchangeRates() {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (cachedRates && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }
  
  try {
    const response = await fetch(EXCHANGE_API_URL);
    const data = await response.json();
    
    cachedRates = {
      USD: data.rates.USD,
      EUR: data.rates.EUR,
      INR: 1 // Base currency
    };
    
    lastFetchTime = now;
    
    return cachedRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if API fails
    return {
      USD: 0.012,  // Approximate: 1 INR = 0.012 USD
      EUR: 0.011,  // Approximate: 1 INR = 0.011 EUR
      INR: 1
    };
  }
}

/**
 * Convert amount from one currency to INR
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency (USD, EUR, INR)
 * @returns {Promise<number>} - Amount in INR
 */
export async function convertToINR(amount, fromCurrency) {
  if (fromCurrency === 'INR') {
    return amount;
  }
  
  const rates = await fetchExchangeRates();
  
  // Convert: amount in foreign currency / rate = amount in INR
  // Example: $100 / 0.012 = ₹8333.33
  return amount / rates[fromCurrency];
}

/**
 * Convert amount from INR to another currency
 * @param {number} amount - Amount in INR
 * @param {string} toCurrency - Target currency (USD, EUR, INR)
 * @returns {Promise<number>} - Amount in target currency
 */
export async function convertFromINR(amount, toCurrency) {
  if (toCurrency === 'INR') {
    return amount;
  }
  
  const rates = await fetchExchangeRates();
  
  // Convert: amount in INR * rate = amount in foreign currency
  return amount * rates[toCurrency];
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} - Currency symbol
 */
export function getCurrencySymbol(currency) {
  const symbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€'
  };
  
  return symbols[currency] || currency;
}

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted amount with symbol
 */
export function formatCurrency(amount, currency) {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}