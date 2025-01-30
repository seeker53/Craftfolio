import { asyncHandler } from "../utils/asyncHandler";
import { Response, Request } from "express";
import { ApiError } from "../utils/ApiError";
import { User, IUser } from "../models/user.model";
import { uploadOnCloudinary, getPublicIdFromUrl, deleteFromCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken";

interface IRequest extends Request {
    user?: IUser;
    files?: Record<string, Express.Multer.File[]>;
}

const getUserInfo = asyncHandler(async (req: IRequest, res: Response) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    if (!accessToken) {
        throw new ApiError(401, "You dont have accessToken to access this route");
    }
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as { _id: string };
    if (!decodedToken) {
        throw new ApiError(401, "Your accessToken is invalid");
    }
    const user = await User.findById(decodedToken._id).select("-password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (refreshToken !== user.refreshToken) {
        throw new ApiError(401, "Your refreshToken is invalid");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User data fetched successfully"));

})


const updateUserProfile = asyncHandler(async (req: IRequest, res: Response) => {
    const userId = req.user.id; // `verifyJWT` middleware adds `user` object to `req`
    const { fullName, username, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if username or email already exists (excluding current user)
    if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) throw new ApiError(400, "Username already taken");
    }
    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) throw new ApiError(400, "Email already registered");
    }

    // Handle image uploads
    let profileImageUrl = user.profileImage;
    let coverImageUrl = user.coverImage;

    const profileImagePath = req.files?.profileImage?.[0]?.filename
        ? `public/uploads/${req.files.profileImage[0].filename}`
        : null;

    const coverImagePath = req.files?.coverImage?.[0]?.filename
        ? `public/uploads/${req.files.coverImage[0].filename}`
        : null;

    // Upload new profile image if provided
    if (profileImagePath) {
        const uploadedProfileImage = await uploadOnCloudinary(profileImagePath);
        if (uploadedProfileImage) {
            // Delete old image from Cloudinary
            if (user.profileImage) {
                const oldPublicId = getPublicIdFromUrl(user.profileImage);
                if (oldPublicId) await deleteFromCloudinary(oldPublicId);
            }
            profileImageUrl = uploadedProfileImage.url;
        }
    }

    // Upload new cover image if provided
    if (coverImagePath) {
        const uploadedCoverImage = await uploadOnCloudinary(coverImagePath);
        if (uploadedCoverImage) {
            if (user.coverImage) {
                const oldPublicId = getPublicIdFromUrl(user.coverImage);
                if (oldPublicId) await deleteFromCloudinary(oldPublicId);
            }
            coverImageUrl = uploadedCoverImage.url;
        }
    }


    // Update user details
    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.profileImage = profileImageUrl;
    user.coverImage = coverImageUrl;

    await user.save();

    const updatedUser = await User.findById(userId).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

export { getUserInfo, updateUserProfile };