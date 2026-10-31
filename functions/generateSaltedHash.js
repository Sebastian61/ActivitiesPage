/**
 * Utility script to generate cryptographically salted password hashes.
 * Usage:
 *   node functions/generateSaltedHash.js "myPasscode"
 */

const crypto = require('crypto');

const password = process.argv[2];
if (!password) {
  console.log('Usage: node functions/generateSaltedHash.js "<passcode>"');
  process.exit(1);
}

console.log('Generating salted hashes for:', password);

// 1. Scrypt (Native Node.js built-in - Memory-hard, salted, zero dependencies)
const salt = crypto.randomBytes(16).toString('hex');
const scryptHash = crypto.scryptSync(password, salt, 64).toString('hex');
const formattedScrypt = `scrypt:${salt}:${scryptHash}`;

console.log('\n--- 1. Native Salted Scrypt Hash (Zero external deps) ---');
console.log(formattedScrypt);

// 2. Bcrypt (if bcryptjs is installed)
try {
  const bcrypt = require('bcryptjs');
  const bcryptHash = bcrypt.hashSync(password, 12);
  console.log('\n--- 2. Salted Bcrypt Hash (Cost Factor: 12) ---');
  console.log(bcryptHash);
} catch (e) {
  console.log('\n(Run "npm --prefix functions install" to also generate standard Bcrypt format)');
}

console.log('\nCopy one of these hashes into your Firebase Cloud Functions environment or functions/index.js config!\n');
