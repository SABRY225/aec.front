// Debug script to test CourseManagement API calls
// Run this in browser console on the CourseManagement page

console.log('=== CourseManagement Debug ===');

// Check localStorage
console.log('1. Checking localStorage:');
console.log('Token:', localStorage.getItem('token'));
console.log('User Data:', localStorage.getItem('userData'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// Check if user is authenticated
if (window.React) {
    console.log('2. React context available');
} else {
    console.log('2. React context not available');
}

// Test API calls manually
console.log('3. Testing API calls manually:');

const testAPI = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found in localStorage');
        return;
    }
    
    try {
        // Test getAllCourses
        console.log('Testing /api/admin/courses...');
        const response1 = await fetch('/api/admin/courses', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('getAllCourses response:', response1.status, await response1.clone().json());
        
        // Test getPendingCourses
        console.log('Testing /api/admin/courses/pending...');
        const response2 = await fetch('/api/admin/courses/pending', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('getPendingCourses response:', response2.status, await response2.clone().json());
        
    } catch (error) {
        console.error('API test error:', error);
    }
};

testAPI();

// Check axios default config
if (window.axios) {
    console.log('4. Axios defaults:');
    console.log('Base URL:', window.axios.defaults.baseURL);
    console.log('Headers:', window.axios.defaults.headers);
}

console.log('=== Debug Complete ===');