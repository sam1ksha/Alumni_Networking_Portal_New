const db = require('../db');

module.exports = {
    async createDefaultForum(userId) {
        try {
            // Log user ID
            console.log(`Creating default forum for user ID: ${userId}`);
    
            const [userRows] = await db.execute(
                'SELECT branch_name, year_of_graduation FROM all_users_info WHERE user_id = ?',
                [userId]
            );
    
            // Check if user exists
            if (userRows.length === 0) {
                throw new Error(`No user found with ID ${userId}`);
            }
    
            const { branch_name, year_of_graduation } = userRows[0];
            console.log(`User details: branch_name=${branch_name}, year_of_graduation=${year_of_graduation}`);
    
            const currentDate = new Date().toISOString().split('T')[0];
            const forumTitle = `Default Forum - ${branch_name}`;
            const forumDescription = `Discussion forum for ${branch_name} batch of ${year_of_graduation}`;
    
            // Insert into forum table
            const [result] = await db.execute(
                'INSERT INTO forum (title, topic, year_of_graduation, custom_date, branch_name, no_of_users, admin_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [forumTitle, forumDescription, year_of_graduation, currentDate, branch_name, 0, userId]
            );
    
            console.log('Forum created with ID:', result.insertId);
    
            // Fetch the newly created forum
            const [forumRows] = await db.execute(
                'SELECT * FROM forum WHERE admin_user_id = ? ORDER BY forum_id DESC LIMIT 1',
                [userId]
            );
    
            console.log('Fetched forum details:', forumRows);
    
            return forumRows[0];
        } catch (error) {
            console.error('Error in createDefaultForum:', error.message); // Log the error
            throw error;
        }
    }
    ,

    async getDefaultForum(userId) {
        try {
            const [forumRows] = await db.execute(
                'SELECT * FROM forum WHERE admin_user_id = ?',
                [userId]
            );

            if (forumRows.length === 0) {
                // If no forum exists, create a default one
                return await this.createDefaultForum(userId);
            }

            return forumRows[0];
        } catch (error) {
            throw new Error(`Error fetching default forum: ${error.message}`);
        }
    }
};
