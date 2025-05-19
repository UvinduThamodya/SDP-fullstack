// test-email.js - Simple script to test email functionality
const emailService = require('./services/emailService');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Sample order data for testing
const testOrderData = {
  customerName: 'Test Customer',
  orderId: 'TEST-12345',
  orderItems: [
    { 
      name: 'Chicken Kottu', 
      quantity: 2, 
      price: 12.99 
    },
    { 
      name: 'Egg Fried Rice', 
      quantity: 1, 
      price: 9.99 
    },
    { 
      name: 'Coca Cola', 
      quantity: 3, 
      price: 2.49 
    }
  ],
  total: 43.44, // 2*12.99 + 1*9.99 + 3*2.49
  orderDate: new Date(),
  estimatedDeliveryTime: '30-45 minutes'
};

// Email to send the test to - replace with your own email for testing
const testEmail = process.env.TEST_EMAIL || process.env.GMAIL_USER;

// Test different types of emails
async function runTests() {
  console.log('Starting email tests...');
  
  try {
    // Test 1: Send Accepted Order Email
    console.log('Testing ACCEPTED order email...');
    const acceptedResult = await emailService.sendAcceptedOrderEmail(testEmail, testOrderData);
    console.log('Accepted email result:', acceptedResult ? 'SUCCESS' : 'FAILED');
    
    // Test 2: Send Completed Order Email
    console.log('\nTesting COMPLETED order email...');
    const completedResult = await emailService.sendCompletedOrderEmail(testEmail, testOrderData);
    console.log('Completed email result:', completedResult ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Send Rejected Order Email
    console.log('\nTesting REJECTED order email...');
    const rejectedResult = await emailService.sendRejectedOrderEmail(testEmail, testOrderData);
    console.log('Rejected email result:', rejectedResult ? 'SUCCESS' : 'FAILED');
    
    console.log('\nAll email tests completed!');
    console.log(`Check your inbox at ${testEmail} for the test emails.`);
  } catch (error) {
    console.error('Error during email testing:', error);
  }
}

// Run the tests
runTests();
