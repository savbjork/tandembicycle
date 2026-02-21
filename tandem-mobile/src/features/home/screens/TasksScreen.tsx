import React from 'react';
import { View, ScrollView, TouchableOpacity, LayoutAnimation, Alert, Modal } from 'react-native';
import { Text, TextInput, Button, BottomSheet } from '@shared/components/ui';
import { TaskRow } from '@shared/components/SwipeableTaskRow';
import { Ionicons } from '@expo/vector-icons';
import { fakeData, type Person, type Task } from '@shared/data/FakeDataStore';
import { COLORS } from '@shared/constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper to get YYYY-MM-DD from a local Date object without UTC shifts
const toDateStringLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const TasksScreen: React.FC = () => {
    const selectedPerson: Person = 'Savannah';
    const [showCreateTask, setShowCreateTask] = React.useState(false);
    const [tasks, setTasks] = React.useState<Task[]>(fakeData.tasks);

    // Refresh tasks when screen comes into focus
    React.useEffect(() => {
        setTasks([...fakeData.tasks]);
    }, []);

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
        // Find in fakeData and update too
        const task = fakeData.tasks.find(t => t.id === taskId);
        if (task) {
            task.isDone = isDone;
        }
    };

    const handleCreateTask = () => {
        if (!newTaskName.trim()) {
            Alert.alert('Missing name', 'Please enter a task name.');
            return;
        }

        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            name: newTaskName.trim(),
            owner: selectedPerson,
            isDone: false,
            dueDate: toDateStringLocal(newTaskDueDateObj),
            card: newTaskCard || 'Daily Tidying',
            note: newTaskNote.trim() || undefined,
        };

        fakeData.tasks.unshift(newTask);
        setTasks([newTask, ...tasks]);

        // Reset and Close
        setNewTaskName('');
        setNewTaskCard('');
        setNewTaskDueDateObj(new Date());
        setNewTaskNote('');
        setShowCreateTask(false);

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    const availableCards = Array.from(new Set(fakeData.cards.map(c => c.name)));

    return (
        <View className="flex-1 bg-surface-dim">
            {/* Header Area */}
            <View className="px-6 pt-12 pb-4 flex-row justify-between items-end">
                <View>
                    <Text className="text-[34px] font-bold text-text tracking-tight">
                        My Tasks
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowCreateTask(true)}
                    className="bg-primary-600 rounded-full p-3 shadow-sm"
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="mb-4" />

            {/* List */}
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
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

            {/* Create Task BottomSheet */}
            <BottomSheet
                visible={showCreateTask}
                onClose={() => setShowCreateTask(false)}
            >
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-bold text-text">New Task</Text>
                    <TouchableOpacity onPress={() => setShowCreateTask(false)}>
                        <Text className="text-primary-600 font-semibold text-lg">Cancel</Text>
                    </TouchableOpacity>
                </View>

                <View className="mb-5">
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Task Name *
                    </Text>
                    <TextInput
                        className="bg-surface rounded-xl px-4 py-3.5 text-base text-text border border-border"
                        value={newTaskName}
                        onChangeText={setNewTaskName}
                        placeholder="What needs to be done?"
                        autoFocus
                    />
                </View>

                <View className="mb-5">
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Card
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {availableCards.map(c => (
                            <TouchableOpacity
                                key={c}
                                onPress={() => setNewTaskCard(c)}
                                className={`px-4 py-2.5 rounded-xl border ${newTaskCard === c ? 'bg-primary-600 border-primary-600' : 'bg-surface border-border'}`}
                            >
                                <Text className={`font-semibold ${newTaskCard === c ? 'text-white' : 'text-text-secondary'}`}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View className="mb-5">
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Due Date
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowNewDatePicker(true)}
                        className="bg-surface rounded-xl px-4 py-3.5 border border-border flex-row justify-between items-center"
                    >
                        <Text className="text-base text-text">
                            {newTaskDueDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                        <Text className="text-sm text-primary-600 font-medium">Change</Text>
                    </TouchableOpacity>
                </View>

                <View className="mb-8">
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Note (optional)
                    </Text>
                    <TextInput
                        className="bg-surface rounded-xl px-4 py-3.5 text-base text-text border border-border"
                        placeholder="Add any context or details..."
                        value={newTaskNote}
                        onChangeText={setNewTaskNote}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <Button
                    title="Create Task"
                    onPress={handleCreateTask}
                    variant="primary"
                    size="lg"
                    className="shadow-sm"
                    disabled={!newTaskName.trim()}
                />
            </BottomSheet>

            {/* Date Picker Modal */}
            <Modal visible={showNewDatePicker} transparent animationType="fade">
                <TouchableOpacity
                    className="flex-1 bg-black/40 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowNewDatePicker(false)}
                >
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
        </View>
    );
};
