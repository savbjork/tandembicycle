import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, ScreenHeader, FieldLabel, EmptyState, TextInput } from '@shared/components/ui';
import { EditableTitle } from '@shared/components/ui/EditableTitle';
import { AddTaskSheet } from '@shared/components/ui/AddTaskSheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { TaskRow } from '@shared/components/ui/SwipeableTaskRow';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import type { Task } from '@shared/data/FakeDataStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@app/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'CardDetail'>;

export const CardDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { cardName } = route.params;
  const { currentUser } = useCurrentUser();
  const { cards, tasks, toggleTaskDone, updateCard, renameCard, removeCard } = useDataStore();

  const card = useMemo(() => cards.find((c) => c.name === cardName), [cards, cardName]);

  const cardTasks = useMemo(
    () => tasks.filter((t: Task) => t.card === cardName),
    [tasks, cardName]
  );

  const [showAddTask, setShowAddTask] = useState(false);
  const [editCardName, setEditCardName] = useState(card?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNote, setEditNote] = useState(card?.note || '');

  const scrollViewRef = useRef<ScrollView>(null);
  const noteInputY = useRef<number>(0);

  if (!card) {
    return (
      <View className="flex-1 bg-surface-dim">
        <ScreenHeader title="Card Details" showBack onBack={() => navigation.goBack()} />
        <EmptyState
          title="Card not found"
          description="The card you're looking for might have been deleted."
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const isOwner = card.owner === currentUser;

  const handleRename = () => {
    if (editCardName.trim() && editCardName !== card.name) {
      renameCard(card.name, editCardName.trim());
    }
    setIsEditingName(false);
  };

  const handleToggleDone = (taskId: string, _isDone: boolean) => {
    toggleTaskDone(taskId);
  };

  const handleDelete = () => {
    Alert.alert('Delete Card?', `"${card.name}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeCard(card.name);
          navigation.goBack();
        },
      },
    ]);
  };

  const pendingTasks = cardTasks.filter((t) => !t.isDone);
  const completedTasks = cardTasks.filter((t) => t.isDone);

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader title="" showBack={false} onBack={() => navigation.goBack()} compact />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5 pb-5"
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Header */}
          <EditableTitle
            value={editCardName}
            isEditing={isEditingName}
            setIsEditing={(v) => {
              setIsEditingName(v);
              if (v) setEditCardName(card.name);
            }}
            onChangeText={setEditCardName}
            onSave={handleRename}
          />

          {/* Not Owner Banner */}
          {!isOwner && (
            <View className="bg-warning-50 rounded-xl p-4 mb-4 flex-row items-center gap-3 border border-warning-100">
              <Ionicons name="lock-closed" size={18} color={COLORS.warning[600]} />
              <Text className="text-sm text-warning-800 flex-1">
                This card belongs to {card.owner ?? 'Unclaimed'}. You can view but not edit.
              </Text>
            </View>
          )}

          {/* Pending Tasks */}
          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <FieldLabel className="mb-0">To Do</FieldLabel>
            </View>

            {pendingTasks.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 items-center border border-border-light">
                <Text className="text-sm text-text-secondary">No pending tasks</Text>
              </View>
            ) : (
              pendingTasks.map((task: Task) => (
                <View
                  key={task.id}
                  className="bg-surface rounded-xl border border-border-light shadow-sm mb-2"
                >
                  <TaskRow
                    task={task}
                    onToggleDone={handleToggleDone}
                    variant="list"
                    hideBackground
                    hideCardName
                  />
                </View>
              ))
            )}
          </View>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <View className="mb-4">
              <View className="flex-row items-center gap-2 mb-3">
                <FieldLabel className="mb-0">Done</FieldLabel>
              </View>
              {completedTasks.map((task: Task) => (
                <View
                  key={task.id}
                  className="bg-surface rounded-xl border border-border-light shadow-sm mb-2 opacity-60"
                >
                  <TaskRow
                    task={task}
                    onToggleDone={handleToggleDone}
                    variant="list"
                    hideBackground
                    hideCardName
                  />
                </View>
              ))}
            </View>
          )}

          {/* Notes */}
          <View
            className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm"
            onLayout={(e) => {
              noteInputY.current = e.nativeEvent.layout.y;
            }}
          >
            <FieldLabel>Notes</FieldLabel>
            {isOwner ? (
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
                onBlur={() => updateCard(card.name, { note: editNote })}
              />
            ) : (
              <Text className="text-base text-text py-2">{card.note || 'No notes'}</Text>
            )}
          </View>

          {/* Card Actions */}
          {isOwner && (
            <View className="flex-row gap-3 mt-2 mb-10">
              <TouchableOpacity
                onPress={() => setShowAddTask(true)}
                className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-primary-50 rounded-xl border border-primary-200"
              >
                <Ionicons name="add" size={18} color={COLORS.primary[600]} />
                <Text className="text-sm font-bold text-primary-600">Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-error-50 rounded-xl border border-error-200"
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.error[600]} />
                <Text className="text-sm font-bold text-error-600">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>

      <AddTaskSheet
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        initialCard={card.name}
      />
    </View>
  );
};
