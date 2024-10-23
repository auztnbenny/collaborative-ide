Collaborative Online IDE with AI Assistance and QR Code-Based App Testing
Table of Contents
Overview
Features
Technologies Used
Installation
Usage
Use Case Diagram
Contributing
License
Acknowledgments
Overview
This project introduces a Collaborative Online IDE that simplifies the development of React Native applications through AI-powered code assistance and QR code-based app testing. It enables developers to work together in real-time, with a seamless environment for coding, debugging, and testing mobile applications.

The platform offers two roles—Leader/Admin and Developer—where the Leader can manage the project and assign roles, and developers collaborate based on their permissions.

Features
Real-Time Collaboration: Multiple developers can edit code simultaneously.
AI Code Assistance: Intelligent suggestions and error detection to improve code quality.
QR Code-Based Testing: Quickly test applications on mobile devices by scanning a QR code.
Role-Based Access Control: Admin assigns permissions (Editor/Viewer) to developers.
User-Friendly Interface: Modern, responsive design for an optimal development experience.
Technologies Used
Frontend: React.js
Backend: Node.js, Socket.io
AI Assistance: Integration with AI libraries
Mobile App Testing: QR code generation and scanning
Database: MongoDB (for storing project details and roles)
Installation
Clone the Repository

bash
Copy code
git clone https://github.com/your-username/your-repo.git
cd your-repo
Install Dependencies

Backend:
bash
Copy code
cd backend
npm install
Frontend:
bash
Copy code
cd frontend
npm install
Run the Server

Start backend server:
bash
Copy code
npm run dev
Start frontend server:
bash
Copy code
npm start dev
Access the IDE
