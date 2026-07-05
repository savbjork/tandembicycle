import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader title="Net" showBack onBack={() => navigation.goBack()} />

      {/* Capture box — always on top, zero required fields */}
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center bg-surface border border-border rounded-2xl pl-4 pr-2 py-2 gap-2 shadow-sm">
          <TextInput
            className="flex-1 text-base text-text py-1.5"
            placeholder="Get it out of your head…"
            placeholderTextColor={COLORS.text.muted}
            value={captureText}
            onChangeText={setCaptureText}
            multiline
          />
          <TouchableOpacity
            className={`px-4 py-2.5 rounded-xl ${captureText.trim() ? 'bg-primary-600' : 'bg-border'}`}
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
            <FieldLabel>To route</FieldLabel>
            {unrouted.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-surface rounded-xl p-4 mb-2 border border-border-light shadow-sm flex-row items-center"
                onPress={() => setRoutingItem(item)}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-base text-text">{item.content}</Text>
                  <Text className="text-[11px] text-text-muted mt-1">
                    {formatRelativeTime(item.createdAt)} • tap to route
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={22}
                  color={COLORS.primary[600]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {returned.length > 0 && (
          <View className="mb-6">
            <FieldLabel>Returned to you</FieldLabel>
            {returned.map((item) => (
              <View
                key={item.id}
                className="bg-surface rounded-xl p-4 mb-2 border border-border-light shadow-sm"
              >
                <Text className="text-base text-text">{item.content}</Text>
                {item.declineReason && (
                  <Text className="text-[13px] text-text-secondary mt-1 italic">
                    “{item.declineReason}”
                  </Text>
                )}
                <View className="flex-row gap-3 mt-3">
                  <TouchableOpacity
                    className="bg-primary-600 px-4 py-2 rounded-lg"
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
          <FieldLabel>Your triage</FieldLabel>
          {triage.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border-light">
              <Text className="text-sm text-text-secondary">Nothing waiting on you</Text>
            </View>
          ) : (
            triage.map((item) => (
              <View
                key={item.id}
                className="bg-surface rounded-xl p-4 mb-2 border border-border-light shadow-sm"
              >
                <Text className="text-base text-text">{item.content}</Text>
                <Text className="text-[11px] text-text-muted mt-1">
                  {item.domain} • from {item.capturer} • {formatRelativeTime(item.createdAt)}
                </Text>
                <View className="flex-row gap-2 mt-3">
                  <TriageButton label="Task" onPress={() => setTaskFromItem(item)} primary />
                  <TriageButton label="Done" onPress={() => triageNetItem(item.id, 'done')} />
                  <TriageButton label="Someday" onPress={() => triageNetItem(item.id, 'someday')} />
                  <TriageButton label="Decline" onPress={() => setDecliningItem(item)} />
                </View>
              </View>
            ))
          )}
        </View>

        {recentlyCaught.length > 0 && (
          <View className="mb-6 opacity-60">
            <FieldLabel>Caught</FieldLabel>
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
          className={`py-4 rounded-2xl items-center ${declineReason.trim() ? 'bg-primary-600' : 'bg-border'}`}
          disabled={!declineReason.trim()}
          onPress={handleDecline}
        >
          <Text className="text-white font-bold text-base">Send back</Text>
        </TouchableOpacity>
      </BottomSheet>

      <AddTaskSheet
        visible={taskFromItem !== null}
        onClose={() => setTaskFromItem(null)}
        initialNote={taskFromItem?.content}
        initialCard={taskFromItem?.domain}
        onTaskAdded={() => taskFromItem && triageNetItem(taskFromItem.id, 'accepted')}
      />
    </View>
  );
};

// ─── Triage Button ────────────────────────────────────────────

interface TriageButtonProps {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

const TriageButton: React.FC<TriageButtonProps> = ({ label, onPress, primary }) => (
  <TouchableOpacity
    className={`px-3 py-2 rounded-lg ${primary ? 'bg-primary-600' : 'border border-border'}`}
    onPress={onPress}
  >
    <Text className={`text-[13px] font-semibold ${primary ? 'text-white' : 'text-text-secondary'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);
