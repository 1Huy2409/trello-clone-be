import { ChecklistItem } from "@/common/entities/checklist-item.entity";

export const toChecklistItemResponse = (checklistItem: ChecklistItem) => {
    return {
        id: checklistItem.id,
        content: checklistItem.content,
        isCompleted: checklistItem.isCompleted,
        position: checklistItem.position,
        checklistId: checklistItem.checklistId,
    }
}