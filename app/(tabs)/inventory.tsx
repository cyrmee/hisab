import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { memo, useRef, useState } from "react";
import { Alert, Animated, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { ActivityIndicator, Button, FAB, IconButton, List } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomSheet } from "../../components/ui/bottom-sheet";
import { ProductFilterSheet } from "../../components/ui/product-filter-sheet";
import { createStyles } from "../../constants/styles";
import { Colors, Spacing } from "../../constants/tokens";
import { useColorScheme } from "../../hooks/use-color-scheme";
import { addProduct, deleteProduct, getProducts, Product, updateProduct } from "../../services/database";
import { getCurrentFilters } from "../../services/filter-store";

// Local product form state structure
interface EditingProduct {
  id?: number;
  name: string;
  salePrice: string;
  quantity: string;
  createdAt?: number;
  updatedAt?: number;
}

// Animated Product Item Component
const AnimatedProductItem = memo(({ item, onDelete, onEdit, colors, styles }: {
  item: Product;
  onDelete: (product: Product) => void;
  onEdit: (p: Product) => void;
  colors: any;
  styles: any;
}) => {
  const animatedValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // date formatting removed for leaner list row; can be re-added if needed

  return (
    <Animated.View style={[styles.listItemCompact, { transform: [{ scale: animatedValue }], paddingVertical: 10 }]}>
      <Pressable
        android_ripple={{ color: colors.borderSecondary }}
        onPress={() => onEdit(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        <List.Item
          title={item.name}
          description={`$${item.salePrice.toFixed(2)}  •  Stock: ${item.quantity}`}
          right={() => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton icon="pencil" onPress={() => onEdit(item)} size={18} iconColor={colors.warning} />
              <IconButton icon="delete" onPress={() => onDelete(item)} size={18} iconColor={colors.error} />
            </View>
          )}
          style={{ paddingVertical: 0 }}
        />
      </Pressable>
    </Animated.View>
  );
}
);

AnimatedProductItem.displayName = "AnimatedProductItem";

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [saving, setSaving] = useState(false);

  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);
  const colors = Colors[colorScheme];

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const filters = getCurrentFilters();
      const allProducts = await getProducts(filters);
      const filteredProducts = quickSearch
        ? allProducts.filter((product) =>
          product.name.toLowerCase().includes(quickSearch.toLowerCase())
        )
        : allProducts;
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [quickSearch]);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              fetchProducts();
            } catch (error) {
              Alert.alert("Error", "Failed to delete product");
              console.error("Error deleting product:", error);
            }
          },
        },
      ]
    );
  };

  const handleEditProduct = (p?: Product) => {
    if (p) {
      setEditingProduct({
        id: p.id,
        name: p.name,
        salePrice: p.salePrice.toString(),
        quantity: p.quantity.toString(),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      });
    } else {
      setEditingProduct({ name: '', salePrice: '', quantity: '' });
    }
    setShowProductSheet(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    const { id, name, salePrice, quantity } = editingProduct;
    if (!name.trim()) { Alert.alert('Validation', 'Name required'); return; }
    const priceNum = parseFloat(salePrice);
    const qtyNum = parseInt(quantity);
    if (isNaN(priceNum) || isNaN(qtyNum)) { Alert.alert('Validation', 'Numeric values invalid'); return; }
    setSaving(true);
    try {
      if (id) {
        await updateProduct(id, name.trim(), priceNum, qtyNum);
      } else {
        await addProduct(name.trim(), priceNum, qtyNum);
      }
      setShowProductSheet(false);
      await fetchProducts();
    } catch {
      Alert.alert('Error', 'Failed to save product');
    } finally { setSaving(false); }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <AnimatedProductItem
      item={item}
      onDelete={handleDeleteProduct}
      onEdit={handleEditProduct}
      colors={colors}
      styles={styles}
    />
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.safeContainer}>
          {/* Header */}
          <View
            style={[
              styles.flexRowBetween,
              { marginTop: Spacing.lg, marginBottom: Spacing.lg },
            ]}
          >
            <Text style={styles.heading1}>Inventory</Text>
          </View>

          {/* Search and Filter Row */}
          <View style={[styles.flexRow, { marginBottom: Spacing.lg }]}>
            {/* Quick Search */}
            <TextInput
              style={[
                styles.inputCompact,
                { flex: 1, marginRight: Spacing.sm },
              ]}
              value={quickSearch}
              onChangeText={setQuickSearch}
              placeholder="Quick search products..."
              placeholderTextColor={colors.textTertiary}
            />
            <IconButton icon="filter-variant" onPress={() => setShowFilterSheet(true)} accessibilityLabel="Filters" />
          </View>

          {/* Products List */}
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator />
              <Text style={[styles.emptyStateText, { marginTop: 8 }]}>Loading products...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="cube" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyStateText, { marginTop: Spacing.md }]}>
                No products found
              </Text>
              <Text style={styles.bodySecondary}>
                {quickSearch || Object.keys(getCurrentFilters()).length > 2
                  ? "Try adjusting your search or filters"
                  : "Add your first product to get started"}
              </Text>
              {!quickSearch && Object.keys(getCurrentFilters()).length <= 2 && (
                <View style={{ alignItems: "center", marginTop: Spacing.lg }}>
                  <Button mode="contained" onPress={() => handleEditProduct()} icon="plus">
                    Add Product
                  </Button>
                </View>
              )}
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: Spacing.xl + 56 + Spacing.lg, // Extra space for FAB
              }}
            />
          )}
        </View>
      </SafeAreaView>
      <FAB icon="plus" style={{ position: 'absolute', bottom: 24, right: 24 }} onPress={() => handleEditProduct()} />

      {/* Product Form Bottom Sheet */}
      <BottomSheet visible={showProductSheet} onDismiss={() => setShowProductSheet(false)}>
        <View style={{ padding: 20, gap: 16 }}>
          <Text style={styles.heading2}>{editingProduct?.id ? 'Edit Product' : 'Add Product'}</Text>
          <View>
            <Text style={styles.bodySecondary}>Name</Text>
            <TextInput
              style={styles.inputCompact}
              value={editingProduct?.name || ''}
              onChangeText={(v) => setEditingProduct(p => p ? { ...p, name: v } : { name: v, salePrice: '', quantity: '' })}
              placeholder="Product name"
            />
            {(!editingProduct?.name || editingProduct.name.trim().length < 2) && (
              <Text style={[styles.caption, { color: colors.error, marginTop: 4 }]}>Name is required (min 2 chars)</Text>
            )}
          </View>
          <View style={styles.flexRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.bodySecondary}>Price</Text>
              <TextInput
                style={styles.inputCompact}
                value={editingProduct?.salePrice || ''}
                onChangeText={(v) => setEditingProduct(p => p ? { ...p, salePrice: v } : { name: '', salePrice: v, quantity: '' })}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
              {!!editingProduct?.salePrice && isNaN(parseFloat(editingProduct.salePrice)) && (
                <Text style={[styles.caption, { color: colors.error, marginTop: 4 }]}>Invalid price</Text>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.bodySecondary}>Quantity</Text>
              <TextInput
                style={styles.inputCompact}
                value={editingProduct?.quantity || ''}
                onChangeText={(v) => setEditingProduct(p => p ? { ...p, quantity: v } : { name: '', salePrice: '', quantity: v })}
                keyboardType="number-pad"
                placeholder="0"
              />
              {!!editingProduct?.quantity && isNaN(parseInt(editingProduct.quantity)) && (
                <Text style={[styles.caption, { color: colors.error, marginTop: 4 }]}>Invalid quantity</Text>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <Button mode="text" onPress={() => setShowProductSheet(false)}>Cancel</Button>
            <Button
              mode="contained"
              loading={saving}
              disabled={!editingProduct || !editingProduct.name.trim() || editingProduct.name.trim().length < 2 || isNaN(parseFloat(editingProduct.salePrice)) || isNaN(parseInt(editingProduct.quantity))}
              onPress={handleSaveProduct}
            >
              {editingProduct?.id ? 'Update' : 'Add'}
            </Button>
          </View>
        </View>
      </BottomSheet>

      {/* Filter Bottom Sheet */}
      <BottomSheet visible={showFilterSheet} onDismiss={() => setShowFilterSheet(false)} snapPoint={0.85}>
        <ProductFilterSheet onClose={() => setShowFilterSheet(false)} onApply={fetchProducts} />
      </BottomSheet>
    </>
  );
}
