import { Checklist } from "@/common/entities/checklist.entity";
import { ChecklistResponse } from "../schemas/checklist.response.schema";

export const toChecklistResponse = (checklist: Checklist): ChecklistResponse => {
    return {
        id: checklist.id,
        name: checklist.name,
        cardId: checklist.cardId,
        position: Number(checklist.position),
    }
}