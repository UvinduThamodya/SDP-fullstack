const emailService = require('./services/emailService');
const PasswordResetModel = require('./models/passwordResetModel');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Test email for password reset
const testEmail = process.env.TEST_EMAIL || process.env.GMAIL_USER;

async function testPasswordReset() {
  console.log('Starting password reset email test...');
  
  try {
    // Generate a reset token
    console.log(`Creating reset token for ${testEmail}...`);
    const resetToken = await PasswordResetModel.createResetToken(testEmail);
    
    // Send the reset email
    console.log('Sending password reset email...');
    const result = await emailService.sendPasswordResetEmail(
      testEmail, 
      resetToken, 
      'Test User'
    );
    
    console.log('Password reset email result:', result ? 'SUCCESS' : 'FAILED');
    
    if (result) {
      console.log(`Check your inbox at ${testEmail} for the password reset email.`);
      console.log(`Reset token: ${resetToken}`);
      
      // Verify the token
      console.log('Verifying token...');
      const resetRequest = await PasswordResetModel.findByToken(resetToken);
      
      if (resetRequest) {
        console.log('Token found in database:', {
          email: resetRequest.email,
          expiresAt: resetRequest.expires_at
        });
      } else {
        console.log('Token not found in database or has expired.');
      }
    }
  } catch (error) {
    console.error('Error during password reset testing:', error);
  }
}

// Run the test
testPasswordReset();
