import { useState, useEffect } from 'react';

export default function CurrencyConverter() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [amount, setAmount] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Top 5 currencies with flags
  const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' }
  ];

  // Fetch exchange rate when currency changes
  useEffect(() => {
    fetchExchangeRate(selectedCurrency);
  }, [selectedCurrency]);

  // Update converted amount when amount or rate changes
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    setConvertedAmount(numAmount * exchangeRate);
  }, [amount, exchangeRate]);

  const fetchExchangeRate = async (currency) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
      const data = await response.json();
      const rate = data.rates.INR;
      setExchangeRate(rate);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Fallback rates
      const fallbackRates = {
        'USD': 83.12,
        'EUR': 90.45,
        'GBP': 105.23,
        'JPY': 0.56,
        'AUD': 54.87
      };
      setExchangeRate(fallbackRates[currency] || 83.12);
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (amount === '1') {
      setAmount('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (amount === '' || amount === '0') {
      setAmount('1');
    }
  };

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  return (
    <div className="currency-converter card">
      <h3 className="converter-title">💱 Currency Converter</h3>
      
      <div className="converter-form">
        {/* Currency Selector */}
        <div className="form-row">
          <label className="form-label">From Currency</label>
          <div className="currency-select-wrapper">
            <span className="currency-flag-display">{selectedCurrencyData?.flag}</span>
            <select 
              className="currency-select"
              value={selectedCurrency}
              onChange={handleCurrencyChange}
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Input */}
        <div className="form-row">
          <label className="form-label">Amount</label>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">{selectedCurrencyData?.symbol}</span>
            <input
              type="text"
              className="amount-input"
              value={amount}
              onChange={handleAmountChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="1"
            />
          </div>
        </div>

        {/* Exchange Rate Display */}
        <div className="rate-display">
          <span className="rate-label">Exchange Rate:</span>
          <span className="rate-value">
            {isLoading ? (
              'Loading...'
            ) : (
              `1 ${selectedCurrency} = ₹${exchangeRate.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            )}
          </span>
        </div>

        {/* Converted Amount Display */}
        <div className="converted-display">
          <div className="converted-label">Converted Amount</div>
          <div className="converted-amount">
            {isLoading ? (
              <span className="loading-text">Calculating...</span>
            ) : (
              <>
                <span className="inr-symbol">₹</span>
                <span className="amount-value">
                  {convertedAmount.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .currency-converter {
          margin-top: 24px;
          padding: 24px;
        }

        .converter-title {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.2rem;
          color: var(--text);
        }

        .converter-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .currency-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-flag-display {
          position: absolute;
          left: 12px;
          font-size: 1.3rem;
          pointer-events: none;
          z-index: 1;
        }

        .currency-select {
          width: 100%;
          padding: 12px 16px 12px 45px;
          border-radius: 8px;
          border: 1px solid var(--divider);
          background-color: var(--surface);
          color: var(--text);
          font-size: 1rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .currency-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .currency-select option {
          background-color: var(--surface);
          color: var(--text);
          padding: 8px;
        }

        .amount-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 12px;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          pointer-events: none;
        }

        .amount-input {
          width: 100%;
          padding: 12px 16px 12px 35px;
          border-radius: 8px;
          border: 1px solid var(--divider);
          background-color: var(--surface);
          color: var(--text);
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .amount-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .rate-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          margin-top: 8px;
        }

        .rate-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .rate-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
        }

        .converted-display {
          margin-top: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%);
          border: 1px solid rgba(37, 99, 235, 0.3);
          border-radius: 12px;
          text-align: center;
        }

        .converted-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .converted-amount {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .inr-symbol {
          font-size: 1.8rem;
          color: var(--primary);
          font-weight: bold;
        }

        .amount-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text);
        }

        .loading-text {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 480px) {
          .currency-converter {
            padding: 20px;
          }

          .amount-value {
            font-size: 1.6rem;
          }

          .inr-symbol {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}