// import { exec } from 'child_process';
// import { Server } from 'socket.io';  // Assuming socket.io is being initialized elsewhere

// // Your WebSocket server should be initialized somewhere else in the code
// // like in the main server file where io.on('connection') is defined.

// const io = new Server(); // Assuming you have io initialized here

// // Socket event handler for terminal commands
// io.on("connection", (socket) => {
//     console.log("New terminal connection:", socket.id);

//     // Handle terminal commands
//     socket.on("terminalCommand", (command) => {
//         const allowedCommands = ["git status", "git add", "git commit", "git push", "git pull"];

//         if (!allowedCommands.includes(command)) {
//             socket.emit("terminalOutput", `Error: Command "${command}" is not allowed.`);
//             return;
//         }

//         // Execute the command
//         exec(command, (error, stdout, stderr) => {
//             const output = error ? `Error: ${error.message}` : (stderr ? stderr : stdout);
//             socket.emit("terminalOutput", output);  // Send output to client
//         });
//     });
// });
