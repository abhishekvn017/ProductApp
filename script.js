// ===================================
// AUTHENTICATION & API
// ===================================
const API_URL = 'http://localhost:3000/api';
let currentUser = null;

// Check authentication on page load
async function checkAuth() {
    // Handle OAuth callback (Google login redirect)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
        // Store the token from OAuth callback
        localStorage.setItem('authToken', accessToken);
        // Clean up URL
        window.location.hash = '';
    }
    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid session');
        }
        
        const data = await response.json();
        currentUser = data.user;
        updateUserProfile();
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    }
}

// Update user profile display
function updateUserProfile() {
    if (!currentUser) return;
    
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) {
        userName.textContent = currentUser.user_metadata?.name || currentUser.email.split('@')[0];
    }
    
    if (userEmail) {
        userEmail.textContent = currentUser.email;
    }
}

// Logout function
async function logout() {
    const token = localStorage.getItem('authToken');
    
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    }
}

// ===================================
// STATE MANAGEMENT
// ===================================
let cart = [];
let currentProduct = null;

// ===================================
// DOM ELEMENTS
// ===================================
const productsGrid = document.getElementById('productsGrid');
const productModal = document.getElementById('productModal');
const modalOverlay = productModal.querySelector('.modal-overlay');
const modalClose = productModal.querySelector('.modal-close');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');
const modalColors = document.getElementById('modalColors');
const toast = document.getElementById('toast');
const cartBtn = document.querySelector('.cart-btn');
const cartCount = document.querySelector('.cart-count');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartCloseBtn = document.querySelector('.cart-close-btn');
const cartOverlay = document.querySelector('.cart-overlay');
const navBtns = document.querySelectorAll('.nav-btn');
const logoutBtn = document.getElementById('logoutBtn');

// ===================================
// PRODUCT DATA
// ===================================
const products = [
    {
        id: 1,
        name: 'Premium Wireless Headphones',
        description: 'Immersive sound with active noise cancellation. Experience crystal-clear audio with 40-hour battery life and premium comfort.',
        price: 299,
        originalPrice: 399,
        category: 'electronics',
        gradient: 'product-gradient-1',
        icon: '🎧',
        colors: [
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #3a3a3a)' },
            { name: 'Gold', value: 'linear-gradient(135deg, #c9a961, #d4af77)' },
            { name: 'White', value: 'linear-gradient(135deg, #e8e8e8, #f5f5f5)' }
        ]
    },
    {
        id: 2,
        name: 'Luxury Smartwatch Pro',
        description: 'Advanced fitness tracking and health monitoring. Track your workouts, heart rate, sleep, and more with stunning AMOLED display.',
        price: 449,
        originalPrice: null,
        category: 'electronics',
        gradient: 'product-gradient-2',
        icon: '⌚',
        colors: [
            { name: 'Space Gray', value: 'linear-gradient(135deg, #2c2c2c, #4a4a4a)' },
            { name: 'Gold', value: 'linear-gradient(135deg, #b8860b, #daa520)' },
            { name: 'Silver', value: 'linear-gradient(135deg, #c0c0c0, #e0e0e0)' }
        ]
    },
    {
        id: 3,
        name: 'Ultra Sport Sneakers',
        description: 'Lightweight design for maximum performance. Engineered with responsive cushioning and breathable mesh for all-day comfort.',
        price: 159,
        originalPrice: 199,
        category: 'fashion',
        gradient: 'product-gradient-3',
        icon: '👟',
        colors: [
            { name: 'White', value: 'linear-gradient(135deg, #ffffff, #e0e0e0)' },
            { name: 'Blue', value: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
            { name: 'Red', value: 'linear-gradient(135deg, #991b1b, #dc2626)' }
        ]
    },
    {
        id: 4,
        name: 'Aviator Sunglasses',
        description: 'Classic style with UV400 protection. Premium polarized lenses with durable metal frames for timeless sophistication.',
        price: 129,
        originalPrice: 179,
        category: 'fashion',
        gradient: 'product-gradient-4',
        icon: '🕶️',
        colors: [
            { name: 'Gold', value: 'linear-gradient(135deg, #b8860b, #ffd700)' },
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)' },
            { name: 'Brown', value: 'linear-gradient(135deg, #8b4513, #a0522d)' }
        ]
    },
    {
        id: 5,
        name: 'Professional Mirrorless Camera',
        description: '4K video and 45MP sensor for stunning shots. Professional-grade imaging with advanced autofocus and image stabilization.',
        price: 1299,
        originalPrice: null,
        category: 'electronics',
        gradient: 'product-gradient-5',
        icon: '📷',
        colors: [
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)' },
            { name: 'Silver', value: 'linear-gradient(135deg, #708090, #a9a9a9)' }
        ]
    },
    {
        id: 6,
        name: 'Urban Minimalist Backpack',
        description: 'Sleek design with laptop compartment. Water-resistant material with multiple pockets and ergonomic straps.',
        price: 89,
        originalPrice: 119,
        category: 'lifestyle',
        gradient: 'product-gradient-6',
        icon: '🎒',
        colors: [
            { name: 'Charcoal', value: 'linear-gradient(135deg, #374151, #4b5563)' },
            { name: 'Navy', value: 'linear-gradient(135deg, #1e3a8a, #1e40af)' },
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)' }
        ]
    },
    {
        id: 7,
        name: 'Ultra Thin Laptop Pro',
        description: 'Powerful performance in a sleek design. High-resolution display with all-day battery life for professionals on the go.',
        price: 1499,
        originalPrice: null,
        category: 'electronics',
        gradient: 'product-gradient-7',
        icon: '💻',
        colors: [
            { name: 'Silver', value: 'linear-gradient(135deg, #c0c0c0, #e8e8e8)' },
            { name: 'Space Gray', value: 'linear-gradient(135deg, #2c2c2c, #4a4a4a)' }
        ]
    },
    {
        id: 8,
        name: 'Premium Tablet 12"',
        description: 'Stunning display for work and entertainment. Powerful processor with versatile accessories for productivity.',
        price: 799,
        originalPrice: 899,
        category: 'electronics',
        gradient: 'product-gradient-8',
        icon: '📱',
        colors: [
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)' },
            { name: 'White', value: 'linear-gradient(135deg, #e8e8e8, #f5f5f5)' },
            { name: 'Gold', value: 'linear-gradient(135deg, #b8860b, #daa520)' }
        ]
    },
    {
        id: 9,
        name: 'True Wireless Earbuds',
        description: 'Crystal clear sound with deep bass. Comfortable fit with long battery life and quick charging case.',
        price: 179,
        originalPrice: 229,
        category: 'electronics',
        gradient: 'product-gradient-9',
        icon: '🎵',
        colors: [
            { name: 'White', value: 'linear-gradient(135deg, #ffffff, #e0e0e0)' },
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)' },
            { name: 'Pink', value: 'linear-gradient(135deg, #ffc0cb, #ffb6c1)' }
        ]
    },
    {
        id: 10,
        name: 'Premium Bomber Jacket',
        description: 'Stylish and comfortable for any season. Premium materials with modern cut and versatile design.',
        price: 249,
        originalPrice: 329,
        category: 'fashion',
        gradient: 'product-gradient-10',
        icon: '🧥',
        colors: [
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)' },
            { name: 'Navy', value: 'linear-gradient(135deg, #1e3a8a, #1e40af)' },
            { name: 'Green', value: 'linear-gradient(135deg, #065f46, #047857)' }
        ]
    },
    {
        id: 11,
        name: 'Insulated Water Bottle',
        description: 'Keeps drinks cold for 24 hours. Durable stainless steel with leak-proof lid and wide mouth opening.',
        price: 35,
        originalPrice: 49,
        category: 'lifestyle',
        gradient: 'product-gradient-11',
        icon: '💧',
        colors: [
            { name: 'Blue', value: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
            { name: 'Pink', value: 'linear-gradient(135deg, #ec4899, #f472b6)' },
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)' }
        ]
    },
    {
        id: 12,
        name: 'Smart LED Desk Lamp',
        description: 'Adjustable brightness and color temperature. Touch controls with memory function and USB charging port.',
        price: 79,
        originalPrice: null,
        category: 'lifestyle',
        gradient: 'product-gradient-12',
        icon: '💡',
        colors: [
            { name: 'White', value: 'linear-gradient(135deg, #ffffff, #e0e0e0)' },
            { name: 'Black', value: 'linear-gradient(135deg, #1a1a1a, #2c2c2c)' }
        ]
    }
];

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeEventListeners();
    setupScrollAnimations();
    updateCartDisplay();
    renderCartItems();
});

// ===================================
// EVENT LISTENERS
// ===================================
function initializeEventListeners() {
    // Quick view buttons
    document.querySelectorAll('.quick-view-btn').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openProductModal(products[index]);
        });
    });

    // Add to cart buttons
    document.querySelectorAll('.product-card .add-to-cart-btn').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(products[index]);
        });
    });

    // Color options
    document.querySelectorAll('.product-card .color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const parent = btn.closest('.product-colors');
            parent.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Modal close
    modalClose.addEventListener('click', closeProductModal);
    modalOverlay.addEventListener('click', closeProductModal);

    // Modal add to cart
    const modalAddToCartBtn = productModal.querySelector('.add-to-cart-btn');
    modalAddToCartBtn.addEventListener('click', () => {
        if (currentProduct) {
            addToCart(currentProduct);
            closeProductModal();
        }
    });

    // Navigation buttons
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts(btn.textContent.trim());
        });
    });

    // Cart button
    cartBtn.addEventListener('click', openCartSidebar);
    
    // Cart sidebar close
    cartCloseBtn.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (productModal.classList.contains('active')) {
                closeProductModal();
            }
            if (cartSidebar.classList.contains('active')) {
                closeCartSidebar();
            }
        }
    });
}

// ===================================
// MODAL FUNCTIONS
// ===================================
function openProductModal(product) {
    currentProduct = product;
    
    // Set modal content
    modalImage.className = `modal-image ${product.gradient}`;
    modalImage.innerHTML = `<div class="product-icon">${product.icon}</div>`;
    modalTitle.textContent = product.name;
    modalDescription.textContent = product.description;
    modalPrice.textContent = `$${product.price}`;
    
    // Set colors
    modalColors.innerHTML = product.colors.map(color => 
        `<button class="color-option" style="background: ${color.value}" aria-label="${color.name}"></button>`
    ).join('');
    
    // Activate first color
    modalColors.querySelector('.color-option')?.classList.add('active');
    
    // Add color click handlers
    modalColors.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            modalColors.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Show modal
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
    currentProduct = null;
}

// ===================================
// CART FUNCTIONS
// ===================================
function addToCart(product) {
    cart.push(product);
    updateCartDisplay();
    renderCartItems();
    showToast();
    animateCartButton();
    // Open cart sidebar automatically
    setTimeout(() => {
        openCartSidebar();
    }, 500);
}

function updateCartDisplay() {
    cartCount.textContent = cart.length;
    updateCartTotal();
}

function animateCartButton() {
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 300);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    renderCartItems();
}

function updateCartTotal() {
    const total = cart.reduce((sum, product) => sum + product.price, 0);
    cartTotalPrice.textContent = `$${total.toLocaleString()}`;
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <div class="cart-empty-text">Your cart is empty</div>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map((product, index) => `
        <div class="cart-item">
            <div class="cart-item-image ${product.gradient}">
                <div class="product-icon">${product.icon}</div>
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${product.name}</div>
                <div class="cart-item-price">$${product.price}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

function openCartSidebar() {
    cartSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
    cartSidebar.classList.remove('active');
    document.body.style.overflow = '';
}

function handleCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Navigate to checkout page
    window.location.href = 'checkout.html';
}

// ===================================
// TOAST NOTIFICATION
// ===================================
function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================================
// PRODUCT FILTERING
// ===================================
function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card, index) => {
        const productCategory = products[index].category;
        
        if (category === 'All Products' || 
            category.toLowerCase() === productCategory ||
            (category === 'Electronics' && productCategory === 'electronics') ||
            (category === 'Fashion' && productCategory === 'fashion') ||
            (category === 'Lifestyle' && productCategory === 'lifestyle')) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.6s ease both';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe product cards
    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
}

// ===================================
// SMOOTH SCROLL
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add parallax effect to hero section
window.addEventListener('scroll', debounce(() => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
}, 10));

// ===================================
// ACCESSIBILITY ENHANCEMENTS
// ===================================
// Trap focus in modal
productModal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        const focusableElements = productModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

// Announce cart updates to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// Add screen reader only class to CSS
const style = document.createElement('style');
style.textContent = `
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }
`;
document.head.appendChild(style);
