import React, { useState, useMemo } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    Platform,
    StatusBar,
} from 'react-native';
import { Text } from './Text';
import { TextInput } from './TextInput';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';

interface CardOption {
    key: string;
    label: string;
}

interface CardPickerFieldProps {
    options: CardOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const CardPickerField: React.FC<CardPickerFieldProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select a card',
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(
        () =>
            options.filter(o =>
                o.label.toLowerCase().includes(search.toLowerCase()),
            ),
        [options, search],
    );

    const selectedLabel = options.find(o => o.key === value)?.label;

    const handleSelect = (key: string) => {
        onChange(key);
        setOpen(false);
        setSearch('');
    };

    return (
        <>
            {/* Tappable field */}
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className="py-3 px-4 rounded-xl bg-surface-dim border border-border flex-row items-center justify-between"
                activeOpacity={0.7}
            >
                <View className="flex-row items-center gap-3 flex-1">
                    <Ionicons name="layers-outline" size={18} color={COLORS.text.secondary} />
                    <Text
                        className={`text-base flex-1 ${selectedLabel ? 'text-text' : 'text-text-muted'}`}
                        numberOfLines={1}
                    >
                        {selectedLabel ?? placeholder}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.text.muted} />
            </TouchableOpacity>

            {/* Full-screen picker modal */}
            <Modal
                visible={open}
                animationType="slide"
                transparent={false}
                onRequestClose={() => { setOpen(false); setSearch(''); }}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: COLORS.surface.dim,
                        paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 0) + 16,
                    }}
                >
                    {/* Header */}
                    <View className="flex-row items-center px-4 pb-4 border-b border-border-light bg-surface-dim">
                        <TouchableOpacity
                            onPress={() => { setOpen(false); setSearch(''); }}
                            className="p-1 mr-2"
                        >
                            <Ionicons name="chevron-back" size={28} color={COLORS.text.DEFAULT} />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-text">Select Card</Text>
                    </View>

                    {/* Search */}
                    <View className="px-4 pt-4 pb-2">
                        <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 gap-2">
                            <Ionicons name="search" size={18} color={COLORS.text.muted} />
                            <TextInput
                                className="flex-1 text-base text-text py-3"
                                value={search}
                                onChangeText={setSearch}
                                autoFocus
                                returnKeyType="search"
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.text.muted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Card list */}
                    <ScrollView
                        className="flex-1 px-4 pt-2"
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                    >
                        {filtered.length === 0 ? (
                            <View className="items-center py-12">
                                <Text className="text-text-secondary text-sm">No cards found</Text>
                            </View>
                        ) : (
                            filtered.map(option => {
                                const isSelected = option.key === value;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        onPress={() => handleSelect(option.key)}
                                        activeOpacity={0.7}
                                        className={`flex-row items-center justify-between px-4 py-4 mb-2 rounded-xl border ${isSelected
                                                ? 'bg-primary-50 border-primary-200'
                                                : 'bg-surface border-border-light'
                                            }`}
                                    >
                                        <Text
                                            className={`text-base font-medium ${isSelected ? 'text-primary-700' : 'text-text'
                                                }`}
                                        >
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark"
                                                size={20}
                                                color={COLORS.primary[600]}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                        <View className="h-10" />
                    </ScrollView>
                </View>
            </Modal>
        </>
    );
};
