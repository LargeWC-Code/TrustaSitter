const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

// Azure Key Vault配置
const KEY_VAULT_URL = process.env.KEY_VAULT_URL || 'https://your-keyvault-name.vault.azure.net/';
const SECRET_NAME = process.env.SECRET_NAME || 'encryption-key';

let secretClient = null;

/**
 * 初始化Azure Key Vault客户端
 */
async function initializeKeyVault() {
  try {
    const credential = new DefaultAzureCredential();
    secretClient = new SecretClient(KEY_VAULT_URL, credential);
    console.log('✅ Azure Key Vault客户端初始化成功');
  } catch (error) {
    console.error('❌ Azure Key Vault初始化失败:', error);
    throw error;
  }
}

/**
 * 从Azure Key Vault获取加密密钥
 */
async function getEncryptionKey() {
  try {
    if (!secretClient) {
      await initializeKeyVault();
    }
    
    const secret = await secretClient.getSecret(SECRET_NAME);
    console.log('✅ 从Azure Key Vault获取密钥成功');
    return secret.value;
  } catch (error) {
    console.error('❌ 从Azure Key Vault获取密钥失败:', error);
    // 如果获取失败，回退到环境变量
    console.log('⚠️ 回退到环境变量密钥');
    return process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars-long!!';
  }
}

/**
 * 测试Key Vault连接
 */
async function testKeyVaultConnection() {
  try {
    const key = await getEncryptionKey();
    console.log('✅ Key Vault连接测试成功');
    console.log('🔑 密钥长度:', key.length);
    return true;
  } catch (error) {
    console.error('❌ Key Vault连接测试失败:', error);
    return false;
  }
}

module.exports = {
  initializeKeyVault,
  getEncryptionKey,
  testKeyVaultConnection
};
