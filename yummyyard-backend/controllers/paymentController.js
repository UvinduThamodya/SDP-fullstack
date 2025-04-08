const stripe = require('stripe')('sk_test_51RBXHE2eTzT1rj33NZDSBXcmGdYj7H24AfORJbzIzyidDs09GHjHCTo5m48nzc1JwR4oxRIuFciKgN3IXbezWiBJ00mY7yDQ01');

const createPaymentIntent = async (req, res) => {
  try {
    console.log("Creating payment for amount:", req.body.amount);
    
    // Make a payment request to Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'lkr',
      automatic_payment_methods: {
        enabled: true
      }
    });
    
    console.log("Success! Created payment:", paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Oops! Payment error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPaymentIntent };
