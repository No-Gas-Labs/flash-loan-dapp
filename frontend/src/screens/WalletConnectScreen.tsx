import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Title,
  Paragraph,
  Button,
  Card,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import { useWallet } from '../context/WalletContext';

const WalletConnectScreen: React.FC = ({ navigation }) => {
  const { connectWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const blockchains = [
    {
      name: 'EOS',
      symbol: 'EOS',
      color: '#000000',
      address: '0x1234567890abcdef',
    },
    {
      name: 'TON',
      symbol: 'TON',
      color: '#0088cc',
      address: 'EQD_1234567890abcdef',
    },
    {
      name: 'SUI',
      symbol: 'SUI',
      color: '#6f00ff',
      address: '0x1234567890abcdef',
    },
  ];

  const handleConnect = async (blockchain: string, address: string) => {
    setLoading(true);
    try {
      await connectWallet(blockchain, address);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Flash Loan dApp</Title>
        <Paragraph style={styles.subtitle}>
          Connect your wallet to start using flash loans across EOS, TON, and SUI
        </Paragraph>
      </View>

      <View style={styles.content}>
        {blockchains.map((blockchain) => (
          <Card key={blockchain.name} style={styles.card}>
            <Card.Content>
              <View style={styles.blockchainHeader}>
                <Avatar.Text
                  size={40}
                  label={blockchain.symbol}
                  style={{ backgroundColor: blockchain.color }}
                />
                <Title style={styles.blockchainName}>{blockchain.name}</Title>
              </View>
              <Paragraph>Connect your {blockchain.name} wallet to access flash loans</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => handleConnect(blockchain.name, blockchain.address)}
                disabled={loading}
                loading={loading}
              >
                Connect {blockchain.name} Wallet
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 28,
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 15,
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  blockchainName: {
    marginLeft: 10,
    fontSize: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default WalletConnectScreen;