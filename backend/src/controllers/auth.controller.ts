import { asyncHandler } from "../utils/asyncHandler";
import { Response } from "express";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";
import { Request } from "express";
import { Types } from 'mongoose';

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

// Define the Multer File type
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

// Extend the Express Request interface to include Multer files
interface MulterRequest extends Request {
    files?: Record<string, Express.Multer.File[]>; // Use Express.Multer.File[] for compatibility
}

const registerUser = asyncHandler(async (req: MulterRequest, res: Response) => {
    const { fullName, username, email, password } = req.body;

    // Validate input fields
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user exists
    const userExists = await User.isUserExists(username, email);
    if (userExists) {
        throw new ApiError(400, "User already exists");
    }

    // Access files from request
    const profileImageLocalPath = req.files?.profileImage?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

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

const logoutUser = asyncHandler(async (req: Request, res: Response) => {

});

const refreshToken = asyncHandler(async (req: Request, res: Response) => { });

const changeCurrentPassword = asyncHandler(async (req: Request, res: Response) => { });

export { registerUser, loginUser, logoutUser, refreshToken, changeCurrentPassword };