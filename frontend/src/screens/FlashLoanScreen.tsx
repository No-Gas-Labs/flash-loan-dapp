import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Button,
  TextInput,
  HelperText,
  RadioButton,
} from 'react-native-paper';
import { useWallet } from '../context/WalletContext';
import { useAPI } from '../context/APIContext';

const FlashLoanScreen: React.FC = ({ navigation }) => {
  const { address, blockchain } = useWallet();
  const { executeFlashLoan } = useAPI();
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('EOS');
  const [duration, setDuration] = useState('300'); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tokens = {
    EOS: ['EOS', 'USDT', 'USDC'],
    TON: ['TON', 'USDT', 'USDC'],
    SUI: ['SUI', 'USDT', 'USDC'],
  };

  const handleExecuteFlashLoan = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await executeFlashLoan({
        blockchain: blockchain!,
        amount: parseFloat(amount),
        token: token,
        duration: parseInt(duration),
        walletAddress: address!,
      });

      Alert.alert(
        'Flash Loan Executed',
        `Transaction ID: ${response.transactionHash}\nAmount: ${response.loanAmount}\nFee: ${response.feeAmount}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
    } catch (error) {
      setError('Failed to execute flash loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Flash Loan</Title>
        <Paragraph>
          Borrow tokens instantly and repay with interest
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Loan Details</Title>
          
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="Enter amount"
            right={<TextInput.Affix text={token} />}
          />

          <TextInput
            label="Token"
            value={token}
            onChangeText={setToken}
            style={styles.input}
            editable={false}
          />

          <TextInput
            label="Duration (seconds)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            style={styles.input}
          />

          <HelperText type="info">
            Fee: 0.1% of loan amount
          </HelperText>

          {error && (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          )}
        </Card.Content>

        <Card.Actions>
          <Button
            mode="contained"
            onPress={handleExecuteFlashLoan}
            loading={loading}
            disabled={loading || !amount}
          >
            Execute Flash Loan
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>How it works</Title>
          <Paragraph>
            1. Enter the amount you want to borrow
            {'\n'}
            2. Choose the token and duration
            {'\n'}
            3. Execute the flash loan
            {'\n'}
            4. Repay with interest within the duration
          </Paragraph>
        </Card.Content>
      </Card>
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
    fontSize: 24,
    color: 'white',
  },
  card: {
    margin: 15,
  },
  input: {
    marginBottom: 10,
  },
});

export default FlashLoanScreen;