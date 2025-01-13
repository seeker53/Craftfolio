import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for personal information
export interface PersonalInfo {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    about: string;
}

// Interface for skills
export interface Skill {
    name: string;
    category: string;
    proficiency: string;
    rating?: number;
}

// Interface for projects
export interface Project {
    title: string;
    description: string;
    techStack: string[];
    githubLink?: string;
    demoLink?: string;
    images?: string[];
}

// Interface for work experience
export interface Experience {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    responsibilities: string[];
}

// Interface for education
export interface Education {
    degree: string;
    institution: string;
    graduationYear: number;
}

// Interface for certifications
export interface Certification {
    title: string;
    issuer: string;
    dateEarned: string;
}

// Main portfolio interface
export interface Portfolio extends Document {
    userId: Schema.Types.ObjectId;
    personalInfo: PersonalInfo;
    skills: Skill[];
    projects: Project[];
    experience: Experience[];
    education: Education[];
    certifications: Certification[];
    contactFormEnabled?: boolean;
    generateUniquePortfolioLink: () => string;
    getPortfolioLink: () => string;
}

// Extend mongoose Model for static methods
interface PortfolioModel extends Model<Portfolio> {
    createPortfolio(portfolioData: Portfolio): Promise<Portfolio>;
    findByUserId(userId: string): Promise<Portfolio[]>;
}

// Portfolio Schema
const portfolioSchema = new Schema<Portfolio>(
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
                title: { type: String, required: true },
                issuer: { type: String, required: true },
                dateEarned: { type: String, required: true },
            },
        ],
        contactFormEnabled: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

// Static method to create a portfolio (used for creating a new portfolio)
portfolioSchema.statics.createPortfolio = async function (portfolioData: Portfolio) {
    const portfolio = new this(portfolioData); // Create new portfolio instance
    await portfolio.save(); // Save to DB
    return portfolio; // Return the created portfolio
};

// Static method to find portfolios by userId
portfolioSchema.statics.findByUserId = async function (userId: string) {
    const portfolios = await this.find({ userId }).exec(); // Find portfolios for the specific user
    return portfolios; // Return all portfolios for this user
};

// Instance method to generate unique portfolio link
portfolioSchema.methods.generateUniquePortfolioLink = function () {
    const baseUrl = process.env.PORTFOLIO_BASE_URL || "www.example.com";
    return `${baseUrl}/user/portfolios/${this._id}-portfolio`;
};

// Instance method to get the portfolio link for the user
portfolioSchema.methods.getPortfolioLink = function () {
    const baseUrl = process.env.PORTFOLIO_BASE_URL || "www.example.com";
    return `${baseUrl}/user/portfolios/${this._id}-portfolio`;
};

export const PortfolioModel = mongoose.model<Portfolio, PortfolioModel>("Portfolio", portfolioSchema);
