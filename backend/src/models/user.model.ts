import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the User schema
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        profileImage: {
            type: String, // Cloudinary URL for profile image
            required: true,
        },
        coverImage: {
            type: String, // Cloudinary URL for cover image
        },
        dob: {
            type: Date, // Date of birth
        },
        emailVisible: {
            type: Boolean, // Indicates if email should be visible
            default: true,
        },
        portfolioVisible: {
            type: Boolean, // Indicates if portfolio links should be visible
            default: true,
        },
        portfolio: [
            {
                type: Schema.Types.ObjectId, // Reference to Portfolio model
                ref: "Portfolio",
            },
        ],
        blogs: [
            {
                type: Schema.Types.ObjectId, // Reference to Blog model
                ref: "Blog",
            },
        ],
        linkedPlatforms: {
            github: { type: String, trim: true }, // GitHub username
            leetcode: { type: String, trim: true }, // LeetCode username
            codeforces: { type: String, trim: true },
            codechef: { type: String, trim: true },
            atcoder: { type: String, trim: true },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Verify if the password is correct
userSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

// Generate an access token
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            fullName: this.fullName,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generate a refresh token
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
