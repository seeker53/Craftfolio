import { asyncHandler } from "../utils/asyncHandler";
import { Response, Request } from "express";
import { ApiError } from "../utils/ApiError";
import { User, IUser } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";
import { Types } from 'mongoose';
import jwt from "jsonwebtoken";

interface IRequest extends Request {
    user?: IUser; // User is optional to prevent errors in unauthenticated routes
    files?: Record<string, Express.Multer.File[]>;
}
const generateTokens = async (userId: Types.ObjectId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
};


const registerUser = asyncHandler(async (req: IRequest, res: Response) => {
    const { fullName, username, email, password } = req.body;

    // Validate input fields
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
        throw new ApiError(400, "User already exists");
    }

    // Access files from request
    const profileImageLocalPath = req.files?.profileImage?.[0]?.filename
        ? `public/uploads/${req.files.profileImage[0].filename}`
        : null;

    const coverImageLocalPath = req.files?.coverImage?.[0]?.filename
        ? `public/uploads/${req.files.coverImage[0].filename}`
        : null;
    // console.log("Profile Image Path:", profileImageLocalPath); // Debugging
    // Ensure profile image is required
    if (!profileImageLocalPath) {
        throw new ApiError(400, "Profile image is required");
    }


    // Upload images to Cloudinary
    const profileImage = await uploadOnCloudinary(profileImageLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    // Create user in database
    const user = await User.create({
        fullName,
        profileImage: profileImage.url,
        coverImage: coverImage?.url || "",
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
    });

    // Fetch the created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user, Please try again");
    }

    // Return success response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    // Get user credentials from request body
    const { email, username, password } = req.body;

    // Validate input fields
    if ([email || username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user exists
    const user = await User.findOne({
        $or: [{ username }, { email }],
    }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials");
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokens(user._id as Types.ObjectId);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, loggedInUser, "User logged in successfully")
        );

});

const logoutUser = asyncHandler(async (req: IRequest, res: Response) => {
    console.log("Received Logout Request from User:", req.user); // Debugging

    if (!req.user) {
        throw new ApiError(401, "Unauthorized: No user found in request");
    }

    // Remove refreshToken from database
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    console.log("User refreshToken removed from DB");

    // Clear cookies
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "strict" });
    res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "strict" });

    return res.status(200).json({ success: true, message: "User logged out successfully" });
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }
    if (user?.refreshToken !== refreshToken) {
        throw new ApiError(401, "Refresh token is expired or invalid");
    }
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id as Types.ObjectId);
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));
});

const changeCurrentPassword = asyncHandler(async (req: IRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Both current and new password are required");
    }
    if (currentPassword === newPassword) {
        throw new ApiError(400, "New password should be different from the current password");
    }
    const user = await User.findById(req.user?._id).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isValidPassword = await user.isPasswordCorrect(currentPassword);
    if (!isValidPassword) {
        throw new ApiError(400, "Invalid current password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword };