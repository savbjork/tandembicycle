import { useAuthStore } from '@store';
import type { Person } from '@shared/data/FakeDataStore';

/**
 * Hook to get the current user's display name and partner name.
 *
 * Centralizes the hardcoded 'Savannah' / 'Kevin' strings that were
 * previously scattered across every screen. When real auth is wired up,
 * this hook will read from the auth store / household members — no screen
 * changes required.
 */
export const useCurrentUser = () => {
    const { user } = useAuthStore();

    // Derive the display name from auth state, falling back to 'Savannah'
    // for the demo/mock data layer.
    const currentUser: Person = (user?.name as Person) || 'Savannah';

    // In the real app, partner would come from household members.
    // For now, derive it from the current user.
    const partner: Person = currentUser === 'Savannah' ? 'Kevin' : 'Savannah';

    const householdMembers: Person[] = [currentUser, partner];

    return {
        currentUser,
        partner,
        householdMembers,
        /** First initial of the current user (for avatar badges) */
        initial: currentUser.charAt(0),
        /** First initial of the partner */
        partnerInitial: partner.charAt(0),
    };
};
