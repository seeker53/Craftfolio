export interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    bio?: string;
    profileImage: string;
    coverImage?: string;
    age?: string;             // or Date, if you parse it
    emailVisible: boolean;
    ageVisible: boolean;
    portfolio: string[];      // array of Portfolio IDs
    blogs: string[];          // array of Blog IDs
    createdAt: string;        // MongoDB timestamps
    updatedAt: string;
}
