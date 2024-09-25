// src/components/AIChat.tsx

import React, { useState } from 'react';
import { useSocket } from "@/context/SocketContext"; // Import your socket context if using socket.io

const AIChat = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const { socket } = useSocket(); // Use your socket connection

    const handleSend = () => {
        if (input.trim() === '') return;

        const newMessage = { text: input, sender: 'user' };
        setMessages([...messages, newMessage]);

        // Emit the user input to the server (or your AI service)
        socket.emit('aiChatMessage', input); // Replace with your appropriate event and message structure

        // Clear input field
        setInput('');
    };

    // Handle receiving AI response
    socket.on('aiChatResponse', (response) => {
        const newMessage = { text: response, sender: 'ai' };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return (
        <div className="ai-chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender}>
                        <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default AIChat;
