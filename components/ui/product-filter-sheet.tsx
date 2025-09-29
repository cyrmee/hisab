import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { Colors } from '../../constants/tokens';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ProductFilters } from '../../services/database';
import { getCurrentFilters, setCurrentFilters } from '../../services/filter-store';

interface ProductFilterSheetProps {
    onClose: () => void;
    onApply?: () => void;
}

const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'quantity', label: 'Stock' },
    { value: 'createdAt', label: 'Date Added' },
    { value: 'updatedAt', label: 'Last Updated' },
];

export const ProductFilterSheet: React.FC<ProductFilterSheetProps> = ({ onClose, onApply }) => {
    const scheme = useColorScheme();
    const colors = Colors[scheme];
    const current = getCurrentFilters();

    const [searchText, setSearchText] = useState(current.searchText || '');
    const [minPrice, setMinPrice] = useState(current.minPrice?.toString() || '');
    const [maxPrice, setMaxPrice] = useState(current.maxPrice?.toString() || '');
    const [minStock, setMinStock] = useState(current.minStock?.toString() || '');
    const [maxStock, setMaxStock] = useState(current.maxStock?.toString() || '');
    const [sortBy, setSortBy] = useState(current.sortBy || 'updatedAt');
    const [sortOrder, setSortOrder] = useState(current.sortOrder || 'DESC');

    const apply = () => {
        const filters: ProductFilters = {
            searchText: searchText.trim() || undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            minStock: minStock ? parseInt(minStock) : undefined,
            maxStock: maxStock ? parseInt(maxStock) : undefined,
            sortBy, sortOrder,
        };
        setCurrentFilters(filters);
        onApply?.();
        onClose();
    };

    const clear = () => {
        setSearchText(''); setMinPrice(''); setMaxPrice(''); setMinStock(''); setMaxStock('');
        setSortBy('updatedAt'); setSortOrder('DESC');
    };

    return (
        <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontWeight: '600', fontSize: 18, marginBottom: 12 }}>Search & Filter</Text>
            <View style={{ gap: 12 }}>
                <View>
                    <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Search by name</Text>
                    <TextInput
                        style={{
                            borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                            paddingHorizontal: 12, paddingVertical: 10, color: colors.text
                        }}
                        value={searchText} onChangeText={setSearchText} placeholder="Enter product name..." placeholderTextColor={colors.textTertiary}
                    />
                </View>
                <View>
                    <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Price Range</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text }} value={minPrice} onChangeText={setMinPrice} placeholder="Min" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
                        <TextInput style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text }} value={maxPrice} onChangeText={setMaxPrice} placeholder="Max" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
                    </View>
                </View>
                <View>
                    <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Stock Range</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TextInput style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text }} value={minStock} onChangeText={setMinStock} placeholder="Min" placeholderTextColor={colors.textTertiary} keyboardType="number-pad" />
                        <TextInput style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text }} value={maxStock} onChangeText={setMaxStock} placeholder="Max" placeholderTextColor={colors.textTertiary} keyboardType="number-pad" />
                    </View>
                </View>
                <View>
                    <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Sort by</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {sortOptions.map(opt => (
                            <Chip key={opt.value} selected={sortBy === opt.value} onPress={() => setSortBy(opt.value as any)}>{opt.label}</Chip>
                        ))}
                    </View>
                </View>
                <View>
                    <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>Sort order</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Chip selected={sortOrder === 'ASC'} onPress={() => setSortOrder('ASC')}>Ascending</Chip>
                        <Chip selected={sortOrder === 'DESC'} onPress={() => setSortOrder('DESC')}>Descending</Chip>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                    <Button mode='text' onPress={clear}>Clear</Button>
                    <Button mode='contained' onPress={apply}>Apply</Button>
                </View>
            </View>
        </ScrollView>
    );
};
