import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityIndicator, Button } from 'react-native-paper';
import { BottomSheet } from '../../components/ui/bottom-sheet';
import { useSnackbar } from '../../components/ui/snackbar-provider';
import { createStyles } from "../../constants/styles";
import { BorderRadius, Colors, Spacing } from "../../constants/tokens";
import { useColorScheme } from "../../hooks/use-color-scheme";
import {
  Customer,
  getCustomersWithBalance,
  updateCustomerBalance,
} from "../../services/database";

interface CustomerItemProps {
  item: Customer;
  onPayment: (customer: Customer) => void;
  colors: any;
  styles: any;
}

function CustomerItem({ item, onPayment, colors, styles }: CustomerItemProps) {
  return (
    <View style={[styles.listItemCompact, { marginBottom: Spacing.md }]}>
      <View style={styles.flexRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading3}>{item.name}</Text>
          {item.phoneNumber && (
            <Text style={styles.bodySecondary}>{item.phoneNumber}</Text>
          )}
          <Text
            style={[
              styles.body,
              { color: colors.error, marginTop: Spacing.xs },
            ]}
          >
            Outstanding: ${item.outstandingBalance.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onPayment(item)}
          style={[styles.buttonPrimary, { paddingHorizontal: Spacing.md }]}
        >
          <Text style={[styles.body, { color: colors.textInverse }]}>Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CustomersScreen() {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const colors = Colors[colorScheme];

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState("");

  const { showSnackbar } = useSnackbar();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const customersData = await getCustomersWithBalance();
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showSnackbar({ message: 'Failed to load customers', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

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
    setSelectedCustomer(customer);
    setPaymentAmount("");
    setShowPaymentSheet(true);
  };

  const processPayment = async () => {
    if (!selectedCustomer) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid payment amount");
      return;
    }

    if (amount > selectedCustomer.outstandingBalance) {
      Alert.alert(
        "Warning",
        `Payment amount ($${amount.toFixed(
          2
        )}) is greater than outstanding balance ($${selectedCustomer.outstandingBalance.toFixed(
          2
        )}). Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: async () => {
              await completePayment(selectedCustomer, amount);
            },
          },
        ]
      );
      return;
    }

    await completePayment(selectedCustomer, amount);
  };

  const completePayment = async (customer: Customer, amount: number) => {
    try {
      // Subtract payment from customer balance (negative amount reduces balance)
      await updateCustomerBalance(customer.id, -amount);

      showSnackbar({ message: `Payment of $${amount.toFixed(2)} recorded for ${customer.name}`, type: 'success' });

      // Refresh the list
      await fetchCustomers();
    } catch (error) {
      console.error("Error processing payment:", error);
      showSnackbar({ message: 'Failed to record payment', type: 'error' });
    } finally {
      setShowPaymentSheet(false);
      setSelectedCustomer(null);
      setPaymentAmount("");
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

  const totalOutstanding = customers.reduce(
    (sum, customer) => sum + customer.outstandingBalance,
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeContainer}>
        {/* Header */}
        <View
          style={[
            styles.flexRow,
            {
              marginTop: Spacing.lg,
              marginBottom: Spacing.lg,
              justifyContent: "space-between",
              alignItems: "center",
            },
          ]}
        >
          <Text style={styles.heading1}>Credit Customers</Text>
          {totalOutstanding > 0 && (
            <View
              style={[
                {
                  backgroundColor: colors.surface,
                  padding: Spacing.sm,
                  borderRadius: BorderRadius.md,
                },
              ]}
            >
              <Text style={styles.bodySecondary}>Total Outstanding</Text>
              <Text style={[styles.heading3, { color: colors.error }]}>
                ${totalOutstanding.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Customers List */}
        {loading && !refreshing ? (
          <View style={styles.emptyState}>
            <ActivityIndicator />
            <Text style={[styles.emptyStateText, { marginTop: Spacing.sm }]}>Loading customers...</Text>
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
        <BottomSheet visible={showPaymentSheet} onDismiss={() => setShowPaymentSheet(false)} snapPoint={0.55}>
          <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl }}>
            <View style={[styles.flexRow, { justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }]}>
              <Text style={styles.heading2}>Record Payment</Text>
              <Button onPress={() => setShowPaymentSheet(false)}>Cancel</Button>
            </View>
            <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Customer</Text>
            <Text style={[styles.body, { marginBottom: Spacing.md }]}>{selectedCustomer?.name}</Text>
            <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Amount</Text>
            <TextInput
              style={[styles.inputCompact, { marginBottom: Spacing.lg }]}
              placeholder="Enter payment amount"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
            />
            <Button mode='contained' onPress={processPayment}>Confirm Payment</Button>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}
