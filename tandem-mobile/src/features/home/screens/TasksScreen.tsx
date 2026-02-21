import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@shared/components/ui/Text';
import { AddButton } from '@shared/components/ui';
import { TaskRow } from '@shared/components/SwipeableTaskRow';
import { Ionicons } from '@expo/vector-icons';
import { fakeData, type Person, type Task } from '@shared/data/FakeDataStore';
import { COLORS } from '@shared/constants/colors';

// ─── View Constants ──────────────────────────────────────────


// Helper to get YYYY-MM-DD from a local Date object without UTC shifts
const toDateStringLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ─── Component ───────────────────────────────────────────────

export const TasksScreen: React.FC = () => {
    const navigation = useNavigation();
    const selectedPerson: Person = 'Savannah';
    const [showCreateTask, setShowCreateTask] = React.useState(false);
    const [tasks, setTasks] = React.useState<Task[]>(fakeData.tasks);

    // Refresh tasks when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setTasks([...fakeData.tasks]);
        }, [])
    );

    const [newTaskName, setNewTaskName] = React.useState('');
    const [newTaskCard, setNewTaskCard] = React.useState('');
    const [newTaskDueDateObj, setNewTaskDueDateObj] = React.useState<Date>(new Date());
    const [showNewDatePicker, setShowNewDatePicker] = React.useState(false);
    const [newTaskNote, setNewTaskNote] = React.useState('');

    // Filter tasks for current user
    const userTasks = tasks.filter((task) => task.owner === selectedPerson);

    const handleToggleDone = (taskId: string, isDone: boolean) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, isDone } : t))
        );
    };


    const handleCreateTask = () => {
        if (!newTaskName.trim()) {
            Alert.alert('Missing name', 'Please enter a task name.');
            return;
        }

        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            name: newTaskName.trim(),
            card: newTaskCard.trim() || 'Uncategorized',
            dueDate: toDateStringLocal(newTaskDueDateObj),
            isDone: false,
            owner: selectedPerson,
            note: newTaskNote.trim() || undefined,
        };

        fakeData.tasks.unshift(newTask);
        setTasks([...fakeData.tasks]);
        setShowCreateTask(false);
        setNewTaskName('');
        setNewTaskCard('');
        setNewTaskDueDateObj(new Date());
        setNewTaskNote('');
    };

    const availableCards = Array.from(new Set(tasks.map((t) => t.card))).filter(Boolean);

    return (
        <View className="flex-1 bg-surface-dim">
            {/* Header */}
            <View className="px-5 pt-[60px] pb-5 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color={COLORS.text.DEFAULT} />
                    </TouchableOpacity>
                    <Text className="text-[32px] font-bold text-text tracking-tight">
                        My Tasks
                    </Text>
                </View>
                <AddButton onPress={() => setShowCreateTask(true)} />
            </View>

            <View className="mb-4" />

            {/* List View */}
            <ScrollView className="flex-1 px-5">
                {userTasks.length === 0 ? (
                    <View className="bg-surface rounded-2xl p-10 items-center justify-center border border-dashed border-border mt-4">
                        <Ionicons name="clipboard-outline" size={48} color={COLORS.text.muted} />
                        <Text className="text-text-muted text-center mt-4 text-base">
                            No tasks for this period.{'\n'}Enjoy the peace of mind!
                        </Text>
                    </View>
                ) : (
                    userTasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onToggleDone={handleToggleDone}
                        />
                    ))
                )}
            </ScrollView>

            {/* Create Task Modal */}
            <Modal
                visible={showCreateTask}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCreateTask(false)}
            >
                <View className="flex-1 bg-surface-dim">
                    {/* Visual Grabber */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1.5 bg-border-strong rounded-full opacity-20" />
                    </View>
                    <View className="px-5 py-4 flex-row justify-between items-center border-b border-border">
                        <Text className="text-xl font-bold text-text">New Task</Text>
                        <TouchableOpacity onPress={() => setShowCreateTask(false)}>
                            <Text className="text-blue-600 font-semibold text-lg">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="flex-1 px-5 pt-5">
                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Task Name *
                        </Text>
                        <TextInput
                            className="bg-surface rounded-xl px-4 py-3.5 text-base text-text mb-5 border border-border"
                            placeholder="What needs to be done?"
                            value={newTaskName}
                            onChangeText={setNewTaskName}
                            autoFocus
                        />

                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Card
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5" contentContainerStyle={{ gap: 8 }}>
                            {availableCards.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => setNewTaskCard(c)}
                                    className={`px-4 py-2.5 rounded-xl border ${newTaskCard === c ? 'bg-primary-600 border-primary-600' : 'bg-surface border-border'}`}
                                >
                                    <Text className={`font-semibold ${newTaskCard === c ? 'text-white' : 'text-text-secondary'}`}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                onPress={() => setNewTaskCard('')}
                                className={`px-4 py-2.5 rounded-xl border ${!newTaskCard ? 'bg-primary-600 border-primary-600' : 'bg-surface border-border'}`}
                            >
                                <Text className={`font-semibold ${!newTaskCard ? 'text-white' : 'text-text-secondary'}`}>Uncategorized</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Due Date
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowNewDatePicker(true)}
                            className="bg-surface rounded-xl px-4 py-3.5 mb-5 border border-border flex-row justify-between items-center"
                        >
                            <Text className="text-base text-text">
                                {newTaskDueDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                            <Text className="text-sm text-primary-600 font-medium">Change</Text>
                        </TouchableOpacity>

                        <Modal visible={showNewDatePicker} transparent animationType="fade">
                            <TouchableOpacity className="flex-1 bg-black/40 justify-end" activeOpacity={1} onPress={() => setShowNewDatePicker(false)}>
                                <View className="bg-surface rounded-t-2xl px-4 pb-8 pt-4">
                                    <View className="flex-row justify-between items-center mb-2 px-1">
                                        <Text className="text-lg font-bold text-text">Select Date</Text>
                                        <TouchableOpacity onPress={() => setShowNewDatePicker(false)}>
                                            <Text className="text-base font-semibold text-primary-600">Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={newTaskDueDateObj}
                                        mode="date"
                                        display="inline"
                                        onChange={(_: any, date?: Date) => date && setNewTaskDueDateObj(date)}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>


                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Note (optional)
                        </Text>
                        <TextInput
                            className="bg-surface rounded-xl px-4 py-3.5 text-base text-text mb-5 border border-border"
                            placeholder="Add any context or details..."
                            value={newTaskNote}
                            onChangeText={setNewTaskNote}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity
                            onPress={handleCreateTask}
                            className="bg-primary-600 py-4 rounded-xl items-center mb-10 shadow-sm"
                        >
                            <Text className="text-white font-bold text-lg">Create Task</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};
