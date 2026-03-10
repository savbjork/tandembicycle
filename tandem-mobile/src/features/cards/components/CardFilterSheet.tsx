import React from 'react';
import { View } from 'react-native';
import { Text, Button, BottomSheet, Checkbox, FieldLabel, ChipGroup, ChipOption } from '@shared/components/ui';
import { type TaskTimeFilter } from '@shared/utils/date';

type CardsFilter = 'all' | 'me';

interface CardFilterSheetProps {
    visible: boolean;
    onClose: () => void;
    taskTimeFilter: TaskTimeFilter;
    onTaskTimeFilterChange: (v: TaskTimeFilter) => void;
    hideCompleted: boolean;
    onHideCompletedChange: (v: boolean) => void;
    hideUndated: boolean;
    onHideUndatedChange: (v: boolean) => void;
    // Cards-only options
    filter?: CardsFilter;
    onFilterChange?: (v: CardsFilter) => void;
    hideEmptyCards?: boolean;
    onHideEmptyCardsChange?: (v: boolean) => void;
    showHiddenTimeOption?: boolean;
}

export const CardFilterSheet: React.FC<CardFilterSheetProps> = ({
    visible,
    onClose,
    filter,
    onFilterChange,
    taskTimeFilter,
    onTaskTimeFilterChange,
    hideCompleted,
    onHideCompletedChange,
    hideUndated,
    onHideUndatedChange,
    hideEmptyCards,
    onHideEmptyCardsChange,
    showHiddenTimeOption = true,
}) => {
    const ownershipOptions: ChipOption<CardsFilter>[] = [
        { key: 'all', label: 'Everyone' },
        { key: 'me', label: 'Just Me' },
    ];

    const allTimeFilterOptions: ChipOption<TaskTimeFilter>[] = [
        { key: 'hidden', label: 'None' },
        { key: 'thisWeek', label: 'This Week' },
        { key: 'next7', label: 'Next 7 Days' },
        { key: 'next30', label: 'Next 30 Days' },
        { key: 'thisYear', label: 'This Year' },
        { key: 'all', label: 'All' },
    ];

    const timeFilterOptions = showHiddenTimeOption
        ? allTimeFilterOptions
        : allTimeFilterOptions.filter(o => o.key !== 'hidden');

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            containerStyle={{ minHeight: undefined }}
        >

            {filter !== undefined && onFilterChange && (
                <>
                    <FieldLabel>Ownership</FieldLabel>
                    <ChipGroup
                        options={ownershipOptions}
                        value={filter}
                        onChange={onFilterChange}
                        className="mb-8"
                    />
                </>
            )}

            <FieldLabel>Due Date</FieldLabel>
            <ChipGroup
                options={timeFilterOptions}
                value={taskTimeFilter}
                onChange={(v) => onTaskTimeFilterChange(v as TaskTimeFilter)}
                scrollable
                className="mb-8"
            />

            <View className="mb-8">
                <Checkbox
                    label="Hide completed tasks"
                    checked={hideCompleted}
                    onPress={() => onHideCompletedChange(!hideCompleted)}
                    className="mb-4"
                />

                <Checkbox
                    label="Hide tasks without a due date"
                    checked={hideUndated}
                    onPress={() => onHideUndatedChange(!hideUndated)}
                    className={hideEmptyCards !== undefined ? 'mb-4' : ''}
                />

                {hideEmptyCards !== undefined && onHideEmptyCardsChange && (
                    <Checkbox
                        label="Hide cards without tasks"
                        checked={hideEmptyCards}
                        onPress={() => onHideEmptyCardsChange(!hideEmptyCards)}
                    />
                )}
            </View>

            <Button
                title="Done"
                onPress={onClose}
                variant="primary"
                className="mt-4"
            />
        </BottomSheet>
    );
};
