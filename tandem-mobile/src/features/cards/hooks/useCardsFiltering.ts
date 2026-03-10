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
        return cards.filter((c: Card) => {
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
