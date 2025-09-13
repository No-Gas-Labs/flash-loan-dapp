import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  blockchain: string | null;
  connectWallet: (blockchain: string, address: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [blockchain, setBlockchain] = useState<string | null>(null);

  useEffect(() => {
    loadWalletState();
  }, []);

  const loadWalletState = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem('walletAddress');
      const savedBlockchain = await AsyncStorage.getItem('blockchain');
      
      if (savedAddress && savedBlockchain) {
        setAddress(savedAddress);
        setBlockchain(savedBlockchain);
        setConnected(true);
      }
    } catch (error) {
      console.error('Error loading wallet state:', error);
    }
  };

  const connectWallet = async (selectedBlockchain: string, walletAddress: string) => {
    try {
      await AsyncStorage.setItem('walletAddress', walletAddress);
      await AsyncStorage.setItem('blockchain', selectedBlockchain);
      
      setAddress(walletAddress);
      setBlockchain(selectedBlockchain);
      setConnected(true);
      
      // Register with backend
      await fetch('http://localhost:3000/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          blockchain: selectedBlockchain,
        }),
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await AsyncStorage.multiRemove(['walletAddress', 'blockchain']);
      
      setAddress(null);
      setBlockchain(null);
      setConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <WalletContext.Provider value={{
      connected,
      address,
      blockchain,
      connectWallet,
      disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};