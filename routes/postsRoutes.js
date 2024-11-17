const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/postModel');
const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/posts'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Create a post
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const userId = req.session.userId; // Replace with actual session/cookie handling
        const { content } = req.body;
        const image = req.file ? `/uploads/posts/${req.file.filename}` : null;

        const postId = await Post.createPost(userId, content, image);
        res.json({ success: true, postId });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Error creating post' });
    }
});

// Fetch posts (all or by user)
router.get('/', async (req, res) => {
    try {
        const { type, userId } = req.query;
        const posts = type === 'my' ? await Post.fetchPosts(userId) : await Post.fetchPosts();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Error fetching posts' });
    }
});

// React to a post
router.post('/:postId/react', async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.userId; // Replace with actual session/cookie handling
        const { reaction } = req.body;

        await Post.reactToPost(postId, userId, reaction);
        res.json({ success: true });
    } catch (error) {
        console.error('Error reacting to post:', error);
        res.status(500).json({ success: false });
    }
});

// Delete a post
router.delete('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.userId; // Replace with actual session/cookie handling

        const success = await Post.deletePost(postId, userId);
        if (success) {
            res.json({ success: true, message: 'Post deleted successfully' });
        } else {
            res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
