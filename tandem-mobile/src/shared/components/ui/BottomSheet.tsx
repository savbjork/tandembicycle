import React, { useRef } from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ViewStyle,
    PanResponder,
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
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) =>
                gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 80 || gestureState.vy > 0.5) {
                    onClose();
                }
            },
        }),
    ).current;

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
                        <View
                            style={{ paddingVertical: 16, alignSelf: 'stretch', alignItems: 'center', marginBottom: 24, marginTop: -32, paddingTop: 32 }}
                            {...panResponder.panHandlers}
                        >
                            <View className="w-12 h-1.5 bg-border rounded-full opacity-40" />
                        </View>
                        {children}
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
};
