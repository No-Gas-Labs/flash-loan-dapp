import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  List,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useWallet } from '../context/WalletContext';
import { useAPI } from '../context/APIContext';

interface Transaction {
  id: number;
  blockchain: string;
  transaction_hash: string;
  loan_amount: string;
  loan_token: string;
  fee_amount: string;
  status: string;
  created_at: string;
  repaid_at?: string;
}

const HistoryScreen: React.FC = () => {
  const { address, blockchain } = useWallet();
  const { getTransactionHistory } = useAPI();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  const loadTransactionHistory = async () => {
    if (!address) return;
    
    try {
      const data = await getTransactionHistory(address, blockchain);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactionHistory();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return '#4caf50';
      case 'repaid':
        return '#2196f3';
      case 'pending':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <Title>{item.loan_amount} {item.loan_token}</Title>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
        </View>
        
        <List.Item
          title="Blockchain"
          description={item.blockchain.toUpperCase()}
          left={(props) => <List.Icon {...props} icon="database" />}
        />
        
        <List.Item
          title="Fee"
          description={`${item.fee_amount} ${item.loan_token}`}
          left={(props) => <List.Icon {...props} icon="cash" />}
        />
        
        <List.Item
          title="Transaction Hash"
          description={`${item.transaction_hash.substring(0, 10)}...${item.transaction_hash.substring(item.transaction_hash.length - 4)}`}
          left={(props) => <List.Icon {...props} icon="file-document" />}
        />
        
        <List.Item
          title="Date"
          description={new Date(item.created_at).toLocaleString()}
          left={(props) => <List.Icon {...props} icon="calendar" />}
        />
        
        {item.repaid_at && (
          <List.Item
            title="Repaid"
            description={new Date(item.repaid_at).toLocaleString()}
            left={(props) => <List.Icon {...props} icon="check-circle" />}
          />
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title>No transactions found</Title>
              <Paragraph>Start by executing your first flash loan</Paragraph>
            </Card.Content>
          </Card>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
  },
  card: {
    marginBottom: 15,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyCard: {
    margin: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HistoryScreen;