const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:4005/login', {
            email: 'admin@example.com',
            password: 'Welcome@123'
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
    }
}

testLogin();
