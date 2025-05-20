# YummyYard Password Reset System

## Overview
This document provides information about the password reset system implemented in YummyYard's application. The system allows customers to reset their passwords if they have forgotten them.

## Features
- "Forgot Password" option on the customer login page
- Secure, time-limited password reset tokens
- Password reset emails with unique reset links
- Mobile-responsive password reset interface
- Protection against brute force attacks

## Implementation Details

### Database Schema
The system uses a `password_resets` table with the following structure:
```sql
CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_token (token),
  INDEX email_index (email)
);
```

### Reset Process Flow
1. User clicks "Forgot Password" on the login page
2. User enters their email address
3. System generates a unique reset token and stores it in the database
4. System sends an email with a reset link containing the token
5. User clicks the link and is directed to a reset password form
6. User enters a new password
7. System verifies the token and updates the user's password
8. User is redirected to the login page with a success message

### Security Measures
- Tokens expire after 1 hour
- Tokens can only be used once
- Old tokens for the same email are invalidated when a new one is requested
- Token verification occurs server-side
- Password strength requirements are enforced
- Rate limiting is applied to prevent brute force attacks

### Email Template
The password reset email includes:
- YummyYard branding
- Clear instructions for the user
- A prominent reset button/link
- Security information and expiration notice
- Contact information for support

## Usage Example
```javascript
// Request a password reset
await apiService.requestPasswordReset({ email: "user@example.com" });

// Verify a reset token
await apiService.verifyResetToken("abcdef123456");

// Reset a password
await apiService.resetPassword({
  token: "abcdef123456",
  password: "newSecurePassword"
});
```

## Testing
A test script (`test-password-reset.js`) is available to verify the password reset functionality:
```
node test-password-reset.js
```

## Troubleshooting
- If reset emails are not being received, check spam folders
- Verify that the email service is properly configured in .env
- Ensure the correct frontend URL is set for the reset links
- Check server logs for specific error messages
