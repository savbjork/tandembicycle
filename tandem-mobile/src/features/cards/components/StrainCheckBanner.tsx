import React, { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text, BottomSheet } from '@shared/components/ui';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { domainsNeedingStrainCheck } from '@features/net/logic/netItemLogic';
import { StrainSelector } from './StrainSelector';

// Weekly, dismissible prompt to self-rate your own domains. Never rates the partner's.
export const StrainCheckBanner: React.FC = () => {
  const { currentUser } = useCurrentUser();
  const { cards, updateCard } = useDataStore();
  const [dismissed, setDismissed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const stale = useMemo(
    () => domainsNeedingStrainCheck(cards, currentUser, new Date()),
    [cards, currentUser]
  );

  // Keep the banner mounted while the sheet is open even if `stale` empties out
  // mid-session (e.g. the last domain just got rated) — otherwise the Modal
  // would unmount out from under itself instead of closing gracefully.
  if (dismissed || (stale.length === 0 && !sheetOpen)) return null;

  return (
    <>
      <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm flex-row items-center">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-semibold text-text">Weekly check-in</Text>
          <Text className="text-[13px] text-text-secondary mt-0.5">
            How heavy do your domains feel right now?
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary-600 px-3.5 py-2 rounded-lg mr-2"
          onPress={() => setSheetOpen(true)}
        >
          <Text className="text-white text-[13px] font-semibold">Rate</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDismissed(true)} className="p-1">
          <Text className="text-text-muted text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text className="text-xl font-bold text-text mb-4">Your domains this week</Text>
        {stale.length === 0 ? (
          <Text className="text-sm text-text-secondary">All rated — nice.</Text>
        ) : (
          stale.map((card) => (
            <View key={card.name} className="mb-2">
              <Text className="text-sm font-semibold text-text mb-1">{card.name}</Text>
              <StrainSelector
                value={card.strain}
                onChange={(s) =>
                  updateCard(card.name, { strain: s, strainAt: new Date().toISOString() })
                }
              />
            </View>
          ))
        )}
      </BottomSheet>
    </>
  );
};
