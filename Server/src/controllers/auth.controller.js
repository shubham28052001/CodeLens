import asyncHandler from "../utils/asyncHandler.js";
import { registerUser, loginUser } from "../services/auth.service.js";
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
