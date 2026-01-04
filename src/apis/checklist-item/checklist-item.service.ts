import { DataSource, EntityManager } from "typeorm";
import { BadRequestError, NotFoundError } from "@/common/handler/error.response";
import { toChecklistItemResponse } from "./mapper/checklist-item.mapper";
import { IChecklistItemRepository } from "./repositories/checklist-item.repository.interface";
import { ChecklistItemResponse, CreateChecklistItemSchema, ReorderChecklistItemSchema, UpdateContentChecklistItemSchema } from "./schemas";
import { calculateNewPosition, POSITION_INCREMENT } from "@/common/utils/positionCalculator";

export default class ChecklistItemService {
    constructor(
        private readonly checlistItemRepository: IChecklistItemRepository,
        private dataSource: DataSource
    ) { }
    getAllChecklistItems = async (checklistId: string): Promise<ChecklistItemResponse[]> => {
        const checklistItems = await this.checlistItemRepository.findAll(checklistId);
        return checklistItems.map(item => toChecklistItemResponse(item));
    }
    getChecklistItemById = async (id: string): Promise<ChecklistItemResponse | null> => {
        const checklistItem = await this.checlistItemRepository.findById(id);
        if (!checklistItem) {
            throw new NotFoundError('ChecklistItem not found');
        }
        return toChecklistItemResponse(checklistItem);
    }
    createChecklistItem = async (checklistId: string, data: CreateChecklistItemSchema): Promise<ChecklistItemResponse> => {
        let defaultPosition = POSITION_INCREMENT.toString();
        const existingItems = await this.checlistItemRepository.findAll(checklistId);
        if (existingItems.length > 0) {
            const lastItem = existingItems[existingItems.length - 1];
            if (lastItem) {
                defaultPosition = (Number(lastItem.position) + POSITION_INCREMENT).toString();
            }
        }
        const checklistItem = await this.checlistItemRepository.create({ ...data, checklistId, position: defaultPosition });
        return toChecklistItemResponse(checklistItem);
    }
    renameChecklistItem = async (itemId: string, data: UpdateContentChecklistItemSchema): Promise<ChecklistItemResponse> => {
        const { content } = data
        if (!content) {
            throw new BadRequestError('Content is required to update checklist item');
        }
        return await this.checlistItemRepository.update(itemId, { content })
    }
    updateChecklistItemStatus = async (itemId: string, isCompleted: boolean): Promise<ChecklistItemResponse> => {
        return await this.checlistItemRepository.update(itemId, { isCompleted });
    }
    deleteChecklistItem = async (itemId: string): Promise<void> => {
        return await this.checlistItemRepository.delete(itemId);
    }
    reorderChecklistItem = async (itemId: string, data: ReorderChecklistItemSchema): Promise<ChecklistItemResponse[]> => {
        const itemToMove = await this.checlistItemRepository.findById(itemId);
        if (!itemToMove) {
            throw new NotFoundError('Checklist item not found');
        }
        const { beforeItemId, afterItemId } = data;
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            const beforeItem = beforeItemId ? await this.checlistItemRepository.findById(beforeItemId, manager) : null;
            const afterItem = afterItemId ? await this.checlistItemRepository.findById(afterItemId, manager) : null;
            const newPosition = calculateNewPosition(beforeItem?.position, afterItem?.position);

            await this.checlistItemRepository.update(itemId, { position: newPosition }, manager);
            const allItems = await this.checlistItemRepository.findAll(itemToMove.checklistId, manager);
            return allItems.map(toChecklistItemResponse);
        })
    }
}