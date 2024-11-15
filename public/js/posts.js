// posts.js

// Function to fetch and display posts
async function fetchPosts() {
    try {
        const response = await fetch('/api/posts'); // Your backend route for fetching posts
        const posts = await response.json();

        const postsList = document.getElementById('postsList');
        postsList.innerHTML = '';  // Clear previous posts

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
        console.error('Error fetching posts:', error);
    }
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
