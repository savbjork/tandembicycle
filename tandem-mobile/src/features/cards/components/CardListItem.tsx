import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, OwnerBadge } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { TaskRow } from '@shared/components/ui/SwipeableTaskRow';
import { type Card, type Task, type DomainStrain } from '@shared/data/FakeDataStore';
import {
  domainHue,
  HUE_FILL_CLASS,
  HUE_BORDER_CLASS,
  HUE_TITLE_CLASS,
  HUE_SUB_CLASS,
} from '@shared/utils';

const STRAIN_DOT_CLASS: Record<DomainStrain, string> = {
  light: 'bg-success-600',
  manageable: 'bg-warning-500',
  drowning: 'bg-error-600',
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
  const hue = domainHue(card.name);

  return (
    <TouchableOpacity
      className={`p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${HUE_FILL_CLASS[hue]} ${
        isSelecting && isSelected ? 'border-primary-600' : HUE_BORDER_CLASS[hue]
      }`}
      onPress={isSelecting ? onToggleSelection : onPress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1 flex-row items-center gap-3">
          {isSelecting && (
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={20}
              color={isSelected ? COLORS.primary[600] : COLORS.text.muted}
            />
          )}
          {!isSelecting && card.strain && (
            <View className={`w-2 h-2 rounded-full ${STRAIN_DOT_CLASS[card.strain]}`} />
          )}
          <Text className={`text-[17px] font-bold ${HUE_TITLE_CLASS[hue]}`}>{card.name}</Text>
        </View>
        {!isSelecting && showOwnerBadge && <OwnerBadge name={card.owner ?? 'Unclaimed'} />}
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
            <Text className={`text-[11px] italic ml-14 ${HUE_SUB_CLASS[hue]}`}>
              + {tasks.length - 3} more tasks
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
