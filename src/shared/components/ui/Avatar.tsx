import React from 'react';
import { View, Text, Image } from 'react-native';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Avatar component with fallback to initials
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
}) => {
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-12 h-12';
      case 'lg':
        return 'w-16 h-16';
      case 'xl':
        return 'w-24 h-24';
      default:
        return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-xl';
      case 'xl':
        return 'text-3xl';
      default:
        return 'text-base';
    }
  };

  // Generate consistent color based on name
  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-amber-500',
      'bg-indigo-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={`${getSizeClasses()} rounded-full`}
      />
    );
  }

  return (
    <View
      className={`
        ${getSizeClasses()}
        ${getBackgroundColor(name)}
        rounded-full
        items-center
        justify-center
      `}
    >
      <Text className={`${getTextSize()} font-bold text-white`}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

