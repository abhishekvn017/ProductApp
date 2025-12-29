const express = require('express');
const router = express.Router();

// In-memory storage for orders (can be replaced with database later)
const orders = [];

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
}

// Create order
router.post('/create-order', async (req, res) => {
    try {
        const { items, total, userId } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart items are required' });
        }

        const orderId = generateOrderId();
        const order = {
            orderId,
            userId: userId || 'guest',
            items,
            total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        orders.push(order);

        res.json({
            success: true,
            orderId,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Verify payment (dummy - always succeeds)
router.post('/verify', async (req, res) => {
    try {
        const { orderId, paymentDetails } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Find the order
        const order = orders.find(o => o.orderId === orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status
        order.status = 'completed';
        order.paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        order.completedAt = new Date().toISOString();
        order.paymentDetails = paymentDetails;

        res.json({
            success: true,
            message: 'Payment verified successfully',
            order
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// Get user orders
router.get('/orders/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userOrders = orders.filter(o => o.userId === userId);

        res.json({
            success: true,
            orders: userOrders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to retrieve orders' });
    }
});

// Get order by ID
router.get('/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = orders.find(o => o.orderId === orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to retrieve order' });
    }
});

module.exports = router;
