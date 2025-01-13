import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";

interface IRequest extends Request {
    user?: any;
}

export const verifyJWT = asyncHandler(async (req: IRequest, _, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "You are not authorized to access this route");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
}) 