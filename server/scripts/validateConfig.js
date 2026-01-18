// Configuration Validator Script
// Run: node scripts/validateConfig.js

require('dotenv').config();
const chalk = require('chalk'); // Optional: for colored output

console.log('\n🔍 Validating Environment Configuration...\n');

const issues = [];
const warnings = [];
const success = [];

// Required Backend Environment Variables
const requiredVars = {
  'MONGODB_URL': 'Database connection string',
  'JWT_SECRET': 'JWT signing secret',
  'MAIL_HOST': 'Email server host',
  'MAIL_USER': 'Email username',
  'MAIL_PASS': 'Email password',
  'RAZORPAY_KEY': 'Razorpay API Key',
  'RAZORPAY_SECRET': 'Razorpay API Secret',
  'CLOUD_NAME': 'Cloudinary cloud name',
  'API_KEY': 'Cloudinary API key',
  'API_SECRET': 'Cloudinary API secret',
  'FOLDER_NAME': 'Cloudinary folder name',
  'PORT': 'Server port',
};

// Check if all required variables exist
Object.entries(requiredVars).forEach(([key, description]) => {
  if (!process.env[key]) {
    issues.push(`❌ Missing ${key} (${description})`);
  } else {
    success.push(`✅ ${key} is set`);
  }
});

// Validate specific configurations
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  warnings.push(`⚠️  JWT_SECRET is too short (${process.env.JWT_SECRET.length} chars). Minimum 32 recommended.`);
}

if (process.env.JWT_SECRET && (process.env.JWT_SECRET === 'babbar' || process.env.JWT_SECRET.length < 10)) {
  issues.push(`❌ JWT_SECRET is too weak! Current: "${process.env.JWT_SECRET}"`);
}

if (process.env.MONGODB_URL && !process.env.MONGODB_URL.startsWith('mongodb')) {
  issues.push('❌ MONGODB_URL format incorrect');
}

if (process.env.MAIL_HOST && process.env.MAIL_HOST !== 'smtp.gmail.com') {
  warnings.push(`⚠️  Using non-Gmail SMTP: ${process.env.MAIL_HOST}`);
}

if (process.env.RAZORPAY_KEY && !process.env.RAZORPAY_KEY.startsWith('rzp_')) {
  issues.push('❌ RAZORPAY_KEY format incorrect (should start with rzp_)');
}

if (!process.env.NODE_ENV) {
  warnings.push('⚠️  NODE_ENV not set. Defaulting to development.');
}

if (!process.env.FRONTEND_URL) {
  warnings.push('⚠️  FRONTEND_URL not set. CORS may block production requests.');
}

// Display Results
console.log('━'.repeat(60));
console.log('✅ SUCCESS:');
success.forEach(msg => console.log(`  ${msg}`));

if (warnings.length > 0) {
  console.log('\n━'.repeat(60));
  console.log('⚠️  WARNINGS:');
  warnings.forEach(msg => console.log(`  ${msg}`));
}

if (issues.length > 0) {
  console.log('\n━'.repeat(60));
  console.log('❌ CRITICAL ISSUES:');
  issues.forEach(msg => console.log(`  ${msg}`));
  console.log('\n💡 Fix these issues before running the application!\n');
  process.exit(1);
} else {
  console.log('\n━'.repeat(60));
  console.log('🎉 Configuration looks good!\n');
  
  if (warnings.length > 0) {
    console.log('⚠️  Note: There are warnings that should be addressed.\n');
  }
  
  process.exit(0);
}
