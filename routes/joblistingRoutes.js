const express = require('express');
const JobListing = require('../models/JobListingModel');
const JobApp = require('../models/JobApplicationModel');

const router = express.Router();



// Route to handle job-related operations
router.get('/:userId', async (req, res) => {
    const { type, jobId } = req.query; // Expect `type` and optional `jobId` from query parameters
    try {
        
        if (type === 'find all jobs') {
            // Fetch all job listings
            const jobListings = await JobListing.findAll();
            res.json(jobListings);
        } else if (type === 'find all my applications') {
            // Fetch all applications submitted by the user
            const userId = req.params.userId;
            const applications = await JobApp.findByUserId(userId);
            res.json(applications);
        } else if (type === 'find all applicants') {
            // Fetch all applications for a specific job
            if (!jobId) {
                return res.status(400).json({ error: 'Job ID is required for this action' });
            }
            const applicants = await JobApp.findByJobId(jobId);
            res.json(applicants);
        } else {
            res.status(400).json({ error: 'Invalid action type' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

router.post('/:userId', async (req, res) => {
    const { jobId, type, status, coverLetter } = req.body; // Destructure required fields from the request body
    const userId = req.params.userId;

    console.log('Received data:', req.body);

    try {
        if (type === 'apply') {
            console.log('Inside apply');

            // Validate input data
            if (!jobId || !status || !userId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Create application data
            const applicationData = {
                job_id: jobId,
                user_id: userId,
                status: status,
                cover_letter: coverLetter || null,
            };
            console.log('Application data:', applicationData);

            // Save the application to the database
            const applicationId = await JobApp.create(applicationData);

            const isCountUpdated = await JobListing.incrementApplicationCount(jobId);
            if (!isCountUpdated) {
                console.warn('Failed to update application count for job:', jobId);
                return res.status(500).json({
                    error: 'Application submitted, but failed to update application count.',
                });
            }

            res.json({ message: 'Application submitted successfully', applicationId });
        }else if (type === 'delete') {
            // Delete job offer
            console.log("deleting")
            const success = await JobListing.delete(jobId);
            if (success) {
                res.json({ message: 'Job offer deleted successfully' });
            } else {
                res.status(404).json({ error: 'Job offer not found' });
            }
        } else if (type === 'update status') {
            // Update job offer status (e.g., 'closed', 'full')
            if (!status) {
                return res.status(400).json({ error: 'Status is required for updating' });
            }
            const success = await JobListing.updateStatus(jobId, status);
            if (success) {
                res.json({ message: `Job offer status updated to ${status}` });
            } else {
                res.status(404).json({ error: 'Job offer not found' });
            }
        } else if (type==='send mail'){
            // Sending email
            res.json({ message: 'Email submitted successfully' });
        } else {
            res.status(400).json({ error: 'Invalid action type' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process job action' });
    }
});

module.exports = router;
