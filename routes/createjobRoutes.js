// routes/jobRoutes.js
const express = require('express');
const JobListing = require('../models/JobListingModel');


const router = express.Router();

// Route to handle job posting
router.post('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Destructure and set default values for job data
        const {
            title,
            description,
            role,
            location,
            salary,
            application_deadline,
            job_status = 'open',
            required_skills,
            application_count = 0
        } = req.body;

        // Prepare job data object
        const jobData = {
            user_id: userId,
            title: title,
            description: description,
            role: role,
            location: location,
            salary: salary,
            application_deadline: application_deadline,
            job_status: job_status,
            required_skills: required_skills || null,  // Set to null if not provided
            application_count: application_count
        };

        // Save job to the database
        const jobId = await JobListing.create(jobData);

        return res.status(201).json({
            success: true,
            message: "Job posted successfully",
            jobId
        });
    } catch (error) {
        console.error("Error saving job:", error);
        res.status(500).json({ message: "Failed to post job", error: error.message });
    }
});


module.exports = router;
