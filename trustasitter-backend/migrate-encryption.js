#!/usr/bin/env node

/**
 * 数据加密迁移脚本
 * 将数据库中现有的未加密敏感数据转换为加密格式
 * 
 * 使用方法:
 * 1. 设置环境变量: ENCRYPTION_KEY=your-secret-key
 * 2. 运行脚本: node migrate-encryption.js
 */

const { encrypt } = require('./utils/encryption');
const { db } = require('./config/database');

// 检查环境变量
if (!process.env.ENCRYPTION_KEY) {
  console.error('❌ 错误: 请设置 ENCRYPTION_KEY 环境变量');
  console.error('例如: ENCRYPTION_KEY=your-secret-encryption-key-32-chars-long!!');
  process.exit(1);
}

async function migrateUsers() {
  console.log('🔄 开始迁移用户数据...');
  
  try {
    // 获取所有未加密的用户数据
    const users = await db.query("SELECT id, email, phone FROM users WHERE email NOT LIKE 'ENC:%'");
    
    if (users.rows.length === 0) {
      console.log('✅ 用户数据已经是加密格式，无需迁移');
      return;
    }
    
    console.log(`📊 找到 ${users.rows.length} 个需要迁移的用户`);
    
    let migratedCount = 0;
    for (const user of users.rows) {
      try {
        const encryptedEmail = encrypt(user.email);
        const encryptedPhone = user.phone ? encrypt(user.phone) : null;
        
        await db.query(
          'UPDATE users SET email = $1, phone = $2 WHERE id = $3',
          [encryptedEmail, encryptedPhone, user.id]
        );
        
        migratedCount++;
        console.log(`✅ 已迁移用户 ID: ${user.id}, 邮箱: ${user.email}`);
      } catch (error) {
        console.error(`❌ 迁移用户 ID ${user.id} 失败:`, error.message);
      }
    }
    
    console.log(`🎉 用户数据迁移完成，共迁移 ${migratedCount} 个用户`);
  } catch (error) {
    console.error('❌ 用户数据迁移失败:', error.message);
    throw error;
  }
}

async function migrateBabysitters() {
  console.log('🔄 开始迁移保姆数据...');
  
  try {
    // 获取所有未加密的保姆数据
    const babysitters = await db.query("SELECT id, email, phone FROM babysitters WHERE email NOT LIKE 'ENC:%'");
    
    if (babysitters.rows.length === 0) {
      console.log('✅ 保姆数据已经是加密格式，无需迁移');
      return;
    }
    
    console.log(`📊 找到 ${babysitters.rows.length} 个需要迁移的保姆`);
    
    let migratedCount = 0;
    for (const babysitter of babysitters.rows) {
      try {
        const encryptedEmail = encrypt(babysitter.email);
        const encryptedPhone = babysitter.phone ? encrypt(babysitter.phone) : null;
        
        await db.query(
          'UPDATE babysitters SET email = $1, phone = $2 WHERE id = $3',
          [encryptedEmail, encryptedPhone, babysitter.id]
        );
        
        migratedCount++;
        console.log(`✅ 已迁移保姆 ID: ${babysitter.id}, 邮箱: ${babysitter.email}`);
      } catch (error) {
        console.error(`❌ 迁移保姆 ID ${babysitter.id} 失败:`, error.message);
      }
    }
    
    console.log(`🎉 保姆数据迁移完成，共迁移 ${migratedCount} 个保姆`);
  } catch (error) {
    console.error('❌ 保姆数据迁移失败:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 开始数据加密迁移...\n');
  
  try {
    // 测试数据库连接
    await db.query('SELECT NOW()');
    console.log('✅ 数据库连接正常\n');
    
    // 迁移用户数据
    await migrateUsers();
    console.log('');
    
    // 迁移保姆数据
    await migrateBabysitters();
    console.log('');
    
    console.log('🎉 所有数据迁移完成！');
    console.log('💡 提示: 请确保在生产环境中使用安全的密钥管理服务（如Azure Key Vault或AWS KMS）');
    
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await db.end();
  }
}

// 运行迁移
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateUsers, migrateBabysitters };
