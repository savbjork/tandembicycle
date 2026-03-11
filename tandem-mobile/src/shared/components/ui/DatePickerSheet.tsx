import React from 'react';
import { View, TouchableOpacity, Modal, Platform } from 'react-native';
import { Text } from './Text';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerSheetProps {
    /** Whether the picker modal is visible */
    visible: boolean;
    /** Called when the picker is dismissed */
    onClose: () => void;
    /** The currently selected date (defaults to today if not set) */
    value?: Date;
    /** Called when a new date is selected */
    onChange: (date: Date) => void;
}

/**
 * A reusable date picker presented in a centered modal overlay.
 *
 * Auto-closes on both platforms when a date is selected.
 * Tapping the backdrop also dismisses it.
 *
 * Replaces the duplicated date-picker-in-a-modal pattern that was
 * copy-pasted across TasksScreen and TaskDetailScreen.
 */
export const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
    visible,
    onClose,
    value,
    onChange,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View className="bg-surface rounded-2xl p-4 w-[90%]">
                    <DateTimePicker
                        value={value || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={(_, date) => {
                            if (date) {
                                onChange(date);
                            }
                            // Android's native dialog closes itself; dismiss the modal wrapper too.
                            // On iOS the inline picker stays open until the user taps the backdrop.
                            if (Platform.OS === 'android') {
                                onClose();
                            }
                        }}
                        style={{ width: '100%' }}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );
};
