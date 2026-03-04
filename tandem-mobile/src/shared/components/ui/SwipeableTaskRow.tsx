import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import type { Task } from '@shared/data/FakeDataStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/navigation/types';
import { formatShortDate, isOverdue } from '@shared/utils/date';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';

// ─── Props ───────────────────────────────────────────────────

interface TaskRowProps {
    task: Task;
    onPress?: () => void;
    onToggleDone?: (taskId: string, isDone: boolean) => void;
    variant?: 'list' | 'board' | 'compact';
    hideBackground?: boolean;
    hideCardName?: boolean;
    hideDueDate?: boolean;
    showOwnerIcon?: boolean;
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
    showOwnerIcon = false,
    pendingHandoffLabel,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const isBoard = variant === 'board';
    const isCompact = variant === 'compact';
    const { currentUser } = useCurrentUser();
    const overdue = task.dueDate ? isOverdue(task.dueDate) && !task.isDone : false;
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
                        {formatShortDate(task.dueDate)}
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
                            {overdue ? 'Overdue' : formatShortDate(task.dueDate)}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            className={`${hideBackground ? '' : 'bg-surface shadow-sm ' + (overdue ? 'border border-red-200' : '')} ${hideBackground ? '' : hideCardName ? 'mb-1.5' : 'mb-3'} ${hideCardName ? 'py-1.5' : 'py-3.5'} rounded-xl px-4`}
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
                <View className="items-end flex-row items-center gap-3">
                    <View className="items-end">
                        {!hideDueDate && (
                            <Text className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
                                {overdue ? 'Overdue' : formatShortDate(task.dueDate)}
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
                    {showOwnerIcon && (
                        <View className={`w-8 h-8 rounded-full items-center justify-center ${task.owner === currentUser ? 'bg-primary-600' : 'bg-secondary-600'}`}>
                            <Text className="text-white text-[12px] font-bold">
                                {task.owner.charAt(0)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Passthrough to avoid breaking existing imports while we refactor if needed
export const SwipeableTaskRow: React.FC<TaskRowProps> = (props) => <TaskRow {...props} />;
