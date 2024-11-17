const db = require('../config/database');

class Profile {
    static async getUserProfileById(userId) {
        try {
            const [rows] = await db.execute(
                `SELECT 
                    a.first_name, 
                    a.middle_name, 
                    a.last_name, 
                    a.user_type, 
                    a.work_experience, 
                    a.resume, 
                    a.profile_picture, 
                    a.email, 
                    a.phone_no, 
                    a.registration_date, 
                    a.branch_name, 
                    a.year_of_graduation,
                    s.status AS user_status,  -- from user_status_updates
                    l.linkedin_url, 
                    l.github_url, 
                    l.other_url,           -- from user_links
                    w.job_title, 
                    w.company_name, 
                    w.currently_employed, 
                    w.start_date, 
                    w.end_date, 
                    w.responsibilities   -- from work_experience
                 FROM all_users_info a
                 LEFT JOIN user_status_updates s ON a.user_id = s.user_id
                 LEFT JOIN user_links l ON a.user_id = l.user_id
                 LEFT JOIN work_experience w ON a.user_id = w.user_id
                 WHERE a.user_id = ?`,
                [userId]
            );

            return rows[0]; // Return the user's profile information as an object
        } catch (error) {
            throw error;
        }
    }

    static async insertStatus(userData) {
        console.log("User status update:", userData);
        try {
            const [result] = await db.execute(
                `INSERT INTO user_status_updates (user_id, status) 
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE status = ?`,
                [
                    userData.user_id,
                    userData.status,
                    userData.status // Value to update if there's a duplicate key
                ]
                
            );
            console.log("User status update:", userData);
        } catch (error) {
            // Rollback in case of an error
            await db.query('ROLLBACK');
            throw error;
        }
    }
    static async insertLink(userData) {
        console.log("User link update:", userData);
        try {
            const [result] = await db.execute(
                `INSERT INTO user_links (user_id, linkedin_url, github_url, other_url) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    linkedin_url = VALUES(linkedin_url),
                    github_url = VALUES(github_url),
                    other_url = VALUES(other_url)`,
                [
                    userData.user_id,
                    userData.linkedin_url,
                    userData.github_url,
                    userData.other_url
                ]
            );
            //console.log("Link update result:", result);
        } catch (error) {
            // Rollback in case of an error
            await db.query('ROLLBACK');
            throw error;
        }
    }

    static async insertWorkExperience(userData) {
        const { user_id, job_title, company_name, currently_employed, start_date, end_date, responsibilities } = userData;
    
        console.log("User work experience update:", userData);
    
        // Check if the start_date is in the correct format (YYYY-MM-DD), if not, format it
        const formattedStartDate = start_date.length === 7 ? `${start_date}-01` : start_date;

    // If not currently employed, ensure end_date is in the correct format
    let formattedEndDate = null;
    if (currently_employed === 'no') {
        // Format end_date if it's in 'YYYY-MM' format (e.g., '2024-06')
        formattedEndDate = end_date.length === 7 ? `${end_date}-01` : end_date;
    } else {
        // If currently employed, set end_date as NULL
        formattedEndDate = null;
    }
        try {
            const [result] = await db.execute(
                `INSERT INTO work_experience (user_id, job_title, company_name, currently_employed, start_date, end_date, responsibilities) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    company_name = VALUES(company_name),
                    currently_employed = VALUES(currently_employed),
                    start_date = VALUES(start_date),
                    end_date = VALUES(end_date),
                    responsibilities = VALUES(responsibilities)`,
                [
                    user_id,
                    job_title,
                    company_name,
                    currently_employed,
                    formattedStartDate,
                    formattedEndDate,
                    responsibilities
                ]
            );
            console.log("Work experience update result:", result);
        } catch (error) {
            // Rollback in case of an error
            await db.query('ROLLBACK');
            throw error;
        }
    }
}      

module.exports = Profile;
