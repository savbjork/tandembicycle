import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
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
  const [cardNote, setCardNote] = React.useState('');
  const [selectedOwner, setSelectedOwner] = React.useState<Person>(currentUser);

  const handleAddCard = () => {
    if (!cardName.trim()) return;
    addCard({ name: cardName.trim(), owner: selectedOwner, note: cardNote.trim() || undefined });
    onClose();
  };

  const ownerOptions: ChipOption<Person>[] = [
    { key: currentUser, label: currentUser },
    { key: partner, label: partner },
  ];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          onClose();
        }
      },
    })
  ).current;

  return (
    <Modal visible={true} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: COLORS.surface.DEFAULT,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              padding: 24,
              paddingBottom: 50,
            }}
          >
            <View
              className="w-10 h-1.5 bg-border rounded-full self-center mb-6 opacity-30"
              {...panResponder.panHandlers}
            />

            <TextInput
              className="text-lg font-medium text-text mb-6 py-3.5 px-4 rounded-xl bg-surface-dim border border-border"
              value={cardName}
              onChangeText={setCardName}
              multiline
              placeholder="New Card"
            />

            <View className="mb-6">
              <FieldLabel>Owner</FieldLabel>
              <ChipGroup
                options={ownerOptions}
                value={selectedOwner}
                onChange={(v) => setSelectedOwner(v as Person)}
              />
            </View>

            <FieldLabel>Notes</FieldLabel>
            <TextInput
              className="text-base text-text mb-8 py-3 px-4 rounded-xl bg-surface-dim border border-border min-h-[80px]"
              placeholder="Add notes..."
              value={cardNote}
              onChangeText={setCardNote}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              className="bg-primary-600 py-4 rounded-2xl items-center shadow-sm"
              onPress={handleAddCard}
            >
              <Text className="text-white font-bold text-base">Add Card</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};
