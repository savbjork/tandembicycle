import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, BottomSheet, ScreenHeader, FieldLabel, ChipGroup, DatePickerSheet, TextInput } from '@shared/components/ui';
import { AddButton } from '@shared/components/ui/AddButton';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { TaskRow } from '@shared/components/ui/SwipeableTaskRow';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { toDateStringLocal } from '@shared/utils/date';
import type { Task } from '@shared/data/FakeDataStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@app/navigation/types';

export const TasksScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { currentUser } = useCurrentUser();
    const { cards, tasks, addTask, toggleTaskDone } = useDataStore();

    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskCard, setNewTaskCard] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [newTaskNote, setNewTaskNote] = useState('');

    const myTasks = useMemo(
        () => tasks.filter((t: Task) => t.owner === currentUser),
        [tasks, currentUser],
    );

    const pendingTasks = useMemo(
        () => myTasks.filter((t: Task) => !t.isDone),
        [myTasks],
    );

    const completedTasks = useMemo(
        () => myTasks.filter((t: Task) => t.isDone),
        [myTasks],
    );

    const handleAddTask = () => {
        if (!newTaskName.trim()) return;

        const task: Task = {
            id: `t${Date.now()}`,
            name: newTaskName.trim(),
            card: newTaskCard || cards[0]?.name || 'Uncategorized',
            owner: currentUser,
            dueDate: newTaskDueDate ? toDateStringLocal(newTaskDueDate) : '',
            isDone: false,
            note: newTaskNote.trim() || undefined,
        };

        addTask(task);
        setNewTaskName('');
        setNewTaskCard('');
        setNewTaskDueDate(undefined);
        setNewTaskNote('');
        setShowAddTask(false);
    };

    const handleToggleDone = (taskId: string, _isDone: boolean) => {
        toggleTaskDone(taskId);
    };

    const cardOptions = useMemo(() =>
        cards
            .filter(c => c.owner === currentUser)
            .map(c => ({ key: c.name, label: c.name })),
        [cards, currentUser]
    );

    return (
        <View className="flex-1 bg-surface-dim">
            <ScreenHeader
                title="My Tasks"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <View className="flex-row items-center gap-2">
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
                            <Text className="text-sm text-text-secondary">All caught up! 🎉</Text>
                        </View>
                    ) : (
                        pendingTasks.map((task: Task) => (
                            <View key={task.id} className="bg-surface rounded-xl border border-border-light shadow-sm mb-2">
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
                            <View key={task.id} className="bg-surface rounded-xl border border-border-light shadow-sm mb-2 opacity-60">
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

            {/* Add Task Bottom Sheet */}
            <BottomSheet
                visible={showAddTask}
                onClose={() => setShowAddTask(false)}
            >
                <Text className="text-xl font-bold text-text mb-4">New Task</Text>

                <TextInput
                    className="text-lg font-medium text-text mb-4 py-3 px-4 rounded-xl bg-surface-dim border border-border"
                    placeholder="What needs to be done?"
                    value={newTaskName}
                    onChangeText={setNewTaskName}
                    autoFocus
                    placeholderTextColor={COLORS.text.muted}
                />

                {/* Card Picker */}
                <FieldLabel>Card</FieldLabel>
                <ChipGroup
                    options={cardOptions}
                    value={newTaskCard}
                    onChange={setNewTaskCard}
                    scrollable
                    className="mb-4"
                />

                {/* Due Date Picker */}
                <FieldLabel>Due Date</FieldLabel>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="py-3 px-4 rounded-xl bg-surface-dim border border-border flex-row items-center gap-3 mb-4"
                >
                    <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
                    <Text className="text-base text-text">
                        {newTaskDueDate ? newTaskDueDate.toLocaleDateString() : 'No due date'}
                    </Text>
                </TouchableOpacity>

                {/* Notes */}
                <FieldLabel>Notes</FieldLabel>
                <TextInput
                    className="text-base text-text mb-6 py-3 px-4 rounded-xl bg-surface-dim border border-border min-h-[80px]"
                    placeholder="Add notes..."
                    value={newTaskNote}
                    onChangeText={setNewTaskNote}
                    multiline
                    textAlignVertical="top"
                    placeholderTextColor={COLORS.text.muted}
                />

                <TouchableOpacity
                    className="bg-primary-600 py-4 rounded-2xl items-center shadow-sm"
                    onPress={handleAddTask}
                >
                    <Text className="text-white font-bold text-base">Add Task</Text>
                </TouchableOpacity>
            </BottomSheet>

            <DatePickerSheet
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                value={newTaskDueDate}
                onChange={setNewTaskDueDate}
            />
        </View>
    );
};
