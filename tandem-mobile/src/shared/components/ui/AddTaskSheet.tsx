import React, { useState, useEffect, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { TextInput } from './TextInput';
import { FieldLabel } from './FieldLabel';
import { BottomSheet } from './BottomSheet';
import { DatePickerSheet } from './DatePickerSheet';
import { CardPickerField } from './CardPickerField';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { toDateStringLocal } from '@shared/utils/date';
import type { Task } from '@shared/data/FakeDataStore';

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  initialCard?: string;
  initialNote?: string;
  onTaskAdded?: (task: Task) => void;
}

export const AddTaskSheet: React.FC<AddTaskSheetProps> = ({
  visible,
  onClose,
  initialCard,
  initialNote,
  onTaskAdded,
}) => {
  const { currentUser } = useCurrentUser();
  const { cards, addTask } = useDataStore();

  const [taskName, setTaskName] = useState('');
  const [taskCard, setTaskCard] = useState(initialCard ?? '');
  const [taskNote, setTaskNote] = useState(initialNote ?? '');
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reset fields each time the sheet opens; always close date picker when visibility changes
  useEffect(() => {
    setShowDatePicker(false);
    if (visible) {
      setTaskName('');
      setTaskCard(initialCard ?? '');
      setTaskNote(initialNote ?? '');
      setTaskDueDate(undefined);
    }
  }, [visible, initialCard, initialNote]);

  const cardOptions = useMemo(
    () => cards.filter((c) => c.owner === currentUser).map((c) => ({ key: c.name, label: c.name })),
    [cards, currentUser]
  );

  const handleAdd = () => {
    if (!taskName.trim()) return;

    const task: Task = {
      id: `t${Date.now()}`,
      name: taskName.trim(),
      card: taskCard || cards[0]?.name || 'Uncategorized',
      owner: currentUser,
      dueDate: taskDueDate ? toDateStringLocal(taskDueDate) : '',
      isDone: false,
      note: taskNote.trim() || undefined,
    };

    addTask(task);
    onTaskAdded?.(task);
    onClose();
  };

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose}>
        <TextInput
          className="text-lg font-medium text-text mb-4 py-3 px-4 rounded-xl bg-surface-dim border border-border"
          placeholder="New Task"
          value={taskName}
          onChangeText={setTaskName}
          placeholderTextColor={COLORS.text.muted}
        />

        <FieldLabel>Card</FieldLabel>
        <View className="mb-4">
          <CardPickerField options={cardOptions} value={taskCard} onChange={setTaskCard} />
        </View>

        <FieldLabel>Due Date</FieldLabel>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="py-3 px-4 rounded-xl bg-surface-dim border border-border flex-row items-center gap-3 mb-4"
        >
          <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
          <Text className="text-base text-text">
            {taskDueDate ? taskDueDate.toLocaleDateString() : 'No due date'}
          </Text>
        </TouchableOpacity>

        <FieldLabel>Notes</FieldLabel>
        <TextInput
          className="text-base text-text mb-6 py-3 px-4 rounded-xl bg-surface-dim border border-border min-h-[80px]"
          placeholder="Add notes..."
          value={taskNote}
          onChangeText={setTaskNote}
          multiline
          textAlignVertical="top"
          placeholderTextColor={COLORS.text.muted}
        />

        <TouchableOpacity
          className="bg-primary-600 py-4 rounded-2xl items-center shadow-sm"
          onPress={handleAdd}
        >
          <Text className="text-white font-bold text-base">Add Task</Text>
        </TouchableOpacity>

        <DatePickerSheet
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          value={taskDueDate}
          onChange={setTaskDueDate}
        />
      </BottomSheet>
    </>
  );
};
