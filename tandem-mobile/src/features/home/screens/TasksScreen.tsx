import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { TextInput } from '@shared/components/ui/TextInput';

// ─── Types ───────────────────────────────────────────────────

type TaskStatus = 'To Do' | 'In Progress' | 'Done';
type ViewMode = 'list' | 'board';
type Person = 'Savannah' | 'Kevin';
type HandoffStatus = 'Pending' | 'Accepted' | 'Declined' | 'Canceled';

interface Task {
    id: string;
    name: string;
    card: string;
    owner: Person;
    dueDate: string;
    status: TaskStatus;
    note?: string;
}

interface Handoff {
    id: string;
    taskId: string;
    from: Person;
    to: Person;
    message: string;
    createdAt: string;
    status: HandoffStatus;
    declineNote?: string;
}

// ─── Constants ───────────────────────────────────────────────

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; headerBg: string; headerText: string; accent: string }> = {
    'To Do': { bg: 'bg-gray-100', text: 'text-gray-600', headerBg: 'bg-gray-200', headerText: 'text-gray-700', accent: 'bg-gray-400' },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-600', headerBg: 'bg-blue-100', headerText: 'text-blue-700', accent: 'bg-blue-500' },
    'Done': { bg: 'bg-green-100', text: 'text-green-600', headerBg: 'bg-green-100', headerText: 'text-green-700', accent: 'bg-green-500' },
};

const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};

// ─── Initial Data ────────────────────────────────────────────

const INITIAL_TASKS: Task[] = [
    { id: 't1', name: 'Wipe counters', card: 'Daily Tidying', owner: 'Savannah', dueDate: '2026-02-20', status: 'In Progress' },
    { id: 't2', name: 'Put away items', card: 'Daily Tidying', owner: 'Savannah', dueDate: '2026-02-20', status: 'To Do' },
    { id: 't3', name: 'Quick vacuum', card: 'Daily Tidying', owner: 'Savannah', dueDate: '2026-02-21', status: 'To Do' },
    { id: 't4', name: 'Wash clothes', card: 'Laundry', owner: 'Savannah', dueDate: '2026-02-20', status: 'Done' },
    { id: 't5', name: 'Dry clothes', card: 'Laundry', owner: 'Savannah', dueDate: '2026-02-20', status: 'In Progress' },
    { id: 't6', name: 'Fold and put away', card: 'Laundry', owner: 'Savannah', dueDate: '2026-02-21', status: 'To Do' },
    { id: 't7', name: 'Plan weekly menu', card: 'Meal Planning', owner: 'Savannah', dueDate: '2026-02-22', status: 'To Do' },
    { id: 't8', name: 'Make grocery list', card: 'Meal Planning', owner: 'Savannah', dueDate: '2026-02-22', status: 'To Do' },
    { id: 't9', name: 'Check pantry', card: 'Meal Planning', owner: 'Savannah', dueDate: '2026-02-22', status: 'Done' },
    { id: 't10', name: 'Review list', card: 'Grocery Shopping', owner: 'Savannah', dueDate: '2026-02-23', status: 'To Do' },
    { id: 't11', name: 'Shop for groceries', card: 'Grocery Shopping', owner: 'Savannah', dueDate: '2026-02-23', status: 'To Do' },
    { id: 't12', name: 'Put away groceries', card: 'Grocery Shopping', owner: 'Savannah', dueDate: '2026-02-23', status: 'To Do' },
    { id: 't13', name: 'Wake kids', card: 'Morning Routine', owner: 'Savannah', dueDate: '2026-02-20', status: 'Done' },
    { id: 't14', name: 'Make breakfast', card: 'Morning Routine', owner: 'Savannah', dueDate: '2026-02-20', status: 'Done' },
    { id: 't15', name: 'Pack lunches', card: 'Morning Routine', owner: 'Savannah', dueDate: '2026-02-20', status: 'In Progress' },
    { id: 't16', name: 'Check emails', card: 'School Communication', owner: 'Savannah', dueDate: '2026-02-20', status: 'Done' },
    { id: 't17', name: 'Sign forms', card: 'School Communication', owner: 'Savannah', dueDate: '2026-02-24', status: 'To Do' },
    { id: 't18', name: 'Update calendar', card: 'School Communication', owner: 'Savannah', dueDate: '2026-02-24', status: 'To Do' },
    { id: 't19', name: 'Load dishwasher', card: 'Dishes & Kitchen Cleanup', owner: 'Kevin', dueDate: '2026-02-20', status: 'To Do' },
    { id: 't20', name: 'Wipe counters', card: 'Dishes & Kitchen Cleanup', owner: 'Kevin', dueDate: '2026-02-20', status: 'To Do' },
    { id: 't21', name: 'Take out trash', card: 'Dishes & Kitchen Cleanup', owner: 'Kevin', dueDate: '2026-02-20', status: 'Done' },
    { id: 't22', name: 'Vacuum all rooms', card: 'Deep Cleaning', owner: 'Kevin', dueDate: '2026-02-23', status: 'To Do' },
    { id: 't23', name: 'Mop floors', card: 'Deep Cleaning', owner: 'Kevin', dueDate: '2026-02-23', status: 'To Do' },
    { id: 't24', name: 'Clean bathrooms', card: 'Deep Cleaning', owner: 'Kevin', dueDate: '2026-02-24', status: 'To Do' },
    { id: 't25', name: 'Take out trash', card: 'Trash & Recycling', owner: 'Kevin', dueDate: '2026-02-21', status: 'In Progress' },
    { id: 't26', name: 'Sort recycling', card: 'Trash & Recycling', owner: 'Kevin', dueDate: '2026-02-21', status: 'To Do' },
    { id: 't27', name: 'Clean bins', card: 'Trash & Recycling', owner: 'Kevin', dueDate: '2026-02-22', status: 'To Do' },
    { id: 't28', name: 'Mow lawn', card: 'Yard Work', owner: 'Kevin', dueDate: '2026-02-25', status: 'To Do' },
    { id: 't29', name: 'Trim hedges', card: 'Yard Work', owner: 'Kevin', dueDate: '2026-02-25', status: 'To Do' },
    { id: 't30', name: 'Water plants', card: 'Yard Work', owner: 'Kevin', dueDate: '2026-02-20', status: 'Done' },
    { id: 't31', name: 'Wash car', card: 'Car Care', owner: 'Kevin', dueDate: '2026-03-01', status: 'To Do' },
    { id: 't32', name: 'Check oil', card: 'Car Care', owner: 'Kevin', dueDate: '2026-03-01', status: 'To Do' },
    { id: 't33', name: 'Vacuum interior', card: 'Car Care', owner: 'Kevin', dueDate: '2026-03-01', status: 'To Do' },
    { id: 't34', name: 'Cook dinner', card: 'Dinner', owner: 'Kevin', dueDate: '2026-02-20', status: 'To Do' },
    { id: 't35', name: 'Set table', card: 'Dinner', owner: 'Kevin', dueDate: '2026-02-20', status: 'To Do' },
    { id: 't36', name: 'Clean up', card: 'Dinner', owner: 'Kevin', dueDate: '2026-02-20', status: 'To Do' },
    { id: 't37', name: 'Bath time', card: 'Bedtime Routine', owner: 'Kevin', dueDate: '2026-02-20', status: 'To Do' },
    { id: 't38', name: 'Read stories', card: 'Bedtime Routine', owner: 'Kevin', dueDate: '2026-02-20', status: 'In Progress' },
    { id: 't39', name: 'Tuck in kids', card: 'Bedtime Routine', owner: 'Kevin', dueDate: '2026-02-20', status: 'To Do' },
    { id: 't40', name: 'Drive to activities', card: 'Kid Activities', owner: 'Kevin', dueDate: '2026-02-22', status: 'To Do' },
    { id: 't41', name: 'Watch practice', card: 'Kid Activities', owner: 'Kevin', dueDate: '2026-02-22', status: 'To Do' },
    { id: 't42', name: 'Pick up kids', card: 'Kid Activities', owner: 'Kevin', dueDate: '2026-02-22', status: 'To Do' },
];

const INITIAL_HANDOFFS: Handoff[] = [
    {
        id: 'h1',
        taskId: 't17',
        from: 'Savannah',
        to: 'Kevin',
        message: 'Got this email from Ms. Smith — permission slip needs to be signed by Friday.',
        createdAt: '2026-02-20T10:30:00',
        status: 'Pending',
    },
    {
        id: 'h2',
        taskId: 't22',
        from: 'Kevin',
        to: 'Savannah',
        message: 'I have a meeting Saturday, can you handle the vacuuming?',
        createdAt: '2026-02-20T09:15:00',
        status: 'Pending',
    },
    {
        id: 'h3',
        taskId: 't6',
        from: 'Kevin',
        to: 'Savannah',
        message: 'Can you fold these? I ran out of time.',
        createdAt: '2026-02-19T18:00:00',
        status: 'Declined',
        declineNote: 'I already did the washing and drying — your turn to fold!',
    },
];

// ─── Component ───────────────────────────────────────────────

export const TasksScreen: React.FC = () => {
    const [selectedPerson, setSelectedPerson] = React.useState<Person>('Savannah');
    const [viewMode, setViewMode] = React.useState<ViewMode>('list');
    const [showHandoffs, setShowHandoffs] = React.useState(false);
    const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
    const [handoffs, setHandoffs] = React.useState<Handoff[]>(INITIAL_HANDOFFS);
    const [declineTaskId, setDeclineTaskId] = React.useState<string | null>(null);
    const [declineNote, setDeclineNote] = React.useState('');

    const partner = (p: Person): Person => p === 'Savannah' ? 'Kevin' : 'Savannah';

    const getTask = (taskId: string) => tasks.find(t => t.id === taskId);

    // Handoffs relevant to the selected person
    const receivedHandoffs = handoffs.filter(h => h.to === selectedPerson && h.status === 'Pending');
    const sentHandoffs = handoffs.filter(h => h.from === selectedPerson && h.status === 'Pending');
    const declinedHandoffs = handoffs.filter(h => h.from === selectedPerson && h.status === 'Declined');
    const activeHandoffCount = receivedHandoffs.length + sentHandoffs.length + declinedHandoffs.length;

    // Tasks for current person
    const userTasks = tasks
        .filter(task => task.owner === selectedPerson)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const tasksByStatus = (status: TaskStatus) =>
        userTasks.filter(task => task.status === status);

    // ─── Handoff Actions ─────────────────────────────────────

    const handleAccept = (handoff: Handoff) => {
        // Update task owner
        setTasks(prev => prev.map(t =>
            t.id === handoff.taskId ? { ...t, owner: handoff.to } : t
        ));
        // Mark handoff as accepted
        setHandoffs(prev => prev.map(h =>
            h.id === handoff.id ? { ...h, status: 'Accepted' as HandoffStatus } : h
        ));
        const task = getTask(handoff.taskId);
        Alert.alert('Accepted', `"${task?.name}" is now yours.`);
    };

    const handleDeclineStart = (taskId: string) => {
        setDeclineTaskId(taskId);
        setDeclineNote('');
    };

    const handleDeclineConfirm = (handoff: Handoff) => {
        setHandoffs(prev => prev.map(h =>
            h.id === handoff.id ? { ...h, status: 'Declined' as HandoffStatus, declineNote: declineNote || 'No reason given' } : h
        ));
        setDeclineTaskId(null);
        setDeclineNote('');
        const task = getTask(handoff.taskId);
        Alert.alert('Declined', `"${task?.name}" was sent back to ${handoff.from}.`);
    };

    const handleCancel = (handoff: Handoff) => {
        setHandoffs(prev => prev.map(h =>
            h.id === handoff.id ? { ...h, status: 'Canceled' as HandoffStatus } : h
        ));
        const task = getTask(handoff.taskId);
        Alert.alert('Canceled', `Handoff for "${task?.name}" has been canceled.`);
    };

    const handleDismissDeclined = (handoff: Handoff) => {
        // Just hide it — we keep it in the data as Declined but user has seen it
        // For now, we'll remove from the active view by adding a "dismissed" flag
        // Simple approach: mark as Canceled so it leaves all active views
        setHandoffs(prev => prev.map(h =>
            h.id === handoff.id ? { ...h, status: 'Canceled' as HandoffStatus } : h
        ));
    };

    // Check if a task has a pending handoff (to show badge in list)
    const getPendingHandoff = (taskId: string) =>
        handoffs.find(h => h.taskId === taskId && h.status === 'Pending');

    // ─── Render ──────────────────────────────────────────────

    return (
        <View className="flex-1 bg-surface-dim">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="px-5 pt-[60px] pb-5">
                    <Text className="text-[32px] font-bold text-text tracking-tight">
                        My Tasks
                    </Text>
                    <Text className="text-base text-text-secondary mt-1">
                        {userTasks.length} tasks
                    </Text>
                </View>

                {/* Person Selector */}
                <View className="flex-row gap-3 px-5 mb-4">
                    <TouchableOpacity
                        className={`flex-1 py-3.5 rounded-xl items-center border-2 ${selectedPerson === 'Savannah'
                            ? 'bg-primary-600 border-primary-600'
                            : 'bg-surface border-border'
                            }`}
                        onPress={() => setSelectedPerson('Savannah')}
                    >
                        <Text className={`text-base font-semibold ${selectedPerson === 'Savannah' ? 'text-white' : 'text-text-secondary'}`}>
                            Savannah
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3.5 rounded-xl items-center border-2 ${selectedPerson === 'Kevin'
                            ? 'bg-secondary-600 border-secondary-600'
                            : 'bg-surface border-border'
                            }`}
                        onPress={() => setSelectedPerson('Kevin')}
                    >
                        <Text className={`text-base font-semibold ${selectedPerson === 'Kevin' ? 'text-white' : 'text-text-secondary'}`}>
                            Kevin
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* View Toggle + Handoff Button Row */}
                <View className="flex-row gap-3 px-5 mb-5">
                    {/* View Mode Toggle */}
                    <View className="flex-1 flex-row bg-surface rounded-xl p-1">
                        <TouchableOpacity
                            className={`flex-1 py-2.5 rounded-lg items-center ${viewMode === 'list' ? 'bg-primary-600' : ''}`}
                            onPress={() => setViewMode('list')}
                        >
                            <Text className={`text-sm font-semibold ${viewMode === 'list' ? 'text-white' : 'text-text-secondary'}`}>
                                ☰ List
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-2.5 rounded-lg items-center ${viewMode === 'board' ? 'bg-primary-600' : ''}`}
                            onPress={() => setViewMode('board')}
                        >
                            <Text className={`text-sm font-semibold ${viewMode === 'board' ? 'text-white' : 'text-text-secondary'}`}>
                                ▦ Board
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Handoff Button */}
                    <TouchableOpacity
                        className="bg-surface rounded-xl px-4 py-2.5 items-center justify-center flex-row"
                        onPress={() => setShowHandoffs(true)}
                    >
                        <Text className="text-sm font-semibold text-text-secondary">
                            🤝
                        </Text>
                        {activeHandoffCount > 0 && (
                            <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-1.5">
                                <Text className="text-[11px] font-bold text-white">
                                    {activeHandoffCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ===== LIST VIEW ===== */}
                {viewMode === 'list' && (
                    <View className="px-5">
                        {userTasks.map((task) => {
                            const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
                            const statusStyle = STATUS_STYLES[task.status];
                            const isDone = task.status === 'Done';
                            const pendingHandoff = getPendingHandoff(task.id);
                            return (
                                <View
                                    key={task.id}
                                    className={`bg-surface mb-3 rounded-xl px-4 py-3.5 shadow-sm ${overdue ? 'border border-red-200' : ''}`}
                                >
                                    <View className="flex-row items-center">
                                        <View className={`w-5 h-5 rounded border-2 mr-3 ${isDone ? 'bg-green-500 border-green-500' : overdue ? 'border-red-400' : 'border-border-strong'}`} />
                                        <View className="flex-1">
                                            <Text className={`text-[15px] font-medium ${isDone ? 'text-text-muted line-through' : overdue ? 'text-red-600' : 'text-text'}`}>
                                                {task.name}
                                            </Text>
                                            <View className="flex-row items-center mt-0.5 gap-2">
                                                <Text className="text-xs text-text-muted">
                                                    {task.card}
                                                </Text>
                                                <View className={`px-1.5 py-0.5 rounded ${statusStyle.bg}`}>
                                                    <Text className={`text-[10px] font-semibold ${statusStyle.text}`}>
                                                        {task.status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View className="items-end">
                                            <Text className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
                                                {overdue ? 'Overdue' : formatDate(task.dueDate)}
                                            </Text>
                                            {pendingHandoff && (
                                                <View className="bg-amber-100 px-1.5 py-0.5 rounded mt-1">
                                                    <Text className="text-[10px] font-semibold text-amber-600">
                                                        {pendingHandoff.from === selectedPerson ? `→ ${pendingHandoff.to}` : `← ${pendingHandoff.from}`}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* ===== BOARD VIEW ===== */}
                {viewMode === 'board' && (
                    <View className="px-5">
                        {STATUSES.map(status => {
                            const statusTasks = tasksByStatus(status);
                            const style = STATUS_STYLES[status];
                            return (
                                <View key={status} className="mb-6">
                                    <View className={`flex-row items-center justify-between px-4 py-3 rounded-t-xl ${style.headerBg}`}>
                                        <View className="flex-row items-center gap-2">
                                            <View className={`w-2.5 h-2.5 rounded-full ${style.accent}`} />
                                            <Text className={`text-sm font-bold ${style.headerText}`}>
                                                {status}
                                            </Text>
                                        </View>
                                        <View className={`px-2 py-0.5 rounded-full ${style.accent}`}>
                                            <Text className="text-[11px] font-bold text-white">
                                                {statusTasks.length}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="bg-surface-dim rounded-b-xl border border-t-0 border-border pt-2 pb-1 px-2">
                                        {statusTasks.length === 0 ? (
                                            <View className="py-6 items-center">
                                                <Text className="text-sm text-text-muted">No tasks</Text>
                                            </View>
                                        ) : (
                                            statusTasks.map((task) => {
                                                const overdue = isOverdue(task.dueDate) && status !== 'Done';
                                                return (
                                                    <View
                                                        key={task.id}
                                                        className={`bg-surface rounded-lg px-3.5 py-3 mb-2 shadow-sm ${overdue ? 'border border-red-200' : ''}`}
                                                    >
                                                        <Text className={`text-[14px] font-medium ${status === 'Done' ? 'text-text-muted line-through' : overdue ? 'text-red-600' : 'text-text'}`}>
                                                            {task.name}
                                                        </Text>
                                                        <View className="flex-row items-center justify-between mt-1.5">
                                                            <Text className="text-xs text-text-muted">{task.card}</Text>
                                                            <Text className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
                                                                {overdue ? 'Overdue' : formatDate(task.dueDate)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Empty State */}
                {userTasks.length === 0 && (
                    <View className="p-10 items-center">
                        <Text className="text-base text-text-muted text-center">
                            No tasks assigned to {selectedPerson}
                        </Text>
                    </View>
                )}

                <View className="h-6" />
            </ScrollView>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* HANDOFF MODAL                                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal
                visible={showHandoffs}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View className="flex-1 bg-surface-dim">
                    {/* Modal Header */}
                    <View className="flex-row items-center justify-between px-5 pt-[60px] pb-4">
                        <Text className="text-2xl font-bold text-text">
                            🤝 Handoffs
                        </Text>
                        <TouchableOpacity onPress={() => setShowHandoffs(false)}>
                            <Text className="text-base font-semibold text-primary-600">
                                Done
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-5">
                        {activeHandoffCount === 0 ? (
                            <View className="bg-surface rounded-xl px-4 py-8 items-center">
                                <Text className="text-base text-text-muted">No handoffs</Text>
                            </View>
                        ) : (
                            [...receivedHandoffs, ...sentHandoffs, ...declinedHandoffs]
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map(handoff => {
                                    const task = getTask(handoff.taskId);
                                    const isReceived = handoff.to === selectedPerson && handoff.status === 'Pending';
                                    const isSent = handoff.from === selectedPerson && handoff.status === 'Pending';
                                    const isDeclined = handoff.status === 'Declined';
                                    const isDeclineMode = declineTaskId === handoff.taskId;

                                    const borderColor = isDeclined ? 'border-red-200' : isReceived ? 'border-amber-200' : 'border-blue-200';

                                    return (
                                        <View key={handoff.id} className={`bg-surface rounded-xl px-4 py-4 mb-3 shadow-sm border ${borderColor}`}>
                                            {/* Header: type badge + date */}
                                            <View className="flex-row items-center mb-2 flex-wrap gap-1.5">
                                                {isReceived && (
                                                    <View className="bg-amber-100 px-2 py-0.5 rounded">
                                                        <Text className="text-[11px] font-bold text-amber-700">
                                                            FROM {handoff.from.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                )}
                                                {isSent && (
                                                    <>
                                                        <View className="bg-blue-100 px-2 py-0.5 rounded">
                                                            <Text className="text-[11px] font-bold text-blue-700">
                                                                TO {handoff.to.toUpperCase()}
                                                            </Text>
                                                        </View>
                                                        <View className="bg-amber-100 px-2 py-0.5 rounded">
                                                            <Text className="text-[11px] font-semibold text-amber-600">⏳ Pending</Text>
                                                        </View>
                                                    </>
                                                )}
                                                {isDeclined && (
                                                    <View className="bg-red-100 px-2 py-0.5 rounded">
                                                        <Text className="text-[11px] font-bold text-red-700">
                                                            {handoff.to.toUpperCase()} DECLINED
                                                        </Text>
                                                    </View>
                                                )}
                                                <Text className="text-xs text-text-muted ml-auto">
                                                    {formatDate(handoff.createdAt)}
                                                </Text>
                                            </View>

                                            {/* Task name + message */}
                                            <Text className="text-base font-semibold text-text mb-1">
                                                {task?.name ?? 'Unknown task'}
                                            </Text>
                                            <Text className="text-sm text-text-secondary mb-3">
                                                "{handoff.message}"
                                            </Text>

                                            {/* Decline note (for declined handoffs) */}
                                            {isDeclined && handoff.declineNote && (
                                                <View className="bg-red-50 rounded-lg px-3 py-2 mb-3">
                                                    <Text className="text-sm text-red-700">
                                                        "{handoff.declineNote}"
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Actions */}
                                            {isReceived && isDeclineMode && (
                                                <View>
                                                    <TextInput
                                                        className="bg-surface-dim rounded-lg px-3 py-2.5 text-sm text-text mb-3 border border-border"
                                                        placeholder="Add a note (why you're declining)..."
                                                        value={declineNote}
                                                        onChangeText={setDeclineNote}
                                                        multiline
                                                    />
                                                    <View className="flex-row gap-3">
                                                        <TouchableOpacity
                                                            className="flex-1 bg-surface border border-border py-2.5 rounded-lg items-center"
                                                            onPress={() => setDeclineTaskId(null)}
                                                        >
                                                            <Text className="text-sm font-semibold text-text-secondary">Back</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            className="flex-1 bg-red-500 py-2.5 rounded-lg items-center"
                                                            onPress={() => handleDeclineConfirm(handoff)}
                                                        >
                                                            <Text className="text-sm font-semibold text-white">Confirm Decline</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}
                                            {isReceived && !isDeclineMode && (
                                                <View className="flex-row gap-3">
                                                    <TouchableOpacity
                                                        className="flex-1 bg-surface border border-red-300 py-2.5 rounded-lg items-center"
                                                        onPress={() => handleDeclineStart(handoff.taskId)}
                                                    >
                                                        <Text className="text-sm font-semibold text-red-500">Decline</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        className="flex-1 bg-green-500 py-2.5 rounded-lg items-center"
                                                        onPress={() => handleAccept(handoff)}
                                                    >
                                                        <Text className="text-sm font-semibold text-white">Accept</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            {isSent && (
                                                <TouchableOpacity
                                                    className="bg-surface border border-border py-2.5 rounded-lg items-center"
                                                    onPress={() => handleCancel(handoff)}
                                                >
                                                    <Text className="text-sm font-semibold text-text-secondary">Cancel Handoff</Text>
                                                </TouchableOpacity>
                                            )}
                                            {isDeclined && (
                                                <TouchableOpacity
                                                    className="bg-surface border border-border py-2.5 rounded-lg items-center"
                                                    onPress={() => handleDismissDeclined(handoff)}
                                                >
                                                    <Text className="text-sm font-semibold text-text-secondary">Dismiss</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })
                        )}

                        <View className="h-10" />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};
