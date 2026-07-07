import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  ScreenHeader,
  FieldLabel,
  DatePickerSheet,
  EmptyState,
  EditableTitle,
  TextInput,
} from '@shared/components/ui';
import { CardPickerField } from '@shared/components/ui/CardPickerField';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { toDateStringLocal } from '@shared/utils/date';
import { selectVisibleTasks } from '@features/net/logic/netItemLogic';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { currentUser } = useCurrentUser();
  const { tasks, cards, updateTask, removeTask, toggleTaskDone } = useDataStore();

  const task = useMemo(
    () => selectVisibleTasks(tasks, currentUser).find((t) => t.id === taskId),
    [tasks, currentUser, taskId]
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const noteInputY = useRef<number>(0);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(task?.name || '');
  const [editCard, setEditCard] = useState(task?.card || '');
  const [editNote, setEditNote] = useState(task?.note || '');
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Keep a ref with the latest edit values so the beforeRemove listener always saves current state,
  // even when navigated away via iOS swipe-back (which bypasses the back button's onBack handler).
  const latestEdits = useRef({ editName, editCard, editNote, editDueDate });
  useEffect(() => {
    latestEdits.current = { editName, editCard, editNote, editDueDate };
  });

  useEffect(() => {
    if (!task) return;
    return navigation.addListener('beforeRemove', () => {
      const {
        editName: name,
        editCard: card,
        editNote: note,
        editDueDate: dueDate,
      } = latestEdits.current;
      updateTask(taskId, {
        name: name.trim() || task.name,
        card: card || task.card,
        dueDate: dueDate ? toDateStringLocal(dueDate) : task.dueDate,
        note,
      });
    });
  }, [navigation, task]);

  if (!task) {
    return (
      <View className="flex-1 bg-surface-dim">
        <ScreenHeader title="Task" showBack onBack={() => navigation.goBack()} />
        <EmptyState
          title="Task not found"
          description="The task you're looking for might have been deleted."
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const handleSave = () => {
    navigation.goBack(); // beforeRemove listener handles saving
  };

  const handleRename = () => {
    if (editName.trim() && editName !== task.name) {
      updateTask(task.id, { name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Task?', `Are you sure you want to delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeTask(taskId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleToggleDone = () => {
    toggleTaskDone(taskId);
  };

  const cardOptions = useMemo(
    () => cards.filter((c) => c.owner === currentUser).map((c) => ({ key: c.name, label: c.name })),
    [cards, currentUser]
  );

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader title="" showBack={false} onBack={handleSave} compact />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5 pb-5"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <EditableTitle
            value={editName}
            isEditing={isEditingName}
            setIsEditing={setIsEditingName}
            onChangeText={setEditName}
            onSave={handleRename}
            placeholder="Task name"
          />

          {/* Status - compact inline toggle */}
          <TouchableOpacity
            onPress={handleToggleDone}
            className="flex-row items-center gap-2 mb-4 py-1"
          >
            <Ionicons
              name={task.isDone ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={task.isDone ? COLORS.evergreen[600] : COLORS.text.muted}
            />
            <Text
              className={`text-sm font-semibold ${task.isDone ? 'text-evergreen-600' : 'text-text-secondary'}`}
            >
              {task.isDone ? 'Completed' : 'Pending'}
            </Text>
          </TouchableOpacity>

          {/* Card Assignment */}
          <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
            <FieldLabel>Card</FieldLabel>
            <CardPickerField options={cardOptions} value={editCard} onChange={setEditCard} />
          </View>

          {/* Due Date */}
          <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
            <FieldLabel>Due Date</FieldLabel>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="py-2 flex-row items-center gap-3"
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
              <Text className="text-base text-text">
                {editDueDate ? editDueDate.toLocaleDateString() : 'No due date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View
            className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm"
            onLayout={(e) => {
              noteInputY.current = e.nativeEvent.layout.y;
            }}
          >
            <FieldLabel>Notes</FieldLabel>
            <TextInput
              className="text-base text-text py-2 min-h-[120px]"
              value={editNote}
              onChangeText={setEditNote}
              placeholder="Add notes..."
              placeholderTextColor={COLORS.text.muted}
              multiline
              textAlignVertical="top"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({ y: noteInputY.current, animated: true });
                }, 100);
              }}
            />
          </View>

          <View className="flex-row gap-3 mt-2 mb-6">
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-error-50 rounded-xl border border-error-200"
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error[600]} />
              <Text className="text-sm font-bold text-error-600">Delete</Text>
            </TouchableOpacity>
          </View>
          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerSheet
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        value={editDueDate}
        onChange={setEditDueDate}
      />
    </View>
  );
};
