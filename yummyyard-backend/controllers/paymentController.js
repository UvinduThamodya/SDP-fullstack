
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use environment variable

// const createPaymentIntent = async (req, res) => {
//   try {
//     // Validate input
//     // if (!req.body.amount || isNaN(req.body.amount)) {
//     //   return res.status(400).json({ error: "Invalid amount" });
//     // }

//     // const amount = Math.round(parseFloat(req.body.amount));
        
//     // // Validate currency (LKR doesn't use decimal places)
//     // if (amount < 100) { // Minimum 50 LKR (Stripe's minimum for LKR)
//     //   return res.status(400).json({ error: "Amount must be at least LKR 50" });
//     // }
//     if (!req.body.amount || isNaN(req.body.amount) || parseFloat(req.body.amount) < 1) {
//       return res.status(400).json({ error: "Invalid amount" });
//     }
    
//     const amount = Math.round(parseFloat(req.body.amount));
    
//     if (amount < 50) {
//       return res.status(400).json({ error: "Minimum payment is ₹100" });
//     }

//     // Create payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: 'lkr',
//       automatic_payment_methods: { enabled: true },
//       metadata: { 
//         integration_check: 'accept_a_payment', 
//         order_id: req.body.orderId || 'N/A' 
//       }
//     });

//     res.json({ 
//       clientSecret: paymentIntent.client_secret,
//       amount: paymentIntent.amount,
//       currency: paymentIntent.currency
//     });

//   } catch (error) {
//     console.error("Stripe error:", error);
//     res.status(500).json({ 
//       error: error.message || 'Payment processing failed',
//       code: error.code || 'stripe_error'
//     });
//   }
// };

// module.exports = { createPaymentIntent };

// Updated createPaymentIntent controller
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51RBXHE2eTzT1rj33NZDSBXcmGdYj7H24AfORJbzIzyidDs09GHjHCTo5m48nzc1JwR4oxRIuFciKgN3IXbezWiBJ00mY7yDQ01');

const createPaymentIntent = async (req, res) => {
  try {
    // Validate input
    if (!req.body.amount || isNaN(req.body.amount) || parseFloat(req.body.amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    
    // Use the amount as provided - should already be in smallest currency unit (cents)
    const amount = Math.round(parseFloat(req.body.amount));
    
    // Minimum payment validation
    if (amount < 5) {
      return res.status(400).json({ error: "Minimum payment is LKR 50" });
    }

    // Create payment intent with proper error handling
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'lkr',
      automatic_payment_methods: { enabled: true },
      metadata: { 
        integration_check: 'accept_a_payment', 
        order_id: req.body.orderId || 'N/A' 
      }
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error("Stripe error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      requestId: error.requestId || 'unknown'
    });
    
    res.status(500).json({ 
      error: error.message || 'Payment processing failed',
      code: error.code || 'stripe_error'
    });
  }
};
