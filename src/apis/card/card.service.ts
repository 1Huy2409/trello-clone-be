import { toCardResponse } from './mapper/card.mapper';
import { CardResponse, CardResponseSchema } from './schemas/card/card.response.schema';
import { IListRepository } from '../list/repositories/list.repository.interface';
import { ICardRepository } from './repositories/card.repository.interface';
import { CopyCardSchema, CreateCardSchema, MoveCardSchema, ReorderCardSchema, UpdateCardSchema } from './schemas/card/card.request.schema';
import { NotFoundError } from '@/common/handler/error.response';
import { DataSource, EntityManager } from 'typeorm';
import { calculateNewPosition, POSITION_INCREMENT } from '@/common/utils/positionCalculator';
import { IBoardRepository } from '../board/repositories/board.repository.interface';
import { CardMemberResponse } from './schemas/card-member/card-member.response.schema';
import { IUserRepository } from '../user/repositories/user.repository.interface';
import { ICardMemberRepository } from './repositories/card-member.repository.interface';
import { IBoardMemberRepository } from '../board/repositories/board-member.repository.interface';
import { toCardMemberResponse } from './mapper/card-member.mapper';
export default class CardService {
    constructor(
        private cardRepository: ICardRepository,
        private listRepository: IListRepository,
        private boardRepository: IBoardRepository,
        private userRepository: IUserRepository,
        private boardMemberRepository: IBoardMemberRepository,
        private cardMemberRepository: ICardMemberRepository,
        private dataSource: DataSource
    ) { }

    createCard = async (data: CreateCardSchema, listId: string) => {
        const list = await this.listRepository.findById(listId);
        if (!list) {
            throw new NotFoundError(`List with ID ${listId} not found`);
        }
        let defaultPosition: string = POSITION_INCREMENT.toString();
        const currentCards = await this.cardRepository.getCardsByListId(listId);
        if (currentCards.length > 0) {
            const lastCard = currentCards[currentCards.length - 1];
            if (lastCard) {
                defaultPosition = (Number(lastCard.position) + POSITION_INCREMENT).toString();
            }
        }
        const payload = {
            title: data.title,
            ...(data.description !== undefined && { description: data.description }),
            ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
            ...(data.priority !== undefined && { priority: data.priority }),
            ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
            position: defaultPosition,
            listId,
            boardId: list.boardId,
        };

        return this.cardRepository.create({ ...payload });
    };
    getCardsByListId = async (listId: string): Promise<CardResponse[]> => {
        const cards = await this.cardRepository.getCardsByListId(listId);
        return cards.map(card => toCardResponse(card));
    }
    updateCard = async (id: string, data: UpdateCardSchema): Promise<CardResponse> => {
        const updateCard = await this.cardRepository.getActiveCardById(id);
        if (!updateCard) {
            throw new NotFoundError(`Card with ID ${id} not found`);
        }
        const payload = {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
            ...(data.priority !== undefined && { priority: data.priority }),
            ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
        };
        const updatedCard = await this.cardRepository.update(id, payload);
        return toCardResponse(updatedCard);
    }
    archiveCard = async (id: string): Promise<CardResponse> => {
        const archivedCard = await this.cardRepository.getActiveCardById(id);
        if (!archivedCard) {
            throw new NotFoundError(`Card with ID ${id} not found`);
        }
        archivedCard.isArchived = true;
        const updatedCard = await this.cardRepository.update(id, archivedCard);
        return toCardResponse(updatedCard);
    }
    reopenCard = async (id: string): Promise<CardResponse> => {
        const reopenedCard = await this.cardRepository.getCardById(id);
        if (!reopenedCard) {
            throw new NotFoundError(`Card with ID ${id} not found`);
        }
        reopenedCard.isArchived = false;
        const updatedCard = await this.cardRepository.update(id, reopenedCard);
        return toCardResponse(updatedCard);
    }

    // advanced operations
    moveCard = async (moveData: MoveCardSchema): Promise<CardResponse> => {
        const { cardId, targetBoardId, targetListId, beforeCardId, afterCardId } = moveData;
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            const cardToMove = await this.cardRepository.getActiveCardById(cardId);
            if (!cardToMove) {
                throw new NotFoundError(`Card with ID ${cardId} not found`);
            }
            const targetBoard = await this.boardRepository.findById(targetBoardId);
            if (!targetBoard) {
                throw new NotFoundError(`Target board with ID ${targetBoardId} not found`);
            }
            const targetList = await this.listRepository.findById(targetListId);
            if (!targetList) {
                throw new NotFoundError(`Target list with ID ${targetListId} not found`);
            }
            const beforeCard = beforeCardId ? await this.cardRepository.getActiveCardById(beforeCardId) : null;
            const afterCard = afterCardId ? await this.cardRepository.getActiveCardById(afterCardId) : null;
            const newPosition = calculateNewPosition(
                beforeCard?.position ?? null,
                afterCard?.position ?? null
            );
            cardToMove.boardId = targetBoardId;
            cardToMove.listId = targetListId;
            cardToMove.position = newPosition;
            const movedCard = await this.cardRepository.update(cardId, cardToMove, manager);
            return toCardResponse(movedCard);
        })
    }
    copyCard = async (copyData: CopyCardSchema): Promise<CardResponse> => {
        const { cardId, title, targetBoardId, targetListId, beforeCardId, afterCardId } = copyData;
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            const cardToCopy = await this.cardRepository.getActiveCardById(cardId);
            if (!cardToCopy) {
                throw new NotFoundError(`Card with ID ${cardId} not found`);
            }
            const targetBoard = await this.boardRepository.findById(targetBoardId);
            if (!targetBoard) {
                throw new NotFoundError(`Target board with ID ${targetBoardId} not found`);
            }
            const targetList = await this.listRepository.findById(targetListId);
            if (!targetList) {
                throw new NotFoundError(`Target list with ID ${targetListId} not found`);
            }
            const beforeCard = beforeCardId ? await this.cardRepository.getActiveCardById(beforeCardId) : null;
            const afterCard = afterCardId ? await this.cardRepository.getActiveCardById(afterCardId) : null;
            const newPosition = calculateNewPosition(
                beforeCard?.position ?? null,
                afterCard?.position ?? null
            );
            const newCardTitle = title ? title : `${cardToCopy.title} - Copy`;
            const copiedCard = await this.cardRepository.create({
                ...cardToCopy,
                listId: targetListId,
                boardId: targetBoardId,
                title: newCardTitle,
                position: newPosition,
            }, manager);
            return toCardResponse(copiedCard);
        })
    }
    reorderCard = async (reorderData: ReorderCardSchema): Promise<CardResponse> => {
        const { cardId, targetListId, beforeCardId, afterCardId } = reorderData;
        return await this.dataSource.transaction(async (manager: EntityManager) => {
            const cardToReorder = await this.cardRepository.getActiveCardById(cardId);
            if (!cardToReorder) {
                throw new NotFoundError(`Card with ID ${cardId} not found`);
            }
            const targetList = await this.listRepository.findById(targetListId);
            if (!targetList) {
                throw new NotFoundError(`Target list with ID ${targetListId} not found`);
            }
            const beforeCard = beforeCardId ? await this.cardRepository.getActiveCardById(beforeCardId) : null;
            const afterCard = afterCardId ? await this.cardRepository.getActiveCardById(afterCardId) : null;
            const newPosition = calculateNewPosition(
                beforeCard?.position ?? null,
                afterCard?.position ?? null
            );
            cardToReorder.listId = targetListId;
            cardToReorder.position = newPosition;
            const reorderedCard = await this.cardRepository.update(cardId, cardToReorder, manager);
            return toCardResponse(reorderedCard);
        })
    }

    assignMemberToCard = async (cardId: string, memberId: string): Promise<CardMemberResponse> => {
        const card = await this.cardRepository.getActiveCardById(cardId);
        if (!card) {
            throw new NotFoundError(`Card with ID ${cardId} not found`);
        }
        const user = await this.userRepository.findById(memberId);
        if (!user) {
            throw new NotFoundError(`User with ID ${memberId} not found`);
        }
        const boardMember = await this.boardMemberRepository.findByBoardAndUserId(card.boardId, memberId);
        if (!boardMember) {
            throw new NotFoundError(`User with ID ${memberId} is not a member of the board`);
        }
        const existingCardMember = await this.cardMemberRepository.findByCardAndMemberId(cardId, memberId);
        if (existingCardMember) {
            return toCardMemberResponse(existingCardMember);
        }
        const cardMember = await this.cardMemberRepository.addCardMember(cardId, memberId);
        return toCardMemberResponse(cardMember);
    }

    removeMemberFromCard = async (cardId: string, memberId: string): Promise<void> => {
        const card = await this.cardRepository.getActiveCardById(cardId);
        if (!card) {
            throw new NotFoundError(`Card with ID ${cardId} not found`);
        }
        const cardMember = await this.cardMemberRepository.findByCardAndMemberId(cardId, memberId);
        if (!cardMember) {
            throw new NotFoundError(`Card member with Card ID ${cardId} and Member ID ${memberId} not found`);
        }
        await this.cardMemberRepository.removeCardMember(cardMember.id);
    }

    getCardMembers = async (cardId: string): Promise<CardMemberResponse[]> => {
        const cardMembers = await this.cardMemberRepository.findAllCardMembersByCardId(cardId);
        return cardMembers.map(member => toCardMemberResponse(member));
    }
}