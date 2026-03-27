require('dotenv').config();

const config = {
  PORT: process.env.PORT || 3000,
  API_KEY: process.env.API_KEY || 'default-secret-key-replace-me-in-production',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = config;
