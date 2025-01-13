import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for personal information
export interface PersonalInfo {
    name: string;               // Full Name
    title: string;              // Professional Title
    email: string;              // Contact Email
    phone?: string;             // Optional Contact Phone
    location?: string;          // Optional Location
    about: string;              // Short Bio
}

// Interface for skills
export interface Skill {
    name: string;               // Name of the skill (e.g., "JavaScript")
    category: string;           // Category (e.g., "Programming Language")
    proficiency: string;        // Proficiency level (e.g., "Beginner", "Expert")
    rating?: number;            // Optional numeric rating
}

// Interface for projects
export interface Project {
    title: string;              // Project Title
    description: string;        // Short Description
    techStack: string[];        // Technologies Used
    githubLink?: string;        // GitHub Repository Link
    demoLink?: string;          // Live Demo Link
    images?: string[];          // Array of image URLs
}

// Interface for work experience
export interface Experience {
    company: string;            // Company Name
    role: string;               // Role/Title
    startDate: string;          // Start Date (ISO Format)
    endDate?: string;           // End Date (or null for current)
    responsibilities: string[]; // Array of key responsibilities
}

// Interface for education
export interface Education {
    degree: string;             // Degree Earned
    institution: string;        // University/College Name
    graduationYear: number;     // Graduation Year
}

// Interface for certifications
export interface Certification {
    title: string;              // Certification Name
    issuer: string;             // Organization Issuing the Certification
    dateEarned: string;         // Date Earned (ISO Format)
}

// Main portfolio interface
export interface Portfolio extends Document {
    userId: Schema.Types.ObjectId; // Reference to the user who owns the portfolio
    personalInfo: PersonalInfo;    // Personal information
    skills: Skill[];               // Array of skills
    projects: Project[];           // Array of projects
    experience: Experience[];      // Array of work experience
    education: Education[];        // Array of education details
    certifications: Certification[]; // Array of certifications
    contactFormEnabled?: boolean;  // Boolean to enable/disable contact form
}

// Portfolio Schema
const portfolioSchema = new Schema<Portfolio>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User", // Reference to the User model
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

// Static method to generate a unique portfolio link
portfolioSchema.statics.generateUniquePortfolioLink = function (this: Model<Portfolio>) {
    return (portfolioId: string) => {
        return `www.craftfolio.com/user/portfolios/${portfolioId}-portfolio`;
    };
};

// Instance method to get the portfolio link for the user
portfolioSchema.methods.getPortfolioLink = function (this: Portfolio) {
    return `www.craftfolio.com/user/portfolios/${this._id}-portfolio`;
};

export const PortfolioModel = mongoose.model<Portfolio>("Portfolio", portfolioSchema);
