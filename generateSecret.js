const crypto = require('crypto');

// Generate a 64-byte (512-bit) secret key
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Generate multiple options
console.log('=== JWT Secret Key Generator ===\n');
console.log('64-byte hex string (recommended for production):');
console.log(generateSecret());
console.log('\n32-byte hex string (alternative):');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('\n64-byte base64 string:');
console.log(crypto.randomBytes(64).toString('base64'));
console.log('\nURLSafe base64 (no special chars):');
console.log(crypto.randomBytes(64).toString('base64url'));

console.log('\n⚠️  Copy one of these keys and paste it in your .env file');
console.log('⚠️  NEVER commit the .env file to version control');