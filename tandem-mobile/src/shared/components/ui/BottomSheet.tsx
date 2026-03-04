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
                        onPress={() => { }}
                        style={[
                            {
                                backgroundColor: COLORS.surface.DEFAULT,
                                borderTopLeftRadius: 32,
                                borderTopRightRadius: 32,
                                padding: 24,
                                paddingTop: 32,
                                paddingBottom: Platform.OS === 'ios' ? 48 : 32,
                                minHeight: Platform.OS === 'ios' ? '60%' : '55%',
                            },
                            containerStyle,
                        ]}
                    >
                        <View className="w-12 h-1.5 bg-border rounded-full self-center mb-10 opacity-40" />
                        {children}
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
};
