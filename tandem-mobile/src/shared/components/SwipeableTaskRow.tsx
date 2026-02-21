import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Text } from '@shared/components/ui/Text';
import type { Task, TaskStatus } from '@shared/data/FakeDataStore';

// ─── Status helpers ──────────────────────────────────────────

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string }> = {
    'To Do': { bg: 'bg-gray-100', text: 'text-gray-600' },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-600' },
    'Done': { bg: 'bg-green-100', text: 'text-green-600' },
};

const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

const STATUS_COLORS: Record<TaskStatus, string> = {
    'To Do': '#6B7280',       // gray
    'In Progress': '#3B82F6', // blue
    'Done': '#22C55E',        // green
};

/** All statuses except the current one */
const getOtherStatuses = (current: TaskStatus): TaskStatus[] => {
    return STATUSES.filter(s => s !== current);
};

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

interface SwipeableTaskRowProps {
    task: Task;
    onPress: () => void;
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onAudible?: (taskId: string) => void;
    pendingHandoffLabel?: string | null;
    variant?: 'list' | 'board';
}

// ─── Component ───────────────────────────────────────────────

export const SwipeableTaskRow: React.FC<SwipeableTaskRowProps> = ({
    task,
    onPress,
    onStatusChange,
    onAudible,
    pendingHandoffLabel,
    variant = 'list',
}) => {
    const isBoard = variant === 'board';
    const swipeableRef = useRef<Swipeable>(null);

    const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
    const statusStyle = STATUS_STYLES[task.status];
    const isDone = task.status === 'Done';

    const otherStatuses = getOtherStatuses(task.status);

    const handleChangeStatus = (newStatus: TaskStatus) => {
        onStatusChange(task.id, newStatus);
        swipeableRef.current?.close();
    };

    const btnPadding = isBoard ? 10 : 14;
    const btnFontSize = isBoard ? 11 : 13;
    const actionRadius = isBoard ? 8 : 12;
    const actionMarginBottom = isBoard ? 8 : 12;
    const btnMinWidth = isBoard ? 70 : 85;

    // ─── Swipe Left → Show other stages ─────────────────
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
                {otherStatuses.map((status) => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => handleChangeStatus(status)}
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: STATUS_COLORS[status],
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: btnPadding,
                            minWidth: btnMinWidth,
                            borderRadius: actionRadius,
                            marginRight: 4,
                        }}
                    >
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: btnFontSize,
                            fontWeight: '700',
                        }}>
                            {status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        );
    };

    // ─── Swipe Left ← Show Audible ──────────────────────
    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        _dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
            extrapolate: 'clamp',
        });

        if (task.status === 'Done') return null;

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
                        backgroundColor: '#F59E0B', // amber-500
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: btnPadding,
                        minWidth: btnMinWidth + 20,
                        borderRadius: actionRadius,
                        marginLeft: 4,
                    }}
                >
                    <Text style={{
                        color: '#FFFFFF',
                        fontSize: btnFontSize,
                        fontWeight: '700',
                    }}>
                        CALL AUDIBLE
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // ─── Render ──────────────────────────────────────────
    return (
        <Swipeable
            ref={swipeableRef}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            leftThreshold={isBoard ? 60 : 80}
            rightThreshold={isBoard ? 60 : 80}
            overshootLeft={false}
            overshootRight={false}
            friction={2}
        >
            {isBoard ? (
                /* ── Board variant: compact card ── */
                <TouchableOpacity
                    className={`bg-surface rounded-lg px-3.5 py-3 mb-2 shadow-sm ${overdue ? 'border border-red-200' : ''}`}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <Text className={`text-[14px] font-medium ${isDone ? 'text-text-muted line-through' : overdue ? 'text-red-600' : 'text-text'}`}>
                        {task.name}
                    </Text>
                    <View className="flex-row items-center justify-between mt-1.5">
                        <Text className="text-xs text-text-muted">{task.card}</Text>
                        <Text className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
                            {overdue ? 'Overdue' : formatDate(task.dueDate)}
                        </Text>
                    </View>
                </TouchableOpacity>
            ) : (
                /* ── List variant: full row ── */
                <TouchableOpacity
                    className={`bg-surface mb-3 rounded-xl px-4 py-3.5 shadow-sm ${overdue ? 'border border-red-200' : ''}`}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center">
                        <View className="flex-1">
                            <Text className={`text-[15px] font-medium ${isDone ? 'text-text-muted line-through' : overdue ? 'text-red-600' : 'text-text'}`}>
                                {task.name}
                            </Text>
                            <View className="flex-row items-center mt-0.5 gap-2">
                                <Text className="text-xs text-text-muted">
                                    {task.card}
                                </Text>
                                <View className={`px-1.5 py-0.5 rounded ${statusStyle.bg}`}>
                                    <Text className={`text-[10px] font-semibold ${statusStyle.text}`}>
                                        {task.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
                                {overdue ? 'Overdue' : formatDate(task.dueDate)}
                            </Text>
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
            )}
        </Swipeable>
    );
};
