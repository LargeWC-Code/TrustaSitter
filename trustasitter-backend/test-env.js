require('dotenv').config();
 
console.log('=== Environment Variables Test ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'MISSING');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING');
console.log('==============================='); 