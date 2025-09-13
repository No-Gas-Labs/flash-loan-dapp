import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Button,
  Avatar,
  ActivityIndicator,
  List,
} from 'react-native-paper';
import { useWallet } from '../context/WalletContext';
import { useAPI } from '../context/APIContext';

const DashboardScreen: React.FC = ({ navigation }) => {
  const { address, blockchain, disconnectWallet } = useWallet();
  const { getBalance, getTransactionHistory } = useAPI();
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!address || !blockchain) return;
    
    try {
      const [balanceData, transactionsData] = await Promise.all([
        getBalance(address, blockchain),
        getTransactionHistory(address, blockchain),
      ]);
      
      setBalance(balanceData);
      setTransactions(transactionsData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    navigation.reset({
      index: 0,
      routes: [{ name: 'WalletConnect' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.title}>Dashboard</Title>
        <Paragraph style={styles.subtitle}>
          {blockchain} Wallet: {address?.substring(0, 10)}...{address?.substring(address.length - 4)}
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Balances</Title>
          {balance && Object.entries(balance.balances || {}).map(([token, amount]) => (
            <View key={token} style={styles.balanceRow}>
              <Paragraph style={styles.token}>{token}</Paragraph>
              <Paragraph style={styles.amount}>{amount}</Paragraph>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('FlashLoan')}
              style={styles.actionButton}
            >
              New Flash Loan
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('History')}
              style={styles.actionButton}
            >
              View History
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Transactions</Title>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <List.Item
                key={tx.id}
                title={`${tx.loan_amount} ${tx.loan_token}`}
                description={`${tx.status} - ${new Date(tx.created_at).toLocaleDateString()}`}
                left={(props) => <List.Icon {...props} icon="swap-horizontal" />}
              />
            ))
          ) : (
            <Paragraph>No transactions yet</Paragraph>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Actions>
          <Button mode="text" onPress={handleDisconnect} textColor="red">
            Disconnect Wallet
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 24,
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  card: {
    margin: 15,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  token: {
    fontWeight: 'bold',
  },
  amount: {
    color: '#6200ee',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    marginHorizontal: 5,
  },
});

export default DashboardScreen;