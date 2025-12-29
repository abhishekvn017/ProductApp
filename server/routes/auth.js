const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name || email.split('@')[0]
                },
                emailRedirectTo: 'http://localhost:3000/index.html'
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // If session is null, it means email confirmation is required
        if (!data.session) {
            return res.json({
                message: 'Signup successful. Please check your email to confirm your account.',
                user: data.user,
                session: null,
                requiresConfirmation: true
            });
        }

        res.json({
            message: 'Signup successful',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        res.json({
            message: 'Login successful',
            user: data.user,
            session: data.session
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            await supabase.auth.signOut();
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

/**
 * GET /api/auth/user
 * Get current user information
 */
router.get('/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

/**
 * POST /api/auth/google
 * Initiate Google OAuth login
 */
router.post('/google', async (req, res) => {
    try {
        console.log('Initiating Google OAuth flow...');
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Ensure this matches exactly what is in Supabase Dashboard > Authentication > URL Configuration
                redirectTo: 'http://localhost:3000/index.html',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });

        if (error) {
            console.error('Supabase Google Auth Error:', error);
            return res.status(400).json({ error: error.message });
        }

        console.log('Google Auth URL generated successfully');
        res.json({ url: data.url });
    } catch (error) {
        console.error('Server Google OAuth error:', error);
        res.status(500).json({ error: 'Google login failed' });
    }
});

module.exports = router;
