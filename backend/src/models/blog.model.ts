import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
    title: string;
    content: string;
    author: mongoose.Schema.Types.ObjectId;
    isPublished: boolean;
    views: number;
    publishedAt?: Date;
    incrementViews: () => Promise<void>;
    publish: () => Promise<void>;
}

interface BlogModel extends Model<IBlog> {
    findByAuthor(authorId: string): mongoose.Query<IBlog[], IBlog>;
}

const blogSchema = new Schema<IBlog>(
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
blogSchema.statics.findByAuthor = function (authorId: string) {
    return this.find({ author: authorId });
};

blogSchema.pre<IBlog>("save", async function (next) {
    if (!this.isModified("isPublished")) return next();
    if (this.isPublished) this.publishedAt = new Date();
    next();
});

export const Blog = mongoose.model<IBlog, BlogModel>("Blog", blogSchema);

