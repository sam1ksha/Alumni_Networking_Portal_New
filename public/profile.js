async function fetchUserProfile() {
    const userId = window.location.pathname.split('/')[2]; // Extract user ID from the URL
    console.log('Extracted userId:', userId); // Log extracted userId

    try {
        const response = await fetch(`/api/profile/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Response status:', response.status); // Log response status

        if (response.ok) {
            const userData = await response.json();
            console.log('User Data:', userData); // Log the user data
            displayUserProfile(userData);
        } else {
            console.error('Failed to fetch user profile, status code:', response.status);
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

// Function to format dates to "Month YYYY"
function formatDate(isoDate) {
    if (!isoDate) return 'N/A';
    const options = { year: 'numeric', month: 'long' };
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', options);
}

// Function to display experiences in the desired format
function displayExperienceList(experiences) {
    const experienceList = document.getElementById('experience-list');
    experienceList.innerHTML = ''; // Clear any existing content

    // Handle cases where experiences is null, undefined, or an empty array
    if (!experiences || (Array.isArray(experiences) && experiences.length === 0)) {
        experienceList.style.display = 'none'; // Hide the section if no experiences
        return;
    }

    // Ensure the experience list section is visible
    experienceList.style.display = 'block';

    // Ensure experiences is treated as an array
    const experienceArray = Array.isArray(experiences) ? experiences : [experiences];

    experienceArray.forEach(experience => {
        const experienceItem = document.createElement('div');
        experienceItem.classList.add('experience-item');

        // Add job title if available
        if (experience.jobTitle) {
            const jobTitle = document.createElement('h4');
            jobTitle.textContent = experience.jobTitle;
            experienceItem.appendChild(jobTitle);
        }

        // Add company name if available
        if (experience.companyName) {
            const companyName = document.createElement('p');
            companyName.innerHTML = `<strong>Company:</strong> ${experience.companyName}`;
            experienceItem.appendChild(companyName);
        }

        // Add duration if start and/or end dates are available
        if (experience.startDate || experience.currentlyEmployed || experience.endDate) {
            const startDate = formatDate(experience.startDate);
            const endDate = experience.currentlyEmployed === 'yes' ? 'Present' : formatDate(experience.endDate);
            const duration = document.createElement('p');
            duration.innerHTML = `<strong>Duration:</strong> From: ${startDate} to ${endDate}`;
            experienceItem.appendChild(duration);
        }

        // Add responsibilities if available
        if (experience.responsibilities) {
            const responsibilities = document.createElement('p');
            responsibilities.innerHTML = `<strong>Responsibilities:</strong>`;
            experienceItem.appendChild(responsibilities);

            const responsibilitiesList = document.createElement('ul');
            experience.responsibilities.split('\n').forEach(res => {
                const listItem = document.createElement('p');
                listItem.textContent = res;
                responsibilitiesList.appendChild(listItem);
            });
            experienceItem.appendChild(responsibilitiesList);
        }

        // Append the experience item to the experience list
        experienceList.appendChild(experienceItem);
    });
}



function displayUserProfile(userData) {
    console.log('User Data in displayUserProfile:', userData);

    const profileName = document.querySelector('.profile-name');
    const profileBranch = document.querySelector('.profile-branch');
    const profileBatch = document.querySelector('.profile-batch');
    //const profilePic = document.querySelector('.profile-pic img');
    const resumeLink = document.getElementById('resume-link');
    const socialLinks = document.getElementById('social-links');
    const experienceList = document.getElementById('experience-list');
    const status = document.getElementById('thoughts-display');

    if (userData && userData.success) {
        // Display full name by combining first, middle, and last name
        const fullName = `${userData.data.firstName || ''} ${userData.data.middleName || ''} ${userData.data.lastName || ''}`.trim();
        profileName.innerText = fullName || 'Name not available';

        // Display branch name and batch
        profileBranch.innerText = userData.data.branchName || 'Branch not available';
        profileBatch.innerText = `Batch of ${userData.data.yearOfGraduation || 'N/A'}`;

        // Display profile picture (if available)
        //profilePic.src = userData.data.profilePicture || 'default_profile_picture.jpg';

        // Display resume link if available
        if (userData.data.resume) {
            resumeLink.innerHTML = `<a href="${userData.data.resume}" target="_blank">View Resume</a>`;
        } else {
            resumeLink.innerText = 'No resume uploaded';
        }

        // Display status
        if (userData.data.status) {
            status.innerText = `${userData.data.status}`;
        }

        // Display social media links
        socialLinks.innerHTML = ''; // Clear any previous links
        if (userData.data.links) {
            if (userData.data.links.linkedin) {
                socialLinks.innerHTML += `<a href="${userData.data.links.linkedin}" target="_blank">LinkedIn</a><br>`;
            }
            if (userData.data.links.github) {
                socialLinks.innerHTML += `<a href="${userData.data.links.github}" target="_blank">GitHub</a><br>`;
            }
            if (userData.data.links.other) {
                socialLinks.innerHTML += `<a href="${userData.data.links.other}" target="_blank">Other</a><br>`;
            }
        }

        // Display work experience
        experienceList.innerHTML = ''; // Clear previous experiences
        if (userData.data.workExperience) {
            displayExperienceList(userData.data.workExperience);
        }
    } else {
        profileName.innerText = 'Profile not found';
        profileBranch.innerText = 'Branch not available';
        profilePic.src = 'default_profile_picture.jpg';
        resumeLink.innerText = 'No resume uploaded';
        socialLinks.innerHTML = '<p>No social links available</p>';
        experienceList.innerHTML = '<p>No work experience listed</p>';
    }
}

// Initialize the profile page
document.addEventListener('DOMContentLoaded', fetchUserProfile);

async function postThoughts() {
    const userId = window.location.pathname.split('/')[2];
    const thoughtsContent = document.getElementById('thoughts').value;

    if (thoughtsContent.trim() !== "") {
        try {
            const response = await fetch(`/api/profile/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    type:'status',
                    status: thoughtsContent
                })
            });

            const result = await response.json();

            if (result.success) {
                document.getElementById('thoughts-display').textContent = thoughtsContent;
                document.getElementById('thoughts').value = "";
                alert(result.message);
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error posting status:', error);
            alert('Failed to update status. Please try again.');
        }
    } else {
        alert("Please enter something to post!");
    }
}


// Function to toggle the visibility of the social media link form
function toggleLinkForm() {
    const linkForm = document.getElementById('link-form');
    const addLinkButton = document.getElementById('add-link-button');
    
    // Toggle the visibility of the form
    if (linkForm.style.display === 'none') {
        linkForm.style.display = 'block';
        addLinkButton.style.display = 'none'; // Hide "Add Links" button when form is visible
    } else {
        linkForm.style.display = 'none';
        addLinkButton.style.display = 'inline-block'; // Show "Add Links" button again when form is hidden
    }
}

// Function to send social links to the server
async function postSocialLinks(userId, linkedin, github, other) {
    try {
        const response = await fetch(`/api/profile/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type:'link',
                linkedin_url: linkedin,
                github_url: github,
                other_url: other
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log("Links updated successfully:", result.message);
        } else {
            console.error("Error updating links:", result.message);
        }
    } catch (error) {
        console.error("Error posting links:", error);
    }
}

function addSocialLinks() {
    const userId = window.location.pathname.split('/')[2];
    const linkedin = document.getElementById('linkedin').value.trim();
    const github = document.getElementById('github').value.trim();
    const other = document.getElementById('other').value.trim();
    
    // Create a new div to display the links
    const socialLinksDiv = document.getElementById('social-links');
    
    // Clear previous links before adding new ones
    socialLinksDiv.innerHTML = '';

    // Only add the link if it's not empty
    if (linkedin || github || other) {
        // Add the new link
        if (linkedin) {
            const linkedinItem = document.createElement('div');
            linkedinItem.classList.add('social-link-item');
            linkedinItem.innerHTML = `<p><strong>LinkedIn:</strong> <a href="${linkedin}" target="_blank">${linkedin}</a></p>`;
            socialLinksDiv.appendChild(linkedinItem);
        }

        if (github) {
            const githubItem = document.createElement('div');
            githubItem.classList.add('social-link-item');
            githubItem.innerHTML = `<p><strong>GitHub:</strong> <a href="${github}" target="_blank">${github}</a></p>`;
            socialLinksDiv.appendChild(githubItem);
        }

        if (other) {
            const otherItem = document.createElement('div');
            otherItem.classList.add('social-link-item');
            otherItem.innerHTML = `<p><strong>Other:</strong> <a href="${other}" target="_blank">${other}</a></p>`;
            socialLinksDiv.appendChild(otherItem);
        }

        // Hide the form after adding the links
        toggleLinkForm();

        // Clear the input fields after adding the links
        document.getElementById('linkedin').value = '';
        document.getElementById('github').value = '';
        document.getElementById('other').value = '';

        // Post the links to the database
        postSocialLinks(userId, linkedin, github, other);
    } else {
        alert('Please enter at least one link.');
    }
}

function toggleExperienceForm() {
    // Get the experience form element
    const experienceForm = document.getElementById('experience-form');
    
    // Toggle the visibility of the experience form
    if (experienceForm.style.display === "none" || experienceForm.style.display === "") {
        experienceForm.style.display = "block";
    } else {
        experienceForm.style.display = "none";
    }
}

async function postWorkExperience(userId, jobTitle, companyName, currentlyEmployed, startDate, endDate, responsibilities) {
    try {
        const response = await fetch(`/api/profile/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'work_exp',
                job_title: jobTitle,
                company_name: companyName,
                currently_employed: currentlyEmployed,
                start_date: startDate,
                end_date: endDate,
                responsibilities: responsibilities
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log("Work experience added successfully:", result.message);
            // Optionally, reload the experience list or update UI
        } else {
            console.error("Error adding work experience:", result.message);
        }
    } catch (error) {
        console.error("Error posting work experience:", error);
    }
}



function addExperience(event) {
    // Prevent the form from submitting (default form behavior)
    event.preventDefault();
    const userId = window.location.pathname.split('/')[2];
    // Get the values from the input fields
    const jobTitle = document.getElementById('job-title').value.trim();
    const companyName = document.getElementById('company-name').value.trim();
    const currentlyEmployed = document.getElementById('currently-employed').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = currentlyEmployed === 'no' ? document.getElementById('end-date').value : 'Present';
    const responsibilities = document.getElementById('responsibilities').value.trim();

    // Validate the inputs (ensure none of them are empty, except responsibilities)
    if (!jobTitle || !companyName || !startDate) {
        alert("Please fill in all required fields.");
        return;
    }

    // Format the duration
    const duration = currentlyEmployed === 'yes' ? `Started: ${startDate}` : `From ${startDate} to ${endDate}`;

    // Create a new experience item to be displayed
    const experienceItem = document.createElement('div');
    experienceItem.classList.add('experience-item');

    // Set the content of the experience item
    experienceItem.innerHTML = `
        <h4>${jobTitle}</h4>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        ${responsibilities ? `<p><strong>Responsibilities:</strong> ${responsibilities}</p>` : ''}
    `;
    postWorkExperience(userId, jobTitle, companyName, currentlyEmployed, startDate, endDate, responsibilities);

    // Add the new experience item to the experience list
    const experienceList = document.getElementById('experience-list');
    experienceList.appendChild(experienceItem);

    // Hide the form after adding the experience (optional)
    toggleExperienceForm();

    // Clear the form fields
    document.getElementById('job-title').value = '';
    document.getElementById('company-name').value = '';
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('responsibilities').value = '';
}



function previewImage() {
    const file = document.getElementById('file-input').files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        document.getElementById('profile-img').src = e.target.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}

function uploadResume() {
    // Get the file input element
    const resumeFile = document.getElementById('resume-file').files[0];
    
    // Check if a file is selected
    if (resumeFile) {
        // Create a URL for the uploaded file
        const resumeLink = URL.createObjectURL(resumeFile);
        
        // Display the link to the uploaded resume
        const resumeLinkElement = document.getElementById('resume-link');
        resumeLinkElement.innerHTML = `<a href="${resumeLink}" target="_blank">View Uploaded Resume</a>`;
    } else {
        alert("Please select a file to upload.");
    }
}
