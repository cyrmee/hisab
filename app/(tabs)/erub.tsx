import { FontAwesome } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { createStyles } from '../../constants/styles';
import { Spacing, Colors } from '../../constants/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { 
  getCustomersWithBalance,
  updateCustomerBalance,
  Customer 
} from '../../services/database';

interface CustomerItemProps {
  item: Customer;
  onPayment: (customer: Customer) => void;
  colors: any;
  styles: any;
}

function CustomerItem({ item, onPayment, colors, styles }: CustomerItemProps) {
  return (
    <View style={[styles.productCard, { marginBottom: Spacing.md }]}>
      <View style={styles.flexRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading3}>{item.name}</Text>
          {item.phoneNumber && (
            <Text style={styles.bodySecondary}>{item.phoneNumber}</Text>
          )}
          <Text style={[styles.bodyPrimary, { color: colors.danger, marginTop: Spacing.xs }]}>
            Outstanding: ${item.outstandingBalance.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onPayment(item)}
          style={[styles.buttonPrimary, { paddingHorizontal: Spacing.md }]}
        >
          <Text style={styles.buttonPrimaryText}>Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CustomersScreen() {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme ?? 'light');
  const colors = Colors[colorScheme ?? 'light'];

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const customersData = await getCustomersWithBalance();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  }, [fetchCustomers]);

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [fetchCustomers])
  );

  const handlePayment = (customer: Customer) => {
    Alert.prompt(
      'Payment',
      `Enter payment amount for ${customer.name}\nOutstanding balance: $${customer.outstandingBalance.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Record Payment', 
          onPress: async (amount) => {
            if (!amount) return;
            
            const paymentAmount = parseFloat(amount);
            if (isNaN(paymentAmount) || paymentAmount <= 0) {
              Alert.alert('Error', 'Please enter a valid payment amount');
              return;
            }

            if (paymentAmount > customer.outstandingBalance) {
              Alert.alert(
                'Warning', 
                `Payment amount ($${paymentAmount.toFixed(2)}) is greater than outstanding balance ($${customer.outstandingBalance.toFixed(2)}). Continue?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Continue', 
                    onPress: async () => {
                      await processPayment(customer, paymentAmount);
                    }
                  }
                ]
              );
              return;
            }

            await processPayment(customer, paymentAmount);
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const processPayment = async (customer: Customer, amount: number) => {
    try {
      // Subtract payment from customer balance (negative amount reduces balance)
      await updateCustomerBalance(customer.id, -amount);
      
      Alert.alert('Success', `Payment of $${amount.toFixed(2)} recorded for ${customer.name}`);
      
      // Refresh the list
      await fetchCustomers();
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to record payment');
    }
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <CustomerItem
      item={item}
      onPayment={handlePayment}
      colors={colors}
      styles={styles}
    />
  );

  const totalOutstanding = customers.reduce((sum, customer) => sum + customer.outstandingBalance, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeContainer}>
        {/* Header */}
        <View style={[styles.flexRow, { 
          marginTop: Spacing.lg, 
          marginBottom: Spacing.lg,
          justifyContent: 'space-between',
          alignItems: 'center' 
        }]}>
          <Text style={styles.heading1}>Credit Customers</Text>
          {totalOutstanding > 0 && (
            <View style={[styles.productCard, { padding: Spacing.sm }]}>
              <Text style={styles.bodySecondary}>Total Outstanding</Text>
              <Text style={[styles.heading3, { color: colors.danger }]}>
                ${totalOutstanding.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Customers List */}
        {loading && !refreshing ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading customers...</Text>
          </View>
        ) : customers.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyStateText, { marginTop: Spacing.md }]}>
              No customers with outstanding credit
            </Text>
            <Text style={styles.bodySecondary}>
              All customers have cleared their balances!
            </Text>
          </View>
        ) : (
          <FlatList
            data={customers}
            renderItem={renderCustomer}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            contentContainerStyle={{
              paddingBottom: Spacing.xl, // Space for bottom navigation
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}