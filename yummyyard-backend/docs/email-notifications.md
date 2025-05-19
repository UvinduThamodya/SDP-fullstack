# YummyYard Email Notification System

## Overview
This document provides information about the email notification system implemented in YummyYard's backend application. The system sends automated emails to customers when their orders are created or when their order status changes.

## Features
- Automatically sends order confirmation emails when new orders are created
- Sends status update notifications when orders are accepted, completed, or cancelled
- Uses Gmail SMTP for reliable email delivery
- Customized email templates with restaurant branding
- Currency shown as LKR instead of USD
- No delivery address or estimated delivery time in templates

## Implementation Details

### Email Service
The `emailService.js` module handles all email-related functionality:
- Creates and configures a nodemailer transporter using Gmail SMTP
- Generates HTML email templates for different order statuses
- Sends emails to customers

### Email Types
The system supports four types of notification emails:
1. **Order Pending** - Sent when a new order is created with "Pending" status
2. **Order Accepted** - Sent only when an order's status is changed to "Accepted" by staff
3. **Order Completed** - Sent when an order's status is changed to "Completed" 
4. **Order Rejected/Cancelled** - Sent when an order's status is changed to "Cancelled"

### Integration with Order Processing
Email notifications are triggered from:
- `createOrder` function - Sends an initial order confirmation
- `updateOrderStatus` function - Sends status update notifications

## Configuration
Email functionality relies on the following environment variables:
- `GMAIL_USER` - Gmail email address used to send notifications
- `GMAIL_APP_PASSWORD` - Google App Password (not regular Gmail password)
- `GMAIL_FROM` - (Optional) "From" name shown in emails

## Testing
Two test scripts are available to verify email functionality:
- `test-email.js` - Tests all three email types with sample order data
- `test-order-status.js` - Tests the integration of email notifications with order status updates

## Usage Example
```javascript
// Sending an email when order status changes
const emailService = require('../services/emailService');

// Get order details from database
const orderDetails = {
  order_id: 123,
  customer_name: "Customer Name",
  customer_email: "customer@example.com",
  total_amount: 1500.00,
  status: "Accepted",
  items: [
    { item_name: "Chicken Kottu", quantity: 2, price: 650 }
  ]
};

// Send notification
await emailService.notifyOrderStatusChange(orderDetails, "Accepted");
```

## Troubleshooting
- If emails are not being sent, check that Gmail credentials are correctly configured in .env file
- Make sure to use an App Password for Gmail, not a regular account password
- Check the console logs for any email-related errors
