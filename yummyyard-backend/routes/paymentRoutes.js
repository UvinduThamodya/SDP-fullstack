const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51RBXHE2eTzT1rj33NZDSBXcmGdYj7H24AfORJbzIzyidDs09GHjHCTo5m48nzc1JwR4oxRIuFciKgN3IXbezWiBJ00mY7yDQ01');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/create-intent', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'lkr',
      metadata: { integration_check: 'accept_a_payment' }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
