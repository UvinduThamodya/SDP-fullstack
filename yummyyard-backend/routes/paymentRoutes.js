// const express = require('express');
// const router = express.Router();
// const stripe = require('stripe')('sk_test_51RBXHE2eTzT1rj33NZDSBXcmGdYj7H24AfORJbzIzyidDs09GHjHCTo5m48nzc1JwR4oxRIuFciKgN3IXbezWiBJ00mY7yDQ01');
// const { authenticateUser } = require('../middleware/authMiddleware');

// router.post('/create-intent', authenticateUser, async (req, res) => {
//   try {
//     const { amount } = req.body;

//     // Validate minimum amount (150 LKR ≈ $0.50 USD)
//     if (amount < 50) {
//       return res.status(400).json({ error: "Minimum payment is ₹150" });
//     }

//     // Create Stripe PaymentIntent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount, // Already in LKR
//       currency: 'lkr',
//       metadata: { integration_check: 'accept_a_payment' }
//     });
    
//     res.json({ clientSecret: paymentIntent.client_secret });
    
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });




// module.exports = router;
const express = require('express');
const router = express.Router();
// Use direct key for testing, but consider env variables for production
const stripe = require('stripe')('sk_test_51RBXHE2eTzT1rj33NZDSBXcmGdYj7H24AfORJbzIzyidDs09GHjHCTo5m48nzc1JwR4oxRIuFciKgN3IXbezWiBJ00mY7yDQ01');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/create-intent', authenticateUser, async (req, res) => {
  try {
    // Proper validation
    if (!req.body.amount || isNaN(req.body.amount) || parseFloat(req.body.amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    const amount = Math.round(parseFloat(req.body.amount));
    
    if (amount < 50) {
      return res.status(400).json({ error: "Minimum payment is LKR 50" });
    }

    console.log(`Creating payment intent for amount: ${amount} LKR`);

    // Create payment intent with explicit API version
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'LKR',
      automatic_payment_methods: { enabled: true }
    });

    console.log(`Payment intent created successfully: ${paymentIntent.id}`);
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      requestId: error.requestId || 'unknown'
    });
    
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
