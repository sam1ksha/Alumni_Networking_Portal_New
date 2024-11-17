// models/JobApplicationModel.js
const db = require('../config/database');

class JobApplication {
    // Create a new job application
    static async create(applicationData) {
        try {
            console.log("inserting application")
            const [result] = await db.execute(
                `INSERT INTO job_application (
                    job_id, user_id, status, cover_letter
                ) VALUES (?, ?, ?, ?)`,
                [
                    applicationData.job_id,
                    applicationData.user_id,
                    applicationData.status || 'submitted',  // Default status is 'submitted'
                    applicationData.cover_letter || null
                ]
            );
            return result.insertId;  // Return the ID of the newly created application
        } catch (error) {
            throw error;
        }
    }

    // Find all applications for a specific job
    static async findByJobId(jobId) {
        try {
            const [rows] = await db.execute(
                `SELECT job_application.*, user_profile.first_name, user_profile.last_name 
                 FROM job_application
                 JOIN user_profile ON job_application.user_id = user_profile.user_id
                 WHERE job_application.job_id = ?`,
                [jobId]
            );
            return rows;  // Return all applications for the job
        } catch (error) {
            throw error;
        }
    }

    // Find all applications submitted by a specific user
    static async findByUserId(userId) {
        try {
            const [rows] = await db.execute(
                `SELECT job_application.*, job_offer.title 
                 FROM job_application
                 JOIN job_offer ON job_application.job_id = job_offer.job_id
                 WHERE job_application.user_id = ?`,
                [userId]
            );
            return rows;  // Return all applications submitted by the user
        } catch (error) {
            throw error;
        }
    }

    // Update the status of a job application (e.g., 'shortlisted', 'approved', 'rejected')
    static async updateStatus(applicationId, status) {
        try {
            const [result] = await db.execute(
                `UPDATE job_application SET status = ? WHERE application_id = ?`,
                [status, applicationId]
            );
            return result.affectedRows > 0;  // Return true if the update was successful
        } catch (error) {
            throw error;
        }
    }

    // Delete a job application
    static async delete(applicationId) {
        try {
            const [result] = await db.execute(
                `DELETE FROM job_application WHERE application_id = ?`,
                [applicationId]
            );
            return result.affectedRows > 0;  // Return true if the deletion was successful
        } catch (error) {
            throw error;
        }
    }
}

module.exports = JobApplication;
