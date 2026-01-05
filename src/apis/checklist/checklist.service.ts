import { DataSource, EntityManager } from "typeorm";
import { toChecklistResponse } from "./mapper/checklist.mapper";
import { IChecklistRepository } from "./repositories/checklist.repository.interface";
import { ChecklistResponse, CreateChecklistSchema, ReorderChecklistSchema, UpdateChecklistSchema } from "./schemas";
import { calculateNewPosition, POSITION_INCREMENT } from "@/common/utils/positionCalculator";

export default class ChecklistService {
    constructor(
        private readonly checklistRepository: IChecklistRepository,
        private dataSource: DataSource
    ) { }
    getChecklistsByCardId = async (cardId: string): Promise<ChecklistResponse[]> => {
        const checklists = await this.checklistRepository.getChecklistsByCardId(cardId);
        return checklists.map(toChecklistResponse);
    }
    createChecklist = async (cardId: string, data: CreateChecklistSchema): Promise<ChecklistResponse> => {
        let defaultPosition = POSITION_INCREMENT.toString();
        const currentChecklists = await this.checklistRepository.getChecklistsByCardId(cardId);
        if (currentChecklists.length > 0) {
            const lastChecklist = currentChecklists[currentChecklists.length - 1];
            if (lastChecklist) {
                defaultPosition = (Number(lastChecklist.position) + POSITION_INCREMENT).toString();
            }
        }
        const checklist = await this.checklistRepository.create({
            name: data.name,
            cardId,
            position: defaultPosition
        })
        return toChecklistResponse(checklist);
    }
    updateChecklist = async (checklistId: string, data: UpdateChecklistSchema): Promise<ChecklistResponse> => {
        const checklist = await this.checklistRepository.update(checklistId, data);
        return toChecklistResponse(checklist);
    }
    deleteChecklist = async (checklistId: string): Promise<void> => {
        await this.checklistRepository.delete(checklistId);
    }
    reorderChecklist = async (checklistId: string, data: ReorderChecklistSchema): Promise<ChecklistResponse[]> => {
        const checklistToMove = await this.checklistRepository.getChecklistById(checklistId);
        if (!checklistToMove) {
            throw new Error('Checklist to move not found');
        }
        const { beforeChecklistId, afterChecklistId } = data;
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            const beforeChecklist = beforeChecklistId ? await this.checklistRepository.getChecklistById(beforeChecklistId, manager) : null;
            const afterChecklist = afterChecklistId ? await this.checklistRepository.getChecklistById(afterChecklistId, manager) : null;
            const newPosition = calculateNewPosition(beforeChecklist?.position, afterChecklist?.position);
            await this.checklistRepository.update(checklistToMove.id, { position: newPosition }, manager);
            const updatedChecklists = await this.checklistRepository.getChecklistsByCardId(checklistToMove.cardId, manager);
            return updatedChecklists.map(toChecklistResponse);
        })
    }
    // copy checklist ==> need build checklist item module first
}