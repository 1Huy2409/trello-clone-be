import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { WorkspaceStatus } from '@/common/entities/workspace.entity';
extendZodWithOpenApi(z);

export const WorkspaceResponseSchema = z.object({
    id: z.uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    title: z.string().min(1).max(100).openapi({ example: 'My Workspace' }),
    description: z.string().max(500).optional().openapi({ example: 'This is my workspace description.' }),
    visibility: z.boolean().openapi({ example: true }),
    status: z.enum(WorkspaceStatus).openapi({ example: WorkspaceStatus.ACTIVE }),
    ownerName: z.string().openapi({ example: 'John Doe' }),
    created_at: z.date(),
    updated_at: z.date()
})

export const ListWorkspaceResponseSchema = z.array(WorkspaceResponseSchema);
export type ListWorkspaceResponse = z.infer<typeof ListWorkspaceResponseSchema>;
export type WorkspaceResponse = z.infer<typeof WorkspaceResponseSchema>;
