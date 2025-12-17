


import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { MdAdd } from 'react-icons/md';
import supabase from '../lib/supabase';
import BalanceCard from '../components/Dashboard/BalanceCard';
import CurrencyConverter from '../components/Dashboard/CurrencyConverter';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import CategoryBreakdown from '../components/Dashboard/CategoryBreakdown';
import TransactionModal from '../components/TransactionModal';

const Home: NextPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  const [digitalBalance, setDigitalBalance] = useState(0);
  const [cashBreakdown, setCashBreakdown] = useState({ INR: 0, USD: 0, EUR: 0 });
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setTransactions(data || []);
      calculateBalances(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch exchange rates with Supabase fallback
  const fetchExchangeRates = async () => {
    try {
      // Try API first
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      const data = await response.json();
      
      const rates = {
        USD: data.rates.USD,
        EUR: data.rates.EUR,
        INR: 1
      };
      
      // Immediately save fresh rates to Supabase for future use
      try {
        // Update USD rate
        await supabase
          .from('exchange_rates')
          .upsert({
            currency_code: 'USD',
            currency_name: 'US Dollar',
            rate_to_inr: 1 / rates.USD // Convert to "1 USD = X INR"
          }, {
            onConflict: 'currency_code'
          });
        
        // Update EUR rate
        await supabase
          .from('exchange_rates')
          .upsert({
            currency_code: 'EUR',
            currency_name: 'Euro',
            rate_to_inr: 1 / rates.EUR // Convert to "1 EUR = X INR"
          }, {
            onConflict: 'currency_code'
          });
        
        console.log('Exchange rates updated in Supabase');
      } catch (updateError) {
        console.error('Failed to update rates in Supabase:', updateError);
        // Continue anyway - we have the rates
      }
      
      return rates;
      
    } catch (error) {
      console.error('API failed, fetching from Supabase:', error);
      
      // Fallback to Supabase
      try {
        const { data, error } = await supabase
          .from('exchange_rates')
          .select('currency_code, rate_to_inr')
          .in('currency_code', ['USD', 'EUR']);
        
        if (error) throw error;
        
        const rates = { INR: 1 };
        data.forEach(rate => {
          rates[rate.currency_code] = 1 / rate.rate_to_inr;
        });
        
        return rates;
      } catch (dbError) {
        console.error('Supabase fallback failed:', dbError);
        // Last resort hardcoded fallback
        return {
          USD: 0.012,
          EUR: 0.011,
          INR: 1
        };
      }
    }
  };

  // Convert foreign currency to INR
  const convertToINR = async (amount, currency) => {
    if (currency === 'INR') return amount;
    const rates = await fetchExchangeRates();
    return amount / rates[currency];
  };

  const calculateBalances = async (transactionList) => {
    let digital = 0;
    let cashByCurrency = {
      INR: 0,
      USD: 0,
      EUR: 0
    };

    // Calculate balances by currency
    transactionList.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      let multiplier = 0;
      
      if (transaction.type === 'income') {
        multiplier = 1;
      } else if (transaction.type === 'expense') {
        multiplier = -1;
      } else if (transaction.type === 'credit') {
        multiplier = transaction.creditType ? -1 : 1; // true = given (expense), false = taken (income)
      }

      const effectiveAmount = amount * multiplier;

      if (transaction.walletType === 'digital') {
        digital += effectiveAmount;
      } else if (transaction.walletType === 'cash') {
        const currency = transaction.currency || 'INR';
        cashByCurrency[currency] = (cashByCurrency[currency] || 0) + effectiveAmount;
      }
    });

    // Convert all cash to INR for total
    let totalCashInINR = cashByCurrency.INR;
    
    if (cashByCurrency.USD !== 0) {
      const usdInINR = await convertToINR(cashByCurrency.USD, 'USD');
      totalCashInINR += usdInINR;
    }
    
    if (cashByCurrency.EUR !== 0) {
      const eurInINR = await convertToINR(cashByCurrency.EUR, 'EUR');
      totalCashInINR += eurInINR;
    }

    setCashBalance(totalCashInINR);
    setDigitalBalance(digital);
    setCashBreakdown(cashByCurrency);
  };

  const handleAddTransaction = async (newTransaction) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select();
      
      if (error) throw error;
      
      const updatedTransactions = [data[0], ...transactions];
      setTransactions(updatedTransactions);
      calculateBalances(updatedTransactions);
      
      // Show snackbar
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  return (
    <div>
      <h1>Rajyavardhan's Dashboard</h1>
      
      <BalanceCard 
        cashBalance={cashBalance} 
        digitalBalance={digitalBalance}
        cashBreakdown={cashBreakdown}
      />
      
      <CurrencyConverter />
      
      <RecentTransactions transactions={transactions} />
      
      <CategoryBreakdown 
        transactions={transactions} 
        categories={categories}
      />
      
      <div className="fab" onClick={() => setIsModalOpen(true)}>
        <MdAdd size={24} />
      </div>
      
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        categories={categories}
      />
      
      {showSnackbar && (
        <div className="snackbar">
          Transaction created successfully
        </div>
      )}
    </div>
  );
};

export default Home;