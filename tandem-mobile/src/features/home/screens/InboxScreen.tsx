import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Text, ScreenHeader, Button } from '@shared/components/ui';
import { AddButton } from '@shared/components/ui/AddButton';
import { COLORS } from '@shared/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fakeData, type DropZoneItem } from '@shared/data/FakeDataStore';

export const InboxScreen: React.FC = () => {
    const navigation = useNavigation();
    const [showAddModal, setShowAddModal] = useState(false);
    const [items, setItems] = useState<DropZoneItem[]>(fakeData.dropZoneItems);
    const [showArchived, setShowArchived] = useState(false);

    const currentUser = 'Savannah';
    const partner = 'Kevin';

    const activeItems = items.filter(item => item.status !== 'archived');
    const archivedItems = items.filter(item => item.status === 'archived');

    const incomingDrops = activeItems.filter(item => item.receiver === currentUser);
    const outgoingDrops = activeItems.filter(item => item.sender === currentUser);

    const handleAddItem = (content: string) => {
        const newItem: DropZoneItem = {
            id: `d${Date.now()}`,
            sender: currentUser,
            receiver: partner,
            content: content.trim(),
            status: 'pending',
            createdAt: new Date(),
        };
        fakeData.dropZoneItems.unshift(newItem);
        setItems([...fakeData.dropZoneItems]);
        setShowAddModal(false);
    };

    const handleArchive = (id: string) => {
        const item = fakeData.dropZoneItems.find(i => i.id === id);
        if (item) {
            item.status = 'archived';
            setItems([...fakeData.dropZoneItems]);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to permanently delete this item?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const index = fakeData.dropZoneItems.findIndex(i => i.id === id);
                        if (index !== -1) {
                            fakeData.dropZoneItems.splice(index, 1);
                            setItems([...fakeData.dropZoneItems]);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-surface-dim">
            <ScreenHeader
                title="Inbox"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <AddButton onPress={() => setShowAddModal(true)} />
                }
            />

            <ScrollView className="flex-1 px-5">
                {/* Drop Zone Section (Incoming) */}
                <View className="mb-8 mt-4">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ionicons name="download-outline" size={20} color={COLORS.primary[600]} />
                        <Text className="text-lg font-bold text-text">Drop Zone</Text>
                        <View className="bg-primary-100 px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-bold text-primary-700">{incomingDrops.length}</Text>
                        </View>
                    </View>

                    {incomingDrops.length > 0 ? (
                        incomingDrops.map(item => (
                            <DropItemCard
                                key={item.id}
                                item={item}
                                isIncoming
                                onDone={() => handleArchive(item.id)}
                            />
                        ))
                    ) : (
                        <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                            <Text className="text-text-muted text-center">
                                Items {partner} dropped for you will appear here.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Dropped Section (Outgoing) */}
                <View className="mb-8">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ionicons name="paper-plane-outline" size={20} color={COLORS.secondary[600]} />
                        <Text className="text-lg font-bold text-text">Dropped</Text>
                        <View className="bg-secondary-100 px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-bold text-secondary-700">{outgoingDrops.length}</Text>
                        </View>
                    </View>

                    {outgoingDrops.length > 0 ? (
                        outgoingDrops.map(item => (
                            <DropItemCard
                                key={item.id}
                                item={item}
                                onDelete={() => handleDelete(item.id)}
                            />
                        ))
                    ) : (
                        <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                            <Text className="text-text-muted text-center">
                                Items you dropped for {partner} will appear here.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Archived Section */}
                {archivedItems.length > 0 && (
                    <View className="mb-8">
                        <TouchableOpacity
                            onPress={() => setShowArchived(!showArchived)}
                            className="flex-row items-center justify-between mb-4"
                        >
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="archive-outline" size={20} color={COLORS.text.muted} />
                                <Text className="text-lg font-bold text-text-secondary">Archived</Text>
                                <View className="bg-border px-2 py-0.5 rounded-full">
                                    <Text className="text-[10px] font-bold text-text-muted">{archivedItems.length}</Text>
                                </View>
                            </View>
                            <Ionicons name={showArchived ? "chevron-up" : "chevron-down"} size={20} color={COLORS.text.muted} />
                        </TouchableOpacity>

                        {showArchived && archivedItems.map(item => (
                            <DropItemCard key={item.id} item={item} isArchived onDelete={() => handleDelete(item.id)} />
                        ))}
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>

            {showAddModal && (
                <AddDropItemModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddItem}
                    partnerName={partner}
                />
            )}
        </View>
    );
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

interface DropItemCardProps {
    item: DropZoneItem;
    isIncoming?: boolean;
    isArchived?: boolean;
    onDone?: () => void;
    onDelete?: () => void;
}

const DropItemCard: React.FC<DropItemCardProps> = ({ item, isIncoming, isArchived, onDone, onDelete }) => (
    <View className={`bg-surface p-4 rounded-xl mb-3 border border-border shadow-sm ${isArchived ? 'opacity-60' : ''}`}>
        <View className="flex-row justify-between items-start mb-3">
            <View>
                <Text className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                    {isIncoming ? `${item.sender} DROPPED` : `TO ${item.receiver}`}
                </Text>
                <Text className="text-[10px] text-text-muted">
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>

            <View className="flex-row gap-2">
                {isIncoming && !isArchived && (
                    <TouchableOpacity
                        onPress={onDone}
                        className="bg-surface-dim w-8 h-8 rounded-full items-center justify-center border border-border"
                    >
                        <Ionicons name="checkmark" size={18} color={COLORS.text.muted} />
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity
                        onPress={onDelete}
                        className="bg-surface-dim w-8 h-8 rounded-full items-center justify-center border border-border"
                    >
                        <Ionicons name="close" size={18} color={COLORS.text.muted} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
        <Text className="text-base text-text leading-5">
            {item.content}
        </Text>
    </View>
);

interface AddDropItemModalProps {
    onClose: () => void;
    onAdd: (content: string) => void;
    partnerName: string;
}

const AddDropItemModal: React.FC<AddDropItemModalProps> = ({ onClose, onAdd, partnerName }) => {
    const [content, setContent] = useState('');

    return (
        <Modal visible transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity
                className="flex-1 bg-black/40 justify-end"
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    className="bg-surface rounded-t-[30px] p-6 pb-12 shadow-2xl"
                    activeOpacity={1}
                    onPress={e => e.stopPropagation()}
                >
                    <View className="w-10 h-1.5 bg-border rounded-full self-center mb-6 opacity-30" />
                    <Text className="text-xl font-bold text-text mb-2">Drop an Item</Text>
                    <Text className="text-sm text-text-secondary mb-8">
                        Dropping an item into {partnerName}'s inbox lets them choose when to handle it.
                    </Text>

                    <Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">What's the request?</Text>
                    <TextInput
                        className="bg-surface-dim border border-border rounded-2xl p-4 text-text text-base mb-8 h-32"
                        placeholder="e.g. Could we do tacos tonight?"
                        multiline
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical="top"
                        autoFocus
                    />

                    <Button
                        title="Send"
                        onPress={() => {
                            if (!content.trim()) {
                                Alert.alert('Error', 'Please enter a message');
                                return;
                            }
                            onAdd(content);
                        }}
                        variant="primary"
                        className="shadow-md"
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};
