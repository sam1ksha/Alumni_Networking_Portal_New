const express = require('express');
const router = express.Router();
const Profile = require('../models/profileModel');


// Get complete profile data
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // Fetch user profile info from the database
        const userProfile = await Profile.getUserProfileById(userId);

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        // Structure and send the profile data as a response
        res.json({
            success: true,
            data: {
                firstName: userProfile.first_name,
                middleName: userProfile.middle_name,
                lastName: userProfile.last_name,
                userType: userProfile.user_type,
                workExperience: userProfile.work_experience,
                resume: userProfile.resume,
                profilePicture: userProfile.profile_picture || 'default_profile_picture_url', // Default if profile picture is missing
                email: userProfile.email,
                phoneNo: userProfile.phone_no,
                registrationDate: userProfile.registration_date,
                branchName: userProfile.branch_name,
                yearOfGraduation: userProfile.year_of_graduation,
                
                // Additional information from related tables
                status: userProfile.user_status,   // Status from user_status_updates
                links: {
                    linkedin: userProfile.linkedin_url,
                    github: userProfile.github_url,
                    other: userProfile.other_url
                },
                workExperience: {
                    jobTitle: userProfile.job_title,
                    companyName: userProfile.company_name,
                    currentlyEmployed: userProfile.currently_employed,
                    startDate: userProfile.start_date,
                    endDate: userProfile.end_date,
                    responsibilities: userProfile.responsibilities
                }
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile data'
        });
    }
});

//Route to update user profile information (links, status, work experience)
router.post('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { type } = req.body;

        // Handle link and status updates
        if (type === 'link') {
            const { linkedin_url, github_url, other_url, status } = req.body;

            const linkData = {
                user_id: userId,
                linkedin_url: linkedin_url || null,
                github_url: github_url || null,
                other_url: other_url || null
            };

            // Call insertLink method to insert or update user links
            await Profile.insertLink(linkData);

            return res.json({
                success: true,
                message: 'User links updated successfully'
            });
        } 
        else if (type === 'status') {
            const { status } = req.body;

            const statusData = {
                user_id: userId,
                status: status || null
            };

            // Call insertStatus method to insert or update the user status
            await Profile.insertStatus(statusData);

            return res.json({
                success: true,
                message: 'User status updated successfully'
            });
        } 
        // Handle work experience updates
        else if (type === 'work_exp') {
            const { job_title, company_name, currently_employed, start_date, end_date, responsibilities } = req.body;

            const workExpData = {
                user_id: userId,
                job_title: job_title,
                company_name: company_name,
                currently_employed: currently_employed,
                start_date: start_date,
                end_date: end_date || null,  // if end_date is not provided, it will be set to null
                responsibilities: responsibilities || null // if responsibilities are not provided, it will be set to null
            };

            // Call insertWorkExperience method to insert work experience into the database
            await Profile.insertWorkExperience(workExpData);

            return res.json({
                success: true,
                message: 'Work experience added successfully'
            });
        } 
        else {
            return res.status(400).json({
                success: false,
                message: 'Invalid request type'
            });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the profile'
        });
    }
});




module.exports = router;
