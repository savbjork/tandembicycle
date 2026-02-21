import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';

interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    className?: string;
    titleClassName?: string;
}

/**
 * Premium Screen Header component
 * Standardizes top spacing (Safe Area equivalent), back buttons, and titles across all screens.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    showBack,
    onBack,
    rightAction,
    className = '',
    titleClassName = '',
}) => {
    return (
        <View className={`px-6 pt-[60px] pb-5 flex-row justify-between items-end ${className}`}>
            <View className="flex-row items-center gap-1 flex-1">
                {showBack && (
                    <TouchableOpacity onPress={onBack} className="-ml-2">
                        <Ionicons name="chevron-back" size={32} color={COLORS.text.DEFAULT} />
                    </TouchableOpacity>
                )}
                <Text
                    className={`text-[32px] font-bold text-text tracking-tight ${titleClassName}`}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </View>
            {rightAction && (
                <View className="mb-0.5">
                    {rightAction}
                </View>
            )}
        </View>
    );
};
