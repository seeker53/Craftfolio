import mongoose, { Schema, Document, Model } from "mongoose";

interface BlogDocument extends Document {
    title: string;
    content: string;
    author: mongoose.Schema.Types.ObjectId;
    isPublished: boolean;
    views: number;
    publishedAt?: Date;
    incrementViews: () => Promise<void>;
    publish: () => Promise<void>;
}

interface BlogModel extends Model<BlogDocument> {
    findByAuthor: (authorId: string) => Promise<BlogDocument[]>;
}

const blogSchema = new Schema<BlogDocument>(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        isPublished: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        publishedAt: { type: Date },
    },
    { timestamps: true }
);

// Instance Methods
blogSchema.methods.incrementViews = async function (): Promise<void> {
    this.views += 1;
    await this.save();
};

blogSchema.methods.publish = async function (): Promise<void> {
    this.isPublished = true;
    this.publishedAt = new Date();
    await this.save();
};

// Static Methods
blogSchema.statics.findByAuthor = async function (authorId: string) {
    return this.find({ author: authorId });
};

export const Blog = mongoose.model<BlogDocument, BlogModel>("Blog", blogSchema);
