import { DropZoneItemId, UserId } from '@shared/types/branded';

export type DropZoneItemStatus = 'pending' | 'converted' | 'dismissed' | 'archived';

/**
 * DropZoneItem domain model
 * Represents an item dropped into a partner's inbox
 */
export interface DropZoneItem {
    id: DropZoneItemId;
    senderId: UserId;
    receiverId: UserId;
    content: string;
    status: DropZoneItemStatus;
    createdAt: Date;
}

/**
 * Create drop zone item data transfer object
 */
export interface CreateDropZoneItemDTO {
    senderId: UserId;
    receiverId: UserId;
    content: string;
}
