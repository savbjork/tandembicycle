import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onPress: () => void;
    className?: string;
    size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    checked,
    onPress,
    className = '',
    size = 20,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center gap-3 px-1 ${className}`}
            activeOpacity={0.7}
        >
            <View
                className={`rounded border items-center justify-center ${checked ? 'bg-primary-600 border-primary-600' : 'bg-surface border-border'
                    }`}
                style={{ width: size, height: size }}
            >
                {checked && <Ionicons name="checkmark" size={size * 0.7} color="white" />}
            </View>
            <Text className="text-[15px] font-medium text-text">{label}</Text>
        </TouchableOpacity>
    );
};
