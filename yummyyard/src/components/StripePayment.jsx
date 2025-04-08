import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, CircularProgress, Box, Typography } from '@mui/material';

function StripePayment({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    
    try {
      // Call your backend to create a payment intent
      console.log("Sending payment request for amount:", amount * 100);
      
      const response = await fetch('http://localhost:5000/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: Math.round(amount * 100) }) // Stripe uses cents
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`Payment server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Got payment secret:", data.clientSecret ? "Yes" : "No");
      
      if (!data.clientSecret) {
        throw new Error("Missing payment secret from server");
      }
    
      
      // Confirm the payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });
      
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Card Payment
      </Typography>
      
      <Box sx={{ border: '1px solid #e0e0e0', padding: 2, borderRadius: 1, mb: 2 }}>
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        disabled={!stripe || processing}
        fullWidth
      >
        {processing ? <CircularProgress size={24} /> : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export default StripePayment;
