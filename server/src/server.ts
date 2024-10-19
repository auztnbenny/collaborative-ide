import express, { Response, Request } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { SocketEvent, SocketId } from "./types/socket";
import { USER_CONNECTION_STATUS, User } from "./types/user";
import { Server } from "socket.io";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aiRoutes from './routes/ai'; 
import getAIResponse from './aiService';
import lintRoutes from './routes/lint'; 
import terminalRoutes from './routes/terminal'; 

import { exec } from 'child_process'; // Import exec for terminal commands

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/lint', lintRoutes); // Use the linting routes
app.use('/api/ai', aiRoutes); // Use the AI routes
app.use(express.static(path.join(__dirname, "public")));
app.use('/api/terminal', terminalRoutes);  // Serve static files

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
});

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
console.log("Gemini API Key:", process.env.GOOGLE_API_KEY ? "Set" : "Not set");

let userSocketMap: User[] = [];

// Function to get all users in a room
function getUsersInRoom(roomId: string): User[] {
    return userSocketMap.filter((user) => user.roomId == roomId);
}

// Function to get room id by socket id
function getRoomId(socketId: SocketId): string | null {
    const roomId = userSocketMap.find(
        (user) => user.socketId === socketId
    )?.roomId;

    if (!roomId) {
        console.error("Room ID is undefined for socket ID:", socketId);
        return null;
    }
    return roomId;
}

function getUserBySocketId(socketId: SocketId): User | null {
    const user = userSocketMap.find((user) => user.socketId === socketId);
    if (!user) {
        console.error("User not found for socket ID:", socketId);
        return null;
    }
    return user;
}

io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    // Handle user actions
    socket.on(SocketEvent.JOIN_REQUEST, ({ roomId, username }) => {
        console.log("Join request received:", { roomId, username, socketId: socket.id });
        
        const isUsernameExist = getUsersInRoom(roomId).filter(
            (u) => u.username === username
        );
        if (isUsernameExist.length > 0) {
            io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS);
            return;
        }
    
        const user = {
            username,
            roomId,
            status: USER_CONNECTION_STATUS.ONLINE,
            cursorPosition: 0,
            typing: false,
            socketId: socket.id,
            currentFile: null,
        };
        userSocketMap.push(user);
        console.log("User added to userSocketMap:", user);
        
        socket.join(roomId);
        socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user });
        const users = getUsersInRoom(roomId);
        io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users });
        socket.emit(SocketEvent.ROOM_JOINED);
    });

    socket.on("disconnecting", () => {
        const user = getUserBySocketId(socket.id);
        if (!user) return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user });
        userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
        socket.leave(roomId);
    });

    // Handle file actions
    socket.on(SocketEvent.SYNC_FILE_STRUCTURE, ({ fileStructure, openFiles, activeFile, socketId }) => {
        io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
            fileStructure,
            openFiles,
            activeFile,
        });
    });

    // New event handler for AI chat using Gemini
    socket.on(SocketEvent.CHATBOT_MESSAGE, async (message) => {
        console.log("CHATBOT_MESSAGE received:", { message, socketId: socket.id });
        try {
            console.log("Calling Gemini API...");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            
            const prompt = `You are a helpful assistant that generates code based on user requests. Always wrap your code in triple backticks. User request: ${message}`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const generatedContent = response.text();
            
            console.log("Gemini API call successful");
            console.log("Sending CHATBOT_RESPONSE:", generatedContent);
            socket.emit(SocketEvent.CHATBOT_RESPONSE, generatedContent);
        } catch (error) {
            console.error("Error in AI chat:", error);
            if (error instanceof Error) {
                console.error("Error message:", error.message);
                console.error("Error stack:", error.stack);
            }
            socket.emit(SocketEvent.CHATBOT_ERROR, "An error occurred while processing your request.");
        }
    });

    // New event handler for terminal commands
    socket.on('terminalCommand', (command) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                socket.emit('terminalOutput', `Error: ${error.message}\n`);
                return;
            }
            if (stderr) {
                socket.emit('terminalOutput', `${stderr}\n`);
                return;
            }
            socket.emit('terminalOutput', `${stdout}\n`);
        });
    });
});

const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    // Send the index.html file
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});