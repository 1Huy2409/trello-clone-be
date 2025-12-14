import { ConflictRequestError, NotFoundError } from "@/common/handler/error.response";
import { IListRepository } from "./repositories/list.repository.interface";
import { CopyListSchema, CreateListSchema, MoveListSchema, ReorderListSchema, UpdateListSchema } from "./schemas/list.request.schema";
import { ListResponse } from "./schemas/list.response.schema";
import { toListResponse } from "./mapper/list.mapper";
import { IBoardRepository } from "../board/repositories/board.repository.interface";
import { calculateNewPosition, POSITION_INCREMENT } from "@/common/utils/positionCalculator";
import { DataSource } from "typeorm";
import { ICardRepository } from "../card/repositories/card.repository.interface";

export default class ListService {
    constructor(
        private listRepository: IListRepository,
        private boardRepository: IBoardRepository,
        private cardRepository: ICardRepository,
        private dataSource: DataSource
    ) { }
    getAll = async (boardId: string): Promise<ListResponse[]> => {
        const lists = await this.listRepository.findListsByBoardId(boardId);
        return lists.map(toListResponse);
    }
    createList = async (data: CreateListSchema, boardId: string): Promise<ListResponse> => {
        let defaultPosition: string = POSITION_INCREMENT.toString();
        const currentLists = await this.listRepository.findListsSortedByPosition(boardId);
        if (currentLists.length > 0) {
            const lastList = currentLists[currentLists.length - 1];
            if (lastList) {
                defaultPosition = (Number(lastList.position) + POSITION_INCREMENT).toString();
            }
        }
        const newList = await this.listRepository.create({ ...data, boardId, position: defaultPosition });
        return toListResponse(newList);
    }
    editListName = async (listId: string, updateData: UpdateListSchema): Promise<ListResponse> => {
        const updateList = await this.listRepository.findById(listId);
        if (!updateList) {
            throw new NotFoundError(`List with ID ${listId} not found`);
        }
        const boardId = updateList?.boardId || '';
        if (updateData.title) {
            // validate list title exists?
            const existingList = await this.listRepository.findListByTitleAndBoardId(updateData.title, boardId);
            if (existingList && existingList.id !== listId) {
                console.error(`List with title ${updateData.title} already exists in board ${boardId}`);
                throw new ConflictRequestError(`List with title ${updateData.title} already exists in this board`);
            }
        }
        updateList.title = updateData.title ?? updateList.title;
        const updatedList = await this.listRepository.update(listId, updateList);
        return toListResponse(updatedList);
    }
    archiveList = async (listId: string): Promise<ListResponse> => {
        const archivedList = await this.listRepository.archive(listId);
        return toListResponse(archivedList);
    }
    reopenList = async (listId: string): Promise<ListResponse> => {
        const reopenList = await this.listRepository.reopen(listId);
        return toListResponse(reopenList);
    }
    // reorder, move, copy
    reorderList = async (data: ReorderListSchema): Promise<ListResponse> => {
        const { listId, beforeListId, afterListId } = data;
        return await this.dataSource.transaction(async (mananger) => {
            const reorderList = await this.listRepository.findById(listId, mananger);
            if (!reorderList) {
                throw new NotFoundError(`List with ID ${listId} not found`);
            }
            const beforeList = beforeListId ? await this.listRepository.findById(beforeListId, mananger) : null;
            const afterList = afterListId ? await this.listRepository.findById(afterListId, mananger) : null;
            const newPosition = calculateNewPosition(
                beforeList?.position ?? null,
                afterList?.position ?? null
            );
            reorderList.position = newPosition;
            const reorderedList = await this.listRepository.update(listId, reorderList);
            return toListResponse(reorderedList);
        });
    }
    moveList = async (data: MoveListSchema): Promise<ListResponse> => {
        const { listId, targetBoardId, beforeListId, afterListId } = data;
        return await this.dataSource.transaction(async (manager) => {
            const listToMove = await this.listRepository.findById(listId);
            if (!listToMove) {
                throw new NotFoundError(`List with ID ${listId} not found`);
            }
            const targetBoard = await this.boardRepository.findById(targetBoardId);
            if (!targetBoard) {
                throw new NotFoundError(`Target board with ID ${targetBoardId} not found`);
            }
            const beforeList = beforeListId ? await this.listRepository.findById(beforeListId) : null;
            const afterList = afterListId ? await this.listRepository.findById(afterListId) : null;
            const newPosition = calculateNewPosition(
                beforeList?.position ?? null,
                afterList?.position ?? null
            );
            listToMove.boardId = targetBoardId;
            listToMove.position = newPosition;
            const movedList = await this.listRepository.update(listId, listToMove);
            return toListResponse(movedList);
        })
    }
    copyList = async (data: CopyListSchema): Promise<ListResponse> => {
        let { listId, targetBoardId, title } = data;
        return await this.dataSource.transaction(async (manager) => {
            const listToCopy = await this.listRepository.findById(listId);
            if (!listToCopy) {
                throw new NotFoundError(`List with ID ${listId} not found`);
            }
            if (title === undefined) {
                title = `${listToCopy.title} Copy`;
            }
            // calculate position (between original list and next list)
            const allLists = await this.listRepository.findListsSortedByPosition(listToCopy.boardId, manager);
            const currentIndex = allLists.findIndex(list => list.id === listId);
            const beforeList = allLists[currentIndex];
            const afterList = allLists[currentIndex + 1] || null;
            const newPosition = calculateNewPosition(
                beforeList?.position ?? null,
                afterList?.position ?? null
            );
            const copiedList = await this.listRepository.create({
                title,
                boardId: targetBoardId ? targetBoardId : listToCopy.boardId,
                position: newPosition
            }, manager);
            // copy cards from original list to new list
            const cardsToCopy = listToCopy.cards;
            for (const card of cardsToCopy) {
                const { id, ...cardData } = card;
                await this.cardRepository.create({
                    ...cardData,
                    listId: copiedList.id
                }, manager);
            }
            return toListResponse(copiedList);
        })
    }
}