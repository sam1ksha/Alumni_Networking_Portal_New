// postModel.js
const db = require('../config/database');

class Post {
    static async create(postData) {
        const { user_id, content, image } = postData;
        const [result] = await db.execute(
            `INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)`,
            [user_id, content, image]
        );
        return result.insertId;
    }

    static async findAllWithDetails(currentUserId) {
        const [rows] = await db.execute(`
            SELECT 
                p.*, 
                u.first_name, u.last_name, u.profile_picture,
                (SELECT COUNT(*) FROM reacts_to WHERE post_id = p.post_id AND reaction = 'like') as likes,
                (SELECT COUNT(*) FROM reacts_to WHERE post_id = p.post_id AND reaction = 'dislike') as dislikes,
                (SELECT reaction FROM reacts_to WHERE post_id = p.post_id AND user_id = ?) as user_reaction
            FROM posts p
            JOIN all_users_info u ON p.user_id = u.user_id
            ORDER BY p.created_at DESC
        `, [currentUserId]);
        return rows;
    }

    static async reactToPost(postId, userId, reactionType) {
        await db.execute(
            `INSERT INTO reacts_to (post_id, user_id, reaction) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE reaction = ?`,
            [postId, userId, reactionType, reactionType]
        );
    }

    static async findByUsernameWithDetails(username, currentUserId) {
        const [rows] = await db.execute(`
            SELECT 
                p.*, 
                u.first_name, u.last_name, u.profile_picture,
                (SELECT COUNT(*) FROM reacts_to WHERE post_id = p.post_id AND reaction = 'like') as likes,
                (SELECT COUNT(*) FROM reacts_to WHERE post_id = p.post_id AND reaction = 'dislike') as dislikes,
                (SELECT reaction FROM reacts_to WHERE post_id = p.post_id AND user_id = ?) as user_reaction
            FROM posts p
            JOIN all_users_info u ON p.user_id = u.user_id
            WHERE CONCAT(u.first_name, ' ', u.last_name) LIKE ?
            ORDER BY p.created_at DESC
        `, [currentUserId, `%${username}%`]);
        return rows;
    }
}

module.exports = Post;
