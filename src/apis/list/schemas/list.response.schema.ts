import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod";

extendZodWithOpenApi(z);

export const ListResponseSchema = z.object({
    id: z.uuid().openapi({ description: 'Unique identifier for the list', example: '123e4567-e89b-12d3-a456-426614174000' }),
    title: z.string().min(1).max(255).openapi({ description: 'Title of the list', example: 'To Do' }),
    position: z.string().openapi({ description: 'Position of the list', example: 1 }),
    isArchived: z.boolean().openapi({ description: 'Whether the list is archived', example: false }),
    boardId: z.uuid().openapi({ description: 'ID of the board the list belongs to', example: '123e4567-e89b-12d3-a456-426614174000' }),
})
export type ListResponseSchema = z.infer<typeof ListResponseSchema>;
export type ListResponse = z.infer<typeof ListResponseSchema>;