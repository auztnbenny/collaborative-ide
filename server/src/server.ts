import express, { Response, Request } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { SocketEvent, SocketId } from "./types/socket";
import { USER_CONNECTION_STATUS, User } from "./types/user";
import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aiRoutes from './routes/ai';
import lintRoutes from './routes/lint';
import { exec } from "child_process"; // Import exec for terminal commands
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://collaborative-ide-iota.vercel.app',
    'https://collaborative-ide-ynie.onrender.com'
  ], // Add all your client URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cors());
app.use('/api/lint', lintRoutes); // Use the linting routes
app.use('/api/ai', aiRoutes); // Use the AI routes
app.use('/api/user', userRoutes);
app.use(express.static(path.join(__dirname, "public")));


// Routes
app.use('/api/user', userRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("\u2713 MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("\u2717 MongoDB connection error:", err);
    process.exit(1);
  });

// Global error handler
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message,
  });
});

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
console.log("Gemini API Key:", process.env.GOOGLE_API_KEY ? "Set" : "Not set");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
});

let userSocketMap: User[] = [];

// Socket functions
function getUsersInRoom(roomId: string): User[] {
  return userSocketMap.filter((user) => user.roomId == roomId);
}

function getRoomId(socketId: SocketId): string | null {
  const roomId = userSocketMap.find((user) => user.socketId === socketId)?.roomId;
  return roomId || null;
}

function getUserBySocketId(socketId: SocketId): User | null {
  return userSocketMap.find((user) => user.socketId === socketId) || null;
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on(SocketEvent.JOIN_REQUEST, ({ roomId, username }) => {
    console.log(`Debug: User join request for room ${roomId} with username ${username}`);
    
    const isUsernameExist = getUsersInRoom(roomId).some((u) => u.username === username);
    if (isUsernameExist) {
      console.log(`Debug: Username ${username} already exists in room ${roomId}`);
      io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS);
      return;
    }

    const user: User = {
      username,
      roomId,
      status: USER_CONNECTION_STATUS.ONLINE,
      cursorPosition: 0,
      typing: false,
      socketId: socket.id,
      currentFile: null,
      currentDir: (currentDir: any, targetDir: any) => {
        return `Changed directory from ${currentDir} to ${targetDir}`;
      },
    };

    console.log("Debug: User data to be added:", user);
    userSocketMap.push(user);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user });
    const users = getUsersInRoom(roomId);
    io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users });
    socket.emit(SocketEvent.ROOM_JOINED);

    console.log("Debug: Saving user to DB...");
    try {
      console.log("Debug: User data saved successfully!");
    } catch (error) {
      console.error("\u2717 Error saving user data to DB:", error);
    }
  });

  socket.on("disconnecting", () => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    socket.broadcast.to(user.roomId).emit(SocketEvent.USER_DISCONNECTED, { user });
    userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
    socket.leave(user.roomId);

    console.log(`Debug: User ${user.username} disconnected from room ${user.roomId}`);

    try {
      console.log("Debug: User data removed from DB successfully!");
    } catch (error) {
      console.error("\u2717 Error removing user data from DB:", error);
    }
  });

  socket.on(SocketEvent.SYNC_FILE_STRUCTURE, ({ fileStructure, openFiles, activeFile, socketId }) => {
    console.log("Debug: Syncing file structure to socket ID", socketId);
    io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, { fileStructure, openFiles, activeFile });
  });

  socket.on(SocketEvent.CHATBOT_MESSAGE, async (message) => {
    console.log("Debug: Received message for chatbot:", message);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are a helpful assistant that generates code based on user requests. Always wrap your code in triple backticks. User request: ${message}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedContent = response.text();
      socket.emit(SocketEvent.CHATBOT_RESPONSE, generatedContent);
    } catch (error) {
      console.error("\u2717 Error processing chatbot message:", error);
      socket.emit(SocketEvent.CHATBOT_ERROR, "An error occurred while processing your request.");
    }
  });

  socket.on("message", (message) => {
    const isTerminalCommand = message.startsWith("terminal:");
    if (isTerminalCommand) {
      const command = message.slice(9).trim();
      const allowedCommands = ["ls", "pwd", "cat", "echo", "clear"];
      const commandName = command.split(" ")[0];
      console.log(`Debug: Terminal command received: ${commandName}`);
      if (!allowedCommands.includes(commandName)) {
        socket.emit("terminalOutput", `Error: Command "${commandName}" is not allowed.`);
        return;
      }
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("\u2717 Error executing terminal command:", error);
          socket.emit("terminalOutput", `Error executing command: ${stderr}`);
          return;
        }
        console.log("Debug: Terminal command output:", stdout);
        socket.emit("terminalOutput", stdout);
      });
    } else {
      socket.emit(SocketEvent.CHATBOT_MESSAGE, message);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\u2713 Server running on http://localhost:${PORT}`);
});
