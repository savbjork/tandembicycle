import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ScreenHeader } from '@shared/components/ui';
import { AddButton } from '@shared/components/ui/AddButton';
import { AddTaskSheet } from '@shared/components/ui/AddTaskSheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { TaskRow } from '@shared/components/ui/SwipeableTaskRow';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { isDateInTimeFrame, type TaskTimeFilter } from '@shared/utils/date';
import type { Task } from '@shared/data/FakeDataStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@app/navigation/types';
import { CardFilterSheet } from '@features/cards/components/CardFilterSheet';
import { selectVisibleTasks } from '@features/net/logic/netItemLogic';

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { currentUser } = useCurrentUser();
  const { tasks, toggleTaskDone } = useDataStore();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [taskTimeFilter, setTaskTimeFilter] = useState<TaskTimeFilter>('all');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [hideUndated, setHideUndated] = useState(false);

  const visibleTasks = useMemo(() => selectVisibleTasks(tasks, currentUser), [tasks, currentUser]);

  const pendingTasks = useMemo(
    () =>
      visibleTasks.filter(
        (t: Task) => !t.isDone && isDateInTimeFrame(t.dueDate, taskTimeFilter, hideUndated)
      ),
    [visibleTasks, taskTimeFilter, hideUndated]
  );

  const completedTasks = useMemo(
    () => (hideCompleted ? [] : visibleTasks.filter((t: Task) => t.isDone)),
    [visibleTasks, hideCompleted]
  );

  const handleToggleDone = (taskId: string, _isDone: boolean) => {
    toggleTaskDone(taskId);
  };

  const hasActiveFilters = taskTimeFilter !== 'all' || hideCompleted || hideUndated;

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader
        title="My Tasks"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setShowFilterMenu(true)}
              className="bg-surface w-11 h-11 rounded-full items-center justify-center border border-border"
            >
              <Ionicons name="options-outline" size={24} color={COLORS.text.secondary} />
              {hasActiveFilters && (
                <View className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-600 border-2 border-surface" />
              )}
            </TouchableOpacity>
            <AddButton onPress={() => setShowAddTask(true)} />
          </View>
        }
      />

      <ScrollView className="flex-1 px-5 pb-5">
        {/* Pending Tasks */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
              To Do
            </Text>
          </View>

          {pendingTasks.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center">
              <Text className="text-sm text-text-secondary">All caught up!</Text>
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
                />
              </View>
            ))
          )}
        </View>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                Done
              </Text>
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
                />
              </View>
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>

      <AddTaskSheet visible={showAddTask} onClose={() => setShowAddTask(false)} />

      <CardFilterSheet
        visible={showFilterMenu}
        onClose={() => setShowFilterMenu(false)}
        taskTimeFilter={taskTimeFilter}
        onTaskTimeFilterChange={setTaskTimeFilter}
        hideCompleted={hideCompleted}
        onHideCompletedChange={setHideCompleted}
        hideUndated={hideUndated}
        onHideUndatedChange={setHideUndated}
        showHiddenTimeOption={false}
      />
    </View>
  );
};
