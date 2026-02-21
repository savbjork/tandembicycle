import { TaskId, HouseholdCardId, UserId } from '@shared/types/branded';

export type TaskType = 'one-off' | 'recurring' | 'checklist';

/**
 * Task domain model
 * Represents a private execution item within a Card
 */
export interface Task {
    id: TaskId;
    cardId: HouseholdCardId;
    ownerId: UserId;
    name: string;
    dueDate: Date | null;
    isDone: boolean;
    type: TaskType;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Create task data transfer object
 */
export interface CreateTaskDTO {
    cardId: HouseholdCardId;
    ownerId: UserId;
    name: string;
    dueDate?: Date;
    type?: TaskType;
    note?: string;
}

/**
 * Update task data transfer object
 */
export interface UpdateTaskDTO {
    name?: string;
    dueDate?: Date | null;
    isDone?: boolean;
    type?: TaskType;
    note?: string;
}
