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

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
    'To Do': 'In Progress',
    'In Progress': 'Done',
    'Done': 'To Do',
};

const NEXT_STATUS_LABEL: Record<TaskStatus, string> = {
    'To Do': '▶ Start',
    'In Progress': '✓ Done',
    'Done': '↺ Reopen',
};

const NEXT_STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
    'To Do': { bg: '#3B82F6', text: '#FFFFFF' },      // blue → start
    'In Progress': { bg: '#22C55E', text: '#FFFFFF' }, // green → done
    'Done': { bg: '#6B7280', text: '#FFFFFF' },        // gray → reopen
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
    pendingHandoffLabel?: string | null;
    variant?: 'list' | 'board';
}

// ─── Component ───────────────────────────────────────────────

export const SwipeableTaskRow: React.FC<SwipeableTaskRowProps> = ({
    task,
    onPress,
    onStatusChange,
    pendingHandoffLabel,
    variant = 'list',
}) => {
    const isBoard = variant === 'board';
    const swipeableRef = useRef<Swipeable>(null);

    const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
    const statusStyle = STATUS_STYLES[task.status];
    const isDone = task.status === 'Done';

    // ─── Swipe Right → Mark Done / Undo Done ─────────────
    const renderLeftActions = (
        progress: Animated.AnimatedInterpolation<number>,
        _dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
            extrapolate: 'clamp',
        });

        const opacity = progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.5, 1],
            extrapolate: 'clamp',
        });

        const isCurrentlyDone = task.status === 'Done';

        return (
            <Animated.View
                style={{
                    backgroundColor: isCurrentlyDone ? '#6B7280' : '#22C55E',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    paddingLeft: isBoard ? 14 : 20,
                    borderRadius: isBoard ? 8 : 12,
                    marginBottom: isBoard ? 8 : 12,
                    flex: 1,
                    opacity,
                }}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: isBoard ? 16 : 20,
                            fontWeight: '700',
                        }}>
                            {isCurrentlyDone ? '↺' : '✓'}
                        </Text>
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: isBoard ? 10 : 12,
                            fontWeight: '600',
                            marginTop: 2,
                        }}>
                            {isCurrentlyDone ? 'Undo' : 'Done'}
                        </Text>
                    </View>
                </Animated.View>
            </Animated.View>
        );
    };

    // ─── Swipe Left → Move Stage ─────────────────────────
    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        _dragX: Animated.AnimatedInterpolation<number>,
    ) => {
        const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
            extrapolate: 'clamp',
        });

        const opacity = progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.5, 1],
            extrapolate: 'clamp',
        });

        const nextColors = NEXT_STATUS_COLORS[task.status];
        const nextLabel = NEXT_STATUS_LABEL[task.status];

        return (
            <Animated.View
                style={{
                    backgroundColor: nextColors.bg,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    paddingRight: isBoard ? 14 : 20,
                    borderRadius: isBoard ? 8 : 12,
                    marginBottom: isBoard ? 8 : 12,
                    flex: 1,
                    opacity,
                }}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{
                            color: nextColors.text,
                            fontSize: isBoard ? 12 : 14,
                            fontWeight: '700',
                        }}>
                            {nextLabel}
                        </Text>
                    </View>
                </Animated.View>
            </Animated.View>
        );
    };

    // ─── Swipe Handlers ──────────────────────────────────
    const handleSwipeRight = () => {
        // Toggle done status
        const newStatus: TaskStatus = task.status === 'Done' ? 'To Do' : 'Done';
        onStatusChange(task.id, newStatus);
        swipeableRef.current?.close();
    };

    const handleSwipeLeft = () => {
        const nextStatus = NEXT_STATUS[task.status];
        onStatusChange(task.id, nextStatus);
        swipeableRef.current?.close();
    };

    // ─── Render ──────────────────────────────────────────
    return (
        <Swipeable
            ref={swipeableRef}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            onSwipeableOpen={(direction) => {
                if (direction === 'left') {
                    handleSwipeRight();
                } else {
                    handleSwipeLeft();
                }
            }}
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
                        <View className={`w-5 h-5 rounded border-2 mr-3 ${isDone ? 'bg-green-500 border-green-500' : overdue ? 'border-red-400' : 'border-border-strong'}`} />
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
