// API Base URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const googleBtn = document.getElementById('googleBtn');
const errorMessage = document.getElementById('errorMessage');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const passwordToggles = document.querySelectorAll('.password-toggle');

// Tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active form
        authForms.forEach(form => {
            if (form.id === `${targetTab}Form`) {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
        
        // Clear error message
        hideError();
    });
});

// Password visibility toggle
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const targetId = toggle.dataset.target;
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    });
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const submitBtn = loginForm.querySelector('.submit-btn');
    setLoading(submitBtn, true);
    hideError();
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Store session token
        localStorage.setItem('authToken', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to main app
        window.location.href = 'index.html';
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(submitBtn, false);
    }
});

// Signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    const submitBtn = signupForm.querySelector('.submit-btn');
    setLoading(submitBtn, true);
    hideError();
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }
        
        // Check if session exists (might be null if email confirmation is required)
        if (data.session && data.session.access_token) {
            // Store session token
            localStorage.setItem('authToken', data.session.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to main app
            window.location.href = 'index.html';
        } else {
            // Email confirmation required
            showError('Please check your email to confirm your account, then login.');
            // Switch to login tab
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
            }, 3000);
        }
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(submitBtn, false);
    }
});

// Google OAuth login
googleBtn.addEventListener('click', async () => {
    console.log('Google login button clicked');
    setLoading(googleBtn, true);
    hideError();
    
    try {
        console.log('Fetching Google Auth URL from server...');
        const response = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Server returned error:', data);
            throw new Error(data.error || 'Google login failed');
        }
        
        if (data.url) {
            console.log('Redirecting to Google Auth URL:', data.url);
            // Redirect to Google OAuth - Supabase will handle the callback
            window.location.href = data.url;
        } else {
            throw new Error('No authentication URL received');
        }
    } catch (error) {
        console.error('Google login error:', error);
        showError(error.message);
        setLoading(googleBtn, false);
    }
});

// Handle OAuth callback (when redirected back from Google)
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const accessToken = hashParams.get('access_token');

if (accessToken) {
    // Store the token and redirect to main app
    localStorage.setItem('authToken', accessToken);
    
    // Get user info
    fetch(`${API_URL}/auth/user`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        console.error('Error getting user:', error);
        window.location.href = 'index.html';
    });
}

// Helper functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

function setLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text') || button;
    
    if (isLoading) {
        button.disabled = true;
        const originalText = btnText.textContent;
        btnText.dataset.originalText = originalText;
        btnText.innerHTML = '<span class="loading-spinner"></span>';
    } else {
        button.disabled = false;
        const originalText = btnText.dataset.originalText;
        if (originalText) {
            btnText.textContent = originalText;
        }
    }
}

// Check if already logged in
const token = localStorage.getItem('authToken');
if (token) {
    // Verify token is still valid
    fetch(`${API_URL}/auth/user`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            window.location.href = 'index.html';
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    })
    .catch(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    });
}
