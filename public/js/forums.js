// Fetch and display the default forum
async function fetchDefaultForum(userId) {
    try {
        const response = await fetch(`/api/forums/${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch forum: ${response.statusText}`);
        }

        const forum = await response.json();
        console.log('Forum fetched successfully:', forum);

        const forumButton = document.createElement('button');
        forumButton.textContent = forum.title;
        forumButton.className = 'forum-button';

        forumButton.onclick = () => {
            const popup = document.getElementById('forumDetailsPopup');
            document.querySelector('.forumTitle').textContent = `Title: ${forum.title}`;
            document.querySelector('.forumBranch').textContent = `Branch: ${forum.branch_name}`;
            document.querySelector('.forumYear').textContent = `Year of Graduation: ${forum.year_of_graduation}`;
            document.querySelector('.forumDate').textContent = `Created On: ${forum.custom_date}`;
            popup.style.display = 'block';
        };

        document.getElementById('defaultForum').appendChild(forumButton);
    } catch (error) {
        console.error('Error fetching forum:', error.message);
    }
}


// Event listener for creating a new forum topic (not default)
document.getElementById('createForumBtn').addEventListener('click', () => {
    alert('Feature to create a new forum is under development.');
});
