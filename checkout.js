// ===================================
// CHECKOUT PAGE LOGIC
// ===================================

const API_URL = 'http://localhost:3000/api';
let cart = [];
let selectedPaymentMethod = 'card';
let currentUser = null;

// Load cart and user data
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadUser();
    initializeEventListeners();
    displayCart();
});

function loadCart() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
        cart = JSON.parse(cartData);
    }

    if (cart.length === 0) {
        showEmptyCart();
    }
}

function loadUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
}

function showEmptyCart() {
    const container = document.getElementById('checkoutContainer');
    container.innerHTML = `
        <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <div class="empty-cart-text">Your cart is empty</div>
            <a href="index.html" class="back-to-shop-btn">Continue Shopping</a>
        </div>
    `;
}

function displayCart() {
    const cartItemsList = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (!cartItemsList) return;

    // Render cart items
    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item-checkout">
            <div class="cart-item-image-checkout ${item.gradient}">
                <div class="product-icon">${item.icon}</div>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name-checkout">${item.name}</div>
                <div class="cart-item-price-checkout">$${item.price}</div>
            </div>
        </div>
    `).join('');

    // Calculate total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    subtotalEl.textContent = `$${total.toLocaleString()}`;
    totalEl.textContent = `$${total.toLocaleString()}`;
}

function initializeEventListeners() {
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            method.classList.add('active');
            selectedPaymentMethod = method.dataset.method;
            
            // Switch payment forms
            switchPaymentForm(selectedPaymentMethod);
        });
    });

    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Expiry date formatting
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    // CVV - numbers only
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Mobile number formatting for UPI and Wallet
    const upiMobile = document.getElementById('upiMobile');
    const walletMobile = document.getElementById('walletMobile');
    
    [upiMobile, walletMobile].forEach(input => {
        if (input) {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\d+\s]/g, '');
            });
        }
    });

    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }
}

function switchPaymentForm(method) {
    // Hide all forms
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });

    // Show selected form
    let formId;
    if (method === 'card' || method === 'debit') {
        formId = 'cardForm';
    } else if (method === 'upi') {
        formId = 'upiForm';
    } else if (method === 'wallet') {
        formId = 'walletForm';
    }

    const selectedForm = document.getElementById(formId);
    if (selectedForm) {
        selectedForm.classList.add('active');
    }
}

async function handlePlaceOrder() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const btnText = document.getElementById('btnText');

    // Validate form based on payment method
    if (selectedPaymentMethod === 'card' || selectedPaymentMethod === 'debit') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardName = document.getElementById('cardName').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;

        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
            alert('Please fill in all card details');
            return;
        }

        if (cardNumber.replace(/\s/g, '').length < 13) {
            alert('Please enter a valid card number');
            return;
        }

        if (cardCvv.length < 3) {
            alert('Please enter a valid CVV');
            return;
        }
    } else if (selectedPaymentMethod === 'upi') {
        const upiId = document.getElementById('upiId').value;
        const upiMobile = document.getElementById('upiMobile').value;

        if (!upiId || !upiMobile) {
            alert('Please fill in all UPI details');
            return;
        }

        if (!upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g., yourname@upi)');
            return;
        }
    } else if (selectedPaymentMethod === 'wallet') {
        const walletProvider = document.getElementById('walletProvider').value;
        const walletMobile = document.getElementById('walletMobile').value;

        if (!walletProvider || !walletMobile) {
            alert('Please select a wallet provider and enter mobile number');
            return;
        }
    }

    // Disable button and show loading
    placeOrderBtn.disabled = true;
    btnText.innerHTML = '<span class="loading-spinner"></span> Processing...';

    try {
        // Calculate total
        const total = cart.reduce((sum, item) => sum + item.price, 0);

        // Get user ID from token or use guest
        const token = localStorage.getItem('authToken');
        let userId = 'guest';
        
        if (token) {
            try {
                const userResponse = await fetch(`${API_URL}/auth/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.user.id;
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        }

        // Create order
        const orderResponse = await fetch(`${API_URL}/payment/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                total: total,
                userId: userId
            })
        });

        if (!orderResponse.ok) {
            throw new Error('Failed to create order');
        }

        const orderData = await orderResponse.json();

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify payment
        const paymentDetails = {
            method: selectedPaymentMethod,
            cardLast4: selectedPaymentMethod === 'card' ? 
                document.getElementById('cardNumber').value.slice(-4) : null
        };

        const verifyResponse = await fetch(`${API_URL}/payment/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderData.orderId,
                paymentDetails: paymentDetails
            })
        });

        if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
        }

        const verifyData = await verifyResponse.json();

        // Clear cart
        localStorage.removeItem('cart');

        // Redirect to confirmation page
        window.location.href = `confirmation.html?orderId=${orderData.orderId}`;

    } catch (error) {
        console.error('Order error:', error);
        alert('Failed to process order. Please try again.');
        
        // Re-enable button
        placeOrderBtn.disabled = false;
        btnText.textContent = 'Place Order';
    }
}
