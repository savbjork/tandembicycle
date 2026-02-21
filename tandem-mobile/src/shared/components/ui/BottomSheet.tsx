import React from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
} from 'react-native';
import { COLORS } from '@shared/constants/colors';

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    transparent?: boolean;
    containerStyle?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    visible,
    onClose,
    children,
    transparent = true,
    containerStyle,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={transparent}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    style={[
                        {
                            backgroundColor: COLORS.surface.DEFAULT,
                            borderTopLeftRadius: 30,
                            borderTopRightRadius: 30,
                            padding: 24,
                            paddingBottom: 50,
                        },
                        containerStyle,
                    ]}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View className="w-10 h-1.5 bg-border rounded-full self-center mb-6 opacity-30" />
                        {children}
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};
