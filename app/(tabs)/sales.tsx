import { FontAwesome } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Modal,
  TextInput,
  ScrollView,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles } from '../../constants/styles';
import { BorderRadius, Spacing, Colors } from '../../constants/tokens';
import { 
  getProducts, 
  getTransactions, 
  createTransaction, 
  deleteTransaction,
  upsertCustomer,
  getAllCustomers,
  updateProduct,
  Product, 
  Transaction
} from '../../services/database';

// Sale Item interface for building sales
interface SaleItem {
  product: Product;
  quantity: number;
}

// Transaction with customer info for display
interface TransactionWithCustomer extends Transaction {
  customerName?: string;
}

interface SalesItemProps {
  item: TransactionWithCustomer;
  onDelete: (transaction: Transaction) => void;
  colors: any;
  styles: any;
}

function SalesItem({ item, onDelete, colors, styles }: SalesItemProps) {
  return (
    <View style={[styles.listItemCompact, { marginBottom: Spacing.md }]}>
      <View style={styles.flexRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading3}>
            ${item.totalAmount.toFixed(2)} - {item.isCreditSale ? 'Credit' : 'Cash'}
          </Text>
          <Text style={styles.bodySecondary}>
            {new Date(item.timestamp * 1000).toLocaleDateString()}
            {item.customerName && ` - ${item.customerName}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(item)}
          style={[styles.buttonSecondary, { padding: Spacing.sm, backgroundColor: colors.error }]}
        >
          <FontAwesome name="trash" size={16} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SalesScreen() {
  const styles = createStyles();
  const colors = Colors.light;

  const [transactions, setTransactions] = useState<TransactionWithCustomer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sale form state
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [transactionsData, productsData, customersData] = await Promise.all([
        getTransactions(100),
        getProducts(),
        getAllCustomers()
      ]);

      // Enrich transactions with customer names
      const enrichedTransactions = transactionsData.map(transaction => ({
        ...transaction,
        customerName: transaction.customerId 
          ? customersData.find(c => c.id === transaction.customerId)?.name 
          : undefined
      }));

      setTransactions(enrichedTransactions);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const addItemToSale = () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (qty > selectedProduct.quantity) {
      Alert.alert('Error', `Not enough stock available. Only ${selectedProduct.quantity} items in stock.`);
      return;
    }

    // Check if product already in sale
    const existingIndex = saleItems.findIndex(item => item.product.id === selectedProduct.id);
    
    if (existingIndex >= 0) {
      // Update existing item
      const newItems = [...saleItems];
      const newQuantity = newItems[existingIndex].quantity + qty;
      
      if (newQuantity > selectedProduct.quantity) {
        Alert.alert('Error', `Not enough stock available. Only ${selectedProduct.quantity} items in stock, you already have ${newItems[existingIndex].quantity} in cart.`);
        return;
      }
      
      newItems[existingIndex].quantity = newQuantity;
      setSaleItems(newItems);
    } else {
      // Add new item
      setSaleItems([...saleItems, { product: selectedProduct, quantity: qty }]);
    }

    // Reset form
    setSelectedProduct(null);
    setQuantity('1');
    setProductSearchQuery('');
    setShowProductDropdown(false);
  };

  const removeItemFromSale = (productId: number) => {
    setSaleItems(saleItems.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => 
      total + (item.product.salePrice * item.quantity), 0
    );
  };

  const processSale = async () => {
    if (saleItems.length === 0) {
      Alert.alert('Error', 'Please add items to the sale');
      return;
    }

    if (isCreditSale && !customerName.trim()) {
      Alert.alert('Error', 'Customer name is required for credit sales');
      return;
    }

    setLoading(true);
    try {
      let customerId: number | undefined;
      
      // Create/update customer for credit sales
      if (isCreditSale) {
        customerId = await upsertCustomer(customerName.trim(), customerPhone.trim() || undefined);
      }

      const totalAmount = calculateTotal();
      
      // Create transaction
      await createTransaction(totalAmount, isCreditSale, customerId);

      // TODO: Add transaction items to transaction_items table if needed for detailed tracking
      
      // Update product quantities
      for (const item of saleItems) {
        // TODO: This should be atomic - consider using database transactions
        await updateProduct(
          item.product.id, 
          item.product.name, 
          item.product.salePrice, 
          item.product.quantity - item.quantity
        );
      }

      Alert.alert('Success', 'Sale completed successfully');
      
      // Reset form and close modal
      setSaleItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setIsCreditSale(false);
      setProductSearchQuery('');
      setSelectedProduct(null);
      setQuantity('1');
      setShowProductDropdown(false);
      setShowSaleModal(false);
      
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error processing sale:', err);
      Alert.alert('Error', 'Failed to process sale');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              await fetchData();
              Alert.alert('Success', 'Transaction deleted');
            } catch {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
  };

  const renderTransaction = ({ item }: { item: TransactionWithCustomer }) => (
    <SalesItem
      item={item}
      onDelete={handleDeleteTransaction}
      colors={colors}
      styles={styles}
    />
  );

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const amount = transaction.totalAmount.toFixed(2);
    const date = new Date(transaction.timestamp * 1000).toLocaleDateString();
    const type = transaction.isCreditSale ? 'credit' : 'cash';
    const customer = transaction.customerName?.toLowerCase() || '';
    
    return amount.includes(query) || 
           date.toLowerCase().includes(query) || 
           type.includes(query) || 
           customer.includes(query);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeContainer}>
        {/* Header */}
        <View style={[styles.flexRow, { marginTop: Spacing.lg, marginBottom: Spacing.lg }]}>
          <Text style={styles.heading1}>Sales</Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.flexRow, { marginBottom: Spacing.lg }]}>
          <TextInput
            style={[
              styles.inputCompact,
              { flex: 1, marginRight: Spacing.sm },
            ]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search sales..."
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Transactions List */}
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading transactions...</Text>
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
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Spacing.xl + 56 + Spacing.lg, // Extra space for FAB
            }}
          />
        )}
      </View>

      {/* Floating Action Button - Positioned above tab bar and content */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 9999,

          // Circle styles on wrapper
          backgroundColor: colors.primary,
          width: 56,
          height: 56,
          borderRadius: BorderRadius.lg,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          borderWidth: 0,
          borderColor: colors.primary,
        }}
      >
        <Pressable
          android_ripple={{ color: colors.primary, radius: 28 }}
          style={({ pressed }) => [
            {
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: BorderRadius.lg,
            },
            pressed && {
              transform: [{ scale: 0.95 }],
              opacity: 0.9,
            },
          ]}
          onPress={() => setShowSaleModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Add sale"
        >
          <FontAwesome name="plus" size={15} color={colors.textInverse} />
        </Pressable>
      </View>

      {/* Sale Modal */}
      <Modal
        visible={showSaleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSaleModal(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.safeContainer}>
            {/* Modal Header */}
            <View style={[styles.flexRow, { justifyContent: 'space-between', marginBottom: Spacing.lg }]}>
              <Text style={styles.heading2}>New Sale</Text>
              <TouchableOpacity
                onPress={() => setShowSaleModal(false)}
                style={styles.buttonSecondary}
              >
                <Text style={[styles.body, { color: colors.textInverse }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={{ flex: 1 }} 
              showsVerticalScrollIndicator={false}
            >
              {/* Backdrop for closing dropdown */}
              {showProductDropdown && (
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999,
                  }}
                  onPress={() => setShowProductDropdown(false)}
                  activeOpacity={1}
                />
              )}

              {/* Product Selection */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>
                  Select Product
                </Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={styles.inputCompact}
                    value={selectedProduct ? `${selectedProduct.name} (${selectedProduct.quantity} available) - $${selectedProduct.salePrice}` : productSearchQuery}
                    onChangeText={(text) => {
                      setProductSearchQuery(text);
                      setSelectedProduct(null);
                      setShowProductDropdown(text.length > 0);
                    }}
                    onFocus={() => setShowProductDropdown(productSearchQuery.length > 0 || products.length > 0)}
                    placeholder="Search for a product..."
                    placeholderTextColor={colors.textTertiary}
                  />
                  
                  {/* Product Dropdown */}
                  {showProductDropdown && (
                    <View style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      marginTop: 4,
                      maxHeight: 200,
                      zIndex: 1000,
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                    }}>
                      <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                        {products
                          .filter(product => 
                            productSearchQuery === '' || 
                            product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                          )
                          .map(product => (
                            <TouchableOpacity
                              key={product.id}
                              style={{
                                padding: Spacing.md,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                              }}
                              onPress={() => {
                                setSelectedProduct(product);
                                setProductSearchQuery('');
                                setShowProductDropdown(false);
                              }}
                            >
                              <Text style={styles.body}>
                                {product.name}
                              </Text>
                              <Text style={styles.bodySecondary}>
                                {product.quantity} available - ${product.salePrice}
                              </Text>
                            </TouchableOpacity>
                          ))
                        }
                        {products.filter(product => 
                          productSearchQuery === '' || 
                          product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <View style={{ padding: Spacing.md }}>
                            <Text style={styles.bodySecondary}>No products found</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Quantity Input */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>
                  Quantity
                </Text>
                <TextInput
                  style={styles.inputCompact}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="1"
                  keyboardType="number-pad"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Add Item Button */}
              <TouchableOpacity
                onPress={addItemToSale}
                style={[styles.buttonSecondary, { marginBottom: Spacing.lg }]}
              >
                <Text style={[styles.body, { color: colors.primary }]}>Add Item</Text>
              </TouchableOpacity>

              {/* Sale Items List */}
              {saleItems.length > 0 && (
                <View style={{ marginBottom: Spacing.lg }}>
                  <Text style={[styles.heading3, { marginBottom: Spacing.sm }]}>
                    Sale Items
                  </Text>
                  {saleItems.map((item, index) => (
                    <View key={index} style={[styles.flexRow, styles.listItemCompact, { marginBottom: Spacing.sm }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.body}>
                          {item.product.name} x {item.quantity}
                        </Text>
                        <Text style={styles.bodySecondary}>
                          ${(item.product.salePrice * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeItemFromSale(item.product.id)}
                        style={{ padding: Spacing.xs }}
                      >
                        <FontAwesome name="trash" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {/* Total */}
                  <View style={[styles.flexRow, { justifyContent: 'space-between', marginTop: Spacing.sm }]}>
                    <Text style={styles.heading3}>Total:</Text>
                    <Text style={styles.heading3}>${calculateTotal().toFixed(2)}</Text>
                  </View>
                </View>
              )}

              {/* Sale Type Selection */}
              <View style={{ marginBottom: Spacing.lg }}>
                <Text style={[styles.bodySecondary, { marginBottom: Spacing.sm }]}>
                  Sale Type
                </Text>
                <View style={styles.flexRow}>
                  <TouchableOpacity
                    onPress={() => setIsCreditSale(false)}
                    style={[
                      styles.buttonSecondary,
                      { flex: 1, marginRight: Spacing.xs },
                      !isCreditSale && { backgroundColor: colors.primary }
                    ]}
                  >
                    <Text style={[
                      styles.body,
                      !isCreditSale && { color: colors.textInverse }
                    ]}>
                      Cash Sale
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsCreditSale(true)}
                    style={[
                      styles.buttonSecondary,
                      { flex: 1, marginLeft: Spacing.xs },
                      isCreditSale && { backgroundColor: colors.primary }
                    ]}
                  >
                    <Text style={[
                      styles.body,
                      isCreditSale && { color: colors.textInverse }
                    ]}>
                      Credit Sale
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Customer Information (for credit sales) */}
              {isCreditSale && (
                <View style={{ marginBottom: Spacing.lg }}>
                  <Text style={[styles.heading3, { marginBottom: Spacing.sm }]}>
                    Customer Information
                  </Text>
                  
                  <View style={{ marginBottom: Spacing.md }}>
                    <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>
                      Customer Name *
                    </Text>
                    <TextInput
                      style={styles.inputCompact}
                      value={customerName}
                      onChangeText={setCustomerName}
                      placeholder="Enter customer name"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View>
                    <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>
                      Phone Number (Optional)
                    </Text>
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

              {/* Process Sale Button */}
              <TouchableOpacity
                onPress={processSale}
                disabled={loading || saleItems.length === 0}
                style={[
                  styles.buttonPrimary,
                  { marginBottom: Spacing.lg },
                  (loading || saleItems.length === 0) && { opacity: 0.5 }
                ]}
              >
                <Text style={[styles.body, { color: colors.textInverse }]}>
                  {loading ? 'Processing...' : 'Complete Sale'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
