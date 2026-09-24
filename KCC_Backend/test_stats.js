const axios = require('axios');

async function testStats() {
    try {
        const response = await axios.get('http://localhost:4005/api/auth/home-stats');
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
    }
}

testStats();
