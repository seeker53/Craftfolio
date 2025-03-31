import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPersonalInfo {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    about: string;
}

export interface ISkill {
    name: string;
    category: string;
    proficiency: string;
    rating?: number;
}

export interface IProject {
    title: string;
    description: string;
    techStack: string[];
    githubLink?: string;
    demoLink?: string;
    images?: string[];
}

export interface IExperience {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    responsibilities: string[];
}

export interface IEducation {
    degree: string;
    institution: string;
    graduationYear: number;
}

export interface ICertification {
    name: string;
    link: string;
}

export interface LinkedPlatforms {
    githubUsername?: string;
    leetcodeUsername?: string;
    codeforcesUsername?: string;
    codechefUsername?: string;
    atcoderUsername?: string;
}
export interface IPortfolio extends Document {
    userId: Schema.Types.ObjectId;
    personalInfo: IPersonalInfo;
    skills: ISkill[];
    projects: IProject[];
    experience: IExperience[];
    education: IEducation[];
    certifications: ICertification[];
    contactFormEnabled?: boolean;
    linkedPlatforms: LinkedPlatforms;
    visible: boolean;
    yearsOfExperience: number;
    leetcodeRating: number;
    generatePortfolioLink(): string;
}

interface IPortfolioModel extends Model<IPortfolio> {
    findByUserId(userId: string | Schema.Types.ObjectId): Promise<IPortfolio[]>;
}

const portfolioSchema = new Schema<IPortfolio>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        personalInfo: {
            name: { type: String, required: true },
            title: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String },
            location: { type: String },
            about: { type: String, required: true },
        },
        skills: [
            {
                name: { type: String, required: true },
                category: { type: String, required: true },
                proficiency: { type: String, required: true },
                rating: { type: Number },
            },
        ],
        projects: [
            {
                title: { type: String, required: true },
                description: { type: String, required: true },
                techStack: [{ type: String, required: true }],
                githubLink: { type: String },
                demoLink: { type: String },
                images: [{ type: String }],
            },
        ],
        experience: [
            {
                company: { type: String, required: true },
                role: { type: String, required: true },
                startDate: { type: String, required: true },
                endDate: { type: String },
                responsibilities: [{ type: String, required: true }],
            },
        ],
        education: [
            {
                degree: { type: String, required: true },
                institution: { type: String, required: true },
                graduationYear: { type: Number, required: true },
            },
        ],
        certifications: [
            {
                name: { type: String, required: true },
                link: { type: String, required: true },
            },
        ],
        linkedPlatforms: {
            githubUsername: { type: String, trim: true },
            leetcodeUsername: { type: String, trim: true },
            codeforcesUsername: { type: String, trim: true },
            codechefUsername: { type: String, trim: true },
            atcoderUsername: { type: String, trim: true },
        },
        yearsOfExperience: { type: Number, required: true, default: 0 },
        leetcodeRating: { type: Number, required: true, default: 1500 },
        visible: {
            type: Boolean,
            required: true,
            default: true,
        },
        contactFormEnabled: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);


portfolioSchema.statics.findByUserId = async function (userId: Schema.Types.ObjectId) {
    return this.find({ userId, visible: true }).exec();
};
portfolioSchema.methods.generatePortfolioLink = function () {
    const baseUrl = process.env.PORTFOLIO_BASE_URL || "www.example.com";
    return `${baseUrl}/user/portfolios/${this._id}-portfolio`;
};

export const Portfolio: IPortfolioModel = mongoose.model<IPortfolio, IPortfolioModel>(
    "Portfolio",
    portfolioSchema
);
