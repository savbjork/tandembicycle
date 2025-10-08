import { create } from 'zustand';

/**
 * UI state interface
 */
interface UIState {
  // Modal states
  isCardDetailModalOpen: boolean;
  selectedCardId: string | null;

  // Loading states
  isGlobalLoading: boolean;
  loadingMessage: string | null;

  // Toast/Snackbar
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null;

  // Bottom sheet states
  isAssignmentSheetOpen: boolean;

  // Theme
  isDarkMode: boolean;

  // Actions
  openCardDetailModal: (cardId: string) => void;
  closeCardDetailModal: () => void;
  setGlobalLoading: (isLoading: boolean, message?: string) => void;
  showToast: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
  hideToast: () => void;
  openAssignmentSheet: () => void;
  closeAssignmentSheet: () => void;
  toggleTheme: () => void;
}

/**
 * UI store
 * Manages global UI state like modals, loading states, toasts
 */
export const useUIStore = create<UIState>((set) => ({
  isCardDetailModalOpen: false,
  selectedCardId: null,
  isGlobalLoading: false,
  loadingMessage: null,
  toast: null,
  isAssignmentSheetOpen: false,
  isDarkMode: false,

  openCardDetailModal: (cardId) =>
    set({
      isCardDetailModalOpen: true,
      selectedCardId: cardId,
    }),

  closeCardDetailModal: () =>
    set({
      isCardDetailModalOpen: false,
      selectedCardId: null,
    }),

  setGlobalLoading: (isLoading, message) =>
    set({
      isGlobalLoading: isLoading,
      loadingMessage: message || null,
    }),

  showToast: (message, type) =>
    set({
      toast: {
        visible: true,
        message,
        type,
      },
    }),

  hideToast: () =>
    set({
      toast: null,
    }),

  openAssignmentSheet: () =>
    set({
      isAssignmentSheetOpen: true,
    }),

  closeAssignmentSheet: () =>
    set({
      isAssignmentSheetOpen: false,
    }),

  toggleTheme: () =>
    set((state) => ({
      isDarkMode: !state.isDarkMode,
    })),
}));

