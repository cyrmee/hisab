import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
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
import { ProductFilters } from '../services/database';

interface SearchFilterProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ProductFilters) => void;
  currentFilters: ProductFilters;
}

export default function SearchFilter({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: SearchFilterProps) {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme ?? 'light');
  const colors = Colors[colorScheme ?? 'light'];

  const [searchText, setSearchText] = useState(currentFilters.searchText || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() || '');
  const [minStock, setMinStock] = useState(currentFilters.minStock?.toString() || '');
  const [maxStock, setMaxStock] = useState(currentFilters.maxStock?.toString() || '');
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState(currentFilters.sortOrder || 'DESC');

  // Animation values
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(300)).current;

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
    onClose();
  };

  const handleApply = () => {
    const filters: ProductFilters = {
      searchText: searchText.trim() || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minStock: minStock ? parseInt(minStock) : undefined,
      maxStock: maxStock ? parseInt(maxStock) : undefined,
      sortBy,
      sortOrder,
    };

    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setSearchText('');
    setMinPrice('');
    setMaxPrice('');
    setMinStock('');
    setMaxStock('');
    setSortBy('createdAt');
    setSortOrder('DESC');
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'quantity', label: 'Stock' },
    { value: 'createdAt', label: 'Date Added' },
    { value: 'updatedAt', label: 'Last Updated' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={onClose}
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
                        <Text style={styles.heading2}>Search & Filter</Text>
                        <TouchableOpacity
                          onPress={onClose}
                          style={[styles.buttonSecondary, { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }]}
                        >
                          <Text style={styles.buttonTextSecondary}>Cancel</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Search */}
                      <View style={{ marginBottom: Spacing.md }}>
                        <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Search by name</Text>
                        <View style={[styles.inputCompact, styles.flexRow]}>
                          <FontAwesome name="search" size={16} color={colors.textTertiary} />
                          <TextInput
                            style={[
                              styles.body,
                              { flex: 1, marginLeft: Spacing.sm, color: colors.text },
                            ]}
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Enter product name..."
                            placeholderTextColor={colors.textTertiary}
                          />
                        </View>
                      </View>

                      {/* Price Range */}
                      <View style={{ marginBottom: Spacing.md }}>
                        <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Price Range</Text>
                        <View style={styles.flexRow}>
                          <View style={{ flex: 1, marginRight: Spacing.sm }}>
                            <TextInput
                              style={styles.inputCompact}
                              value={minPrice}
                              onChangeText={setMinPrice}
                              placeholder="Min price"
                              placeholderTextColor={colors.textTertiary}
                              keyboardType="decimal-pad"
                            />
                          </View>
                          <Text style={[styles.body, { alignSelf: 'center' }]}>to</Text>
                          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                            <TextInput
                              style={styles.inputCompact}
                              value={maxPrice}
                              onChangeText={setMaxPrice}
                              placeholder="Max price"
                              placeholderTextColor={colors.textTertiary}
                              keyboardType="decimal-pad"
                            />
                          </View>
                        </View>
                      </View>

                      {/* Stock Range */}
                      <View style={{ marginBottom: Spacing.md }}>
                        <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Stock Range</Text>
                        <View style={styles.flexRow}>
                          <View style={{ flex: 1, marginRight: Spacing.sm }}>
                            <TextInput
                              style={styles.inputCompact}
                              value={minStock}
                              onChangeText={setMinStock}
                              placeholder="Min stock"
                              placeholderTextColor={colors.textTertiary}
                              keyboardType="number-pad"
                            />
                          </View>
                          <Text style={[styles.body, { alignSelf: 'center' }]}>to</Text>
                          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                            <TextInput
                              style={styles.inputCompact}
                              value={maxStock}
                              onChangeText={setMaxStock}
                              placeholder="Max stock"
                              placeholderTextColor={colors.textTertiary}
                              keyboardType="number-pad"
                            />
                          </View>
                        </View>
                      </View>

                      {/* Sort Options */}
                      <View style={{ marginBottom: Spacing.md }}>
                        <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Sort by</Text>
                        <View style={{ gap: Spacing.xs }}>
                          {sortOptions.map((option) => (
                            <TouchableOpacity
                              key={option.value}
                              style={[
                                styles.listItemCompact,
                                {
                                  backgroundColor:
                                    sortBy === option.value ? colors.primary : colors.surface,
                                },
                              ]}
                              onPress={() => setSortBy(option.value as any)}
                            >
                              <Text
                                style={[
                                  styles.body,
                                  {
                                    color: sortBy === option.value ? colors.textInverse : colors.text,
                                  },
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Sort Order */}
                      <View style={{ marginBottom: Spacing.lg }}>
                        <Text style={[styles.bodySecondary, { marginBottom: Spacing.xs }]}>Sort order</Text>
                        <View style={styles.flexRow}>
                          <TouchableOpacity
                            style={[
                              styles.buttonSecondary,
                              {
                                flex: 1,
                                marginRight: Spacing.sm,
                                paddingVertical: Spacing.sm,
                                backgroundColor:
                                  sortOrder === 'ASC' ? colors.primary : 'transparent',
                              },
                            ]}
                            onPress={() => setSortOrder('ASC')}
                          >
                            <Text
                              style={[
                                styles.buttonTextSecondary,
                                {
                                  color: sortOrder === 'ASC' ? colors.textInverse : colors.text,
                                },
                              ]}
                            >
                              Ascending
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.buttonSecondary,
                              {
                                flex: 1,
                                marginLeft: Spacing.sm,
                                paddingVertical: Spacing.sm,
                                backgroundColor:
                                  sortOrder === 'DESC' ? colors.primary : 'transparent',
                              },
                            ]}
                            onPress={() => setSortOrder('DESC')}
                          >
                            <Text
                              style={[
                                styles.buttonTextSecondary,
                                {
                                  color: sortOrder === 'DESC' ? colors.textInverse : colors.text,
                                },
                              ]}
                            >
                              Descending
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={{ gap: Spacing.sm }}>
                        <TouchableOpacity
                          style={[styles.buttonPrimary, { marginHorizontal: Spacing.sm }]}
                          onPress={handleApply}
                        >
                          <Text style={styles.buttonText}>Apply Filters</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.buttonSecondary, { marginHorizontal: Spacing.sm }]}
                          onPress={handleClear}
                        >
                          <Text style={styles.buttonTextSecondary}>Clear All</Text>
                        </TouchableOpacity>
                      </View>
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