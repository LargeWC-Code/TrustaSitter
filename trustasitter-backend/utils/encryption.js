const crypto = require('crypto');

// Encryption key - prioritize Azure Key Vault, fallback to environment variable
let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long!!';
const ALGORITHM = 'aes-256-cbc';
const PREFIX = 'ENC:'; // Prefix identifier for encrypted data

// Azure Key Vault configuration
const KEY_VAULT_URL = 'https://trustasitter-keyvault.vault.azure.net/';
const SECRET_NAME = 'encryption-key';

let secretClient = null;

// Try to initialize Azure Key Vault
async function initializeAzureKeyVault() {
  try {
    const { DefaultAzureCredential } = require('@azure/identity');
    const { SecretClient } = require('@azure/keyvault-secrets');
    
    const credential = new DefaultAzureCredential();
    secretClient = new SecretClient(KEY_VAULT_URL, credential);
    
    // Get the key
    const secret = await secretClient.getSecret(SECRET_NAME);
    ENCRYPTION_KEY = secret.value;
    console.log('✅ Successfully retrieved key from Azure Key Vault');
  } catch (error) {
    console.error('❌ Azure Key Vault initialization failed, using environment variable key:', error.message);
  }
}

/**
 * Encrypt a string
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted string (with prefix)
 */
function encrypt(text) {
  if (!text) return text;
  
  try {
    // Generate random IV
    const iv = crypto.randomBytes(16);
    
    // Create cipher (using new API)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    
    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV and encrypted data
    const result = iv.toString('hex') + ':' + encrypted;
    
    // Add prefix identifier
    return PREFIX + result;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // If encryption fails, return original text
  }
}

/**
 * Decrypt a string
 * @param {string} encryptedText - Encrypted text
 * @returns {string} - Decrypted string
 */
function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  
  // Check if it has encryption prefix
  if (!encryptedText.startsWith(PREFIX)) {
    return encryptedText; // If no prefix, it's plain text, return directly
  }
  
  try {
    // Remove prefix
    const encryptedData = encryptedText.substring(PREFIX.length);
    
    // Separate IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      return encryptedText; // Incorrect format, return original text
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher (using new API)
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // If decryption fails, return original text
  }
}

/**
 * Check if a string is already encrypted
 * @param {string} text - Text to check
 * @returns {boolean} - Whether it's encrypted
 */
function isEncrypted(text) {
  return text && text.startsWith(PREFIX);
}

/**
 * Batch encrypt sensitive fields in an object
 * @param {Object} obj - Object to process
 * @param {Array} fields - Array of field names to encrypt
 * @returns {Object} - Processed object
 */
function encryptObject(obj, fields = ['email', 'phone']) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = { ...obj };
  
  fields.forEach(field => {
    if (result[field] && !isEncrypted(result[field])) {
      result[field] = encrypt(result[field]);
    }
  });
  
  return result;
}

/**
 * Batch decrypt sensitive fields in an object
 * @param {Object} obj - Object to process
 * @param {Array} fields - Array of field names to decrypt
 * @returns {Object} - Processed object
 */
function decryptObject(obj, fields = ['email', 'phone']) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = { ...obj };
  
  fields.forEach(field => {
    if (result[field]) {
      result[field] = decrypt(result[field]);
    }
  });
  
  return result;
}

module.exports = {
  encrypt,
  decrypt,
  isEncrypted,
  encryptObject,
  decryptObject,
  initializeAzureKeyVault,
  PREFIX
};
