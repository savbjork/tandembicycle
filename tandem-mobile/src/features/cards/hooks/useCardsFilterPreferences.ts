import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type TaskTimeFilter } from '@shared/utils/date';
import { type CardsFilter } from './useCardsFiltering';

const STORAGE_KEY = 'cards_filter_preferences';

interface FilterPreferences {
  filter: CardsFilter;
  taskTimeFilter: TaskTimeFilter;
  hideCompleted: boolean;
  hideUndated: boolean;
  hideEmptyCards: boolean;
}

const DEFAULTS: FilterPreferences = {
  filter: 'all',
  taskTimeFilter: 'thisWeek',
  hideCompleted: false,
  hideUndated: false,
  hideEmptyCards: false,
};

export const useCardsFilterPreferences = () => {
  const [prefs, setPrefs] = useState<FilterPreferences>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
        } catch {
          // ignore corrupt data, use defaults
        }
      }
      setLoaded(true);
    });
  }, []);

  const update = useCallback((patch: Partial<FilterPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, loaded, update };
};
