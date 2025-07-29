// Debug script to test video upload endpoint
async function testUploadEndpoint() {
  const testBlob = new Blob(['test video data'], { type: 'video/webm' });
  const token = localStorage.getItem('token') || 'test-token';
  
  console.log('🧪 Testing upload endpoint...');
  console.log('📊 Test blob size:', testBlob.size);
  console.log('🔑 Token:', token);
  
  const formData = new FormData();
  formData.append('file', testBlob, 'test-interview.webm');
  
  try {
    const response = await fetch('http://localhost:8000/interview/analyze-video/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('📡 Response:', response.status, response.statusText);
    console.log('📋 Headers:', response.headers);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test CORS preflight
async function testCORS() {
  try {
    const response = await fetch('http://localhost:8000/interview/analyze-video/', {
      method: 'OPTIONS'
    });
    console.log('🔍 CORS preflight:', response.status);
  } catch (error) {
    console.error('❌ CORS issue:', error);
  }
}

console.log('=== Testing Upload Endpoint ===');
testCORS();
testUploadEndpoint();
