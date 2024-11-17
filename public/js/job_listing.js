document.addEventListener('DOMContentLoaded', () => {
    const userId = window.location.pathname.split('/')[2];  // Get the userId from the URL path
    
    console.log("User ID:", userId);  // Debugging userId
    
    // Get DOM elements for the job listings and side panel
    const container = document.getElementById('job-listings-container');
    const panel = document.getElementById('jobManagementPanel');
    const toggleBtn = document.getElementById('togglePanel');
    const closeBtn = document.getElementById('closePanel');
    const myJobsList = document.getElementById('myJobsList');
    const jobCreateLink = document.getElementById('job-create-link');
    
    // Create a new element to show the job details modal
    const jobDetailsBox = document.createElement('div');
    jobDetailsBox.classList.add('job-details-box');
    jobDetailsBox.style.display = 'none';  // Initially hidden
    document.body.appendChild(jobDetailsBox);

    // Create a blur effect overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.style.display = 'none';  // Initially hidden
    document.body.appendChild(overlay);

    // Fetch job listings from the server using the userId
    fetch(`/api/joblisting/${userId}?type=find%20all%20jobs`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched job data:", data);  // Log the fetched data

            if (Array.isArray(data)) {
                container.innerHTML = '';  // Clear any existing content
                data.forEach(job => {
                    const jobBox = document.createElement('div');
                    jobBox.classList.add('job-box');
                    jobBox.onclick = () => {
                        showJobDetails(job);  // Show the detailed job box when clicked
                    };

                    jobBox.innerHTML = `
                        <h2>${job.title}</h2>
                        <p>Role: ${job.role}</p>
                        <p>Location: ${job.location}</p>
                        <p>Application Deadline: ${new Date(job.application_deadline).toLocaleDateString()}</p>
                    `;

                    container.appendChild(jobBox);
                });
            } else {
                console.error("Fetched data is not an array", data);
            }
        })
        .catch(error => {
            console.error('Error fetching job listings:', error);
        });

    // Function to show job details in a big box
    function showJobDetails(job) {
        jobDetailsBox.innerHTML = `
            <h2>${job.title}</h2>
            <p><strong>Role:</strong> ${job.role}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Salary:</strong> ₹${job.salary}</p>
            <p><strong>Required Skills:</strong> ${job.required_skills}</p>
            <p><strong>Description:</strong> ${job.description}</p>
            <p><strong>Application Deadline:</strong> ${new Date(job.application_deadline).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${job.job_status}</p>
            <button class="btn" id="applyJob">Apply</button>
            <button class="btn" id="closeJobDetails">Close</button>
        `;
        jobDetailsBox.style.display = 'block';  // Show the job details box
        overlay.style.display = 'block';  // Show the blur overlay
        document.body.style.overflow = 'hidden';  // Disable scrolling

        // Add click event to close the job details box
        const closeJobDetailsBtn = document.getElementById('closeJobDetails');
        closeJobDetailsBtn.onclick = closeJobDetails;


        //add click event to apply for
        const applyJobBtn = document.getElementById('applyJob');
        applyJobBtn.onclick = () => showApplyDialog(job);


        function showApplyDialog(job) {
            // Create a modal dynamically to display the confirmation dialog
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.background = '#fff';
            modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            modal.style.padding = '20px';
            modal.style.zIndex = '1000';
            modal.style.borderRadius = '8px';
            modal.style.width = '300px';
            modal.style.textAlign = 'center';
        
            // Modal content
            modal.innerHTML = `
                <h3>Confirm Application</h3>
                <p>Submitting application:</p>
                <p>Confirm application for <strong>${job.title}</strong>?</p>
                <button id="confirmApply" style="margin-right: 10px; padding: 5px 10px;">Yes</button>
                <button id="cancelApply" style="padding: 5px 10px;">No</button>
            `;
        
            // Append modal to the body
            document.body.appendChild(modal);
        
            // Event listeners for buttons
            document.getElementById('confirmApply').addEventListener('click', async () => {
                try {
                    console.log("applying!");
                    console.log(`${userId}`)
                    // Sending the application details to the backend
                    const response = await fetch(`/api/joblisting/${userId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: 'apply',           // Action type to specify it's an application
                            jobId: job.job_id,       // The job ID for the application
                            status: 'submitted'      // Status of the application
                        }),
                    });
            
                    if (response.ok) {
                        alert('Application submitted successfully!');
                    } else {
                        const errorData = await response.json();
                        alert(`Failed to apply: ${errorData.error}`);
                    }
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            
                // Remove the modal after the action
                document.body.removeChild(modal);
            });
        
            document.getElementById('cancelApply').addEventListener('click', () => {
                alert('Application cancelled.');
                document.body.removeChild(modal);
            });
        }
        


    }

    // Function to close the job details box
    function closeJobDetails() {
        jobDetailsBox.style.display = 'none';  // Hide the job details box
        overlay.style.display = 'none';  // Hide the blur overlay
        document.body.style.overflow = '';  // Enable scrolling
    }

    // Handle "Post a Job" button click
    if (jobCreateLink && userId) {
        jobCreateLink.onclick = () => {
            window.location.href = `/createjob/${userId}`;  // Fixed string template literal
        };
    }

    // Toggle panel visibility (My Jobs sidebar)
    function togglePanel() {
        panel.classList.toggle('open');  // Toggle the 'open' class on the panel
    }

    // Function to render the jobs in the sidebar (only jobs matching userId)
    function renderJobs() {
        console.log("Rendering jobs for user:", userId);  // Debugging renderJobs
        // Fetch jobs from the server using the userId
        fetch(`/api/joblisting/${userId}?type=find%20all%20jobs`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched jobs for rendering:", data);  // Log fetched jobs
    
            // Filter jobs to show only those belonging to the current user
            const userJobs = data.filter(job => job.user_id === parseInt(userId));  // Matching user_id
    
            console.log("Filtered user jobs:", userJobs);  // Log the filtered jobs
    
            // Render jobs
            myJobsList.innerHTML = userJobs.map(job => `
                <div class="job-item" data-job-id="${job.job_id}">
                    <div class="job-item-header">
                        <span class="job-title">${job.title}</span>
                        <span class="job-status status-${job.job_status.toLowerCase()}" data-job-id="${job.job_id}">${job.job_status}</span>
                    </div>
                    <button class="btn" onclick="toggleActions(${job.job_id})">Update</button>
                    <div class="job-actions" data-job-id="${job.job_id}">
                        <button class="action-btn" onclick="updateStatus(${job.job_id}, 'Open')">Set as Open</button>
                        <button class="action-btn" onclick="updateStatus(${job.job_id}, 'Full')">Set as Full</button>
                        <button class="action-btn" onclick="updateStatus(${job.job_id}, 'Closed')">Set as Closed</button>
                        <button class="action-btn delete" onclick="deleteJob(${job.job_id})">Delete Job</button>
                    </div>
                </div>`
            ).join('');
        })
        .catch(error => console.error("Error fetching jobs for rendering:", error));
    }

    // Toggle the display of job actions
    function toggleActions(jobId) {
        const allActions = document.querySelectorAll('.job-actions');
        allActions.forEach(action => {
            if (action.dataset.jobId !== jobId.toString()) {
                action.classList.remove('show');
            }
        });

        const targetActions = document.querySelector(`.job-actions[data-job-id="${jobId}"]`);
        targetActions.classList.toggle('show');
    }

    // Update job status
    function updateStatus(jobId, newStatus) {
        console.log(`Updating job ${jobId} to ${newStatus}`);  // Fixed string template literal
        fetch(`/api/joblisting/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jobId: jobId,
                type: 'update status',
                status: newStatus
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log(data.message);
                // Update the status label in the UI
                const statusElement = document.querySelector(`.job-status[data-job-id="${jobId}"]`);
                statusElement.textContent = newStatus;
                statusElement.className = `job-status status-${newStatus.toLowerCase()}`;
            } else {
                console.error("Failed to update status:", data);
            }
        })
        .catch(error => console.error('Error updating status:', error));

        // Hide the actions menu
        const actions = document.querySelector(`.job-actions[data-job-id="${jobId}"]`);
        actions.classList.remove('show');
    }

    // Delete job
    function deleteJob(jobId) {
        console.log(`Deleting job ${jobId}`);  // Fixed string template literal
        fetch(`/api/joblisting/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jobId: jobId,
                type: 'delete'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log(data.message);
                // Remove the job item from the UI
                const jobElement = document.querySelector(`.job-item[data-job-id="${jobId}"]`);
                jobElement.remove();
            } else {
                console.error("Failed to delete job:", data);
            }
        })
        .catch(error => console.error('Error deleting job:', error));
    }

    // Handle "My Jobs" button click (toggle sidebar)
    toggleBtn.addEventListener('click', () => {
        renderJobs(); // Only render jobs that belong to the user
        togglePanel(); // Toggle the sidebar visibility
    });

    // Close the sidebar
    closeBtn.addEventListener('click', togglePanel);

    // Make functions globally available
    window.toggleActions = toggleActions;
    window.updateStatus = updateStatus;
    window.deleteJob = deleteJob;


    // Function to toggle the left panel visibility
    function toggleAppliedJobsPanel() {
        const panel = document.getElementById('appliedJobsPanel');
        panel.classList.toggle('open'); // Slide panel in/out of view
    }

    function renderAppliedJobs(userId) {
        console.log("Fetching applied jobs for user:", userId); // Debugging
    
        // Construct the API URL with the `type` parameter
        const apiUrl = `/api/joblisting/${userId}?type=find all my applications`;
    
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched applied jobs:", data); // Debugging
    
                const appliedJobsList = document.getElementById('appliedJobsList');
                appliedJobsList.innerHTML = data.map(job => `
                    <div class="applied-job-item" data-application-id="${job.application_id}">
                        <div class="applied-job-header">
                            <span class="job-title">${job.title}</span>
                            <span class="job-status status-${job.status.toLowerCase()}">${job.status}</span>
                        </div>
                        <span class="application-id">Application ID: ${job.application_id}</span>
                    </div>
                `).join(''); // Render each job as a list item
            })
            .catch(error => console.error("Error fetching applied jobs:", error));
    }
    

    // Event listener to toggle panel
    document.getElementById('appliedJobsButton').addEventListener('click', toggleAppliedJobsPanel);

    // Event listener to close panel
    document.getElementById('closeAppliedJobsPanel').addEventListener('click', toggleAppliedJobsPanel);

    // Example usage: Render jobs for a specific user when page loads
    renderAppliedJobs(userId);

});