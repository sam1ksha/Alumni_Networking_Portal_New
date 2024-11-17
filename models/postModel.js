const db = require('../config/database');

class Post {
    // Create a new post
    static async createPost(userId, content, image) {
        try {
            const [result] = await db.execute(
                `INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)`,
                [userId, content, image || null]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Fetch posts for all users or a specific user
    static async fetchPosts(userId = null) {
        try {
            let query = `
                SELECT p.post_id, p.content, p.image, p.created_at, 
                       CONCAT(u.first_name, ' ', u.last_name) AS authorName,
                       (SELECT COUNT(*) FROM reacts_to WHERE post_id = p.post_id AND reaction = 'like') AS likes,
                       (SELECT COUNT(*) FROM reacts_to WHERE post_id = p.post_id AND reaction = 'dislike') AS dislikes
                FROM posts p
                JOIN all_users_info u ON p.user_id = u.user_id
                ${userId ? `WHERE p.user_id = ?` : ''}
                ORDER BY p.created_at DESC
            `;
            const [rows] = userId ? await db.execute(query, [userId]) : await db.execute(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // React to a post
    static async reactToPost(postId, userId, reaction) {
        try {
            await db.execute(
                `INSERT INTO reacts_to (post_id, user_id, reaction)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE reaction = ?`,
                [postId, userId, reaction, reaction]
            );
        } catch (error) {
            throw error;
        }
    }

    // Delete a post
    static async deletePost(postId, userId) {
        try {
            const [result] = await db.execute(
                `DELETE FROM posts WHERE post_id = ? AND user_id = ?`,
                [postId, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Post;
