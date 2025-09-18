import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { memo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProductForm from '../../components/ProductForm';
import SearchFilter from '../../components/SearchFilter';
import { createStyles } from '../../constants/styles';
import { Colors, Spacing } from '../../constants/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';
import {
    deleteProduct,
    getProducts,
    Product,
    ProductFilters
} from '../../services/database';

// Animated Product Item Component
const AnimatedProductItem = memo(({
    item,
    onEdit,
    onDelete,
    colors,
    styles
}: {
    item: Product;
    onEdit: (product: Product) => void;
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
        <Animated.View style={[
            styles.listItemCompact,
            {
                transform: [{ scale: animatedValue }]
            }
        ]}>
            {/* Left side - Product details */}
            <View style={{ flex: 1 }}>
                <Text style={styles.heading3} numberOfLines={1}>{item.name}</Text>
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
                    onPress={() => onEdit(item)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                        styles.buttonSecondary,
                        {
                            paddingVertical: Spacing.sm,
                            paddingHorizontal: Spacing.sm,
                            minWidth: 36,
                            minHeight: 36,
                        },
                    ]}
                >
                    <FontAwesome name="edit" size={14} color={colors.primary} />
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
                            marginLeft: Spacing.sm,
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
});

AnimatedProductItem.displayName = 'AnimatedProductItem';

export default function InventoryScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showSearchFilter, setShowSearchFilter] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filters, setFilters] = useState<ProductFilters>({
        sortBy: 'createdAt',
        sortOrder: 'DESC',
    });
    const [quickSearch, setQuickSearch] = useState('');

    const colorScheme = useColorScheme();
    const styles = createStyles(colorScheme ?? 'light');
    const colors = Colors[colorScheme ?? 'light'];

    const fetchProducts = React.useCallback(async () => {
        setLoading(true);
        try {
            const currentFilters = quickSearch
                ? { ...filters, searchText: quickSearch }
                : filters;
            const productList = await getProducts(currentFilters);
            setProducts(productList);
        } catch (error) {
            Alert.alert('Error', 'Failed to load products');
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, quickSearch]);

    useFocusEffect(
        React.useCallback(() => {
            fetchProducts();
        }, [fetchProducts])
    );

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowProductForm(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleDeleteProduct = (product: Product) => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${product.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProduct(product.id);
                            fetchProducts();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete product');
                            console.error('Error deleting product:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleApplyFilters = (newFilters: ProductFilters) => {
        setFilters(newFilters);
    };

    const renderItem = ({ item }: { item: Product }) => (
        <AnimatedProductItem
            item={item}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            colors={colors}
            styles={styles}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.safeContainer}>
                {/* Header */}
                <View style={[styles.flexRowBetween, { marginTop: Spacing.lg, marginBottom: Spacing.lg }]}>
                    <Text style={styles.heading1}>Inventory</Text>
                </View>

                {/* Search and Filter Row */}
                <View style={[styles.flexRow, { marginBottom: Spacing.lg }]}>
                    {/* Quick Search */}
                    <View style={[styles.inputCompact, styles.flexRow, { flex: 1, marginRight: Spacing.sm }]}>
                        <FontAwesome name="search" size={16} color={colors.textTertiary} />
                        <TextInput
                            style={[
                                styles.body,
                                { flex: 1, marginLeft: Spacing.sm, color: colors.text },
                            ]}
                            value={quickSearch}
                            onChangeText={setQuickSearch}
                            placeholder="Quick search products..."
                            placeholderTextColor={colors.textTertiary}
                        />
                    </View>

                    {/* Filter Button */}
                    <Pressable
                        onPress={() => setShowSearchFilter(true)}
                        style={({ pressed }) => [
                            styles.buttonFilterCompact,
                            pressed && styles.pressed
                        ]}
                    >
                        <FontAwesome name="filter" size={16} color={colors.text} />
                    </Pressable>
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
                            {quickSearch || Object.keys(filters).length > 2
                                ? 'Try adjusting your search or filters'
                                : 'Add your first product to get started'}
                        </Text>
                        {!quickSearch && Object.keys(filters).length <= 2 && (
                            <TouchableOpacity
                                onPress={handleAddProduct}
                                style={[styles.buttonPrimary, { marginTop: Spacing.lg }]}
                            >
                                <Text style={styles.buttonText}>Add Product</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: Spacing.xl + 56 + Spacing.lg // Extra space for FAB
                        }}
                    />
                )}

                {/* Floating Action Button */}
                <Pressable
                    onPress={handleAddProduct}
                    style={({ pressed }) => [
                        styles.fab,
                        pressed && styles.fabPressed
                    ]}
                >
                    <FontAwesome name="plus" size={20} color={colors.textInverse} />
                </Pressable>
            </View>

            {/* Product Form Modal */}
            <ProductForm
                visible={showProductForm}
                onClose={() => setShowProductForm(false)}
                onSave={fetchProducts}
                product={editingProduct}
            />

            {/* Search Filter Modal */}
            <SearchFilter
                visible={showSearchFilter}
                onClose={() => setShowSearchFilter(false)}
                onApplyFilters={handleApplyFilters}
                currentFilters={filters}
            />
        </SafeAreaView>
    );
}