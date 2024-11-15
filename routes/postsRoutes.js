// postsRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/postModel');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/posts'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Fetch all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAllWithDetails(req.session.userId); // Use current user
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Create a new post
router.post('/', upload.single('image'), async (req, res) => {
    const { content } = req.body;
    const image = req.file ? `/uploads/posts/${req.file.filename}` : null;

    try {
        const postId = await Post.create({ user_id: req.session.userId, content, image });
        res.json({ success: true, postId });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

// Like a post
router.post('/:postId/like', async (req, res) => {
    try {
        await Post.reactToPost(req.params.postId, req.session.userId, 'like');
        res.json({ success: true });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Error liking post' });
    }
});

// Dislike a post
router.post('/:postId/dislike', async (req, res) => {
    try {
        await Post.reactToPost(req.params.postId, req.session.userId, 'dislike');
        res.json({ success: true });
    } catch (error) {
        console.error('Error disliking post:', error);
        res.status(500).json({ message: 'Error disliking post' });
    }
});

// Search posts by user or content
router.get('/search', async (req, res) => {
    const searchQuery = req.query.query;
    try {
        const posts = await Post.findByUsernameWithDetails(searchQuery, req.session.userId);
        res.json(posts);
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ message: 'Error searching posts' });
    }
});

module.exports = router;
