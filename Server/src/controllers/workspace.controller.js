import asyncHandler from "../utils/asyncHandler.js";
import {createWorkspaceService,getAllworkspaceService,getbyIdworkspaceService} from "../services/workspace.service.js"
import { successResponse } from "../utils/response.js";
import { BadRequestError } from "../utils/errors.js";

export const createWorkspace=asyncHandler(async (req,res)=>{
  const {name}=req.body;
  if(!name || !name.trim()){
    throw new BadRequestError("Workspace name is required");
  }
  const workspace= await createWorkspaceService(
    name,
    req.userId
  );
  return successResponse(
    res,
    201,
    "Workspace created successfully",
    { workspace }
  )
});

export const getAllWorkSpaces=asyncHandler(async (req,res)=>{
  const workspaces=await getAllworkspaceService(req.userId);
  return successResponse(
    res,
    200,
    "Workspaces fetched successfully",
    { workspaces }
  )
});


export const getbyIdWorkSpaces=asyncHandler(async (req,res)=>{
  const { id } = req.params;
  const workspace = await getbyIdworkspaceService(id, req.userId);
  return successResponse(
    res,
    200,
    "Workspace fetched successfully",
    { workspace }
  );
});
