const { initializeDatabase } = require('../config/initDb');

(async () => {
  try {
    console.log('Initializing password_resets table...');
    await initializeDatabase();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
