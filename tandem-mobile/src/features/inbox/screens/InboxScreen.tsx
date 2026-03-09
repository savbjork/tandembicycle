import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, BottomSheet, ScreenHeader, FieldLabel, Badge, TextInput } from '@shared/components/ui';
import { AddButton } from '@shared/components/ui/AddButton';
import { AddTaskSheet } from '@shared/components/ui/AddTaskSheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import type { DropZoneItem } from '@shared/data/FakeDataStore';
import { formatRelativeTime } from '@shared/utils/date';
import { useNavigation } from '@react-navigation/native';

export const InboxScreen: React.FC = () => {
    const navigation = useNavigation();
    const { currentUser, partner } = useCurrentUser();
    const { dropZoneItems, addDropZoneItem, updateDropZoneItemStatus, removeDropZoneItem } = useDataStore();

    const [showAddModal, setShowAddModal] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [taskFromItem, setTaskFromItem] = useState<DropZoneItem | null>(null);

    const receivedItems = useMemo(
        () => dropZoneItems.filter((item: DropZoneItem) => item.receiver === currentUser && item.status === 'pending'),
        [dropZoneItems, currentUser],
    );

    const sentItems = useMemo(
        () => dropZoneItems.filter((item: DropZoneItem) => item.sender === currentUser),
        [dropZoneItems, currentUser],
    );

    const handleSendItem = () => {
        if (!newContent.trim()) return;
        addDropZoneItem({
            id: `d${Date.now()}`,
            sender: currentUser,
            receiver: partner,
            content: newContent.trim(),
            status: 'pending',
            createdAt: new Date(),
        });
        setNewContent('');
        setShowAddModal(false);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Item?',
            'This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeDropZoneItem(id) },
            ],
        );
    };

    return (
        <View className="flex-1 bg-surface-dim">
            <ScreenHeader
                title="Inbox"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={<AddButton onPress={() => setShowAddModal(true)} />}
            />

            <ScrollView className="flex-1 px-5 pb-5">
                {/* Received Items */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-2 mb-3">
                        <FieldLabel className="mb-0">Received</FieldLabel>
                    </View>

                    {receivedItems.length === 0 ? (
                        <View className="bg-surface rounded-2xl p-6 items-center border border-border-light">
                            <Text className="text-sm text-text-secondary">Nothing new in your inbox</Text>
                        </View>
                    ) : (
                        receivedItems.map((item: DropZoneItem) => (
                            <DropItemCard
                                key={item.id}
                                item={item}
                                onCheckmark={() => setTaskFromItem(item)}
                                onDelete={() => handleDelete(item.id)}
                            />
                        ))
                    )}
                </View>

                {/* Sent Items */}
                {sentItems.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row items-center gap-2 mb-3">
                            <FieldLabel className="mb-0">Sent</FieldLabel>
                        </View>
                        {sentItems.map((item: DropZoneItem) => (
                            <DropItemCard
                                key={item.id}
                                item={item}
                                onDelete={() => handleDelete(item.id)}
                            />
                        ))}
                    </View>
                )}
                <View className="h-10" />
            </ScrollView>

            {/* Send message bottom sheet */}
            <BottomSheet visible={showAddModal} onClose={() => setShowAddModal(false)}>
                <Text className="text-xl font-bold text-text mb-6">Send to {partner}</Text>

                <TextInput
                    className="text-lg font-medium text-text mb-6 py-3.5 px-4 rounded-xl bg-surface-dim border border-border"
                    placeholder="What do you want to say?"
                    value={newContent}
                    onChangeText={setNewContent}
                    autoFocus
                    multiline
                    placeholderTextColor={COLORS.text.muted}
                />

                <TouchableOpacity
                    className="bg-primary-600 py-4 rounded-2xl items-center shadow-sm"
                    onPress={handleSendItem}
                >
                    <Text className="text-white font-bold text-base">Send</Text>
                </TouchableOpacity>
            </BottomSheet>

            {/* Create task from message */}
            <AddTaskSheet
                visible={taskFromItem !== null}
                onClose={() => setTaskFromItem(null)}
                initialNote={taskFromItem?.content}
                onTaskAdded={() => taskFromItem && updateDropZoneItemStatus(taskFromItem.id, 'archived')}
            />
        </View>
    );
};

// ─── Drop Item Card ───────────────────────────────────────────────────────────

interface DropItemCardProps {
    item: DropZoneItem;
    onCheckmark?: () => void;
    onDelete?: () => void;
}

const DropItemCard: React.FC<DropItemCardProps> = ({ item, onCheckmark, onDelete }) => (
    <View className="bg-surface rounded-xl p-4 mb-2 border border-border-light shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-3">
                <Text className="text-base text-text">{item.content}</Text>
            </View>
            <View className="flex-row gap-2">
                {onCheckmark && (
                    <TouchableOpacity onPress={onCheckmark} className="p-1">
                        <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} className="p-1">
                        <Ionicons name="trash-outline" size={20} color={COLORS.text.muted} />
                    </TouchableOpacity>
                )}
            </View>
        </View>

        <View className="flex-row items-center gap-2">
            <Text className="text-[11px] text-text-muted">
                From {item.sender} • {formatRelativeTime(item.createdAt)}
            </Text>
            {item.status === 'archived' && (
                <Badge variant="success" size="sm" label="Archived" />
            )}
        </View>
    </View>
);
