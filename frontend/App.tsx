import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import WalletConnectScreen from './src/screens/WalletConnectScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FlashLoanScreen from './src/screens/FlashLoanScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { WalletProvider } from './src/context/WalletContext';
import { APIProvider } from './src/context/APIContext';

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac6',
    background: '#f6f6f6',
    surface: '#ffffff',
    text: '#000000',
    onSurface: '#000000',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <APIProvider>
        <WalletProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="WalletConnect"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#6200ee',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="WalletConnect" 
                component={WalletConnectScreen}
                options={{ title: 'Connect Wallet' }}
              />
              <Stack.Screen 
                name="Dashboard" 
                component={DashboardScreen}
                options={{ title: 'Dashboard' }}
              />
              <Stack.Screen 
                name="FlashLoan" 
                component={FlashLoanScreen}
                options={{ title: 'Flash Loan' }}
              />
              <Stack.Screen 
                name="History" 
                component={HistoryScreen}
                options={{ title: 'Transaction History' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </WalletProvider>
      </APIProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});