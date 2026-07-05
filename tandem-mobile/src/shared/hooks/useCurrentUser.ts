import { useState, useEffect } from 'react';
import { useAuthStore } from '@store';
import { supabase } from '@lib/supabase';

/**
 * Hook to get the current user's display name and partner name.
 *
 * Fetches real household members from Supabase so names always reflect
 * the actual accounts in the household rather than hardcoded demo values.
 */
export const useCurrentUser = () => {
  const { user } = useAuthStore();
  const [partnerName, setPartnerName] = useState<string>('Partner');
  const [householdMembers, setHouseholdMembers] = useState<string[]>([]);
  const [householdName, setHouseholdName] = useState<string>('');

  useEffect(() => {
    if (!user?.id) return;

    const fetchMembers = async () => {
      const { data: membership } = await supabase
        .from('household_members')
        .select('household_id, households(name)')
        .eq('user_id', user.id)
        .single();

      if (!membership) return;

      const name = (membership.households as unknown as { name: string } | null)?.name;
      if (name) setHouseholdName(name);

      const { data: members } = await supabase
        .from('household_members')
        .select('user_id, profiles(display_name)')
        .eq('household_id', membership.household_id);

      if (!members) return;

      const names = members.map(
        (m) => (m.profiles as unknown as { display_name: string } | null)?.display_name ?? 'Unknown'
      );
      setHouseholdMembers(names);

      const partner = members
        .filter((m) => m.user_id !== user.id)
        .map(
          (m) => (m.profiles as unknown as { display_name: string } | null)?.display_name ?? 'Unknown'
        )[0];

      if (partner) setPartnerName(partner);
    };

    fetchMembers();
  }, [user?.id]);

  const currentUser = user?.name ?? 'User';

  return {
    currentUser,
    partner: partnerName,
    householdName,
    householdMembers: householdMembers.length > 0 ? householdMembers : [currentUser, partnerName],
    /** First initial of the current user (for avatar badges) */
    initial: currentUser.charAt(0),
    /** First initial of the partner */
    partnerInitial: partnerName.charAt(0),
  };
};
