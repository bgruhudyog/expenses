



import { useState, useEffect } from 'react';

export default function BalanceCard({ cashBalance, digitalBalance, cashBreakdown = null }) {
  const totalBalance = cashBalance + digitalBalance;

  // If no breakdown provided, show simple view
  const showBreakdown = cashBreakdown && (
    cashBreakdown.INR !== 0 || 
    cashBreakdown.USD !== 0 || 
    cashBreakdown.EUR !== 0
  );

  return (
    <div className="balance-card card">
      <h2 className="total-balance">₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</h2>
      <p className="balance-label">Total Balance</p>
      
      <div className="balance-details">
        <div className="balance-item">
          <span className="balance-type">💵 Cash</span>
          <span className="balance-amount">₹{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
        </div>
        <div className="balance-item">
          <span className="balance-type">💳 Digital</span>
          <span className="balance-amount">₹{digitalBalance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
        </div>
      </div>

      {showBreakdown && (
        <div className="currency-breakdown-section">
          <p className="breakdown-label">Cash by Currency</p>
          <div className="currency-list">
            {cashBreakdown.INR !== 0 && (
              <div className="currency-row">
                <span className="currency-flag">🇮🇳</span>
                <span className="currency-code">INR</span>
                <span className="currency-value">
                  ₹{cashBreakdown.INR.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            )}
            {cashBreakdown.USD !== 0 && (
              <div className="currency-row">
                <span className="currency-flag">🇺🇸</span>
                <span className="currency-code">USD</span>
                <span className="currency-value">
                  ${cashBreakdown.USD.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            )}
            {cashBreakdown.EUR !== 0 && (
              <div className="currency-row">
                <span className="currency-flag">🇪🇺</span>
                <span className="currency-code">EUR</span>
                <span className="currency-value">
                  €{cashBreakdown.EUR.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .balance-card {
          text-align: center;
          padding: 24px;
        }
        .total-balance {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 8px;
          color: var(--text);
        }
        .balance-label {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 24px;
        }
        .balance-details {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--divider);
        }
        .balance-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .balance-type {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }
        .balance-amount {
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .currency-breakdown-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--divider);
        }
        
        .breakdown-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 12px;
          text-align: center;
        }
        
        .currency-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .currency-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
        }
        
        .currency-flag {
          font-size: 1.2rem;
          margin-right: 8px;
        }
        
        .currency-code {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          flex: 1;
        }
        
        .currency-value {
          font-weight: 600;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}