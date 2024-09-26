import express, { Response, Request } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import { SocketEvent, SocketId } from './types/socket';
import { USER_CONNECTION_STATUS, User } from './types/user';
import { Server } from 'socket.io';
import path from 'path';
import getAIResponse from './aiService';
import OpenAI from 'openai';

dotenv.config();

console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);  // Add this to verify the API key is loaded


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
});

let userSocketMap: User[] = [];

// Function to get all users in a room
function getUsersInRoom(roomId: string): User[] {
    return userSocketMap.filter((user) => user.roomId === roomId);
}

// Function to get room id by socket id
function getRoomId(socketId: SocketId): string | null {
    const roomId = userSocketMap.find((user) => user.socketId === socketId)?.roomId;
    return roomId || null;
}

function getUserBySocketId(socketId: SocketId): User | null {
    return userSocketMap.find((user) => user.socketId === socketId) || null;
}

// AI chat endpoint
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('User Message:', message);  // Log user message

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });

        console.log('OpenAI API Response:', completion);  // Log the entire response from OpenAI

        const aiResponse = completion.choices[0]?.message?.content;
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Error processing AI chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Socket.io connection
io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    socket.on(SocketEvent.CHATBOT_MESSAGE, async (message: string) => {
		console.log(`Received CHATBOT_MESSAGE from ${socket.id}: ${message}`);
		
		try {
			console.log("Calling OpenAI API...");
			const aiResponse = await getAIResponse(message);
			console.log("AI Response received:", aiResponse);  // Log response
			socket.emit(SocketEvent.CHATBOT_RESPONSE, aiResponse);  // Send response to the client
		} catch (error) {
			console.error('Error in AI response:', error);
			socket.emit(SocketEvent.CHATBOT_ERROR, 'Error processing your request.');
		}
	});
	
	

    // Handle disconnections
    socket.on('disconnecting', () => {
        const user = getUserBySocketId(socket.id);
        if (!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user });
        userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
        socket.leave(roomId);
    });
});

const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
