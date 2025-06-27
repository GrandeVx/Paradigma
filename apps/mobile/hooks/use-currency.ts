import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'it-IT' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'hi-IN' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'en-HK' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
];

const CURRENCY_STORAGE_KEY = 'selected_currency';
const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0]; // EUR

export const useCurrency = () => {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  // Load currency from storage on mount
  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const storedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
      if (storedCurrency) {
        const parsedCurrency = JSON.parse(storedCurrency);
        const foundCurrency = SUPPORTED_CURRENCIES.find(c => c.code === parsedCurrency.code);
        if (foundCurrency) {
          setCurrencyState(foundCurrency);
        }
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(newCurrency));
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const getCurrencySymbol = () => currency.symbol;

  const formatCurrency = (amount: number | string, options?: {
    showSymbol?: boolean;
    showSign?: boolean;
    decimals?: number;
  }) => {
    const {
      showSymbol = true,
      showSign = false,
      decimals = 2
    } = options || {};

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const isNegative = numAmount < 0;
    const absAmount = Math.abs(numAmount);

    let formatted: string;

    try {
      // Use the currency's locale for formatting
      formatted = absAmount.toLocaleString(currency.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } catch (error) {
      // Fallback to basic formatting
      formatted = absAmount.toFixed(decimals);
    }

    let result = '';

    // Add sign if requested
    if (showSign) {
      result += isNegative ? '- ' : '+ ';
    } else if (isNegative) {
      result += '- ';
    }

    // Add symbol if requested
    if (showSymbol) {
      result += `${currency.symbol} `;
    }

    result += formatted;

    return result;
  };

  const formatAmount = (amount: number | string, showSign: boolean = false) => {
    return formatCurrency(amount, { showSign });
  };

  return {
    currency,
    setCurrency,
    getCurrencySymbol,
    formatCurrency,
    formatAmount,
    isLoading,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
}; 