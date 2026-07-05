import React from 'react';
import { View, ViewProps } from 'react-native';
import { Text } from './Text';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';

interface OwnerBadgeProps extends ViewProps {
  /** The owner name to display (first character becomes the initial) */
  name: string;
  /** Size in pixels (default: 28) */
  size?: number;
  /** Font size override (default: derived from size) */
  fontSize?: number;
}

/**
 * A colored circle badge showing a person's initial.
 *
 * Automatically colors the badge based on whether the name matches
 * the current user (primary) or not (secondary). This replaces the
 * duplicated owner-initial-circle pattern across CardsScreen,
 * SwipeableTaskRow, CardDetailScreen, and ProfileScreen.
 *
 * @example
 * <OwnerBadge name="Savannah" />
 * <OwnerBadge name="Kevin" size={40} />
 */
export const OwnerBadge: React.FC<OwnerBadgeProps> = ({
  name,
  size = 28,
  fontSize,
  className,
  ...props
}) => {
  const { currentUser } = useCurrentUser();
  const initial = name.charAt(0).toUpperCase();
  const isCurrentUser = name === currentUser;
  const resolvedFontSize = fontSize ?? Math.round(size * 0.38);

  return (
    <View
      className={`rounded-full items-center justify-center ${
        isCurrentUser ? 'bg-primary-600' : 'bg-secondary-600'
      } ${className ?? ''}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <Text className="text-white font-bold" style={{ fontSize: resolvedFontSize }}>
        {initial}
      </Text>
    </View>
  );
};
