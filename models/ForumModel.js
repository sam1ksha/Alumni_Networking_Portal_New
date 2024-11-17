const db = require('../config/database');

class Forum {
    /**
     * Fetch user details (branch and year of graduation) based on user ID.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<object>} - User details object containing branch_name and year_of_graduation.
     */
    static async getUserDetails(userId) {
        try {
            const [rows] = await db.execute(
                `SELECT branch_name, year_of_graduation 
                 FROM all_users_info 
                 WHERE user_id = ?`, 
                [userId]
            );

            if (rows.length === 0) {
                throw new Error('User details not found');
            }

            return rows[0];
        } catch (error) {
            console.error('Error fetching user details:', error.message);
            throw error;
        }
    }

    /**
     * Create a default forum for a user based on their branch and batch year.
     * The forum title will be dynamically created as "{branch_name}-{year_of_graduation}"
     * @param {number} userId - The ID of the user for whom the forum is being created.
     * @param {number} adminUserId - The ID of the admin user creating the forum.
     * @returns {Promise<number>} - The ID of the created forum.
     */
    static async createDefaultForum(userId, adminUserId) {
        try {
            const userDetails = await Forum.getUserDetails(userId);  // Fetch user details directly
            
            if (!userDetails) {
                throw new Error('User details not found');
            }

            // Extract branch and batch year details
            const { branch_name, year_of_graduation } = userDetails;

            // Construct the forum title dynamically
            const forumTitle = `${branch_name}-${year_of_graduation}`;

            const forumDescription = `This is the default forum.`;

            // Get the current date to use for custom_date
            const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

            // Insert the forum into the database with an empty title initially
            const [result] = await db.execute(
                `INSERT INTO forum (title, topic, year_of_graduation, custom_date, branch_name, no_of_users, admin_user_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [forumTitle, forumDescription, year_of_graduation, currentDate, branch_name, 0, adminUserId] // Initial user count set to 0
            );

            console.log('Forum created successfully with ID:', result.insertId);
            return result.insertId;  // Return the ID of the created forum
        } catch (error) {
            console.error('Error creating default forum:', error.message);
            throw error;
        }
    }

    // Additional Forum Model Methods (for findAllByUserId, delete, etc.) can be added here
}

module.exports = Forum;
