import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, BottomSheet, ScreenHeader, FieldLabel, TextInput } from '@shared/components/ui';
import { AddTaskSheet } from '@shared/components/ui/AddTaskSheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import type { NetItem } from '@shared/data/FakeDataStore';
import { selectUnrouted, selectTriage, selectReturned } from '@features/net/logic/netItemLogic';
import { formatRelativeTime } from '@shared/utils/date';
import { useNavigation } from '@react-navigation/native';
import { domainHue, HUE_CHIP_CLASS } from '@shared/utils';

// Sherbet lilac "sub" stop (tokens.sherbet.lilac.sub) — matches the lilac tint
// used for unrouted/returned items, which have no domain yet so can't use the
// per-hue chip lookup. Kept as a named constant rather than a literal inline
// hex so the source of truth is traceable back to the token.
const LILAC_SUB = '#6C4A9E';

export const NetScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentUser } = useCurrentUser();
  const {
    cards,
    netItems,
    addNetItem,
    routeNetItem,
    triageNetItem,
    declineNetItem,
    removeNetItem,
  } = useDataStore();

  const [captureText, setCaptureText] = useState('');
  const [routingItem, setRoutingItem] = useState<NetItem | null>(null);
  const [decliningItem, setDecliningItem] = useState<NetItem | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [taskFromItem, setTaskFromItem] = useState<NetItem | null>(null);

  const unrouted = useMemo(() => selectUnrouted(netItems, currentUser), [netItems, currentUser]);
  const triage = useMemo(
    () => selectTriage(netItems, cards, currentUser),
    [netItems, cards, currentUser]
  );
  const returned = useMemo(() => selectReturned(netItems, currentUser), [netItems, currentUser]);

  // Recently routed by me — shown faded for a day, then gone. No status beyond this.
  const recentlyCaught = useMemo(
    () =>
      netItems.filter(
        (i) =>
          i.capturer === currentUser &&
          i.status === 'pending' &&
          Date.now() - i.createdAt.getTime() < 24 * 60 * 60 * 1000
      ),
    [netItems, currentUser]
  );

  const claimedDomains = useMemo(() => cards.filter((c) => c.owner), [cards]);

  const handleCapture = () => {
    if (!captureText.trim()) return;
    addNetItem({
      id: `n${Date.now()}`,
      capturer: currentUser,
      content: captureText.trim(),
      status: 'unrouted',
      createdAt: new Date(),
    });
    setCaptureText('');
  };

  const handleDecline = () => {
    if (!decliningItem || !declineReason.trim()) return;
    declineNetItem(decliningItem.id, declineReason.trim());
    setDecliningItem(null);
    setDeclineReason('');
  };

  const handleDismissReturned = (item: NetItem) => {
    Alert.alert('Let it go?', 'This thought will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeNetItem(item.id) },
    ]);
  };

  return (
    <View className="flex-1 bg-cream">
      <ScreenHeader title="Net" showBack onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Capture box — always on top, zero required fields */}
        <View className="px-5 pt-2 pb-4">
          <View className="flex-row items-center bg-surface border border-warm-border rounded-2xl pl-4 pr-2 py-2 gap-2 shadow-sm">
            <TextInput
              className="flex-1 text-base text-text py-1.5"
              placeholder="Get it out of your head…"
              placeholderTextColor={COLORS.text.muted}
              value={captureText}
              onChangeText={setCaptureText}
              multiline
            />
            <TouchableOpacity
              className={`px-4 py-2.5 rounded-xl ${captureText.trim() ? 'bg-accent-catch' : 'bg-border'}`}
              disabled={!captureText.trim()}
              onPress={handleCapture}
            >
              <Text className="text-white font-bold text-sm">Catch</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-5">
          {unrouted.length > 0 && (
            <View className="mb-6">
              <FieldLabel>
                <Text className="text-warm-label">To route</Text>
              </FieldLabel>
              {unrouted.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-sherbet-lilac-fill rounded-xl p-4 mb-2 border border-sherbet-lilac-line shadow-sm flex-row items-center"
                  onPress={() => setRoutingItem(item)}
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-base text-sherbet-lilac-title">{item.content}</Text>
                    <Text className="text-[11px] text-sherbet-lilac-sub mt-1">
                      {formatRelativeTime(item.createdAt)} • tap to route
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle-outline" size={22} color={LILAC_SUB} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {returned.length > 0 && (
            <View className="mb-6">
              <FieldLabel>
                <Text className="text-warm-label">Returned to you</Text>
              </FieldLabel>
              {returned.map((item) => (
                <View
                  key={item.id}
                  className="bg-sherbet-lilac-fill rounded-xl p-4 mb-2 border border-sherbet-lilac-line shadow-sm"
                >
                  <Text className="text-base text-sherbet-lilac-title">{item.content}</Text>
                  {item.declineReason && (
                    <Text className="text-[13px] text-sherbet-lilac-sub mt-1 italic">
                      “{item.declineReason}”
                    </Text>
                  )}
                  <View className="flex-row gap-3 mt-3">
                    <TouchableOpacity
                      className="bg-accent-action px-4 py-2 rounded-lg"
                      onPress={() => setRoutingItem(item)}
                    >
                      <Text className="text-white text-sm font-semibold">Re-route</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-4 py-2 rounded-lg border border-border"
                      onPress={() => handleDismissReturned(item)}
                    >
                      <Text className="text-text-secondary text-sm font-semibold">Let it go</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View className="mb-6">
            <FieldLabel>
              <Text className="text-warm-label">Your triage</Text>
            </FieldLabel>
            {triage.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 items-center border border-warm-border">
                <Text className="text-sm text-text-secondary">Nothing waiting on you</Text>
              </View>
            ) : (
              triage.map((item) => (
                <View
                  key={item.id}
                  className="bg-surface rounded-xl p-4 mb-2 border border-warm-border shadow-sm"
                >
                  <Text className="text-base text-text">{item.content}</Text>
                  {/* item.domain is guaranteed non-null here — selectTriage requires it. */}
                  <View className="flex-row items-center flex-wrap gap-x-1 mt-1">
                    <View
                      className={`rounded-full px-2 py-0.5 ${HUE_CHIP_CLASS[domainHue(item.domain!)]}`}
                    >
                      <Text
                        className={`text-[11px] font-semibold ${HUE_CHIP_CLASS[domainHue(item.domain!)]}`}
                      >
                        {item.domain}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-text-muted">
                      • from {item.capturer} • {formatRelativeTime(item.createdAt)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2 mt-3">
                    <TriageButton
                      label="Task"
                      onPress={() => setTaskFromItem(item)}
                      variant="primary"
                    />
                    <TriageButton
                      label="Done"
                      onPress={() => triageNetItem(item.id, 'done')}
                      variant="mint"
                    />
                    <TriageButton
                      label="Someday"
                      onPress={() => triageNetItem(item.id, 'someday')}
                      variant="butter"
                    />
                    <TriageButton label="Decline" onPress={() => setDecliningItem(item)} />
                  </View>
                </View>
              ))
            )}
          </View>

          {recentlyCaught.length > 0 && (
            <View className="mb-6 opacity-60">
              <FieldLabel>
                <Text className="text-warm-label">Caught</Text>
              </FieldLabel>
              {recentlyCaught.map((item) => (
                <View key={item.id} className="flex-row items-center gap-2 py-1.5">
                  <Ionicons name="checkmark-done" size={16} color={COLORS.text.muted} />
                  <Text className="text-sm text-text-muted flex-1" numberOfLines={1}>
                    {item.content} → {item.domain}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet visible={routingItem !== null} onClose={() => setRoutingItem(null)}>
        <Text className="text-xl font-bold text-text mb-2">Route to a domain</Text>
        <Text className="text-sm text-text-secondary mb-4" numberOfLines={2}>
          {routingItem?.content}
        </Text>
        {claimedDomains.map((card) => (
          <TouchableOpacity
            key={card.name}
            className="py-3.5 px-4 rounded-xl bg-surface-dim border border-border mb-2 flex-row justify-between items-center"
            onPress={() => {
              if (routingItem) routeNetItem(routingItem.id, card.name);
              setRoutingItem(null);
            }}
          >
            <Text className="text-base font-medium text-text">{card.name}</Text>
            <Text className="text-[13px] text-text-muted">{card.owner}</Text>
          </TouchableOpacity>
        ))}
        {claimedDomains.length === 0 && (
          <Text className="text-sm text-text-muted">No claimed domains yet.</Text>
        )}
      </BottomSheet>

      <BottomSheet
        visible={decliningItem !== null}
        onClose={() => {
          setDecliningItem(null);
          setDeclineReason('');
        }}
      >
        <Text className="text-xl font-bold text-text mb-2">Decline</Text>
        <Text className="text-sm text-text-secondary mb-4">
          It goes back to {decliningItem?.capturer} with your reason — nothing silently dies.
        </Text>
        <TextInput
          className="text-base text-text mb-4 py-3.5 px-4 rounded-xl bg-surface-dim border border-border"
          placeholder="Why are you bouncing this?"
          placeholderTextColor={COLORS.text.muted}
          value={declineReason}
          onChangeText={setDeclineReason}
          autoFocus
          multiline
        />
        <TouchableOpacity
          className={`py-4 rounded-2xl items-center ${declineReason.trim() ? 'bg-accent-action' : 'bg-border'}`}
          disabled={!declineReason.trim()}
          onPress={handleDecline}
        >
          <Text className="text-white font-bold text-base">Send back</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* initialCard must be one of the current user's own domains — AddTaskSheet's card picker
          only lists cards the current user heads, which selectTriage guarantees here. */}
      <AddTaskSheet
        visible={taskFromItem !== null}
        onClose={() => setTaskFromItem(null)}
        initialNote={taskFromItem?.content}
        initialCard={taskFromItem?.domain}
        onTaskAdded={() => taskFromItem && triageNetItem(taskFromItem.id, 'accepted')}
        lockCard={taskFromItem !== null}
      />
    </View>
  );
};

// ─── Triage Button ────────────────────────────────────────────

type TriageButtonVariant = 'primary' | 'mint' | 'butter' | 'quiet';

interface TriageButtonProps {
  label: string;
  onPress: () => void;
  variant?: TriageButtonVariant;
}

const TRIAGE_BUTTON_CONTAINER_CLASS: Record<TriageButtonVariant, string> = {
  primary: 'bg-accent-action',
  mint: 'bg-sherbet-mint-fill',
  butter: 'bg-sherbet-butter-fill',
  quiet: 'border border-border',
};

const TRIAGE_BUTTON_TEXT_CLASS: Record<TriageButtonVariant, string> = {
  primary: 'text-white',
  mint: 'text-sherbet-mint-title',
  butter: 'text-sherbet-butter-title',
  quiet: 'text-text-secondary',
};

const TriageButton: React.FC<TriageButtonProps> = ({ label, onPress, variant = 'quiet' }) => (
  <TouchableOpacity
    className={`px-3 py-2 rounded-lg ${TRIAGE_BUTTON_CONTAINER_CLASS[variant]}`}
    onPress={onPress}
  >
    <Text className={`text-[13px] font-semibold ${TRIAGE_BUTTON_TEXT_CLASS[variant]}`}>
      {label}
    </Text>
  </TouchableOpacity>
);
