import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface APIContextType {
  backendURL: string;
  getBalance: (address: string, blockchain: string) => Promise<any>;
  executeFlashLoan: (params: FlashLoanParams) => Promise<any>;
  getTransactionHistory: (address: string, blockchain?: string) => Promise<any>;
}

interface FlashLoanParams {
  blockchain: string;
  amount: number;
  token: string;
  duration: number;
  walletAddress: string;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

interface APIProviderProps {
  children: ReactNode;
}

export const APIProvider: React.FC<APIProviderProps> = ({ children }) => {
  const backendURL = 'http://localhost:3000';

  const getBalance = async (address: string, blockchain: string) => {
    try {
      const response = await axios.get(`${backendURL}/api/wallet/balance/${address}`, {
        params: { blockchain }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  };

  const executeFlashLoan = async (params: FlashLoanParams) => {
    try {
      const response = await axios.post(`${backendURL}/api/flashloan/execute`, params);
      return response.data;
    } catch (error) {
      console.error('Error executing flash loan:', error);
      throw error;
    }
  };

  const getTransactionHistory = async (address: string, blockchain?: string) => {
    try {
      const response = await axios.get(`${backendURL}/api/transactions/${address}`, {
        params: { blockchain }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  };

  return (
    <APIContext.Provider value={{
      backendURL,
      getBalance,
      executeFlashLoan,
      getTransactionHistory,
    }}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = () => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
};