import React, { useState, useMemo } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text, BottomSheet, ScreenHeader, FieldLabel, Badge, EmptyState } from '@shared/components/ui';
import { AddButton } from '@shared/components/ui/AddButton';
import { EditableTitle } from '@shared/components/ui/EditableTitle';
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
    const { cards, tasks, addTask, toggleTaskDone, updateCard, renameCard, removeCard } = useDataStore();

    const card = useMemo(
        () => cards.find(c => c.name === cardName),
        [cards, cardName],
    );

    const cardTasks = useMemo(
        () => tasks.filter((t: Task) => t.card === cardName),
        [tasks, cardName],
    );

    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [editCardName, setEditCardName] = useState(card?.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editNote, setEditNote] = useState(card?.note || '');

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

    const handleAddTask = () => {
        if (!newTaskName.trim()) return;
        const task: Task = {
            id: `t${Date.now()}`,
            name: newTaskName.trim(),
            card: card.name,
            owner: card.owner,
            dueDate: '',
            isDone: false,
        };
        addTask(task);
        setNewTaskName('');
        setShowAddTask(false);
    };

    const handleToggleDone = (taskId: string, _isDone: boolean) => {
        toggleTaskDone(taskId);
    };

    const handleArchive = () => {
        Alert.alert(
            'Archive Card?',
            `This will remove "${card.name}" from your roster.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Archive',
                    style: 'destructive',
                    onPress: () => {
                        removeCard(card.name);
                        navigation.goBack();
                    },
                },
            ],
        );
    };

    const handleSaveNote = () => {
        updateCard(card.name, { note: editNote });
        setIsEditingNote(false);
    };

    const pendingTasks = cardTasks.filter(t => !t.isDone);
    const completedTasks = cardTasks.filter(t => t.isDone);

    return (
        <View className="flex-1 bg-surface-dim">
            <ScreenHeader
                title=""
                showBack={false}
                onBack={() => navigation.goBack()}
                rightAction={
                    isOwner ? (
                        <View className="flex-row gap-2">
                            <AddButton onPress={() => setShowAddTask(true)} />
                        </View>
                    ) : undefined
                }
            />

            <ScrollView className="flex-1 px-5 pb-5">
                {/* Card Header */}
                <View className="mb-6">
                    <EditableTitle
                        value={editCardName}
                        isEditing={isEditingName}
                        setIsEditing={(v) => { setIsEditingName(v); if (v) setEditCardName(card.name); }}
                        onChangeText={setEditCardName}
                        onSave={handleRename}
                        subtitle={`Owned by ${card.owner}`}
                    />
                </View>

                {/* Not Owner Banner */}
                {!isOwner && (
                    <View className="bg-yellow-50 rounded-xl p-4 mb-4 flex-row items-center gap-3 border border-yellow-100">
                        <Ionicons name="lock-closed" size={18} color="#ca8a04" />
                        <Text className="text-sm text-yellow-800 flex-1">
                            This card belongs to {card.owner}. You can view but not edit.
                        </Text>
                    </View>
                )}

                {/* Pending Tasks */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-2 mb-3">
                        <FieldLabel className="mb-0">To Do</FieldLabel>
                        <Badge variant="primary" size="sm" label={pendingTasks.length.toString()} />
                    </View>

                    {pendingTasks.length === 0 ? (
                        <View className="bg-surface rounded-2xl p-6 items-center border border-border-light">
                            <Text className="text-sm text-text-secondary">No pending tasks</Text>
                        </View>
                    ) : (
                        pendingTasks.map((task: Task) => (
                            <View key={task.id} className="bg-surface rounded-xl border border-border-light shadow-sm mb-2">
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
                    <View className="mb-6">
                        <View className="flex-row items-center gap-2 mb-3">
                            <FieldLabel className="mb-0">Done</FieldLabel>
                            <Badge variant="secondary" size="sm" label={completedTasks.length.toString()} />
                        </View>
                        {completedTasks.map((task: Task) => (
                            <View key={task.id} className="bg-surface rounded-xl border border-border-light shadow-sm mb-2 opacity-60">
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
                <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
                    <View className="flex-row justify-between items-center mb-2">
                        <FieldLabel className="mb-0">Notes</FieldLabel>
                        {isOwner && !isEditingNote && (
                            <TouchableOpacity onPress={() => setIsEditingNote(true)}>
                                <Ionicons name="pencil-outline" size={16} color={COLORS.text.muted} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {isEditingNote ? (
                        <View>
                            <TextInput
                                className="text-base text-text min-h-[80px] py-2"
                                value={editNote}
                                onChangeText={setEditNote}
                                placeholder="Add notes about this card..."
                                placeholderTextColor={COLORS.text.muted}
                                multiline
                                textAlignVertical="top"
                                autoFocus
                            />
                            <TouchableOpacity
                                onPress={handleSaveNote}
                                className="bg-primary-600 py-2.5 rounded-xl items-center mt-2"
                            >
                                <Text className="text-white font-bold text-sm">Save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text className="text-base text-text-secondary py-2">
                            {card.note || ''}
                        </Text>
                    )}
                </View>

                {/* Archive Card */}
                {isOwner && (
                    <TouchableOpacity
                        onPress={handleArchive}
                        className="flex-row items-center justify-center gap-2 py-4 mt-2 mb-10 bg-red-50 rounded-xl border border-red-100"
                    >
                        <Ionicons name="archive-outline" size={18} color="#dc2626" />
                        <Text className="text-sm font-bold text-red-600">Archive</Text>
                    </TouchableOpacity>
                )}
                <View className="h-20" />
            </ScrollView>

            {/* Add Task Bottom Sheet */}
            <BottomSheet
                visible={showAddTask}
                onClose={() => setShowAddTask(false)}
            >
                <Text className="text-xl font-bold text-text mb-4">Add Task to {card.name}</Text>

                <TextInput
                    className="text-lg font-medium text-text mb-6 py-3.5 px-4 rounded-xl bg-surface-dim border border-border"
                    placeholder="Task name"
                    value={newTaskName}
                    onChangeText={setNewTaskName}
                    autoFocus
                    placeholderTextColor={COLORS.text.muted}
                />

                <TouchableOpacity
                    className="bg-primary-600 py-4 rounded-2xl items-center shadow-sm"
                    onPress={handleAddTask}
                >
                    <Text className="text-white font-bold text-base">Add Task</Text>
                </TouchableOpacity>
            </BottomSheet>
        </View>
    );
};
