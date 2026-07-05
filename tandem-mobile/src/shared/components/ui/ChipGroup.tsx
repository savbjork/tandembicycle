import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from './Text';

export interface ChipOption<T extends string = string> {
  /** The value key passed back in onChange */
  key: T;
  /** Human-readable label */
  label: string;
}

interface ChipGroupProps<T extends string = string> {
  /** The options to render as chips */
  options: ChipOption<T>[];
  /** Currently selected key */
  value: T;
  /** Called when a chip is pressed */
  onChange: (value: T) => void;
  /** Whether to scroll horizontally (useful when many options) */
  scrollable?: boolean;
  /** Optional className for the outer container */
  className?: string;
}

/**
 * A horizontal row of selectable pill-shaped chips.
 *
 * Replaces the duplicated ownership/time-filter chip pattern that was
 * copy-pasted 3+ times in CardsScreen and used in task-card pickers.
 *
 * @example
 * <ChipGroup
 *   options={[
 *     { key: 'all', label: 'Everyone' },
 *     { key: 'me', label: 'Just Me' },
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 */
export function ChipGroup<T extends string = string>({
  options,
  value,
  onChange,
  scrollable = false,
  className = '',
}: ChipGroupProps<T>) {
  const chips = options.map((option) => {
    const isSelected = option.key === value;
    return (
      <TouchableOpacity
        key={option.key}
        onPress={() => onChange(option.key)}
        className={`py-2.5 px-4 rounded-xl border ${
          isSelected ? 'bg-primary-50 border-primary-600' : 'bg-surface border-border'
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            isSelected ? 'text-primary-600' : 'text-text-secondary'
          }`}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className={className}
        contentContainerStyle={{ gap: 8, alignItems: 'center' }}
      >
        {chips}
      </ScrollView>
    );
  }

  return <View className={`flex-row flex-wrap gap-2 ${className}`}>{chips}</View>;
}
