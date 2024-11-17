document.getElementById("job-post-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const jobData = {
        title: document.getElementById("job-title").value,
        description: document.getElementById("job-description").value,
        role: document.getElementById("job-role").value,
        location: document.getElementById("location").value,
        salary: document.getElementById("salary").value,
        application_deadline: document.getElementById("application-deadline").value,
        job_status: document.getElementById("job-status").value,
        required_skills: document.getElementById("required-skills").value,
        application_count: document.getElementById("application-count").value
    };

    // Extract user ID from the URL path
    const userId = window.location.pathname.split('/')[2];

    console.log("inside createjob.js, posting job for user ID:", userId);

    try {
        // Send POST request to the correct API endpoint
        const response = await fetch(`/api/createjob/${userId}`, {  // Update URL here
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        });

        if (response.ok) {
            alert("Job posted successfully!");
            document.getElementById("job-post-form").reset();
            // Go back to the previous page (job listing page)
            window.history.back();
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
        }
    } catch (error) {
        console.error("Error posting job:", error);
        alert("An error occurred while posting the job.");
    }
});
