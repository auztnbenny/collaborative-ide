import axios from 'axios';

const analyzeCode = async (code: string) => {
    try {
        const response = await axios.post('http://localhost:3000/api/lint', { code });
        return response.data.result; // Return the linting results
    } catch (error) {
        console.error('Error analyzing code:', error);
        return 'Error analyzing code.';
    }
};

export default analyzeCode;