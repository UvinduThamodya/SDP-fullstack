// test-email.js - Simple script to test email functionality
const emailService = require('./services/emailService');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Sample order data for testing
const testOrderData = {
  order_id: 115,
  customer_name: "Uvindu",
  customer_id: 1,
  order_date: "2025-05-19T14:18:28.000Z",
  status: "Pending", 
  total_amount: "1830.00",
  staff_id: null,
  staff_name: null,
  note: null,
  // Sample items - in a real scenario, you would fetch these from the database
  items: [
    { 
      item_name: 'Chicken Kottu', 
      quantity: 2, 
      price: 650 
    },
    { 
      item_name: 'Egg Fried Rice', 
      quantity: 1, 
      price: 450 
    },
    { 
      item_name: 'Coca Cola', 
      quantity: 2, 
      price: 40
    }
  ]
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
