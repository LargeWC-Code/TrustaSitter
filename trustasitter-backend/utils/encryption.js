const crypto = require('crypto');

// 加密密钥 - 优先从Azure Key Vault获取，回退到环境变量
let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long!!';
const ALGORITHM = 'aes-256-cbc';
const PREFIX = 'ENC:'; // 加密数据的前缀标识

// Azure Key Vault配置
const KEY_VAULT_URL = 'https://trustasitter-keyvault.vault.azure.net/';
const SECRET_NAME = 'encryption-key';

let secretClient = null;

// 尝试初始化Azure Key Vault
async function initializeAzureKeyVault() {
  try {
    const { DefaultAzureCredential } = require('@azure/identity');
    const { SecretClient } = require('@azure/keyvault-secrets');
    
    const credential = new DefaultAzureCredential();
    secretClient = new SecretClient(KEY_VAULT_URL, credential);
    
    // 获取密钥
    const secret = await secretClient.getSecret(SECRET_NAME);
    ENCRYPTION_KEY = secret.value;
    console.log('✅ 从Azure Key Vault获取密钥成功');
  } catch (error) {
    console.error('❌ Azure Key Vault初始化失败，使用环境变量密钥:', error.message);
  }
}

/**
 * 加密字符串
 * @param {string} text - 要加密的文本
 * @returns {string} - 加密后的字符串（带前缀）
 */
function encrypt(text) {
  if (!text) return text;
  
  try {
    // 生成随机IV
    const iv = crypto.randomBytes(16);
    
    // 创建cipher (使用新的API)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    
    // 加密
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 组合IV和加密数据
    const result = iv.toString('hex') + ':' + encrypted;
    
    // 添加前缀标识
    return PREFIX + result;
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // 如果加密失败，返回原文本
  }
}

/**
 * 解密字符串
 * @param {string} encryptedText - 加密的文本
 * @returns {string} - 解密后的字符串
 */
function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  
  // 检查是否有加密前缀
  if (!encryptedText.startsWith(PREFIX)) {
    return encryptedText; // 如果没有前缀，说明是明文，直接返回
  }
  
  try {
    // 移除前缀
    const encryptedData = encryptedText.substring(PREFIX.length);
    
    // 分离IV和加密数据
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      return encryptedText; // 格式不正确，返回原文本
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // 创建decipher (使用新的API)
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    
    // 解密
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // 如果解密失败，返回原文本
  }
}

/**
 * 检查字符串是否已加密
 * @param {string} text - 要检查的文本
 * @returns {boolean} - 是否已加密
 */
function isEncrypted(text) {
  return text && text.startsWith(PREFIX);
}

/**
 * 批量加密对象中的敏感字段
 * @param {Object} obj - 要处理的对象
 * @param {Array} fields - 需要加密的字段名数组
 * @returns {Object} - 处理后的对象
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
 * 批量解密对象中的敏感字段
 * @param {Object} obj - 要处理的对象
 * @param {Array} fields - 需要解密的字段名数组
 * @returns {Object} - 处理后的对象
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
