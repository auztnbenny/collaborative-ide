import axios from 'axios';

// Determine the API base URL based on the environment
const API_BASE_URL = process.env.NODE_ENV === "production"
    ? 'https://collaborative-ide-ynie.onrender.com' 
    : 'http://localhost:3000';

const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/ai/ask`, { message: userMessage });
        console.log('AI API response:', response.data);  // Log entire response
        return response.data.response;  // Only return the AI response content
    } catch (error) {
        console.error('Error fetching AI response:', error);
        throw error;
    }
};

export default getAIResponse;
