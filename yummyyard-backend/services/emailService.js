const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

/**
 * EmailService for YummyYard Restaurant
 * Handles sending various types of order notification emails
 */
class EmailService {  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // App password, not your regular Gmail password
      }
    });
  }

  /**
   * Generates the email content based on order type
   * @param {string} type - Type of email (completed, accepted, rejected)
   * @param {object} orderData - Order information
   * @returns {string} HTML content for the email
   */
  generateEmailTemplate(type, orderData) {
    const { customerName, orderId, orderItems, total, orderDate, estimatedDeliveryTime } = orderData;
    
    // Common CSS styles for all email types
    const commonStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      
      body, html {
        margin: 0;
        padding: 0;
        font-family: 'Poppins', Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
        background-color: #f9f9f9;
      }
      
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .email-header {
        padding: 30px 20px;
        text-align: center;
      }
      
      .logo {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        letter-spacing: 1px;
        color: #ffffff;
      }
      
      .header-tag {
        margin: 8px 0 0;
        font-size: 16px;
        font-weight: 400;
        opacity: 0.9;
        color: #ffffff;
      }
      
      .email-body {
        padding: 32px 24px;
        background-color: #ffffff;
      }
      
      .content-box {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 0;
      }
      
      .greeting {
        font-size: 22px;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 16px;
      }
      
      .message {
        font-size: 16px;
        margin-bottom: 24px;
        color: #555555;
      }
      
      .order-details {
        background-color: #f8fef8;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        border: 1px solid #e0f0e0;
      }
      
      .order-details h3 {
        margin-top: 0;
        color: #2e7d32;
        border-bottom: 1px solid #c8e6c9;
        padding-bottom: 10px;
      }
      
      .order-id {
        font-family: 'Courier New', monospace;
        font-size: 18px;
        font-weight: 700;
        background-color: #f1f8e9;
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px dashed #81c784;
        display: inline-block;
        margin: 10px 0;
      }
      
      .item-list {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      
      .item-list th {
        background-color: #e8f5e9;
        text-align: left;
        padding: 10px;
        font-weight: 600;
      }
      
      .item-list td {
        padding: 10px;
        border-top: 1px solid #e0e0e0;
      }
      
      .total-row {
        font-weight: 700;
        font-size: 18px;
        background-color: #e8f5e9;
      }
      
      .button-container {
        text-align: center;
        margin: 28px 0;
      }
      
      .action-button {
        display: inline-block;
        padding: 12px 28px;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        border-radius: 6px;
        text-align: center;
        cursor: pointer;
      }
      
      .icon-container {
        text-align: center;
        margin: 25px 0;
      }
      
      .icon-circle {
        display: inline-block;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        text-align: center;
        line-height: 80px;
        font-size: 40px;
      }
      
      .note-box {
        background-color: #f5f5f5;
        border-radius: 8px;
        padding: 16px;
        margin-top: 24px;
        font-size: 14px;
        color: #666666;
      }
      
      .email-footer {
        background-color: #f0f0f0;
        color: #777777;
        text-align: center;
        padding: 20px;
        font-size: 12px;
      }
      
      .social-links {
        margin: 16px 0;
      }
      
      .social-icon {
        display: inline-block;
        margin: 0 8px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        text-align: center;
        line-height: 32px;
        color: white;
        font-size: 16px;
        text-decoration: none;
      }
      
      @media only screen and (max-width: 600px) {
        .content-box {
          padding: 0;
        }
        
        .email-header, .email-body, .email-footer {
          padding: 16px;
        }
      }
    `;
    
    // Generate items HTML
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
    
    // Content specific to each email type
    let specificContent = '';
    let headerStyle = '';
    let iconHtml = '';
    let greeting = '';
    let buttonHtml = '';
    
    switch(type) {
      case 'completed':
        headerStyle = 'background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);';
        iconHtml = `
          <div class="icon-container">
            <div class="icon-circle" style="background-color: #e8f5e9; color: #2e7d32;">✓</div>
          </div>
        `;
        greeting = `Order #${orderId} Completed!`;
        specificContent = `
          <p class="message">Great news! Your order has been successfully prepared and delivered. We hope you enjoy your meal!</p>
          
          <p class="message">Thank you for choosing YummyYard. We'd love to hear your feedback about your dining experience.</p>
        `;
        buttonHtml = `
          <div class="button-container">
            <a href="https://yummyyard.com/feedback/${orderId}" class="action-button" style="background-color: #2e7d32; color: white;">
              Leave Feedback
            </a>
          </div>
        `;
        break;
        
      case 'accepted':
        headerStyle = 'background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);';
        iconHtml = `
          <div class="icon-container">
            <div class="icon-circle" style="background-color: #e8f5e9; color: #43a047;">🍽️</div>
          </div>
        `;
        greeting = `Order #${orderId} Confirmed!`;
        specificContent = `
          <p class="message">Great news! Your order has been accepted and our chefs are preparing your delicious meal.</p>
          
          <p class="message">Estimated delivery time: <strong>${estimatedDeliveryTime}</strong></p>
        `;
        buttonHtml = `
          <div class="button-container">
            <a href="https://yummyyard.com/track/${orderId}" class="action-button" style="background-color: #43a047; color: white;">
              Track Your Order
            </a>
          </div>
        `;
        break;
        
      case 'rejected':
        headerStyle = 'background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%);';
        iconHtml = `
          <div class="icon-container">
            <div class="icon-circle" style="background-color: #fff3e0; color: #e64a19;">!</div>
          </div>
        `;
        greeting = `Order #${orderId} Could Not Be Processed`;
        specificContent = `
          <p class="message">We regret to inform you that we couldn't process your order at this time. This could be due to:</p>
          
          <ul style="color: #555555; margin-bottom: 20px;">
            <li>Items being temporarily unavailable</li>
            <li>High order volume during peak hours</li>
            <li>Technical issues with payment processing</li>
          </ul>
          
          <p class="message">Please don't worry, no payment has been taken from your account for this order.</p>
        `;
        buttonHtml = `
          <div class="button-container">
            <a href="https://yummyyard.com/order/retry" class="action-button" style="background-color: #66bb6a; color: white;">
              Try Again
            </a>
          </div>
        `;
        break;
    }
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YummyYard Order Update</title>
        <style>
          ${commonStyles}
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header" style="${headerStyle}">
            <h1 class="logo">YummyYard</h1>
            <p class="header-tag">Fresh & Delicious, Delivered To You</p>
          </div>
          
          <div class="email-body">
            <div class="content-box">
              ${iconHtml}
              <h2 class="greeting">${greeting}</h2>
              
              ${specificContent}
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p>Order ID: <span class="order-id">${orderId}</span></p>
                <p>Order Date: ${new Date(orderDate).toLocaleString()}</p>
                
                <table class="item-list">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                      <td colspan="3">Total</td>
                      <td>$${total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              ${buttonHtml}
              
              <div class="note-box">
                <strong>Note:</strong> For any questions or assistance, please contact our customer support at 
                <a href="mailto:support@yummyyard.com">support@yummyyard.com</a> or call us at (555) 123-4567.
              </div>
            </div>
          </div>
          
          <div class="email-footer">
            <p>© ${new Date().getFullYear()} YummyYard Restaurant. All rights reserved.</p>
            <div class="social-links">
              <a href="https://facebook.com/yummyyard" class="social-icon" style="background-color: #4267B2;">f</a>
              <a href="https://instagram.com/yummyyard" class="social-icon" style="background-color: #E1306C;">i</a>
              <a href="https://twitter.com/yummyyard" class="social-icon" style="background-color: #1DA1F2;">t</a>
            </div>
            <p>123 Tasty Lane, Foodville, CA 90210</p>
            <p><a href="https://yummyyard.com/privacy">Privacy Policy</a> • <a href="https://yummyyard.com/terms">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Sends an order notification email based on the status
   * @param {string} email - Recipient email address
   * @param {string} emailType - Type of email (completed, accepted, rejected)
   * @param {object} orderData - Order information
   * @returns {Promise<boolean>} True if email sent successfully, false otherwise
   */
  async sendOrderEmail(email, emailType, orderData) {
    try {
      // Validate email type
      if (!['completed', 'accepted', 'rejected'].includes(emailType)) {
        console.error('Invalid email type:', emailType);
        return false;
      }
      
      // Generate subject line based on email type
      let subject;
      switch(emailType) {
        case 'completed':
          subject = `YummyYard: Your Order #${orderData.orderId} Has Been Delivered!`;
          break;
        case 'accepted':
          subject = `YummyYard: Your Order #${orderData.orderId} Has Been Confirmed!`;
          break;
        case 'rejected':
          subject = `YummyYard: Important Update About Your Order #${orderData.orderId}`;
          break;
      }
      
      // Generate HTML content for the email
      const htmlContent = this.generateEmailTemplate(emailType, orderData);
        // Configure email
      const mailOptions = {
        from: process.env.GMAIL_FROM || `YummyYard Restaurant <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlContent
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`${emailType.charAt(0).toUpperCase() + emailType.slice(1)} email sent to ${email}:`, info.messageId);
      return true;
    } catch (error) {
      console.error(`Error sending ${emailType} email:`, error);
      return false;
    }
  }
  
  /**
   * Send email for a completed order
   * @param {string} email - Customer email
   * @param {object} orderData - Order details
   * @returns {Promise<boolean>}
   */
  async sendCompletedOrderEmail(email, orderData) {
    return this.sendOrderEmail(email, 'completed', orderData);
  }
  
  /**
   * Send email for an accepted order
   * @param {string} email - Customer email
   * @param {object} orderData - Order details
   * @returns {Promise<boolean>}
   */
  async sendAcceptedOrderEmail(email, orderData) {
    return this.sendOrderEmail(email, 'accepted', orderData);
  }
  
  /**
   * Send email for a rejected order
   * @param {string} email - Customer email
   * @param {object} orderData - Order details
   * @returns {Promise<boolean>}
   */
  async sendRejectedOrderEmail(email, orderData) {
    return this.sendOrderEmail(email, 'rejected', orderData);
  }
}

module.exports = new EmailService();
