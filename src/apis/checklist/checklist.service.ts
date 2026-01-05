import { DataSource, EntityManager } from "typeorm";
import { toChecklistResponse } from "./mapper/checklist.mapper";
import { IChecklistRepository } from "./repositories/checklist.repository.interface";
import { ChecklistResponse, CopyChecklistSchema, CreateChecklistSchema, ReorderChecklistSchema, UpdateChecklistSchema } from "./schemas";
import { calculateNewPosition, POSITION_INCREMENT } from "@/common/utils/positionCalculator";
import { ICardRepository } from "../card/repositories/card.repository.interface";
import { IChecklistItemRepository } from "../checklist-item/repositories/checklist-item.repository.interface";

export default class ChecklistService {
    constructor(
        private readonly checklistRepository: IChecklistRepository,
        private readonly cardRepository: ICardRepository,
        private readonly checklistItemRepository: IChecklistItemRepository,
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
    copyChecklist = async (checklistId: string, copyData: CopyChecklistSchema): Promise<ChecklistResponse> => {
        const checklistToCopy = await this.checklistRepository.getChecklistById(checklistId);
        if (!checklistToCopy) {
            throw new Error('Checklist to copy not found');
        }

        const targetCard = await this.cardRepository.getActiveCardById(copyData.cardId);
        if (!targetCard) {
            throw new Error('Target card not found');
        }

        const sourceCard = await this.cardRepository.getActiveCardById(checklistToCopy.cardId);
        if (!sourceCard) {
            throw new Error('Source card not found');
        }

        if (sourceCard.boardId !== targetCard.boardId) {
            throw new Error('Cannot copy checklist to a card in a different board');
        }

        return await this.dataSource.transaction(async (manager: EntityManager) => {
            const currentChecklists = await this.checklistRepository.getChecklistsByCardId(targetCard.id, manager);
            let defaultPosition = POSITION_INCREMENT.toString();
            if (currentChecklists.length > 0) {
                const lastChecklist = currentChecklists[currentChecklists.length - 1];
                if (lastChecklist) {
                    defaultPosition = (Number(lastChecklist.position) + POSITION_INCREMENT).toString();
                }
            }

            const newChecklistName = copyData.name ? copyData.name : `${checklistToCopy.name} - Copy`;
            const copiedChecklist = await this.checklistRepository.create({
                name: newChecklistName,
                cardId: targetCard.id,
                position: defaultPosition
            }, manager);

            const items = await this.checklistItemRepository.findAll(checklistId, manager);
            if (items && items.length > 0) {
                for (const item of items) {
                    await this.checklistItemRepository.create({
                        content: item.content,
                        isCompleted: item.isCompleted,
                        position: item.position,
                        checklistId: copiedChecklist.id
                    }, manager);
                }
            }
            return toChecklistResponse(copiedChecklist);
        });
    }
}