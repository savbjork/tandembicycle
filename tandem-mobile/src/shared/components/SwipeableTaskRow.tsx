import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Text } from '@shared/components/ui/Text';
import type { Task } from '@shared/data/FakeDataStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};

// ─── Props ───────────────────────────────────────────────────

interface TaskRowProps {
    task: Task;
    onPress?: () => void;
    onToggleDone?: (taskId: string, isDone: boolean) => void;
    variant?: 'list' | 'board' | 'compact';
    hideBackground?: boolean;
    hideCardName?: boolean;
    hideDueDate?: boolean;
    pendingHandoffLabel?: string | null;
}

export const TaskRow: React.FC<TaskRowProps> = ({
    task,
    onPress,
    onToggleDone,
    variant = 'list',
    hideBackground = false,
    hideCardName = false,
    hideDueDate = false,
    pendingHandoffLabel,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const isBoard = variant === 'board';
    const isCompact = variant === 'compact';
    const overdue = isOverdue(task.dueDate) && !task.isDone;
    const isDone = task.isDone;

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            navigation.navigate('TaskDetail', { taskId: task.id });
        }
    };

    const handleToggle = () => {
        onToggleDone?.(task.id, !task.isDone);
    };

    if (isCompact) {
        return (
            <TouchableOpacity
                onPress={handlePress}
                className="flex-row items-center py-2 gap-3"
                activeOpacity={0.7}
            >
                <TouchableOpacity onPress={handleToggle}>
                    <Ionicons
                        name={isDone ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={isDone ? COLORS.success[600] : COLORS.text.muted}
                    />
                </TouchableOpacity>
                <Text
                    className={`text-[14px] flex-1 ${isDone ? 'text-text-muted line-through' : 'text-text-secondary'}`}
                    numberOfLines={1}
                >
                    {task.name}
                </Text>
                {!hideDueDate && (
                    <Text className={`text-[11px] ${overdue ? 'text-red-500 font-semibold' : 'text-text-muted'}`}>
                        {formatDate(task.dueDate)}
                    </Text>
                )}
            </TouchableOpacity>
        );
    }

    if (isBoard) {
        return (
            <TouchableOpacity
                className={`${hideBackground ? '' : 'bg-surface shadow-sm ' + (overdue ? 'border border-red-200' : '')} rounded-lg px-3.5 py-3 mb-2`}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={handleToggle}>
                        <Ionicons
                            name={isDone ? "checkmark-circle" : "ellipse-outline"}
                            size={18}
                            color={isDone ? COLORS.success[600] : COLORS.text.muted}
                        />
                    </TouchableOpacity>
                    <Text className={`text-[14px] font-medium flex-1 ${isDone ? 'text-text-muted line-through' : overdue ? 'text-red-600' : 'text-text'}`}>
                        {task.name}
                    </Text>
                </View>
                <View className="flex-row items-center justify-between mt-1.5 ml-6">
                    {!hideCardName && <Text className="text-xs text-text-muted">{task.card}</Text>}
                    {!hideDueDate && (
                        <Text className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
                            {overdue ? 'Overdue' : formatDate(task.dueDate)}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            className={`${hideBackground ? '' : 'bg-surface shadow-sm ' + (overdue ? 'border border-red-200' : '')} ${hideCardName ? 'mb-1.5 py-1.5' : 'mb-3 py-3.5'} rounded-xl px-4`}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View className={`flex-row items-center ${hideCardName ? 'gap-2.5' : 'gap-3'}`}>
                <TouchableOpacity onPress={handleToggle}>
                    <Ionicons
                        name={isDone ? "checkmark-circle" : "ellipse-outline"}
                        size={hideCardName ? 20 : 24}
                        color={isDone ? COLORS.success[600] : COLORS.text.muted}
                    />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className={`${hideCardName ? 'text-[14px]' : 'text-[15px]'} font-medium ${isDone ? 'text-text-muted line-through' : overdue ? 'text-red-600' : 'text-text'}`}>
                        {task.name}
                    </Text>
                    {!hideCardName && (
                        <View className="flex-row items-center mt-0.5">
                            <Text className="text-xs text-text-muted">
                                {task.card}
                            </Text>
                        </View>
                    )}
                </View>
                <View className="items-end">
                    {!hideDueDate && (
                        <Text className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
                            {overdue ? 'Overdue' : formatDate(task.dueDate)}
                        </Text>
                    )}
                    {pendingHandoffLabel && (
                        <View className="bg-amber-100 px-1.5 py-0.5 rounded mt-1">
                            <Text className="text-[10px] font-semibold text-amber-600">
                                {pendingHandoffLabel}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

interface SwipeableTaskRowProps {
    task: Task;
    onPress?: () => void;
    onToggleDone: (taskId: string, isDone: boolean) => void;
    onAudible?: (taskId: string) => void;
    pendingHandoffLabel?: string | null;
    variant?: 'list' | 'board';
    hideCardName?: boolean;
    hideDueDate?: boolean;
}

// ─── Component ───────────────────────────────────────────────

export const SwipeableTaskRow: React.FC<SwipeableTaskRowProps> = ({
    task,
    onPress,
    onToggleDone,
    onAudible,
    pendingHandoffLabel,
    variant = 'list',
    hideCardName = false,
    hideDueDate = false,
}) => {
    const swipeableRef = useRef<Swipeable>(null);
    const isDone = task.isDone;

    const handleToggle = (taskId: string, isDone: boolean) => {
        onToggleDone(taskId, isDone);
        swipeableRef.current?.close();
    };

    const actionMarginBottom = variant === 'board' ? 8 : 12;
    const actionRadius = variant === 'board' ? 8 : 12;
    const btnMinWidth = variant === 'board' ? 80 : 100;

    // ─── Swipe Right → Toggle Done (Swipe from left) ─────────────────
    const renderLeftActions = (
        progress: Animated.AnimatedInterpolation<number>,
        _dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                style={{
                    flexDirection: 'row',
                    marginBottom: actionMarginBottom,
                    transform: [{ scale }],
                }}
            >
                <TouchableOpacity
                    onPress={() => handleToggle(task.id, !isDone)}
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: isDone ? COLORS.text.muted : COLORS.success[600],
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: btnMinWidth,
                        borderRadius: actionRadius,
                        marginRight: 4,
                    }}
                >
                    <Ionicons name={isDone ? "arrow-undo" : "checkmark-circle"} size={24} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                        {isDone ? 'UNDO' : 'DONE'}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // ─── Swipe Left ← Show Audible (Swipe from right) ──────────────────────
    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        _dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
            extrapolate: 'clamp',
        });

        if (isDone) return null;

        return (
            <Animated.View
                style={{
                    flexDirection: 'row',
                    marginBottom: actionMarginBottom,
                    transform: [{ scale }],
                }}
            >
                <TouchableOpacity
                    onPress={() => {
                        onAudible?.(task.id);
                        swipeableRef.current?.close();
                    }}
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: COLORS.warning[500],
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: btnMinWidth + 20,
                        borderRadius: actionRadius,
                        marginLeft: 4,
                    }}
                >
                    <Ionicons name="megaphone" size={24} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                        AUDIBLE
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            leftThreshold={40}
            rightThreshold={40}
            overshootLeft={false}
            overshootRight={false}
            friction={2}
        >
            <TaskRow
                task={task}
                onPress={onPress}
                onToggleDone={onToggleDone}
                variant={variant}
                hideCardName={hideCardName}
                hideDueDate={hideDueDate}
                pendingHandoffLabel={pendingHandoffLabel}
            />
        </Swipeable>
    );
};
