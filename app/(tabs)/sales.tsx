import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ActivityIndicator, Button, Chip, FAB, IconButton, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '../../components/ui/bottom-sheet';
import { createStyles } from '../../constants/styles';
import { BorderRadius, Colors, Spacing } from '../../constants/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';
import {
  createTransaction,
  deleteTransaction,
  getAllCustomers,
  getProducts,
  getTransactions,
  Product,
  Transaction,
  updateProduct,
  upsertCustomer,
} from '../../services/database';

interface SaleItem { product: Product; quantity: number; }
interface TransactionWithCustomer extends Transaction { customerName?: string; }

interface SalesItemProps { item: TransactionWithCustomer; onDelete: (t: Transaction) => void; colors: any; styles: any; }
function SalesListItem({ item, onDelete, colors, styles }: SalesItemProps) {
  return (
    <List.Item
      title={`$${item.totalAmount.toFixed(2)} • ${item.isCreditSale ? 'Credit' : 'Cash'}`}
      description={`${new Date(item.timestamp * 1000).toLocaleDateString()}${item.customerName ? ' • ' + item.customerName : ''}`}
      right={() => (
        <IconButton icon="delete" onPress={() => onDelete(item)} iconColor={colors.error} accessibilityLabel="Delete sale" />
      )}
      style={{ backgroundColor: colors.surface, borderRadius: 12, marginBottom: Spacing.sm }}
    />
  );
}

export default function SalesScreen() {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const colors = Colors[colorScheme];

  const [transactions, setTransactions] = useState<TransactionWithCustomer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // UI State
  const [showSaleSheet, setShowSaleSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [transactionsData, productsData, customers] = await Promise.all([
        getTransactions(100),
        getProducts(),
        getAllCustomers(),
      ]);
      const enriched = transactionsData.map(t => ({
        ...t,
        customerName: t.customerId ? customers.find(c => c.id === t.customerId)?.name : undefined,
      }));
      setTransactions(enriched);
      setProducts(productsData);
    } catch (e) {
      console.error('Error fetching data', e);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const addItemToSale = () => {
    if (!selectedProduct) return Alert.alert('Error', 'Please select a product');
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return Alert.alert('Error', 'Enter a valid quantity');
    if (qty > selectedProduct.quantity) return Alert.alert('Error', `Only ${selectedProduct.quantity} items in stock.`);

    setSaleItems(items => {
      const idx = items.findIndex(i => i.product.id === selectedProduct.id);
      if (idx >= 0) {
        const newItems = [...items];
        const newQty = newItems[idx].quantity + qty;
        if (newQty > selectedProduct.quantity) {
          Alert.alert('Error', 'Not enough stock for combined quantity');
          return items;
        }
        newItems[idx] = { ...newItems[idx], quantity: newQty };
        return newItems;
      }
      return [...items, { product: selectedProduct, quantity: qty }];
    });

    setSelectedProduct(null);
    setQuantity('1');
    setProductSearchQuery('');
    setShowProductDropdown(false);
  };

  const removeItemFromSale = (productId: number) => setSaleItems(items => items.filter(i => i.product.id !== productId));
  const calculateTotal = () => saleItems.reduce((sum, i) => sum + i.product.salePrice * i.quantity, 0);

  const processSale = async () => {
    if (!saleItems.length) return Alert.alert('Error', 'Please add items to the sale');
    if (isCreditSale && !customerName.trim()) return Alert.alert('Error', 'Customer name required for credit sales');
    setLoading(true);
    try {
      let customerId: number | undefined;
      if (isCreditSale) {
        customerId = await upsertCustomer(customerName.trim(), customerPhone.trim() || undefined);
      }
      const totalAmount = calculateTotal();
      await createTransaction(totalAmount, isCreditSale, customerId);
      for (const item of saleItems) {
        await updateProduct(item.product.id, item.product.name, item.product.salePrice, item.product.quantity - item.quantity);
      }
      Alert.alert('Success', 'Sale completed');
      setSaleItems([]);
      setSelectedProduct(null);
      setQuantity('1');
      setIsCreditSale(false);
      setCustomerName('');
      setCustomerPhone('');
      setProductSearchQuery('');
      setShowSaleSheet(false);
      await fetchData();
    } catch (e) {
      console.error('Error processing sale', e);
      Alert.alert('Error', 'Failed to process sale');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deleteTransaction(transaction.id); await fetchData(); Alert.alert('Deleted', 'Transaction removed'); }
          catch { Alert.alert('Error', 'Failed to delete transaction'); }
        }
      }
    ]);
  };

  const renderTransaction = ({ item }: { item: TransactionWithCustomer }) => (
    <SalesListItem item={item} onDelete={handleDeleteTransaction} colors={colors} styles={styles} />
  );

  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.totalAmount.toFixed(2).includes(q) ||
      new Date(t.timestamp * 1000).toLocaleDateString().toLowerCase().includes(q) ||
      (t.isCreditSale ? 'credit' : 'cash').includes(q) ||
      (t.customerName?.toLowerCase() || '').includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeContainer}>
        <View style={[styles.flexRow, { marginTop: Spacing.lg, marginBottom: Spacing.lg }]}>
          <Text style={styles.heading1}>Sales</Text>
        </View>
        <View style={[styles.flexRow, { marginBottom: Spacing.lg }]}>
          <TextInput
            style={[styles.inputCompact, { flex: 1, marginRight: Spacing.sm }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search sales..."
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator />
            <Text style={[styles.emptyStateText, { marginTop: Spacing.sm }]}>Loading transactions...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="search" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyStateText, { marginTop: Spacing.md }]}>
              {searchQuery ? 'No sales match your search' : 'No sales recorded yet'}
            </Text>
            <Text style={styles.bodySecondary}>
              {searchQuery ? 'Try adjusting your search terms' : 'Tap the + button to create your first sale'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.xl + 56 + Spacing.lg }}
          />
        )}
      </View>

      <FAB icon="plus" style={{ position: 'absolute', bottom: 24, right: 24 }} onPress={() => setShowSaleSheet(true)} accessibilityLabel="Add sale" />

      <BottomSheet visible={showSaleSheet} onDismiss={() => setShowSaleSheet(false)} snapPoint={0.9}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
              <Text style={styles.heading2}>New Sale</Text>
              <Button onPress={() => setShowSaleSheet(false)}>Cancel</Button>
            </View>
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Product</Text>
              <Pressable
                onPress={() => setShowProductDropdown(d => !d)}
                style={{ borderWidth: 1, borderColor: colors.border, padding: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: colors.surface }}
              >
                <Text style={selectedProduct ? styles.body : styles.bodySecondary}>
                  {selectedProduct ? selectedProduct.name : 'Select product'}
                </Text>
                {selectedProduct && (
                  <Text style={[styles.bodySecondary, { marginTop: 4 }]}>
                    {selectedProduct.quantity} in stock • ${selectedProduct.salePrice}
                  </Text>
                )}
              </Pressable>
              {showProductDropdown && (
                <View style={{ position: 'relative' }}>
                  <View style={{ position: 'absolute', top: 4, left: 0, right: 0, backgroundColor: colors.surface, borderRadius: BorderRadius.md, maxHeight: 280, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', zIndex: 50 }}>
                    <View style={{ padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                      <TextInput
                        style={[styles.inputCompact, { marginBottom: 0 }]}
                        placeholder="Search products..."
                        placeholderTextColor={colors.textTertiary}
                        value={productSearchQuery}
                        onChangeText={setProductSearchQuery}
                        autoFocus
                      />
                    </View>
                    <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                      {products
                        .filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                        .map(p => (
                          <Pressable
                            key={p.id}
                            style={({ pressed }) => ({ padding: Spacing.md, backgroundColor: pressed ? colors.backgroundSecondary : 'transparent', borderBottomWidth: 1, borderBottomColor: colors.border })}
                            onPress={() => { setSelectedProduct(p); setShowProductDropdown(false); setProductSearchQuery(''); }}
                          >
                            <Text style={styles.body}>{p.name}</Text>
                            <Text style={styles.bodySecondary}>{p.quantity} available • ${p.salePrice}</Text>
                          </Pressable>
                        ))}
                      {products.filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase())).length === 0 && (
                        <View style={{ padding: Spacing.md }}>
                          <Text style={styles.bodySecondary}>No products found</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Quantity</Text>
              <TextInput
                style={styles.inputCompact}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                keyboardType="number-pad"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <Button mode='outlined' onPress={addItemToSale} style={{ marginBottom: Spacing.lg }} icon='plus'>Add Item</Button>
            {saleItems.length > 0 && (
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={[styles.heading3, { marginBottom: Spacing.sm }]}>Sale Items</Text>
                {saleItems.map((item, index) => (
                  <View key={index} style={[styles.flexRow, styles.listItemCompact, { marginBottom: Spacing.sm }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.body}>{item.product.name} x {item.quantity}</Text>
                      <Text style={styles.bodySecondary}>${(item.product.salePrice * item.quantity).toFixed(2)}</Text>
                    </View>
                    <IconButton icon='delete' size={18} onPress={() => removeItemFromSale(item.product.id)} iconColor={colors.error} />
                  </View>
                ))}
                <View style={[styles.flexRow, { justifyContent: 'space-between', marginTop: Spacing.sm }]}>
                  <Text style={styles.heading3}>Total:</Text>
                  <Text style={styles.heading3}>${calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
            )}
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={[styles.bodySecondary, { marginBottom: Spacing.sm }]}>Sale Type</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip selected={!isCreditSale} onPress={() => setIsCreditSale(false)}>Cash</Chip>
                <Chip selected={isCreditSale} onPress={() => setIsCreditSale(true)}>Credit</Chip>
              </View>
            </View>
            {isCreditSale && (
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={[styles.heading3, { marginBottom: Spacing.sm }]}>Customer Information</Text>
                <View style={{ marginBottom: Spacing.md }}>
                  <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Customer Name *</Text>
                  <TextInput
                    style={styles.inputCompact}
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="Enter customer name"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                <View>
                  <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Phone Number (Optional)</Text>
                  <TextInput
                    style={styles.inputCompact}
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>
            )}
            <Button mode='contained' onPress={processSale} disabled={loading || saleItems.length === 0} loading={loading}>
              Complete Sale
            </Button>
          </View>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
