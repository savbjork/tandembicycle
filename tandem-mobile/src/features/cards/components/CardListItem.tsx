import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, OwnerBadge } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { TaskRow } from '@shared/components/ui/SwipeableTaskRow';
import { type Card, type Task, type CardFrequency } from '@shared/data/FakeDataStore';

const FREQUENCY_STYLE: Record<CardFrequency, { bg: string; border: string }> = {
    daily: { bg: 'bg-primary-50', border: 'border-primary-200' },
    weekly: { bg: 'bg-secondary-50', border: 'border-secondary-200' },
    'as-needed': { bg: 'bg-surface', border: 'border-border-light' },
};

interface CardListItemProps {
    card: Card;
    tasks: Task[];
    isSelecting: boolean;
    isSelected: boolean;
    onPress: () => void;
    onToggleSelection: () => void;
    showOwnerBadge: boolean;
    showTasks: boolean;
    onToggleTaskDone: (taskId: string, isDone: boolean) => void;
}

export const CardListItem: React.FC<CardListItemProps> = ({
    card,
    tasks,
    isSelecting,
    isSelected,
    onPress,
    onToggleSelection,
    showOwnerBadge,
    showTasks,
    onToggleTaskDone,
}) => {
    return (
        <TouchableOpacity
            className={`${FREQUENCY_STYLE[card.frequency].bg} p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${
                isSelecting && isSelected
                    ? 'border-primary-600'
                    : FREQUENCY_STYLE[card.frequency].border
            }`}
            onPress={isSelecting ? onToggleSelection : onPress}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1 flex-row items-center gap-3">
                    {isSelecting && (
                        <Ionicons
                            name={isSelected ? "checkbox" : "square-outline"}
                            size={20}
                            color={isSelected ? COLORS.primary[600] : COLORS.text.muted}
                        />
                    )}
                    <Text className="text-[17px] font-bold text-text">
                        {card.name}
                    </Text>
                </View>
                {!isSelecting && showOwnerBadge && (
                    <OwnerBadge name={card.owner} />
                )}
            </View>

            {!isSelecting && showTasks && tasks.length > 0 && (
                <View className="pl-0 mt-2">
                    {tasks.slice(0, 3).map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onToggleDone={onToggleTaskDone}
                            variant="list"
                            hideBackground
                            hideCardName
                            showOwnerIcon={false}
                        />
                    ))}
                    {tasks.length > 3 && (
                        <Text className="text-[11px] text-text-muted italic ml-14">
                            + {tasks.length - 3} more tasks
                        </Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};
