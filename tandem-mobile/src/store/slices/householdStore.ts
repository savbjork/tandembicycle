import { create } from 'zustand';
import { Household } from '@core/models/Household';
import { HouseholdId } from '@shared/types';

/**
 * Household state interface
 */
interface HouseholdState {
  currentHousehold: Household | null;
  households: Household[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentHousehold: (household: Household | null) => void;
  setHouseholds: (households: Household[]) => void;
  addHousehold: (household: Household) => void;
  updateHousehold: (householdId: HouseholdId, updates: Partial<Household>) => void;
  removeHousehold: (householdId: HouseholdId) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearHousehold: () => void;
}

/**
 * Household store
 * Manages household selection and data globally
 */
export const useHouseholdStore = create<HouseholdState>((set) => ({
  currentHousehold: null,
  households: [],
  isLoading: false,
  error: null,

  setCurrentHousehold: (household) =>
    set({
      currentHousehold: household,
      error: null,
    }),

  setHouseholds: (households) =>
    set({
      households,
      error: null,
    }),

  addHousehold: (household) =>
    set((state) => ({
      households: [...state.households, household],
      currentHousehold: household,
    })),

  updateHousehold: (householdId, updates) =>
    set((state) => {
      const updatedHouseholds = state.households.map((h) =>
        h.id === householdId ? { ...h, ...updates } : h
      );
      const updatedCurrent =
        state.currentHousehold?.id === householdId
          ? { ...state.currentHousehold, ...updates }
          : state.currentHousehold;

      return {
        households: updatedHouseholds,
        currentHousehold: updatedCurrent,
      };
    }),

  removeHousehold: (householdId) =>
    set((state) => ({
      households: state.households.filter((h) => h.id !== householdId),
      currentHousehold:
        state.currentHousehold?.id === householdId ? null : state.currentHousehold,
    })),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  clearHousehold: () =>
    set({
      currentHousehold: null,
      households: [],
      isLoading: false,
      error: null,
    }),
}));

