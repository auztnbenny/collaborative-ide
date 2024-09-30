import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { SocketEvent } from '@/types/socket';

const AIChat = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const { socket } = useSocket();

    // Single useEffect for Socket Events
    useEffect(() => {
        const handleResponse = (response: string) => {
            console.log("AI Response received on frontend:", response);  // Log AI response
            const newMessage = { text: response, sender: 'ai' };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        socket.on(SocketEvent.CHATBOT_RESPONSE, handleResponse);

        return () => {
            socket.off(SocketEvent.CHATBOT_RESPONSE, handleResponse);
        };
    }, [socket]);

    const handleSend = () => {
        if (input.trim() === '') return;

        const newMessage = { text: input, sender: 'user' };
        setMessages([...messages, newMessage]);
        socket.emit(SocketEvent.CHATBOT_MESSAGE, input);

        // Clear input field
        setInput('');
    };

    return (
        <div className="ai-chat-container flex flex-col h-full">
            <div className="messages flex-grow overflow-auto p-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded ${msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>
            <div className="input-area flex p-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-grow mr-2 p-2 rounded border"
                />
                <button onClick={handleSend} className="bg-blue-500 text-white p-2 rounded">Send</button>
            </div>
        </div>
    );
};

export default AIChat;
