const express = require('express');
const router = express.Router();
const forumModel = require('../models/forumModel');

router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Log the incoming request
        console.log(`Fetching forum for user ID: ${userId}`);

        if (!userId) {
            console.error('User ID not provided');
            return res.status(400).json({ message: 'User ID is required' });
        }

        const forum = await forumModel.getDefaultForum(userId);

        // Log the fetched forum details
        console.log('Fetched forum:', forum);

        res.json({
            title: forum.title,
            branch_name: forum.branch_name,
            year_of_graduation: forum.year_of_graduation,
            custom_date: forum.custom_date,
            forumId: forum.forum_id
        });
    } catch (error) {
        console.error('Error in fetching forum:', error.message); // Log the error
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});


module.exports = router;
