const express = require('express');
const path = require('path');
const session = require('express-session');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ShArAnYa123!@#',
    database: process.env.DB_NAME || 'alumni_portal'
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    key: 'session_cookie_name',
    secret: 'your-secret-key', // Use a secure secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));

// Authentication middleware
const authenticateUser = (req, res, next) => {
    if (req.session.userId) {
        next(); // If session exists, proceed to the next middleware/route
    } else {
        res.redirect('/'); // Redirect to the login page if no session
    }
};

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);
const postsRoutes = require('./routes/postsRoutes'); 
app.use('/api/posts', postsRoutes);
const forumRoutes = require('./routes/forumRoutes'); 
app.use('/api/forums', forumRoutes);
const createjobRoutes = require('./routes/createjobRoutes');
app.use('/api/createjob', createjobRoutes);  // Correct route for creating a job
const listjobRoutes = require('./routes/joblistingRoutes');
app.use('/api/joblisting', listjobRoutes);  // Correct route for creating a job


app.get('/favicon.ico', (req, res) => res.status(204).end());


// Serve Pages (HTML Files)
// Profile page
app.get('/profile/:id', authenticateUser, async (req, res) => {
    const userId = req.params.id;
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});


// Posts page
app.get('/posts/:uid', authenticateUser, (req, res) => {
    const userId = req.params.id;
    res.sendFile(path.join(__dirname, 'public', 'posts.html'));
});

// Forums page
app.get('/forums/:uid', authenticateUser, (req, res) => {
    const userId = req.params.id;
    res.sendFile(path.join(__dirname, 'public', 'forums.html'));
});


app.get('/createjob/:uid', (req, res) => {
    const userId = req.params.uid;  // Get the user ID from the URL parameter
    console.log('User ID from URL in create job page:', userId);

    // Render the job_listing.html page
    res.sendFile(path.join(__dirname, 'public', 'createjob.html'));
});


app.get('/joblisting/:uid', (req, res) => {
    const userId = req.params.uid;  // Get the user ID from the URL parameter
    console.log('User ID from URL:', userId);

    // Render the job_listing.html page
    res.sendFile(path.join(__dirname, 'public', 'job_listing.html'));
});




// Default route (could be homepage or login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});
