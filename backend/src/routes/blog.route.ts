import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
    createBlog,
    getAllBlogs,
    getBlogsByAuthor,
    getBlogById,
    updateBlog,
    deleteBlog,
    publishBlog,
} from "../controllers/blog.controller";

const blogRouter = Router();

// Public route to get all published blogs
blogRouter.get("/", getAllBlogs);

// Public route to get a blog by ID (views are incremented if published)
blogRouter.get("/:blogId", getBlogById);

// Routes that require authentication:
blogRouter.post("/", verifyJWT, createBlog);
blogRouter.patch("/:blogId", verifyJWT, updateBlog);
blogRouter.delete("/:blogId", verifyJWT, deleteBlog);
blogRouter.patch("/:blogId/publish", verifyJWT, publishBlog);

// Optionally, a route to get all blogs by a given author
blogRouter.get("/author/:authorId", getBlogsByAuthor);

export default blogRouter;
