import prisma from "../lib/prisma.js"
import { ConflictError,NotFoundError } from "../utils/errors.js";


export const createWorkspaceService = async (name, userId) => {
    const existingWorkspace = await prisma.workspace.findFirst({
        where: {
            name,
            userId
        },
    });

    if (existingWorkspace) {
        throw new ConflictError(
            "Workspace with this name already exists"
        );
    }

    const workspace = await prisma.workspace.create({
        data: {
            name,
            userId
        }
    });
    return workspace;
};

export const getAllworkspaceService= async(userId)=>{
    const workspaces=await prisma.workspace.findMany({
        where:{
            userId,
        },
        orderBy:{
            createdAt:"desc"
        }
    });
    return workspaces;
}

export const getbyIdworkspaceService= async(id,userId)=>{
    const workspace=await prisma.workspace.findFirst({
        where:{
            id,
            userId
        }
    })
    if(!workspace){
        throw new NotFoundError("Workspace not found");
    }
    return workspace;
}