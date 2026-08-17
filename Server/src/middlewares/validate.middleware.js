import { validationResult } from "express-validator";
import { BadRequestError } from "../utils/errors.js";

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(
            new BadRequestError(
                errors.array().map((error) => error.msg).join(", ")
            )
        );
    }

    next();
};