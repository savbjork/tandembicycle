import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@shared/components/ui/Text';
import { AddButton } from '@shared/components/ui';
import { SwipeableTaskRow } from '@shared/components/SwipeableTaskRow';
import { Ionicons } from '@expo/vector-icons';
import { fakeData, type Person, type Task, type TaskStatus } from '@shared/data/FakeDataStore';
import { COLORS } from '@shared/constants/colors';

// ─── View Constants ──────────────────────────────────────────

type TimeFilter = 'week' | 'month' | 'year' | 'all';

// Helper to get YYYY-MM-DD from a local Date object without UTC shifts
const toDateStringLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

const STATUS_CHIP_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
    'To Do': { bg: 'bg-gray-100', text: 'text-gray-700' },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Done': { bg: 'bg-green-100', text: 'text-green-700' },
};

// ─── Component ───────────────────────────────────────────────

export const TasksScreen: React.FC = () => {
    const selectedPerson: Person = 'Savannah';
    const [showCreateTask, setShowCreateTask] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [tasks, setTasks] = React.useState<Task[]>(fakeData.tasks);
    const [timeFilter, setTimeFilter] = React.useState<TimeFilter>('all');

    const [newTaskName, setNewTaskName] = React.useState('');
    const [newTaskCard, setNewTaskCard] = React.useState('');
    const [newTaskDueDateObj, setNewTaskDueDateObj] = React.useState<Date>(new Date());
    const [showNewDatePicker, setShowNewDatePicker] = React.useState(false);
    const [newTaskStatus, setNewTaskStatus] = React.useState<TaskStatus>('To Do');
    const [newTaskNote, setNewTaskNote] = React.useState('');

    // Filter tasks for current user
    const userTasks = tasks.filter((task) => {
        const isOwner = task.owner === selectedPerson;
        if (!isOwner) return false;

        if (timeFilter === 'all') return true;

        const taskDate = new Date(task.dueDate + 'T00:00:00');
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (timeFilter === 'week') {
            const nextWeek = new Date(now);
            nextWeek.setDate(now.getDate() + 7);
            return taskDate >= now && taskDate <= nextWeek;
        }
        if (timeFilter === 'month') {
            const nextMonth = new Date(now);
            nextMonth.setMonth(now.getMonth() + 1);
            return taskDate >= now && taskDate <= nextMonth;
        }
        if (timeFilter === 'year') {
            const nextYear = new Date(now);
            nextYear.setFullYear(now.getFullYear() + 1);
            return taskDate >= now && taskDate <= nextYear;
        }
        return true;
    });

    const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
    };

    const handleAudible = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        Alert.alert(
            'Call an Audible?',
            `Ask Kevin to help with "${task?.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Request',
                    onPress: () => Alert.alert('Sent!', 'Kevin will see this request in his Inbox.')
                }
            ]
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
            status: newTaskStatus,
            owner: selectedPerson,
            note: newTaskNote.trim() || undefined,
        };

        setTasks([newTask, ...tasks]);
        setShowCreateTask(false);
        setNewTaskName('');
        setNewTaskCard('');
        setNewTaskDueDateObj(new Date());
        setNewTaskStatus('To Do');
        setNewTaskNote('');
    };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        setSelectedTask(null);
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setSelectedTask(null);
    };

    const availableCards = Array.from(new Set(tasks.map((t) => t.card))).filter(Boolean);

    return (
        <View className="flex-1 bg-surface-dim">
            {/* Header */}
            <View className="px-5 pt-[60px] pb-5 flex-row justify-between items-center">
                <View>
                    <Text className="text-[32px] font-bold text-text tracking-tight">
                        My Board
                    </Text>
                </View>
                <AddButton onPress={() => setShowCreateTask(true)} />
            </View>

            {/* Time Filter Pills */}
            <View className="flex-row gap-2 px-5 mb-4">
                {(['week', 'month', 'year', 'all'] as TimeFilter[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setTimeFilter(f)}
                        className={`px-4 py-2 rounded-full border ${timeFilter === f ? 'bg-primary-600 border-primary-600' : 'bg-surface border-border'
                            }`}
                    >
                        <Text className={`text-sm font-semibold capitalize ${timeFilter === f ? 'text-white' : 'text-text-secondary'
                            }`}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

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
                        <SwipeableTaskRow
                            key={task.id}
                            task={task}
                            onPress={() => setSelectedTask(task)}
                            onStatusChange={handleStatusChange}
                            onAudible={handleAudible}
                        />
                    ))
                )}

                {/* Manage Own Section */}
                <View className="mt-10 mb-20 bg-primary-50 rounded-2xl p-6 border border-primary-100">
                    <Text className="text-lg font-bold text-primary-900 mb-2">Manage Own</Text>
                    <Text className="text-sm text-primary-700 mb-4">
                        These are your private cards. No one else can see them until you hand them off or call an audible.
                    </Text>
                    <TouchableOpacity className="bg-primary-600 py-3 rounded-xl items-center">
                        <Text className="text-white font-bold">Edit Private Cards</Text>
                    </TouchableOpacity>
                </View>
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
                            Status
                        </Text>
                        <View className="flex-row gap-2 mb-5">
                            {STATUSES.map(s => {
                                const isSelected = newTaskStatus === s;
                                const style = STATUS_CHIP_COLORS[s];
                                return (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={() => setNewTaskStatus(s)}
                                        className={`flex-1 py-3 rounded-xl items-center border-2 ${isSelected ? `${style.bg} border-current` : 'bg-surface border-border'}`}
                                    >
                                        <Text className={`text-sm font-semibold ${isSelected ? style.text : 'text-text-secondary'}`}>{s}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

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

            {/* Edit Task Modal */}
            {selectedTask && (
                <EditTaskModal
                    task={selectedTask}
                    availableCards={availableCards}
                    onClose={() => setSelectedTask(null)}
                    onSave={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            )}
        </View>
    );
};

// ─── Edit Task Modal ─────────────────────────────────────────

interface EditTaskModalProps {
    task: Task;
    availableCards: string[];
    onClose: () => void;
    onSave: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, availableCards, onClose, onSave, onDelete }) => {
    const [editName, setEditName] = React.useState(task.name);
    const [editCard, setEditCard] = React.useState(task.card);
    const [editDueDateObj, setEditDueDateObj] = React.useState<Date>(new Date(task.dueDate + 'T00:00:00'));
    const [showEditDatePicker, setShowEditDatePicker] = React.useState(false);
    const [editStatus, setEditStatus] = React.useState<TaskStatus>(task.status);
    const [editOwner, setEditOwner] = React.useState<Person>(task.owner);
    const [editNote, setEditNote] = React.useState(task.note || '');

    const handleSave = () => {
        if (!editName.trim()) {
            Alert.alert('Missing name', 'Please enter a task name.');
            return;
        }
        onSave({
            ...task,
            name: editName.trim(),
            card: editCard.trim() || 'Uncategorized',
            dueDate: toDateStringLocal(editDueDateObj),
            status: editStatus,
            owner: editOwner,
            note: editNote.trim() || undefined,
        });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Task',
            `Are you sure you want to delete "${task.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete(task.id),
                },
            ]
        );
    };

    return (
        <Modal visible={true} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-surface-dim">
                <View className="items-center pt-3 pb-2">
                    <View className="w-10 h-1.5 bg-border-strong rounded-full opacity-20" />
                </View>
                <View className="px-5 py-4 flex-row justify-between items-center border-b border-border">
                    <Text className="text-xl font-bold text-text">Edit Task</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text className="text-blue-600 font-semibold text-lg">Save</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView className="flex-1 px-5 pt-5">
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Task Name *
                    </Text>
                    <TextInput
                        className="bg-surface rounded-xl px-4 py-3.5 text-base text-text mb-5 border border-border"
                        value={editName}
                        onChangeText={setEditName}
                    />

                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Card
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5" contentContainerStyle={{ gap: 8 }}>
                        {availableCards.map(c => (
                            <TouchableOpacity
                                key={c}
                                onPress={() => setEditCard(c)}
                                className={`px-4 py-2.5 rounded-xl border ${editCard === c ? 'bg-primary-600 border-primary-600' : 'bg-surface border-border'}`}
                            >
                                <Text className={`font-semibold ${editCard === c ? 'text-white' : 'text-text-secondary'}`}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Due Date
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowEditDatePicker(true)}
                        className="bg-surface rounded-xl px-4 py-3.5 mb-5 border border-border flex-row justify-between items-center"
                    >
                        <Text className="text-base text-text">
                            {editDueDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                    </TouchableOpacity>

                    <Modal visible={showEditDatePicker} transparent animationType="fade">
                        <TouchableOpacity className="flex-1 bg-black/40 justify-end" activeOpacity={1} onPress={() => setShowEditDatePicker(false)}>
                            <View className="bg-surface rounded-t-2xl px-4 pb-8 pt-4">
                                <View className="flex-row justify-between items-center mb-2 px-1">
                                    <Text className="text-lg font-bold text-text">Select Date</Text>
                                    <TouchableOpacity onPress={() => setShowEditDatePicker(false)}>
                                        <Text className="text-base font-semibold text-primary-600">Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={editDueDateObj}
                                    mode="date"
                                    display="inline"
                                    onChange={(_: any, date?: Date) => date && setEditDueDateObj(date)}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Status
                    </Text>
                    <View className="flex-row gap-2 mb-5">
                        {STATUSES.map(s => {
                            const isSelected = editStatus === s;
                            const style = STATUS_CHIP_COLORS[s];
                            return (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setEditStatus(s)}
                                    className={`flex-1 py-3 rounded-xl items-center border-2 ${isSelected ? `${style.bg} border-current` : 'bg-surface border-border'}`}
                                >
                                    <Text className={`text-sm font-semibold ${isSelected ? style.text : 'text-text-secondary'}`}>{s}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Note (optional)
                    </Text>
                    <TextInput
                        className="bg-surface rounded-xl px-4 py-3.5 text-base text-text mb-5 border border-border"
                        value={editNote}
                        onChangeText={setEditNote}
                        multiline
                        numberOfLines={3}
                    />

                    <TouchableOpacity
                        onPress={handleDelete}
                        className="bg-red-50 py-4 rounded-xl items-center mb-10 border border-red-100"
                    >
                        <Text className="text-red-600 font-bold text-lg">Delete Task</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
};
