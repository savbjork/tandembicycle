import React, { useState, useEffect } from 'react';
import { View, Animated, DimensionValue } from 'react-native';

interface LoadingSkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    className?: string;
}

/**
 * A basic loading skeleton with a subtle pulse animation.
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    className = '',
}) => {
    const [pulseAnim] = useState(new Animated.Value(0.3));

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.7,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    return (
        <Animated.View
            className={`bg-border-muted ${className}`}
            style={{
                width,
                height,
                borderRadius,
                opacity: pulseAnim,
            }}
        />
    );
};

export const CardSkeleton: React.FC = () => (
    <View className="bg-surface p-4 rounded-xl mb-3 border-[0.5px] border-border-light shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
            <LoadingSkeleton width="60%" height={24} />
            <LoadingSkeleton width={28} height={28} borderRadius={14} />
        </View>
        <View className="gap-2">
            <LoadingSkeleton width="90%" height={16} />
            <LoadingSkeleton width="40%" height={16} />
        </View>
    </View>
);
