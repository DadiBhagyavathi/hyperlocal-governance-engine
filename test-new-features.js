const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testFeatures() {
  console.log('🧪 Testing New Features...\n');

  try {
    // 1️⃣ Test Development Proof
    console.log('1️⃣ Testing Verified Development Proof Engine...');
    const proofUpload = await axios.post(`${BASE_URL}/development-proof/upload`, {
      projectId: 'test-123',
      beforeImage: 'https://example.com/old-road.jpg',
      afterImage: 'https://example.com/new-road.jpg',
      description: 'Old Road → New Smart Road'
    });
    console.log('✅ Upload Proof:', proofUpload.data);

    const getProof = await axios.get(`${BASE_URL}/development-proof/test-123`);
    console.log('✅ Get Proof:', getProof.data);

    // 2️⃣ Test Awareness Analytics
    console.log('\n2️⃣ Testing Governance Awareness Analytics...');
    const awareness = await axios.get(`${BASE_URL}/awareness/awareness`);
    console.log('✅ Awareness Metrics:', awareness.data);

    const performance = await axios.get(`${BASE_URL}/awareness/project-performance`);
    console.log('✅ Project Performance:', performance.data);

    // 3️⃣ Test AI Issue Detection
    console.log('\n3️⃣ Testing AI Civic Issue Detection...');
    const complaint = await axios.post(`${BASE_URL}/issue-detection/complaint`, {
      ward: 'Ward 17',
      category: 'Water Supply',
      description: 'No water supply since morning'
    });
    console.log('✅ Report Complaint:', complaint.data);

    const clusters = await axios.get(`${BASE_URL}/issue-detection/clusters`);
    console.log('✅ Issue Clusters:', clusters.data);

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFeatures();
