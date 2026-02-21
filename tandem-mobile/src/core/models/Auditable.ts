import { AuditableId, TaskId, UserId } from '@shared/types/branded';

export type AuditableStatus = 'pending' | 'accepted' | 'declined';

/**
 * Auditable domain model
 * Represents a request for a partner to take over a specific task
 */
export interface Auditable {
    id: AuditableId;
    taskId: TaskId;
    senderId: UserId;
    receiverId: UserId;
    message: string;
    status: AuditableStatus;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Create auditable request data transfer object
 */
export interface CreateAuditableDTO {
    taskId: TaskId;
    senderId: UserId;
    receiverId: UserId;
    message: string;
}
