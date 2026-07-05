import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { TextInput } from './TextInput';

interface EditableTitleProps {
  value: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onChangeText: (text: string) => void;
  onSave: () => void;
  subtitle?: string;
  className?: string;
  placeholder?: string;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  value,
  isEditing,
  setIsEditing,
  onChangeText,
  onSave,
  subtitle,
  className = '',
  placeholder = 'Enter title...',
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      {isEditing ? (
        <TextInput
          className="text-[32px] font-bold text-text tracking-tight mb-1 py-1 px-0"
          value={value}
          onChangeText={onChangeText}
          onBlur={onSave}
          autoFocus
          multiline
          blurOnSubmit
          placeholder={placeholder}
        />
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text className="text-[32px] font-bold text-text tracking-tight mb-1">{value}</Text>
        </TouchableOpacity>
      )}
      {subtitle && <Text className="text-base text-text-secondary">{subtitle}</Text>}
    </View>
  );
};
