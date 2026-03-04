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
 * On iOS it shows an inline calendar with a "Done" button.
 * On Android it uses the native date picker and auto-closes on selection.
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
                            if (date) onChange(date);
                            if (Platform.OS !== 'ios') onClose();
                        }}
                        style={{ width: '100%' }}
                    />
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            className="bg-primary-600 py-3 rounded-xl items-center mt-3"
                            onPress={onClose}
                        >
                            <Text className="text-white font-bold">Done</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};
