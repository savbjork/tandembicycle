import { DropZoneItemId, HouseholdCardId, UserId } from '@shared/types/branded';

export type DropZoneItemStatus = 'pending' | 'converted' | 'dismissed';

/**
 * DropZoneItem domain model
 * Represents an item dropped into a partner's card
 */
export interface DropZoneItem {
    id: DropZoneItemId;
    cardId: HouseholdCardId;
    senderId: UserId;
    receiverId: UserId;
    content: string;
    status: DropZoneItemStatus;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Create drop zone item data transfer object
 */
export interface CreateDropZoneItemDTO {
    cardId: HouseholdCardId;
    senderId: UserId;
    receiverId: UserId;
    content: string;
}
