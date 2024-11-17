// models/JobListingModel.js
const db = require('../config/database');

class JobListing {
    // Create a new job offer
    static async create(jobData) {
        try {
            const [result] = await db.execute(
                `INSERT INTO job_offer (
                    user_id, title, description, role, location, salary, 
                    application_deadline, job_status, required_skills, application_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    jobData.user_id,
                    jobData.title,
                    jobData.description,
                    jobData.role,
                    jobData.location,
                    jobData.salary,
                    jobData.application_deadline,
                    jobData.job_status || 'open', // Default job status is 'open'
                    jobData.required_skills,
                    0  // Initial application count is 0
                ]
            );
            return result.insertId; // Return the ID of the newly created job offer
        } catch (error) {
            throw error;
        }
    }


    static async findAllByUserId(userId) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM job_offer WHERE user_id = ?`,
                [userId]
            );
            return rows;  // Return all job listings for the specified user
        } catch (error) {
            throw error;
        }
    }

    // Retrieve all job listings
    static async findAll() {
        try {
            const [rows] = await db.execute(
                `SELECT * 
                 FROM job_offer  
                 ORDER BY application_count DESC`
            );
            return rows;  // Return the filtered and sorted job listings
        } catch (error) {
            throw error;
        }
    }

    // Retrieve job listing by job_id
    static async findById(jobId) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM job_offer WHERE job_id = ?`,
                [jobId]
            );
            return rows[0];  // Return the job listing with the given job_id
        } catch (error) {
            throw error;
        }
    }

    // Update job offer's application count
    static async incrementApplicationCount(jobId) {
        try {
            const [result] = await db.execute(
                `UPDATE job_offer SET application_count = application_count + 1 WHERE job_id = ?`,
                [jobId]
            );
            return result.affectedRows > 0;  // Return true if the update was successful
        } catch (error) {
            throw error;
        }
    }

    // Update job offer status (e.g., 'closed', 'full')
    static async updateStatus(jobId, status) {
        try {
            const [result] = await db.execute(
                `UPDATE job_offer SET job_status = ? WHERE job_id = ?`,
                [status, jobId]
            );
            return result.affectedRows > 0;  // Return true if the update was successful
        } catch (error) {
            throw error;
        }
    }

    // Delete a job offer
    static async delete(jobId) {
        try {
            console.log("inside delete()")
            const [result] = await db.execute(
                `DELETE FROM job_offer WHERE job_id = ?`,
                [jobId]
            );
            console.log('Delete result:', result);
            await db.execute('COMMIT');
            return result.affectedRows > 0;  // Return true if the deletion was successful
        } catch (error) {
            console.error('Error during deletion:', error.message);
            throw error;
        }
    }
}

module.exports = JobListing;
