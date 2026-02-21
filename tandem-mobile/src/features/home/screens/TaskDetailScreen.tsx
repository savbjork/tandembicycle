import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text, TextInput, EditableTitle } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { fakeData, type Task } from '@shared/data/FakeDataStore';
import { COLORS } from '@shared/constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper to get YYYY-MM-DD from a local Date object without UTC shifts
const toDateStringLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface TaskDetailScreenProps {
    navigation: any;
    route: { params: { taskId: string } };
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ navigation, route }) => {
    const { taskId } = route.params;
    const task = fakeData.tasks.find(t => t.id === taskId);

    if (!task) {
        Alert.alert('Error', 'Task not found');
        navigation.goBack();
        return null;
    }

    const [editName, setEditName] = React.useState(task.name);
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [editCard, setEditCard] = React.useState(task.card);
    const [editDueDateObj, setEditDueDateObj] = React.useState<Date>(new Date(task.dueDate + 'T00:00:00'));
    const [showEditDatePicker, setShowEditDatePicker] = React.useState(false);
    const [editIsDone, setEditIsDone] = React.useState<boolean>(task.isDone);
    const [editNote, setEditNote] = React.useState(task.note || '');

    const availableCards = fakeData.cards.filter(c => c.owner === 'Savannah').map(c => c.name);

    const updateGlobalTask = (updates: Partial<Task>) => {
        const index = fakeData.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            fakeData.tasks[index] = { ...fakeData.tasks[index], ...updates };
        }
    };

    const handleSaveName = () => {
        const trimmed = editName.trim();
        if (!trimmed) {
            setEditName(task.name);
        } else {
            setEditName(trimmed);
            updateGlobalTask({ name: trimmed });
        }
        setIsEditingName(false);
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
                    onPress: () => {
                        const index = fakeData.tasks.findIndex(t => t.id === taskId);
                        if (index !== -1) {
                            fakeData.tasks.splice(index, 1);
                        }
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-surface-dim">
            <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1.5 bg-border-strong rounded-full opacity-20" />
            </View>

            <ScrollView className="flex-1 px-5">
                <EditableTitle
                    value={editName}
                    isEditing={isEditingName}
                    setIsEditing={setIsEditingName}
                    onChangeText={setEditName}
                    onSave={handleSaveName}
                    className="pt-6"
                />

                <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Card
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5" contentContainerStyle={{ gap: 8 }}>
                    {availableCards.map(c => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => {
                                setEditCard(c);
                                updateGlobalTask({ card: c });
                            }}
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
                                onChange={(_: any, date?: Date) => {
                                    if (date) {
                                        setEditDueDateObj(date);
                                        updateGlobalTask({ dueDate: toDateStringLocal(date) });
                                    }
                                }}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Status
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        const newVal = !editIsDone;
                        setEditIsDone(newVal);
                        updateGlobalTask({ isDone: newVal });
                    }}
                    className={`py-3.5 rounded-xl flex-row items-center px-4 mb-5 border ${editIsDone ? 'bg-success-50 border-success-200' : 'bg-surface border-border'}`}
                >
                    <Ionicons
                        name={editIsDone ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={editIsDone ? COLORS.success[600] : COLORS.text.muted}
                    />
                    <Text className={`ml-3 text-base font-semibold ${editIsDone ? 'text-success-700' : 'text-text-secondary'}`}>
                        {editIsDone ? 'Completed' : 'To Do'}
                    </Text>
                </TouchableOpacity>

                <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Note (optional)
                </Text>
                <TextInput
                    className="bg-surface rounded-xl px-4 py-3.5 text-base text-text mb-5 border border-border"
                    value={editNote}
                    onChangeText={(text) => {
                        setEditNote(text);
                        updateGlobalTask({ note: text.trim() || undefined });
                    }}
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
    );
};
