import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, ScreenHeader, FieldLabel, ChipGroup, DatePickerSheet, EmptyState, EditableTitle, TextInput } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { toDateStringLocal } from '@shared/utils/date';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { taskId } = route.params;
    const { currentUser } = useCurrentUser();
    const { tasks, cards, updateTask, removeTask, toggleTaskDone } = useDataStore();

    const task = useMemo(
        () => tasks.find(t => t.id === taskId),
        [tasks, taskId],
    );

    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(task?.name || '');
    const [editCard, setEditCard] = useState(task?.card || '');
    const [editNote, setEditNote] = useState(task?.note || '');
    const [editDueDate, setEditDueDate] = useState<Date | undefined>(
        task?.dueDate ? new Date(task.dueDate) : undefined,
    );
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    const isOwner = task.owner === currentUser;

    const handleSave = () => {
        updateTask(taskId, {
            name: editName.trim() || task.name,
            card: editCard || task.card,
            dueDate: editDueDate ? toDateStringLocal(editDueDate) : task.dueDate,
            note: editNote,
        });
        navigation.goBack();
    };

    const handleRename = () => {
        if (editName.trim() && editName !== task.name) {
            updateTask(task.id, { name: editName.trim() });
        }
        setIsEditingName(false);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Task?',
            `Are you sure you want to delete "${task.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        removeTask(taskId);
                        navigation.goBack();
                    },
                },
            ],
        );
    };

    const handleToggleDone = () => {
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
                title=""
                showBack={false}
                onBack={handleSave}
                compact
            />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView className="flex-1 px-5 pb-5" keyboardShouldPersistTaps="handled">
                    {/* Header */}
                    <EditableTitle
                        value={editName}
                        isEditing={isEditingName}
                        setIsEditing={setIsEditingName}
                        onChangeText={setEditName}
                        onSave={handleRename}
                        placeholder="Task name"
                    />

                    {!isOwner && (
                        <View className="bg-yellow-50 rounded-xl p-4 mb-4 flex-row items-center gap-3 border border-yellow-100">
                            <Ionicons name="lock-closed" size={18} color="#ca8a04" />
                            <Text className="text-sm text-yellow-800 flex-1">
                                This task belongs to {task.owner}. You can view but not edit.
                            </Text>
                        </View>
                    )}


                    {/* Card Assignment */}
                    <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
                        <FieldLabel>Card</FieldLabel>
                        {isOwner ? (
                            <ChipGroup
                                options={cardOptions}
                                value={editCard}
                                onChange={setEditCard}
                                scrollable
                            />
                        ) : (
                            <Text className="text-base text-text py-2">{task.card}</Text>
                        )}
                    </View>

                    {/* Due Date */}
                    <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
                        <FieldLabel>Due Date</FieldLabel>
                        {isOwner ? (
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="py-2 flex-row items-center gap-3"
                            >
                                <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
                                <Text className="text-base text-text">
                                    {editDueDate ? editDueDate.toLocaleDateString() : 'No due date'}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text className="text-base text-text py-2">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </Text>
                        )}
                    </View>

                    {/* Status */}
                    <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
                        <FieldLabel>Status</FieldLabel>
                        <TouchableOpacity
                            onPress={isOwner ? handleToggleDone : undefined}
                            className="flex-row items-center gap-3 py-2"
                            disabled={!isOwner}
                        >
                            <Ionicons
                                name={task.isDone ? 'checkbox' : 'square-outline'}
                                size={22}
                                color={task.isDone ? COLORS.primary[600] : COLORS.text.muted}
                            />
                            <Text className={`text-base ${task.isDone ? 'text-primary-600 font-semibold' : 'text-text'}`}>
                                {task.isDone ? 'Completed' : 'Pending'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Notes */}
                    <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
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
                            />
                        ) : (
                            <Text className="text-base text-text py-2">{task.note || 'No notes'}</Text>
                        )}
                    </View>

                    {isOwner && (
                        <View className="flex-row gap-3 mt-2 mb-6">
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-red-50 rounded-xl border border-red-100"
                            >
                                <Ionicons name="trash-outline" size={18} color="#dc2626" />
                                <Text className="text-sm font-bold text-red-600">Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-primary-600 rounded-xl"
                            >
                                <Ionicons name="checkmark" size={18} color="white" />
                                <Text className="text-sm font-bold text-white">Save</Text>
                            </TouchableOpacity>
                        </View>
                    )}
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
