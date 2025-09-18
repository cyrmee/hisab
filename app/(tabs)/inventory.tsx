import { FontAwesome } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import React, { memo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createStyles } from "../../constants/styles";
import { BorderRadius, Colors, Spacing } from "../../constants/tokens";
import { useColorScheme } from "../../hooks/use-color-scheme";
import { deleteProduct, getProducts, Product } from "../../services/database";
import { getCurrentFilters } from "../../services/filter-store";

// Animated Product Item Component
const AnimatedProductItem = memo(
  ({
    item,
    onDelete,
    colors,
    styles,
  }: {
    item: Product;
    onDelete: (product: Product) => void;
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

    const formatDate = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (
      <Animated.View
        style={[
          styles.listItemCompact,
          {
            transform: [{ scale: animatedValue }],
          },
        ]}
      >
        {/* Left side - Product details */}
        <View style={{ flex: 1 }}>
          <Text style={styles.heading3} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.flexRow, { marginTop: 2 }]}>
            <Text style={[styles.body, { color: colors.success }]}>
              ${item.salePrice.toFixed(2)}
            </Text>
            <Text style={[styles.bodySecondary, { marginLeft: Spacing.md }]}>
              Stock: {item.quantity}
            </Text>
          </View>
          {item.createdAt && (
            <Text style={[styles.caption, { marginTop: 2 }]}>
              Added: {formatDate(item.createdAt)}
            </Text>
          )}
        </View>

        {/* Right side - Action buttons */}
        <View style={styles.flexRow}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              styles.buttonSecondary,
              {
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.sm,
                marginLeft: Spacing.md,
                borderColor: colors.warning,
                minWidth: 36,
                minHeight: 36,
              },
            ]}
          >
            <Link
              href={{
                pathname: "/product-form",
                params: {
                  productId: item.id.toString(),
                  name: item.name,
                  salePrice: item.salePrice.toString(),
                  quantity: item.quantity.toString(),
                  createdAt: item.createdAt.toString(),
                  updatedAt: item.updatedAt.toString(),
                },
              }}
              asChild
            >
              <FontAwesome name="edit" size={14} color={colors.warning} />
            </Link>
          </Pressable>
          <Pressable
            onPress={() => onDelete(item)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              styles.buttonSecondary,
              {
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.sm,
                marginLeft: Spacing.md,
                borderColor: colors.error,
                minWidth: 36,
                minHeight: 36,
              },
            ]}
          >
            <FontAwesome name="trash" size={14} color={colors.error} />
          </Pressable>
        </View>
      </Animated.View>
    );
  }
);

AnimatedProductItem.displayName = "AnimatedProductItem";

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme ?? "light");
  const colors = Colors[colorScheme ?? "light"];

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

  const renderItem = ({ item }: { item: Product }) => (
    <AnimatedProductItem
      item={item}
      onDelete={handleDeleteProduct}
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

            {/* Filter Button */}
            <Link
              href={{
                pathname: "/search-filter",
                params: {
                  searchText: getCurrentFilters().searchText || "",
                  minPrice: getCurrentFilters().minPrice?.toString() || "",
                  maxPrice: getCurrentFilters().maxPrice?.toString() || "",
                  minStock: getCurrentFilters().minStock?.toString() || "",
                  maxStock: getCurrentFilters().maxStock?.toString() || "",
                  sortBy: getCurrentFilters().sortBy || "createdAt",
                  sortOrder: getCurrentFilters().sortOrder || "DESC",
                },
              }}
              asChild
            >
              <TouchableOpacity
                style={{
                  width: 48,
                  marginLeft: Spacing.xs,
                  height: 48,
                  backgroundColor: colors.primary,
                  borderRadius: BorderRadius.lg,
                  alignItems: "center",
                  justifyContent: "center",
                  ...styles.shadow,
                }}
                activeOpacity={0.8}
              >
                <FontAwesome
                  name="filter"
                  size={16}
                  color={colors.textInverse}
                />
              </TouchableOpacity>
            </Link>
          </View>

          {/* Products List */}
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading products...</Text>
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
                  <Link href="/product-form" asChild>
                    <TouchableOpacity
                      style={[
                        styles.buttonPrimary,
                        { marginBottom: Spacing.md },
                      ]}
                    >
                      <Text style={styles.buttonText}>Add Product</Text>
                    </TouchableOpacity>
                  </Link>

                  {/* FAB positioned here for testing visibility */}
                  <Link href="/product-form" asChild>
                    <Pressable
                      style={({ pressed }) => [
                        {
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
                        },
                        pressed && {
                          transform: [{ scale: 0.95 }],
                          opacity: 0.9,
                        },
                      ]}
                    >
                      <FontAwesome
                        name="plus"
                        size={20}
                        color={colors.textInverse}
                      />
                    </Pressable>
                  </Link>
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
          accessibilityRole="button"
          accessibilityLabel="Add product"
        >
          <Link href="/product-form" asChild>
            <FontAwesome name="plus" size={15} color={colors.textInverse} />
          </Link>
        </Pressable>
      </View>
    </>
  );
}
