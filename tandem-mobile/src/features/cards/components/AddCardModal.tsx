import React from 'react';
import { View, TouchableOpacity, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, FieldLabel, ChipGroup, ChipOption, TextInput } from '@shared/components/ui';
import { COLORS } from '@shared/constants/colors';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { useDataStore } from '@store';
import { type Person } from '@shared/data/FakeDataStore';

interface AddCardModalProps {
    onClose: () => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ onClose }) => {
    const { currentUser, partner } = useCurrentUser();
    const { addCard } = useDataStore();
    const [cardName, setCardName] = React.useState('');
    const [selectedOwner, setSelectedOwner] = React.useState<Person>(currentUser);

    const handleAddCard = (isQuiet = false) => {
        if (!cardName.trim()) {
            if (!isQuiet) Alert.alert('Missing Information', 'Please enter a card name.');
            onClose();
            return;
        }

        addCard({ name: cardName.trim(), owner: selectedOwner });
        if (!isQuiet) {
            Alert.alert(
                'Card Added!',
                `"${cardName}" has been added to ${selectedOwner}'s cards.`,
                [{ text: 'OK', onPress: onClose }]
            );
        } else {
            onClose();
        }
    };

    const ownerOptions: ChipOption<Person>[] = [
        { key: currentUser, label: currentUser },
        { key: partner, label: partner },
    ];

    return (
        <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => handleAddCard(true)}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => handleAddCard(true)}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={e => e.stopPropagation()}
                    style={{ backgroundColor: COLORS.surface.DEFAULT, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 50 }}
                >
                    <View className="w-10 h-1.5 bg-border rounded-full self-center mb-6 opacity-30" />

                    <TextInput
                        className="text-lg font-medium text-text mb-6 py-3.5 px-4 rounded-xl bg-surface-dim border border-border"
                        value={cardName}
                        onChangeText={setCardName}
                        multiline
                        placeholder="New Card"
                    />

                    <View className="mb-8">
                        <FieldLabel>Owner</FieldLabel>
                        <ChipGroup
                            options={ownerOptions}
                            value={selectedOwner}
                            onChange={(v) => setSelectedOwner(v as Person)}
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-primary-600 py-4 rounded-2xl items-center shadow-sm"
                        onPress={() => handleAddCard(false)}
                    >
                        <Text className="text-white font-bold text-base">Add Card</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
};
