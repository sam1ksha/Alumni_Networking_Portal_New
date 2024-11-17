// forumRoutes.js updates
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // First check if user exists
        const [userExists] = await db.execute(
            'SELECT user_id FROM all_users_info WHERE user_id = ?',
            [userId]
        );

        if (userExists.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch the forum details
        const [forumRows] = await db.execute(
            'SELECT * FROM forum WHERE admin_user_id = ?',
            [userId]
        );

        if (forumRows.length === 0) {
            return res.status(404).json({ 
                message: 'Forum not found for this user',
                needsCreation: true 
            });
        }

        // Return the forum details with proper null checks
        const forum = forumRows[0];
        res.json({
            title: forum.title || null,
            forumId: forum.forum_id,
            branch_name: forum.branch_name || null,
            year_of_graduation: forum.year_of_graduation || null,
            custom_date: forum.custom_date ? 
                new Date(forum.custom_date).toISOString().split('T')[0] : null
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            message: 'Error fetching forum',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});