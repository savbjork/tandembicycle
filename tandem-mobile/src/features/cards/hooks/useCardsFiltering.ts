import { useMemo } from 'react';
import { type Card, type Task } from '@shared/data/FakeDataStore';
import { isDateInTimeFrame, type TaskTimeFilter } from '@shared/utils/date';

export type CardsFilter = 'all' | 'me';

interface UseCardsFilteringProps {
    cards: Card[];
    tasks: Task[];
    filter: CardsFilter;
    taskTimeFilter: TaskTimeFilter;
    hideEmptyCards: boolean;
    hideCompleted: boolean;
    hideUndated: boolean;
    currentUser: string;
}

export const useCardsFiltering = ({
    cards,
    tasks,
    filter,
    taskTimeFilter,
    hideEmptyCards,
    hideCompleted,
    hideUndated,
    currentUser,
}: UseCardsFilteringProps) => {
    const filteredCards = useMemo(() => {
        const filtered = cards.filter((c: Card) => {
            if (c.archived) return false;
            const matchesOwnership = filter === 'all' ? true : c.owner === currentUser;
            if (!matchesOwnership) return false;

            if (hideEmptyCards) {
                const hasTasks = tasks.some((t: Task) =>
                    t.card === c.name &&
                    isDateInTimeFrame(t.dueDate, taskTimeFilter, hideUndated) &&
                    (!hideCompleted || !t.isDone)
                );
                return hasTasks;
            }
            return true;
        });

        const taskCountByCard = new Map<string, number>();
        for (const t of tasks) {
            if (t.owner === currentUser) {
                taskCountByCard.set(t.card, (taskCountByCard.get(t.card) ?? 0) + 1);
            }
        }

        return filtered.sort((a: Card, b: Card) => {
            // Primary: current user's cards first
            const aIsOwner = a.owner === currentUser ? 0 : 1;
            const bIsOwner = b.owner === currentUser ? 0 : 1;
            if (aIsOwner !== bIsOwner) return aIsOwner - bIsOwner;

            // Secondary: more of the current user's tasks first (raw count, filter-independent)
            const aCount = taskCountByCard.get(a.name) ?? 0;
            const bCount = taskCountByCard.get(b.name) ?? 0;
            return bCount - aCount;
        });
    }, [cards, tasks, filter, taskTimeFilter, hideEmptyCards, hideCompleted, hideUndated, currentUser]);

    const getCardTasks = (cardName: string) => {
        return tasks.filter((t: Task) =>
            t.card === cardName &&
            isDateInTimeFrame(t.dueDate, taskTimeFilter, hideUndated) &&
            t.owner === currentUser &&
            (!hideCompleted || !t.isDone)
        );
    };

    return {
        filteredCards,
        getCardTasks,
    };
};
