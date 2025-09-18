import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles } from '../constants/styles';
import { Colors, Spacing } from '../constants/tokens';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Product, addProduct, updateProduct } from '../services/database';

interface ProductFormProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    product?: Product | null;
}

export default function ProductForm({ visible, onClose, onSave, product }: ProductFormProps) {
    const colorScheme = useColorScheme();
    const styles = createStyles(colorScheme ?? 'light');
    const colors = Colors[colorScheme ?? 'light'];

    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.salePrice?.toString() || '');
    const [quantity, setQuantity] = useState(product?.quantity?.toString() || '');
    const [loading, setLoading] = useState(false);

    // Animation values
    const backgroundOpacity = useRef(new Animated.Value(0)).current;
    const modalTranslateY = useRef(new Animated.Value(300)).current;

    // Reset form when product changes
    React.useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(product.salePrice.toString());
            setQuantity(product.quantity.toString());
        } else {
            setName('');
            setPrice('');
            setQuantity('');
        }
    }, [product]);

    // Animate modal entrance/exit
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(backgroundOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(modalTranslateY, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(backgroundOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(modalTranslateY, {
                    toValue: 300,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, backgroundOpacity, modalTranslateY]);

    const handleBackdropPress = () => {
        Keyboard.dismiss();
        handleClose();
    };

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Error', 'Product name is required');
            return;
        }

        const priceValue = parseFloat(price);
        if (isNaN(priceValue) || priceValue < 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        const quantityValue = parseInt(quantity);
        if (isNaN(quantityValue) || quantityValue < 0) {
            Alert.alert('Error', 'Please enter a valid quantity');
            return;
        }

        setLoading(true);

        try {
            if (product?.id) {
                // Update existing product
                await updateProduct(product.id, name.trim(), priceValue, quantityValue);
            } else {
                // Add new product
                await addProduct(name.trim(), priceValue, quantityValue);
            }

            onSave();
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to save product. Please try again.');
            console.error('Error saving product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setPrice('');
        setQuantity('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="none"
            presentationStyle="overFullScreen"
            transparent={true}
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        opacity: backgroundOpacity,
                    }}
                >
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    transform: [{ translateY: modalTranslateY }],
                                }
                            ]}
                        >
                            <SafeAreaView style={{ flex: 1 }}>
                                <View style={styles.modalHandle} />
                                <KeyboardAvoidingView
                                    style={{ flex: 1 }}
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                                >
                                    <ScrollView
                                        style={{ flex: 1 }}
                                        showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        <View style={styles.modalContent}>
                                            {/* Header */}
                                            <View style={styles.modalHeader}>
                                                <Text style={styles.heading2}>
                                                    {product ? 'Edit Product' : 'Add Product'}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={handleClose}
                                                    style={[styles.buttonSecondary, { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }]}
                                                >
                                                    <Text style={styles.buttonTextSecondary}>Cancel</Text>
                                                </TouchableOpacity>
                                            </View>

                                            {/* Form Fields */}
                                            <View style={{ gap: Spacing.md }}>
                                                {/* Product Name */}
                                                <View>
                                                    <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>
                                                        Product Name *
                                                    </Text>
                                                    <TextInput
                                                        style={styles.inputCompact}
                                                        value={name}
                                                        onChangeText={setName}
                                                        placeholder="Enter product name"
                                                        placeholderTextColor={colors.textTertiary}
                                                        autoFocus={!product}
                                                    />
                                                </View>

                                                {/* Sale Price */}
                                                <View>
                                                    <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>
                                                        Sale Price *
                                                    </Text>
                                                    <TextInput
                                                        style={styles.inputCompact}
                                                        value={price}
                                                        onChangeText={setPrice}
                                                        placeholder="0.00"
                                                        placeholderTextColor={colors.textTertiary}
                                                        keyboardType="decimal-pad"
                                                    />
                                                </View>

                                                {/* Quantity */}
                                                <View>
                                                    <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>
                                                        Quantity *
                                                    </Text>
                                                    <TextInput
                                                        style={styles.inputCompact}
                                                        value={quantity}
                                                        onChangeText={setQuantity}
                                                        placeholder="0"
                                                        placeholderTextColor={colors.textTertiary}
                                                        keyboardType="number-pad"
                                                    />
                                                </View>
                                            </View>

                                            {/* Save Button */}
                                            <TouchableOpacity
                                                style={[
                                                    styles.buttonPrimary,
                                                    {
                                                        marginTop: Spacing.lg,
                                                        marginHorizontal: Spacing.sm, // Add horizontal margin
                                                        opacity: loading ? 0.6 : 1,
                                                    },
                                                ]}
                                                onPress={handleSave}
                                                disabled={loading}
                                            >
                                                <Text style={styles.buttonText}>
                                                    {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </ScrollView>
                                </KeyboardAvoidingView>
                            </SafeAreaView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}