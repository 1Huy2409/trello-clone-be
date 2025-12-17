import { Workspace } from "@/common/entities/workspace.entity";
import { WorkspaceResponse } from "../schemas";
import { toWorkspaceMemberResponse } from "./workspace-member.mapper";
import { toBoardResponse } from "@/apis/board/mapper/board.mapper";

export const toWorkspaceResponse = (workspace: Workspace): WorkspaceResponse => ({
    id: workspace.id,
    title: workspace.title,
    description: workspace.description,
    visibility: workspace.visibility,
    status: workspace.status,
    ownerName: workspace.owner?.fullname,
    boards: workspace.boards?.map(board => toBoardResponse(board)),
    workspaceMembers: workspace.workspaceMembers?.map(member => toWorkspaceMemberResponse(member)),
    created_at: workspace.created_at,
    updated_at: workspace.updated_at,
})