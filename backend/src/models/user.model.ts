import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface LinkedPlatforms {
    github?: string;
    leetcode?: string;
    codeforces?: string;
    codechef?: string;
    atcoder?: string;
}

interface IUser extends Document {
    username: string;
    email: string;
    fullName: string;
    profileImage: string;
    coverImage?: string;
    dob?: Date;
    emailVisible: boolean;
    portfolioVisible: boolean;
    portfolio: mongoose.Types.ObjectId[];
    blogs: mongoose.Types.ObjectId[];
    linkedPlatforms: LinkedPlatforms;
    password: string;
    refreshToken?: string;

    // Instance Methods
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): Promise<string>;
    generateRefreshToken(): Promise<string>;
}

// Add static methods interface
interface IUserModel extends Model<IUser> {
    getPublicUserData(userId: string): Promise<IUser | null>;
    isUserExists(usernameOrEmail: string): Promise<IUser | null>;
}

// Define the User schema
const userSchema = new Schema<IUser>(
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
            github: { type: String, trim: true },
            leetcode: { type: String, trim: true },
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

// Instance Method: Hash the password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Instance Method: Verify if the password is correct
userSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

// Instance Method: Generate an access token
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

// Instance Method: Generate a refresh token
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

// Static Method: Fetch public user data
userSchema.statics.getPublicUserData = async function (userId: string) {
    return this.findById(userId)
        .select(
            "username fullName profileImage coverImage dob emailVisible portfolioVisible portfolio linkedPlatforms"
        )
        .populate("portfolio blogs", "title description");
};

// Static Method: Verify if a user exists
userSchema.statics.isUserExists = async function (usernameOrEmail: string) {
    return this.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    }).select("_id username email");
};

// Export the User model
export const User: IUserModel = mongoose.model<IUser, IUserModel>(
    "User",
    userSchema
);
