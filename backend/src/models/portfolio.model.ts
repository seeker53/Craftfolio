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
export interface Portfolio {
    personalInfo: PersonalInfo; // Personal information
    skills: Skill[];            // Array of skills
    projects: Project[];        // Array of projects
    experience: Experience[];   // Array of work experience
    education: Education[];     // Array of education details
    certifications: Certification[]; // Array of certifications
    contactFormEnabled?: boolean; // Boolean to enable/disable contact form
}
