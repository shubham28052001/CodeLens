import asyncHandler from "../utils/asyncHandler.js";
import { registerUser, loginUser,getCurrentUser } from "../services/auth.service.js";
import { successResponse } from "../utils/response.js";

export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    return successResponse(
        res,
        201,
        "User Registered Successfully",
        user
    );
});


export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await loginUser(email, password);
    return successResponse(
        res,
        200,
        "Login successfull",
        user
    );
});

export const getMe = asyncHandler(async (req, res) => {
  const user= await getCurrentUser(req.userId);

  return successResponse(
    res,
    200,
    "User fetched successfully",
    user
  );
})

