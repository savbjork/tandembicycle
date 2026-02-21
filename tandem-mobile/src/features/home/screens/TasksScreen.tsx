import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@shared/components/ui/Text';
import { TextInput } from '@shared/components/ui/TextInput';
import { AddButton, DoneButton, DeleteButton } from '@shared/components/ui';
import { SwipeableTaskRow } from '@shared/components/SwipeableTaskRow';
import { fakeData, type Person, type Task, type Handoff, type TaskStatus, type HandoffStatus } from '@shared/data/FakeDataStore';

// ─── View Constants ──────────────────────────────────────────

type ViewMode = 'list' | 'board';
type TimeFilter = 'week' | 'month' | 'year' | 'all';

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; headerBg: string; headerText: string; accent: string }> = {
    'To Do': { bg: 'bg-gray-100', text: 'text-gray-600', headerBg: 'bg-gray-200', headerText: 'text-gray-700', accent: 'bg-gray-400' },
    'In Progress': { bg: 'bg-blue-100', text: 'text-blue-600', headerBg: 'bg-blue-100', headerText: 'text-blue-700', accent: 'bg-blue-500' },
    'Done': { bg: 'bg-green-100', text: 'text-green-600', headerBg: 'bg-green-100', headerText: 'text-green-700', accent: 'bg-green-500' },
};

const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

const formatDate = (dateStr: string): string => {
    // Append time to ensure it's treated as a local date, not UTC
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to get YYYY-MM-DD from a local Date object without UTC shifts
const toDateStringLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ─── Component ───────────────────────────────────────────────

export const TasksScreen: React.FC = () => {
    const selectedPerson: Person = 'Savannah';
    const [viewMode, setViewMode] = React.useState<ViewMode>('list');
    const [showHandoffs, setShowHandoffs] = React.useState(false);
    const [showCreateTask, setShowCreateTask] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [expandedSection, setExpandedSection] = React.useState<TaskStatus | null>(null);
    const [tasks, setTasks] = React.useState<Task[]>(fakeData.tasks);
    const [handoffs, setHandoffs] = React.useState<Handoff[]>(fakeData.handoffs);
    const [declineTaskId, setDeclineTaskId] = React.useState<string | null>(null);
    const [declineNote, setDeclineNote] = React.useState('');
    const [timeFilter, setTimeFilter] = React.useState<TimeFilter>('all');

    const [newTaskName, setNewTaskName] = React.useState('');
    const [newTaskCard, setNewTaskCard] = React.useState(
        fakeData.cards.filter(c => c.owner === selectedPerson)[0]?.name || ''
    );
    const [newTaskDueDate, setNewTaskDueDate] = React.useState<Date>(new Date());
    const [showNewTaskDatePicker, setShowNewTaskDatePicker] = React.useState(false);
    const [newTaskStatus, setNewTaskStatus] = React.useState<TaskStatus>('To Do');
    const [newTaskNote, setNewTaskNote] = React.useState('');
    const [sendToPartner, setSendToPartner] = React.useState(false);
    const [handoffMessage, setHandoffMessage] = React.useState('');

    const partner = (p: Person): Person => p === 'Savannah' ? 'Kevin' : 'Savannah';

    // Cards assigned to the selected person
    const personCards = fakeData.cards.filter(c => c.owner === selectedPerson);

    const getTask = (taskId: string) => tasks.find(t => t.id === taskId);

    // Handoffs relevant to the selected person
    const receivedHandoffs = handoffs.filter(h => h.to === selectedPerson && h.status === 'Pending');
    const sentHandoffs = handoffs.filter(h => h.from === selectedPerson && h.status === 'Pending');
    const declinedHandoffs = handoffs.filter(h => h.from === selectedPerson && h.status === 'Declined');
    const activeHandoffCount = receivedHandoffs.length + sentHandoffs.length + declinedHandoffs.length;

    // Tasks for current person
    const allUserTasks = tasks
        .filter(task => task.owner === selectedPerson)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Date filter logic
    const getFilterEndDate = (): Date | null => {
        const now = new Date();
        switch (timeFilter) {
            case 'week': {
                const end = new Date(now);
                end.setDate(now.getDate() + (7 - now.getDay()));
                end.setHours(23, 59, 59, 999);
                return end;
            }
            case 'month': {
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                return end;
            }
            case 'year': {
                const end = new Date(now.getFullYear(), 11, 31);
                end.setHours(23, 59, 59, 999);
                return end;
            }
            default:
                return null;
        }
    };

    const userTasks = React.useMemo(() => {
        const endDate = getFilterEndDate();
        if (!endDate) return allUserTasks;
        return allUserTasks.filter(task => new Date(task.dueDate) <= endDate);
    }, [allUserTasks, timeFilter]);

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

    // ─── Status Change (from swipe) ──────────────────────

    const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
        ));
    };

    // ─── Create Task ─────────────────────────────────────────

    const resetCreateForm = () => {
        setNewTaskName('');
        setNewTaskCard('');
        setNewTaskDueDate(new Date());
        setNewTaskStatus('To Do');
        setNewTaskNote('');
        setSendToPartner(false);
        setHandoffMessage('');
    };

    const handleCreateTask = (isQuiet = false) => {
        if (!newTaskName.trim()) {
            if (!isQuiet) Alert.alert('Missing name', 'Please enter a task name.');
            else {
                resetCreateForm();
                setShowCreateTask(false);
            }
            return;
        }

        const taskId = `t${Date.now()}`;

        const newTask: Task = {
            id: taskId,
            name: newTaskName.trim(),
            card: newTaskCard.trim() || 'Uncategorized',
            owner: selectedPerson,
            dueDate: toDateStringLocal(newTaskDueDate),
            status: newTaskStatus,
            note: newTaskNote.trim() || undefined,
        };

        setTasks(prev => [...prev, newTask]);

        // If sending to partner, create a handoff too
        if (sendToPartner) {
            const newHandoff: Handoff = {
                id: `h${Date.now()}`,
                taskId,
                from: selectedPerson,
                to: partner(selectedPerson),
                message: handoffMessage.trim() || `${selectedPerson} created this task for you.`,
                createdAt: new Date().toISOString(),
                status: 'Pending',
            };
            setHandoffs(prev => [...prev, newHandoff]);
        }

        resetCreateForm();
        setShowCreateTask(false);
        Alert.alert(
            'Task Created',
            sendToPartner
                ? `"${newTaskName.trim()}" created and sent to ${partner(selectedPerson)}.`
                : `"${newTaskName.trim()}" added to your tasks.`
        );
    };

    // ─── Render ──────────────────────────────────────────────

    return (
        <View className="flex-1 bg-surface-dim">
            {/* Header */}
            <View className="px-5 pt-[60px] pb-5 flex-row justify-between items-center">
                <Text className="text-[32px] font-bold text-text tracking-tight">
                    My Tasks
                </Text>
                {/* Create Task Button */}
                <AddButton onPress={() => setShowCreateTask(true)} />
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
                            List
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-2.5 rounded-lg items-center ${viewMode === 'board' ? 'bg-primary-600' : ''}`}
                        onPress={() => setViewMode('board')}
                    >
                        <Text className={`text-sm font-semibold ${viewMode === 'board' ? 'text-white' : 'text-text-secondary'}`}>
                            Board
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Handoff Button */}
                <TouchableOpacity
                    className="bg-surface rounded-xl px-4 py-2.5 items-center justify-center flex-row"
                    onPress={() => setShowHandoffs(true)}
                >
                    <Text className="text-sm font-semibold text-text-secondary">
                        Handoffs
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

            {/* Time Filter Pills */}
            <View className="flex-row gap-2 px-5 mb-4">
                {(['week', 'month', 'year', 'all'] as TimeFilter[]).map((filter) => {
                    const labels: Record<TimeFilter, string> = {
                        week: 'This Week',
                        month: 'This Month',
                        year: 'This Year',
                        all: 'All',
                    };
                    const isActive = timeFilter === filter;
                    return (
                        <TouchableOpacity
                            key={filter}
                            className={`px-3.5 py-1.5 rounded-full ${isActive ? 'bg-primary-600' : 'bg-surface'}`}
                            onPress={() => setTimeFilter(filter)}
                        >
                            <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                                {labels[filter]}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ===== LIST VIEW ===== */}
            {viewMode === 'list' && (
                <ScrollView className="flex-1">
                    {userTasks.length === 0 ? (
                        <View className="p-10 items-center">
                            <Text className="text-base text-text-muted text-center">
                                No tasks assigned to {selectedPerson}
                            </Text>
                        </View>
                    ) : (
                        <View className="px-5">
                            {userTasks.map((task) => {
                                const pendingHandoff = getPendingHandoff(task.id);
                                const handoffLabel = pendingHandoff
                                    ? (pendingHandoff.from === selectedPerson ? `→ ${pendingHandoff.to}` : `← ${pendingHandoff.from}`)
                                    : null;
                                return (
                                    <SwipeableTaskRow
                                        key={task.id}
                                        task={task}
                                        onPress={() => setSelectedTask(task)}
                                        onStatusChange={handleStatusChange}
                                        pendingHandoffLabel={handoffLabel}
                                    />
                                );
                            })}
                        </View>
                    )}
                    <View className="h-6" />
                </ScrollView>
            )}

            {/* ===== BOARD VIEW ===== */}
            {viewMode === 'board' && (
                <View className="flex-1 px-5 pb-4">
                    {STATUSES.map(status => {
                        const statusTasks = tasksByStatus(status);
                        const style = STATUS_STYLES[status];
                        const isExpanded = expandedSection === status;
                        const hasExpanded = expandedSection !== null;
                        const sectionFlex = isExpanded ? 4 : hasExpanded ? 1 : 1;
                        return (
                            <View key={status} style={{ flex: sectionFlex, marginBottom: 8 }}>
                                <TouchableOpacity
                                    className={`flex-row items-center justify-between px-4 py-2.5 rounded-t-xl ${style.headerBg}`}
                                    onPress={() => setExpandedSection(prev => prev === status ? null : status)}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center gap-2">
                                        <Text className={`text-sm ${style.headerText}`}>
                                            {isExpanded ? 'v' : '›'}
                                        </Text>
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
                                </TouchableOpacity>
                                <ScrollView
                                    className="flex-1 bg-surface-dim rounded-b-xl border border-t-0 border-border"
                                    contentContainerStyle={{ paddingTop: 8, paddingBottom: 4, paddingHorizontal: 8 }}
                                    nestedScrollEnabled
                                >
                                    {statusTasks.length === 0 ? (
                                        <View className="py-4 items-center">
                                            <Text className="text-sm text-text-muted">No tasks</Text>
                                        </View>
                                    ) : (
                                        statusTasks.map((task) => {
                                            return (
                                                <SwipeableTaskRow
                                                    key={task.id}
                                                    task={task}
                                                    onPress={() => setSelectedTask(task)}
                                                    onStatusChange={handleStatusChange}
                                                    variant="board"
                                                />
                                            );
                                        })
                                    )}
                                </ScrollView>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* HANDOFF MODAL                                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Modal
                visible={showHandoffs}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowHandoffs(false)}
            >
                <View className="flex-1 bg-surface-dim">
                    {/* Visual Cushion / Grabber */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1.5 bg-border-strong rounded-full opacity-20" />
                    </View>

                    {/* Modal Header */}
                    <View className="px-5 pt-2 pb-4">
                        <Text className="text-2xl font-bold text-text">
                            Handoffs
                        </Text>
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
                                                            <Text className="text-[11px] font-semibold text-amber-600">Pending</Text>
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

            {/* ═════════════════════════════════════════════════════════ */}
            {/* CREATE TASK MODAL                                      */}
            {/* ═════════════════════════════════════════════════════════ */}
            <Modal
                visible={showCreateTask}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => handleCreateTask(true)}
            >
                <View className="flex-1 bg-surface-dim">
                    {/* Visual Cushion / Grabber */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1.5 bg-border-strong rounded-full opacity-20" />
                    </View>

                    <ScrollView className="flex-1 px-5">
                        {/* Task Name */}
                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 mt-2">
                            Task Name *
                        </Text>
                        <TextInput
                            className="bg-surface rounded-xl px-4 py-3.5 text-base text-text mb-4 border border-border"
                            placeholder="What needs to be done?"
                            value={newTaskName}
                            onChangeText={setNewTaskName}
                        />

                        {/* Card / Group */}
                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Card
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4"
                            contentContainerStyle={{ gap: 8 }}
                        >
                            {personCards.map((card) => (
                                <TouchableOpacity
                                    key={card.name}
                                    className={`px-4 py-2.5 rounded-xl border ${newTaskCard === card.name
                                        ? 'bg-primary-600 border-primary-600'
                                        : 'bg-surface border-border'
                                        }`}
                                    onPress={() => setNewTaskCard(card.name)}
                                >
                                    <Text className={`text-sm font-semibold ${newTaskCard === card.name ? 'text-white' : 'text-text-secondary'
                                        }`}>
                                        {card.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Due Date */}
                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Due Date
                        </Text>
                        <TouchableOpacity
                            className="bg-surface rounded-xl px-4 py-3.5 mb-4 border border-border flex-row items-center justify-between"
                            onPress={() => setShowNewTaskDatePicker(true)}
                        >
                            <Text className="text-base text-text">
                                {newTaskDueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                            <Text className="text-sm text-text-muted">Change</Text>
                        </TouchableOpacity>

                        {/* Calendar Date Picker Modal */}
                        <Modal visible={showNewTaskDatePicker} transparent animationType="fade">
                            <TouchableOpacity
                                className="flex-1 bg-black/40 justify-end"
                                activeOpacity={1}
                                onPress={() => setShowNewTaskDatePicker(false)}
                            >
                                <View className="bg-surface rounded-t-2xl px-4 pb-8 pt-4">
                                    <View className="flex-row justify-between items-center mb-2 px-1">
                                        <Text className="text-lg font-bold text-text">Select Date</Text>
                                        <TouchableOpacity onPress={() => setShowNewTaskDatePicker(false)}>
                                            <Text className="text-base font-semibold text-primary-600">Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={newTaskDueDate}
                                        mode="date"
                                        display="inline"
                                        onChange={(_event: any, date?: Date) => {
                                            if (date) setNewTaskDueDate(date);
                                        }}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>

                        {/* Status Picker */}
                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                            Status
                        </Text>
                        <View className="flex-row gap-2 mb-5">
                            {STATUSES.map(status => {
                                const style = STATUS_STYLES[status];
                                const isSelected = newTaskStatus === status;
                                return (
                                    <TouchableOpacity
                                        key={status}
                                        className={`flex-1 py-3 rounded-xl items-center border-2 ${isSelected
                                            ? `${style.headerBg} border-current`
                                            : 'bg-surface border-border'
                                            }`}
                                        onPress={() => setNewTaskStatus(status)}
                                    >
                                        <Text className={`text-sm font-semibold ${isSelected ? style.headerText : 'text-text-secondary'
                                            }`}>
                                            {status}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Note */}
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

                        {/* Send to Partner Toggle */}
                        <View className="bg-surface rounded-xl px-4 py-4 mb-4 border border-border">
                            <TouchableOpacity
                                className="flex-row items-center justify-between"
                                onPress={() => setSendToPartner(!sendToPartner)}
                            >
                                <View>
                                    <Text className="text-base font-semibold text-text">
                                        Send to {partner(selectedPerson)}
                                    </Text>
                                    <Text className="text-sm text-text-muted mt-0.5">
                                        Create and hand off to your partner
                                    </Text>
                                </View>
                                <View className={`w-6 h-6 rounded border-2 items-center justify-center ${sendToPartner ? 'bg-primary-600 border-primary-600' : 'border-border-strong'
                                    }`}>
                                    {sendToPartner && (
                                        <View className="w-3 h-3 rounded-sm bg-white" />
                                    )}
                                </View>
                            </TouchableOpacity>

                            {sendToPartner && (
                                <View className="mt-3 pt-3 border-t border-border">
                                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                                        Handoff Message
                                    </Text>
                                    <TextInput
                                        className="bg-surface-dim rounded-lg px-3 py-2.5 text-sm text-text border border-border"
                                        placeholder="Why are you sending this?"
                                        value={handoffMessage}
                                        onChangeText={setHandoffMessage}
                                        multiline
                                    />
                                </View>
                            )}
                        </View>

                        <View className="h-10" />
                    </ScrollView>
                </View>
            </Modal>



            {/* ═══════════════════════════════════════════════════════ */}
            {/* EDIT TASK MODAL                                       */}
            {/* ═══════════════════════════════════════════════════════ */}
            {selectedTask && (
                <EditTaskModal
                    task={selectedTask}
                    availableCards={personCards.map(c => c.name)}
                    onClose={() => setSelectedTask(null)}
                    onSave={(updatedTask) => {
                        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
                        setSelectedTask(null);
                    }}
                    onDelete={(taskId) => {
                        setTasks(prev => prev.filter(t => t.id !== taskId));
                        setSelectedTask(null);
                    }}
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

    const handleSave = (isQuiet = false) => {
        if (!editName.trim()) {
            if (!isQuiet) Alert.alert('Missing name', 'Please enter a task name.');
            else onClose();
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
        <Modal
            visible={true}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => handleSave(true)}
        >
            <View className="flex-1 bg-surface-dim">
                {/* Visual Cushion / Grabber */}
                <View className="items-center pt-3 pb-2">
                    <View className="w-10 h-1.5 bg-border-strong rounded-full opacity-20" />
                </View>
                <ScrollView className="flex-1 px-5">
                    {/* Task Name */}
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 mt-2">
                        Task Name *
                    </Text>
                    <TextInput
                        className="bg-surface rounded-xl px-4 py-3.5 text-base text-text mb-4 border border-border"
                        placeholder="What needs to be done?"
                        value={editName}
                        onChangeText={setEditName}
                    />

                    {/* Card / Group */}
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Card
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        contentContainerStyle={{ gap: 8 }}
                    >
                        {availableCards.map((cardName) => (
                            <TouchableOpacity
                                key={cardName}
                                className={`px-4 py-2.5 rounded-xl border ${editCard === cardName
                                    ? 'bg-primary-600 border-primary-600'
                                    : 'bg-surface border-border'
                                    }`}
                                onPress={() => setEditCard(cardName)}
                            >
                                <Text className={`text-sm font-semibold ${editCard === cardName ? 'text-white' : 'text-text-secondary'
                                    }`}>
                                    {cardName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Due Date */}
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Due Date
                    </Text>
                    <TouchableOpacity
                        className="bg-surface rounded-xl px-4 py-3.5 mb-4 border border-border flex-row items-center justify-between"
                        onPress={() => setShowEditDatePicker(true)}
                    >
                        <Text className="text-base text-text">
                            {editDueDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                        <Text className="text-sm text-text-muted">Change</Text>
                    </TouchableOpacity>

                    {/* Calendar Date Picker Modal */}
                    <Modal visible={showEditDatePicker} transparent animationType="fade">
                        <TouchableOpacity
                            className="flex-1 bg-black/40 justify-end"
                            activeOpacity={1}
                            onPress={() => setShowEditDatePicker(false)}
                        >
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
                                    onChange={(_event: any, date?: Date) => {
                                        if (date) setEditDueDateObj(date);
                                    }}
                                />
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    {/* Status Picker */}
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Status
                    </Text>
                    <View className="flex-row gap-2 mb-5">
                        {STATUSES.map(status => {
                            const style = STATUS_STYLES[status];
                            const isSelected = editStatus === status;
                            return (
                                <TouchableOpacity
                                    key={status}
                                    className={`flex-1 py-3 rounded-xl items-center border-2 ${isSelected
                                        ? `${style.headerBg} border-current`
                                        : 'bg-surface border-border'
                                        }`}
                                    onPress={() => setEditStatus(status)}
                                >
                                    <Text className={`text-sm font-semibold ${isSelected ? style.headerText : 'text-text-secondary'
                                        }`}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Owner */}
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Owner
                    </Text>
                    <View className="flex-row gap-2 mb-5">
                        <TouchableOpacity
                            className={`flex-1 py-3.5 rounded-xl items-center border-2 ${editOwner === 'Savannah'
                                ? 'bg-primary-600 border-primary-600'
                                : 'bg-surface border-border'
                                }`}
                            onPress={() => setEditOwner('Savannah')}
                        >
                            <Text className={`text-base font-semibold ${editOwner === 'Savannah' ? 'text-white' : 'text-text-secondary'
                                }`}>
                                Savannah
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-3.5 rounded-xl items-center border-2 ${editOwner === 'Kevin'
                                ? 'bg-secondary-600 border-secondary-600'
                                : 'bg-surface border-border'
                                }`}
                            onPress={() => setEditOwner('Kevin')}
                        >
                            <Text className={`text-base font-semibold ${editOwner === 'Kevin' ? 'text-white' : 'text-text-secondary'
                                }`}>
                                Kevin
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Note */}
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Note (optional)
                    </Text>
                    <TextInput
                        className="bg-surface rounded-xl px-4 py-3.5 text-base text-text mb-5 border border-border"
                        placeholder="Add any context or details..."
                        value={editNote}
                        onChangeText={setEditNote}
                        multiline
                        numberOfLines={3}
                    />

                    {/* Delete */}
                    <DeleteButton
                        title="Delete Task"
                        onPress={handleDelete}
                        className="mb-4"
                    />

                    <View className="h-10" />
                </ScrollView>
            </View>
        </Modal>
    );
};
