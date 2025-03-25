import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Blog, IBlog } from "../models/blog.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { IUser } from "../models/user.model";

interface IRequest extends Request {
    user?: IUser;
}
// Create a new blog post
export const createBlog = asyncHandler(async (req: IRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized: User ID missing");
    }

    const { title, content } = req.body;
    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    // Create blog post; default isPublished is false and views is 0
    const blog = new Blog({
        title,
        content,
        author: userId,
    });

    const savedBlog = await blog.save();
    if (!savedBlog) {
        throw new ApiError(500, "Failed to create blog post");
    }

    res.status(201).json(new ApiResponse(201, savedBlog));
});

// Get all published blogs (optionally, you can add pagination/filtering)
export const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
    // Find only published blogs
    const blogs = await Blog.find({ isPublished: true }).populate("author", "name email");
    res.status(200).json(new ApiResponse(200, blogs));
});

// Get blogs by a specific author (if you want to expose drafts to the author)
export const getBlogsByAuthor = asyncHandler(async (req: Request, res: Response) => {
    const { authorId } = req.params;
    if (!authorId) {
        throw new ApiError(400, "Author ID is required");
    }
    // This now returns a Query, so you can chain populate on it.
    const blogs = await Blog.findByAuthor(authorId).populate("author", "name email");
    res.status(200).json(new ApiResponse(200, blogs));
});


// Get a single blog post by its id and increment views if published
export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
    const blogId = req.params.blogId;
    if (!blogId) {
        throw new ApiError(400, "Blog ID is required");
    }

    const blog = await Blog.findById(blogId).populate("author", "name email");
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // If blog is published, increment views
    if (blog.isPublished) {
        await blog.incrementViews();
    }

    res.status(200).json(new ApiResponse(200, blog));
});

// Update a blog post (only the author should be able to update)
export const updateBlog = asyncHandler(async (req: IRequest, res: Response) => {
    const blogId = req.params.blogId;
    const userId = req.user?.id;
    if (!blogId) {
        throw new ApiError(400, "Blog ID is required");
    }
    if (!userId) {
        throw new ApiError(401, "Unauthorized: User ID missing");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // Ensure the logged-in user is the author
    if (blog.author.toString() !== userId) {
        throw new ApiError(403, "Unauthorized: You are not the author of this blog post");
    }

    // Update fields; you can also restrict which fields can be updated
    const updateFields = req.body;
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key] !== undefined) {
            (blog as any)[key] = updateFields[key];
        }
    });

    const updatedBlog = await blog.save();
    if (!updatedBlog) {
        throw new ApiError(500, "Failed to update blog post");
    }

    res.status(200).json(new ApiResponse(200, updatedBlog));
});

// Delete a blog post (only the author should be able to delete)
export const deleteBlog = asyncHandler(async (req: IRequest, res: Response) => {
    const blogId = req.params.blogId;
    const userId = req.user?.id;
    if (!blogId) {
        throw new ApiError(400, "Blog ID is required");
    }
    if (!userId) {
        throw new ApiError(401, "Unauthorized: User ID missing");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // Check that the logged-in user is the author
    if (blog.author.toString() !== userId) {
        throw new ApiError(403, "Unauthorized: You are not the author of this blog post");
    }

    await Blog.deleteOne({ _id: blogId });
    res.status(200).json(new ApiResponse(200, { message: "Blog deleted successfully" }));
});

// Publish a blog post (only the author can publish)
export const publishBlog = asyncHandler(async (req: IRequest, res: Response) => {
    const blogId = req.params.blogId;
    const userId = req.user?.id;
    if (!blogId) {
        throw new ApiError(400, "Blog ID is required");
    }
    if (!userId) {
        throw new ApiError(401, "Unauthorized: User ID missing");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    if (blog.author.toString() !== userId) {
        throw new ApiError(403, "Unauthorized: You are not the author of this blog post");
    }

    // Call the publish instance method to update isPublished and publishedAt
    await blog.publish();

    res.status(200).json(new ApiResponse(200, blog));
});
