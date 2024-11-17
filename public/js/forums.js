async function fetchDefaultForum(userId) {
    try {
        const response = await fetch(`/api/forums/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const defaultForum = await response.json();

        if (defaultForum && defaultForum.title) {  // Check if forum data exists and has a title
            const defaultForumContainer = document.getElementById('defaultForum');
            if (!defaultForumContainer) {
                console.error('Default forum container not found');
                return;
            }
            
            defaultForumContainer.innerHTML = '';  // Clear existing content

            // Create a button element for the default forum
            const defaultForumButton = document.createElement('button');
            defaultForumButton.classList.add('default-forum-button');
            defaultForumButton.textContent = defaultForum.title;
            defaultForumButton.onclick = () => showForumDetails(defaultForum);
            defaultForumContainer.appendChild(defaultForumButton);
        } else {
            console.log('No forum found or forum missing title:', defaultForum);
            // Optional: Display a message to the user
            const defaultForumContainer = document.getElementById('defaultForum');
            if (defaultForumContainer) {
                defaultForumContainer.innerHTML = '<p>No forum found. Please create one.</p>';
            }
        }
    } catch (error) {
        console.error('Error fetching default forum:', error);
        // Display error message to user
        const defaultForumContainer = document.getElementById('defaultForum');
        if (defaultForumContainer) {
            defaultForumContainer.innerHTML = '<p>Error loading forum. Please try again later.</p>';
        }
    }
}

function showForumDetails(forumDetails) {
    const popup = document.getElementById('forumDetailsPopup');
    if (!popup) {
        console.error('Forum details popup element not found');
        return;
    }

    // Add null checks for all forum details
    const title = forumDetails.title || 'No title available';
    const branch = forumDetails.branch_name || 'No branch available';
    const year = forumDetails.year_of_graduation || 'No year available';
    const date = forumDetails.custom_date || 'No date available';

    // Update popup content with null-safe values
    const titleElement = popup.querySelector('.forumTitle');
    const branchElement = popup.querySelector('.forumBranch');
    const yearElement = popup.querySelector('.forumYear');
    const dateElement = popup.querySelector('.forumDate');

    if (titleElement) titleElement.textContent = title;
    if (branchElement) branchElement.textContent = `Branch: ${branch}`;
    if (yearElement) yearElement.textContent = `Year of Graduation: ${year}`;
    if (dateElement) dateElement.textContent = `Date Created: ${date}`;

    popup.style.display = 'block';
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get userId from URL
    const pathParts = window.location.pathname.split('/');
    const userId = pathParts[2];  // Assuming URL pattern is /something/userId/...
    
    if (!userId) {
        console.error('User ID not found in URL');
        return;
    }

    fetchDefaultForum(userId);

    // Attach event listener to "Create New Topic" button if it exists
    const createForumBtn = document.getElementById('createForumBtn');
    if (createForumBtn) {
        createForumBtn.addEventListener('click', createForum);
    }
});
