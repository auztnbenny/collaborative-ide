import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const AIAssistant = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!question.trim()) {
            toast.error('Please enter a question.');
            return;
        }

        setLoading(true);
        setAnswer('');

        try {
            const response = await fetch('/api/ai/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });

            const data = await response.json();
            if (response.ok) {
                setAnswer(data.answer);
            } else {
                toast.error(data.error || 'Failed to get a response from AI.');
            }
        } catch (error) {
            console.error('Error asking AI:', error);
            toast.error('An error occurred while asking the AI.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-assistant-container">
            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                disabled={loading}
                className="ai-input"
            />
            <button onClick={handleAsk} disabled={loading} className="ai-button">
                {loading ? 'Asking...' : 'Ask AI'}
            </button>
            {answer && (
                <div className="ai-answer">
                    <strong>Answer:</strong> <pre>{answer}</pre>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
