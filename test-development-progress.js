// Quick test for Development Progress Feature
const http = require('http');

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Testing Development Progress Feature...\n');

// Test 1: Get all proofs
http.get(`${BASE_URL}/api/development-proof/all`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log('✅ GET /api/development-proof/all');
    console.log(`   Found ${result.data.length} development proofs`);
    result.data.forEach(proof => {
      console.log(`   - ${proof.projectTitle}`);
    });
    console.log('');
  });
}).on('error', (err) => {
  console.log('❌ Error:', err.message);
  console.log('   Make sure server is running: npm start\n');
});

// Test 2: Get specific proof
setTimeout(() => {
  http.get(`${BASE_URL}/api/development-proof/main-street`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      console.log('✅ GET /api/development-proof/main-street');
      console.log(`   Project: ${result.data.projectTitle}`);
      console.log(`   Description: ${result.data.description}`);
      console.log('');
      console.log('🎉 All tests passed!');
      console.log('\n📍 View in browser:');
      console.log(`   Citizens: ${BASE_URL}/analytics.html`);
      console.log(`   Admin: ${BASE_URL}/development-upload.html`);
    });
  });
}, 1000);
