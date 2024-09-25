// aiService.ts

import axios from 'axios'; // Assuming you're using axios for API requests

const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
        const response = await axios.post('/api/ai/chat', { message: userMessage });
        return response.data; // Adjust according to the response structure
    } catch (error) {
        console.error('Error fetching AI response:', error);
        throw error; // Rethrow the error to handle it later
    }
};

export default getAIResponse; // Exporting the function as default
