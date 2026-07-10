import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@shared/components/ui';
import type { DomainStrain } from '@shared/data/FakeDataStore';

interface StrainSelectorProps {
  value?: DomainStrain;
  onChange: (strain: DomainStrain) => void;
}

const OPTIONS: { value: DomainStrain; label: string; activeClass: string }[] = [
  { value: 'light', label: 'Light', activeClass: 'bg-success-600' },
  { value: 'manageable', label: 'Manageable', activeClass: 'bg-warning-500' },
  { value: 'drowning', label: 'Drowning', activeClass: 'bg-error-600' },
];

// Self-reported strain: the one signal that crosses the partner wall.
export const StrainSelector: React.FC<StrainSelectorProps> = ({ value, onChange }) => (
  <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
    <Text className="text-sm font-semibold text-text-secondary mb-3">
      How heavy does this domain feel?
    </Text>
    <View className="flex-row gap-2">
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            value === opt.value ? opt.activeClass : 'border border-border'
          }`}
          onPress={() => onChange(opt.value)}
        >
          <Text
            className={`text-[13px] font-semibold ${
              value === opt.value ? 'text-white' : 'text-text-secondary'
            }`}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
