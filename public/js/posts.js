// posts.js

// Fetch and display posts
async function fetchPosts(feedType = 'all', searchTerm = '') {
    try {
        let url = `/api/posts?type=${feedType}`;
        if (feedType === 'search' && searchTerm) {
            url = `/api/posts/search?username=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url);
        
        // Check if the response is ok
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const posts = await response.json();
        const postsList = document.getElementById('postsList');
        postsList.innerHTML = ''; // Clear previous posts

        if (posts.length === 0) {
            postsList.innerHTML = '<li class="no-posts">No posts found.</li>';
            return;
        }

        posts.forEach(post => {
            const li = document.createElement('li');
            li.className = 'post-card';
            
            li.innerHTML = `
                <div class="post-header">
                    <h3>${post.authorName || 'Unknown User'}</h3>
                    <span>${post.createdAt ? formatDate(post.createdAt) : 'Unknown Date'}</span>
                </div>
                <div class="post-content">
                    <p>${post.content || 'No content available'}</p>
                    ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : ''}
                </div>
                <div class="post-actions">
                    <button class="${post.userLiked ? 'active' : ''}" onclick="reactToPost(${post.id}, 'like')">
                        👍 <span>${post.likes}</span>
                    </button>
                    <button class="${post.userDisliked ? 'active' : ''}" onclick="reactToPost(${post.id}, 'dislike')">
                        👎 <span>${post.dislikes}</span>
                    </button>
                </div>
            `;

            postsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        const postsList = document.getElementById('postsList');
        postsList.innerHTML = `<li class="error-message">Error loading posts. Please try again later.</li>`;
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


// Function to create a new post
document.getElementById('createPostForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const content = document.getElementById('postContent').value;
    const image = document.getElementById('imageUpload').files[0];

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            alert('Post created successfully!');
            fetchPosts(); // Reload posts after successful creation
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
});

// Function to like a post
async function likePost(postId) {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    fetchPosts(); // Reload posts after liking
}

// Function to dislike a post
async function dislikePost(postId) {
    await fetch(`/api/posts/${postId}/dislike`, { method: 'POST' });
    fetchPosts(); // Reload posts after disliking
}

// Function to search posts or users
async function searchPosts() {
    const searchQuery = document.getElementById('searchInput').value;

    try {
        const response = await fetch(`/api/posts/search?query=${searchQuery}`);
        const posts = await response.json();

        const postsList = document.getElementById('postsList');
        postsList.innerHTML = ''; // Clear previous posts

        posts.forEach(post => {
            const postCard = `
                <div class="post-card">
                    <h3>${post.first_name} ${post.last_name}</h3>
                    <p>${post.content}</p>
                    ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
                    <div class="post-actions">
                        <button onclick="likePost(${post.post_id})">👍 ${post.likes}</button>
                        <button onclick="dislikePost(${post.post_id})">👎 ${post.dislikes}</button>
                    </div>
                </div>
            `;
            postsList.innerHTML += postCard;
        });
    } catch (error) {
        console.error('Error searching posts:', error);
    }
}

// Call fetchPosts when the page loads
window.onload = fetchPosts;